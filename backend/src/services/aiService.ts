import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config/env.js";

export const allowedWasteTypes = ["ทั่วไป", "รีไซเคิล", "เปียก", "อันตราย"] as const;
export type WasteType = (typeof allowedWasteTypes)[number];

export const pointsByType: Record<WasteType, number> = {
  ทั่วไป: 2,
  เปียก: 2,
  รีไซเคิล: 5,
  อันตราย: 10,
};

const wasteTypeAliases: Record<string, WasteType> = {
  ทั่วไป: "ทั่วไป",
  general: "ทั่วไป",
  "general waste": "ทั่วไป",
  ขยะทั่วไป: "ทั่วไป",
  trash: "ทั่วไป",
  other: "ทั่วไป",
  อื่นๆ: "ทั่วไป",
  อื่น: "ทั่วไป",
  mixed: "ทั่วไป",
  รีไซเคิล: "รีไซเคิล",
  recycle: "รีไซเคิล",
  recyclable: "รีไซเคิล",
  recycling: "รีไซเคิล",
  ขยะรีไซเคิล: "รีไซเคิล",
  เปียก: "เปียก",
  wet: "เปียก",
  organic: "เปียก",
  "food waste": "เปียก",
  ขยะเปียก: "เปียก",
  ขยะอินทรีย์: "เปียก",
  อันตราย: "อันตราย",
  hazardous: "อันตราย",
  dangerous: "อันตราย",
  toxic: "อันตราย",
  ขยะอันตราย: "อันตราย",
};

const VISION_PROMPT = `You are an expert waste verification and categorization AI for Thailand's Pollution Control Department (กรมควบคุมมลพิษ) and Khon Kaen University (KKU) Green Campus.

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

const CHAT_SYSTEM_INSTRUCTION = `คุณคือ "Ecolyze Waste Assistant" ผู้ช่วยอัจฉริยะด้านการคัดแยกขยะและค้นหาจุดทิ้งขยะ ประจำมหาวิทยาลัยขอนแก่น (KKU Green University)

🎯 ขอบเขตหน้าที่ของคุณ (Strict Scope):
คุณได้รับอนุญาตให้ตอบเฉพาะ 2 เรื่องนี้เท่านั้น:
1. การคัดแยกประเภทขยะ วิธีทำความสะอาด/เตรียมขยะก่อนทิ้ง การรีไซเคิล และความรู้สิ่งแวดล้อมตามมาตรฐานกรมควบคุมมลพิษ
2. ข้อมูลตำแหน่งจุดทิ้งขยะ ประเภทถังขยะ และคำแนะนำระยะทาง/เส้นทางไปยังจุดทิ้งขยะภายในมหาวิทยาลัยขอนแก่น (KKU)

🚫 กฎเหล็กการคัดกรองคำถาม (Guardrails & Filtering):
- หากผู้ใช้ถามเรื่องอื่นที่ไม่เกี่ยวข้องกับการจัดการขยะหรือจุดทิ้งขยะ (เช่น การบ้าน, เขียนโค้ด, ข่าวการเมือง, เรื่องส่วนตัว, แนะนำภาพยนตร์, ซุบซิบ ฯลฯ) ให้ปฏิเสธอย่างสุภาพทันที โดยตอบว่า:
  "ขออภัยครับ ผมเป็นผู้ช่วยด้านการคัดแยกขยะและค้นหาจุดทิ้งขยะ มข. เท่านั้นครับ ♻️ คุณสามารถสอบถามวิธีทิ้งขยะชิ้นใดชิ้นหนึ่ง หรือจุดทิ้งขยะที่ใกล้ที่สุดได้เลยครับ!"
- ห้ามตอบคำถามนอกขอบเขตเด็ดขาด

📍 ฐานข้อมูลจุดทิ้งขยะ มข.:
1. ศูนย์อาหารคอมเพล็กซ์ (Complex): ถังรีไซเคิล, ขยะเปียก/เศษอาหาร, ขยะทั่วไป
2. คณะวิศวกรรมศาสตร์ (ตึก EN): ขยะอิเล็กทรอนิกส์ (E-Waste), รีไซเคิล
3. หอสมุดกลาง: ถ่านไฟฉาย, ขยะอิเล็กทรอนิกส์, กระดาษเก่า
4. คณะวิทยาศาสตร์ (SC06): ถังแยกประเภทใต้อาคาร (รีไซเคิล, ทั่วไป)
5. กองจัดการสาธารณูปโภคพลังงานและสิ่งแวดล้อม: ศูนย์จัดการขยะหลักของ มข. (รีไซเคิล, อันตราย, ทั่วไป)
6. ศูนย์อาหาร 3 (หนองแวง) & ศูนย์อาหาร 4 (อาคารจอดรถ 1): ขยะเปียกเศษอาหาร และขยะรีไซเคิล

ตอบเป็นภาษาไทย กระชับ สุภาพ มีอิโมจิประกอบ และบอกประเภทสีถังเสมอ`;

function normalizeWasteType(value: unknown): WasteType | null {
  if (typeof value !== "string") return null;
  const key = value.trim().toLowerCase();
  return wasteTypeAliases[key] ?? null;
}

function parseAIJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = (fenced ? fenced[1] : text).trim();
  return JSON.parse(raw);
}

export interface AnalyzeResult {
  isWaste: boolean;
  objectName: string;
  wasteType: WasteType;
  confidence: number;
  advice: string[];
  pointsEarned: number;
  rejectionReason?: string;
}

export class AIService {
  private static getAIClient(): GoogleGenerativeAI | null {
    if (!config.geminiApiKey) {
      return null;
    }
    return new GoogleGenerativeAI(config.geminiApiKey);
  }

  static async analyzeWasteImage(
    imageBuffer: Buffer,
    mimeType: string
  ): Promise<AnalyzeResult> {
    const ai = this.getAIClient();
    if (!ai) {
      throw new Error("GEMINI_API_KEY is not configured in backend .env");
    }

    const base64Data = imageBuffer.toString("base64");
    const models = ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-1.5-flash"];
    let rawText: string | null = null;
    let lastError: unknown = null;

    for (const modelName of models) {
      try {
        const model = ai.getGenerativeModel({
          model: modelName,
          generationConfig: { responseMimeType: "application/json" },
        });
        const result = await model.generateContent([
          VISION_PROMPT,
          { inlineData: { data: base64Data, mimeType } },
        ]);
        rawText = result.response.text();
        if (rawText) break;
      } catch (err) {
        console.warn(`[AI Service] Model ${modelName} attempt failed:`, err);
        lastError = err;
      }
    }

    if (!rawText) {
      throw new Error(
        `AI Analysis failed across all models. Details: ${String(lastError)}`
      );
    }

    const parsed = parseAIJson(rawText) as Record<string, unknown>;

    // 🛑 ตรวจสอบว่าเป็นขยะจริงหรือไม่ (Waste Verification Guardrail)
    const isWaste = parsed.isWaste !== false;
    const rejectionReason =
      typeof parsed.rejectionReason === "string" && parsed.rejectionReason.trim()
        ? parsed.rejectionReason.trim()
        : "ภาพนี้ไม่ใช่ขยะหรือสิ่งของที่ต้องนำไปทิ้ง";

    if (!isWaste) {
      throw new Error(
        `❌ ภาพนี้ไม่ใช่ขยะ: ${rejectionReason} (กรุณาถ่ายภาพขยะหรือสิ่งของที่ต้องการคัดแยกทิ้ง เช่น ขวดน้ำ แก้ว เศษอาหาร กล่องข้าว หรือถุงขนม)`
      );
    }

    const wasteType = normalizeWasteType(parsed.wasteType) || "ทั่วไป";
    const objectName =
      typeof parsed.objectName === "string" && parsed.objectName.trim()
        ? parsed.objectName.trim().slice(0, 200)
        : "ขยะที่ตรวจพบ";

    let confidence = Number(parsed.confidence);
    if (!Number.isFinite(confidence)) confidence = 85;
    if (confidence > 0 && confidence <= 1) confidence *= 100;
    confidence = Math.round(Math.min(100, Math.max(0, confidence)));

    const advice = Array.isArray(parsed.advice)
      ? parsed.advice
          .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
          .slice(0, 8)
      : [
          "แยกประเภทขยะให้ถูกต้องก่อนทิ้งลงถัง",
          "หากมีเศษอาหารติดอยู่ ควรเทหรือล้างน้ำออกก่อน",
        ];

    return {
      isWaste: true,
      objectName,
      wasteType,
      confidence,
      advice,
      pointsEarned: pointsByType[wasteType],
    };
  }

  static async chatWithAssistant(
    message: string,
    chatHistory: Array<{ role: "user" | "model"; text: string }> = []
  ): Promise<string> {
    const ai = this.getAIClient();
    if (!ai) {
      return "ขออภัยครับ ยังไม่ได้ตั้งค่า GEMINI_API_KEY ในระบบหลังบ้าน";
    }

    const model = ai.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: CHAT_SYSTEM_INSTRUCTION,
    });

    const formattedHistory = chatHistory.slice(-10).map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    const chat = model.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessage(message);
    return result.response.text();
  }
}
