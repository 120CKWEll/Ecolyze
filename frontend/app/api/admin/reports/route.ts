import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET /api/admin/reports
export async function GET() {
  try {
    const client = getSupabaseAdminClient();
    const { data, error } = await client
      .from("waste_reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Admin reports error:", error);
    return NextResponse.json({ error: "โหลดรายงานล้มเหลว" }, { status: 500 });
  }
}

// PUT /api/admin/reports (Update status)
export async function PUT(req: NextRequest) {
  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
    }

    const client = getSupabaseAdminClient();
    const { data, error } = await client
      .from("waste_reports")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "อัปเดตสถานะสำเร็จ", report: data });
  } catch (error) {
    console.error("Update report error:", error);
    return NextResponse.json({ error: "อัปเดตข้อมูลล้มเหลว" }, { status: 500 });
  }
}

// POST /api/admin/reports (Create report)
export async function POST(req: NextRequest) {
  try {
    const { location_name, report_type, description, user_id } = await req.json();
    if (!location_name || !report_type) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const client = getSupabaseAdminClient();
    const { data, error } = await client
      .from("waste_reports")
      .insert({
        user_id: user_id || null,
        location_name,
        report_type,
        description: description || "",
        status: "Pending",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "สร้างรายงานปัญหาสำเร็จ", report: data }, { status: 201 });
  } catch (error) {
    console.error("Create report error:", error);
    return NextResponse.json({ error: "สร้างรายงานล้มเหลว" }, { status: 500 });
  }
}

// DELETE /api/admin/reports
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const client = getSupabaseAdminClient();
    const { error } = await client.from("waste_reports").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "ลบรายงานสำเร็จ" });
  } catch (error) {
    console.error("Delete report error:", error);
    return NextResponse.json({ error: "ลบรายงานล้มเหลว" }, { status: 500 });
  }
}
