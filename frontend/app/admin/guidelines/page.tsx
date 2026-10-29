"use client";
import React, { useState, useEffect } from "react";

interface CategoryItem {
  id: number;
  name_th: string;
  name_en: string;
  color_code: string;
  points_reward: number;
}

interface GuidelineDetail {
  category: string;
  binTitle: string;
  badgeColor: string;
  examples: string[];
  tips: string;
}

const STATIC_GUIDELINE_DETAILS: Record<string, GuidelineDetail> = {
  "ขยะทั่วไป": {
    category: "ทั่วไป",
    binTitle: "ขยะทั่วไป (ถังสีน้ำเงิน)",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    examples: ["ซองขนมขบเคี้ยวฟอยล์", "ถุงพลาสติกเปื้อนแกง", "กระดาษทิชชู่ใช้แล้ว", "กล่องโฟมเปื้อนอาหาร"],
    tips: "ขยะที่ย่อยสลายยากและไม่คุ้มค่าต่อการรีไซเคิล",
  },
  "ขยะรีไซเคิล": {
    category: "รีไซเคิล",
    binTitle: "ขยะรีไซเคิล (ถังสีเหลือง)",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    examples: ["ขวดพลาสติก PET ใส", "กระป๋องอะลูมิเนียม", "ขวดแก้ว", "กระดาษและกล่องลัง"],
    tips: "เทของเหลวออกให้หมด บีบให้แบนเพื่อประหยัดพื้นที่",
  },
  "ขยะเปียก": {
    category: "เปียก",
    binTitle: "ขยะเปียก / อินทรีย์ (ถังสีเขียว)",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    examples: ["เศษอาหาร", "เปลือกผลไม้", "กากกาแฟ", "เศษใบไม้และผัก"],
    tips: "รินน้ำแกงออกก่อนทิ้ง นำไปหมักทำปุ๋ยชีวภาพได้",
  },
  "ขยะอันตราย": {
    category: "อันตราย",
    binTitle: "ขยะอันตราย / E-Waste (ถังสีแดง/ส้ม)",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    examples: ["ถ่านไฟฉาย แบตเตอรี่", "หลอดไฟฟลูออเรสเซนต์", "กระป๋องสเปรย์", "ขวดยาหมดอายุ"],
    tips: "แยกใส่ถุงมิดชิด ห้ามทิ้งรวมกับขยะประเภทอื่นเด็ดขาด",
  },
};

export default function AdminGuidelinesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [newPoints, setNewPoints] = useState<number>(5);
  const [saving, setSaving] = useState(false);

  const fetchGuidelines = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/guidelines");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        }
      }
    } catch (err) {
      console.warn("Fetch guidelines error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuidelines();
  }, []);

  const handleSavePoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/guidelines", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingCategory.id, points_reward: Number(newPoints) }),
      });

      if (res.ok) {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === editingCategory.id ? { ...c, points_reward: Number(newPoints) } : c
          )
        );
        setEditingCategory(null);
      } else {
        alert("บันทึกไม่สำเร็จ");
      }
    } catch {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <span>📘</span> ฐานความรู้ & เกณฑ์แต้มสะสม 4 หมวดหมู่
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            มาตรฐานกรมควบคุมมลพิษ และเกณฑ์การให้คะแนนสะสมในระบบ Supabase จริง
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-xs">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          กำลังโหลดหมวดหมู่ขยะจากฐานข้อมูล...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat) => {
            const detail =
              STATIC_GUIDELINE_DETAILS[cat.name_th] || {
                category: cat.name_en,
                binTitle: `${cat.name_th} (${cat.name_en})`,
                badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
                examples: ["สิ่งของทั่วไป"],
                tips: "แยกประเภทให้ถูกต้องตามคำแนะนำ",
              };

            return (
              <div
                key={cat.id}
                className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <h3 className="text-lg font-bold text-slate-900">{detail.binTitle}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${detail.badgeColor}`}>
                        +{cat.points_reward} แต้ม/ชิ้น
                      </span>
                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setNewPoints(cat.points_reward);
                        }}
                        className="text-xs text-emerald-700 font-bold px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer"
                        title="ปรับแต้ม"
                      >
                        ✏️ ปรับแต้ม
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-bold text-slate-500 mb-2">ตัวอย่างขยะในหมวดนี้:</p>
                    <div className="flex flex-wrap gap-2">
                      {detail.examples.map((ex, i) => (
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
                    <span className="font-bold text-emerald-700">💡 เคล็ดลับการจัดการ:</span> {detail.tips}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                  <span>สถานะ AI System Prompt:</span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                    ✓ Active in Gemini 2.5
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Points Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                ✏️ ปรับแต้มรางวัล: {editingCategory.name_th}
              </h3>
              <button
                onClick={() => setEditingCategory(null)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePoints} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  คะแนนที่ได้รับเมื่อคัดแยกหมวดหมู่นี้สำเร็จ (แต้ม/ชิ้น)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={newPoints}
                  onChange={(e) => setNewPoints(Number(e.target.value))}
                  className="w-full bg-slate-50 text-slate-900 border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-emerald-500 font-mono text-base font-bold"
                />
              </div>

              <div className="flex gap-2">
                {[2, 5, 10, 15, 20].map((pt) => (
                  <button
                    type="button"
                    key={pt}
                    onClick={() => setNewPoints(pt)}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 cursor-pointer text-center"
                  >
                    {pt}
                  </button>
                ))}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "กำลังบันทึก..." : "บันทึกแต้ม"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
