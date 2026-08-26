import { Router, Request, Response } from "express";
import { AIService } from "../services/aiService.js";

const router = Router();

// POST /api/chat
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      res.status(400).json({ error: "กรุณาส่งข้อความที่ต้องการสอบถาม" });
      return;
    }

    const reply = await AIService.chatWithAssistant(
      message.trim(),
      Array.isArray(history) ? history : []
    );

    res.status(200).json({ reply });
  } catch (error) {
    console.error("Chat route error:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการตอบกลับของ AI Assistant" });
  }
});

export default router;
