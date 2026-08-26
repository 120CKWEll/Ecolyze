"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [username, setUsername] = useState<string>("ผู้ใช้งาน");
  const [score, setScore] = useState<number>(0);
  const [scanCount, setScanCount] = useState<number>(0); // 🌟 State สำหรับเก็บจำนวนขยะที่สแกน
  const router = useRouter();

  // ดึงข้อมูลผู้ใช้และจำนวนการสแกนเมื่อเข้าสู่หน้าแรก
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        // ถ้ายังไม่ได้ล็อกอิน ให้ใช้ข้อมูลเริ่มต้น (ไว้โชว์คนที่ยังไม่สมัคร)
        return;
      }

      try {
        // 1. ขอข้อมูลโปรไฟล์ล่าสุด (เพื่อเอาคะแนนอัปเดตสุด)
        const profileRes = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (profileRes.ok) {
          const user = await profileRes.json();
          setUsername(user.username);
          setScore(user.score || 0);
          localStorage.setItem("user", JSON.stringify(user)); // อัปเดตเครื่องไว้ด้วย
        }

        // 🌟 2. ขอข้อมูลประวัติการสแกน เพื่อนำมานับจำนวนชิ้นขยะ
        const historyRes = await fetch("/api/history", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (historyRes.ok) {
          const historyData = await historyRes.json();
          setScanCount(historyData.length); // นับความยาวของ Array ว่าสแกนไปกี่ครั้ง
        }

      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการโหลดข้อมูลหน้าแรก");
      }
    };

    fetchData();
  }, []);

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* 🌟 แสดงชื่อผู้ใช้แบบ Dynamic */}
      <h1 className="text-3xl font-bold mb-2">สวัสดี, <span className="text-emerald-600">{username}</span> 👋</h1>
      <p className="text-gray-500 mb-8 font-medium">ยินดีต้อนรับสู่ระบบแยกขยะอัจฉริยะ มหาวิทยาลัยขอนแก่น</p>

      {/* สถิติ Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-emerald-50 flex items-center justify-between hover:shadow-md transition group">
          <div>
            <h3 className="text-gray-500 font-bold mb-1">คะแนนสะสมของคุณ</h3>
            <p className="text-4xl font-black text-emerald-500">{score} <span className="text-lg font-bold text-emerald-600/70">แต้ม</span></p>
          </div>
          <div className="text-6xl drop-shadow-sm group-hover:scale-110 transition-transform">🏆</div>
        </div>
        
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-emerald-50 flex items-center justify-between hover:shadow-md transition group">
          <div>
            <h3 className="text-gray-500 font-bold mb-1">ขยะที่คุณสแกน</h3>
            {/* 🌟 แสดงจำนวนชิ้นขยะที่สแกนจริงจากฐานข้อมูล */}
            <p className="text-4xl font-black text-blue-500">{scanCount} <span className="text-lg font-bold text-blue-600/70">ชิ้น</span></p>
          </div>
          <div className="text-6xl drop-shadow-sm group-hover:scale-110 transition-transform">🌍</div>
        </div>
      </div>

      {/* แบนเนอร์เชิญชวนใช้งาน */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2.5rem] p-10 text-white text-center shadow-lg relative overflow-hidden mb-12">
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-4 tracking-tight">พร้อมช่วยโลกแยกขยะหรือยัง?</h2>
          <p className="mb-8 text-emerald-50 max-w-lg mx-auto font-medium">
            ถ่ายรูปขยะของคุณ ให้ AI ช่วยวิเคราะห์และบอกวิธีทิ้งที่ถูกต้อง พร้อมสะสมแต้มแลกของรางวัลมากมาย
          </p>
          <Link href="/upload" className="inline-flex items-center gap-2 bg-white text-emerald-600 font-bold text-lg py-4 px-10 rounded-2xl hover:bg-gray-50 hover:-translate-y-1 transition-all shadow-md">
            ✨ เริ่มสแกนขยะเลย
          </Link>
        </div>
        <div className="absolute -top-10 -right-10 text-9xl opacity-10 blur-sm pointer-events-none">♻️</div>
        <div className="absolute -bottom-10 -left-10 text-9xl opacity-10 blur-sm pointer-events-none">🍃</div>
      </div>

      {/* 🌟 เพิ่มส่วนคู่มือการแยกขยะ */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span>📖</span> คู่มือการคัดแยกขยะเบื้องต้น
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* ขยะทั่วไป (ถังสีน้ำเงิน) */}
          <Link href="/guide" className="block bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 hover:-translate-y-1 transition">
            <div className="h-24 mb-4 flex items-center justify-center bg-blue-50 rounded-2xl">
              <img src="/icons/bin-blue.jpg" alt="ขยะทั่วไป (ถังสีน้ำเงิน)" className="h-20 object-contain drop-shadow-md" />
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">ขยะทั่วไป (ถังสีน้ำเงิน)</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-3">
              ขยะที่ย่อยสลายยากและไม่คุ้มค่าต่อการนำไปรีไซเคิล เช่น ถุงขนม ซองพลาสติก กล่องโฟมเปื้อนอาหาร หรือเศษผ้า
            </p>
            <span className="text-xs font-bold text-orange-500 bg-orange-50 px-3 py-1 rounded-full">+2 แต้ม/ชิ้น</span>
          </Link>

          {/* ขยะรีไซเคิล (ถังสีเหลือง) */}
          <Link href="/guide" className="block bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-yellow-200 hover:-translate-y-1 transition">
            <div className="h-24 mb-4 flex items-center justify-center bg-yellow-50 rounded-2xl">
              <img src="/icons/bin-yellow.jpg" alt="ขยะรีไซเคิล (ถังสีเหลือง)" className="h-20 object-contain drop-shadow-md" />
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">ขยะรีไซเคิล (ถังสีเหลือง)</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-3">
              ขยะที่สามารถนำไปแปรรูปกลับมาใช้ใหม่ได้ เช่น ขวดพลาสติก PET กระป๋องอะลูมิเนียม ขวดแก้ว หรือกระดาษลัง
            </p>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">+5 แต้ม/ชิ้น</span>
          </Link>

          {/* ขยะเปียก (ถังสีเขียว) */}
          <Link href="/guide" className="block bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 hover:-translate-y-1 transition">
            <div className="h-24 mb-4 flex items-center justify-center bg-emerald-50 rounded-2xl">
              <img src="/icons/bin-green.jpg" alt="ขยะเปียก (ถังสีเขียว)" className="h-20 object-contain drop-shadow-md" />
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">ขยะเปียก (ถังสีเขียว)</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-3">
              ขยะอินทรีย์ที่ย่อยสลายได้ตามธรรมชาติและมีกลิ่นเหม็น เช่น เศษอาหาร เปลือกผลไม้ หรือเศษใบไม้แห้ง
            </p>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">+2 แต้ม/ชิ้น</span>
          </Link>

          {/* ขยะอันตราย (ถังสีแดง) */}
          <Link href="/guide" className="block bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-red-200 hover:-translate-y-1 transition">
            <div className="h-24 mb-4 flex items-center justify-center bg-red-50 rounded-2xl">
              <img src="/icons/bin-red.jpg" alt="ขยะอันตราย (ถังสีแดง)" className="h-20 object-contain drop-shadow-md" />
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">ขยะอันตราย (ถังสีแดง)</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-3">
              ขยะที่มีสารปนเปื้อนหรือเป็นพิษต่อสิ่งแวดล้อม เช่น ถ่านไฟฉาย หลอดไฟ กระป๋องสเปรย์ หรืออุปกรณ์อิเล็กทรอนิกส์
            </p>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">+10 แต้ม/ชิ้น</span>
          </Link>
        </div>

        {/* ลิงก์ไปหน้าคู่มือฉบับเต็ม */}
        <div className="text-center mt-6">
          <Link href="/guide" className="inline-flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-6 py-3 rounded-full transition-colors">
            📖 ดูคู่มือการคัดแยกขยะฉบับเต็ม →
          </Link>
        </div>
      </div>
      
    </div>
  );
}