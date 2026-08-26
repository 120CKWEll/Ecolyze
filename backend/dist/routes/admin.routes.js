"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const storageService_js_1 = require("../services/storageService.js");
const supabase_js_1 = require("../config/supabase.js");
const router = (0, express_1.Router)();
// GET /api/admin/stats
router.get("/stats", async (_req, res) => {
    try {
        const stats = await storageService_js_1.StorageService.getAdminStats();
        res.status(200).json(stats);
    }
    catch (error) {
        console.error("Admin stats error:", error);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการโหลดสถิติแดชบอร์ด" });
    }
});
// GET /api/admin/users
router.get("/users", async (_req, res) => {
    try {
        const supabase = (0, supabase_js_1.getSupabaseClient)();
        if (supabase) {
            const { data, error } = await supabase
                .from("profiles")
                .select("id, display_name, score, role, created_at");
            if (!error && Array.isArray(data)) {
                const mapped = data.map((u) => ({
                    id: u.id,
                    name: u.display_name || "ผู้ใช้งาน",
                    email: "-",
                    role: u.role === "admin" ? "Admin" : "User",
                    points: u.score || 0,
                    status: "Active",
                }));
                res.status(200).json(mapped);
                return;
            }
        }
        // Default mock list
        res.status(200).json([
            { id: "U001", name: "สมชาย ใจดี", email: "somchai@kkumail.com", role: "User", points: 450, status: "Active" },
            { id: "U002", name: "สมหญิง รักษ์โลก", email: "somying@kkumail.com", role: "User", points: 1200, status: "Active" },
            { id: "U003", name: "ผู้ดูแล ระบบ", email: "admin@recyclesmart.com", role: "Admin", points: 9999, status: "Active" },
            { id: "U004", name: "นักศึกษา ทดสอบ", email: "test@kkumail.com", role: "User", points: 0, status: "Suspended" },
        ]);
    }
    catch (error) {
        console.error("Admin users error:", error);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการโหลดรายชื่อผู้ใช้" });
    }
});
// GET /api/admin/reports
router.get("/reports", async (_req, res) => {
    try {
        const reports = await storageService_js_1.StorageService.getReports();
        res.status(200).json(reports);
    }
    catch (error) {
        console.error("Admin reports error:", error);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการโหลดรายการแจ้งปัญหา" });
    }
});
// POST /api/admin/reports
router.post("/reports", async (req, res) => {
    try {
        const { locationName, reportType, description } = req.body;
        if (!locationName || !reportType) {
            res.status(400).json({ error: "กรุณาระบุสถานที่และประเภทปัญหา" });
            return;
        }
        const report = await storageService_js_1.StorageService.addReport({
            locationName,
            reportType,
            description: description || "",
        });
        res.status(201).json({ message: "ส่งรายงานแจ้งปัญหาสำเร็จ", report });
    }
    catch (error) {
        console.error("Submit report error:", error);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการส่งรายงาน" });
    }
});
// GET /api/admin/guidelines
router.get("/guidelines", async (_req, res) => {
    try {
        const guidelines = await storageService_js_1.StorageService.getGuidelines();
        res.status(200).json(guidelines);
    }
    catch (error) {
        console.error("Admin guidelines error:", error);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการโหลดคู่มือ" });
    }
});
exports.default = router;
