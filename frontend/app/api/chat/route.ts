import { GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai";
import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";

// บทบาทของผู้ช่วย: ตอบคำถามเกี่ยวกับการจัดการขยะตามมาตรฐานกรมควบคุมมลพิษ + ข้อปฏิบัติของ มข.
const SYSTEM_PROMPT = `You are "ผู้ช่วยแยกขยะ" (Waste Assistant) ของระบบ RecycleSmart มหาวิทยาลัยขอนแก่น (KKU Green University)
คุณเป็นผู้เชี่ยวชาญด้านการจัดการขยะ อ้างอิงมาตรฐานกรมควบคุมมลพิษของประเทศไทย และข้อปฏิบัติการคัดแยกขยะของมหาวิทยาลัยขอนแก่น

ระบบมีถังขยะ 4 ประเภท:
1. ขยะรีไซเคิล (ถังสีเหลือง): ขวดพลาสติก PET ที่ล้างสะอาด, กระดาษ, ลัง, แก้ว, กระป๋องอะลูมิเนียม
2. ขยะเปียก/อินทรีย์ (ถังสีเขียว): เศษอาหาร, เปลือกผลไม้, เศษผัก, ใบไม้
3. ขยะทั่วไป (ถังสีน้ำเงิน): กล่องโฟม, ถุงพลาสติกเปื้อนอาหาร, ทิชชู่ใช้แล้ว, ผ้าอ้อม, แก้วกาแฟกระดาษ
4. ขยะอันตราย (ถังสีแดง): ถ่านไฟฉาย, หลอดไฟ, กระป๋องสเปรย์, อุปกรณ์อิเล็กทรอนิกส์, สารเคมี

กฎสำคัญสำหรับขยะเจ้าปัญหา:
- กล่องโฟมและทิชชู่ใช้แล้ว: ทิ้งถังทั่วไปเสมอ ไม่สามารถรีไซเคิลได้
- ภาชนะอาหารที่เปื้อน: ถ้าล้างสะอาดได้ให้ทิ้งถังรีไซเคิล ถ้าล้างไม่ออกให้ทิ้งถังทั่วไป
- ถ่านไฟฉาย, หลอดไฟ, กระป๋องสเปรย์, ขยะอิเล็กทรอนิกส์: ทิ้งถังอันตรายเสมอ
- ขวดพลาสติกต้องเทน้ำออกและบีบให้แบนก่อนทิ้งถังรีไซเคิล

กฎการตอบ:
- ตอบเป็นภาษาไทย สั้น กระชับ ตรงประเด็น ไม่เกิน ~150 คำ
- บอกเสมอว่าควรทิ้งถังสีอะไรและเพราะอะไร
- ถ้าไม่แน่ใจ ให้บอกว่าไม่แน่ใจและแนะนำให้ตรวจสอบกับหน่วยงานที่เกี่ยวข้อง
- ถ้าถามนอกเรื่องการจัดการขยะ ให้สุภาพพากลับเข้าสู่หัวข้อขยะ
- ใช้อีโมจิเล็กน้อยเพื่อความเป็นกันเอง`;

interface ChatMessage {
  role: "user" | "model";
  content: string;
}

const SSE_HEADERS = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
};

const encoder = new TextEncoder();

// แปลง stream ของ Gemini เป็น SSE (Server-Sent Events) ให้ฝั่ง client อ่านทีละ chunk ได้
function toSseStream(stream: AsyncIterable<{ text: () => string }>): ReadableStream<Uint8Array> {
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.text();
          if (text) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      } catch (err) {
        console.error("Gemini stream error:", err);
        // ส่งข้อความ error ผ่าน stream เพื่อให้ client แสดงผลได้โดยไม่ค้างหน้าจอ
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: "การเชื่อมต่อ AI ขาดหายกลางคัน กรุณาลองถามใหม่อีกครั้ง" })}\n\n`)
          );
        } catch {
          /* ignore */
        }
        controller.close();
      }
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return Response.json({ error: "คุณยังไม่ได้เข้าสู่ระบบ กรุณาล็อกอินก่อนครับ" }, { status: 401 });
    }

    const body = await request.json();
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const rawHistory: unknown = body.history;

    if (!message) {
      return Response.json({ error: "กรุณาพิมพ์ข้อความก่อนส่งครับ" }, { status: 400 });
    }
    if (message.length > 500) {
      return Response.json({ error: "ข้อความยาวเกินไป (สูงสุด 500 ตัวอักษร) กรุณาใส่ให้สั้นลง" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "ยังไม่ได้ตั้งค่า GEMINI_API_KEY — เพิ่มลงในไฟล์ .env.local (ดูตัวอย่างใน .env.example) เพื่อเปิดใช้งานแชทบอท" },
        { status: 500 }
      );
    }

    // รับเฉพาะประวัติที่ถูกต้อง (user/model) และจำกัดจำนวนรอบล่าสุด เพื่อประหยัด token
    const validHistory: ChatMessage[] = Array.isArray(rawHistory)
      ? rawHistory
          .filter(
            (m): m is ChatMessage =>
              typeof m === "object" &&
              m !== null &&
              (m.role === "user" || m.role === "model") &&
              typeof (m as ChatMessage).content === "string" &&
              (m as ChatMessage).content.trim().length > 0
          )
          .map((m) => ({ role: m.role, content: m.content.trim().slice(0, 500) }))
          .slice(-10)
      : [];

    // ลองโมเดลหลักก่อน ถ้าล้มเหลว (quota/network) ให้ลองโมเดลสำรอง
    const models = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];
    let response: Response | null = null;
    let lastError: unknown = null;

    for (const modelName of models) {
      try {
        const model: GenerativeModel = new GoogleGenerativeAI(apiKey).getGenerativeModel({
          model: modelName,
          systemInstruction: SYSTEM_PROMPT,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        });

        const chat = model.startChat({
          history: validHistory.map((m) => ({ role: m.role, parts: [{ text: m.content }] })),
        });

        const result = await chat.sendMessageStream(message);
        response = new Response(toSseStream(result.stream), { headers: SSE_HEADERS });
        break;
      } catch (err) {
        console.error(`Chat model ${modelName} failed:`, err);
        lastError = err;
      }
    }

    if (!response) {
      console.error("All chat models failed:", lastError);
      return Response.json(
        { error: "AI ไม่สามารถตอบได้ในตอนนี้ (ตรวจสอบว่า GEMINI_API_KEY ถูกต้องและมีเครดิต) กรุณาลองใหม่อีกครั้ง" },
        { status: 502 }
      );
    }

    return response;
  } catch (error: unknown) {
    console.error("Chat API error:", error);
    return Response.json({ error: "เกิดข้อผิดพลาดในการติดต่อผู้ช่วย กรุณาลองใหม่อีกครั้ง" }, { status: 500 });
  }
}
