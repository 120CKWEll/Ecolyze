"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  // 1. สร้าง State สำหรับเก็บข้อมูล เพื่อให้สามารถแก้ไขได้จริง
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [stats, setStats] = useState({
    photos: { value: 100, subtitle: "+15% จากเมื่อวาน" },
    locations: { value: 56, subtitle: "+2 แห่ง" },
    accuracy: { value: 96.8, subtitle: "สัปดาห์นี้" },
    users: { value: 1284, subtitle: "+50 ใหม่ในเดือนนี้" }
  });

  const [systemStatus, setSystemStatus] = useState({
    cpu: 65,
    memory: 48,
    storage: 72
  });

  // ฟังก์ชันอัปเดตข้อมูลจากการพิมพ์
  const handleStatChange = (key: keyof typeof stats, field: 'value' | 'subtitle', newValue: string) => {
    setStats(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: field === 'value' ? Number(newValue) : newValue }
    }));
  };

  const handleStatusChange = (key: keyof typeof systemStatus, newValue: string) => {
    setSystemStatus(prev => ({ ...prev, [key]: Number(newValue) }));
  };

  return (
    // โครงสร้างหลักแบบ Flexbox (Sidebar + Content)
    <div className="flex h-screen bg-gray-50 font-sans">
      
      {/* ================= 1. Sidebar (เมนูด้านซ้าย) ================= */}
      {/* <aside className="w-64 bg-slate-900 text-white flex flex-col transition-all">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <span className="text-2xl">♻️</span>
          <div>
            <h1 className="font-bold text-lg leading-tight">RecycleSmart</h1>
            <p className="text-xs text-slate-400">Admin Dashboard</p>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {[
            { name: "แดชบอร์ด", icon: "📉", active: true },
            { name: "จัดการรายงานขยะ", icon: "📋" },
            { name: "ผู้ใช้", icon: "👥" },
            { name: "คำแนะนำการแยกขยะ", icon: "📘" },
            { name: "สถิติการทิ้งขยะ", icon: "📊" },
            { name: "ปรับปรุงโมเดล AI", icon: "🤖" },
            { name: "ตั้งค่า", icon: "⚙️" },
          ].map((item, index) => (
            <button 
              key={index}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                item.active ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <div className="p-4 text-xs text-slate-500 text-center border-t border-slate-800">
          © 2025 EcoSort
        </div>
      </aside> */}

      {/* ================= 2. Main Content (พื้นที่เนื้อหาหลัก) ================= */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        
        {/* Header */}
        <header className="bg-white px-8 py-4 flex justify-between items-center shadow-sm border-b border-gray-100 z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-800">แดชบอร์ด</h2>
            <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">ภาพรวมระบบ</span>
          </div>
          <div className="flex items-center gap-4">
            {/* ปุ่มเปิด/ปิด โหมดแก้ไขข้อมูล */}
            <button 
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                isEditMode ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"
              }`}
            >
              {isEditMode ? "💾 บันทึกข้อมูล" : "✏️ แก้ไขข้อมูลจำลอง"}
            </button>
            <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800">
              🔔 <span className="font-medium">แจ้งเตือน</span>
            </button>
            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-medium text-sm cursor-pointer">
              👤 Admin
            </div>
          </div>
        </header>

        <div className="p-8 space-y-6 flex-1">
          
          {/* ================= 3. Stats Cards (การ์ดสถิติ) ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: อัปโหลด */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
              <div className="w-14 h-14 rounded-xl bg-emerald-100 text-emerald-500 flex items-center justify-center text-2xl shrink-0">📸</div>
              <div className="flex-1">
                {isEditMode ? (
                  <input type="number" value={stats.photos.value} onChange={(e) => handleStatChange('photos', 'value', e.target.value)} className="w-full text-2xl font-black text-gray-800 border-b border-gray-300 focus:outline-none focus:border-emerald-500" />
                ) : (
                  <h3 className="text-2xl font-black text-gray-800">{stats.photos.value}</h3>
                )}
                <p className="text-sm text-gray-500 font-medium">รูปที่อัปโหลดวันนี้</p>
                {isEditMode ? (
                  <input type="text" value={stats.photos.subtitle} onChange={(e) => handleStatChange('photos', 'subtitle', e.target.value)} className="w-full text-xs text-emerald-500 font-bold border-b border-gray-300 focus:outline-none mt-1" />
                ) : (
                  <p className="text-xs text-emerald-500 font-bold mt-1">{stats.photos.subtitle}</p>
                )}
              </div>
            </div>

            {/* Card 2: พิกัด */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
              <div className="w-14 h-14 rounded-xl bg-blue-100 text-blue-500 flex items-center justify-center text-2xl shrink-0">📍</div>
              <div className="flex-1">
                {isEditMode ? (
                  <input type="number" value={stats.locations.value} onChange={(e) => handleStatChange('locations', 'value', e.target.value)} className="w-full text-2xl font-black text-gray-800 border-b border-gray-300 focus:outline-none focus:border-blue-500" />
                ) : (
                  <h3 className="text-2xl font-black text-gray-800">{stats.locations.value}</h3>
                )}
                <p className="text-sm text-gray-500 font-medium">พิกัดที่ตรวจพบ</p>
                <p className="text-xs text-emerald-500 font-bold mt-1">{stats.locations.subtitle}</p>
              </div>
            </div>

            {/* Card 3: AI Accuracy */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
              <div className="w-14 h-14 rounded-xl bg-yellow-100 text-yellow-500 flex items-center justify-center text-2xl shrink-0">🤖</div>
              <div className="flex-1">
                {isEditMode ? (
                  <input type="number" step="0.1" value={stats.accuracy.value} onChange={(e) => handleStatChange('accuracy', 'value', e.target.value)} className="w-full text-2xl font-black text-gray-800 border-b border-gray-300 focus:outline-none focus:border-yellow-500" />
                ) : (
                  <h3 className="text-2xl font-black text-gray-800">{stats.accuracy.value}%</h3>
                )}
                <p className="text-sm text-gray-500 font-medium">ความแม่นยำ AI</p>
                <p className="text-xs text-gray-400 font-bold mt-1">{stats.accuracy.subtitle}</p>
              </div>
            </div>

            {/* Card 4: ผู้ใช้ */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
              <div className="w-14 h-14 rounded-xl bg-purple-100 text-purple-500 flex items-center justify-center text-2xl shrink-0">👥</div>
              <div className="flex-1">
                {isEditMode ? (
                  <input type="number" value={stats.users.value} onChange={(e) => handleStatChange('users', 'value', e.target.value)} className="w-full text-2xl font-black text-gray-800 border-b border-gray-300 focus:outline-none focus:border-purple-500" />
                ) : (
                  <h3 className="text-2xl font-black text-gray-800">{stats.users.value.toLocaleString()}</h3>
                )}
                <p className="text-sm text-gray-500 font-medium">ผู้ใช้ทั้งหมด</p>
                <p className="text-xs text-emerald-500 font-bold mt-1">{stats.users.subtitle}</p>
              </div>
            </div>

          </div>

          {/* ================= 4. ส่วนกราฟ และ สถานะระบบ ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* พื้นที่แสดงกราฟ (กินพื้นที่ 2 ใน 3) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">ภาพรวมกิจกรรม 7 วัน</h3>
                  <p className="text-sm text-gray-500">จำนวนรายงานและรูปภาพที่อัปโหลด (ตัวอย่างกราฟ)</p>
                </div>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200">
                  📅 7 วันล่าสุด
                </button>
              </div>
              <div className="flex-1 bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 min-h-[250px]">
                พื้นที่แสดงกราฟ (ใช้ Chart.js หรือ Recharts ได้ที่นี่)
              </div>
            </div>

            {/* สถานะระบบ (กินพื้นที่ 1 ใน 3) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-800 text-lg">สถานะระบบ</h3>
                <span className="text-xs text-gray-400">สถานะบริการหลัก</span>
              </div>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg text-sm font-bold w-fit">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> API: ปกติ
                </div>
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg text-sm font-bold w-fit">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Storage: ปกติ
                </div>
                <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-2 rounded-lg text-sm font-bold w-fit">
                  ⚠️ Queue: หน่วงเล็กน้อย
                </div>
              </div>

              <h4 className="text-sm font-bold text-gray-600 mb-4">การใช้ทรัพยากร</h4>
              
              <div className="space-y-5">
                {/* CPU */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                    <span>CPU {systemStatus.cpu}%</span>
                    {isEditMode && <input type="range" min="0" max="100" value={systemStatus.cpu} onChange={(e) => handleStatusChange('cpu', e.target.value)} className="w-24" />}
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full transition-all duration-300" style={{ width: `${systemStatus.cpu}%` }}></div>
                  </div>
                </div>
                
                {/* Memory */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                    <span>Memory {systemStatus.memory}%</span>
                    {isEditMode && <input type="range" min="0" max="100" value={systemStatus.memory} onChange={(e) => handleStatusChange('memory', e.target.value)} className="w-24" />}
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full transition-all duration-300" style={{ width: `${systemStatus.memory}%` }}></div>
                  </div>
                </div>

                {/* Storage */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                    <span>Storage {systemStatus.storage}%</span>
                    {isEditMode && <input type="range" min="0" max="100" value={systemStatus.storage} onChange={(e) => handleStatusChange('storage', e.target.value)} className="w-24" />}
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full transition-all duration-300" style={{ width: `${systemStatus.storage}%` }}></div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
}