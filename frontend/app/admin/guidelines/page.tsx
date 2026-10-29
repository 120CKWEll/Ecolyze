"use client";
import React, { useState } from "react";

interface Guideline {
  id: number;
  category: "ทั่วไป" | "รีไซเคิล" | "เปียก" | "อันตราย";
  binTitle: string;
  points: number;
  badgeColor: string;
  examples: string[];
  tips: string;
}

export default function AdminGuidelinesPage() {
  const [guidelines] = useState<Guideline[]>([
    {
      id: 1,
      category: "ทั่วไป",
      binTitle: "ขยะทั่วไป (ถังสีน้ำเงิน)",
      points: 2,
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      examples: ["ซองขนมขบเคี้ยวฟอยล์", "ถุงพลาสติกเปื้อนแกง", "กระดาษทิชชู่ใช้แล้ว", "กล่องโฟมเปื้อนอาหาร"],
      tips: "ขยะที่ย่อยสลายยากและไม่คุ้มค่าต่อการรีไซเคิล",
    },
    {
      id: 2,
      category: "รีไซเคิล",
      binTitle: "ขยะรีไซเคิล (ถังสีเหลือง)",
      points: 5,
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      examples: ["ขวดพลาสติก PET ใส", "กระป๋องอะลูมิเนียม", "ขวดแก้ว", "กระดาษและกล่องลัง"],
      tips: "เทของเหลวออกให้หมด บีบให้แบนเพื่อประหยัดพื้นที่",
    },
    {
      id: 3,
      category: "เปียก",
      binTitle: "ขยะเปียก / อินทรีย์ (ถังสีเขียว)",
      points: 2,
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      examples: ["เศษอาหาร", "เปลือกผลไม้", "กากกาแฟ", "เศษใบไม้และผัก"],
      tips: "รินน้ำแกงออกก่อนทิ้ง นำไปหมักทำปุ๋ยชีวภาพได้",
    },
    {
      id: 4,
      category: "อันตราย",
      binTitle: "ขยะอันตราย / E-Waste (ถังสีแดง/ส้ม)",
      points: 10,
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
      examples: ["ถ่านไฟฉาย แบตเตอรี่", "หลอดไฟฟลูออเรสเซนต์", "กระป๋องสเปรย์", "ขวดยาหมดอายุ"],
      tips: "แยกใส่ถุงมิดชิด ห้ามทิ้งรวมกับขยะประเภทอื่นเด็ดขาด",
    },
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <span>📘</span> ฐานความรู้ & คู่มือแยกขยะ 4 หมวดหมู่
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            มาตรฐานกรมควบคุมมลพิษ และเกณฑ์การให้คะแนนสำหรับโมเดล Google Gemini AI
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guidelines.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="text-lg font-bold text-slate-900">{item.binTitle}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${item.badgeColor}`}>
                  +{item.points} แต้ม/ชิ้น
                </span>
              </div>

              <div className="mb-4">
                <p className="text-xs font-bold text-slate-500 mb-2">ตัวอย่างขยะในหมวดนี้:</p>
                <div className="flex flex-wrap gap-2">
                  {item.examples.map((ex, i) => (
                    <span
                      key={i}
                      className="bg-slate-100 text-slate-700 px-3 py-1 rounded-xl text-xs font-medium border border-slate-200"
                    >
                      • {ex}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900">
                <span className="font-bold text-emerald-700">💡 เคล็ดลับการจัดการ:</span> {item.tips}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
              <span>สถานะ AI System Prompt:</span>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                ✓ Active in Gemini 2.5
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}