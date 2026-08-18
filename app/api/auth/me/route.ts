import { NextRequest, NextResponse } from "next/server";
import { getAccessTokenFromRequest, getAuthenticatedUser } from "@/lib/supabase/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error } = await getSupabaseServerClient(getAccessTokenFromRequest(request))
      .from("profiles")
      .select("display_name, score, role")
      .eq("id", user.id)
      .single();
    if (error) throw error;

    return NextResponse.json({
      id: user.id,
      email: user.email,
      username: profile.display_name,
      score: profile.score,
      role: profile.role,
    });
  } catch (error) {
    console.error("Me API error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้" }, { status: 500 });
  }
}
