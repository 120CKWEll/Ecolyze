"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const menuItems = [
    { name: "แดชบอร์ดภาพรวม", icon: "📊", link: "/admin", badge: "Live" },
    { name: "จัดการรายงานปัญหา", icon: "📋", link: "/admin/reports", badge: "3 ใหม่" },
    { name: "จัดการผู้ใช้งาน", icon: "👥", link: "/admin/users" },
    { name: "จุดทิ้งขยะ & แผนที่", icon: "📍", link: "/admin/locations" },
    { name: "คู่มือ & หมวดหมู่ขยะ", icon: "📘", link: "/admin/guidelines" },
    { name: "ตั้งค่าระบบ & AI", icon: "⚙️", link: "/admin/settings" },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden selection:bg-emerald-500 selection:text-white">
      
      {/* ================= 1. Modern Admin Sidebar ================= */}
      <aside className="w-68 bg-white border-r border-slate-200/80 flex flex-col shrink-0 z-30 shadow-sm">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-xl text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              ♻️
            </div>
            <div>
              <h1 className="font-black text-lg tracking-tight text-slate-900 flex items-center gap-1.5">
                Ecolyze <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">Admin</span>
              </h1>
              <p className="text-[11px] text-emerald-600 font-semibold uppercase tracking-wider">
                KKU Green Control
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto custom-scrollbar">
          <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            เมนูควบคุมหลัก
          </div>
          {menuItems.map((item, index) => {
            const isActive = pathname === item.link;

            return (
              <Link
                href={item.link}
                key={index}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25 font-bold"
                    : "text-slate-600 hover:bg-emerald-50/70 hover:text-emerald-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg group-hover:scale-110 transition-transform">
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Portal Link & Footer */}
        <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/50">
          <Link
            href="/"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 transition-colors"
          >
            <span className="flex items-center gap-2">
              <span>🌐</span> กลับสู่หน้าผู้ใช้งาน
            </span>
            <span>↗</span>
          </Link>
          <div className="flex items-center gap-3 px-2 pt-1">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-xs">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">Administrator</p>
              <p className="text-[10px] text-emerald-600 font-medium truncate">● Online</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= 2. Main Content Wrapper ================= */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
        {/* Top Header */}
        <header className="bg-white/90 backdrop-blur-md px-8 py-4 flex justify-between items-center border-b border-slate-200/80 z-20 shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="text-slate-400">ระบบหลังบ้าน</span>
              <span className="text-slate-300">/</span>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                {menuItems.find((m) => m.link === pathname)?.name ?? "แดชบอร์ด"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* System Live Pill */}
            <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-200 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              AI & API Services Active
            </div>

            {/* Notification Button */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-slate-600 hover:text-slate-800 border border-slate-200 transition-colors cursor-pointer"
                title="การแจ้งเตือน"
              >
                🔔
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                  3
                </span>
              </button>

              {/* Notification Popup */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50 animate-fade-in">
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                    <h4 className="text-sm font-bold text-slate-800">การแจ้งเตือนล่าสุด</h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      3 ใหม่
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-100 transition">
                      <p className="font-bold text-slate-800">🚨 แจ้งถังขยะเต็ม: ศูนย์อาหารคอมเพล็กซ์</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">5 นาทีที่แล้ว โดย ผู้ใช้</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-100 transition">
                      <p className="font-bold text-slate-800">🤖 AI ความแม่นยำสูง 98.2% ใน 100 รายการล่าสุด</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">1 ชั่วโมงที่แล้ว</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Pill */}
            <div className="flex items-center gap-2 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200">
              <span className="text-sm">🛡️</span>
              <span className="text-xs font-bold text-slate-700">Super Admin</span>
            </div>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-emerald-50/15 to-teal-50/10 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}