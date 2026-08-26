import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

// GET /api/admin/locations
export async function GET() {
  try {
    const client = getSupabaseServerClient();
    const { data, error } = await client
      .from("waste_locations")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Admin locations error:", error);
    return NextResponse.json({ error: "โหลดจุดทิ้งขยะล้มเหลว" }, { status: 500 });
  }
}

// POST /api/admin/locations
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, lat, lng, types, description, status } = body;

    if (!name || lat === undefined || lng === undefined) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 });
    }

    const client = getSupabaseServerClient();
    const { data, error } = await client
      .from("waste_locations")
      .insert({
        name,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        types: Array.isArray(types) ? types : ["รีไซเคิล", "ทั่วไป"],
        description: description || "",
        status: status || "Active",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "เพิ่มจุดทิ้งขยะสำเร็จ", location: data }, { status: 201 });
  } catch (error) {
    console.error("Add location error:", error);
    return NextResponse.json({ error: "เพิ่มข้อมูลล้มเหลว" }, { status: 500 });
  }
}

// PUT /api/admin/locations
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, name, description } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const client = getSupabaseServerClient();
    const updates: Record<string, unknown> = {};
    if (status) updates.status = status;
    if (name) updates.name = name;
    if (description) updates.description = description;

    const { data, error } = await client
      .from("waste_locations")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "อัปเดตสำเร็จ", location: data });
  } catch (error) {
    console.error("Update location error:", error);
    return NextResponse.json({ error: "อัปเดตข้อมูลล้มเหลว" }, { status: 500 });
  }
}
