"use client";
import React, { useState } from "react";

export default function AdminSettingsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [aiStrictness, setAiStrictness] = useState("medium");
  const [aiModel, setAiModel] = useState("gemini-2.5-flash-lite");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in pb-12">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200/80">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <span>⚙️</span> ตั้งค่าระบบ & ปัญญาประดิษฐ์ (AI Settings)
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          ปรับแต่งพารามิเตอร์โมเดล Gemini และการเชื่อมต่อฐานข้อมูล Supabase
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold animate-fade-in flex items-center gap-2 shadow-sm">
          <span>✅</span> บันทึกการตั้งค่าระบบเรียบร้อยแล้ว
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Settings */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span>🌐</span> การทำงานของระบบทั่วไป
          </h2>

          <label className="flex items-start gap-4 cursor-pointer p-3 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
            <input
              type="checkbox"
              className="mt-1 w-5 h-5 rounded accent-emerald-600 cursor-pointer"
              checked={maintenanceMode}
              onChange={() => setMaintenanceMode(!maintenanceMode)}
            />
            <div>
              <p className="font-bold text-slate-800 text-sm">
                เปิดโหมดซ่อมบำรุง (Maintenance Mode)
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                พักการทำงานของระบบสแกนขยะสำหรับผู้ใช้งานทั่วไปชั่วคราวระหว่างอัปเดต
              </p>
            </div>
          </label>
        </div>

        {/* AI Model Configuration */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span>🤖</span> การกำหนดค่า Google Gemini Vision Model
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 text-sm">
                โมเดลปัญญาประดิษฐ์หลัก (Primary AI Model)
              </label>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-semibold cursor-pointer"
              >
                <option value="gemini-2.5-flash-lite">Google Gemini 2.5 Flash Lite (เร็วที่สุด / ประหยัด Quota)</option>
                <option value="gemini-2.5-flash">Google Gemini 2.5 Flash (มาตรฐานแนะนำ)</option>
                <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (โมเดลสำรอง)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5 text-sm">
                ระดับเกณฑ์ความมั่นใจขั้นต่ำ (Confidence Threshold)
              </label>
              <select
                value={aiStrictness}
                onChange={(e) => setAiStrictness(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-semibold cursor-pointer"
              >
                <option value="low">ระดับปกติ (ความมั่นใจ 70% ขึ้นไป)</option>
                <option value="medium">ระดับแนะนำ (ความมั่นใจ 85% ขึ้นไป)</option>
                <option value="high">ระดับเข้มงวดสูง (ความมั่นใจ 95% ขึ้นไป)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/25 transition active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <span>💾</span> บันทึกการตั้งค่าทั้งหมด
          </button>
        </div>
      </form>
    </div>
  );
}