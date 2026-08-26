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

const VISION_PROMPT = `You are an expert in waste management operating under Thailand's Pollution Control Department (กรมควบคุมมลพิษ) standards and Khon Kaen University (KKU) Green Campus guidelines.
Analyze the waste item in the image and categorize it strictly into exactly one of these four Thai bins: "รีไซเคิล", "เปียก", "ทั่วไป", or "อันตราย".
Rules:
- If a food container is dirty/greasy and cannot be easily rinsed or cleaned, classify it as "ทั่วไป".
- Tissue paper and food-contaminated packaging are "ทั่วไป".
- Clean PET plastic bottles, glass bottles, cans, paper cartons are "รีไซเคิล".
- Food scraps, fruit peels, leftover organic food are "เปียก".
- Battery, light bulbs, spray cans, electronics (E-Waste) are "อันตราย".
Return JSON only with these fields:
- objectName: name of the item in Thai (e.g. "ขวดพลาสติก PET ใส")
- wasteType: one of the four Thai values above, exactly ("ทั่วไป", "รีไซเคิล", "เปียก", "อันตราย")
- confidence: integer 0-100 (how sure you are)
- advice: array of Thai preparation steps (2-5 items, each a short practical sentence)`;

const CHAT_SYSTEM_INSTRUCTION = `คุณคือ "Ecolyze Assistant" ผู้ช่วยอัจฉริยะด้านการคัดแยกขยะและการจัดการสิ่งแวดล้อม ประจำมหาวิทยาลัยขอนแก่น (KKU Green University)
หน้าที่ของคุณ:
1. ตอบคำถามเกี่ยวกับการคัดแยกขยะ 4 ประเภทตามมาตรฐานไทย:
   - ถังสีน้ำเงิน (ขยะทั่วไป) เช่น ซองขนม ทิชชู่ โฟมเปื้อน
   - ถังสีเหลือง (ขยะรีไซเคิล) เช่น ขวด PET กระป๋อง แก้ว กระดาษ
   - ถังสีเขียว (ขยะเปียก/อินทรีย์) เช่น เศษอาหาร เปลือกผลไม้
   - ถังสีส้ม/แดง (ขยะอันตราย) เช่น ถ่านไฟฉาย หลอดไฟ ขยะอิเล็กทรอนิกส์
2. ให้คำแนะนำวิธีทำความสะอาดหรือเตรียมขยะก่อนทิ้ง
3. ให้คำตอบที่กระชับ สุภาพ เป็นมิตร มีอิโมจิประกอบ และเข้าใจง่ายสำหรับนักศึกษาและประชาชน`;

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
  objectName: string;
  wasteType: WasteType;
  confidence: number;
  advice: string[];
  pointsEarned: number;
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
