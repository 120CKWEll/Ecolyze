import { Router, Request, Response } from "express";
import { StorageService } from "../services/storageService.js";
import { getSupabaseAdminClient } from "../config/supabase.js";

const router = Router();

// GET /api/admin/stats
router.get("/stats", async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await StorageService.getAdminStats();
    res.status(200).json(stats);
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการโหลดสถิติแดชบอร์ด" });
  }
});

// GET /api/admin/users
router.get("/users", async (_req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, display_name, score, role, created_at")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        const mapped = data.map((u) => ({
          id: u.id,
          name: u.display_name || "ผู้ใช้งาน",
          email: u.email || `${u.id.slice(0, 8)}@kku.ac.th`,
          role: u.role === "admin" ? "Admin" : u.role === "staff" ? "Staff" : "User",
          points: u.score || 0,
          status: "Active",
          createdAt: u.created_at,
        }));
        res.status(200).json(mapped);
        return;
      }
    }

    res.status(200).json([]);
  } catch (error) {
    console.error("Admin users error:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการโหลดรายชื่อผู้ใช้" });
  }
});

// GET /api/admin/reports
router.get("/reports", async (_req: Request, res: Response): Promise<void> => {
  try {
    const reports = await StorageService.getReports();
    res.status(200).json(reports);
  } catch (error) {
    console.error("Admin reports error:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการโหลดรายการแจ้งปัญหา" });
  }
});

// POST /api/admin/reports
router.post("/reports", async (req: Request, res: Response): Promise<void> => {
  try {
    const { locationName, reportType, description } = req.body;
    if (!locationName || !reportType) {
      res.status(400).json({ error: "กรุณาระบุสถานที่และประเภทปัญหา" });
      return;
    }
    const report = await StorageService.addReport({
      locationName,
      reportType,
      description: description || "",
    });
    res.status(201).json({ message: "ส่งรายงานแจ้งปัญหาสำเร็จ", report });
  } catch (error) {
    console.error("Submit report error:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการส่งรายงาน" });
  }
});

// GET /api/admin/guidelines
router.get("/guidelines", async (_req: Request, res: Response): Promise<void> => {
  try {
    const guidelines = await StorageService.getGuidelines();
    res.status(200).json(guidelines);
  } catch (error) {
    console.error("Admin guidelines error:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการโหลดคู่มือ" });
  }
});

export default router;
