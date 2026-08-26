import { Router, Request, Response } from "express";
import { StorageService } from "../services/storageService.js";
import { authMiddleware, AuthenticatedRequest } from "../middlewares/auth.js";

const router = Router();

// GET /api/locations
router.get("/", async (_req: Request, res: Response): Promise<void> => {
  try {
    const locations = await StorageService.getLocations();
    res.status(200).json(locations);
  } catch (error) {
    console.error("Get locations error:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการโหลดจุดทิ้งขยะ" });
  }
});

// POST /api/locations (Add new waste point)
router.post("/", authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, lat, lng, type, description } = req.body;

    if (!name || typeof lat !== "number" || typeof lng !== "number" || !Array.isArray(type)) {
      res.status(400).json({ error: "ข้อมูลพิกัดหรือชื่อจุดทิ้งไม่ถูกต้อง" });
      return;
    }

    const created = await StorageService.addLocation({
      name,
      lat,
      lng,
      type,
      description: description || "",
      status: "Active",
    });

    res.status(201).json({ message: "เพิ่มจุดทิ้งขยะสำเร็จ", location: created });
  } catch (error) {
    console.error("Add location error:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการเพิ่มจุดทิ้งขยะ" });
  }
});

// PUT /api/locations/:id
router.put("/:id", authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const updated = await StorageService.updateLocation(id, req.body);
    if (!updated) {
      res.status(404).json({ error: "ไม่พบจุดทิ้งขยะที่ระบุ" });
      return;
    }
    res.status(200).json({ message: "อัปเดตข้อมูลสำเร็จ", location: updated });
  } catch (error) {
    console.error("Update location error:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการแก้ไขข้อมูล" });
  }
});

// DELETE /api/locations/:id
router.delete("/:id", authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const success = await StorageService.deleteLocation(id);
    if (!success) {
      res.status(404).json({ error: "ไม่พบจุดทิ้งขยะที่ต้องการลบ" });
      return;
    }
    res.status(200).json({ message: "ลบจุดทิ้งขยะเรียบร้อยแล้ว" });
  } catch (error) {
    console.error("Delete location error:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการลบจุดทิ้งขยะ" });
  }
});

export default router;
