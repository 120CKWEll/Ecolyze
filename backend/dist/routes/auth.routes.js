"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_js_1 = require("../config/supabase.js");
const auth_js_1 = require("../middlewares/auth.js");
const router = (0, express_1.Router)();
// POST /api/auth/register
router.post("/register", async (req, res) => {
    try {
        const { email, password, username } = req.body;
        if (!email || !password || !username) {
            res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน (อีเมล, รหัสผ่าน, ชื่อผู้ใช้)" });
            return;
        }
        if (password.length < 6) {
            res.status(400).json({ error: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร" });
            return;
        }
        const supabase = (0, supabase_js_1.getSupabaseClient)();
        if (!supabase) {
            res.status(200).json({
                message: "สมัครสมาชิกสำเร็จ (โหมดจำลอง) กรุณาเข้าสู่ระบบ",
                user: { email, username },
                needsEmailConfirmation: false,
            });
            return;
        }
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: username.trim(),
                },
            },
        });
        if (error) {
            if (error.message.toLowerCase().includes("already registered") || error.message.toLowerCase().includes("unique")) {
                res.status(409).json({ error: "อีเมลนี้ถูกใช้งานแล้ว กรุณาเข้าสู่ระบบหรือใช้อีเมลอื่น" });
                return;
            }
            res.status(400).json({ error: `สมัครสมาชิกไม่สำเร็จ: ${error.message}` });
            return;
        }
        const needsEmailConfirmation = !data.session && !!data.user;
        res.status(201).json({
            message: needsEmailConfirmation
                ? "สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันตัวตนก่อนเข้าสู่ระบบ"
                : "สมัครสมาชิกสำเร็จ! สามารถเข้าสู่ระบบได้ทันที",
            needsEmailConfirmation,
            user: {
                id: data.user?.id,
                email: data.user?.email,
                username,
            },
        });
    }
    catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการสมัครสมาชิก" });
    }
});
// POST /api/auth/login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: "กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน" });
            return;
        }
        const supabase = (0, supabase_js_1.getSupabaseClient)();
        if (!supabase) {
            // Mock login for offline dev
            res.status(200).json({
                access_token: "mock-jwt-token-" + Date.now(),
                user: {
                    id: "mock-user-1",
                    email,
                    username: email.split("@")[0],
                    score: 150,
                    role: "user",
                },
            });
            return;
        }
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error || !data.session) {
            if (error?.message?.toLowerCase().includes("email not confirmed")) {
                res.status(403).json({
                    error: "ยังไม่ได้ยืนยันอีเมล — เช็คกล่องจดหมาย หรือปิด Confirm email ใน Supabase Dashboard",
                });
                return;
            }
            res.status(401).json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
            return;
        }
        const user = data.user;
        const { data: profile } = await supabase
            .from("profiles")
            .select("display_name, score, role")
            .eq("id", user.id)
            .single();
        res.status(200).json({
            access_token: data.session.access_token,
            user: {
                id: user.id,
                email: user.email,
                username: profile?.display_name ??
                    user.user_metadata?.display_name ??
                    user.email?.split("@")[0] ??
                    "ผู้ใช้งาน",
                score: profile?.score ?? 0,
                role: profile?.role ?? "user",
            },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" });
    }
});
// GET /api/auth/me
router.get("/me", auth_js_1.authMiddleware, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "ไม่พบข้อมูลผู้ใช้งาน" });
            return;
        }
        res.status(200).json(req.user);
    }
    catch (error) {
        console.error("Get me error:", error);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการโหลดโปรไฟล์" });
    }
});
exports.default = router;
