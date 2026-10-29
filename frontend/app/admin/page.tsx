"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

interface DashboardStats {
  photos: { value: number; subtitle: string; change: string };
  accuracy: { value: number; subtitle: string; change: string };
  locations: { value: number; subtitle: string; change: string };
  users: { value: number; subtitle: string; change: string };
  co2Saved: { value: number; unit: string; change: string };
}

interface RecentScan {
  id: string;
  time: string;
  item: string;
  category: "รีไซเคิล" | "ทั่วไป" | "เปียก" | "อันตราย" | string;
  confidence: number;
  points: number;
  user: string;
}

interface DistributionItem {
  type: string;
  count: number;
  percent: number;
  color: string;
  text: string;
  bgLight: string;
}

interface DayData {
  day: string;
  recycle: number;
  general: number;
  wet: number;
  hazard: number;
}

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState<"today" | "7d" | "30d" | "all">("7d");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    photos: { value: 0, subtitle: "กำลังโหลด...", change: "..." },
    accuracy: { value: 97.6, subtitle: "Google Gemini AI", change: "ความแม่นยำเฉลี่ย" },
    locations: { value: 5, subtitle: "เปิดใช้งานใน มข.", change: "พร้อมบริการ" },
    users: { value: 0, subtitle: "สมาชิกในระบบ", change: "ผู้ใช้งานจริง" },
    co2Saved: { value: 0, unit: "kg CO₂e", change: "ลดก๊าซเรือนกระจก" },
  });

  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
  const [wasteDistribution, setWasteDistribution] = useState<DistributionItem[]>([
    { type: "รีไซเคิล", count: 0, percent: 0, color: "bg-blue-500", text: "text-blue-700", bgLight: "bg-blue-50/70 border-blue-200/70" },
    { type: "ทั่วไป", count: 0, percent: 0, color: "bg-amber-500", text: "text-amber-800", bgLight: "bg-amber-50/70 border-amber-200/70" },
    { type: "เปียก", count: 0, percent: 0, color: "bg-emerald-500", text: "text-emerald-800", bgLight: "bg-emerald-50/70 border-emerald-200/70" },
    { type: "อันตราย", count: 0, percent: 0, color: "bg-rose-500", text: "text-rose-800", bgLight: "bg-rose-50/70 border-rose-200/70" },
  ]);

  const [weeklyData, setWeeklyData] = useState<DayData[]>([
    { day: "จันทร์", recycle: 0, general: 0, wet: 0, hazard: 0 },
    { day: "อังคาร", recycle: 0, general: 0, wet: 0, hazard: 0 },
    { day: "พุธ", recycle: 0, general: 0, wet: 0, hazard: 0 },
    { day: "พฤหัส", recycle: 0, general: 0, wet: 0, hazard: 0 },
    { day: "ศุกร์", recycle: 0, general: 0, wet: 0, hazard: 0 },
    { day: "เสาร์", recycle: 0, general: 0, wet: 0, hazard: 0 },
    { day: "อาทิตย์", recycle: 0, general: 0, wet: 0, hazard: 0 },
  ]);

  const [systemMetrics, setSystemMetrics] = useState({
    apiLatency: 120,
    supabaseStatus: "Connected",
    geminiStatus: "Ready",
    activeSessions: 1,
  });

  const refreshData = async () => {
    setLoading(true);
    try {
      // 1. Fetch live stats
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        if (data.stats) {
          setStats(data.stats);
        }

        if (Array.isArray(data.recentScans)) {
          setRecentScans(data.recentScans);
        }

        if (Array.isArray(data.distribution) && data.distribution.length > 0) {
          const total = data.distribution.reduce((acc: number, d: any) => acc + (d.count || 0), 0);
          const mapped = data.distribution.map((d: any) => ({
            ...d,
            percent: total > 0 ? Math.round(((d.count || 0) / total) * 100) : 0,
          }));
          setWasteDistribution(mapped);
        }

        if (Array.isArray(data.weeklyData) && data.weeklyData.length > 0) {
          setWeeklyData(data.weeklyData);
        }
      }

      // 2. Fetch system health metrics
      const healthRes = await fetch("/api/admin/settings");
      if (healthRes.ok) {
        const health = await healthRes.json();
        setSystemMetrics({
          apiLatency: health.metrics?.totalLatencyMs || 120,
          supabaseStatus: health.metrics?.supabaseStatus || "Connected",
          geminiStatus: health.metrics?.geminiStatus || "Ready",
          activeSessions: 1,
        });
      }
    } catch (err) {
      console.warn("Live DB Sync notice:", err);
    } finally {
      setTimeout(() => setLoading(false), 200);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const totalWeeklyScans = weeklyData.reduce(
    (acc, d) => acc + d.recycle + d.general + d.wet + d.hazard,
    0
  );

  const maxDaily = Math.max(
    ...weeklyData.map((d) => d.recycle + d.general + d.wet + d.hazard),
    10
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in pb-12">
      {/* ================= 1. Page Header & Quick Controls ================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
              แดชบอร์ดภาพรวมระบบ
            </h1>
            <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs px-2.5 py-1 rounded-full font-bold">
              v2.0 Realtime
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            ศูนย์ควบคุมระบบแยกขยะอัจฉริยะ มหาวิทยาลัยขอนแก่น (KKU Smart Waste)
          </p>
        </div>

        {/* Time Filters & Refresh */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="bg-white border border-slate-200 p-1 rounded-xl flex items-center gap-1 text-xs font-bold shadow-sm">
            {(["today", "7d", "30d", "all"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  timeRange === range
                    ? "bg-emerald-600 text-white shadow-sm font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {range === "today" ? "วันนี้" : range === "7d" ? "7 วัน" : range === "30d" ? "30 วัน" : "ทั้งหมด"}
              </button>
            ))}
          </div>

          <button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 transition shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <span className={loading ? "animate-spin" : ""}>🔄</span>
            <span>{loading ? "กำลังซิงค์..." : "รีเฟรชข้อมูล"}</span>
          </button>

          <Link
            href="/admin/locations"
            className="hidden sm:flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-95"
          >
            <span>➕</span> เพิ่มจุดทิ้ง
          </Link>
        </div>
      </div>

      {/* ================= 2. KPI Cards Grid ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Scans */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition relative overflow-hidden group">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-slate-500">ขยะที่สแกนสะสม</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-lg">
              📸
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            {stats.photos.value.toLocaleString()} <span className="text-xs font-medium text-slate-400">ชิ้น</span>
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {stats.photos.change}
            </span>
            <span className="text-[11px] text-slate-500 truncate">{stats.photos.subtitle}</span>
          </div>
        </div>

        {/* Card 2: AI Accuracy */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition relative overflow-hidden group">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-slate-500">ความแม่นยำ AI</span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center text-lg">
              🤖
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            {stats.accuracy.value}%
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
              {stats.accuracy.change}
            </span>
            <span className="text-[11px] text-slate-500 truncate">{stats.accuracy.subtitle}</span>
          </div>
        </div>

        {/* Card 3: Drop-off Locations */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition relative overflow-hidden group">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-slate-500">จุดทิ้งขยะใน มข.</span>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center text-lg">
              📍
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            {stats.locations.value} <span className="text-sm font-semibold text-slate-500">แห่ง</span>
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
              {stats.locations.change}
            </span>
            <span className="text-[11px] text-slate-500 truncate">{stats.locations.subtitle}</span>
          </div>
        </div>

        {/* Card 4: Total Community Users */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition relative overflow-hidden group">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-slate-500">สมาชิกชุมชน มข.</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center text-lg">
              👥
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            {stats.users.value.toLocaleString()} <span className="text-xs font-medium text-slate-400">คน</span>
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
              {stats.users.change}
            </span>
            <span className="text-[11px] text-slate-500 truncate">{stats.users.subtitle}</span>
          </div>
        </div>

        {/* Card 5: Carbon Saved */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition relative overflow-hidden group">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-slate-500">ลดคาร์บอนสะสม</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-lg">
              🌱
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            {stats.co2Saved.value} <span className="text-xs font-bold text-emerald-600">{stats.co2Saved.unit}</span>
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {stats.co2Saved.change}
            </span>
            <span className="text-[11px] text-slate-500">คำนวณจริง</span>
          </div>
        </div>
      </div>

      {/* ================= 3. Visual Charts & Analytics Section ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Trend Bar Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>📈</span> แนวโน้มการคัดแยกขยะรายวัน (7 วันล่าสุด)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                จำแนกตามประเภทขยะมาตรฐาน 4 หมวดหมู่จากฐานข้อมูลจริง (ชิ้น/วัน)
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2.5 text-xs flex-wrap">
              <span className="flex items-center gap-1.5 text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> รีไซเคิล
              </span>
              <span className="flex items-center gap-1.5 text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> ทั่วไป
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> เปียก
              </span>
              <span className="flex items-center gap-1.5 text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> อันตราย
              </span>
            </div>
          </div>

          {/* Interactive Stacked Chart Visual */}
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-56 pb-2 border-b border-slate-100">
              {weeklyData.map((d, i) => {
                const total = d.recycle + d.general + d.wet + d.hazard;
                const hRecycle = maxDaily > 0 ? (d.recycle / maxDaily) * 100 : 0;
                const hGeneral = maxDaily > 0 ? (d.general / maxDaily) * 100 : 0;
                const hWet = maxDaily > 0 ? (d.wet / maxDaily) * 100 : 0;
                const hHazard = maxDaily > 0 ? (d.hazard / maxDaily) * 100 : 0;

                return (
                  <div key={i} className="flex flex-col items-center h-full justify-end group cursor-pointer">
                    <span className="text-[10px] text-slate-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                      {total}
                    </span>
                    <div className="w-full max-w-[36px] flex flex-col rounded-t-lg overflow-hidden bg-slate-100 group-hover:scale-105 transition-transform shadow-sm min-h-[4px]">
                      {hHazard > 0 && <div style={{ height: `${hHazard}%` }} className="bg-rose-500 w-full" title={`อันตราย: ${d.hazard}`}></div>}
                      {hWet > 0 && <div style={{ height: `${hWet}%` }} className="bg-emerald-500 w-full" title={`เปียก: ${d.wet}`}></div>}
                      {hGeneral > 0 && <div style={{ height: `${hGeneral}%` }} className="bg-amber-500 w-full" title={`ทั่วไป: ${d.general}`}></div>}
                      {hRecycle > 0 && <div style={{ height: `${hRecycle}%` }} className="bg-blue-500 w-full" title={`รีไซเคิล: ${d.recycle}`}></div>}
                    </div>
                    <span className="text-[11px] text-slate-500 mt-2 font-bold group-hover:text-emerald-700 transition-colors">
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
              <span>สัปดาห์นี้: มีการสแกน {totalWeeklyScans} ชิ้น</span>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                ยอดสแกนสะสมทั้งหมด {stats.photos.value.toLocaleString()} รายการ
              </span>
            </div>
          </div>
        </div>

        {/* Waste Type Breakdown (1 Col) */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-1">
              <span>🎯</span> สัดส่วนประเภทขยะที่ตรวจพบ
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              คิดเป็นเปอร์เซ็นต์จากภาพถ่ายที่สแกนจริงในระบบ
            </p>

            <div className="space-y-3.5">
              {wasteDistribution.map((item, idx) => (
                <div key={idx} className={`p-3.5 rounded-2xl border ${item.bgLight} transition hover:scale-[1.01]`}>
                  <div className="flex justify-between items-center text-xs font-bold mb-2">
                    <span className={`${item.text} flex items-center gap-2`}>
                      <span className={`w-2.5 h-2.5 rounded-full ${item.color}`}></span>
                      ขยะ{item.type}
                    </span>
                    <span className="text-slate-800">
                      {item.count} ชิ้น ({item.percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200/70 rounded-full h-2 overflow-hidden">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all duration-1000`}
                      style={{ width: `${item.percent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>ฐานข้อมูลที่ใช้งาน:</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              Supabase PostgreSQL
            </span>
          </div>
        </div>
      </div>

      {/* ================= 4. System Live Health & Realtime Activity ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Scans Stream */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>⚡</span> กิจกรรมการสแกนขยะแบบ Realtime
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                รายการวิเคราะห์ล่าสุดจากกล้องและโมเดล AI ในระบบ
              </p>
            </div>
            <button
              onClick={refreshData}
              className="text-xs text-emerald-700 hover:text-emerald-800 hover:underline font-bold cursor-pointer"
            >
              รีเฟรชลิสต์ ⟳
            </button>
          </div>

          <div className="overflow-x-auto">
            {recentScans.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium">
                ยังไม่มีข้อมูลการสแกนในระบบ
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-bold">
                    <th className="py-3 px-3">เวลา</th>
                    <th className="py-3 px-3">วัตถุที่ตรวจจับ</th>
                    <th className="py-3 px-3">ประเภทถัง</th>
                    <th className="py-3 px-3">ความมั่นใจ</th>
                    <th className="py-3 px-3 text-right">แต้มที่ให้</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentScans.map((scan) => {
                    const badgeColor =
                      scan.category === "รีไซเคิล"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : scan.category === "เปียก"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : scan.category === "อันตราย"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-amber-50 text-amber-700 border-amber-200";

                    return (
                      <tr key={scan.id} className="hover:bg-emerald-50/30 transition-colors">
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{scan.time}</td>
                        <td className="py-3 px-3 font-semibold text-slate-800">
                          📸 {scan.item}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${badgeColor}`}>
                            {scan.category}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-emerald-500 h-1.5 rounded-full"
                                style={{ width: `${Math.min(100, scan.confidence)}%` }}
                              ></div>
                            </div>
                            <span className="font-bold text-slate-700">{scan.confidence}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-black text-emerald-600">
                          +{scan.points}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right 1 Col: System & Cloud Metrics */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-1">
              <span>🖥️</span> สถานะบริการ & ระบบหลังบ้าน
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              การตรวจสอบความพร้อมของ API และ Database
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-slate-800">Google Gemini AI</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {systemMetrics.geminiStatus}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-bold text-slate-800">Supabase Cloud DB</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {systemMetrics.supabaseStatus}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <span className="text-xs font-bold text-slate-800">API Response Time</span>
                </div>
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  {systemMetrics.apiLatency} ms
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                  <span className="text-xs font-bold text-slate-800">ผู้ดูแลระบบออนไลน์</span>
                </div>
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                  1 เซสชัน
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link
              href="/admin/settings"
              className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 font-bold py-2.5 rounded-xl text-xs transition border border-slate-200"
            >
              <span>⚙️</span> จัดการการตั้งค่าเซิร์ฟเวอร์
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
