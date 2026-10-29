"use client";
import React, { useState, useEffect } from "react";

interface ReportItem {
  id: string;
  user: string;
  issue: string;
  location: string;
  status: "Pending" | "Resolved" | string;
  date: string;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "Pending" | "Resolved">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLocation, setNewLocation] = useState("");
  const [newIssueType, setNewIssueType] = useState("ถังขยะเต็ม");
  const [newDescription, setNewDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reports");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const mapped: ReportItem[] = data.map((d: any) => ({
            id: d.id,
            user: d.user_id ? `${d.user_id.slice(0, 8)}...` : "ผู้ใช้งานในระบบ",
            issue: d.report_type || d.description || "แจ้งปัญหาทั่วไป",
            location: d.location_name || "มหาวิทยาลัยขอนแก่น",
            status: d.status || "Pending",
            date: d.created_at
              ? new Date(d.created_at).toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" })
              : "วันนี้",
          }));
          setReports(mapped);
        }
      }
    } catch (err) {
      console.warn("Fetch reports err:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const updateStatus = async (id: string, newStatus: "Pending" | "Resolved") => {
    // Optimistic UI update
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );

    try {
      const res = await fetch("/api/admin/reports", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (!res.ok) {
        fetchReports();
      }
    } catch (err) {
      console.warn("Update report status err:", err);
      fetchReports();
    }
  };

  const deleteReport = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายงานนี้?")) return;

    setReports((prev) => prev.filter((r) => r.id !== id));

    try {
      const res = await fetch(`/api/admin/reports?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        fetchReports();
      }
    } catch (err) {
      console.warn("Delete report err:", err);
      fetchReports();
    }
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocation.trim()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location_name: newLocation.trim(),
          report_type: newIssueType,
          description: newDescription.trim() || newIssueType,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewLocation("");
        setNewDescription("");
        fetchReports();
      } else {
        alert("ไม่สามารถบันทึกรายงานได้");
      }
    } catch {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setSaving(false);
    }
  };

  const filteredReports = reports.filter(
    (r) => filter === "all" || r.status === filter
  );

  const pendingCount = reports.filter((r) => r.status === "Pending").length;
  const resolvedCount = reports.filter((r) => r.status === "Resolved").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <span>📋</span> จัดการรายงานปัญหา & ถังขยะเต็ม
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            ติดตามและแก้ไขปัญหาที่ได้รับแจ้งจากนักศึกษาและบุคลากรใน มข.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Filter buttons */}
          <div className="bg-white border border-slate-200 p-1 rounded-xl flex items-center gap-1 text-xs font-bold shadow-sm">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                filter === "all"
                  ? "bg-emerald-600 text-white shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              ทั้งหมด ({reports.length})
            </button>
            <button
              onClick={() => setFilter("Pending")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                filter === "Pending"
                  ? "bg-amber-500 text-white shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              รอดำเนินการ ({pendingCount})
            </button>
            <button
              onClick={() => setFilter("Resolved")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                filter === "Resolved"
                  ? "bg-emerald-600 text-white shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              แก้ไขแล้ว ({resolvedCount})
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-95 cursor-pointer"
          >
            <span>➕</span> เพิ่มรายงานใหม่
          </button>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center text-slate-500 text-xs">
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              กำลังโหลดข้อมูลรายงานจากฐานข้อมูล...
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs font-medium">
              ไม่พบรายการรายงานปัญหาในหมวดหมู่นี้
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-bold">
                  <th className="py-4 px-5">รหัสรายงาน</th>
                  <th className="py-4 px-5">วันที่แจ้ง</th>
                  <th className="py-4 px-5">สถานที่เกิดเหตุ</th>
                  <th className="py-4 px-5">รายละเอียดปัญหา</th>
                  <th className="py-4 px-5">สถานะ</th>
                  <th className="py-4 px-5 text-center">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="py-4 px-5 font-mono text-slate-500 font-bold">
                      {report.id.length > 10 ? report.id.slice(0, 8) + "..." : report.id}
                    </td>
                    <td className="py-4 px-5 text-slate-500 whitespace-nowrap">{report.date}</td>
                    <td className="py-4 px-5 font-bold text-slate-800">{report.location}</td>
                    <td className="py-4 px-5 text-slate-700 font-medium">{report.issue}</td>
                    <td className="py-4 px-5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          report.status === "Pending"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            report.status === "Pending" ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                        ></span>
                        {report.status === "Pending" ? "⏳ รอดำเนินการ" : "✅ แก้ไขแล้ว"}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-center space-x-2 whitespace-nowrap">
                      {report.status === "Pending" ? (
                        <button
                          onClick={() => updateStatus(report.id, "Resolved")}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm px-3 py-1.5 rounded-lg text-xs font-bold transition active:scale-95 cursor-pointer"
                        >
                          ✓ แก้ไขแล้ว
                        </button>
                      ) : (
                        <button
                          onClick={() => updateStatus(report.id, "Pending")}
                          className="text-slate-500 hover:text-slate-800 text-xs font-semibold hover:underline cursor-pointer px-2 py-1"
                        >
                          ย้อนสถานะ
                        </button>
                      )}
                      <button
                        onClick={() => deleteReport(report.id)}
                        className="text-rose-500 hover:text-rose-700 text-xs font-bold p-1 rounded hover:bg-rose-50 cursor-pointer"
                        title="ลบรายงาน"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Report Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">📋 บันทึกรายงานปัญหาใหม่</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">สถานที่พบปัญหา</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น โรงอาหารคอมเพล็กซ์ ชั้น 1"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ประเภทปัญหา</label>
                <select
                  value={newIssueType}
                  onChange={(e) => setNewIssueType(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold"
                >
                  <option value="ถังขยะเต็ม">🚨 ถังขยะเต็มล้น</option>
                  <option value="ถังขยะชำรุด">🛠️ ถังขยะชำรุด/ฝาแตก</option>
                  <option value="ขยะทิ้งผิดประเภท">⚠️ ขยะทิ้งผิดประเภท/ปนเปื้อน</option>
                  <option value="ส่งกลิ่นเหม็น/สกปรก">🦨 ส่งกลิ่นเหม็น/สกปรก</option>
                  <option value="อื่นๆ">📝 อื่นๆ</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">คำอธิบายเพิ่มเติม</label>
                <textarea
                  rows={3}
                  placeholder="รายละเอียดปัญหาที่พบ..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
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
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "กำลังบันทึก..." : "ส่งรายงาน"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
