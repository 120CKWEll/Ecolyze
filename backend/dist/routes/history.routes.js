"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_js_1 = require("../middlewares/auth.js");
const storageService_js_1 = require("../services/storageService.js");
const router = (0, express_1.Router)();
// GET /api/history
router.get("/", auth_js_1.authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        const history = await storageService_js_1.StorageService.getScanHistory(user.id, req.token);
        // Map to frontend expected shape
        const formatted = history.map((item) => ({
            _id: item.id,
            id: item.id,
            objectName: item.objectName,
            wasteType: item.wasteType,
            confidence: item.confidence,
            pointsEarned: item.pointsEarned,
            createdAt: item.createdAt,
        }));
        res.status(200).json(formatted);
    }
    catch (error) {
        console.error("History route error:", error);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการโหลดประวัติการสแกน" });
    }
});
exports.default = router;
