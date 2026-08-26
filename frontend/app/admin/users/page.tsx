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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>👥</span> จัดการบัญชีผู้ใช้งาน
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            ตรวจสอบรายชื่อผู้ใช้งาน สิทธิ์การเข้าถึง และคะแนนสะสมในระบบ
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-slate-900 border border-slate-800 text-slate-300 text-xs px-3.5 py-2 rounded-xl font-bold">
            สมาชิกทั้งหมด {users.length} คน
          </span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl">
        <div className="w-full sm:w-80">
          <input
            type="text"
            placeholder="🔍 ค้นหาชื่อ, อีเมล หรือรหัส..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-850 text-white placeholder-slate-500 border border-slate-700/60 px-4 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-850 text-slate-300 border border-slate-700/60 px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-500 font-semibold"
          >
            <option value="all">ทุกบทบาท (Roles)</option>
            <option value="user">User ทั่วไป</option>
            <option value="admin">Admin ผู้ดูแล</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-850/60 text-slate-400 font-bold">
                <th className="py-4 px-5">รหัสผู้ใช้</th>
                <th className="py-4 px-5">ชื่อ - นามสกุล</th>
                <th className="py-4 px-5">บทบาท</th>
                <th className="py-4 px-5">แต้มสะสม</th>
                <th className="py-4 px-5">สถานะ</th>
                <th className="py-4 px-5 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-5 font-mono text-slate-400 font-bold">{user.id}</td>
                  <td className="py-4 px-5">
                    <p className="font-bold text-slate-100 text-sm">{user.name}</p>
                    <p className="text-[11px] text-slate-400">{user.email}</p>
                  </td>
                  <td className="py-4 px-5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        user.role === "Admin"
                          ? "bg-purple-950/60 text-purple-400 border-purple-800/40"
                          : "bg-blue-950/60 text-blue-400 border-blue-800/40"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-5 font-black text-emerald-400 text-sm">
                    {user.points.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">แต้ม</span>
                  </td>
                  <td className="py-4 px-5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        user.status === "Active"
                          ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/40"
                          : "bg-rose-950/60 text-rose-400 border-rose-800/40"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          user.status === "Active" ? "bg-emerald-400" : "bg-rose-400"
                        }`}
                      ></span>
                      {user.status === "Active" ? "ปกติ" : "ระงับการใช้งาน"}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-center space-x-2">
                    <button
                      onClick={() => toggleStatus(user.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        user.status === "Active"
                          ? "bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40"
                          : "bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/40"
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