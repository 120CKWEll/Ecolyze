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
  status: "Active" | "Maintenance" | string;
}

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState<WasteLocation[]>([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [locName, setLocName] = useState("");
  const [lat, setLat] = useState("16.4730");
  const [lng, setLng] = useState("102.8230");
  const [desc, setDesc] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["รีไซเคิล", "ทั่วไป"]);
  const [saving, setSaving] = useState(false);

  const availableTypes = ["รีไซเคิล", "ทั่วไป", "เปียก", "อันตราย", "E-Waste"];

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/locations");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
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
    } catch (err) {
      console.warn("Fetch locations error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setLocName("");
    setLat("16.4740");
    setLng("102.8230");
    setDesc("");
    setSelectedTypes(["รีไซเคิล", "ทั่วไป"]);
    setShowModal(true);
  };

  const openEditModal = (loc: WasteLocation) => {
    setEditingId(loc.id);
    setLocName(loc.name);
    setLat(String(loc.lat));
    setLng(String(loc.lng));
    setDesc(loc.description);
    setSelectedTypes(loc.types || loc.type || ["รีไซเคิล", "ทั่วไป"]);
    setShowModal(true);
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locName.trim()) return;

    setSaving(true);
    const payload = {
      name: locName.trim(),
      lat: parseFloat(lat) || 16.473,
      lng: parseFloat(lng) || 102.823,
      types: selectedTypes.length > 0 ? selectedTypes : ["รีไซเคิล", "ทั่วไป"],
      description: desc.trim() || "จุดคัดแยกขยะมาตรฐาน มข.",
      status: "Active",
    };

    try {
      if (editingId) {
        // Update existing
        const res = await fetch("/api/admin/locations", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...payload }),
        });
        if (res.ok) {
          fetchLocations();
          setShowModal(false);
        } else {
          alert("อัปเดตจุดทิ้งขยะไม่สำเร็จ");
        }
      } else {
        // Create new
        const res = await fetch("/api/admin/locations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          fetchLocations();
          setShowModal(false);
        } else {
          alert("เพิ่มจุดทิ้งขยะไม่สำเร็จ");
        }
      }
    } catch {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setSaving(false);
    }
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
      fetchLocations();
    }
  };

  const deleteLocation = async (id: number, name: string) => {
    if (!confirm(`คุณต้องการลบจุดทิ้งขยะ "${name}" หรือไม่?`)) return;

    setLocations((prev) => prev.filter((l) => l.id !== id));

    try {
      const res = await fetch(`/api/admin/locations?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) fetchLocations();
    } catch {
      fetchLocations();
    }
  };

  const toggleType = (t: string) => {
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((item) => item !== t) : [...prev, t]
    );
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
          onClick={openAddModal}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <span>➕</span> เพิ่มจุดทิ้งใหม่
        </button>
      </div>

      {/* Grid of Locations */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-xs">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          กำลังโหลดจุดทิ้งขยะจากฐานข้อมูล...
        </div>
      ) : (
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
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleStatus(loc.id)}
                    className="text-slate-500 hover:text-slate-800 font-bold transition cursor-pointer"
                  >
                    สลับสถานะ
                  </button>
                  <button
                    onClick={() => openEditModal(loc)}
                    className="text-emerald-700 hover:text-emerald-900 font-bold transition cursor-pointer"
                  >
                    ✏️ แก้ไข
                  </button>
                  <button
                    onClick={() => deleteLocation(loc.id, loc.name)}
                    className="text-rose-500 hover:text-rose-700 font-bold transition cursor-pointer"
                  >
                    🗑️ ลบ
                  </button>
                </div>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-600 hover:text-emerald-700 hover:underline font-bold"
                >
                  เปิด Google Maps ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingId ? "✏️ แก้ไขจุดทิ้งขยะ" : "📍 เพิ่มจุดทิ้งขยะใหม่"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLocation} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">ชื่อสถานที่ / อาคาร</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น โรงอาหารคณะศึกษาศาสตร์"
                  value={locName}
                  onChange={(e) => setLocName(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ละติจูด (Lat)</label>
                  <input
                    type="text"
                    required
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ลองจิจูด (Lng)</label>
                  <input
                    type="text"
                    required
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  ประเภทขยะที่รองรับในจุดนี้
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTypes.map((t) => {
                    const isSelected = selectedTypes.includes(t);
                    return (
                      <button
                        type="button"
                        key={t}
                        onClick={() => toggleType(t)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                          isSelected
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">คำอธิบายจุดตั้งถัง</label>
                <textarea
                  rows={2}
                  placeholder="เช่น บริเวณบันไดทางขึ้นชั้น 1 ใกล้ประตูทางออก"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200/80 transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
