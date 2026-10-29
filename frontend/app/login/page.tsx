"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/");
      } else {
        setError(data.error || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] animate-fade-in p-4">
      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-emerald-900/5 border border-slate-200/80 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">♻️</div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">เข้าสู่ระบบ RecycleSmart</h1>
          <p className="text-slate-600 mt-2 font-medium text-sm md:text-base">จัดการขยะอย่างชาญฉลาด เพื่อโลกที่ดีกว่า</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3.5 rounded-2xl mb-4 text-center text-sm font-bold border border-red-200 animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">อีเมลผู้ใช้งาน</label>
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-300 p-4 rounded-2xl focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 font-medium transition"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">รหัสผ่าน</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-300 p-4 rounded-2xl focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 font-medium transition"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold p-4 rounded-2xl transition shadow-lg shadow-emerald-600/30 mt-2 active:scale-95 disabled:opacity-50"
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        <p className="text-center text-slate-600 font-medium mt-8 text-sm">
          ยังไม่มีบัญชีใช่ไหม? <Link href="/register" className="text-emerald-700 font-bold hover:underline">สมัครสมาชิกที่นี่</Link>
        </p>
      </div>
    </div>
  );
}
