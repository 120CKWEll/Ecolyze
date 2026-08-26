"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [username, setUsername] = useState<string>("กำลังโหลด...");
  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        // 🌟 ดึงข้อมูลสดๆ จาก Database ทุกครั้งที่เข้าหน้านี้
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const user = await res.json();
          if (isMounted) {
            setUsername(user.username);
            setScore(user.score || 0);
            setLoading(false);
          }
          
          // อัปเดต Local Storage เผื่อไว้ใช้กับหน้าอื่นๆ ด้วย
          localStorage.setItem("user", JSON.stringify(user));
        } else {
            // ถ้า Token หมดอายุให้เด้งไปล็อกอินใหม่
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
  let badgeStyle = "from-amber-600 to-amber-800 text-white";

  if (score >= 500) {
    currentTier = "🥇 Gold Member";
    nextTier = "Platinum Member 💎";
    maxScoreForNextTier = 1000;
    badgeStyle = "from-yellow-400 to-yellow-600 text-white";
  } else if (score >= 100) {
    currentTier = "🥈 Silver Member";
    nextTier = "Gold Member 🥇";
    maxScoreForNextTier = 500;
    badgeStyle = "from-gray-300 to-gray-400 text-gray-800";
  }

  const progressPercent = Math.min((score / maxScoreForNextTier) * 100, 100);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[50vh] animate-fade-in text-gray-500">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-medium">กำลังโหลดข้อมูลโปรไฟล์...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">👤 บัญชีของฉัน</h1>
      
      {/* การ์ดโปรไฟล์ */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-emerald-50 mb-8 flex items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-10"></div>
        <div className="w-28 h-28 bg-gradient-to-tr from-emerald-100 to-teal-100 rounded-full flex items-center justify-center text-6xl shadow-inner border-4 border-white">
          🧑‍🎓
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">{username}</h2>
          <p className="text-gray-500 mb-3 font-medium">มหาวิทยาลัยขอนแก่น</p>
          <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${badgeStyle} px-4 py-1.5 rounded-full text-sm font-bold shadow-sm`}>
            {currentTier}
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold mb-4 text-gray-700">เป้าหมายและการสะสมคะแนน</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-50 text-center hover:-translate-y-1 transition duration-300">
          <div className="text-4xl font-black text-emerald-500 mb-2">{score}</div>
          <p className="text-gray-500 font-medium text-sm">แต้มรักษ์โลกทั้งหมด</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-50 text-center hover:-translate-y-1 transition duration-300">
          <div className="text-4xl font-black text-blue-500 mb-2">1</div>
          <p className="text-gray-500 font-medium text-sm">แยกขยะต่อเนื่อง (วัน)</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-50 text-center hover:-translate-y-1 transition duration-300">
          <div className="text-4xl font-black text-orange-500 mb-2">#--</div>
          <p className="text-gray-500 font-medium text-sm">อันดับนักศึกษา มข.</p>
        </div>
      </div>

      {/* หลอด Progress Bar */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-emerald-50">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h4 className="font-bold text-gray-800">เส้นทางสู่ <span className="text-emerald-600">{nextTier}</span></h4>
            <p className="text-sm text-gray-500">
              สะสมอีก {maxScoreForNextTier - score > 0 ? maxScoreForNextTier - score : 0} แต้มเพื่อเลื่อนระดับ
            </p>
          </div>
          <span className="font-bold text-emerald-600">{score} / {maxScoreForNextTier}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-emerald-400 to-teal-500 h-4 rounded-full relative transition-all duration-1000 ease-out" 
            style={{ width: `${progressPercent}%` }}
          >
             <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}