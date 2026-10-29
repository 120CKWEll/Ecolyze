"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const [username, setUsername] = useState<string>("ผู้ใช้งาน");
  const [score, setScore] = useState<number>(0);
  const [role, setRole] = useState<string>("student");
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    // 1. อ่านจาก Cache ก่อนทันทีเพื่อลดเวลารอ
    try {
      const cached = localStorage.getItem("user");
      if (cached) {
        const u = JSON.parse(cached);
        if (u?.username) setUsername(u.username);
        if (u?.role) setRole(u.role);
        if (typeof u?.score === "number") {
          setScore(u.score);
          setLoading(false);
        }
      }
    } catch {
      // ignore
    }

    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const user = await res.json();
          if (isMounted) {
            setUsername(user.username || "ผู้ใช้งาน");
            setScore(user.score || 0);
            setRole(user.role || "student");
            setLoading(false);
          }
          localStorage.setItem("user", JSON.stringify(user));
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/login");
        }
      } catch (error) {
        console.error("โหลดโปรไฟล์ล้มเหลว", error);
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [router]);

  // ระบบคำนวณระดับสมาชิก (Gamification Logic)
  let currentTier = "🌱 Bronze Member";
  let nextTier = "Silver Member 🥈";
  let maxScoreForNextTier = 100;
  let badgeStyle = "from-amber-700 to-amber-900 text-white";

  if (score >= 500) {
    currentTier = "🥇 Gold Member";
    nextTier = "Platinum Member 💎";
    maxScoreForNextTier = 1000;
    badgeStyle = "from-yellow-500 to-amber-600 text-slate-950 font-black";
  } else if (score >= 100) {
    currentTier = "🥈 Silver Member";
    nextTier = "Gold Member 🥇";
    maxScoreForNextTier = 500;
    badgeStyle = "from-slate-300 to-slate-400 text-slate-900 font-bold";
  }

  const progressPercent = Math.min((score / maxScoreForNextTier) * 100, 100);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[50vh] animate-fade-in text-slate-600">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold">กำลังโหลดข้อมูลโปรไฟล์...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in pb-10">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-6 text-slate-900 tracking-tight">👤 บัญชีของฉัน</h1>

      {/* Admin Panel Access Banner */}
      {role === "admin" && (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-5 md:p-6 text-white shadow-lg shadow-purple-600/20 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shrink-0">
              🛡️
            </div>
            <div>
              <h3 className="font-black text-base md:text-lg flex items-center gap-2">
                คุณมีสิทธิ์ผู้ดูแลระบบ (Admin)
                <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Super Admin
                </span>
              </h3>
              <p className="text-xs text-purple-100 mt-0.5">
                ศูนย์ควบคุม KKU Green Control จัดการรายงาน ถังขยะ ผู้ใช้ และสถิติ
              </p>
            </div>
          </div>
          <Link
            href="/admin"
            className="w-full sm:w-auto text-center bg-white text-purple-700 hover:bg-purple-50 px-5 py-2.5 rounded-xl text-xs font-black shadow-md transition active:scale-95"
          >
            เปิดหน้าแอดมิน →
          </Link>
        </div>
      )}
      
      {/* การ์ดโปรไฟล์ */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80 mb-8 flex flex-col sm:flex-row items-center gap-6 md:gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-10"></div>
        <div className="w-24 h-24 md:w-28 md:h-28 bg-gradient-to-tr from-emerald-100 to-teal-100 rounded-full flex items-center justify-center text-5xl md:text-6xl shadow-inner border-4 border-white shrink-0">
          🧑‍🎓
        </div>
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-1">{username}</h2>
          <p className="text-slate-600 mb-3 font-semibold text-sm">มหาวิทยาลัยขอนแก่น (KKU Green Campus)</p>
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${badgeStyle} px-4 py-1.5 rounded-full text-xs md:text-sm shadow-sm`}>
              {currentTier}
            </div>
            {role === "admin" && (
              <span className="bg-purple-100 text-purple-800 border border-purple-200 px-3 py-1 rounded-full text-xs font-bold">
                🛡️ Admin
              </span>
            )}
          </div>
        </div>
      </div>

      <h3 className="text-xl font-extrabold mb-4 text-slate-900">เป้าหมายและการสะสมคะแนน</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 text-center hover:-translate-y-1 transition duration-300">
          <div className="text-4xl font-black text-emerald-600 mb-2">{score}</div>
          <p className="text-slate-700 font-bold text-sm">แต้มรักษ์โลกทั้งหมด</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 text-center hover:-translate-y-1 transition duration-300">
          <div className="text-4xl font-black text-blue-600 mb-2">1</div>
          <p className="text-slate-700 font-bold text-sm">แยกขยะต่อเนื่อง (วัน)</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 text-center hover:-translate-y-1 transition duration-300">
          <div className="text-4xl font-black text-amber-600 mb-2">Top 5%</div>
          <p className="text-slate-700 font-bold text-sm">อันดับนักศึกษา มข.</p>
        </div>
      </div>

      {/* หลอด Progress Bar */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h4 className="font-extrabold text-slate-900">เส้นทางสู่ <span className="text-emerald-700">{nextTier}</span></h4>
            <p className="text-sm text-slate-600 font-medium">
              สะสมอีก {maxScoreForNextTier - score > 0 ? maxScoreForNextTier - score : 0} แต้มเพื่อเลื่อนระดับ
            </p>
          </div>
          <span className="font-extrabold text-emerald-800 text-base">{score} / {maxScoreForNextTier}</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-teal-600 h-4 rounded-full relative transition-all duration-1000 ease-out" 
            style={{ width: `${progressPercent}%` }}
          >
             <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
