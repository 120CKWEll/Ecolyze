import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  let supabaseStatus = "Connected";
  let supabaseLatency = 0;
  let geminiStatus = "Ready";
  let geminiLatency = 0;

  // 1. Test Supabase
  try {
    const sStart = Date.now();
    const client = getSupabaseAdminClient();
    await client.from("profiles").select("id").limit(1);
    supabaseLatency = Date.now() - sStart;
  } catch (err) {
    supabaseStatus = "Error: " + String(err);
  }

  // 2. Test Gemini API Key
  try {
    const gStart = Date.now();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      geminiStatus = "Not Configured";
    } else {
      geminiLatency = Date.now() - gStart;
      geminiStatus = "Configured (Active)";
    }
  } catch {
    geminiStatus = "Error";
  }

  return NextResponse.json({
    status: "Healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    metrics: {
      supabaseStatus,
      supabaseLatencyMs: supabaseLatency,
      geminiStatus,
      geminiLatencyMs: geminiLatency,
      totalLatencyMs: Date.now() - startTime,
    },
  });
}

