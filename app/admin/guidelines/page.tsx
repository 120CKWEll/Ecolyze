"use client";
import React, { useState } from "react";

export default function AdminGuidelinesPage() {
  const [guidelines, setGuidelines] = useState([
    { id: 1, type: "ขยะรีไซเคิล", color: "bg-yellow-100 text-yellow-700", binColor: "สีเหลือง", desc: "ขยะที่สามารถนำไปแปรรูปใช้ใหม่ได้" },
    { id: 2, type: "ขยะเปียก", color: "bg-emerald-100 text-emerald-700", binColor: "สีเขียว", desc: "ขยะย่อยสลายได้ เช่น เศษอาหาร" },
    { id: 3, type: "ขยะอันตราย", color: "bg-red-100 text-red-700", binColor: "สีแดง", desc: "ขยะที่มีสารพิษปนเปื้อน ต้องแยกทิ้งระมัดระวัง" },
  ]);

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📘 คำแนะนำการแยกขยะ</h1>
          <p className="text-gray-500 text-sm mt-1">จัดการเนื้อหาคู่มือเพื่อให้ AI นำไปแนะนำผู้ใช้</p>
        </div>
        <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors">
          ➕ เพิ่มประเภทใหม่
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {guidelines.map((guide) => (
          <div key={guide.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${guide.color}`}>
                {guide.type}
              </span>
              <button className="text-gray-400 hover:text-blue-500 transition-colors text-sm font-bold">
                ✏️ แก้ไข
              </button>
            </div>
            <h3 className="font-bold text-gray-800 mb-2">ทิ้งในถัง: {guide.binColor}</h3>
            <p className="text-sm text-gray-500 flex-1">{guide.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}