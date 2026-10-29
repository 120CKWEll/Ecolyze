"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface AdminUser {
  id: string;
  email: string;
  username: string;
  role: string;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  // ตรวจสอบสิทธิ์ผู้ดูแลระบบ (Admin Role Verification)
  useEffect(() => {
    let isMounted = true;

    const checkAdminAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const cachedUserStr = localStorage.getItem("user");

        if (!token) {
          if (isMounted) {
            setCheckingAuth(false);
            setUnauthorized(true);
          }
          return;
        }

        if (cachedUserStr) {
          try {
            const cachedUser = JSON.parse(cachedUserStr);
            if (cachedUser?.role === "admin") {
              if (isMounted) setAdminUser(cachedUser);
            }
          } catch {
            // ignore
          }
        }

        // Verify with /api/auth/me
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const user = await res.json();
          if (user.role === "admin") {
            if (isMounted) {
              setAdminUser(user);
              setUnauthorized(false);
            }
            localStorage.setItem("user", JSON.stringify(user));
          } else {
            if (isMounted) {
              setUnauthorized(true);
            }
          }
        } else {
          // If token expired, clear and mark unauthorized
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          if (isMounted) setUnauthorized(true);
        }
      } catch (err) {
        console.warn("Admin auth check error:", err);
      } finally {
        if (isMounted) setCheckingAuth(false);
      }
    };

    checkAdminAuth();

    // Fetch live pending reports count for notification badge
    const fetchReportsCount = async () => {
      try {
        const res = await fetch("/api/admin/reports");
        if (res.ok) {
          const reports = await res.json();
          if (Array.isArray(reports)) {
            const pending = reports.filter((r) => r.status === "Pending").length;
            if (isMounted) setPendingCount(pending);
          }
        }
      } catch {
        // ignore
      }
    };
    fetchReportsCount();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const menuItems = [
    { name: "แดชบอร์ดภาพรวม", icon: "📊", link: "/admin", badge: "Live" },
    {
      name: "จัดการรายงานปัญหา",
      icon: "📋",
      link: "/admin/reports",
      badge: pendingCount > 0 ? `${pendingCount} ใหม่` : undefined,
    },
    { name: "จัดการผู้ใช้งาน", icon: "👥", link: "/admin/users" },
    { name: "จุดทิ้งขยะ & แผนที่", icon: "📍", link: "/admin/locations" },
    { name: "คู่มือ & หมวดหมู่ขยะ", icon: "📘", link: "/admin/guidelines" },
    { name: "ตั้งค่าระบบ & AI", icon: "⚙️", link: "/admin/settings" },
  ];

  // กรณีรอตรวจสอบสิทธิ์
  if (checkingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-white font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-300">กำลังตรวจสอบสิทธิ์ผู้ดูแลระบบ...</p>
        </div>
      </div>
    );
  }

  // กรณีไม่มีสิทธิ์เข้าถึง (Unauthorized)
  if (unauthorized || adminUser?.role !== "admin") {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-800 font-sans p-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full shadow-xl text-center space-y-5 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center text-3xl mx-auto">
            🚫
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">จำกัดสิทธิ์การเข้าถึง (Admin Only)</h2>
            <p className="text-slate-500 text-xs mt-2 leading-relaxed">
              หน้านี้สงวนสิทธิ์เฉพาะผู้ดูแลระบบ (Role: Admin) ของมหาวิทยาลัยขอนแก่นเท่านั้น บัญชีปัจจุบันของคุณไม่มีสิทธิ์เข้าถึงพื้นที่นี้
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/login"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/20"
            >
              เข้าสู่ระบบด้วยบัญชี Admin
            </Link>
            <Link
              href="/"
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl text-xs font-bold transition"
            >
              กลับสู่หน้าแอปพลิเคชันทั่วไป
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden selection:bg-emerald-500 selection:text-white">
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ================= 1. Modern Admin Sidebar ================= */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 w-68 bg-white border-r border-slate-200/80 flex flex-col shrink-0 z-50 shadow-sm transition-transform duration-300 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
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
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-600 text-lg p-1"
          >
            ✕
          </button>
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
                onClick={() => setMobileMenuOpen(false)}
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
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-xs shrink-0">
                {adminUser?.username?.slice(0, 2).toUpperCase() || "AD"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {adminUser?.username || "Admin"}
                </p>
                <p className="text-[10px] text-slate-400 truncate max-w-[110px]">
                  {adminUser?.email || "admin@kku.ac.th"}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="ออกจากระบบ"
              className="text-xs text-rose-600 hover:text-rose-800 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
            >
              🚪
            </button>
          </div>
        </div>
      </aside>

      {/* ================= 2. Main Content Wrapper ================= */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
        {/* Top Header */}
        <header className="bg-white/90 backdrop-blur-md px-4 sm:px-8 py-4 flex justify-between items-center border-b border-slate-200/80 z-20 shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-lg cursor-pointer"
            >
              ☰
            </button>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="hidden sm:inline text-slate-400">ระบบหลังบ้าน</span>
              <span className="hidden sm:inline text-slate-300">/</span>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                {menuItems.find((m) => m.link === pathname)?.name ?? "แดชบอร์ด"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* System Live Pill */}
            <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-200 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Database Connected
            </div>

            {/* Notification Button */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-slate-600 hover:text-slate-800 border border-slate-200 transition-colors cursor-pointer"
                title="การแจ้งเตือน"
              >
                🔔
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </button>

              {/* Notification Popup */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50 animate-fade-in">
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                    <h4 className="text-sm font-bold text-slate-800">การแจ้งเตือนระบบ</h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      {pendingCount} รอดำเนินการ
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    {pendingCount > 0 ? (
                      <Link
                        href="/admin/reports"
                        onClick={() => setNotificationsOpen(false)}
                        className="block p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100/70 border border-amber-200 transition"
                      >
                        <p className="font-bold text-amber-900">🚨 มีรายงานแจ้งปัญหาถังขยะ {pendingCount} รายการ</p>
                        <p className="text-amber-700 text-[11px] mt-0.5">คลิกเพื่อไปที่หน้ารายงานปัญหา →</p>
                      </Link>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-slate-50 text-slate-500 text-center">
                        ไม่มีรายงานค้างดำเนินการ
                      </div>
                    )}
                    <div className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-100 transition">
                      <p className="font-bold text-slate-800">🤖 ระบบ AI Gemini 2.5 พร้อมให้บริการ</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">เชื่อมต่อฐานข้อมูล Supabase สำเร็จ</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Pill */}
            <div className="flex items-center gap-2 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200">
              <span className="text-sm">🛡️</span>
              <span className="text-xs font-bold text-slate-700">Admin</span>
            </div>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-emerald-50/15 to-teal-50/10 p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
