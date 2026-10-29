"use client";
import React, { useState, useEffect } from "react";

// 1. ฐานข้อมูลจำลองสำหรับของรางวัล
const rewardItems = [
  { id: 1, name: "คูปองส่วนลดศูนย์อาหาร Complex 20 บาท", cost: 200, icon: "🍜", bgColor: "bg-orange-50", textColor: "text-orange-700", border: "border-orange-200" },
  { id: 2, name: "ส่วนลดร้านกาแฟสมุด 10 บาท", cost: 150, icon: "☕", bgColor: "bg-amber-50", textColor: "text-amber-800", border: "border-amber-200" },
  { id: 3, name: "กระเป๋าผ้ารักษ์โลก RecycleSmart", cost: 500, icon: "🛍️", bgColor: "bg-emerald-50", textColor: "text-emerald-800", border: "border-emerald-200" },
  { id: 4, name: "กระติกน้ำสแตนเลส (KKU Zero Waste)", cost: 1000, icon: "💧", bgColor: "bg-blue-50", textColor: "text-blue-800", border: "border-blue-200" },
];

export default function RewardsPage() {
  const [points, setPoints] = useState<number>(0);

  useEffect(() => {
    try {
      const cached = localStorage.getItem("user");
      if (cached) {
        const u = JSON.parse(cached);
        if (typeof u?.score === "number") setPoints(u.score);
      }
    } catch {
      // ignore
    }

    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.json())
        .then((data) => {
          if (typeof data?.score === "number") setPoints(data.score);
        })
        .catch(() => {});
    }
  }, []);

  // ลอจิกคำนวณระดับสมาชิก (Tier)
  const getTierInfo = (currentPoints: number) => {
    if (currentPoints >= 1000) return { name: "🥇 Gold", max: 2000, color: "bg-yellow-400" };
    if (currentPoints >= 500) return { name: "🥈 Silver", max: 1000, color: "bg-slate-300" };
    return { name: "🥉 Bronze", max: 500, color: "bg-amber-600" };
  };

  const tier = getTierInfo(points);
  const progressPercent = Math.min((points / tier.max) * 100, 100);

  const handleRedeem = (rewardName: string, cost: number) => {
    if (points >= cost) {
      const newPts = points - cost;
      setPoints(newPts);
      try {
        const cached = localStorage.getItem("user");
        if (cached) {
          const u = JSON.parse(cached);
          u.score = newPts;
          localStorage.setItem("user", JSON.stringify(u));
        }
      } catch {
        // ignore
      }
      alert(`🎉 แลกรางวัลสำเร็จ!\nคุณได้รับ: ${rewardName}\nคะแนนคงเหลือ: ${newPts} แต้ม`);
    } else {
      const diff = cost - points;
      alert(`❌ คะแนนไม่เพียงพอครับ\nคุณต้องสะสมเพิ่มอีก ${diff} แต้ม เพื่อแลก ${rewardName}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 animate-fade-in pb-10">
      
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-emerald-800 mb-3 tracking-tight">🎁 แลกของรางวัล</h1>
        <p className="text-slate-600 font-medium text-base md:text-lg">
          เปลี่ยนการแยกขยะของคุณให้เป็นของรางวัลสุดพิเศษ
        </p>
      </div>

      {/* Section 1: การ์ดแสดงสถานะคะแนน (Score Board) */}
      <div className="bg-gradient-to-br from-emerald-800 to-teal-950 rounded-[2rem] p-6 md:p-8 shadow-xl text-white mb-12 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div className="text-center md:text-left">
            <p className="text-emerald-200 font-bold mb-1">คะแนนสะสมปัจจุบันของคุณ</p>
            <div className="flex items-baseline gap-2 justify-center md:justify-start">
              <span className="text-5xl md:text-6xl font-black text-yellow-300 drop-shadow-md">{points}</span>
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
            <div className="w-full bg-black/30 rounded-full h-3 mb-1 overflow-hidden">
              <div 
                className={`${tier.color} h-3 rounded-full transition-all duration-500 ease-out`} 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <p className="text-xs text-emerald-200 text-right mt-2 font-medium">
              สะสมอีก {tier.max - points > 0 ? tier.max - points : 0} แต้มเพื่อเลื่อนขั้น
            </p>
          </div>

        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Section 2: รายการของรางวัล (Rewards List) */}
      <h3 className="text-2xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
        <span>🛍️</span> ของรางวัลที่เปิดให้แลก
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {rewardItems.map((item) => (
          <div key={item.id} className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 flex flex-col hover:shadow-md transition group">
            
            <div className="flex items-start gap-4 mb-6">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 ${item.bgColor} border ${item.border}`}>
                {item.icon}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-lg leading-snug mb-2">{item.name}</h4>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold ${item.bgColor} ${item.textColor} border ${item.border}`}>
                  ใช้ {item.cost} แต้ม
                </span>
              </div>
            </div>

            <button
              onClick={() => handleRedeem(item.name, item.cost)}
              disabled={points < item.cost}
              className={`mt-auto w-full py-3.5 rounded-2xl font-bold transition-all active:scale-95 ${
                points >= item.cost 
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20" 
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
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