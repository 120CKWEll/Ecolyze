"use client";
import React, { useState } from "react";
import Link from "next/link";
import DragDropGame from "./components/DragDropGame";
import SkyCatcherGame from "./components/SkyCatcherGame";

export default function GameHubPage() {
  const [activeTab, setActiveTab] = useState<"dragdrop" | "catcher">("dragdrop");

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 animate-fade-in pb-20">
      {/* Header Banner */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs font-black px-3.5 py-1.5 rounded-full mb-2 shadow-2xs">
          <span>🎮</span>
          <span>Ecolyze Mini-Games Arcade</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
          มินิเกมแยกขยะสะสมแต้ม
        </h1>
        <p className="text-slate-600 font-medium text-sm md:text-base mt-1.5 max-w-xl mx-auto">
          ทดสอบความจำและความไวในการแยกขยะ 4 สี สนุกพร้อมรับเกร็ดความรู้สิ่งแวดล้อม และสะสมแต้ม Eco-Points แลกรางวัล
        </p>
      </div>

      {/* Game Mode Tab Switcher */}
      <div className="flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200/90 max-w-md mx-auto mb-6 shadow-inner">
        <button
          onClick={() => setActiveTab("dragdrop")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-xs md:text-sm transition-all ${
            activeTab === "dragdrop"
              ? "bg-white text-emerald-700 shadow-md scale-[1.02]"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <span className="text-lg">🎯</span>
          <span>ลากขยะลงถัง 4 สี</span>
          <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded font-extrabold uppercase">
            ใหม่
          </span>
        </button>

        <button
          onClick={() => setActiveTab("catcher")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-xs md:text-sm transition-all ${
            activeTab === "catcher"
              ? "bg-white text-emerald-700 shadow-md scale-[1.02]"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <span className="text-lg">🛸</span>
          <span>รับขยะตกจากฟ้า</span>
        </button>
      </div>

      {/* Active Game Section */}
      <div className="mb-8">
        {activeTab === "dragdrop" ? <DragDropGame /> : <SkyCatcherGame />}
      </div>

      {/* Educational Guide Footer Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 md:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">📖</span>
            <h3 className="font-black text-slate-900 text-base md:text-lg">
              คู่มือจำแนกถังขยะ 4 สีแบบย่อ
            </h3>
          </div>
          <Link
            href="/guide"
            className="text-emerald-600 hover:text-emerald-700 text-xs font-bold flex items-center gap-1 group"
          >
            <span>ดูคู่มือฉบับเต็ม</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3 text-xs">
            <div className="flex items-center gap-1.5 font-black text-amber-900 mb-1">
              <span>🟡</span>
              <span>ถังสีเหลือง (รีไซเคิล)</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              ขวดพลาสติก PET, กระป๋องอะลูมิเนียม, กล่องกระดาษ, ขวดแก้ว (ล้างให้สะอาดก่อนทิ้ง)
            </p>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3 text-xs">
            <div className="flex items-center gap-1.5 font-black text-emerald-900 mb-1">
              <span>🟢</span>
              <span>ถังสีเขียว (ขยะเปียก)</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              เศษอาหาร, ผักผลไม้, เปลือกไข่, กากกาแฟ, เศษใบไม้ (นำไปทำปุ๋ยหมักชีวภาพ)
            </p>
          </div>

          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-3 text-xs">
            <div className="flex items-center gap-1.5 font-black text-blue-900 mb-1">
              <span>🔵</span>
              <span>ถังสีน้ำเงิน (ขยะทั่วไป)</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              กล่องโฟมเปื้อนอาหาร, ซองขนมฟอยล์, ทิชชู่ใช้แล้ว, ถุงเปื้อนมัน (ย่อยยาก รีไซเคิลไม่ได้)
            </p>
          </div>

          <div className="bg-red-50/70 border border-red-200 rounded-2xl p-3 text-xs">
            <div className="flex items-center gap-1.5 font-black text-red-900 mb-1">
              <span>🔴</span>
              <span>ถังสีแดง (ขยะอันตราย)</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              ถ่านไฟฉาย, หลอดไฟ, กระป๋องสเปรย์, แผงยาหมดอายุ, แบตเตอรี่ (ห้ามทิ้งปนเด็ดขาด)
            </p>
          </div>
        </div>

        {/* Quick Link to Rewards */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span>🎁</span>
            <span>เล่นเกมสะสมแต้มแล้ว นำไปแลกรับคูปองส่วนลดและของรางวัลรักษ์โลกได้เลย!</span>
          </div>
          <Link
            href="/rewards"
            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold px-3.5 py-1.5 rounded-xl border border-emerald-200 transition"
          >
            ไปหน้ารางวัล ➜
          </Link>
        </div>
      </div>
    </div>
  );
}
