"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// สร้าง Interface รับข้อมูลจาก API
interface HistoryItem {
  _id: string;
  objectName: string;
  wasteType: string;
  pointsEarned: number;
  createdAt: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("กรุณาเข้าสู่ระบบก่อนครับ");
        router.push("/login");
        return;
      }

      try {
        const res = await fetch("/api/history", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        } else {
          console.error("โหลดประวัติไม่สำเร็จ");
        }
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการโหลด");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [router]);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">📜 ประวัติการคัดแยกขยะ</h1>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
           <div className="p-8 text-center text-gray-500">⏳ กำลังโหลดประวัติ...</div>
        ) : history.length === 0 ? (
           <div className="p-12 text-center text-gray-400">
             <div className="text-6xl mb-4">📭</div>
             <p className="font-bold text-lg">ยังไม่มีประวัติการสแกนขยะ</p>
             <p className="text-sm mt-2">ไปที่เมนู “สแกนขยะ” เพื่อเริ่มต้นสะสมแต้มกันเลย!</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                  <th className="p-4 pl-6">วันที่ทำรายการ</th>
                  <th className="p-4">สิ่งที่วิเคราะห์</th>
                  <th className="p-4 text-center">หมวดหมู่</th>
                  <th className="p-4 pr-6 text-right">คะแนนที่ได้</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="p-4 pl-6 text-gray-500 text-sm">
                      {new Date(item.createdAt).toLocaleDateString("th-TH", {
                        year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                      })}
                    </td>
                    <td className="p-4 font-bold text-gray-700">📸 {item.objectName}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        item.wasteType === 'รีไซเคิล' ? 'bg-blue-100 text-blue-600' :
                        item.wasteType === 'เปียก' ? 'bg-emerald-100 text-emerald-600' :
                        item.wasteType === 'อันตราย' ? 'bg-red-100 text-red-600' :
                        'bg-orange-100 text-orange-600'
                      }`}>
                        {item.wasteType}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right font-black text-emerald-500">
                      +{item.pointsEarned}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}