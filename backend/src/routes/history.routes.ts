import { Router, Response } from "express";
import { authMiddleware, AuthenticatedRequest } from "../middlewares/auth.js";
import { StorageService } from "../services/storageService.js";

const router = Router();

// GET /api/history
router.get("/", authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const history = await StorageService.getScanHistory(user.id, req.token);

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
  } catch (error) {
    console.error("History route error:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการโหลดประวัติการสแกน" });
  }
});

export default router;
