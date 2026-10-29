import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET /api/admin/users
export async function GET() {
  try {
    const client = getSupabaseAdminClient();
    const { data, error } = await client
      .from("profiles")
      .select("id, email, display_name, score, total_points, role, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Try to get auth emails if profile email is missing
    let authUserMap = new Map<string, string>();
    try {
      const { data: authData } = await client.auth.admin.listUsers();
      if (authData?.users) {
        authData.users.forEach((u) => {
          if (u.email) authUserMap.set(u.id, u.email);
        });
      }
    } catch {
      // ignore if auth admin list is restricted
    }

    const formatted = (data || []).map((u) => {
      const email = u.email || authUserMap.get(u.id) || `${u.id.slice(0, 8)}@kku.ac.th`;
      return {
        id: u.id,
        name: u.display_name || "ผู้ใช้งาน",
        email: email,
        role: u.role === "admin" ? "Admin" : u.role === "staff" ? "Staff" : "User",
        rawRole: u.role || "student",
        points: u.score || 0,
        totalPoints: u.total_points || u.score || 0,
        status: "Active",
        createdAt: u.created_at,
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json({ error: "โหลดรายชื่อผู้ใช้ล้มเหลว" }, { status: 500 });
  }
}

// PUT /api/admin/users
export async function PUT(req: NextRequest) {
  try {
    const { userId, role, score, display_name } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const client = getSupabaseAdminClient();
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (role !== undefined) {
      // Map UI friendly role string to DB allowed values ('student' | 'staff' | 'admin')
      const normalizedRole =
        role === "Admin" || role === "admin"
          ? "admin"
          : role === "Staff" || role === "staff"
          ? "staff"
          : "student";
      updates.role = normalizedRole;
    }

    if (typeof score === "number") {
      updates.score = Math.max(0, score);
    }

    if (typeof display_name === "string" && display_name.trim()) {
      updates.display_name = display_name.trim();
    }

    const { data, error } = await client
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "อัปเดตข้อมูลผู้ใช้สำเร็จ", user: data });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "อัปเดตข้อมูลล้มเหลว" }, { status: 500 });
  }
}

// DELETE /api/admin/users
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const client = getSupabaseAdminClient();
    // Delete profile (auth user cascade if configured, or delete auth user directly)
    try {
      await client.auth.admin.deleteUser(userId);
    } catch {
      // fallback delete from profile directly
      await client.from("profiles").delete().eq("id", userId);
    }

    return NextResponse.json({ message: "ลบบัญชีผู้ใช้งานสำเร็จ" });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "ลบผู้ใช้ล้มเหลว" }, { status: 500 });
  }
}
