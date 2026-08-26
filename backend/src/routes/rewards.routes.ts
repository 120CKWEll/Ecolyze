import { Router, Request, Response } from "express";
import { StorageService } from "../services/storageService.js";
import { authMiddleware, AuthenticatedRequest } from "../middlewares/auth.js";

const router = Router();

// GET /api/rewards
router.get("/", async (_req: Request, res: Response): Promise<void> => {
  try {
    const rewards = await StorageService.getRewards();
    res.status(200).json(rewards);
  } catch (error) {
    console.error("Get rewards error:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการโหลดรายการของรางวัล" });
  }
});

// POST /api/rewards/redeem
router.post("/redeem", authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { rewardId } = req.body;
    if (!rewardId || typeof rewardId !== "number") {
      res.status(400).json({ error: "กรุณาระบุรหัสของรางวัล (rewardId)" });
      return;
    }

    const user = req.user!;
    const result = await StorageService.redeemReward(user.id, rewardId, req.token);

    if (!result.success) {
      res.status(400).json({ error: result.message });
      return;
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Redeem error:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการแลกรางวัล" });
  }
});

export default router;
