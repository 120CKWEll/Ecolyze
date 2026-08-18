"use client";
import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";

// 1. โครงสร้างข้อมูล
interface WastePoint {
  id: number;
  name: string;
  lat: number;
  lng: number;
  type: string[];
  description: string;
}

// 2. รายการจุดทิ้งขยะ มข. (อยู่ระดับ Module เพื่อให้ข้อมูลคงที่ ไม่ต้องเป็น Dependency ของ Effect)
const wastePoints: WastePoint[] = [
  { id: 1, name: "ศูนย์อาหารคอมเพล็กซ์", lat: 16.4744, lng: 102.8231, type: ["รีไซเคิล", "ขยะเปียก", "ทั่วไป"], description: "จุดคัดแยกขยะหลัก บริเวณทางเข้าและในโรงอาหาร" },
  { id: 2, name: "คณะวิศวกรรมศาสตร์", lat: 16.4755, lng: 102.8195, type: ["รีไซเคิล", "E-Waste"], description: "จุดรับขยะอิเล็กทรอนิกส์และรีไซเคิล ใกล้ตึก EN" },
  { id: 3, name: "หอสมุดกลาง (ศูนย์สื่อการเรียนรู้)", lat: 16.4715, lng: 102.8235, type: ["รีไซเคิล", "อันตราย"], description: "จุดรับถ่านไฟฉาย ขยะอิเล็กทรอนิกส์ และกระดาษ" },
  { id: 4, name: "คณะวิทยาศาสตร์ (SC06)", lat: 16.4735, lng: 102.8205, type: ["รีไซเคิล", "ทั่วไป"], description: "ถังขยะแยกประเภทบริเวณใต้อาคาร" },
  { id: 5, name: "กองจัดการสาธารณูปโภคพลังงานและสิ่งแวดล้อม", lat: 16.4862, lng: 102.8276, type: ["รีไซเคิล", "อันตราย", "ทั่วไป"], description: "หน่วยงานหลักดูแลการจัดการขยะของ มข." },
  { id: 6, name: "อุทยานเทคโนโลยีการเกษตร", lat: 16.4465, lng: 102.8130, type: ["ขยะอินทรีย์", "ทั่วไป"], description: "จุดคัดแยกขยะอินทรีย์และขยะทั่วไปบริเวณพื้นที่ทดลอง" },
  { id: 7, name: "ศูนย์อาหารและบริการ 3 (หนองแวง)", lat: 16.4655, lng: 102.8288, type: ["ขยะเปียก", "ทั่วไป", "รีไซเคิล"], description: "จุดทิ้งเศษอาหารและขยะพลาสติกภายในศูนย์อาหาร" },
  { id: 8, name: "ศูนย์อาหารและบริการ 4 (อาคารที่จอดรถ 1)", lat: 16.4750, lng: 102.8260, type: ["รีไซเคิล", "ขยะเปียก"], description: "จุดคัดแยกขยะบริเวณโซนร้านอาหาร" },
  { id: 9, name: "ภาควิชาวิศวกรรมสิ่งแวดล้อม", lat: 16.4760, lng: 102.8185, type: ["รีไซเคิล", "อันตราย"], description: "จุดรณรงค์คัดแยกขยะและทิ้งขยะอันตราย" }
];

export default function MapPage() {
  const [selectedPoint, setSelectedPoint] = useState<WastePoint | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    let disposed = false;

    import("leaflet").then((L) => {
      const container = mapContainerRef.current;
      if (!container || disposed) return;

      const map = L.map(container).setView([16.4730, 102.8230], 15);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      // 🌟 ระบบค้นหาตำแหน่งผู้ใช้งาน (Geolocation)
      map.locate({ setView: false, maxZoom: 16 });

      map.on("locationfound", (e) => {
        // บันทึกตำแหน่งลง State
        setUserLocation({ lat: e.latlng.lat, lng: e.latlng.lng });

        // สร้างจุดสีฟ้า (Blue Dot) แบบ Google Maps
        const userIcon = L.divIcon({
          html: `<div class="w-5 h-5 bg-blue-500 rounded-full border-4 border-white shadow-md relative">
                   <div class="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75"></div>
                 </div>`,
          className: '',
          iconSize: [20, 20]
        });

        L.marker(e.latlng, { icon: userIcon }).addTo(map)
          .bindPopup('<div class="font-bold text-blue-600">📍 ตำแหน่งปัจจุบันของคุณ</div>');

        // วาดวงกลมแสดงความแม่นยำของ GPS
        L.circle(e.latlng, { radius: e.accuracy / 2, color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.15, weight: 1 }).addTo(map);
      });

      map.on("locationerror", () => {
        console.warn("ไม่สามารถดึงตำแหน่ง GPS ได้ กรุณาเปิด Location Service");
      });

      // 🌟 สร้างไอคอนถังขยะและปักหมุด
      const trashIcon = L.divIcon({
        html: '🗑️',
        className: 'text-2xl bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg border-2 border-emerald-500 hover:scale-110 transition-transform',
        iconSize: [40, 40]
      });

      wastePoints.forEach((point) => {
        const marker = L.marker([point.lat, point.lng], { icon: trashIcon }).addTo(map);

        marker.bindPopup(`
          <div class="p-1">
            <h4 class="font-bold text-emerald-700">${point.name}</h4>
            <p class="text-xs text-gray-500">${point.description}</p>
          </div>
        `);

        marker.on('click', () => setSelectedPoint(point));
      });
    });

    return () => {
      disposed = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // 🌟 ฟังก์ชันคำนวณและเปิดระบบนำทาง (Google Maps Directions API)
  const openGoogleMapsDirections = (destLat: number, destLng: number) => {
    // ถ้าจับ GPS ผู้ใช้ได้ จะให้เริ่มจากจุดที่ยืนอยู่ ถ้าจับไม่ได้ Google Maps จะหา Current Location ให้อัตโนมัติ
    const originParam = userLocation ? `&origin=${userLocation.lat},${userLocation.lng}` : "";
    const url = `https://www.google.com/maps/dir/?api=1${originParam}&destination=${destLat},${destLng}&travelmode=driving`;

    // เปิด Google Maps ในแท็บใหม่ หรือแอปบนมือถือ
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col animate-fade-in">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-emerald-700">📍 แผนที่จุดทิ้งขยะ</h1>
          <p className="text-gray-500 font-medium text-sm md:text-base">ค้นหาจุดคัดแยกขยะที่ใกล้ที่สุดในมหาวิทยาลัยขอนแก่น</p>
        </div>
        {/* แสดงสถานะ GPS */}
        {userLocation && (
           <span className="hidden md:flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full text-xs font-bold border border-blue-100">
             <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> พบตำแหน่งของคุณแล้ว
           </span>
        )}
      </div>

      <div className="bg-white p-2 rounded-[2.5rem] shadow-xl shadow-emerald-900/5 border border-emerald-50 flex-1 min-h-[400px] mb-6 relative z-0 overflow-hidden">
        <div ref={mapContainerRef} id="map-container" className="w-full h-full rounded-[2rem] z-0 relative"></div>
      </div>

      <div className={`bg-white p-6 rounded-3xl shadow-lg border border-emerald-50 transition-all duration-500 ${selectedPoint ? 'opacity-100 translate-y-0' : 'opacity-80'}`}>
        {selectedPoint ? (
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-5 items-center w-full md:w-auto">
                <div className="min-w-[4rem] h-16 bg-emerald-50 text-emerald-600 border-2 border-emerald-100 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                  {selectedPoint.type.includes("อันตราย") || selectedPoint.type.includes("E-Waste") ? "⚠️" : "♻️"}
                </div>
                <div>
                    <h3 className="font-bold text-xl text-gray-800">{selectedPoint.name}</h3>
                    <p className="text-gray-500 font-medium text-sm mb-1">{selectedPoint.description}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {selectedPoint.type.map((t, i) => (
                        <span key={i} className="text-[10px] font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-full uppercase tracking-wider">{t}</span>
                      ))}
                    </div>
                </div>
            </div>

            {/* ปุ่มนำทาง */}
            <button
              onClick={() => openGoogleMapsDirections(selectedPoint.lat, selectedPoint.lng)}
              className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold transition shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 group whitespace-nowrap"
            >
                <span className="group-hover:animate-bounce">🗺️</span>
                <span>เริ่มนำทาง</span>
            </button>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-400 font-medium">
            🔎 คลิกที่หมุดบนแผนที่เพื่อดูรายละเอียดและนำทาง
          </div>
        )}
      </div>
    </div>
  );
}
