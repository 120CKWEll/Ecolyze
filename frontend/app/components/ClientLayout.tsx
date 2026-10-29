"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import LogoutButton from "./LogoutButton";
import FloatingChat from "./FloatingChat";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      const cached = localStorage.getItem("user");
      if (cached) {
        const u = JSON.parse(cached);
        if (u?.role === "admin") {
          setIsAdmin(true);
        }
      }
    } catch {
      // ignore
    }
  }, [pathname]);

  // กำหนดหน้าเว็บที่ไม่ต้องการให้แสดงแถบเมนู
  const hideLayoutPages = ["/login", "/register"];
  
  // เช็คว่าหน้าปัจจุบันอยู่ใน hideLayoutPages หรือ "ขึ้นต้นด้วย /admin" หรือไม่
  const shouldHideLayout = hideLayoutPages.includes(pathname) || pathname.startsWith("/admin");

  // เน้นสีเขียวให้เมนูที่กำลังเปิดอยู่ (sidebar)
  const navClass = (href: string) =>
    `p-3 rounded-2xl transition font-semibold text-sm flex items-center gap-3 group ${
      pathname === href
        ? "bg-emerald-100 text-emerald-900 shadow-sm"
        : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
    }`;

  // เน้นสีเขียวให้เมนูที่กำลังเปิดอยู่ (bottom nav)
  const bottomNavClass = (href: string) =>
    `flex flex-col items-center p-2 transition font-bold ${
      pathname === href ? "text-emerald-800" : "text-slate-600 hover:text-emerald-700"
    }`;

  // ถ้าเป็นหน้า Login, Register หรือ Admin ให้แสดงแค่เนื้อหาเพียวๆ ไม่เอาเมนู
  if (shouldHideLayout) {
    return <main className="flex-1 w-full h-full overflow-y-auto">{children}</main>;
  }

  return (
    <>
      {/* 📱 ส่วนบนสุด (Top Bar) - แสดงเฉพาะบนมือถือ */}
      <header className="md:hidden bg-white shadow-sm px-6 py-4 flex justify-between items-center z-20 border-b border-slate-100">
        <div className="text-xl font-black text-emerald-700 flex items-center gap-2">
          ♻️ RecycleSmart
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link
              href="/admin"
              className="bg-purple-100 text-purple-800 border border-purple-200 text-xs px-2.5 py-1 rounded-full font-bold"
            >
              🛡️ Admin
            </Link>
          )}
          <Link
            href="/profile"
            className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center text-lg shadow-sm border border-emerald-300"
          >
            🧑‍🎓
          </Link>
        </div>
      </header>

      {/* 💻 เมนูด้านข้าง (Sidebar) - ซ่อนบนมือถือ */}
      <aside className="hidden md:flex w-64 bg-white shadow-[4px_0_24px_rgba(0,0,0,0.03)] border-r border-slate-200/70 flex-col p-6 z-20">
        <div className="text-2xl font-black text-emerald-700 mb-8 flex items-center gap-2">
          ♻️ RecycleSmart
        </div>
        
        <nav className="flex flex-col gap-2 flex-1 overflow-y-auto custom-scrollbar pr-1">
          <Link href="/" className={navClass("/")}>
            <span className="text-xl group-hover:scale-110 transition-transform">🏠</span> หน้าหลัก
          </Link>
          <Link href="/upload" className={navClass("/upload")}>
            <span className="text-xl group-hover:scale-110 transition-transform">📷</span> สแกนขยะ
          </Link>
          <Link href="/chat" className={navClass("/chat")}>
            <span className="text-xl group-hover:scale-110 transition-transform">💬</span> แชทผู้ช่วย
          </Link>
          <Link href="/map" className={navClass("/map")}>
            <span className="text-xl group-hover:scale-110 transition-transform">📍</span> แผนที่จุดทิ้ง
          </Link>
          <Link href="/history" className={navClass("/history")}>
            <span className="text-xl group-hover:scale-110 transition-transform">📜</span> ประวัติ
          </Link>
          <Link href="/rewards" className={navClass("/rewards")}>
            <span className="text-xl group-hover:scale-110 transition-transform">🎁</span> ของรางวัล
          </Link>
          <Link href="/game" className={navClass("/game")}>
            <span className="text-xl group-hover:scale-110 transition-transform">🎮</span> มินิเกมแยกขยะ
          </Link>
          <Link href="/profile" className={navClass("/profile")}>
            <span className="text-xl group-hover:scale-110 transition-transform">👤</span> โปรไฟล์
          </Link>
          <Link href="/guide" className={navClass("/guide")}>
            <span className="text-xl group-hover:scale-110 transition-transform">📖</span> คู่มือแยกขยะ
          </Link>

          {isAdmin && (
            <div className="pt-2 mt-2 border-t border-slate-100">
              <Link
                href="/admin"
                className="p-3 rounded-2xl transition font-bold text-sm flex items-center gap-3 bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100/80 shadow-xs"
              >
                <span className="text-xl">🛡️</span> แดชบอร์ดแอดมิน
              </Link>
            </div>
          )}
        </nav>
        
        <LogoutButton />
      </aside>

      {/* พื้นที่แสดงเนื้อหาหลัก */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8 scroll-smooth">
        {children}
      </main>

      {/* 🌟 Floating Chatbot ประจำมุมขวาล่าง */}
      <FloatingChat />
      
      {/* 📱 แถบเมนูด้านล่าง (Bottom Navigation) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 flex justify-around items-center p-2 z-30 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] pb-safe">
        <Link href="/" className={bottomNavClass("/")}>
          <span className="text-2xl mb-0.5">🏠</span>
          <span className="text-[11px] font-bold">หน้าหลัก</span>
        </Link>
        <Link href="/map" className={bottomNavClass("/map")}>
          <span className="text-2xl mb-0.5">📍</span>
          <span className="text-[11px] font-bold">แผนที่</span>
        </Link>
        <Link href="/chat" className={bottomNavClass("/chat")}>
          <span className="text-2xl mb-0.5">💬</span>
          <span className="text-[11px] font-bold">แชท</span>
        </Link>
        <Link href="/upload" className="flex flex-col items-center justify-center w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg shadow-emerald-600/30 -mt-6 hover:bg-emerald-700 hover:scale-105 transition-all">
          <span className="text-2xl">📷</span>
        </Link>
        <Link href="/history" className={bottomNavClass("/history")}>
          <span className="text-2xl mb-0.5">📜</span>
          <span className="text-[11px] font-bold">ประวัติ</span>
        </Link>
        <Link href="/rewards" className={bottomNavClass("/rewards")}>
          <span className="text-2xl mb-0.5">🎁</span>
          <span className="text-[11px] font-bold">รางวัล</span>
        </Link>
        <Link href="/profile" className={bottomNavClass("/profile")}>
          <span className="text-2xl mb-0.5">👤</span>
          <span className="text-[11px] font-bold">โปรไฟล์</span>
        </Link>
      </nav>
    </>
  );
}
