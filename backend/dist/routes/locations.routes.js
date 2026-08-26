"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const storageService_js_1 = require("../services/storageService.js");
const auth_js_1 = require("../middlewares/auth.js");
const router = (0, express_1.Router)();
// GET /api/locations
router.get("/", async (_req, res) => {
    try {
        const locations = await storageService_js_1.StorageService.getLocations();
        res.status(200).json(locations);
    }
    catch (error) {
        console.error("Get locations error:", error);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการโหลดจุดทิ้งขยะ" });
    }
});
// POST /api/locations (Add new waste point)
router.post("/", auth_js_1.authMiddleware, async (req, res) => {
    try {
        const { name, lat, lng, type, description } = req.body;
        if (!name || typeof lat !== "number" || typeof lng !== "number" || !Array.isArray(type)) {
            res.status(400).json({ error: "ข้อมูลพิกัดหรือชื่อจุดทิ้งไม่ถูกต้อง" });
            return;
        }
        const created = await storageService_js_1.StorageService.addLocation({
            name,
            lat,
            lng,
            type,
            description: description || "",
            status: "Active",
        });
        res.status(201).json({ message: "เพิ่มจุดทิ้งขยะสำเร็จ", location: created });
    }
    catch (error) {
        console.error("Add location error:", error);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการเพิ่มจุดทิ้งขยะ" });
    }
});
// PUT /api/locations/:id
router.put("/:id", auth_js_1.authMiddleware, async (req, res) => {
    try {
        const id = Number(req.params.id);
        const updated = await storageService_js_1.StorageService.updateLocation(id, req.body);
        if (!updated) {
            res.status(404).json({ error: "ไม่พบจุดทิ้งขยะที่ระบุ" });
            return;
        }
        res.status(200).json({ message: "อัปเดตข้อมูลสำเร็จ", location: updated });
    }
    catch (error) {
        console.error("Update location error:", error);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการแก้ไขข้อมูล" });
    }
});
// DELETE /api/locations/:id
router.delete("/:id", auth_js_1.authMiddleware, async (req, res) => {
    try {
        const id = Number(req.params.id);
        const success = await storageService_js_1.StorageService.deleteLocation(id);
        if (!success) {
            res.status(404).json({ error: "ไม่พบจุดทิ้งขยะที่ต้องการลบ" });
            return;
        }
        res.status(200).json({ message: "ลบจุดทิ้งขยะเรียบร้อยแล้ว" });
    }
    catch (error) {
        console.error("Delete location error:", error);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการลบจุดทิ้งขยะ" });
    }
});
exports.default = router;
