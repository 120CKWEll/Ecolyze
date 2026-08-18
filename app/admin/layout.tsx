"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); // เพื่อเช็คว่าตอนนี้อยู่หน้าไหน จะได้ทำปุ่มให้เป็นสี Active

  // รายการเมนูแอดมิน พร้อมลิงก์ที่เชื่อมไปหน้าต่างๆ
  const menuItems = [
    { name: "แดชบอร์ด", icon: "📉", link: "/admin" },
    { name: "จัดการรายงานขยะ", icon: "📋", link: "/admin/reports" },
    { name: "ผู้ใช้", icon: "👥", link: "/admin/users" },
    { name: "คำแนะนำการแยกขยะ", icon: "📘", link: "/admin/guidelines" },
    { name: "สถิติการทิ้งขยะ", icon: "📊", link: "/admin/locations" }, // ใช้หน้า locations จัดการพิกัด
    { name: "ตั้งค่า", icon: "⚙️", link: "/admin/settings" },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
      {/* ================= 1. Sidebar ================= */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col transition-all shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <span className="text-2xl">♻️</span>
          <div>
            <h1 className="font-bold text-lg leading-tight">RecycleSmart</h1>
            <p className="text-xs text-slate-400">Admin Dashboard</p>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item, index) => {
            // เช็คว่าหน้าปัจจุบันตรงกับลิงก์ของเมนูไหม
            const isActive = pathname === item.link;
            
            return (
              <Link 
                href={item.link} 
                key={index}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ================= 2. Main Content Area ================= */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Header กลางสำหรับทุกหน้าแอดมิน */}
        <header className="bg-white px-8 py-4 flex justify-between items-center shadow-sm border-b border-gray-100 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-800">ระบบจัดการหลังบ้าน</h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800">
              🔔 <span className="font-medium">แจ้งเตือน</span>
            </button>
            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-medium text-sm cursor-pointer">
              👤 Admin
            </div>
          </div>
        </header>

        {/* พื้นที่เปลี่ยนเนื้อหาตามหน้าเว็บ (children) */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

      </main>
    </div>
  );
}