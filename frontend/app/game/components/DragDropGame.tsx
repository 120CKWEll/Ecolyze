"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";

/* =========================================================
   🎯 มินิเกมลากขยะลงถัง 4 สี (Drag & Drop Waste Sort Master)
   ========================================================= */

export type GameMode = "classic" | "timeattack" | "practice";

export interface WasteItem {
  id: number;
  name: string;
  category: "recycle" | "organic" | "general" | "hazardous";
  emoji: string;
  hint: string;
  tip: string;
  material: string;
}

export interface BinConfig {
  id: "recycle" | "organic" | "general" | "hazardous";
  name: string;
  thaiName: string;
  colorName: string;
  bgGradient: string;
  borderActive: string;
  glowColor: string;
  colorHex: string;
  emoji: string;
  badgeBg: string;
  badgeText: string;
  description: string;
}

export const BINS: BinConfig[] = [
  {
    id: "recycle",
    name: "Recycle",
    thaiName: "ขยะรีไซเคิล",
    colorName: "ถังสีเหลือง",
    bgGradient: "from-amber-400 via-yellow-400 to-amber-500",
    borderActive: "border-amber-400 ring-4 ring-amber-300/70 shadow-amber-200",
    glowColor: "bg-amber-400/20",
    colorHex: "#f59e0b",
    emoji: "♻️",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-900 border-amber-300",
    description: "ขวดแก้ว, ขวด PET, ลังกระดาษ, กระป๋อง",
  },
  {
    id: "organic",
    name: "Organic",
    thaiName: "ขยะเปียก/อินทรีย์",
    colorName: "ถังสีเขียว",
    bgGradient: "from-emerald-500 via-green-500 to-emerald-600",
    borderActive: "border-emerald-500 ring-4 ring-emerald-300/70 shadow-emerald-200",
    glowColor: "bg-emerald-400/20",
    colorHex: "#10b981",
    emoji: "🍃",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-900 border-emerald-300",
    description: "เศษอาหาร, เปลือกผลไม้, กากกาแฟ, เศษผัก",
  },
  {
    id: "general",
    name: "General",
    thaiName: "ขยะทั่วไป",
    colorName: "ถังสีน้ำเงิน",
    bgGradient: "from-blue-500 via-sky-500 to-indigo-600",
    borderActive: "border-blue-500 ring-4 ring-blue-300/70 shadow-blue-200",
    glowColor: "bg-blue-400/20",
    colorHex: "#3b82f6",
    emoji: "🗑️",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-900 border-blue-300",
    description: "กล่องโฟม, ซองฟอยล์, ทิชชู่, ถุงเปื้อนมัน",
  },
  {
    id: "hazardous",
    name: "Hazardous",
    thaiName: "ขยะอันตราย",
    colorName: "ถังสีแดง",
    bgGradient: "from-red-500 via-rose-500 to-red-600",
    borderActive: "border-red-500 ring-4 ring-red-300/70 shadow-red-200",
    glowColor: "bg-red-400/20",
    colorHex: "#ef4444",
    emoji: "☣️",
    badgeBg: "bg-red-100",
    badgeText: "text-red-900 border-red-300",
    description: "ถ่านไฟฉาย, หลอดไฟ, กระป๋องสเปรย์, ยา",
  },
];

export const WASTE_ITEMS: Omit<WasteItem, "id">[] = [
  // 🟡 รีไซเคิล (Recycle - ถังเหลือง)
  {
    name: "ขวดน้ำพลาสติกใส (PET)",
    category: "recycle",
    emoji: "🧴",
    material: "พลาสติก PET #1",
    hint: "เทน้ำออก ล้าง บีบให้แบนก่อนทิ้ง",
    tip: "ขวด PET สามารถนำไปรีไซเคิลเป็นเส้นใยสังเคราะห์ เสื้อกีฬา หรือขวดใหม่ได้ไม่รู้จบ",
  },
  {
    name: "กระป๋องน้ำอัดลมอัลลอย",
    category: "recycle",
    emoji: "🥫",
    material: "อะลูมิเนียม",
    hint: "เทน้ำให้หมด แล้วเหยียบให้แบน",
    tip: "อะลูมิเนียมหลอมซ้ำได้ 100% ไม่จำกัดจำนวนครั้ง ช่วยประหยัดพลังงานผลิตได้ถึง 95%",
  },
  {
    name: "กล่องกระดาษ / ลังลูกฟูก",
    category: "recycle",
    emoji: "📦",
    material: "กระดาษลูกฟูก",
    hint: "กรีดเทปกาวออก พับให้แบน อย่าให้เปียกน้ำ",
    tip: "กระดาษสะอาดสามารถนำไปต้มเป็นเยื่อกระดาษใหม่เพื่อแปรรูปเป็นกล่องพัสดุ",
  },
  {
    name: "ขวดแก้วเครื่องดื่ม",
    category: "recycle",
    emoji: "🍾",
    material: "แก้ว",
    hint: "ล้างคราบ ระวังการแตกหัก",
    tip: "ขวดแก้วนำไปหลอมขึ้นรูปใหม่ได้เรื่อยๆ โดยคงคุณสมบัติเดิมไว้ครบถ้วน",
  },
  {
    name: "หนังสือพิมพ์ / เอกสารเก่า",
    category: "recycle",
    emoji: "📰",
    material: "กระดาษ",
    hint: "มัดรวมกัน เก็บในที่แห้ง",
    tip: "กระดาษเอกสารสีขาวดำสามารถนำไปผลิตเป็นกระดาษรีไซเคิลได้ง่าย",
  },
  {
    name: "กล่องนม UHT (ล้างแล้ว)",
    category: "recycle",
    emoji: "🧃",
    material: "กระดาษเคลือบฟอยล์ (Tetra Pak)",
    hint: "แกะมุม ล้างน้ำ ผึ่งให้แห้ง พับแบน",
    tip: "กล่องเครื่องดื่มล้างสะอาดสามารถนำไปแยกเยื่อกระดาษและผลิตแผ่นไม้อัดอีโคบอร์ดได้",
  },
  {
    name: "ฝาขวดน้ำพลาสติก (HDPE)",
    category: "recycle",
    emoji: "🔘",
    material: "พลาสติก HDPE #2",
    hint: "รวบรวมใส่ในขวดหรือถุงแยก",
    tip: "ฝาขวด HDPE มีความหนาแน่นสูง นำไปรีไซเคิลเป็นเก้าอี้พลาสติกหรือกระถางต้นไม้ได้",
  },

  // 🟢 ขยะเปียก / อินทรีย์ (Organic - ถังเขียว)
  {
    name: "เศษอาหาร / ข้าวแกง",
    category: "organic",
    emoji: "🍲",
    material: "สารอินทรีย์",
    hint: "กรองน้ำแกงออกให้เหลือแต่เศษเนื้อและผัก",
    tip: "เศษอาหารนำไปหมักทำปุ๋ยอินทรีย์ ปุ๋ยน้ำหมักชีวภาพ หรือผลิตก๊าซชีวภาพ (Biogas)",
  },
  {
    name: "เปลือกกล้วย / เปลือกผลไม้",
    category: "organic",
    emoji: "🍌",
    material: "สารอินทรีย์พืช",
    hint: "ย่อยสลายได้ตามธรรมชาติอย่างรวดเร็ว",
    tip: "เปลือกกล้วยอุดมด้วยโพแทสเซียม เหมาะมากสำหรับการบำรุงดินแปลงเกษตร",
  },
  {
    name: "กากกาแฟสด",
    category: "organic",
    emoji: "☕",
    material: "กากกาแฟ",
    hint: "ตากให้แห้งป้องกันเชื้อรา",
    tip: "กากกาแฟมีสารไนโตรเจนสูง เป็นสารปรับปรุงดินและช่วยไล่แมลงศัตรูพืชได้",
  },
  {
    name: "เศษผักและใบไม้แห้ง",
    category: "organic",
    emoji: "🥬",
    material: "พืชผักสวนครัว",
    hint: "ทิ้งลงถังเขียวหรือกองปุ๋ยหมัก",
    tip: "คลุกเคล้าเศษผักกับใบไม้แห้งเพื่อเป็นปุ๋ยหมักอินทรีย์คืนธาตุอาหารสู่แปลงผัก",
  },
  {
    name: "เปลือกไข่ไก่",
    category: "organic",
    emoji: "🥚",
    material: "แคลเซียมคาร์บอเนต",
    hint: "บดละเอียดก่อนผสมลงดิน",
    tip: "เปลือกไข่เพิ่มแร่ธาตุแคลเซียมให้ดิน ช่วยให้ต้นไม้โตไวและรากแข็งแรง",
  },
  {
    name: "ก้างปลา / เศษกระดูกอ่อน",
    category: "organic",
    emoji: "🐟",
    material: "อินทรีย์สัตว์",
    hint: "แยกไม่ให้มีพลาสติกหรือถุงหุ้ม",
    tip: "ก้างปลาและกระดูกอ่อนหมักร่วมกับจุลินทรีย์จะให้ฟอสฟอรัสบำรุงรากดอก",
  },
  {
    name: "ถุงชาชงแล้ว",
    category: "organic",
    emoji: "🍵",
    material: "ใบชาและเยื่อกระดาษธรรมชาติ",
    hint: "แกะลวดเย็บกระดาษออกก่อนทิ้ง",
    tip: "ใบชาช่วยอุ้มน้ำและรักษาความชื้นในดินปลูกต้นไม้ได้ดี",
  },

  // 🔵 ขยะทั่วไป (General - ถังน้ำเงิน)
  {
    name: "กล่องโฟมเปื้อนอาหาร",
    category: "general",
    emoji: "🍱",
    material: "โฟม Polystyrene",
    hint: "เปื้อนน้ำมัน ล้างยาก รีไซเคิลไม่ได้",
    tip: "โฟมเปื้อนอาหารไม่คุ้มค่าทางเศรษฐกิจในการรีไซเคิล จึงต้องเข้าสู่กระบวนการฝังกลบหรือเตาเผาพลังงาน",
  },
  {
    name: "ซองขนมขบเคี้ยว / ซองฟอยล์",
    category: "general",
    emoji: "🍬",
    material: "พลาสติกเคลือบอะลูมิเนียม (Multi-layer)",
    hint: "พลาสติกซ้อนหลายชั้น แยกชั้นยากมาก",
    tip: "บรรจุภัณฑ์หลายชั้นมีความทนทานสูงแต่แยกชั้นยาก ต้องทิ้งถังขยะทั่วไป",
  },
  {
    name: "กระดาษทิชชู่ใช้แล้ว",
    category: "general",
    emoji: "🧻",
    material: "เยื่อกระดาษปนเปื้อน",
    hint: "เปื้อนคราบและเชื้อโรค ห้ามรีไซเคิล",
    tip: "ทิชชู่ที่เปื้อนสิ่งสกปรกมีเส้นใยสั้นเปื่อยยุ่ย ไม่สามารถนำไปรีไซเคิลได้",
  },
  {
    name: "ถุงพลาสติกเปื้อนแกง",
    category: "general",
    emoji: "🛍️",
    material: "พลาสติกปนเปื้อนน้ำมัน",
    hint: "หากล้างคราบไขมันไม่ออก ให้ทิ้งถังทั่วไป",
    tip: "คราบน้ำมันและเครื่องแกงจะทำให้ระบบหลอมพลาสติกรีไซเคิลเสียหาย",
  },
  {
    name: "แก้วกาแฟกระดาษเคลือบฟิล์ม",
    category: "general",
    emoji: "🥤",
    material: "กระดาษเคลือบฟิล์ม PE",
    hint: "มีฟิล์มพลาสติกกันซึมด้านใน",
    tip: "ฟิล์มพลาสติกด้านในทำให้โรงงานแยกเยื่อกระดาษธรรมดาไม่สามารถแปรรูปได้",
  },
  {
    name: "หลอดดูดพลาสติก",
    category: "general",
    emoji: "🥢",
    material: "พลาสติก PP ขนาดเล็ก",
    hint: "ขนาดเล็กเกินกว่าเครื่องคัดแยกจะดักจับ",
    tip: "หลอดพลาสติกมีขนาดเล็ก มักหลุดรอดจากสายพานคัดแยก จึงจัดเป็นขยะทั่วไป",
  },
  {
    name: "หน้ากากอนามัยใช้แล้ว",
    category: "general",
    emoji: "😷",
    material: "เส้นใยสังเคราะห์ปนเปื้อน",
    hint: "ม้วนพับ ผูกสาย รัดในถุงก่อนทิ้ง",
    tip: "เป็นขยะที่มีโอกาสปนเปื้อนเชื้อโรค ต้องทิ้งถังทั่วไปหรือถังขยะติดเชื้อ",
  },

  // 🔴 ขยะอันตราย (Hazardous - ถังแดง)
  {
    name: "ถ่านไฟฉาย / แบตเตอรี่ AA",
    category: "hazardous",
    emoji: "🔋",
    material: "โลหะหนักและสารเคมีเคมีไฟฟ้า",
    hint: "มีสารโลหะหนัก ปรอท แคดเมียม ตะกั่ว",
    tip: "ห้ามทิ้งปนกับขยะอื่นเด็ดขาด สารพิษอาจรั่วซึมลงสู่แหล่งน้ำและดินในชุมชน",
  },
  {
    name: "หลอดไฟฟลูออเรสเซนต์",
    category: "hazardous",
    emoji: "💡",
    material: "แก้วบรรจุไอปรอท",
    hint: "ระวังแตก เก็บในกล่องเดิมหรือห่อกระดาษ",
    tip: "ภายในมีไอปรอทที่เป็นพิษต่อระบบประสาท ต้องส่งโรงงานกำจัดเฉพาะทาง",
  },
  {
    name: "กระป๋องสเปรย์ / แก๊สกระป๋อง",
    category: "hazardous",
    emoji: "🧯",
    material: "ก๊าซอัดความดันและวัตถุไวไฟ",
    hint: "ห้ามเจาะกระป๋อง ห้ามเผาไฟ",
    tip: "มีความดันสูงและมีสารไวไฟ อาจเกิดการระเบิดหากโดนความร้อนในรถเก็บขยะ",
  },
  {
    name: "แผงยา / ยาหมดอายุ",
    category: "hazardous",
    emoji: "💊",
    material: "สารเคมีทางเภสัชกรรม",
    hint: "ห้ามทิ้งลงชักโครกหรือท่อน้ำทิ้ง",
    tip: "สารตกค้างของยาฆ่าเชื้อหรือฮอร์โมนจะทำลายระบบนิเวศน์ทางน้ำและสิ่งมีชีวิต",
  },
  {
    name: "แบตเตอรี่มือถือเก่า (E-Waste)",
    category: "hazardous",
    emoji: "📱",
    material: "ลิเธียมไอออน (Lithium-ion)",
    hint: "หากบวมห้ามกดทับ นำส่งจุดรับ E-Waste",
    tip: "แบตเตอรี่ลิเธียมสามารถติดไฟเองได้เมื่อถูกกระแทก ต้องคัดแยกพิเศษ",
  },
  {
    name: "ขวดน้ำยาล้างห้องน้ำ / กรดเกลือ",
    category: "hazardous",
    emoji: "🧴",
    material: "สารกัดกร่อนและสารเคมีรุนแรง",
    hint: "ปิดฝาให้สนิท ห้ามเทสารเคมีปนกัน",
    tip: "สารเคมีกัดกร่อนทำให้เกิดไอพิษ เป็นอันตรายต่อพนักงานเก็บขยะและท่อระบายน้ำ",
  },
];

const BEST_SCORE_KEY = "ecolyze_drag_best_score";

export default function DragDropGame() {
  const [mode, setMode] = useState<GameMode>("classic");
  const [gameState, setGameState] = useState<"menu" | "playing" | "gameover">("menu");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [sortedCount, setSortedCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [bestScore, setBestScore] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // ขยะชิ้นปัจจุบันและประวัติความผิดพลาดเพื่อนำมาทบทวน
  const [currentItem, setCurrentItem] = useState<WasteItem | null>(null);
  const [mistakes, setMistakes] = useState<Array<{ item: WasteItem; chosenBin: string }>>([]);
  const [hoveredBin, setHoveredBin] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    text: string;
    isCorrect: boolean;
    tip?: string;
    bonusText?: string;
  } | null>(null);

  // Dragging State (Pointer Events for Touch & Mouse)
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dropAnimation, setDropAnimation] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const binRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dragStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Web Audio Synthesizer
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playSound = useCallback((type: "success" | "wrong" | "combo" | "start" | "gameover") => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") void ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === "success") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.12); // G5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === "combo") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.08); // A5
        osc.frequency.setValueAtTime(1174.66, now + 0.16); // D6
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.28);
      } else if (type === "wrong") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(130, now + 0.22);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
        osc.start(now);
        osc.stop(now + 0.24);
      } else if (type === "start") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === "gameover") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(392, now);
        osc.frequency.exponentialRampToValueAtTime(261.63, now + 0.35);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      }
    } catch {
      // Audio unsupported or blocked
    }
  }, [soundEnabled]);

  // โหลด Best Score
  useEffect(() => {
    try {
      const saved = localStorage.getItem(BEST_SCORE_KEY);
      if (saved) setBestScore(Number(saved) || 0);
    } catch {
      // ignore
    }
  }, []);

  // ตัวจับเวลาสำหรับ Time Attack Mode
  useEffect(() => {
    if (gameState === "playing" && mode === "timeattack") {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setGameState("gameover");
            playSound("gameover");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, mode, playSound]);

  // สุ่มขยะชิ้นถัดไป
  const spawnNextItem = useCallback(() => {
    const randomIdx = Math.floor(Math.random() * WASTE_ITEMS.length);
    const itemData = WASTE_ITEMS[randomIdx];
    setCurrentItem({
      ...itemData,
      id: Date.now() + Math.random(),
    });
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(false);
    setHoveredBin(null);
  }, []);

  // เริ่มเกม
  const startGame = (chosenMode: GameMode = mode) => {
    setMode(chosenMode);
    setScore(0);
    setLives(3);
    setCombo(0);
    setMaxCombo(0);
    setSortedCount(0);
    setWrongCount(0);
    setMistakes([]);
    setFeedback(null);
    setTimeLeft(60);
    setGameState("playing");
    spawnNextItem();
    playSound("start");
  };

  // บันทึกแต้มเข้าโปรไฟล์ผู้ใช้ใน LocalStorage
  const syncScoreToUser = useCallback((earnedScore: number) => {
    if (earnedScore <= 0) return;
    try {
      const cached = localStorage.getItem("user");
      if (cached) {
        const u = JSON.parse(cached);
        const oldScore = typeof u.score === "number" ? u.score : 0;
        u.score = oldScore + Math.floor(earnedScore / 2); // มอบ Eco-Points 50% ของคะแนนในเกม
        localStorage.setItem("user", JSON.stringify(u));
      }
    } catch {
      // ignore
    }
  }, []);

  // ฟังก์ชันแยกขยะลงถัง
  const handleSortItem = useCallback(
    (targetBinId: "recycle" | "organic" | "general" | "hazardous") => {
      if (!currentItem || gameState !== "playing") return;

      const isCorrect = currentItem.category === targetBinId;
      const targetBin = BINS.find((b) => b.id === targetBinId);
      const correctBin = BINS.find((b) => b.id === currentItem.category);

      // Trigger Drop Animation on the bin
      setDropAnimation(targetBinId);
      setTimeout(() => setDropAnimation(null), 300);

      if (isCorrect) {
        const newCombo = combo + 1;
        if (newCombo > maxCombo) setMaxCombo(newCombo);

        // คะแนนพื้นฐาน + คอมโบโบนัส
        let basePoints = 10;
        if (newCombo >= 10) basePoints = 35;
        else if (newCombo >= 5) basePoints = 25;
        else if (newCombo >= 3) basePoints = 18;

        const newScore = score + basePoints;
        const newSortedCount = sortedCount + 1;

        setScore(newScore);
        setCombo(newCombo);
        setSortedCount(newSortedCount);

        // โบนัสเวลาในโหมดจับเวลา (ทุกๆ 3 คอมโบ +1 วินาที)
        let bonusTimeMsg = "";
        if (mode === "timeattack" && newCombo % 3 === 0) {
          setTimeLeft((t) => Math.min(t + 2, 90));
          bonusTimeMsg = " ⏳ +2s!";
        }

        setFeedback({
          text: `🎉 ถูกต้อง! +${basePoints} แต้ม ${newCombo >= 3 ? `(คอมโบ x${newCombo} 🔥)` : ""}${bonusTimeMsg}`,
          isCorrect: true,
          tip: currentItem.tip,
        });

        if (newCombo >= 3) {
          playSound("combo");
        } else {
          playSound("success");
        }

        if (newScore > bestScore) {
          setBestScore(newScore);
          try {
            localStorage.setItem(BEST_SCORE_KEY, String(newScore));
          } catch {
            // ignore
          }
        }

        spawnNextItem();
      } else {
        // ทิ้งผิดถัง
        const newWrong = wrongCount + 1;
        setWrongCount(newWrong);
        setCombo(0);

        // บันทึกความผิดพลาดไว้ทบทวน
        setMistakes((prev) => [
          ...prev.filter((m) => m.item.name !== currentItem.name),
          { item: currentItem, chosenBin: targetBin?.thaiName || targetBinId },
        ]);

        let remainingLives = lives;
        if (mode === "classic") {
          remainingLives = lives - 1;
          setLives(remainingLives);
        } else if (mode === "timeattack") {
          // โหมดจับเวลา: ทิ้งผิดหักแต้ม 5 แต้ม
          setScore((s) => Math.max(0, s - 5));
        }

        setFeedback({
          text: `❌ ยังไม่ถูกต้อง! "${currentItem.name}" ต้องทิ้งลง ${correctBin?.thaiName} (${correctBin?.colorName})`,
          isCorrect: false,
          tip: currentItem.tip,
        });

        playSound("wrong");

        if (mode === "classic" && remainingLives <= 0) {
          setGameState("gameover");
          playSound("gameover");
          syncScoreToUser(score);
        } else {
          spawnNextItem();
        }
      }
    },
    [
      currentItem,
      gameState,
      combo,
      maxCombo,
      score,
      sortedCount,
      mode,
      bestScore,
      spawnNextItem,
      playSound,
      wrongCount,
      lives,
      syncScoreToUser,
    ]
  );

  // Pointer Events สำหรับการลาก (Drag with Touch & Mouse support)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (gameState !== "playing" || !currentItem) return;
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    setDragOffset({ x: dx, y: dy });

    // ตรวจสอบว่าพอยน์เตอร์อยู่เหนือถังใบไหน
    let targetFound: string | null = null;
    for (const bin of BINS) {
      const el = binRefs.current[bin.id];
      if (el) {
        const rect = el.getBoundingClientRect();
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          targetFound = bin.id;
          break;
        }
      }
    }
    setHoveredBin(targetFound);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);

    let droppedBinId: "recycle" | "organic" | "general" | "hazardous" | null = null;
    for (const bin of BINS) {
      const el = binRefs.current[bin.id];
      if (el) {
        const rect = el.getBoundingClientRect();
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          droppedBinId = bin.id;
          break;
        }
      }
    }

    if (droppedBinId) {
      handleSortItem(droppedBinId);
    } else {
      // ดีดกลับตำแหน่งเดิม
      setDragOffset({ x: 0, y: 0 });
      setHoveredBin(null);
    }
  };

  // คำนวณฉายา / ระดับผู้เล่น
  const getPlayerRank = () => {
    if (score >= 300) return { title: "👑 เซียนแยกขยะระดับตำนาน (Zero Waste Legend)", color: "text-amber-500" };
    if (score >= 180) return { title: "🥇 ฮีโร่พิทักษ์สิ่งแวดล้อม (Recycle Hero)", color: "text-emerald-600" };
    if (score >= 80) return { title: "🥈 นักคัดแยกชุมชน (Eco Sorter)", color: "text-blue-600" };
    return { title: "🥉 ผู้ฝึกหัดรักษ์โลก (Green Novice)", color: "text-slate-600" };
  };

  return (
    <div className="w-full">
      {/* HUD Bar (โหมด, สถิติ, ปุ่มเปิด/ปิดเสียง) */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-4 mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500">โหมด:</span>
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
            {mode === "classic" && "💖 คลาสสิก 3 ชีวิต"}
            {mode === "timeattack" && "⏱️ จับเวลา 60 วินาที"}
            {mode === "practice" && "📚 ฝึกฝนไม่จำกัด"}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {gameState === "playing" && (
            <>
              {mode === "classic" && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-400">ชีวิต:</span>
                  <div className="text-lg">
                    {"❤️".repeat(Math.max(0, lives))}
                    {"🖤".repeat(Math.max(0, 3 - lives))}
                  </div>
                </div>
              )}

              {mode === "timeattack" && (
                <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-3 py-1 rounded-xl">
                  <span className="text-xs font-bold text-rose-600">เวลา:</span>
                  <span className={`text-base font-black ${timeLeft <= 10 ? "text-red-600 animate-ping" : "text-rose-700"}`}>
                    {timeLeft}s
                  </span>
                </div>
              )}

              {combo >= 2 && (
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-sm animate-bounce">
                  🔥 x{combo}
                </span>
              )}

              <div>
                <span className="text-xs font-bold text-slate-400">คะแนน:</span>{" "}
                <span className="text-xl font-black text-emerald-600">{score}</span>
              </div>
            </>
          )}

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            aria-label={soundEnabled ? "ปิดเสียง" : "เปิดเสียง"}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm transition"
          >
            {soundEnabled ? "🔊" : "🔇"}
          </button>
        </div>
      </div>

      {/* Main Play Area */}
      <div className="bg-gradient-to-b from-slate-50 to-white rounded-3xl border border-slate-200 shadow-xl p-4 md:p-8 min-h-[500px] flex flex-col justify-between relative overflow-hidden">
        
        {/* Background Decorative Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        {/* FEEDBACK BANNER TOAST */}
        {feedback && gameState === "playing" && (
          <div
            className={`p-3.5 rounded-2xl mb-4 text-center text-xs md:text-sm font-bold border transition-all animate-fade-in relative z-20 ${
              feedback.isCorrect
                ? "bg-emerald-50 text-emerald-900 border-emerald-300 shadow-sm"
                : "bg-rose-50 text-rose-900 border-rose-300 shadow-sm"
            }`}
          >
            <p className="text-sm md:text-base">{feedback.text}</p>
            {feedback.tip && (
              <p className="text-xs font-medium text-slate-600 mt-1">
                💡 <strong>เกร็ดความรู้:</strong> {feedback.tip}
              </p>
            )}
          </div>
        )}

        {/* ===== PLAYING SCREEN ===== */}
        {gameState === "playing" && currentItem && (
          <div className="flex flex-col items-center justify-between flex-1 relative z-10">
            {/* โซนการ์ดขยะตรงกลางจอ (Drag Item) */}
            <div className="py-4 flex flex-col items-center justify-center min-h-[220px]">
              <div
                ref={cardRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                style={{
                  transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) scale(${isDragging ? 1.08 : 1}) rotate(${
                    isDragging ? dragOffset.x * 0.05 : 0
                  }deg)`,
                  transition: isDragging ? "none" : "transform 0.25s cubic-bezier(0.2, 1, 0.3, 1)",
                  touchAction: "none",
                }}
                className={`relative w-72 md:w-80 bg-white p-6 rounded-3xl border-2 shadow-xl flex flex-col items-center text-center cursor-grab active:cursor-grabbing select-none transition-shadow ${
                  isDragging
                    ? "shadow-2xl border-emerald-400 ring-4 ring-emerald-400/40 z-40 opacity-95"
                    : "border-slate-200 hover:border-emerald-300 z-10"
                }`}
              >
                {/* Badge ประเภทวัสดุ */}
                <div className="self-end -mt-2 -mr-2 mb-1 bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
                  {currentItem.material}
                </div>

                <div className="w-20 h-20 bg-gradient-to-tr from-emerald-50 to-teal-50 rounded-2xl flex items-center justify-center text-5xl mb-3 shadow-inner border border-emerald-100 pointer-events-none">
                  {currentItem.emoji}
                </div>

                <h3 className="font-black text-slate-900 text-lg md:text-xl leading-snug mb-1 pointer-events-none">
                  {currentItem.name}
                </h3>
                <p className="text-xs text-slate-500 font-semibold mb-4 pointer-events-none">
                  🔍 {currentItem.hint}
                </p>

                <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 pointer-events-none">
                  <span>✋</span>
                  <span>ลากการ์ดนี้ไปทิ้งในถังขยะด้านล่าง</span>
                </div>
              </div>
            </div>

            {/* โซนถังขยะ 4 สี (Drop Targets / Tap Zones) */}
            <div className="w-full mt-6">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  ⬇️ ปล่อยลงถัง หรือแตะที่ถังเพื่อทิ้ง ⬇️
                </span>
                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                  (รองรับทั้งลากใส่ และแตะที่ถังโดยตรง)
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {BINS.map((bin) => {
                  const isHovered = hoveredBin === bin.id;
                  const isDropped = dropAnimation === bin.id;

                  return (
                    <div
                      key={bin.id}
                      ref={(el) => {
                        binRefs.current[bin.id] = el;
                      }}
                      onClick={() => handleSortItem(bin.id)}
                      className={`relative bg-white rounded-3xl p-4 md:p-5 border-2 flex flex-col items-center justify-between text-center transition-all duration-200 cursor-pointer select-none group min-h-[175px] ${
                        isHovered
                          ? `${bin.borderActive} scale-105 shadow-xl bg-gradient-to-b from-white to-slate-50`
                          : isDropped
                          ? "scale-95 border-emerald-400 bg-emerald-50"
                          : "border-slate-200 hover:border-slate-300 hover:shadow-md hover:scale-[1.02]"
                      }`}
                    >
                      {/* SVG Trash Bin with Opening Lid */}
                      <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mb-2">
                        {/* Bin Lid (Tilts open when hovered) */}
                        <div
                          style={{
                            transformOrigin: "left bottom",
                            transform: isHovered ? "rotate(-32deg) translateY(-8px)" : "rotate(0deg)",
                            transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                          }}
                          className={`absolute top-0 w-14 h-4 rounded-t-lg bg-gradient-to-r ${bin.bgGradient} shadow-sm z-10 flex items-center justify-center`}
                        >
                          <div className="w-4 h-1.5 bg-white/40 rounded-full" />
                        </div>

                        {/* Bin Body */}
                        <div
                          className={`w-12 h-14 rounded-b-2xl bg-gradient-to-b ${bin.bgGradient} text-white flex flex-col items-center justify-center shadow-md relative overflow-hidden group-hover:scale-105 transition-transform`}
                        >
                          <span className="text-xl md:text-2xl drop-shadow-sm">{bin.emoji}</span>
                          <div className="w-8 h-0.5 bg-white/30 rounded-full mt-1" />
                        </div>
                      </div>

                      {/* ชื่อถัง */}
                      <div>
                        <h4 className="font-black text-slate-900 text-sm md:text-base leading-tight">
                          {bin.thaiName}
                        </h4>
                        <span
                          className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-md border mt-1 ${bin.badgeBg} ${bin.badgeText}`}
                        >
                          {bin.colorName}
                        </span>
                      </div>

                      {/* Drop indicator hover overlay */}
                      {isHovered && (
                        <div className="absolute inset-0 rounded-3xl bg-emerald-500/15 border-2 border-emerald-500 animate-pulse pointer-events-none flex items-center justify-center">
                          <span className="bg-emerald-600 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg">
                            ทิ้งลงถังนี้! 🎯
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===== MENU SCREEN ===== */}
        {gameState === "menu" && (
          <div className="text-center py-6 px-4 flex flex-col items-center max-w-xl mx-auto relative z-10">
            <div className="w-24 h-24 bg-gradient-to-tr from-emerald-100 to-teal-100 rounded-3xl flex items-center justify-center text-5xl shadow-inner border border-emerald-200 mb-4 animate-bounce">
              🎯
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">
              เกมลากขยะลงถัง 4 สี
            </h2>
            <p className="text-slate-600 text-sm md:text-base font-medium mb-6 leading-relaxed">
              ฝึกทักษะการแยกขยะอย่างถูกต้องตามหลักสิ่งแวดล้อม ลากการ์ดตรงกลางไปใส่ถังให้ถูกสี
              สะสมแต้มคอมโบ และรับ Eco-Points แลกของรางวัล!
            </p>

            {/* Mode Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mb-6">
              <button
                onClick={() => setMode("classic")}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  mode === "classic"
                    ? "border-emerald-500 bg-emerald-50/80 shadow-md ring-2 ring-emerald-300"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="text-2xl mb-1">💖</div>
                <div className="font-black text-slate-900 text-sm">คลาสสิก</div>
                <div className="text-[11px] text-slate-500 mt-1 font-medium">3 หัวใจ เล่นเรื่อยๆ คอมโบคูณคะแนน</div>
              </button>

              <button
                onClick={() => setMode("timeattack")}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  mode === "timeattack"
                    ? "border-emerald-500 bg-emerald-50/80 shadow-md ring-2 ring-emerald-300"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="text-2xl mb-1">⏱️</div>
                <div className="font-black text-slate-900 text-sm">จับเวลา 60s</div>
                <div className="text-[11px] text-slate-500 mt-1 font-medium">แข่งทำแต้มเร็วที่สุด คอมโบต่อเวลา</div>
              </button>

              <button
                onClick={() => setMode("practice")}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  mode === "practice"
                    ? "border-emerald-500 bg-emerald-50/80 shadow-md ring-2 ring-emerald-300"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="text-2xl mb-1">📚</div>
                <div className="font-black text-slate-900 text-sm">ฝึกฝน/เรียนรู้</div>
                <div className="text-[11px] text-slate-500 mt-1 font-medium">ไม่จำกัดชีวิต มีคำอธิบายทุกชิ้น</div>
              </button>
            </div>

            {bestScore > 0 && (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2 rounded-xl text-xs font-bold mb-6">
                🏆 คะแนนสูงสุดของคุณ: <span className="font-black text-base">{bestScore}</span> แต้ม
              </div>
            )}

            <button
              onClick={() => startGame(mode)}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg py-4 px-12 rounded-2xl shadow-xl shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all"
            >
              ▶️ เริ่มเล่นเกมเลย
            </button>
          </div>
        )}

        {/* ===== GAME OVER SCREEN ===== */}
        {gameState === "gameover" && (
          <div className="text-center py-6 px-4 flex flex-col items-center max-w-lg mx-auto animate-fade-in relative z-10">
            <div className="text-6xl mb-2">🏁</div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-1">สรุปผลการเล่น</h2>
            
            {/* Rank Badge */}
            <div className={`text-xs md:text-sm font-black mb-3 ${getPlayerRank().color}`}>
              {getPlayerRank().title}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 w-full mb-6">
              <p className="text-4xl md:text-5xl font-black text-emerald-600 mb-1">
                {score} <span className="text-sm font-bold text-slate-500">คะแนน</span>
              </p>
              
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-200 text-center">
                <div>
                  <div className="text-xs text-slate-400 font-bold">แยกถูกต้อง</div>
                  <div className="text-base font-black text-slate-800">{sortedCount} ชิ้น</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-bold">คอมโบสูงสุด</div>
                  <div className="text-base font-black text-orange-600">x{maxCombo}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-bold">ความแม่นยำ</div>
                  <div className="text-base font-black text-slate-800">
                    {sortedCount + wrongCount > 0
                      ? `${Math.round((sortedCount / (sortedCount + wrongCount)) * 100)}%`
                      : "100%"}
                  </div>
                </div>
              </div>
            </div>

            {/* ทบทวนข้อผิดพลาด (ถ้ามี) */}
            {mistakes.length > 0 && (
              <div className="w-full text-left bg-rose-50/70 border border-rose-200 rounded-2xl p-4 mb-6">
                <div className="text-xs font-black text-rose-800 mb-2 flex items-center gap-1.5">
                  <span>💡</span>
                  <span>ทบทวนขยะที่คุณแยกผิด ({mistakes.length} รายการ):</span>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1 text-xs text-slate-700">
                  {mistakes.map((m, idx) => {
                    const cBin = BINS.find((b) => b.id === m.item.category);
                    return (
                      <div key={idx} className="bg-white p-2.5 rounded-xl border border-rose-100 shadow-2xs">
                        <div className="font-bold text-slate-900">
                          {m.item.emoji} {m.item.name}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          ทิ้งถูกคือ: <strong className="text-emerald-700">{cBin?.thaiName}</strong> ({cBin?.colorName})
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 italic">{m.item.tip}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3 w-full justify-center">
              <button
                onClick={() => startGame(mode)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base py-3.5 px-6 rounded-2xl shadow-lg shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all"
              >
                🔄 เล่นใหม่อีกครั้ง
              </button>
              <button
                onClick={() => setGameState("menu")}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base py-3.5 px-6 rounded-2xl transition"
              >
                เลือกโหมด
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
