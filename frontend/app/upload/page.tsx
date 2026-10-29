"use client";
import { useState, ChangeEvent, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Webcam from "react-webcam";

// 1. Interfaces
interface AnalysisResult {
  objectName: string;
  wasteType: string;
  confidence: number;
  advice: string[];
  pointsEarned?: number;
  error?: string;
}

interface WastePoint {
  id: number;
  name: string;
  lat: number;
  lng: number;
  type: string[];
  description: string;
}

// 2. Data จุดทิ้งขยะ มข. (ครบทุก 9 จุด)
const wastePoints: WastePoint[] = [
  { id: 1, name: "ศูนย์อาหารคอมเพล็กซ์ (Complex)", lat: 16.4744, lng: 102.8231, type: ["รีไซเคิล", "เปียก", "ขยะเปียก", "ทั่วไป"], description: "จุดคัดแยกขยะหลัก" },
  { id: 2, name: "คณะวิศวกรรมศาสตร์ (ตึก EN)", lat: 16.4755, lng: 102.8195, type: ["รีไซเคิล", "อันตราย", "E-Waste"], description: "รับขยะอิเล็กทรอนิกส์และรีไซเคิล" },
  { id: 3, name: "หอสมุดกลาง (ศูนย์สื่อการเรียนรู้)", lat: 16.4715, lng: 102.8235, type: ["รีไซเคิล", "อันตราย"], description: "รับถ่านไฟฉายและกระดาษ" },
  { id: 4, name: "คณะวิทยาศาสตร์ (อาคาร SC06)", lat: 16.4735, lng: 102.8205, type: ["รีไซเคิล", "ทั่วไป"], description: "ถังขยะแยกประเภทใต้อาคาร" },
  { id: 5, name: "กองจัดการสาธารณูปโภคพลังงานและสิ่งแวดล้อม", lat: 16.4862, lng: 102.8276, type: ["รีไซเคิล", "อันตราย", "ทั่วไป"], description: "หน่วยงานหลักดูแลการจัดการขยะ มข." },
  { id: 6, name: "อุทยานเทคโนโลยีการเกษตร", lat: 16.4465, lng: 102.8130, type: ["ขยะเปียก", "เปียก", "ทั่วไป"], description: "จุดคัดแยกขยะอินทรีย์" },
  { id: 7, name: "ศูนย์อาหารและบริการ 3 (หนองแวง)", lat: 16.4655, lng: 102.8288, type: ["ขยะเปียก", "เปียก", "ทั่วไป", "รีไซเคิล"], description: "จุดทิ้งเศษอาหารและขยะพลาสติก" },
  { id: 8, name: "ศูนย์อาหารและบริการ 4 (อาคารจอดรถ 1)", lat: 16.4750, lng: 102.8260, type: ["รีไซเคิล", "ขยะเปียก", "เปียก"], description: "จุดคัดแยกขยะบริเวณโซนร้านอาหาร" },
  { id: 9, name: "ภาควิชาวิศวกรรมสิ่งแวดล้อม", lat: 16.4760, lng: 102.8185, type: ["รีไซเคิล", "อันตราย"], description: "จุดรณรงค์คัดแยกขยะอันตราย" }
];

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const dataURLtoFile = (dataurl: string, filename: string) => {
  const arr = dataurl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch) return null;
  const mime = mimeMatch[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [fileSize, setFileSize] = useState<string>("");

  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [nearestPoint, setNearestPoint] = useState<WastePoint | null>(null);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);

  const [useCamera, setUseCamera] = useState<boolean>(false);
  const webcamRef = useRef<Webcam>(null);

  const fetchLiveLocation = useCallback(() => {
    // 1. ตรวจสอบพิกัดที่ผู้ใช้เคยปรับ/ปักหมุดไว้จากหน้าแผนที่
    try {
      const saved = localStorage.getItem("user_calibrated_location");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.lat === "number" && typeof parsed.lng === "number") {
          setUserLocation({ lat: parsed.lat, lng: parsed.lng });
          return;
        }
      }
    } catch {
      // ignore
    }

    // 2. ถ้าไม่มี ให้ดึง GPS สด
    if (navigator.geolocation) {
      setGpsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setGpsLoading(false);
        },
        (err) => {
          console.warn("ไม่สามารถดึงตำแหน่งได้:", err);
          setGpsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, []);

  useEffect(() => {
    fetchLiveLocation();
  }, [fetchLiveLocation]);

  const [authError, setAuthError] = useState<string | null>(null);
  const [nonWasteError, setNonWasteError] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setFileSize((selectedFile.size / (1024 * 1024)).toFixed(1) + " MB");
      setResult(null);
      setNearestPoint(null);
      setNonWasteError(null);
      setAuthError(null);
    }
  };

  const captureImage = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setPreview(imageSrc);
      const newFile = dataURLtoFile(imageSrc, 'captured-waste.jpg');
      if (newFile) {
        setFile(newFile);
        setFileSize((newFile.size / (1024 * 1024)).toFixed(1) + " MB");
      }
      setUseCamera(false);
      setResult(null);
      setNearestPoint(null);
      setNonWasteError(null);
      setAuthError(null);
    }
  }, [webcamRef]);

  const handleAnalyze = async () => {
    if (!file) return alert("กรุณาเลือกหรือถ่ายรูปภาพก่อนครับ");
    const token = localStorage.getItem("token");
    if (!token) {
      setAuthError("กรุณาเข้าสู่ระบบก่อนใช้ฟีเจอร์สแกนขยะเพื่อสะสมแต้มครับ");
      return;
    }

    setLoading(true);
    setNonWasteError(null);
    setAuthError(null);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });
      
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setAuthError(data.error || "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้งครับ");
        } else if (res.status === 422 || data.isWaste === false) {
          setNonWasteError(data.error || "ตรวจพบวัตถุที่ไม่ใช่ขยะ กรุณาถ่ายภาพขยะที่ต้องการคัดแยก");
        } else {
          setNonWasteError(data.error || "เกิดข้อผิดพลาดในการวิเคราะห์");
        }
        setLoading(false);
        return;
      }

      setResult(data);

      if (userLocation && data.wasteType) {
        const availablePoints = wastePoints.filter(p => p.type.includes(data.wasteType));
        if (availablePoints.length > 0) {
          let closest = availablePoints[0];
          let minDistance = getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, closest.lat, closest.lng);
          for (let i = 1; i < availablePoints.length; i++) {
            const dist = getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, availablePoints[i].lat, availablePoints[i].lng);
            if (dist < minDistance) {
              minDistance = dist;
              closest = availablePoints[i];
            }
          }
          setNearestPoint(closest);
        }
      }
    } catch {
      setNonWasteError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const openGoogleMaps = () => {
    if (userLocation && nearestPoint) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${nearestPoint.lat},${nearestPoint.lng}&travelmode=driving`;
      window.open(url, '_blank');
    }
  };

  const getWasteTypeStyles = (type: string) => {
    switch(type) {
      case 'รีไซเคิล': return { bg: 'bg-yellow-50', text: 'text-yellow-900', border: 'border-yellow-300', bar: 'bg-yellow-400', icon: '♻️' };
      case 'เปียก': return { bg: 'bg-emerald-50', text: 'text-emerald-900', border: 'border-emerald-300', bar: 'bg-emerald-500', icon: '🍎' };
      case 'อันตราย': return { bg: 'bg-red-50', text: 'text-red-900', border: 'border-red-300', bar: 'bg-red-500', icon: '⚠️' };
      default: return { bg: 'bg-blue-50', text: 'text-blue-900', border: 'border-blue-300', bar: 'bg-blue-500', icon: '🗑️' };
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-10 px-2 md:px-4">
      
      {/* แบนเนอร์แจ้งเตือนเมื่อยังไม่ได้ล็อกอิน */}
      {authError && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-[2rem] p-6 mb-6 shadow-md animate-fade-in">
          <div className="flex items-start gap-4">
            <span className="text-4xl shrink-0">🔒</span>
            <div className="flex-1">
              <h3 className="font-extrabold text-amber-950 text-lg md:text-xl mb-1">
                กรุณาเข้าสู่ระบบก่อนทำการสแกน
              </h3>
              <p className="text-amber-900 text-sm font-semibold leading-relaxed">
                {authError}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => router.push("/login")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs md:text-sm shadow-md transition active:scale-95 flex items-center gap-1.5"
                >
                  <span>🔑</span>
                  <span>เข้าสู่ระบบตอนนี้</span>
                </button>
                <button
                  onClick={() => setAuthError(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2.5 rounded-xl text-xs md:text-sm transition"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* แบนเนอร์แจ้งเตือนเมื่อตรวจพบว่าไม่ใช่ขยะ */}
      {nonWasteError && (
        <div className="bg-red-50 border-2 border-red-300 rounded-[2rem] p-6 mb-6 shadow-md animate-fade-in">
          <div className="flex items-start gap-4">
            <span className="text-4xl shrink-0">🚫</span>
            <div>
              <h3 className="font-extrabold text-red-950 text-lg md:text-xl mb-1">
                ตรวจพบวัตถุที่ไม่ใช่ขยะ (Non-Waste Detected)
              </h3>
              <p className="text-red-900 text-sm font-semibold leading-relaxed">
                {nonWasteError}
              </p>
              
              <div className="mt-4 bg-white/80 border border-red-200 rounded-2xl p-4 text-xs font-bold text-slate-800">
                <p className="text-slate-900 font-extrabold mb-2 flex items-center gap-1.5">
                  <span>💡</span> ตัวอย่างขยะที่ระบบรองรับในการสแกน:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <span className="bg-amber-50 text-amber-950 border border-amber-200 p-2 rounded-xl">🟡 ขวดน้ำ / ลังกระดาษ</span>
                  <span className="bg-emerald-50 text-emerald-950 border border-emerald-200 p-2 rounded-xl">🟢 เศษอาหาร / เปลือกผลไม้</span>
                  <span className="bg-blue-50 text-blue-950 border border-blue-200 p-2 rounded-xl">🔵 กล่องโฟม / ซองขนม</span>
                  <span className="bg-red-50 text-red-950 border border-red-200 p-2 rounded-xl">🔴 ถ่านไฟฉาย / หลอดไฟ</span>
                </div>
              </div>

              <button
                onClick={() => { setNonWasteError(null); setFile(null); setPreview(null); }}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs md:text-sm shadow-md transition active:scale-95"
              >
                📸 ถ่ายหรือเลือกภาพขยะใหม่
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ส่วนนำเข้าภาพ */}
      {!result && (
        <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200/80 text-center mb-8">
          <div className="flex gap-4 mb-6 justify-center">
            <button
              onClick={() => { setUseCamera(true); setPreview(null); setFile(null); }}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all ${
                useCamera ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              📷 เปิดกล้อง
            </button>
            <button
              onClick={() => setUseCamera(false)}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all ${
                !useCamera ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              📁 อัปโหลดไฟล์
            </button>
          </div>

          {useCamera ? (
            <div className="mb-6 relative rounded-2xl overflow-hidden bg-black flex flex-col items-center">
              <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ facingMode: "environment" }} className="w-full max-h-[400px] object-cover" />
              <button onClick={captureImage} className="absolute bottom-4 bg-white text-emerald-800 px-8 py-3 rounded-full font-black shadow-lg hover:scale-105 transition-transform">📸 ถ่ายรูป</button>
            </div>
          ) : (
            <label className="block w-full cursor-pointer bg-slate-50 border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50 transition rounded-2xl p-8 mb-6 relative overflow-hidden group">
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              {preview ? (
                <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-xl object-contain relative z-10 drop-shadow-md group-hover:scale-105 transition-transform" />
              ) : (
                <div className="text-slate-500 flex flex-col items-center group-hover:text-emerald-700 transition-colors py-6">
                  <span className="text-5xl mb-3">📂</span>
                  <span className="font-extrabold text-base text-slate-800 group-hover:text-emerald-700">คลิกเพื่อเลือกรูปภาพขยะ</span>
                  <span className="text-xs text-slate-500 mt-1">รองรับ JPG, PNG, WEBP</span>
                </div>
              )}
            </label>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading || !file}
            className={`w-full text-white font-extrabold text-lg py-4 px-6 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 ${
              loading || !file
                ? "bg-slate-300 cursor-not-allowed shadow-none text-slate-500"
                : "bg-emerald-600 hover:bg-emerald-700 hover:-translate-y-1 shadow-emerald-600/30 active:scale-95"
            }`}
          >
            {loading ? <><span className="animate-spin text-2xl">⏳</span> กำลังให้ AI วิเคราะห์...</> : <>✨ วิเคราะห์ประเภทขยะเลย</>}
          </button>
        </div>
      )}

      {/* ส่วนแสดงผลลัพธ์ */}
      {result && !result.error && (
        <div className="flex flex-col gap-6 animate-fade-in">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: รูปภาพและรายละเอียดไฟล์ */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200/80 flex flex-col items-center justify-center">
              <div className="w-full bg-slate-50 rounded-2xl p-4 flex flex-col items-center justify-center mb-4 min-h-[200px] border border-slate-100">
                 {preview && <img src={preview} alt="Analyzed waste" className="max-h-48 object-contain rounded-lg drop-shadow-sm mb-3" />}
                 <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-lg">
                    <span>✨</span> {result.objectName}
                 </div>
                 <p className="text-xs text-slate-500 mt-1 font-semibold">ภาพถ่ายจากการสแกน</p>
              </div>
              <div className="text-xs text-slate-600 font-bold text-center space-y-1">
                <p>🕒 วิเคราะห์เมื่อ: วันนี้ {new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</p>
                <p>📄 ขนาดไฟล์: {fileSize}</p>
              </div>
            </div>

            {/* Card 2: ความแม่นยำและประเภท */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200/80 flex flex-col">
              
              {/* แถบประเภทขยะ */}
              <div className={`p-4 rounded-2xl flex items-center gap-4 mb-6 border ${getWasteTypeStyles(result.wasteType).bg} ${getWasteTypeStyles(result.wasteType).border}`}>
                <span className="text-3xl bg-white p-2 rounded-xl shadow-sm">{getWasteTypeStyles(result.wasteType).icon}</span>
                <div>
                  <h3 className={`text-2xl font-black ${getWasteTypeStyles(result.wasteType).text}`}>ขยะ{result.wasteType}</h3>
                  <p className={`text-xs font-bold ${getWasteTypeStyles(result.wasteType).text} opacity-90`}>
                    {result.wasteType === 'รีไซเคิล' ? 'Recyclable Waste' : result.wasteType === 'เปียก' ? 'Organic Waste' : result.wasteType === 'อันตราย' ? 'Hazardous Waste' : 'General Waste'}
                  </p>
                </div>
              </div>

              {/* Progress Bar ความแม่นยำ */}
              <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                  <h4 className="font-extrabold text-slate-900 flex items-center gap-2">
                    <span className="text-emerald-600">📈</span> ความแม่นยำของ AI
                  </h4>
                  <span className="text-2xl font-black text-emerald-700">{result.confidence}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div className={`${getWasteTypeStyles(result.wasteType).bar} h-3 rounded-full transition-all duration-1000`} style={{ width: `${result.confidence}%` }}></div>
                </div>
              </div>

              {/* ความเป็นไปได้อื่นๆ */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex-1">
                <h4 className="font-bold text-slate-800 mb-3 text-sm flex items-center gap-2"><span>🗂️</span> ความเป็นไปได้อื่นๆ</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm bg-white px-3 py-2 rounded-lg shadow-sm border border-slate-100">
                    <span className="text-slate-700 font-medium">ประเภทใกล้เคียง 1</span>
                    <span className="font-bold text-slate-500">{Math.max(0, 100 - result.confidence - 2)}%</span>
                  </div>
                  <div className="flex justify-between text-sm bg-white px-3 py-2 rounded-lg shadow-sm border border-slate-100">
                    <span className="text-slate-700 font-medium">ประเภทใกล้เคียง 2</span>
                    <span className="font-bold text-slate-500">2%</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Card 3: คำแนะนำการทิ้งขยะ */}
          <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200/80">
            <h3 className="text-2xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
              <span>♻️</span> คำแนะนำการทิ้งขยะอย่างถูกต้อง
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* วิธีการเตรียม */}
              <div className="border border-orange-200 bg-orange-50/50 rounded-2xl p-6">
                <h4 className="font-extrabold text-orange-950 mb-4 flex items-center gap-2"><span>🖐️</span> วิธีการเตรียมก่อนทิ้ง</h4>
                <ul className="space-y-3">
                  {result.advice.map((text, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">{index + 1}</span>
                      <span className="text-slate-800 text-sm font-semibold leading-relaxed">{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* จุดทิ้งที่แนะนำ */}
              <div className="border border-yellow-200 bg-yellow-50/50 rounded-2xl p-6">
                <h4 className="font-extrabold text-yellow-950 mb-4 flex items-center gap-2"><span>📍</span> จุดทิ้งที่แนะนำ</h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                    <span className="text-slate-800 text-sm font-semibold leading-relaxed">
                      ทิ้งลง <b>ถังขยะสี{result.wasteType === 'รีไซเคิล' ? 'เหลือง' : result.wasteType === 'เปียก' ? 'เขียว' : result.wasteType === 'อันตราย' ? 'แดง' : 'น้ำเงิน'}</b> (ขยะ{result.wasteType})
                    </span>
                  </li>
                  {nearestPoint && (
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                      <span className="text-slate-800 text-sm font-semibold leading-relaxed">
                        จุดทิ้งใกล้คุณที่สุด: <b>{nearestPoint.name}</b> <br/>
                        <span className="text-xs text-slate-600 font-medium">({(getDistanceFromLatLonInKm(userLocation!.lat, userLocation!.lng, nearestPoint.lat, nearestPoint.lng) * 1000).toFixed(0)} เมตรจากตำแหน่งของคุณ)</span>
                      </span>
                    </li>
                  )}
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                    <span className="text-slate-800 text-sm font-semibold leading-relaxed">ธนาคารขยะรีไซเคิล มหาวิทยาลัยขอนแก่น</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-4">
            <button 
              onClick={openGoogleMaps}
              disabled={!nearestPoint}
              className={`px-8 py-3.5 rounded-full font-bold flex items-center gap-2 transition-transform ${nearestPoint ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-105 shadow-md' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
            >
              <span>📍</span> ดูจุดทิ้งใกล้เคียง
            </button>
            <button 
              onClick={() => { setResult(null); setFile(null); setPreview(null); }}
              className="px-8 py-3.5 rounded-full font-bold flex items-center gap-2 bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <span>⬆️</span> วิเคราะห์รูปใหม่
            </button>
          </div>

        </div>
      )}
    </div>
  );
}