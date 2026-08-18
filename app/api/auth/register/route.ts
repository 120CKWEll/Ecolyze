import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { email, username, password } = await req.json();

    if (!email || !username || !password) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร" }, { status: 400 });
    }

    const { data, error } = await getSupabaseServerClient().auth.signUp({
      email,
      password,
      options: { data: { display_name: username } },
    });

    if (error) {
      if (error.message.toLowerCase().includes("already registered")) {
        return NextResponse.json({ error: "อีเมลนี้ถูกใช้งานแล้ว" }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data.user) {
      return NextResponse.json({ error: "สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่" }, { status: 500 });
    }

    // ถ้า Supabase ตั้งค่า Confirm email ไว้ ผู้ใช้ต้องยืนยันอีเมลก่อนล็อกอิน
    // (ถ้าปิด Confirm email แล้ว email_confirmed_at จะมีค่าทันที -> ล็อกอินได้เลย)
    const needsEmailConfirmation = !data.user.email_confirmed_at;
    return NextResponse.json(
      {
        message: needsEmailConfirmation
          ? "สมัครสมาชิกสำเร็จ! แต่ระบบยังต้องยืนยันอีเมล — เช็คกล่องจดหมาย หรือปิด Confirm email ใน Supabase Dashboard เพื่อล็อกอินได้ทันที"
          : "สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ",
        needsEmailConfirmation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการสมัครสมาชิก" }, { status: 500 });
  }
}
