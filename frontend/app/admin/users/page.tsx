"use client";
import React, { useState, useEffect } from "react";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  points: number;
  status: string;
}

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      let res = await fetch("/api/admin/users");
      if (!res.ok) res = await fetch("http://localhost:5000/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) setUsers(data);
      }
    } catch {
      // Keep default if error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "Admin" ? "user" : "admin";
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole === "admin" ? "Admin" : "User" } : u))
    );
    try {
      await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
    } catch (err) {
      console.warn("Update role err:", err);
    }
  };

  const toggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === "Active" ? "Suspended" : "Active" } : u
      )
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <span>👥</span> จัดการบัญชีผู้ใช้งาน
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            ตรวจสอบรายชื่อผู้ใช้งาน สิทธิ์การเข้าถึง และคะแนนสะสมในระบบ
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-white border border-slate-200 text-slate-700 text-xs px-3.5 py-2 rounded-xl font-bold shadow-sm">
            สมาชิกทั้งหมด {users.length} คน
          </span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm">
        <div className="w-full sm:w-80">
          <input
            type="text"
            placeholder="🔍 ค้นหาชื่อ, อีเมล หรือรหัส..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-emerald-500 font-semibold"
          >
            <option value="all">ทุกบทบาท (Roles)</option>
            <option value="user">User ทั่วไป</option>
            <option value="admin">Admin ผู้ดูแล</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-bold">
                <th className="py-4 px-5">รหัสผู้ใช้</th>
                <th className="py-4 px-5">ชื่อ - นามสกุล</th>
                <th className="py-4 px-5">บทบาท</th>
                <th className="py-4 px-5">แต้มสะสม</th>
                <th className="py-4 px-5">สถานะ</th>
                <th className="py-4 px-5 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="py-4 px-5 font-mono text-slate-500 font-bold">{user.id}</td>
                  <td className="py-4 px-5">
                    <p className="font-bold text-slate-900 text-sm">{user.name}</p>
                    <p className="text-[11px] text-slate-500">{user.email}</p>
                  </td>
                  <td className="py-4 px-5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        user.role === "Admin"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-5 font-black text-emerald-600 text-sm">
                    {user.points.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">แต้ม</span>
                  </td>
                  <td className="py-4 px-5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        user.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          user.status === "Active" ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                      ></span>
                      {user.status === "Active" ? "ปกติ" : "ระงับการใช้งาน"}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-center space-x-2">
                    <button
                      onClick={() => toggleStatus(user.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        user.status === "Active"
                          ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                          : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {user.status === "Active" ? "🚫 ระงับ" : "✅ ปลดล็อก"}
                    </button>
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