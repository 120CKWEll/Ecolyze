import { Router, Response } from "express";
import multer from "multer";
import { authMiddleware, AuthenticatedRequest } from "../middlewares/auth.js";
import { AIService } from "../services/aiService.js";
import { StorageService } from "../services/storageService.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// POST /api/analyze
router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "กรุณาอัปโหลดรูปภาพขยะที่ต้องการวิเคราะห์" });
        return;
      }

      if (!req.file.mimetype.startsWith("image/")) {
        res.status(400).json({ error: "รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, WEBP)" });
        return;
      }

      const user = req.user!;
      const aiResult = await AIService.analyzeWasteImage(
        req.file.buffer,
        req.file.mimetype
      );

      // Record to database
      const historyId = await StorageService.recordScan(
        user.id,
        aiResult.objectName,
        aiResult.wasteType,
        aiResult.confidence,
        aiResult.pointsEarned,
        req.token
      );

      res.status(200).json({
        ...aiResult,
        historyId,
        message: "วิเคราะห์และบันทึกประวัติการแยกขยะสำเร็จแล้วครับ!",
      });
    } catch (error: unknown) {
      console.error("Analyze Route Error:", error);
      const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการวิเคราะห์รูปภาพ";
      res.status(500).json({ error: msg });
    }
  }
);

export default router;
