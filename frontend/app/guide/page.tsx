"use client";
import React from "react";

// อัปเดตข้อมูลคู่มือเพื่อเพิ่มพร็อพเพอร์ตี้ iconUrl
const binGuides = [
  {
    id: "recycle",
    name: "ขยะรีไซเคิล (ถังสีเหลือง)",
    color: "bg-yellow-400", // สี CSS เดิมยังเก็บไว้เพื่อใช้อ้างอิง
    bgLight: "bg-yellow-50",
    borderColor: "border-yellow-200",
    textColor: "text-yellow-800",
    // 🌟 เพิ่มพร็อพเพอร์ตี้ iconUrl ชี้ไปยังไฟล์ภาพจริงในโฟลเดอร์ public
    iconUrl: "/icons/bin-yellow.jpg", 
    desc: "ขยะที่สามารถนำไปผ่านกระบวนการแปรรูป เพื่อนำกลับมาใช้ใหม่ได้ ช่วยลดปริมาณขยะและประหยัดทรัพยากรธรรมชาติ",
    examples: [
      "ขวดพลาสติกใส (PET)",
      "กระดาษ ลัง หนังสือพิมพ์",
      "ขวดแก้ว กระจก",
      "กระป๋องอะลูมิเนียม"
    ],
    tip: "เทน้ำและน้ำแข็งออกให้หมด ล้างคราบสกปรกคร่าวๆ และบีบขวดให้แบนเพื่อลดพื้นที่ในถัง"
  },
  {
    id: "organic",
    name: "ขยะอินทรีย์/ขยะเปียก (ถังสีเขียว)",
    color: "bg-emerald-500",
    bgLight: "bg-emerald-50",
    borderColor: "border-emerald-200",
    textColor: "text-emerald-800",
    iconUrl: "/icons/bin-green.jpg",
    desc: "ขยะอินทรีย์ที่เน่าเสียและย่อยสลายได้เร็ว สามารถนำไปทำปุ๋ยหมัก หรือทำน้ำหมักชีวภาพได้",
    examples: [
      "เศษอาหาร ข้าว แกง",
      "เปลือกผลไม้ เศษผัก",
      "เศษใบไม้ หญ้า",
      "เนื้อสัตว์ กระดูกอ่อน"
    ],
    tip: "ควรกองน้ำซุปหรือน้ำแกงออกให้เหลือแต่เศษอาหาร และห้ามทิ้งปนกับถุงพลาสติกเด็ดขาด"
  },
  {
    id: "general",
    name: "ขยะทั่วไป (ถังสีน้ำเงิน)",
    color: "bg-blue-500",
    bgLight: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-800",
    iconUrl: "/icons/bin-blue.jpg",
    desc: "ขยะที่ย่อยสลายยากและไม่คุ้มค่าต่อการนำไปรีไซเคิล ต้องนำไปกำจัดอย่างถูกวิธี (ฝังกลบ/เผา)",
    examples: [
      "ถุงพลาสติกเปื้อนอาหาร",
      "กล่องโฟม ซองขนม",
      "เศษผ้า ทิชชู่ใช้แล้ว",
      "หลอดพลาสติก"
    ],
    tip: "มัดปากถุงขยะให้มิดชิดก่อนทิ้ง เพื่อป้องกันกลิ่นเหม็นและแมลงพาหะนำโรค"
  },
  {
    id: "hazardous",
    name: "ขยะอันตราย (ถังสีแดง)",
    color: "bg-red-500",
    bgLight: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-800",
    iconUrl: "/icons/bin-red.jpg",
    desc: "ขยะที่มีสารปนเปื้อน วัตถุไวไฟ หรือมีพิษต่อสิ่งแวดล้อมและสิ่งมีชีวิต ต้องแยกทิ้งอย่างระมัดระวัง",
    examples: [
      "ถ่านไฟฉาย แบตเตอรี่",
      "หลอดไฟกระป๋องสเปรย์",
      "ขวดยาฆ่าแมลง",
      "ขยะอิเล็กทรอนิกส์"
    ],
    tip: "ควรใส่ถุงพลาสติกมัดปากถุงให้แน่น ระวังอย่าให้หลอดไฟแตก และห้ามทิ้งปนกับขยะประเภทอื่น"
  }
];

export default function GuidePage() {
  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-emerald-700 mb-4 tracking-tight">📖 คู่มือการคัดแยกขยะ</h1>
        <p className="text-gray-500 font-medium text-lg max-w-2xl mx-auto">
          อ้างอิงตามมาตรฐานกรมควบคุมมลพิษ รู้จักประเภทของถังขยะ และวิธีเตรียมขยะก่อนทิ้งอย่างถูกต้อง เพื่อการรีไซเคิลที่มีประสิทธิภาพสูงสุด
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {binGuides.map((bin) => (
          <div key={bin.id} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300 group">
            
            {/* โซนด้านบน: รูปภาพถังขยะ */}
            <div className={`p-8 flex flex-col items-center justify-center ${bin.bgLight} border-b border-dashed ${bin.borderColor} relative overflow-hidden min-h-[260px]`}>
              
              {/* 🌟 แทนที่ CSS ถังขยะจำลองเดิมด้วยแท็ก <img> เพื่อแสดงสัญลักษณ์สีจริง */}
              <img 
                src={bin.iconUrl} 
                alt={bin.name} 
                // กำหนดขนาดด้วย Tailwind: กว้าง 20 (w-20), สูง 28 (h-28) ปรับได้ตามความเหมาะสม
                className="w-20 h-28 object-contain drop-shadow-xl z-10 group-hover:-translate-y-2 transition-transform duration-300"
              />

              <h2 className={`mt-6 text-2xl font-black tracking-tight ${bin.textColor} text-center z-10`}>
                {bin.name}
              </h2>

              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/30 rounded-full blur-2xl"></div>
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/20 rounded-full blur-xl"></div>
            </div>

            {/* โซนด้านล่าง: คำอธิบายและ List ขยะ */}
            <div className="p-8 flex flex-col flex-1 justify-between">
              <p className="text-gray-600 font-medium mb-6 text-sm leading-relaxed">
                {bin.desc}
              </p>

              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 mt-auto mb-4">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm">
                  <span className="text-lg">📋</span> ตัวอย่างขยะในหมวดนี้:
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-2">
                  {bin.examples.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-600 text-xs font-medium leading-relaxed">
                      <span className="text-emerald-500 mt-0.5">✔️</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* ส่วนทริคการเตรียมขยะก่อนทิ้ง */}
              <div className={`p-4 rounded-xl text-xs font-medium leading-relaxed flex items-start gap-3 border ${bin.bgLight} ${bin.borderColor} ${bin.textColor}`}>
                <span className="text-lg">💡</span>
                <p><strong>ก่อนทิ้ง:</strong> {bin.tip}</p>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Section เพิ่มเติม: ขยะเจ้าปัญหาที่คนมักทิ้งผิด */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-[2rem] p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span>🤔</span> ขยะเจ้าปัญหา... ตกลงต้องทิ้งถังไหน?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-sm border border-white/10">
              <h4 className="font-bold text-yellow-300 mb-2">กล่องข้าวพลาสติกเปื้อนอาหาร</h4>
              <p className="text-sm text-gray-300 leading-relaxed">หากล้างคราบมันออกได้หมด ให้ทิ้ง <span className="text-yellow-400 font-bold">ถังสีเหลือง (รีไซเคิล)</span> แต่ถ้าเปื้อนมากและล้างไม่ออก ต้องทิ้ง <span className="text-blue-300 font-bold">ถังสีน้ำเงิน (ทั่วไป)</span></p>
            </div>
            <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-sm border border-white/10">
              <h4 className="font-bold text-yellow-300 mb-2">กระดาษทิชชู่ / กล่องโฟม</h4>
              <p className="text-sm text-gray-300 leading-relaxed">ไม่สามารถนำไปรีไซเคิลได้ ไม่ว่ากรณีใดๆ ให้ทิ้งลง <span className="text-blue-300 font-bold">ถังสีน้ำเงิน (ทั่วไป)</span> เท่านั้น</p>
            </div>
            <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-sm border border-white/10">
              <h4 className="font-bold text-yellow-300 mb-2">แก้วกาแฟกระดาษ</h4>
              <p className="text-sm text-gray-300 leading-relaxed">ด้านในมีการเคลือบฟิล์มพลาสติกกันน้ำ ทำให้รีไซเคิลยากมากในไทย ปัจจุบันส่วนใหญ่จึงต้องทิ้ง <span className="text-blue-300 font-bold">ถังสีน้ำเงิน (ทั่วไป)</span></p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"></div>
      </div>

    </div>
  );
}