import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET /api/admin/guidelines
export async function GET() {
  try {
    const client = getSupabaseAdminClient();
    const { data, error } = await client
      .from("waste_categories")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Admin guidelines error:", error);
    return NextResponse.json({ error: "โหลดข้อมูลหมวดหมู่ขยะล้มเหลว" }, { status: 500 });
  }
}

// PUT /api/admin/guidelines (Update category points / info)
export async function PUT(req: NextRequest) {
  try {
    const { id, points_reward, name_th, color_code } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const client = getSupabaseAdminClient();
    const updates: Record<string, unknown> = {};
    if (typeof points_reward === "number") updates.points_reward = points_reward;
    if (name_th) updates.name_th = name_th;
    if (color_code) updates.color_code = color_code;

    const { data, error } = await client
      .from("waste_categories")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "อัปเดตเกณฑ์หมวดหมู่สำเร็จ", category: data });
  } catch (error) {
    console.error("Update guidelines error:", error);
    return NextResponse.json({ error: "อัปเดตข้อมูลล้มเหลว" }, { status: 500 });
  }
}

