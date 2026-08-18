"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // บันทึกข้อมูลลง LocalStorage เครื่องผู้ใช้
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/"); // เด้งไปหน้าแรก
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-fade-in">
      <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-emerald-900/5 border border-emerald-50 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">♻️</div>
          <h1 className="text-2xl font-bold text-gray-800">เข้าสู่ระบบ RecycleSmart</h1>
          <p className="text-gray-500 mt-2">จัดการขยะอย่างชาญฉลาด เพื่อโลกที่ดีกว่า</p>
        </div>

        {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl mb-4 text-center text-sm font-bold border border-red-100">{error}</div>}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="อีเมล (Email)"
            className="w-full bg-gray-50 text-gray-800 placeholder-gray-400 border border-gray-200 p-4 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="รหัสผ่าน (Password)"
            className="w-full bg-gray-50 text-gray-800 placeholder-gray-400 border border-gray-200 p-4 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold p-4 rounded-2xl transition shadow-lg shadow-emerald-200 mt-2">
            เข้าสู่ระบบ
          </button>
        </form>

        <p className="text-center text-gray-500 mt-8">
          ยังไม่มีบัญชีใช่ไหม? <Link href="/register" className="text-emerald-600 font-bold hover:underline">สมัครสมาชิกที่นี่</Link>
        </p>
      </div>
    </div>
  );
}
