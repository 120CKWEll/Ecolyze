import { NextRequest, NextResponse } from "next/server";
import { getAccessTokenFromRequest, getAuthenticatedUser } from "@/lib/supabase/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await getSupabaseServerClient(getAccessTokenFromRequest(request))
      .from("scan_history")
      .select("id, object_name, waste_type, points_earned, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;

    return NextResponse.json((data ?? []).map((history) => ({
      _id: history.id,
      objectName: history.object_name,
      wasteType: history.waste_type,
      pointsEarned: history.points_earned,
      createdAt: history.created_at,
    })));
  } catch (error: unknown) {
    console.error("History API error:", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
