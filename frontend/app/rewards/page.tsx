"use client";
import React, { useState } from "react";

// 1. ฐานข้อมูลจำลองสำหรับของรางวัล
const rewardItems = [
  { id: 1, name: "คูปองส่วนลดศูนย์อาหาร Complex 20 บาท", cost: 200, icon: "🍜", bgColor: "bg-orange-50", textColor: "text-orange-600" },
  { id: 2, name: "ส่วนลดร้านกาแฟสมุด 10 บาท", cost: 150, icon: "☕", bgColor: "bg-amber-50", textColor: "text-amber-700" },
  { id: 3, name: "กระเป๋าผ้ารักษ์โลก RecycleSmart", cost: 500, icon: "🛍️", bgColor: "bg-emerald-50", textColor: "text-emerald-700" },
  { id: 4, name: "กระติกน้ำสแตนเลส (KKU Zero Waste)", cost: 1000, icon: "💧", bgColor: "bg-blue-50", textColor: "text-blue-700" },
];

export default function RewardsPage() {
  // 2. จัดการสถานะคะแนนของผู้ใช้งาน (สมมติว่าดึงมาจาก Database มีอยู่ 450 แต้ม)
  const [points, setPoints] = useState<number>(450);

  // 3. ลอจิกคำนวณระดับสมาชิก (Tier)
  const getTierInfo = (currentPoints: number) => {
    if (currentPoints >= 1000) return { name: "🥇 Gold", max: 2000, color: "bg-yellow-400" };
    if (currentPoints >= 500) return { name: "🥈 Silver", max: 1000, color: "bg-gray-400" };
    return { name: "🥉 Bronze", max: 500, color: "bg-amber-600" };
  };

  const tier = getTierInfo(points);
  const progressPercent = Math.min((points / tier.max) * 100, 100);

  // 4. ฟังก์ชันจัดการการแลกรางวัล (อิงตาม Activity Diagram)
  const handleRedeem = (rewardName: string, cost: number) => {
    // ก. ตรวจสอบคะแนนสะสมเพียงพอหรือไม่
    if (points >= cost) {
      // ข. คะแนนเพียงพอ: อัปเดตคะแนนใหม่ (หักลบ)
      setPoints((prev) => prev - cost);
      
      // ค. บันทึกข้อมูลการแลก & รับข้อความแจ้งเตือนสำเร็จ
      alert(`🎉 แลกรางวัลสำเร็จ!\nคุณได้รับ: ${rewardName}\nคะแนนคงเหลือ: ${points - cost} แต้ม`);
    } else {
      // ง. คะแนนไม่เพียงพอ: รับข้อความแจ้งเตือนไม่สำเร็จ
      const diff = cost - points;
      alert(`❌ คะแนนไม่เพียงพอครับ\nคุณต้องสะสมเพิ่มอีก ${diff} แต้ม เพื่อแลก ${rewardName}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in pb-10">
      
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-emerald-700 mb-3 tracking-tight">🎁 แลกของรางวัล</h1>
        <p className="text-gray-500 font-medium text-lg">
          เปลี่ยนการแยกขยะของคุณให้เป็นของรางวัลสุดพิเศษ
        </p>
      </div>

      {/* 🌟 Section 1: การ์ดแสดงสถานะคะแนน (Score Board) */}
      <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 rounded-[2rem] p-8 shadow-xl text-white mb-12 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div className="text-center md:text-left">
            <p className="text-emerald-200 font-bold mb-1">คะแนนสะสมปัจจุบันของคุณ</p>
            <div className="flex items-baseline gap-2 justify-center md:justify-start">
              <span className="text-6xl font-black text-yellow-300 drop-shadow-md">{points}</span>
              <span className="text-xl font-bold">แต้ม</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl w-full md:w-1/2">
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-xs text-emerald-200 font-bold uppercase tracking-wider mb-1">ระดับสมาชิก</p>
                <p className="text-xl font-black">{tier.name}</p>
              </div>
              <p className="text-sm font-bold text-emerald-100">{points} / {tier.max}</p>
            </div>
            
            {/* หลอด Progress Bar */}
            <div className="w-full bg-black/20 rounded-full h-3 mb-1 overflow-hidden">
              <div 
                className={`${tier.color} h-3 rounded-full transition-all duration-500 ease-out`} 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <p className="text-xs text-emerald-200 text-right mt-2">
              สะสมอีก {tier.max - points > 0 ? tier.max - points : 0} แต้มเพื่อเลื่อนขั้น
            </p>
          </div>

        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* 🌟 Section 2: รายการของรางวัล (Rewards List) */}
      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <span>🛍️</span> ของรางวัลที่เปิดให้แลก
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {rewardItems.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-lg transition-shadow">
            
            <div className="flex items-start gap-4 mb-6">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 ${item.bgColor}`}>
                {item.icon}
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-lg leading-tight mb-2">{item.name}</h4>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${item.bgColor} ${item.textColor}`}>
                  ใช้ {item.cost} แต้ม
                </span>
              </div>
            </div>

            <button
              onClick={() => handleRedeem(item.name, item.cost)}
              className={`mt-auto w-full py-3 rounded-xl font-bold transition-all active:scale-95 ${
                points >= item.cost 
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-200" 
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {points >= item.cost ? "แลกของรางวัล" : "คะแนนไม่พอ"}
            </button>

          </div>
        ))}
      </div>

    </div>
  );
}