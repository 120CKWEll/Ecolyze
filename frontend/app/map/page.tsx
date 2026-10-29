"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import type {
  Map as LeafletMap,
  Marker as LeafletMarker,
  Circle as LeafletCircle,
  Polyline as LeafletPolyline,
} from "leaflet";

// 1. โครงสร้างข้อมูลจุดทิ้งขยะ
interface WastePoint {
  id: number;
  name: string;
  lat: number;
  lng: number;
  type: string[];
  description: string;
  distanceKm?: number;
}

// 2. รายการจุดทิ้งขยะ มข. ทั้ง 9 จุด
const INITIAL_WASTE_POINTS: WastePoint[] = [
  { id: 1, name: "ศูนย์อาหารคอมเพล็กซ์ (Complex)", lat: 16.4744, lng: 102.8231, type: ["รีไซเคิล", "ขยะเปียก", "ทั่วไป"], description: "จุดคัดแยกขยะหลัก บริเวณทางเข้าและในโรงอาหาร" },
  { id: 2, name: "คณะวิศวกรรมศาสตร์ (ตึก EN)", lat: 16.4755, lng: 102.8195, type: ["รีไซเคิล", "E-Waste"], description: "จุดรับขยะอิเล็กทรอนิกส์และรีไซเคิล ใกล้ตึก EN" },
  { id: 3, name: "หอสมุดกลาง (ศูนย์สื่อการเรียนรู้)", lat: 16.4715, lng: 102.8235, type: ["รีไซเคิล", "อันตราย"], description: "จุดรับถ่านไฟฉาย ขยะอิเล็กทรอนิกส์ และกระดาษ" },
  { id: 4, name: "คณะวิทยาศาสตร์ (อาคาร SC06)", lat: 16.4735, lng: 102.8205, type: ["รีไซเคิล", "ทั่วไป"], description: "ถังขยะแยกประเภทบริเวณใต้อาคาร" },
  { id: 5, name: "กองจัดการสาธารณูปโภคพลังงานและสิ่งแวดล้อม", lat: 16.4862, lng: 102.8276, type: ["รีไซเคิล", "อันตราย", "ทั่วไป"], description: "หน่วยงานหลักดูแลการจัดการขยะของ มข." },
  { id: 6, name: "อุทยานเทคโนโลยีการเกษตร", lat: 16.4465, lng: 102.8130, type: ["ขยะอินทรีย์", "ทั่วไป"], description: "จุดคัดแยกขยะอินทรีย์และขยะทั่วไปบริเวณพื้นที่ทดลอง" },
  { id: 7, name: "ศูนย์อาหารและบริการ 3 (หนองแวง)", lat: 16.4655, lng: 102.8288, type: ["ขยะเปียก", "ทั่วไป", "รีไซเคิล"], description: "จุดทิ้งเศษอาหารและขยะพลาสติกภายในศูนย์อาหาร" },
  { id: 8, name: "ศูนย์อาหารและบริการ 4 (อาคารจอดรถ 1)", lat: 16.4750, lng: 102.8260, type: ["รีไซเคิล", "ขยะเปียก"], description: "จุดคัดแยกขยะบริเวณโซนร้านอาหาร" },
  { id: 9, name: "ภาควิชาวิศวกรรมสิ่งแวดล้อม", lat: 16.4760, lng: 102.8185, type: ["รีไซเคิล", "อันตราย"], description: "จุดรณรงค์คัดแยกขยะและทิ้งขยะอันตราย" }
];

// 3. รายชื่ออาคาร/สถานที่สำคัญใน มข. สำหรับเลือกตำแหน่ง
interface KKULandmark {
  name: string;
  lat: number;
  lng: number;
  category: string;
}

const KKU_LANDMARKS: KKULandmark[] = [
  { name: "ศูนย์อาหารคอมเพล็กซ์ (Complex)", lat: 16.4744, lng: 102.8231, category: "โรงอาหาร" },
  { name: "คณะวิศวกรรมศาสตร์ (ตึกเพียรวิจิตร / EN)", lat: 16.4755, lng: 102.8195, category: "คณะ" },
  { name: "คณะวิทยาศาสตร์ (อาคาร SC.06)", lat: 16.4735, lng: 102.8205, category: "คณะ" },
  { name: "หอสมุดกลาง มข. (ศูนย์การเรียนรู้)", lat: 16.4715, lng: 102.8235, category: "อาคารกลาง" },
  { name: "คณะแพทยศาสตร์ / รพ.ศรีนครินทร์", lat: 16.4690, lng: 102.8330, category: "คณะ/โรงพยาบาล" },
  { name: "คณะมนุษยศาสตร์และสังคมศาสตร์", lat: 16.4720, lng: 102.8210, category: "คณะ" },
  { name: "คณะบริหารธุรกิจและการบัญชี (KKBS)", lat: 16.4768, lng: 102.8245, category: "คณะ" },
  { name: "คณะพยาบาลศาสตร์", lat: 16.4678, lng: 102.8315, category: "คณะ" },
  { name: "คณะศึกษาศาสตร์", lat: 16.4705, lng: 102.8180, category: "คณะ" },
  { name: "กองพัฒนานักศึกษาและศิษย์เก่าสัมพันธ์", lat: 16.4730, lng: 102.8248, category: "อาคารกลาง" },
  { name: "ศูนย์อาหารหนองแวง (โซนกังสดาล)", lat: 16.4655, lng: 102.8288, category: "โรงอาหาร" },
  { name: "ศูนย์ประชุมกาญจนาภิเษก / บึงศรีฐาน", lat: 16.4610, lng: 102.8185, category: "แลนด์มาร์ก" },
  { name: "โซนหลังมอ (ประตูโคลัมโบ)", lat: 16.4815, lng: 102.8150, category: "โซนหลังมอ" },
  { name: "อาคารหอพักนักศึกษา (หอ 9 / 25 ปี)", lat: 16.4780, lng: 102.8210, category: "หอพัก" },
];

const CALIBRATED_LOCATION_KEY = "user_calibrated_location";

// โครงสร้างข้อมูลเส้นทางนำทาง OSRM
interface NavigationStep {
  instruction: string;
  distance: number;
  icon: string;
}

interface NavigationRoute {
  coordinates: [number, number][]; // [lat, lng]
  distanceMeters: number;
  durationSeconds: number;
  steps: NavigationStep[];
  destination: WastePoint;
}

// คำนวณระยะทางแบบ Haversine Formula (กิโลเมตร)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(distKm?: number): string {
  if (distKm === undefined) return "";
  if (distKm < 1) {
    return `${Math.round(distKm * 1000)} ม.`;
  }
  return `${distKm.toFixed(2)} กม.`;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return "น้อยกว่า 1 นาที";
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} นาที`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hrs} ชม. ${remMins} นาที`;
}

// แปลงคำสั่ง OSRM เป็นภาษาไทยและไอคอน
function formatStepInstruction(maneuver: { type?: string; modifier?: string }, streetName?: string): string {
  const mod = maneuver?.modifier;
  const type = maneuver?.type;

  let action = "ตรงไป";
  if (type === "depart") action = "ออกเดินทาง";
  else if (type === "arrive") return "ถึงจุดทิ้งขยะปลายทาง 🎯";
  else if (mod === "left") action = "เลี้ยวซ้าย";
  else if (mod === "right") action = "เลี้ยวขวา";
  else if (mod === "slight left") action = "เบี่ยงซ้าย";
  else if (mod === "slight right") action = "เบี่ยงขวา";
  else if (mod === "sharp left") action = "เลี้ยวซ้ายหักศอก";
  else if (mod === "sharp right") action = "เลี้ยวขวาหักศอก";
  else if (mod === "uturn") action = "กลับรถ";
  else if (mod === "straight") action = "ตรงไปตามทาง";

  if (streetName && streetName.trim()) {
    return `${action} เข้าสู่ ${streetName}`;
  }
  return action;
}

function getManeuverIcon(maneuver: { type?: string; modifier?: string }): string {
  if (maneuver?.type === "arrive") return "🎯";
  if (maneuver?.type === "depart") return "🚀";
  if (maneuver?.modifier === "left" || maneuver?.modifier === "sharp left") return "⬅️";
  if (maneuver?.modifier === "right" || maneuver?.modifier === "sharp right") return "➡️";
  if (maneuver?.modifier === "slight left") return "↖️";
  if (maneuver?.modifier === "slight right") return "↗️";
  if (maneuver?.modifier === "uturn") return "↩️";
  return "⬆️";
}

export default function MapPage() {
  const [wastePoints, setWastePoints] = useState<WastePoint[]>(INITIAL_WASTE_POINTS);
  const [selectedPoint, setSelectedPoint] = useState<WastePoint | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    accuracy?: number;
    isManual?: boolean;
    source?: "hardware_gps" | "manual_pin" | "landmark";
    landmarkName?: string;
  } | null>(null);

  const [isWatchingGps, setIsWatchingGps] = useState<boolean>(false);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // 🧭 State สำหรับระบบนำทางบนเว็บ (In-Web Navigation)
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [travelMode, setTravelMode] = useState<"walking" | "driving">("walking");
  const [activeRoute, setActiveRoute] = useState<NavigationRoute | null>(null);
  const [routeLoading, setRouteLoading] = useState<boolean>(false);
  const [showStepsList, setShowStepsList] = useState<boolean>(false);
  const [hasArrived, setHasArrived] = useState<boolean>(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const userMarkerRef = useRef<LeafletMarker | null>(null);
  const userCircleRef = useRef<LeafletCircle | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Refs สำหรับเส้นนำทางบนแผนที่
  const routeGlowRef = useRef<LeafletPolyline | null>(null);
  const routeLineRef = useRef<LeafletPolyline | null>(null);

  // บันทึกตำแหน่งลง localStorage
  const persistUserLocation = (lat: number, lng: number, isManual: boolean, landmarkName?: string) => {
    try {
      localStorage.setItem(
        CALIBRATED_LOCATION_KEY,
        JSON.stringify({ lat, lng, isManual, landmarkName, timestamp: Date.now() })
      );
    } catch {
      // ignore
    }
  };

  // ฟังก์ชันอัปเดตระยะทางของจุดทิ้งขยะทั้งหมดจากพิกัดผู้ใช้
  const updatePointsDistance = useCallback((userLat: number, userLng: number) => {
    setWastePoints((prev) => {
      const updated = prev.map((p) => ({
        ...p,
        distanceKm: calculateDistance(userLat, userLng, p.lat, p.lng),
      }));
      return updated.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
    });
  }, []);

  // วาด/อัปเดตหมุดของผู้ใช้บนแผนที่ Leaflet
  const renderUserMarker = useCallback(
    (lat: number, lng: number, accuracy?: number, isManual: boolean = false, landmarkName?: string, panTo: boolean = true) => {
      import("leaflet").then((L) => {
        const map = mapRef.current;
        if (!map) return;

        if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);
        if (userCircleRef.current) map.removeLayer(userCircleRef.current);

        const userIcon = L.divIcon({
          html: `
            <div class="relative flex items-center justify-center w-10 h-10 cursor-grab active:cursor-grabbing">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full ${isManual ? 'bg-emerald-400' : 'bg-blue-400'} opacity-75"></span>
              <div class="relative w-7 h-7 ${isManual ? 'bg-emerald-600' : 'bg-blue-600'} rounded-full border-3 border-white shadow-2xl flex items-center justify-center text-white text-xs font-bold">
                ${isManual ? '📌' : '📍'}
              </div>
            </div>
          `,
          className: "",
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const marker = L.marker([lat, lng], {
          icon: userIcon,
          draggable: true,
          zIndexOffset: 1000,
        }).addTo(map);

        const title = landmarkName
          ? `🏢 ${landmarkName}`
          : isManual
          ? "📌 ตำแหน่งที่คุณปักหมุดเอง"
          : "📍 ตำแหน่ง GPS จริงของคุณ";

        marker.bindPopup(`
          <div style="min-width: 190px; text-align: center; padding: 4px;">
            <p style="font-weight: 800; font-size: 13px; color: #0f172a; margin: 0;">${title}</p>
            <p style="font-size: 11px; color: #3b82f6; font-weight: 700; margin: 2px 0;">
              พิกัด: ${lat.toFixed(5)}, ${lng.toFixed(5)}
            </p>
            ${accuracy ? `<p style="font-size: 10px; color: #64748b; margin: 0;">ความแม่นยำ: ±${Math.round(accuracy)} ม.</p>` : ''}
            <p style="font-size: 11px; color: #10b981; margin: 4px 0 0 0; font-weight: 600;">💡 สามารถลากหมุดเพื่อปรับพิกัดได้</p>
          </div>
        `, { minWidth: 200, maxWidth: 260 });

        marker.on("dragend", (e) => {
          const newPos = (e.target as LeafletMarker).getLatLng();
          setUserLocation({ lat: newPos.lat, lng: newPos.lng, isManual: true, source: "manual_pin" });
          updatePointsDistance(newPos.lat, newPos.lng);
          persistUserLocation(newPos.lat, newPos.lng, true);
          marker.openPopup();
        });

        userMarkerRef.current = marker;

        if (accuracy && accuracy < 1000) {
          const circle = L.circle([lat, lng], {
            radius: Math.max(accuracy, 15),
            color: "#2563eb",
            fillColor: "#3b82f6",
            fillOpacity: 0.12,
            weight: 1.5,
          }).addTo(map);
          userCircleRef.current = circle;
        }

        if (panTo) {
          map.flyTo([lat, lng], 17, { animate: true, duration: 1.2 });
          marker.openPopup();
        }
      });
    },
    [updatePointsDistance]
  );

  // 🌟 ฟังก์ชันดึง GPS จริงจากชิปอุปกรณ์แบบ Live High-Accuracy
  const getLiveDeviceGps = useCallback((panTo: boolean = true) => {
    if (!navigator.geolocation) {
      setGpsError("เบราว์เซอร์หรืออุปกรณ์นี้ไม่รองรับ Geolocation");
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setGpsLoading(false);
        setUserLocation({
          lat: latitude,
          lng: longitude,
          accuracy,
          isManual: false,
          source: "hardware_gps",
        });

        updatePointsDistance(latitude, longitude);
        persistUserLocation(latitude, longitude, false);
        renderUserMarker(latitude, longitude, accuracy, false, undefined, panTo);
      },
      (err) => {
        console.warn("GPS Error:", err);
        setGpsLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError("เบราว์เซอร์ยังไม่ได้รับอนุญาตสิทธิ์ Location กรุณากดอนุญาตที่ไอคอนแม่กุญแจ 🔒 ด้านบน");
        } else if (err.code === err.TIMEOUT) {
          setGpsError("ค้นหาสัญญาณ GPS นานเกินไป กรุณากดลองใหม่อีกครั้ง หรือเลือกอาคารด้านล่าง");
        } else {
          setGpsError("ไม่สามารถรับสัญญาณ GPS จากอุปกรณ์ได้ในขณะนี้");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }, [updatePointsDistance, renderUserMarker]);

  // 🌟 ฟังก์ชันคำนวณและวาดเส้นทางนำทาง OSRM บนเว็บ
  const fetchAndDisplayRoute = useCallback(
    async (
      startLat: number,
      startLng: number,
      destPoint: WastePoint,
      mode: "walking" | "driving"
    ) => {
      setRouteLoading(true);
      try {
        const url = `https://router.project-osrm.org/route/v1/${mode}/${startLng},${startLat};${destPoint.lng},${destPoint.lat}?overview=full&geometries=geojson&steps=true`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.code === "Ok" && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coords: [number, number][] = route.geometry.coordinates.map(
            ([lng, lat]: [number, number]) => [lat, lng]
          );

          interface RawStep {
            maneuver: { type?: string; modifier?: string };
            name?: string;
            distance?: number;
          }

          const steps: NavigationStep[] = (route.legs?.[0]?.steps || []).map((s: RawStep) => ({
            instruction: formatStepInstruction(s.maneuver, s.name),
            distance: Math.round(s.distance || 0),
            icon: getManeuverIcon(s.maneuver),
          }));

          setActiveRoute({
            coordinates: coords,
            distanceMeters: route.distance,
            durationSeconds: route.duration,
            steps,
            destination: destPoint,
          });
          setIsNavigating(true);
          setHasArrived(false);

          // วาดเส้นทางลงบนแผนที่ Leaflet
          import("leaflet").then((L) => {
            const map = mapRef.current;
            if (!map) return;

            // เคลียร์เส้นเดิม
            if (routeGlowRef.current) map.removeLayer(routeGlowRef.current);
            if (routeLineRef.current) map.removeLayer(routeLineRef.current);

            // เส้นเรืองแสงด้านนอก (Glow)
            const glow = L.polyline(coords, {
              color: mode === "walking" ? "#047857" : "#1d4ed8",
              weight: 10,
              opacity: 0.35,
              lineCap: "round",
              lineJoin: "round",
            }).addTo(map);

            // เส้นนำทางหลักด้านใน (Solid Line)
            const line = L.polyline(coords, {
              color: mode === "walking" ? "#10b981" : "#3b82f6",
              weight: 5,
              opacity: 0.95,
              lineCap: "round",
              lineJoin: "round",
            }).addTo(map);

            routeGlowRef.current = glow;
            routeLineRef.current = line;

            // ปรับมุมมองแผนที่ให้ครอบคลุมเส้นทางทั้งหมด
            map.fitBounds(line.getBounds(), {
              padding: [50, 50],
              maxZoom: 18,
              animate: true,
            });
          });
        } else {
          alert("ไม่พบเส้นทางถนนเชื่อมต่อจุดนี้ กรุณาลองเลือกโหมดการเดินทางอื่น");
        }
      } catch (err) {
        console.error("OSRM Route Error:", err);
        alert("ไม่สามารถเชื่อมต่อระบบคำนวณเส้นทางได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต");
      } finally {
        setRouteLoading(false);
      }
    },
    []
  );

  // เริ่มนำทางไปยังจุดทิ้งขยะที่เลือก
  const startInAppNavigation = (destination: WastePoint) => {
    // ถ้าผู้ใช้ยังไม่มีพิกัด ให้ใช้ตำแหน่ง Landmark เริ่มต้นของ มข. (Complex)
    let originLat = userLocation?.lat;
    let originLng = userLocation?.lng;

    if (!originLat || !originLng) {
      const defaultLandmark = KKU_LANDMARKS[0];
      originLat = defaultLandmark.lat;
      originLng = defaultLandmark.lng;
      setUserLocation({
        lat: originLat,
        lng: originLng,
        isManual: true,
        source: "landmark",
        landmarkName: defaultLandmark.name,
      });
      renderUserMarker(originLat, originLng, undefined, true, defaultLandmark.name, false);
    }

    fetchAndDisplayRoute(originLat, originLng, destination, travelMode);
  };

  // ยกเลิก / สิ้นสุดการนำทาง
  const cancelNavigation = () => {
    setIsNavigating(false);
    setActiveRoute(null);
    setHasArrived(false);
    setShowStepsList(false);

    import("leaflet").then(() => {
      const map = mapRef.current;
      if (!map) return;
      if (routeGlowRef.current) map.removeLayer(routeGlowRef.current);
      if (routeLineRef.current) map.removeLayer(routeLineRef.current);
      routeGlowRef.current = null;
      routeLineRef.current = null;
    });
  };

  // สลับโหมดการเดินทาง (เดินเท้า / ขับขี่)
  const handleToggleTravelMode = (newMode: "walking" | "driving") => {
    setTravelMode(newMode);
    if (isNavigating && activeRoute && userLocation) {
      fetchAndDisplayRoute(userLocation.lat, userLocation.lng, activeRoute.destination, newMode);
    }
  };

  // 🌟 ฟังก์ชันเปิดระบบติดตามตำแหน่งแบบ Real-time (Live Tracking)
  const toggleLiveTracking = useCallback(() => {
    if (isWatchingGps) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsWatchingGps(false);
    } else {
      if (!navigator.geolocation) return;
      setIsWatchingGps(true);
      setGpsError(null);

      const id = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          setUserLocation({
            lat: latitude,
            lng: longitude,
            accuracy,
            isManual: false,
            source: "hardware_gps",
          });
          updatePointsDistance(latitude, longitude);
          persistUserLocation(latitude, longitude, false);
          renderUserMarker(latitude, longitude, accuracy, false, undefined, true);

          // ตรวจสอบว่าใกล้ถึงจุดหมายหรือไม่ (< 25 เมตร)
          if (activeRoute) {
            const distKm = calculateDistance(latitude, longitude, activeRoute.destination.lat, activeRoute.destination.lng);
            if (distKm * 1000 <= 25) {
              setHasArrived(true);
            }
          }
        },
        (err) => {
          console.warn("Live watch error:", err);
          setIsWatchingGps(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0,
        }
      );
      watchIdRef.current = id;
    }
  }, [isWatchingGps, updatePointsDistance, renderUserMarker, activeRoute]);

  // ปิด watchPosition เมื่อออกจากหน้า
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // เลือก Landmark
  const handleSelectLandmark = (landmark: KKULandmark) => {
    setUserLocation({
      lat: landmark.lat,
      lng: landmark.lng,
      isManual: true,
      source: "landmark",
      landmarkName: landmark.name,
    });
    updatePointsDistance(landmark.lat, landmark.lng);
    persistUserLocation(landmark.lat, landmark.lng, true, landmark.name);
    renderUserMarker(landmark.lat, landmark.lng, undefined, true, landmark.name, true);

    // ถ้ากำลังนำทางอยู่ ให้คำนวณเส้นทางใหม่จากจุด Landmark ทันที
    if (isNavigating && activeRoute) {
      fetchAndDisplayRoute(landmark.lat, landmark.lng, activeRoute.destination, travelMode);
    }
  };

  // เริ่มต้นแผนที่ Leaflet
  useEffect(() => {
    let disposed = false;

    import("leaflet").then((L) => {
      const container = mapContainerRef.current;
      if (!container || disposed) return;

      const map = L.map(container, {
        center: [16.4744, 102.8231],
        zoom: 15,
        zoomControl: true,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      // คลิกบนแผนที่เพื่อปักหมุด
      map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        setUserLocation({ lat, lng, isManual: true, source: "manual_pin" });
        updatePointsDistance(lat, lng);
        persistUserLocation(lat, lng, true);
        renderUserMarker(lat, lng, undefined, true, undefined, false);
      });

      // ปักหมุดถังขยะทั้ง 9 จุด
      INITIAL_WASTE_POINTS.forEach((point) => {
        const isHazardous = point.type.includes("อันตราย") || point.type.includes("E-Waste");
        const trashIcon = L.divIcon({
          html: `
            <div class="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg border-2 ${
              isHazardous ? 'border-amber-500' : 'border-emerald-600'
            } text-xl hover:scale-125 transition-transform duration-200 cursor-pointer">
              ${isHazardous ? '⚠️' : '♻️'}
            </div>
          `,
          className: "",
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const marker = L.marker([point.lat, point.lng], { icon: trashIcon }).addTo(map);

        marker.bindPopup(`
          <div style="min-width: 170px; padding: 2px;">
            <h4 style="font-weight: 800; font-size: 13px; color: #0f172a; margin: 0;">${point.name}</h4>
            <p style="font-size: 11px; color: #475569; margin: 4px 0 6px 0; font-weight: 500;">${point.description}</p>
            <div style="display: flex; gap: 4px; flex-wrap: wrap;">
              ${point.type.map(t => `<span style="font-size: 10px; font-weight: 700; background-color: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; padding: 2px 6px; border-radius: 9999px;">${t}</span>`).join('')}
            </div>
          </div>
        `, { minWidth: 180 });

        marker.on("click", () => setSelectedPoint(point));
      });

      // ดึงแคชเดิมก่อน ถ้าไม่มีให้ขอ GPS
      try {
        const saved = localStorage.getItem(CALIBRATED_LOCATION_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed.lat === "number" && typeof parsed.lng === "number") {
            setUserLocation(parsed);
            updatePointsDistance(parsed.lat, parsed.lng);
            renderUserMarker(parsed.lat, parsed.lng, undefined, parsed.isManual, parsed.landmarkName, false);
            return;
          }
        }
      } catch {
        // ignore
      }

      // ดึง GPS อุปกรณ์จริง
      getLiveDeviceGps(false);
    });

    return () => {
      disposed = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [getLiveDeviceGps, renderUserMarker, updatePointsDistance]);

  const openGoogleMapsDirections = (destLat: number, destLng: number) => {
    const originParam = userLocation ? `&origin=${userLocation.lat},${userLocation.lng}` : "";
    const modeParam = travelMode === "walking" ? "walking" : "driving";
    const url = `https://www.google.com/maps/dir/?api=1${originParam}&destination=${destLat},${destLng}&travelmode=${modeParam}`;
    window.open(url, "_blank");
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col animate-fade-in pb-16">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-emerald-800 tracking-tight flex items-center gap-2">
            <span>📍</span> แผนที่จุดทิ้งขยะ มข. (ระบบนำทางบนเว็บ)
          </h1>
          <p className="text-slate-600 font-medium text-sm md:text-base mt-1">
            นำทางตรงบนแผนที่ในเว็บตามถนนจริง พร้อมระยะทางและเวลาเดินทางแบบเรียลไทม์
          </p>
        </div>

        {/* ปุ่มควบคุม GPS แบบเรียลไทม์ */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => getLiveDeviceGps(true)}
            disabled={gpsLoading}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-2xl text-xs md:text-sm font-extrabold shadow-lg shadow-emerald-600/30 transition active:scale-95 disabled:opacity-50"
          >
            <span className={gpsLoading ? "animate-spin text-base" : "text-base"}>
              {gpsLoading ? "⏳" : "📡"}
            </span>
            <span>{gpsLoading ? "กำลังค้นหาพิกัด..." : "ระบุพิกัด GPS จริง"}</span>
          </button>

          <button
            onClick={toggleLiveTracking}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs md:text-sm font-extrabold shadow-md transition active:scale-95 ${
              isWatchingGps
                ? "bg-rose-500 hover:bg-rose-600 text-white animate-pulse"
                : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
            }`}
          >
            <span>{isWatchingGps ? "🛑" : "🛰️"}</span>
            <span>{isWatchingGps ? "ปิด Live GPS" : "เปิด Live GPS"}</span>
          </button>
        </div>
      </div>

      {/* GPS Error Alert */}
      {gpsError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-2xl mb-4 text-xs md:text-sm font-semibold flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <span>{gpsError}</span>
          </div>
          <button
            onClick={() => getLiveDeviceGps(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-xl font-bold text-xs shrink-0"
          >
            ลองใหม่
          </button>
        </div>
      )}

      {/* แถบเลือกอาคาร/คณะด่วนใน มข. */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/90 rounded-2xl p-3.5 mb-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-emerald-950">
          <span>🏢</span>
          <span>หรือเลือกอาคารใน มข. ที่คุณอยู่ปัจจุบัน (จุดเริ่มต้น):</span>
        </div>
        
        <select
          onChange={(e) => {
            const lm = KKU_LANDMARKS.find((l) => l.name === e.target.value);
            if (lm) handleSelectLandmark(lm);
          }}
          defaultValue=""
          className="bg-white text-slate-900 font-bold text-xs md:text-sm px-3.5 py-2 rounded-xl border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs cursor-pointer"
        >
          <option value="" disabled>คลิกเลือกอาคารใน มข....</option>
          {KKU_LANDMARKS.map((lm, idx) => (
            <option key={idx} value={lm.name}>
              {lm.name} ({lm.category})
            </option>
          ))}
        </select>
      </div>

      {/* ========================================================
          🗺️ MAP CANVAS WITH IN-WEB NAVIGATION FLOATING HUD
          ======================================================== */}
      <div className="bg-white p-2 rounded-[2.5rem] shadow-xl border border-slate-200/90 flex-1 min-h-[460px] mb-6 relative z-0 overflow-hidden">
        <div ref={mapContainerRef} id="map-container" className="w-full h-full min-h-[440px] rounded-[2rem] z-0 relative"></div>

        {/* Floating Quick GPS Button on map */}
        <div className="absolute top-5 right-5 z-[500] flex flex-col gap-2">
          <button
            onClick={() => getLiveDeviceGps(true)}
            title="จับพิกัด GPS อุปกรณ์จริง"
            className="w-12 h-12 bg-white hover:bg-slate-50 text-emerald-700 border-2 border-emerald-500 rounded-2xl shadow-xl flex items-center justify-center text-xl transition-all active:scale-90 hover:scale-105"
          >
            🎯
          </button>
        </div>

        {/* 🧭 FLOATING NAVIGATION HUD (แสดงเมื่อกำลังนำทาง) */}
        {isNavigating && activeRoute && (
          <div className="absolute top-4 left-4 right-16 sm:right-auto sm:max-w-md z-[500] animate-fade-in">
            <div className="bg-slate-900/90 backdrop-blur-md text-white rounded-3xl p-4 shadow-2xl border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="text-xs font-black text-emerald-400 tracking-wider uppercase">
                    กำลังนำทางบนแผนที่
                  </span>
                </div>
                
                {/* ปุ่มสลับโหมดเดิน/ขับรถ */}
                <div className="flex bg-slate-800 rounded-xl p-0.5 border border-slate-700">
                  <button
                    onClick={() => handleToggleTravelMode("walking")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      travelMode === "walking"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>🚶</span>
                    <span>เดิน</span>
                  </button>
                  <button
                    onClick={() => handleToggleTravelMode("driving")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      travelMode === "driving"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>🛵</span>
                    <span>ขับขี่</span>
                  </button>
                </div>
              </div>

              {/* ปลายทาง + สรุปเวลาและระยะทาง */}
              <div className="mb-3">
                <h4 className="font-black text-base text-white truncate">
                  🎯 {activeRoute.destination.name}
                </h4>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-300 font-semibold">
                  <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/30">
                    ⏱️ {formatDuration(activeRoute.durationSeconds)}
                  </span>
                  <span>📏 {(activeRoute.distanceMeters / 1000).toFixed(2)} กม. ({Math.round(activeRoute.distanceMeters)} ม.)</span>
                </div>
              </div>

              {/* Action Buttons in HUD */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setShowStepsList(!showStepsList)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <span>🔀</span>
                  <span>{showStepsList ? "ซ่อนขั้นตอนเลี้ยว" : `ดูขั้นตอนเลี้ยว (${activeRoute.steps.length})`}</span>
                </button>

                <button
                  onClick={cancelNavigation}
                  className="bg-rose-500/80 hover:bg-rose-600 text-white text-xs font-bold py-2 px-3 rounded-xl transition shrink-0"
                >
                  🛑 สิ้นสุด
                </button>
              </div>

              {/* รายการขั้นตอนการเลี้ยว (Collapsible Step-by-Step) */}
              {showStepsList && activeRoute.steps.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800 max-h-48 overflow-y-auto space-y-2 pr-1 text-xs text-slate-200">
                  {activeRoute.steps.map((st, i) => (
                    <div key={i} className="flex items-start gap-2 bg-slate-800/80 p-2 rounded-xl border border-slate-700/60">
                      <span className="text-base leading-none shrink-0">{st.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-100">{st.instruction}</p>
                        {st.distance > 0 && (
                          <p className="text-[10px] text-slate-400 mt-0.5">ระยะ {st.distance} เมตร</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 🎉 ARRIVAL CELEBRATION MODAL (แสดงเมื่อถึงจุดหมาย < 25 เมตร) */}
        {hasArrived && activeRoute && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs z-[600] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border-2 border-emerald-400">
              <div className="text-6xl mb-3 animate-bounce">🎉</div>
              <h3 className="text-xl font-black text-slate-900 mb-1">
                คุณถึงจุดทิ้งขยะแล้ว!
              </h3>
              <p className="text-emerald-700 font-bold text-sm mb-2">
                📍 {activeRoute.destination.name}
              </p>
              <p className="text-xs text-slate-500 font-medium mb-6 leading-relaxed">
                นำขยะของคุณแยกทิ้งลงในถังให้ถูกสี ({activeRoute.destination.type.join(", ")}) แล้วสแกนรับคะแนน Eco-Points ได้เลย!
              </p>

              <div className="space-y-2">
                <Link
                  href="/upload"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm py-3 px-4 rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition"
                >
                  <span>📷</span>
                  <span>ถ่ายภาพสแกนขยะรับแต้ม</span>
                </Link>

                <button
                  onClick={cancelNavigation}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl transition"
                >
                  เสร็จสิ้นการนำทาง
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Live Coordinate Status Badge */}
        {userLocation && !isNavigating && (
          <div className="absolute bottom-5 left-5 z-[500] bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-slate-200/90 text-xs flex items-center gap-2 max-w-[85vw] sm:max-w-md">
            <span className={`w-2.5 h-2.5 rounded-full ${userLocation.isManual ? 'bg-emerald-600' : 'bg-blue-600'} animate-ping shrink-0`}></span>
            <div className="text-slate-800 leading-tight truncate">
              <span className="font-black block">
                {userLocation.landmarkName
                  ? `🏢 ${userLocation.landmarkName}`
                  : userLocation.isManual
                  ? "📌 ตำแหน่งที่คุณปักหมุดเอง"
                  : "📍 พิกัด GPS จริงจากอุปกรณ์"}
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">
                Lat: {userLocation.lat.toFixed(5)}, Lng: {userLocation.lng.toFixed(5)}
                {userLocation.accuracy ? ` (±${Math.round(userLocation.accuracy)} ม.)` : ""}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Details & Nearest Drop-off Points */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* กล่องรายละเอียดจุดทิ้งขยะที่เลือก */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-200/90">
          {selectedPoint ? (
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-800 border-2 border-emerald-200 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-sm">
                  {selectedPoint.type.includes("อันตราย") || selectedPoint.type.includes("E-Waste") ? "⚠️" : "♻️"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-xl text-slate-900">{selectedPoint.name}</h3>
                    {selectedPoint.distanceKm !== undefined && (
                      <span className="bg-emerald-100 text-emerald-900 text-xs font-black px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {formatDistance(selectedPoint.distanceKm)}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 font-medium text-sm mt-1">{selectedPoint.description}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {selectedPoint.type.map((t, i) => (
                      <span key={i} className="text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200 px-3 py-1 rounded-full">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* ปุ่มนำทาง (ทั้งนำทางบนเว็บ และเปิด Google Maps) */}
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto shrink-0">
                <button
                  onClick={() => startInAppNavigation(selectedPoint)}
                  disabled={routeLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-2xl font-black text-sm transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 group whitespace-nowrap active:scale-95 disabled:opacity-50"
                >
                  <span className={routeLoading ? "animate-spin" : "group-hover:scale-125 transition-transform"}>
                    {routeLoading ? "⏳" : "🧭"}
                  </span>
                  <span>{routeLoading ? "กำลังคำนวณ..." : "นำทางบนเว็บ"}</span>
                </button>

                <button
                  onClick={() => openGoogleMapsDirections(selectedPoint.lat, selectedPoint.lng)}
                  title="เปิดใน Google Maps ภายนอก"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-3.5 rounded-2xl font-bold text-xs transition flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  <span>🗺️</span>
                  <span>Google Maps</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 font-bold">
              🔎 คลิกที่หมุดบนแผนที่ หรือเลือกจุดทิ้งจากรายการด้านขวาเพื่อเริ่มการนำทาง
            </div>
          )}
        </div>

        {/* รายการจุดทิ้งขยะเรียงตามระยะทาง */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200/90 flex flex-col">
          <h4 className="font-extrabold text-slate-900 text-sm mb-3 flex items-center gap-2">
            <span>⚡</span> จุดทิ้งขยะใกล้คุณ (เรียงตามระยะทาง)
          </h4>
          <div className="space-y-2 overflow-y-auto max-h-60 pr-1">
            {wastePoints.map((point, index) => (
              <button
                key={point.id}
                onClick={() => {
                  setSelectedPoint(point);
                  mapRef.current?.flyTo([point.lat, point.lng], 17, { animate: true });
                }}
                className={`w-full text-left p-3 rounded-2xl border transition flex items-center justify-between ${
                  selectedPoint?.id === point.id
                    ? "bg-emerald-50 border-emerald-400 shadow-xs"
                    : "bg-slate-50 hover:bg-emerald-50/50 border-slate-200/80 hover:border-emerald-300"
                }`}
              >
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-black text-slate-900 truncate">
                    {index === 0 && userLocation ? "🥇 " : ""}{point.name}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium truncate">{point.description}</p>
                </div>
                {point.distanceKm !== undefined && (
                  <span className="text-xs font-black text-emerald-800 bg-white border border-slate-200 px-2 py-1 rounded-xl shrink-0 shadow-2xs">
                    {formatDistance(point.distanceKm)}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
