"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [username, setUsername] = useState<string>("ผู้ใช้งาน");
  const [score, setScore] = useState<number>(0);
  const [scanCount, setScanCount] = useState<number>(0);

  // โหลดข้อมูลแบบรวดเร็ว: ดึงจาก Cache ทันทีแล้ว fetch อัปเดตพร้อมกันใน Background
  useEffect(() => {
    // 1. อ่านจาก Cache ก่อนทันทีเพื่อไม่ให้หน้าจอรอโหลด (Instant UI)
    try {
      const cachedUser = localStorage.getItem("user");
      if (cachedUser) {
        const parsed = JSON.parse(cachedUser);
        if (parsed?.username) setUsername(parsed.username);
        if (typeof parsed?.score === "number") setScore(parsed.score);
      }
    } catch {
      // ignore
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    // 2. ยิง API แบบคู่ขนาน (Parallel Requests) แทนการรอทีละตัว เพื่อความเร็วสูงสุด
    Promise.allSettled([
      fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/history", { headers: { Authorization: `Bearer ${token}` } }),
    ]).then(async ([profileRes, historyRes]) => {
      if (profileRes.status === "fulfilled" && profileRes.value.ok) {
        try {
          const user = await profileRes.value.json();
          setUsername(user.username || "ผู้ใช้งาน");
          setScore(user.score || 0);
          localStorage.setItem("user", JSON.stringify(user));
        } catch {
          // ignore
        }
      }

      if (historyRes.status === "fulfilled" && historyRes.value.ok) {
        try {
          const historyData = await historyRes.value.json();
          if (Array.isArray(historyData)) {
            setScanCount(historyData.length);
          }
        } catch {
          // ignore
        }
      }
    });
  }, []);

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* ส่วนหัวข้อต้อนรับ */}
      <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
        สวัสดี, <span className="text-emerald-700">{username}</span> 👋
      </h1>
      <p className="text-slate-600 mb-8 font-medium text-base md:text-lg">
        ยินดีต้อนรับสู่ระบบแยกขยะอัจฉริยะ มหาวิทยาลัยขอนแก่น
      </p>

      {/* สถิติ Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200/80 flex items-center justify-between hover:shadow-md transition group">
          <div>
            <h3 className="text-slate-600 font-bold text-sm md:text-base mb-1">คะแนนสะสมของคุณ</h3>
            <p className="text-4xl md:text-5xl font-black text-emerald-600">
              {score} <span className="text-lg font-bold text-emerald-800">แต้ม</span>
            </p>
          </div>
          <div className="text-6xl drop-shadow-sm group-hover:scale-110 transition-transform">🏆</div>
        </div>
        
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200/80 flex items-center justify-between hover:shadow-md transition group">
          <div>
            <h3 className="text-slate-600 font-bold text-sm md:text-base mb-1">ขยะที่คุณสแกน</h3>
            <p className="text-4xl md:text-5xl font-black text-blue-600">
              {scanCount} <span className="text-lg font-bold text-blue-800">ชิ้น</span>
            </p>
          </div>
          <div className="text-6xl drop-shadow-sm group-hover:scale-110 transition-transform">🌍</div>
        </div>
      </div>

      {/* แบนเนอร์เชิญชวนใช้งาน */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[2.5rem] p-8 md:p-10 text-white text-center shadow-lg relative overflow-hidden mb-12">
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">พร้อมช่วยโลกแยกขยะหรือยัง?</h2>
          <p className="mb-8 text-emerald-50 max-w-lg mx-auto font-medium text-base md:text-lg leading-relaxed">
            ถ่ายรูปขยะของคุณ ให้ AI ช่วยวิเคราะห์และบอกวิธีทิ้งที่ถูกต้อง พร้อมสะสมแต้มแลกของรางวัลมากมาย
          </p>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 bg-white text-emerald-800 font-bold text-lg py-4 px-10 rounded-2xl hover:bg-slate-50 hover:-translate-y-1 transition-all shadow-md active:scale-95"
          >
            ✨ เริ่มสแกนขยะเลย
          </Link>
        </div>
        <div className="absolute -top-10 -right-10 text-9xl opacity-15 blur-sm pointer-events-none">♻️</div>
        <div className="absolute -bottom-10 -left-10 text-9xl opacity-15 blur-sm pointer-events-none">🍃</div>
      </div>

      {/* ส่วนคู่มือการแยกขยะ */}
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
          <span>📖</span> คู่มือการคัดแยกขยะเบื้องต้น
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* ขยะทั่วไป (ถังสีน้ำเงิน) */}
          <Link href="/guide" className="block bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 hover:-translate-y-1 transition group">
            <div className="h-24 mb-4 flex items-center justify-center bg-blue-50 rounded-2xl">
              <img src="/icons/bin-blue.jpg" alt="ขยะทั่วไป (ถังสีน้ำเงิน)" className="h-20 object-contain drop-shadow-md group-hover:scale-105 transition-transform" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">ขยะทั่วไป (ถังสีน้ำเงิน)</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              ขยะที่ย่อยสลายยากและไม่คุ้มค่าต่อการนำไปรีไซเคิล เช่น ซองขนม ทิชชู่ กล่องโฟมเปื้อนอาหาร
            </p>
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">+2 แต้ม/ชิ้น</span>
          </Link>

          {/* ขยะรีไซเคิล (ถังสีเหลือง) */}
          <Link href="/guide" className="block bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-yellow-400 hover:-translate-y-1 transition group">
            <div className="h-24 mb-4 flex items-center justify-center bg-yellow-50 rounded-2xl">
              <img src="/icons/bin-yellow.jpg" alt="ขยะรีไซเคิล (ถังสีเหลือง)" className="h-20 object-contain drop-shadow-md group-hover:scale-105 transition-transform" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">ขยะรีไซเคิล (ถังสีเหลือง)</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              ขยะที่นำไปแปรรูปกลับมาใช้ใหม่ได้ เช่น ขวดพลาสติก PET กระป๋องอะลูมิเนียม ขวดแก้ว กระดาษ
            </p>
            <span className="text-xs font-bold text-blue-800 bg-blue-100 px-3 py-1 rounded-full">+5 แต้ม/ชิ้น</span>
          </Link>

          {/* ขยะเปียก (ถังสีเขียว) */}
          <Link href="/guide" className="block bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-300 hover:-translate-y-1 transition group">
            <div className="h-24 mb-4 flex items-center justify-center bg-emerald-50 rounded-2xl">
              <img src="/icons/bin-green.jpg" alt="ขยะเปียก (ถังสีเขียว)" className="h-20 object-contain drop-shadow-md group-hover:scale-105 transition-transform" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">ขยะเปียก (ถังสีเขียว)</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              ขยะอินทรีย์ที่ย่อยสลายได้ตามธรรมชาติ เช่น เศษอาหาร เปลือกผลไม้ กากกาแฟ เศษผัก
            </p>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">+2 แต้ม/ชิ้น</span>
          </Link>

          {/* ขยะอันตราย (ถังสีแดง) */}
          <Link href="/guide" className="block bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-red-300 hover:-translate-y-1 transition group">
            <div className="h-24 mb-4 flex items-center justify-center bg-red-50 rounded-2xl">
              <img src="/icons/bin-red.jpg" alt="ขยะอันตราย (ถังสีแดง)" className="h-20 object-contain drop-shadow-md group-hover:scale-105 transition-transform" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">ขยะอันตราย (ถังสีแดง)</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              ขยะที่มีสารปนเปื้อนหรือเป็นพิษ เช่น ถ่านไฟฉาย หลอดไฟ กระป๋องสเปรย์ อุปกรณ์อิเล็กทรอนิกส์
            </p>
            <span className="text-xs font-bold text-red-800 bg-red-100 px-3 py-1 rounded-full">+10 แต้ม/ชิ้น</span>
          </Link>
        </div>

        {/* ลิงก์ไปหน้าคู่มือฉบับเต็ม */}
        <div className="text-center mt-8">
          <Link href="/guide" className="inline-flex items-center gap-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold px-8 py-3.5 rounded-full transition-all shadow-sm">
            📖 ดูคู่มือการคัดแยกขยะฉบับเต็ม →
          </Link>
        </div>
      </div>
    </div>
  );
}