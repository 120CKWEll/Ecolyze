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

// 2. Mock Data ถังขยะ
const wastePoints: WastePoint[] = [
  { id: 1, name: "ศูนย์อาหารคอมเพล็กซ์", lat: 16.4744, lng: 102.8231, type: ["รีไซเคิล", "เปียก", "ทั่วไป"], description: "จุดคัดแยกขยะหลัก" },
  { id: 2, name: "คณะวิศวกรรมศาสตร์", lat: 16.4755, lng: 102.8195, type: ["รีไซเคิล", "อันตราย"], description: "รับขยะอิเล็กทรอนิกส์" },
  { id: 3, name: "หอสมุดกลาง", lat: 16.4715, lng: 102.8235, type: ["รีไซเคิล", "อันตราย"], description: "รับถ่านไฟฉายและกระดาษ" },
];

// 3. ฟังก์ชันคำนวณระยะทาง
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

  const [useCamera, setUseCamera] = useState<boolean>(false);
  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        (error) => console.warn("ไม่สามารถดึงตำแหน่งได้")
      );
    }
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setFileSize((selectedFile.size / (1024 * 1024)).toFixed(1) + " MB");
      setResult(null);
      setNearestPoint(null);
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
    }
  }, [webcamRef]);

  const handleAnalyze = async () => {
    if (!file) return alert("กรุณาเลือกหรือถ่ายรูปภาพก่อนครับ");
    const token = localStorage.getItem("token");
    if (!token) {
      alert("กรุณาเข้าสู่ระบบก่อนใช้ฟีเจอร์สแกนขยะครับ");
      router.push("/login");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });
      
      const data: AnalysisResult = await res.json();
      if (!res.ok) {
        alert(data.error || "เกิดข้อผิดพลาดในการวิเคราะห์");
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
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
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
      case 'รีไซเคิล': return { bg: 'bg-yellow-50', text: 'text-yellow-700', bar: 'bg-yellow-400', icon: '♻️' };
      case 'เปียก': return { bg: 'bg-emerald-50', text: 'text-emerald-700', bar: 'bg-emerald-500', icon: '🍎' };
      case 'อันตราย': return { bg: 'bg-red-50', text: 'text-red-700', bar: 'bg-red-500', icon: '⚠️' };
      default: return { bg: 'bg-blue-50', text: 'text-blue-700', bar: 'bg-blue-500', icon: '🗑️' };
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-10 px-4">
      
      {/* 🌟 ส่วนนำเข้าภาพ (ซ่อนเมื่อมีผลวิเคราะห์แล้วเพื่อให้เหมือนต้นฉบับ) */}
      {!result && (
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-emerald-50 text-center mb-8">
          <div className="flex gap-4 mb-6 justify-center">
            <button onClick={() => { setUseCamera(true); setPreview(null); setFile(null); }} className={`px-6 py-2 rounded-xl font-bold transition-colors ${useCamera ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>📷 เปิดกล้อง</button>
            <button onClick={() => setUseCamera(false)} className={`px-6 py-2 rounded-xl font-bold transition-colors ${!useCamera ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>📁 อัปโหลดไฟล์</button>
          </div>

          {useCamera ? (
            <div className="mb-6 relative rounded-2xl overflow-hidden bg-black flex flex-col items-center">
              <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ facingMode: "environment" }} className="w-full max-h-[400px] object-cover" />
              <button onClick={captureImage} className="absolute bottom-4 bg-white text-emerald-600 px-8 py-3 rounded-full font-black shadow-lg hover:scale-105 transition-transform">📸 ถ่ายรูป</button>
            </div>
          ) : (
            <label className="block w-full cursor-pointer bg-gray-50 border-2 border-dashed border-gray-300 hover:border-emerald-400 hover:bg-emerald-50 transition rounded-2xl p-8 mb-6 relative overflow-hidden group">
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              {preview ? (
                <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-xl object-contain relative z-10 drop-shadow-md group-hover:scale-105 transition-transform" />
              ) : (
                <div className="text-gray-400 flex flex-col items-center group-hover:text-emerald-500 transition-colors">
                  <span className="text-5xl mb-3">📂</span>
                  <span className="font-bold">คลิกเพื่อเลือกรูปภาพ</span>
                </div>
              )}
            </label>
          )}

          <button onClick={handleAnalyze} disabled={loading || !file} className={`w-full text-white font-bold text-lg py-4 px-6 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 ${loading || !file ? "bg-gray-300 cursor-not-allowed shadow-none" : "bg-emerald-500 hover:bg-emerald-600 hover:-translate-y-1 shadow-emerald-200"}`}>
            {loading ? <><span className="animate-spin text-2xl">⏳</span> กำลังให้ AI วิเคราะห์...</> : <>✨ วิเคราะห์ประเภทขยะเลย</>}
          </button>
        </div>
      )}

      {/* 🌟 ส่วนแสดงผลลัพธ์ (UI ใหม่ตามภาพอ้างอิง) */}
      {result && !result.error && (
        <div className="flex flex-col gap-6 animate-fade-in-up">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: รูปภาพและรายละเอียดไฟล์ */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
              <div className="w-full bg-blue-50/50 rounded-2xl p-4 flex flex-col items-center justify-center mb-4 min-h-[200px]">
                 {preview && <img src={preview} alt="Analyzed waste" className="max-h-48 object-contain rounded-lg drop-shadow-sm mb-3" />}
                 <div className="flex items-center gap-2 text-emerald-600 font-bold">
                    <span>✨</span> {result.objectName}
                 </div>
                 <p className="text-xs text-gray-400 mt-1">รูปตัวอย่าง</p>
              </div>
              <div className="text-xs text-gray-500 font-medium text-center space-y-1">
                <p>🕒 วิเคราะห์เมื่อ: วันนี้ {new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</p>
                <p>📄 ขนาดไฟล์: {fileSize}</p>
              </div>
            </div>

            {/* Card 2: ความแม่นยำและประเภท */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col">
              
              {/* แถบประเภทขยะ */}
              <div className={`p-4 rounded-2xl flex items-center gap-4 mb-6 border border-white ${getWasteTypeStyles(result.wasteType).bg}`}>
                <span className="text-3xl bg-white p-2 rounded-xl shadow-sm">{getWasteTypeStyles(result.wasteType).icon}</span>
                <div>
                  <h3 className={`text-xl font-black ${getWasteTypeStyles(result.wasteType).text}`}>{result.wasteType}</h3>
                  <p className={`text-sm font-medium ${getWasteTypeStyles(result.wasteType).text} opacity-80`}>
                    {result.wasteType === 'รีไซเคิล' ? 'Recyclable Waste' : result.wasteType === 'เปียก' ? 'Organic Waste' : result.wasteType === 'อันตราย' ? 'Hazardous Waste' : 'General Waste'}
                  </p>
                </div>
              </div>

              {/* Progress Bar ความแม่นยำ */}
              <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                  <h4 className="font-bold text-gray-800 flex items-center gap-2"><span className="text-emerald-500">📈</span> ความแม่นยำ</h4>
                  <span className="text-2xl font-black text-emerald-500">{result.confidence}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className={`${getWasteTypeStyles(result.wasteType).bar} h-3 rounded-full transition-all duration-1000`} style={{ width: `${result.confidence}%` }}></div>
                </div>
              </div>

              {/* ความเป็นไปได้อื่นๆ (UI จำลองให้ตรงกับภาพ) */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex-1">
                <h4 className="font-bold text-gray-700 mb-3 text-sm flex items-center gap-2"><span>🗂️</span> ความเป็นไปได้อื่นๆ</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-50">
                    <span className="text-gray-600">ประเภทใกล้เคียง 1</span>
                    <span className="font-bold text-gray-400">{Math.max(0, 100 - result.confidence - 2)}%</span>
                  </div>
                  <div className="flex justify-between text-sm bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-50">
                    <span className="text-gray-600">ประเภทใกล้เคียง 2</span>
                    <span className="font-bold text-gray-400">2%</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Card 3: คำแนะนำการทิ้งขยะ */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
            <h3 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
              <span>♻️</span> คำแนะนำการทิ้งขยะ
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* วิธีการเตรียม */}
              <div className="border border-orange-200 bg-orange-50/30 rounded-2xl p-6">
                <h4 className="font-bold text-orange-800 mb-4 flex items-center gap-2"><span>🖐️</span> วิธีการเตรียมก่อนทิ้ง</h4>
                <ul className="space-y-3">
                  {result.advice.map((text, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">{index + 1}</span>
                      <span className="text-gray-700 text-sm leading-relaxed">{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* จุดทิ้งที่แนะนำ (ประยุกต์ใช้ข้อมูลจาก nearestPoint) */}
              <div className="border border-yellow-200 bg-yellow-50/30 rounded-2xl p-6">
                <h4 className="font-bold text-yellow-800 mb-4 flex items-center gap-2"><span>📍</span> จุดทิ้งที่แนะนำ</h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                    <span className="text-gray-700 text-sm leading-relaxed">
                      ทิ้งลง <b>ถังขยะสี{result.wasteType === 'รีไซเคิล' ? 'เหลือง' : result.wasteType === 'เปียก' ? 'เขียว' : result.wasteType === 'อันตราย' ? 'แดง' : 'น้ำเงิน'}</b> (ขยะ{result.wasteType})
                    </span>
                  </li>
                  {nearestPoint && (
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                      <span className="text-gray-700 text-sm leading-relaxed">
                        จุดทิ้งใกล้คุณที่สุด: <b>{nearestPoint.name}</b> <br/>
                        <span className="text-xs text-gray-500">({(getDistanceFromLatLonInKm(userLocation!.lat, userLocation!.lng, nearestPoint.lat, nearestPoint.lng) * 1000).toFixed(0)} เมตรจากตำแหน่งของคุณ)</span>
                      </span>
                    </li>
                  )}
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                    <span className="text-gray-700 text-sm leading-relaxed">ธนาคารขยะรีไซเคิล มข. (ถ้ามี)</span>
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
              className={`px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-transform ${nearestPoint ? 'bg-emerald-500 hover:bg-emerald-600 text-white hover:scale-105 shadow-md' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              <span>📍</span> ดูจุดทิ้งใกล้เคียง
            </button>
            <button 
              onClick={() => { setResult(null); setFile(null); setPreview(null); }}
              className="px-8 py-3 rounded-full font-bold flex items-center gap-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <span>⬆️</span> วิเคราะห์รูปใหม่
            </button>
            <button 
              onClick={() => alert("ระบบแชร์ผลลัพธ์กำลังอยู่ในช่วงพัฒนาครับ!")}
              className="px-8 py-3 rounded-full font-bold flex items-center gap-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <span>🔗</span> แชร์ผลลัพธ์
            </button>
          </div>

        </div>
      )}
    </div>
  );
}