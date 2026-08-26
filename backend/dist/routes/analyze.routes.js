"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_js_1 = require("../middlewares/auth.js");
const aiService_js_1 = require("../services/aiService.js");
const storageService_js_1 = require("../services/storageService.js");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});
// POST /api/analyze
router.post("/", auth_js_1.authMiddleware, upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: "กรุณาอัปโหลดรูปภาพขยะที่ต้องการวิเคราะห์" });
            return;
        }
        if (!req.file.mimetype.startsWith("image/")) {
            res.status(400).json({ error: "รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, WEBP)" });
            return;
        }
        const user = req.user;
        const aiResult = await aiService_js_1.AIService.analyzeWasteImage(req.file.buffer, req.file.mimetype);
        // Record to database
        const historyId = await storageService_js_1.StorageService.recordScan(user.id, aiResult.objectName, aiResult.wasteType, aiResult.confidence, aiResult.pointsEarned, req.token);
        res.status(200).json({
            ...aiResult,
            historyId,
            message: "วิเคราะห์และบันทึกประวัติการแยกขยะสำเร็จแล้วครับ!",
        });
    }
    catch (error) {
        console.error("Analyze Route Error:", error);
        const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการวิเคราะห์รูปภาพ";
        res.status(500).json({ error: msg });
    }
});
exports.default = router;
