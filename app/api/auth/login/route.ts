import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน" }, { status: 400 });
    }

    const client = getSupabaseServerClient();
    const { data, error } = await client.auth.signInWithPassword({ email, password });

    if (error || !data.session) {
      if (error?.message?.toLowerCase().includes("email not confirmed")) {
        return NextResponse.json(
          { error: "ยังไม่ได้ยืนยันอีเมล — เช็คกล่องจดหมาย หรือปิด Confirm email ใน Supabase Dashboard เพื่อให้ล็อกอินได้ทันที" },
          { status: 403 }
        );
      }
      return NextResponse.json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
    }

    const user = data.user;
    // client มี session ของผู้ใช้แล้ว -> PostgREST เห็น JWT -> RLS อนุญาตให้อ่าน profile ของตัวเอง
    const { data: profile } = await client
      .from("profiles")
      .select("display_name, score, role")
      .eq("id", user.id)
      .single();

    return NextResponse.json({
      access_token: data.session.access_token,
      user: {
        id: user.id,
        email: user.email,
        username: profile?.display_name ?? user.user_metadata?.display_name ?? user.email?.split("@")[0] ?? "ผู้ใช้งาน",
        score: profile?.score ?? 0,
        role: profile?.role ?? "user",
      },
    });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" }, { status: 500 });
  }
}
