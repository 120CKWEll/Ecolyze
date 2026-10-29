import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { getAccessTokenFromRequest, getAuthenticatedUser } from "@/lib/supabase/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const allowedWasteTypes = ["ทั่วไป", "รีไซเคิล", "เปียก", "อันตราย"] as const;
type WasteType = (typeof allowedWasteTypes)[number];

const pointsByType: Record<WasteType, number> = {
  "ทั่วไป": 2,
  "เปียก": 2,
  "รีไซเคิล": 5,
  "อันตราย": 10,
};

// แผนที่คำตอบที่ AI อาจส่งมา (ไทย/อังกฤษ/คำเต็ม) -> ประเภทขยะมาตรฐานของระบบ
const wasteTypeAliases: Record<string, WasteType> = {
  "ทั่วไป": "ทั่วไป", "general": "ทั่วไป", "general waste": "ทั่วไป", "ขยะทั่วไป": "ทั่วไป",
  "trash": "ทั่วไป", "other": "ทั่วไป", "อื่นๆ": "ทั่วไป", "อื่น": "ทั่วไป", "mixed": "ทั่วไป",
  "รีไซเคิล": "รีไซเคิล", "recycle": "รีไซเคิล", "recyclable": "รีไซเคิล", "recycling": "รีไซเคิล",
  "ขยะรีไซเคิล": "รีไซเคิล",
  "เปียก": "เปียก", "wet": "เปียก", "organic": "เปียก", "food waste": "เปียก",
  "ขยะเปียก": "เปียก", "ขยะอินทรีย์": "เปียก",
  "อันตราย": "อันตราย", "hazardous": "อันตราย", "dangerous": "อันตราย", "toxic": "อันตราย",
  "ขยะอันตราย": "อันตราย",
};

const PROMPT = `You are an expert waste verification and categorization AI for Thailand's Pollution Control Department (กรมควบคุมมลพิษ) and Khon Kaen University (KKU) Green Campus.

🎯 Step 1: Waste Detection (การตรวจหาขยะในภาพ):
Check if there is ANY waste item, recyclable container, bottle, can, food scrap, packaging, box, cup, tissue, battery, or disposable item in the image.
- 💡 สำคัญมาก (ถ่ายติดมือ/ติดหน้า/ถือขยะ): ผู้ใช้งานมักจะใช้มือจับขวดน้ำ กล่องข้าว ถุงขนม หรือถือขยะขึ้นมาถ่ายรูป ซึ่งอาจจะถ่ายติดมือ นิ้วมือ เสื้อผ้า ใบหน้า หรือพื้นหลังห้อง "ถือเป็นเรื่องปกติและถูกต้อง" -> ให้โฟกัสที่ชิ้นขยะที่ถืออยู่ และตั้งค่า "isWaste": true เสมอ
- จะตั้งค่า "isWaste": false เฉพาะกรณีที่ "ไม่มีขยะหรือบรรจุภัณฑ์ใดๆ ในภาพเลย" เท่านั้น (เช่น ถ่ายหน้าคน/เซลฟี่เพียวๆ โดยไม่มีขยะ, ถ่ายสัตว์เลี้ยง, ถ่ายวิวทิวทัศน์, ถ่ายเฟอร์นิเจอร์ห้องโดยไม่มีขยะ)

🎯 Step 2: Categorization (เมื่อพบชิ้นขยะในภาพ):
Categorize the waste item into exactly one of these four Thai bins: "รีไซเคิล", "เปียก", "ทั่วไป", or "อันตราย".
- ขยะทั่วไป (ถังน้ำเงิน): กล่องโฟม, ซองขนมกรุบกรอบ/ฟอยล์, ทิชชู่ใช้แล้ว, ภาชนะเปื้อนแกง/น้ำมันที่ล้างไม่ออก
- ขยะรีไซเคิล (ถังเหลือง): ขวดพลาสติก PET ใส (เช่น ขวดน้ำดื่ม), ขวดแก้ว, กระป๋องอะลูมิเนียม, ลังกระดาษ
- ขยะเปียก/อินทรีย์ (ถังเขียว): เศษอาหาร, ข้าวแกง, เปลือกผลไม้, เศษผัก
- ขยะอันตราย (ถังแดง): ถ่านไฟฉาย, หลอดไฟ, กระป๋องสเปรย์, ขยะอิเล็กทรอนิกส์ (E-Waste)

Return JSON ONLY with these fields:
{
  "isWaste": boolean,
  "rejectionReason": string (Thai explanation if isWaste is false, e.g. "ไม่พบขยะหรือบรรจุภัณฑ์ในภาพ กรุณาถ่ายภาพขยะที่ต้องการคัดแยก", otherwise empty string),
  "objectName": string (Thai name of the waste item, e.g. "ขวดพลาสติก PET ใส"),
  "wasteType": "รีไซเคิล" | "เปียก" | "ทั่วไป" | "อันตราย",
  "confidence": integer 0-100,
  "advice": array of 2-4 Thai practical preparation strings (e.g. ["เทน้ำออกให้หมด", "บีบขวดให้แบนก่อนทิ้ง"])
}`;

function normalizeWasteType(value: unknown): WasteType | null {
  if (typeof value !== "string") return null;
  const key = value.trim().toLowerCase();
  return wasteTypeAliases[key] ?? null;
}

// โมเดลอาจเผลอห่อ JSON ด้วย ```json ... ``` ให้ตัดออกก่อน parse
function parseAIJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = (fenced ? fenced[1] : text).trim();
  return JSON.parse(raw);
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "คุณยังไม่ได้เข้าสู่ระบบ กรุณาล็อกอินก่อนครับ" }, { status: 401 });
    }

    const file = (await request.formData()).get("image");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "กรุณาอัปโหลดรูปภาพ" }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "รองรับเฉพาะไฟล์รูปภาพ" }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "รูปภาพต้องมีขนาดไม่เกิน 10 MB" }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ error: "ไฟล์รูปภาพว่างเปล่า กรุณาลองใหม่" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ยังไม่ได้ตั้งค่า GEMINI_API_KEY — เพิ่มลงในไฟล์ .env.local (ดูตัวอย่างใน .env.example) เพื่อเปิดใช้งานการวิเคราะห์" },
        { status: 500 }
      );
    }

    const imageData = Buffer.from(await file.arrayBuffer()).toString("base64");

    // ลองโมเดลหลักก่อน ถ้าล้มเหลว (quota/network) ให้ลองโมเดลสำรอง
    const models = ["gemini-2.5-flash-lite", "gemini-2.5-flash"];
    let rawText: string | null = null;
    let lastError: unknown = null;

    for (const modelName of models) {
      try {
        const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
          model: modelName,
          generationConfig: { responseMimeType: "application/json" },
        });
        const result = await model.generateContent([
          PROMPT,
          { inlineData: { data: imageData, mimeType: file.type } },
        ]);
        rawText = result.response.text();
        break;
      } catch (err) {
        console.error(`Gemini model ${modelName} failed:`, err);
        lastError = err;
      }
    }

    if (!rawText) {
      console.error("All Gemini models failed:", lastError);
      return NextResponse.json(
        { error: "AI ไม่สามารถวิเคราะห์รูปภาพได้ในตอนนี้ (ตรวจสอบว่า GEMINI_API_KEY ถูกต้องและมีเครดิต) กรุณาลองใหม่อีกครั้ง" },
        { status: 502 }
      );
    }

    let parsed: unknown;
    try {
      parsed = parseAIJson(rawText);
    } catch {
      console.error("Invalid AI JSON response:", rawText);
      return NextResponse.json({ error: "AI ส่งผลลัพธ์มาในรูปแบบที่ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง" }, { status: 422 });
    }

    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return NextResponse.json({ error: "AI ส่งผลลัพธ์มาในรูปแบบที่ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง" }, { status: 422 });
    }

    const raw = parsed as Record<string, unknown>;

    // 🛑 ตรวจสอบว่าเป็นขยะจริงหรือไม่ (Waste Verification Guardrail)
    const isWaste = raw.isWaste !== false;
    const rejectionReason =
      typeof raw.rejectionReason === "string" && raw.rejectionReason.trim()
        ? raw.rejectionReason.trim()
        : "ภาพนี้ไม่ใช่ขยะหรือสิ่งของที่ต้องนำไปทิ้ง";

    if (!isWaste) {
      return NextResponse.json(
        {
          error: `❌ ภาพนี้ไม่ใช่ขยะ: ${rejectionReason} (กรุณาถ่ายภาพขยะหรือสิ่งของที่ต้องการคัดแยกทิ้ง เช่น ขวดน้ำ กล่องข้าว แก้ว เศษอาหาร หรือถุงขนม)`,
          isWaste: false,
        },
        { status: 422 }
      );
    }

    // ทำความสะอาดค่าที่ได้จาก AI ให้มีรูปแบบที่ระบบรองรับเสมอ
    const wasteType = normalizeWasteType(raw.wasteType);
    const objectName =
      typeof raw.objectName === "string" && raw.objectName.trim() ? raw.objectName.trim().slice(0, 200) : "ขยะไม่ทราบชนิด";

    let confidence = Number(raw.confidence);
    if (!Number.isFinite(confidence)) confidence = 0;
    if (confidence > 0 && confidence <= 1) confidence *= 100; // กรณี AI ตอบเป็น 0.95
    confidence = Math.round(Math.min(100, Math.max(0, confidence)));

    const advice = Array.isArray(raw.advice)
      ? raw.advice.filter((item): item is string => typeof item === "string" && item.trim().length > 0).slice(0, 8)
      : [];

    if (!wasteType) {
      return NextResponse.json(
        { error: "AI ไม่สามารถระบุประเภทขยะได้ — กรุณาถ่ายรูปใหม่ให้ชัดเจนขึ้นและแสงเพียงพอ" },
        { status: 422 }
      );
    }

    const pointsEarned = pointsByType[wasteType];
    // ใช้ anon key + JWT ของผู้ใช้ -> record_scan หา user_id จาก auth.uid() และคิดคะแนนเองจาก waste_type
    const { data: historyId, error } = await getSupabaseServerClient(getAccessTokenFromRequest(request)).rpc("record_scan", {
      p_object_name: objectName,
      p_waste_type: wasteType,
      p_confidence: confidence,
    });

    if (error) {
      console.error("record_scan error:", error);
      // ฟังก์ชัน record_scan ยังไม่มีในฐานข้อมูล หรือ PostgREST cache ค้างอยู่
      // -> ให้เปิด supabase/schema.sql ใน Supabase Dashboard → SQL Editor แล้วกด Run อีกครั้ง
      const missingFunction = typeof error.message === "string" && error.message.includes("schema cache");
      const hint = missingFunction
        ? " ฟังก์ชัน record_scan ยังไม่มีในฐานข้อมูล — ให้เปิดไฟล์ supabase/schema.sql ใน Supabase Dashboard → SQL Editor แล้วกด Run อีกครั้ง (ถ้ารันแล้วยังไม่หาย ให้รันคำสั่ง `NOTIFY pgrst, 'reload schema';` เพิ่ม)"
        : "";
      return NextResponse.json(
        { error: `บันทึกผลการวิเคราะห์ไม่สำเร็จ: ${error.message}${hint}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      objectName,
      wasteType,
      confidence,
      advice,
      pointsEarned,
      historyId,
      message: "วิเคราะห์และบันทึกประวัติสำเร็จแล้วครับ!",
    });
  } catch (error: unknown) {
    console.error("Analyze API error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการวิเคราะห์" }, { status: 500 });
  }
}
