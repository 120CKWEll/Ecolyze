"use client";
import React, { useState, useEffect } from "react";

interface ReportItem {
  id: string;
  user: string;
  issue: string;
  location: string;
  status: "Pending" | "In-Progress" | "Resolved";
  date: string;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([
    { id: "RPT-001", user: "สมชาย ใจดี", issue: "ถังขยะรีไซเคิลเต็มล้น", location: "ศูนย์อาหารคอมเพล็กซ์ ชั้น 1", status: "Pending", date: "2026-08-26" },
    { id: "RPT-002", user: "สมหญิง รักษ์โลก", issue: "ถังขยะอันตรายฝาชำรุด", location: "หน้าตึก EN คณะวิศวกรรมศาสตร์", status: "Pending", date: "2026-08-25" },
    { id: "RPT-003", user: "ธนวัฒน์ ขยันแยก", issue: "พบขยะปนเปื้อนในถังรีไซเคิล", location: "หอสมุดกลาง มข.", status: "Resolved", date: "2026-08-24" },
  ]);

  const [filter, setFilter] = useState<"all" | "Pending" | "Resolved">("all");

  const fetchReports = async () => {
    try {
      let res = await fetch("/api/admin/reports");
      if (!res.ok) res = await fetch("http://localhost:5000/api/admin/reports");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((d: any) => ({
            id: d.id,
            user: "ผู้ใช้ในระบบ",
            issue: d.report_type || d.reportType || d.description,
            location: d.location_name || d.locationName || "มหาวิทยาลัยขอนแก่น",
            status: d.status || "Pending",
            date: new Date(d.created_at || d.createdAt || Date.now()).toLocaleDateString("th-TH"),
          }));
          setReports(mapped);
        }
      }
    } catch {
      // keep fallback
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const updateStatus = async (id: string, newStatus: "Pending" | "Resolved") => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );

    try {
      await fetch("/api/admin/reports", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
    } catch (err) {
      console.warn("Update report status err:", err);
    }
  };

  const filteredReports = reports.filter(
    (r) => filter === "all" || r.status === filter
  );

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

        {/* Filter buttons */}
        <div className="bg-white border border-slate-200 p-1 rounded-xl flex items-center gap-1 text-xs font-bold self-start sm:self-auto shadow-sm">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              filter === "all" ? "bg-emerald-600 text-white shadow-sm font-bold" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            ทั้งหมด ({reports.length})
          </button>
          <button
            onClick={() => setFilter("Pending")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              filter === "Pending" ? "bg-amber-500 text-white shadow-sm font-bold" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            รอดำเนินการ ({reports.filter((r) => r.status === "Pending").length})
          </button>
          <button
            onClick={() => setFilter("Resolved")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              filter === "Resolved" ? "bg-emerald-600 text-white shadow-sm font-bold" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            แก้ไขแล้ว
          </button>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
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
                  <td className="py-4 px-5 font-mono text-slate-500 font-bold">{report.id}</td>
                  <td className="py-4 px-5 text-slate-500">{report.date}</td>
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
                  <td className="py-4 px-5 text-center">
                    {report.status === "Pending" ? (
                      <button
                        onClick={() => updateStatus(report.id, "Resolved")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm px-3.5 py-1.5 rounded-lg text-xs font-bold transition active:scale-95 cursor-pointer"
                      >
                        ✓ ทำเครื่องหมายแก้ไขแล้ว
                      </button>
                    ) : (
                      <button
                        onClick={() => updateStatus(report.id, "Pending")}
                        className="text-slate-500 hover:text-slate-800 text-xs font-semibold hover:underline cursor-pointer"
                      >
                        ย้อนสถานะ
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}