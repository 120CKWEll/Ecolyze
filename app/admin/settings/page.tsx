"use client";
import React, { useState } from "react";

export default function AdminSettingsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [aiStrictness, setAiStrictness] = useState("medium");

  return (
    <div className="p-8 animate-fade-in max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">⚙️ ตั้งค่าระบบ</h1>
      <p className="text-gray-500 text-sm mb-6">ปรับแต่งการทำงานหลักของแอปพลิเคชันและ AI</p>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
        
        {/* การตั้งค่าระบบ */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">ระบบทั่วไป</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              className="w-5 h-5 accent-emerald-500"
              checked={maintenanceMode}
              onChange={() => setMaintenanceMode(!maintenanceMode)}
            />
            <div>
              <p className="font-bold text-gray-700">เปิดโหมดซ่อมบำรุง (Maintenance Mode)</p>
              <p className="text-xs text-gray-500">ผู้ใช้ทั่วไปจะไม่สามารถเข้าใช้งานระบบได้ชั่วคราว</p>
            </div>
          </label>
        </div>

        {/* การตั้งค่า AI */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">ปัญญาประดิษฐ์ (AI Analysis)</h2>
          <label className="block mb-2">
            <p className="font-bold text-gray-700 mb-1">ระดับความมั่นใจของ AI (Confidence Threshold)</p>
            <p className="text-xs text-gray-500 mb-2">กำหนดความเข้มงวดในการระบุประเภทขยะ</p>
            <select 
              value={aiStrictness}
              onChange={(e) => setAiStrictness(e.target.value)}
              className="w-full md:w-1/2 p-3 text-gray-800 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500"
            >
              <option value="low">ต่ำ (60% ขึ้นไป)</option>
              <option value="medium">ปานกลาง (80% ขึ้นไป)</option>
              <option value="high">สูง (95% ขึ้นไป)</option>
            </select>
          </label>
        </div>

        <div className="pt-4">
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold transition-colors w-full md:w-auto shadow-sm">
            💾 บันทึกการตั้งค่า
          </button>
        </div>

      </div>
    </div>
  );
}