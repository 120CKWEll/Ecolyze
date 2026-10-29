"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Interface รับข้อมูลจาก API
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
    <div className="max-w-4xl mx-auto animate-fade-in pb-10">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-6 text-slate-900 tracking-tight">
        📜 ประวัติการคัดแยกขยะ
      </h1>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/80 overflow-hidden">
        {loading ? (
           <div className="p-12 text-center text-slate-600 font-medium">⏳ กำลังโหลดประวัติ...</div>
        ) : history.length === 0 ? (
           <div className="p-12 text-center text-slate-500">
             <div className="text-6xl mb-4">📭</div>
             <p className="font-extrabold text-lg text-slate-800">ยังไม่มีประวัติการสแกนขยะ</p>
             <p className="text-sm mt-2 text-slate-600">ไปที่เมนู “สแกนขยะ” เพื่อเริ่มต้นสะสมแต้มกันเลย!</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold text-sm">
                  <th className="p-4 pl-6">วันที่ทำรายการ</th>
                  <th className="p-4">สิ่งที่วิเคราะห์</th>
                  <th className="p-4 text-center">หมวดหมู่</th>
                  <th className="p-4 pr-6 text-right">คะแนนที่ได้</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition">
                    <td className="p-4 pl-6 text-slate-600 font-medium text-sm">
                      {new Date(item.createdAt).toLocaleDateString("th-TH", {
                        year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                      })}
                    </td>
                    <td className="p-4 font-bold text-slate-900">📸 {item.objectName}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        item.wasteType === 'รีไซเคิล' ? 'bg-yellow-100 text-yellow-900 border border-yellow-300' :
                        item.wasteType === 'เปียก' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                        item.wasteType === 'อันตราย' ? 'bg-red-100 text-red-900 border border-red-300' :
                        'bg-blue-100 text-blue-900 border border-blue-300'
                      }`}>
                        {item.wasteType}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right font-black text-emerald-700 text-base">
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