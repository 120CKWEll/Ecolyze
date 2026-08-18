"use client";
import React, { useState } from "react";

export default function AdminUsersPage() {
  // ข้อมูลจำลอง (Mock Data) สำหรับผู้ใช้งาน
  const [users, setUsers] = useState([
    { id: "U001", name: "สมชาย ใจดี", email: "somchai@kkumail.com", role: "User", points: 450, status: "Active" },
    { id: "U002", name: "สมหญิง รักษ์โลก", email: "somying@kkumail.com", role: "User", points: 1200, status: "Active" },
    { id: "U003", name: "ผู้ดูแล ระบบ", email: "admin@recyclesmart.com", role: "Admin", points: 9999, status: "Active" },
    { id: "U004", name: "นักศึกษา ทดสอบ", email: "test@kkumail.com", role: "User", points: 0, status: "Suspended" },
  ]);

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">👥 จัดการบัญชีผู้ใช้</h1>
          <p className="text-gray-500 text-sm mt-1">ดูและจัดการข้อมูลผู้ใช้งานทั้งหมดในระบบ</p>
        </div>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="🔍 ค้นหาชื่อ หรือ อีเมล..." 
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* ตารางแสดงข้อมูล */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
              <th className="px-6 py-4 font-bold">รหัส</th>
              <th className="px-6 py-4 font-bold">ชื่อ - นามสกุล</th>
              <th className="px-6 py-4 font-bold">บทบาท</th>
              <th className="px-6 py-4 font-bold">คะแนนสะสม</th>
              <th className="px-6 py-4 font-bold">สถานะ</th>
              <th className="px-6 py-4 font-bold text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-500 font-mono">{user.id}</td>
                <td className="px-6 py-4">
                  <p className="font-bold text-gray-800 text-sm">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    user.role === "Admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-emerald-600">{user.points.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`flex items-center gap-1.5 text-xs font-bold ${
                    user.status === "Active" ? "text-emerald-600" : "text-red-500"
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${user.status === "Active" ? "bg-emerald-500" : "bg-red-500"}`}></span>
                    {user.status === "Active" ? "ปกติ" : "ถูกระงับ"}
                  </span>
                </td>
                <td className="px-6 py-4 text-center space-x-2">
                  <button className="text-gray-400 hover:text-blue-500 transition-colors" title="แก้ไข">✏️</button>
                  <button className="text-gray-400 hover:text-red-500 transition-colors" title="ระงับบัญชี">🚫</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}