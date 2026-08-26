import { Request, Response, NextFunction } from "express";
import { getSupabaseClient } from "../config/supabase.js";

export interface AuthenticatedUser {
  id: string;
  email?: string;
  username: string;
  score: number;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  token?: string;
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "กรุณาเข้าสู่ระบบก่อนทำรายการ (Missing Bearer Token)" });
      return;
    }

    const token = authHeader.substring(7).trim();
    req.token = token;

    const supabase = getSupabaseClient(token);
    if (supabase) {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        res.status(401).json({ error: "Token ไม่ถูกต้องหรือหมดอายุแล้ว กรุณาเข้าสู่ระบบใหม่" });
        return;
      }

      // Fetch profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, score, role")
        .eq("id", user.id)
        .single();

      req.user = {
        id: user.id,
        email: user.email,
        username:
          profile?.display_name ??
          user.user_metadata?.display_name ??
          user.email?.split("@")[0] ??
          "ผู้ใช้งาน",
        score: profile?.score ?? 0,
        role: profile?.role ?? "user",
      };
      return next();
    }

    // If Supabase not configured, fallback mock user for development
    req.user = {
      id: "mock-user-1",
      email: "demo@ecolyze.kku.ac.th",
      username: "นักศึกษา มข.",
      score: 120,
      role: "user",
    };
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(401).json({ error: "การยืนยันตัวตนล้มเหลว" });
  }
}
