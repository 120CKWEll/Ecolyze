"use client";
import React, { useState } from "react";

export default function AdminReportsPage() {
  // ข้อมูลจำลองสำหรับการรายงานปัญหา
  const [reports, setReports] = useState([
    { id: "RPT-001", user: "สมชาย ใจดี", issue: "ถังขยะเต็ม", location: "หน้าตึก SC06", status: "Pending", date: "2026-07-04" },
    { id: "RPT-002", user: "สมหญิง รักษ์โลก", issue: "AI วิเคราะห์ผิด", location: "-", status: "Resolved", date: "2026-07-03" },
  ]);

  return (
    <div className="p-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">📋 จัดการรายงานขยะและปัญหา</h1>
      <p className="text-gray-500 text-sm mb-6">ตรวจสอบและอัปเดตสถานะปัญหาที่ได้รับแจ้งจากผู้ใช้งาน</p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
              <th className="px-6 py-4 font-bold">รหัสรายงาน</th>
              <th className="px-6 py-4 font-bold">ผู้แจ้ง</th>
              <th className="px-6 py-4 font-bold">ปัญหา</th>
              <th className="px-6 py-4 font-bold">สถานที่</th>
              <th className="px-6 py-4 font-bold">สถานะ</th>
              <th className="px-6 py-4 font-bold text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-500 font-mono">{report.id}</td>
                <td className="px-6 py-4 text-sm font-medium">{report.user}</td>
                <td className="px-6 py-4 text-sm text-red-600 font-bold">{report.issue}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{report.location}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    report.status === "Pending" ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {report.status === "Pending" ? "⏳ รอดำเนินการ" : "✅ แก้ไขแล้ว"}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-lg font-medium transition-colors">
                    อัปเดต
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}