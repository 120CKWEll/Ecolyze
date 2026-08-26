"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const aiService_js_1 = require("../services/aiService.js");
const router = (0, express_1.Router)();
// POST /api/chat
router.post("/", async (req, res) => {
    try {
        const { message, history } = req.body;
        if (!message || typeof message !== "string" || !message.trim()) {
            res.status(400).json({ error: "กรุณาส่งข้อความที่ต้องการสอบถาม" });
            return;
        }
        const reply = await aiService_js_1.AIService.chatWithAssistant(message.trim(), Array.isArray(history) ? history : []);
        res.status(200).json({ reply });
    }
    catch (error) {
        console.error("Chat route error:", error);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการตอบกลับของ AI Assistant" });
    }
});
exports.default = router;
