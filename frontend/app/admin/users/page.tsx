"use client";
import React, { useState, useEffect } from "react";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  rawRole: string;
  points: number;
  status: string;
  createdAt?: string;
}

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Points Modal
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [newPoints, setNewPoints] = useState<number>(0);
  const [savingPoints, setSavingPoints] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setUsers(data);
      }
    } catch (err) {
      console.warn("Fetch users err:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const changeRole = async (userId: string, newRole: "student" | "staff" | "admin") => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              role: newRole === "admin" ? "Admin" : newRole === "staff" ? "Staff" : "User",
              rawRole: newRole,
            }
          : u
      )
    );

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (!res.ok) fetchUsers();
    } catch {
      fetchUsers();
    }
  };

  const handleSavePoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setSavingPoints(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: editingUser.id, score: Number(newPoints) }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === editingUser.id ? { ...u, points: Number(newPoints) } : u
          )
        );
        setEditingUser(null);
      } else {
        alert("ไม่สามารถบันทึกแต้มได้");
      }
    } catch {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setSavingPoints(false);
    }
  };

  const deleteUser = async (userId: string, name: string) => {
    if (!confirm(`คุณต้องการลบบัญชีผู้ใช้งาน "${name}" หรือไม่?`)) return;

    setUsers((prev) => prev.filter((u) => u.id !== userId));

    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) fetchUsers();
    } catch {
      fetchUsers();
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole =
      roleFilter === "all" ||
      u.role.toLowerCase() === roleFilter.toLowerCase() ||
      u.rawRole.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <span>👥</span> จัดการบัญชีผู้ใช้งาน
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            ตรวจสอบรายชื่อผู้ใช้งาน สิทธิ์การเข้าถึง และคะแนนสะสมในระบบ Supabase จริง
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
            <option value="all">ทุกบทบาท (All Roles)</option>
            <option value="user">User ทั่วไป (Student)</option>
            <option value="staff">Staff บุคลากร</option>
            <option value="admin">Admin ผู้ดูแลระบบ</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center text-slate-500 text-xs">
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              กำลังโหลดรายชื่อผู้ใช้จากฐานข้อมูล...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs font-medium">
              ไม่พบรายชื่อผู้ใช้งานที่ตรงกับการค้นหา
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-bold">
                  <th className="py-4 px-5">รหัสผู้ใช้</th>
                  <th className="py-4 px-5">ชื่อ - อีเมล</th>
                  <th className="py-4 px-5">สิทธิ์บทบาท (Role)</th>
                  <th className="py-4 px-5">แต้มสะสม</th>
                  <th className="py-4 px-5 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="py-4 px-5 font-mono text-slate-400 font-bold">
                      {user.id.slice(0, 8)}...
                    </td>
                    <td className="py-4 px-5">
                      <p className="font-bold text-slate-900 text-sm">{user.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{user.email}</p>
                    </td>
                    <td className="py-4 px-5">
                      <select
                        value={user.rawRole || (user.role === "Admin" ? "admin" : "student")}
                        onChange={(e) =>
                          changeRole(user.id, e.target.value as "student" | "staff" | "admin")
                        }
                        className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border cursor-pointer focus:outline-none ${
                          user.role === "Admin"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : user.role === "Staff"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-slate-50 text-slate-700 border-slate-200"
                        }`}
                      >
                        <option value="student">Student (ผู้ใช้)</option>
                        <option value="staff">Staff (เจ้าหน้าที่)</option>
                        <option value="admin">Admin (ผู้ดูแล)</option>
                      </select>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-emerald-600 text-sm">
                          {user.points.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400">แต้ม</span>
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setNewPoints(user.points);
                          }}
                          className="text-[11px] text-emerald-700 hover:underline font-bold px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 cursor-pointer"
                          title="แก้ไขแต้ม"
                        >
                          ✏️ แก้ไข
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <button
                        onClick={() => deleteUser(user.id, user.name)}
                        className="text-rose-500 hover:text-rose-700 text-xs font-bold p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        title="ลบผู้ใช้งานนี้"
                      >
                        🗑️ ลบบัญชี
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Edit Points Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                ✏️ ปรับคะแนนสะสม: {editingUser.name}
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePoints} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  แต้มปัจจุบัน: {editingUser.points.toLocaleString()} แต้ม
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newPoints}
                  onChange={(e) => setNewPoints(Number(e.target.value))}
                  className="w-full bg-slate-50 text-slate-900 border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-emerald-500 font-mono text-base font-bold"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNewPoints((prev) => prev + 50)}
                  className="flex-1 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 cursor-pointer"
                >
                  +50
                </button>
                <button
                  type="button"
                  onClick={() => setNewPoints((prev) => prev + 100)}
                  className="flex-1 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 cursor-pointer"
                >
                  +100
                </button>
                <button
                  type="button"
                  onClick={() => setNewPoints((prev) => Math.max(0, prev - 50))}
                  className="flex-1 py-1.5 rounded-lg bg-rose-50 text-rose-700 font-bold border border-rose-200 cursor-pointer"
                >
                  -50
                </button>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={savingPoints}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {savingPoints ? "กำลังบันทึก..." : "บันทึกแต้ม"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
