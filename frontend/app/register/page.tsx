"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(data.message ?? "สมัครสมาชิกสำเร็จ! กำลังพากลับไปหน้าเข้าสู่ระบบ...");
        setTimeout(() => router.push("/login"), data.needsEmailConfirmation ? 4500 : 2000);
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
          <div className="text-5xl mb-4">🌱</div>
          <h1 className="text-2xl font-bold text-gray-800">สร้างบัญชีผู้ใช้ใหม่</h1>
          <p className="text-gray-500 mt-2">เริ่มต้นสะสมแต้มรักษ์โลกกับเรา</p>
        </div>

        {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl mb-4 text-center text-sm font-bold border border-red-100">{error}</div>}
        {success && <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl mb-4 text-center text-sm font-bold border border-emerald-100">{success}</div>}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="อีเมล (Email)"
            className="w-full bg-gray-50 text-gray-800 placeholder-gray-400 border border-gray-200 p-4 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="ชื่อที่แสดง (Display Name)"
            className="w-full bg-gray-50 text-gray-800 placeholder-gray-400 border border-gray-200 p-4 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition"
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={4}
          />
          <input
            type="password"
            placeholder="ตั้งรหัสผ่าน (Password)"
            className="w-full bg-gray-50 text-gray-800 placeholder-gray-400 border border-gray-200 p-4 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition"
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <button type="submit" className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold p-4 rounded-2xl transition shadow-lg mt-2">
            ลงทะเบียน
          </button>
        </form>

        <p className="text-center text-gray-500 mt-8">
          มีบัญชีอยู่แล้ว? <Link href="/login" className="text-emerald-600 font-bold hover:underline">เข้าสู่ระบบ</Link>
        </p>
      </div>
    </div>
  );
}
