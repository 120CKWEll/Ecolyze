import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// สร้าง client ฝั่งเซิร์ฟเวอร์ด้วย anon key
// ถ้าส่ง accessToken ของผู้ใช้มา จะแนบไปใน Authorization header ทุกคำขอ
// ทำให้ PostgREST เห็น JWT ของผู้ใช้ -> RLS และ auth.uid() ทำงานถูกต้อง
export function getSupabaseServerClient(accessToken?: string | null): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // รองรับทั้งชื่อเก่า (ANON_KEY) และชื่อใหม่ของ Supabase (PUBLISHABLE_KEY)
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase ยังไม่ได้ตั้งค่า กรุณาเพิ่ม NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined,
  });
}

// สร้าง client ฝั่งเซิร์ฟเวอร์ด้วย service_role key สำหรับการทำงานของ Admin
// ปลอดภัย 100% เพราะมี "server-only" ป้องกันไม่ให้ bundle ไปฝั่ง client
export function getSupabaseAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("Supabase URL ไม่ได้ตั้งค่า");
  }

  const key = serviceRoleKey ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!key) {
    throw new Error("Supabase Key ไม่ได้ตั้งค่า");
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
