"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function AdminLocationsPage() {
  // ข้อมูลจำลอง (Mock Data) สำหรับจุดทิ้งขยะ
  const [locations, setLocations] = useState([
    { id: 1, name: "ศูนย์อาหารคอมเพล็กซ์", lat: 16.4744, lng: 102.8231, types: ["รีไซเคิล", "เปียก", "ทั่วไป"], status: "Active" },
    { id: 2, name: "คณะวิศวกรรมศาสตร์", lat: 16.4755, lng: 102.8195, types: ["รีไซเคิล", "อันตราย"], status: "Active" },
    { id: 3, name: "หอสมุดกลาง", lat: 16.4715, lng: 102.8235, types: ["รีไซเคิล", "อันตราย"], status: "Maintenance" },
  ]);

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📍 จัดการจุดทิ้งขยะ</h1>
          <p className="text-gray-500 text-sm mt-1">ตั้งค่าพิกัดและประเภทถังขยะที่แสดงบนแผนที่</p>
        </div>
        {/* สมมติว่าปุ่มนี้ลิงก์ไปหน้าที่เราเคยทำไว้สำหรับปักหมุดแผนที่ */}
        <Link href="/admin/add-bin" className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2">
          <span>➕</span> เพิ่มจุดทิ้งใหม่
        </Link>
      </div>

      <div className="grid gap-4">
        {locations.map((loc) => (
          <div key={loc.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-emerald-200 transition-colors">
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-xl shrink-0">
                🗑️
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{loc.name}</h3>
                <p className="text-xs text-gray-400 font-mono mt-1">Lat: {loc.lat} | Lng: {loc.lng}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {loc.types.map((type, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end md:w-48 gap-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                loc.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
              }`}>
                {loc.status === "Active" ? "🟢 เปิดใช้งาน" : "🛠️ ปิดปรับปรุง"}
              </span>
              <button className="text-gray-400 hover:text-blue-500 font-bold text-sm">แก้ไข</button>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}