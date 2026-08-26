import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

// GET /api/admin/users
export async function GET() {
  try {
    const client = getSupabaseServerClient();
    const { data, error } = await client
      .from("profiles")
      .select("id, display_name, score, role, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formatted = (data || []).map((u) => ({
      id: u.id,
      name: u.display_name || "ผู้ใช้งาน",
      email: u.id.slice(0, 8) + "@ecolyze.kku",
      role: u.role === "admin" ? "Admin" : "User",
      points: u.score || 0,
      status: "Active",
      createdAt: u.created_at,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json({ error: "โหลดรายชื่อผู้ใช้ล้มเหลว" }, { status: 500 });
  }
}

// PUT /api/admin/users
export async function PUT(req: NextRequest) {
  try {
    const { userId, role, score } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const client = getSupabaseServerClient();
    const updates: Record<string, unknown> = {};
    if (role) updates.role = role;
    if (typeof score === "number") updates.score = score;

    const { data, error } = await client
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "อัปเดตผู้ใช้สำเร็จ", user: data });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "อัปเดตข้อมูลล้มเหลว" }, { status: 500 });
  }
}
