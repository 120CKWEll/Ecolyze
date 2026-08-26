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
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden selection:bg-emerald-500 selection:text-white">
      
      {/* ================= 1. Modern Admin Sidebar ================= */}
      <aside className="w-68 bg-slate-900/90 backdrop-blur-xl border-r border-slate-800/80 flex flex-col shrink-0 z-30 shadow-2xl">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/70 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-xl shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              ♻️
            </div>
            <div>
              <h1 className="font-black text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent">
                Ecolyze Admin
              </h1>
              <p className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">
                KKU Green Control
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto custom-scrollbar">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
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
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/30 font-bold"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
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
                        ? "bg-emerald-950/80 text-emerald-200 border border-emerald-400/30"
                        : "bg-slate-800 text-emerald-400 border border-emerald-500/20"
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
        <div className="p-4 border-t border-slate-800/80 space-y-3 bg-slate-900/50">
          <Link
            href="/"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-800/40 transition-colors"
          >
            <span className="flex items-center gap-2">
              <span>🌐</span> กลับสู่หน้าผู้ใช้งาน
            </span>
            <span>↗</span>
          </Link>
          <div className="flex items-center gap-3 px-2 pt-1">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-200 truncate">Administrator</p>
              <p className="text-[10px] text-emerald-400 truncate">● Online</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= 2. Main Content Wrapper ================= */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-950">
        {/* Top Header */}
        <header className="bg-slate-900/60 backdrop-blur-md px-8 py-4 flex justify-between items-center border-b border-slate-800/70 z-20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <span className="text-slate-500">ระบบหลังบ้าน</span>
              <span>/</span>
              <span className="text-emerald-400 font-bold">
                {menuItems.find((m) => m.link === pathname)?.name ?? "แดชบอร์ด"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* System Live Pill */}
            <div className="hidden sm:flex items-center gap-2 bg-emerald-950/50 text-emerald-400 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-500/30 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              AI & API Services Active
            </div>

            {/* Notification Button */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
                title="การแจ้งเตือน"
              >
                🔔
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                  3
                </span>
              </button>

              {/* Notification Popup */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-fade-in">
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800">
                    <h4 className="text-sm font-bold text-slate-200">การแจ้งเตือนล่าสุด</h4>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                      3 ใหม่
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 transition">
                      <p className="font-bold text-slate-200">🚨 แจ้งถังขยะเต็ม: ศูนย์อาหารคอมเพล็กซ์</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">5 นาทีที่แล้ว โดย ผู้ใช้</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 transition">
                      <p className="font-bold text-slate-200">🤖 AI ความแม่นยำสูง 98.2% ใน 100 รายการล่าสุด</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">1 ชั่วโมงที่แล้ว</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Pill */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-slate-800 to-slate-850 px-3.5 py-1.5 rounded-full border border-slate-700/70">
              <span className="text-sm">🛡️</span>
              <span className="text-xs font-bold text-slate-200">Super Admin</span>
            </div>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}