"use client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    // ยืนยันก่อนออกจากระบบ
    if (window.confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
      // 1. ลบข้อมูลผู้ใช้และ Token ออกจากเครื่อง
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // 2. พาผู้ใช้กลับไปที่หน้า Login
      router.push("/login");
    }
  };

  return (
    <button 
      onClick={handleLogout}
      className="mt-auto p-3 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition flex items-center gap-3 group w-full text-left"
    >
      <span className="text-xl group-hover:-translate-x-1 transition-transform">🚪</span> 
      ออกจากระบบ
    </button>
  );
}