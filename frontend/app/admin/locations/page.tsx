"use client";
import React, { useState, useEffect } from "react";

interface WasteLocation {
  id: number;
  name: string;
  lat: number;
  lng: number;
  type?: string[];
  types?: string[];
  description: string;
  status: "Active" | "Maintenance";
}

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState<WasteLocation[]>([
    { id: 1, name: "ศูนย์อาหารคอมเพล็กซ์", lat: 16.4744, lng: 102.8231, type: ["รีไซเคิล", "ขยะเปียก", "ทั่วไป"], description: "จุดคัดแยกขยะหลัก บริเวณทางเข้าและในโรงอาหาร", status: "Active" },
    { id: 2, name: "คณะวิศวกรรมศาสตร์", lat: 16.4755, lng: 102.8195, type: ["รีไซเคิล", "E-Waste"], description: "จุดรับขยะอิเล็กทรอนิกส์และรีไซเคิล ใกล้ตึก EN", status: "Active" },
    { id: 3, name: "หอสมุดกลาง (ศูนย์สื่อการเรียนรู้)", lat: 16.4715, lng: 102.8235, type: ["รีไซเคิล", "อันตราย"], description: "จุดรับถ่านไฟฉาย ขยะอิเล็กทรอนิกส์ และกระดาษ", status: "Maintenance" },
    { id: 4, name: "คณะวิทยาศาสตร์ (SC06)", lat: 16.4735, lng: 102.8205, type: ["รีไซเคิล", "ทั่วไป"], description: "ถังขยะแยกประเภทบริเวณใต้อาคาร", status: "Active" },
    { id: 5, name: "กองจัดการสาธารณูปโภคพลังงานและสิ่งแวดล้อม", lat: 16.4862, lng: 102.8276, type: ["รีไซเคิล", "อันตราย", "ทั่วไป"], description: "หน่วยงานหลักดูแลการจัดการขยะของ มข.", status: "Active" },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newLocName, setNewLocName] = useState("");
  const [newLat, setNewLat] = useState("16.4730");
  const [newLng, setNewLng] = useState("102.8230");
  const [newDesc, setNewDesc] = useState("");

  const fetchLocations = async () => {
    try {
      let res = await fetch("/api/admin/locations");
      if (!res.ok) res = await fetch("http://localhost:5000/api/locations");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const normalized: WasteLocation[] = data.map((d: any) => ({
            id: Number(d.id),
            name: d.name,
            lat: Number(d.lat) || 16.473,
            lng: Number(d.lng) || 102.823,
            type: Array.isArray(d.types) ? d.types : Array.isArray(d.type) ? d.type : ["รีไซเคิล", "ทั่วไป"],
            types: Array.isArray(d.types) ? d.types : Array.isArray(d.type) ? d.type : ["รีไซเคิล", "ทั่วไป"],
            description: d.description || "",
            status: d.status || "Active",
          }));
          setLocations(normalized);
        }
      }
    } catch {
      // keep fallback
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName.trim()) return;

    const payload = {
      name: newLocName.trim(),
      lat: parseFloat(newLat) || 16.473,
      lng: parseFloat(newLng) || 102.823,
      types: ["รีไซเคิล", "ทั่วไป"],
      description: newDesc.trim() || "จุดคัดแยกขยะมาตรฐาน มข.",
      status: "Active",
    };

    try {
      let res = await fetch("/api/admin/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.location) {
          setLocations((prev) => [result.location, ...prev]);
        } else {
          fetchLocations();
        }
      } else {
        fetchLocations();
      }
    } catch {
      fetchLocations();
    }

    setShowAddModal(false);
    setNewLocName("");
    setNewDesc("");
  };

  const toggleStatus = async (id: number) => {
    const current = locations.find((l) => l.id === id);
    const newStatus = current?.status === "Active" ? "Maintenance" : "Active";

    setLocations((prev) =>
      prev.map((loc) => (loc.id === id ? { ...loc, status: newStatus } : loc))
    );

    try {
      await fetch("/api/admin/locations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
    } catch (err) {
      console.warn("Toggle location err:", err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <span>📍</span> จัดการจุดทิ้งขยะ & แผนที่ Leaflet
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            กำหนดพิกัด GPS จุดรับขยะ และประเภทถังขยะที่แสดงบนแผนที่ มข.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <span>➕</span> เพิ่มจุดทิ้งใหม่
        </button>
      </div>

      {/* Grid of Locations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {locations.map((loc) => (
          <div
            key={loc.id}
            className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-emerald-300 hover:shadow-md transition flex flex-col justify-between shadow-sm"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-xl shrink-0">
                    🗑️
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{loc.name}</h3>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                      Lat: {loc.lat} | Lng: {loc.lng}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 ${
                    loc.status === "Active"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {loc.status === "Active" ? "🟢 เปิดใช้งาน" : "🛠️ ปิดปรับปรุง"}
                </span>
              </div>

              <p className="text-xs text-slate-600 mb-4">{loc.description}</p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {(loc.type || loc.types || []).map((t, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                onClick={() => toggleStatus(loc.id)}
                className="text-slate-500 hover:text-slate-800 font-bold transition cursor-pointer"
              >
                สลับสถานะ (เปิด/ปิด)
              </button>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-600 hover:text-emerald-700 hover:underline font-bold"
              >
                ดูบน Google Maps ↗
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">📍 เพิ่มจุดทิ้งขยะใหม่</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddLocation} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">ชื่อสถานที่ / อาคาร</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น โรงอาหารคณะศึกษาศาสตร์"
                  value={newLocName}
                  onChange={(e) => setNewLocName(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ละติจูด (Lat)</label>
                  <input
                    type="text"
                    value={newLat}
                    onChange={(e) => setNewLat(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ลองจิจูด (Lng)</label>
                  <input
                    type="text"
                    value={newLng}
                    onChange={(e) => setNewLng(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">คำอธิบายจุดตั้งถัง</label>
                <textarea
                  rows={2}
                  placeholder="เช่น บริเวณบันไดทางขึ้นชั้น 1"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200/80 transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}