"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const storageService_js_1 = require("../services/storageService.js");
const auth_js_1 = require("../middlewares/auth.js");
const router = (0, express_1.Router)();
// GET /api/rewards
router.get("/", async (_req, res) => {
    try {
        const rewards = await storageService_js_1.StorageService.getRewards();
        res.status(200).json(rewards);
    }
    catch (error) {
        console.error("Get rewards error:", error);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการโหลดรายการของรางวัล" });
    }
});
// POST /api/rewards/redeem
router.post("/redeem", auth_js_1.authMiddleware, async (req, res) => {
    try {
        const { rewardId } = req.body;
        if (!rewardId || typeof rewardId !== "number") {
            res.status(400).json({ error: "กรุณาระบุรหัสของรางวัล (rewardId)" });
            return;
        }
        const user = req.user;
        const result = await storageService_js_1.StorageService.redeemReward(user.id, rewardId, req.token);
        if (!result.success) {
            res.status(400).json({ error: result.message });
            return;
        }
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Redeem error:", error);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการแลกรางวัล" });
    }
});
exports.default = router;
