"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";

/* =========================================================
   🎮 เกมรับขยะกลางอากาศ (Falling Trash Catch)
   ขยะตกลงมาจากด้านบน ผู้เล่นเลื่อนถังซ้าย-ขวา (ลาก / ปุ่ม / คีย์บอร์ด)
   แล้วสลับชนิดถังให้ตรงกับขยะที่ตกลงมา รับถูก = ได้คะแนน ผิดถัง/ปล่อยตก = เสียชีวิต
   ========================================================= */

// ---- ข้อมูลถังขยะทั้ง 4 ประเภท (สีตรงกับมาตรฐานในแอป) ----
const BIN_TYPES = [
  { id: "recycle", name: "รีไซเคิล", bg: "bg-yellow-400", emoji: "♻️", unlockAt: 1 },
  { id: "organic", name: "เปียก", bg: "bg-emerald-500", emoji: "🍃", unlockAt: 1 },
  { id: "general", name: "ทั่วไป", bg: "bg-blue-500", emoji: "🗑️", unlockAt: 2 },
  { id: "hazardous", name: "อันตราย", bg: "bg-red-500", emoji: "☣️", unlockAt: 3 },
];

// ---- ฐานข้อมูลขยะ ----
const TRASH = [
  { type: "recycle", name: "ขวดน้ำพลาสติก", emoji: "🧴" },
  { type: "recycle", name: "กระป๋องอะลูมิเนียม", emoji: "🥫" },
  { type: "recycle", name: "กล่องกระดาษ", emoji: "📦" },
  { type: "recycle", name: "ขวดแก้ว", emoji: "🍾" },
  { type: "organic", name: "เปลือกกล้วย", emoji: "🍌" },
  { type: "organic", name: "เศษผัก", emoji: "🥬" },
  { type: "organic", name: "แกนแอปเปิ้ล", emoji: "🍎" },
  { type: "organic", name: "ก้างปลา", emoji: "🐟" },
  { type: "general", name: "ซองขนม", emoji: "🍬" },
  { type: "general", name: "ถุงพลาสติกเปื้อน", emoji: "🛍️" },
  { type: "general", name: "กล่องโฟม", emoji: "🍱" },
  { type: "general", name: "หน้ากากอนามัย", emoji: "😷" },
  { type: "hazardous", name: "ถ่านไฟฉาย", emoji: "🔋" },
  { type: "hazardous", name: "หลอดไฟเก่า", emoji: "💡" },
  { type: "hazardous", name: "กระป๋องสเปรย์", emoji: "🧯" },
  { type: "hazardous", name: "ยาหมดอายุ", emoji: "💊" },
];

// ---- ค่าคงที่ของเกม ----
const BIN_W = 112;
const BIN_H = 64;
const ITEM_W = 110;
const ITEM_H = 78;
const BIN_MOVE_SPEED = 280; // px/วินาที
const MAX_LIVES = 3;
const BEST_KEY = "recyclesmart-game-best";

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

// ระดับความยาก: ทุกๆ 6 ชิ้นที่รับได้ จะปลดล็อกขยะชนิดใหม่ + เร็วขึ้น
const levelOf = (caught: number) => Math.min(Math.floor(caught / 6) + 1, 4);
const speedFor = (level: number) => 150 + (level - 1) * 40; // px/วินาที
const intervalFor = (level: number) => Math.max(1600 - (level - 1) * 220, 800); // มิลลิวินาที

type Status = "menu" | "playing" | "gameover";

interface FallingItem {
  id: number;
  type: string;
  name: string;
  emoji: string;
  x: number; // จุดกึ่งกลาง (px)
  y: number; // ขอบบน (px)
  speed: number; // px/วินาที
}

interface Hud {
  items: FallingItem[];
  binX: number;
  binType: string;
  score: number;
  combo: number;
  lives: number;
  caught: number;
  level: number;
}

export default function GamePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [areaSize, setAreaSize] = useState({ w: 0, h: 0 });
  const [status, setStatus] = useState<Status>("menu");
  // โหลดสถิติคะแนนสูงสุดจาก localStorage ตอน mount (guard SSR ที่ไม่มี window)
  const [best, setBest] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    try {
      const v = Number(window.localStorage.getItem(BEST_KEY) ?? "0");
      return Number.isFinite(v) ? v : 0;
    } catch {
      return 0;
    }
  });
  const [toast, setToast] = useState<{ text: string; kind: "good" | "bad" } | null>(null);
  const [final, setFinal] = useState({ score: 0, caught: 0, combo: 0 });

  // สถานะเกมทั้งหมดเก็บใน ref (เกมลูปอ่าน/เขียนทุกเฟรม)
  const itemsRef = useRef<FallingItem[]>([]);
  const binXRef = useRef(0);
  const binTypeRef = useRef("recycle");
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const caughtRef = useRef(0);
  const livesRef = useRef(MAX_LIVES);
  const dirRef = useRef(0);
  const draggingRef = useRef(false);
  const idRef = useRef(0);
  const ctxRef = useRef<AudioContext | null>(null);

  // ค่าที่ต้องวาดบนจอ จำลองจาก ref ทุกเฟรม (เพื่อให้ ESLint/React Compiler ห้ามอ่าน ref ใน render)
  const [hud, setHud] = useState<Hud>({
    items: [],
    binX: 0,
    binType: "recycle",
    score: 0,
    combo: 0,
    lives: MAX_LIVES,
    caught: 0,
    level: 1,
  });

  // ---- เสียงประกอบแบบเบาๆ (Web Audio ไม่ต้องพึ่งไลบรารี) ----
  const playTone = useCallback((freq: number, dur: number) => {
    try {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!ctxRef.current) ctxRef.current = new Ctor();
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") void ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur);
    } catch {
      // ไม่มีเสียงก็เล่นได้
    }
  }, []);

  // ---- วัดขนาดพื้นที่เกม ----
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      setAreaSize({ w, h });
      if (w > 0 && binXRef.current === 0) binXRef.current = w / 2;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // ---- จบเกม: เก็บสถิติ + อัปเดตคะแนนสูงสุด ----
  const endGame = useCallback(() => {
    setFinal({
      score: scoreRef.current,
      caught: caughtRef.current,
      combo: comboRef.current,
    });
    setStatus("gameover");
    setBest((prev) => {
      const nb = Math.max(prev, scoreRef.current);
      try {
        localStorage.setItem(BEST_KEY, String(nb));
      } catch {
        // ignore
      }
      return nb;
    });
    playTone(330, 0.35);
  }, [playTone]);

  // ---- สุ่มขยะชิ้นใหม่ (ตามระดับที่ปลดล็อกแล้ว) ----
  const spawnItem = useCallback((W: number, level: number): FallingItem => {
    const pool = TRASH.filter(
      (t) => BIN_TYPES.find((b) => b.id === t.type)!.unlockAt <= level
    );
    const t = pool[Math.floor(Math.random() * pool.length)];
    return {
      id: ++idRef.current,
      type: t.type,
      name: t.name,
      emoji: t.emoji,
      x: clamp(
        ITEM_W / 2 + 10 + Math.random() * (W - ITEM_W - 20),
        ITEM_W / 2 + 10,
        W - ITEM_W / 2 - 10
      ),
      y: -ITEM_H - 8,
      speed: speedFor(level) * (0.85 + Math.random() * 0.3),
    };
  }, []);

  // ---- เริ่มเกม ----
  const startGame = () => {
    itemsRef.current = [];
    scoreRef.current = 0;
    comboRef.current = 0;
    caughtRef.current = 0;
    livesRef.current = MAX_LIVES;
    dirRef.current = 0;
    binTypeRef.current = "recycle";
    if (areaSize.w > 0) binXRef.current = areaSize.w / 2;
    setHud({
      items: [],
      binX: areaSize.w > 0 ? areaSize.w / 2 : 0,
      binType: "recycle",
      score: 0,
      combo: 0,
      lives: MAX_LIVES,
      caught: 0,
      level: 1,
    });
    setToast(null);
    setStatus("playing");
    playTone(523, 0.15);
  };

  // ---- สลับชนิดถัง ----
  const setBinType = useCallback((id: string) => {
    binTypeRef.current = id;
  }, []);
  const cycleBin = useCallback((dir: number) => {
    const idx = BIN_TYPES.findIndex((b) => b.id === binTypeRef.current);
    binTypeRef.current = BIN_TYPES[(idx + dir + BIN_TYPES.length) % BIN_TYPES.length].id;
  }, []);

  // ---- คีย์บอร์ด ----
  useEffect(() => {
    if (status !== "playing") return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        dirRef.current = -1;
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        dirRef.current = 1;
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        cycleBin(1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        cycleBin(-1);
      } else if (e.key === "1") setBinType("recycle");
      else if (e.key === "2") setBinType("organic");
      else if (e.key === "3") setBinType("general");
      else if (e.key === "4") setBinType("hazardous");
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") dirRef.current = 0;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      dirRef.current = 0;
    };
  }, [status, setBinType, cycleBin]);

  // ---- เกมลูป (requestAnimationFrame) ----
  useEffect(() => {
    if (status !== "playing" || areaSize.w === 0 || areaSize.h === 0) return;

    let raf = 0;
    let last = performance.now();
    let spawnIn = 400; // ขยะชิ้นแรกออกไวหน่อย

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const { w: W, h: H } = areaSize;

      // เคลื่อนถังตามปุ่มกด/คีย์บอร์ด
      if (dirRef.current !== 0) {
        binXRef.current = clamp(
          binXRef.current + dirRef.current * BIN_MOVE_SPEED * dt,
          BIN_W / 2 + 4,
          W - BIN_W / 2 - 4
        );
      }

      const level = levelOf(caughtRef.current);

      // สุ่มขยะชิ้นใหม่
      spawnIn -= dt * 1000;
      if (spawnIn <= 0) {
        itemsRef.current.push(spawnItem(W, level));
        spawnIn = intervalFor(level) * (0.85 + Math.random() * 0.3);
      }

      // เคลื่อนขยะ + เช็คการรับเข้าถัง
      const binTop = H - BIN_H - 34;
      const alive: FallingItem[] = [];
      for (const it of itemsRef.current) {
        it.y += it.speed * dt;

        const verticalOverlap = it.y + ITEM_H >= binTop && it.y <= binTop + BIN_H;
        const horizontalOverlap = Math.abs(it.x - binXRef.current) < (ITEM_W + BIN_W) / 2 - 8;

        if (verticalOverlap && horizontalOverlap) {
          if (it.type === binTypeRef.current) {
            // รับถูกถัง: คะแนนเพิ่มตามคอมโบ
            const gained = 10 + Math.min(comboRef.current, 10) * 2;
            scoreRef.current += gained;
            comboRef.current += 1;
            caughtRef.current += 1;
            setToast({ text: `ถูกต้อง! +${gained}`, kind: "good" });
            playTone(660, 0.12);
          } else {
            livesRef.current -= 1;
            comboRef.current = 0;
            setToast({ text: "ผิดถัง! ❤️ -1", kind: "bad" });
            playTone(200, 0.25);
          }
          if (livesRef.current <= 0) {
            endGame();
            cancelAnimationFrame(raf);
            return;
          }
          continue; // ทิ้งขยะชิ้นที่รับแล้ว
        }

        if (it.y > H + 10) {
          // ปล่อยตกพ้นจอ
          livesRef.current -= 1;
          comboRef.current = 0;
          setToast({ text: "ปล่อยตก! ❤️ -1", kind: "bad" });
          playTone(200, 0.25);
          if (livesRef.current <= 0) {
            endGame();
            cancelAnimationFrame(raf);
            return;
          }
          continue;
        }

        alive.push(it);
      }
      itemsRef.current = alive;

      // จำลองค่าลง state เพื่อให้ React วาดใหม่ทุกเฟรม
      setHud({
        items: alive,
        binX: binXRef.current,
        binType: binTypeRef.current,
        score: scoreRef.current,
        combo: comboRef.current,
        lives: livesRef.current,
        caught: caughtRef.current,
        level: levelOf(caughtRef.current),
      });
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [status, areaSize, endGame, playTone, spawnItem]);

  // ---- เคลียร์ข้อความแจ้งเตือนอัตโนมัติ ----
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 900);
    return () => clearTimeout(t);
  }, [toast]);

  // ---- ลากนิ้ว/เมาส์เพื่อเลื่อนถัง ----
  const moveBinToPointer = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    binXRef.current = clamp(clientX - rect.left, BIN_W / 2 + 4, rect.width - BIN_W / 2 - 4);
  };
  const handleAreaPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (status !== "playing") return;
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    moveBinToPointer(e.clientX);
  };
  const handleAreaPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    moveBinToPointer(e.clientX);
  };
  const stopDrag = () => {
    draggingRef.current = false;
  };

  const bin = BIN_TYPES.find((b) => b.id === hud.binType)!;
  const binTop = areaSize.h > 0 ? areaSize.h - BIN_H - 34 : 0;
  const { score, combo, lives, caught, level, binX, items } = hud;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 animate-fade-in">
      <h1 className="text-3xl md:text-4xl font-black text-emerald-700 mb-2">🎮 มินิเกมแยกขยะ</h1>
      <p className="text-gray-500 mb-6 font-medium">
        เกมใหม่ล่าสุด — <span className="font-bold text-emerald-600">รับขยะกลางอากาศ</span> เลื่อนถังให้ทันขยะที่ตกลงมา!
      </p>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-4 md:p-6">
        {/* ===== พื้นที่เกม ===== */}
        <div
          ref={containerRef}
          onPointerDown={handleAreaPointerDown}
          onPointerMove={handleAreaPointerMove}
          onPointerUp={stopDrag}
          onPointerLeave={stopDrag}
          onPointerCancel={stopDrag}
          className="relative h-[55vh] max-h-[520px] min-h-[380px] overflow-hidden rounded-3xl bg-gradient-to-b from-sky-100 via-emerald-50 to-emerald-100 select-none touch-none cursor-grab active:cursor-grabbing"
        >
          {/* แถบพื้นดิน */}
          <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-emerald-200/70 to-transparent pointer-events-none" />

          {/* ขยะที่ตกลงมา */}
          {items.map((it) => (
            <div
              key={it.id}
              className="absolute z-0 flex flex-col items-center"
              style={{ left: it.x - ITEM_W / 2, top: it.y, width: ITEM_W }}
            >
              <span className="text-5xl leading-none drop-shadow-md">{it.emoji}</span>
              <span className="text-[11px] font-bold bg-white/90 px-2 py-0.5 rounded-full shadow-sm mt-1 whitespace-nowrap">
                {it.name}
              </span>
            </div>
          ))}

          {/* ถังขยะ (ผู้เล่น) */}
          <div className="absolute z-10" style={{ left: binX - BIN_W / 2, top: binTop }}>
            <div
              className={`${bin.bg} w-[112px] h-[64px] rounded-t-lg rounded-b-3xl border-4 border-white/80 shadow-xl flex flex-col items-center justify-center`}
            >
              <span className="text-2xl leading-none drop-shadow">{bin.emoji}</span>
              <span className="text-xs font-bold text-white drop-shadow">{bin.name}</span>
            </div>
          </div>

          {/* ข้อความแจ้งเตือน (ถูก/ผิด/ปล่อยตก) */}
          {toast && (
            <div
              className={`absolute top-4 left-1/2 -translate-x-1/2 z-20 px-5 py-2 rounded-2xl font-black text-lg shadow-lg animate-fade-in ${
                toast.kind === "good" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
              }`}
            >
              {toast.text}
            </div>
          )}

          {/* ===== แถบสถานะระหว่างเล่น ===== */}
          {status === "playing" && (
            <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between bg-white/85 backdrop-blur rounded-2xl px-4 py-2 shadow-sm font-bold text-sm md:text-base">
              <span className="text-red-500 text-lg leading-none tracking-tight">
                {"❤️".repeat(Math.max(lives, 0))}
                {"🖤".repeat(Math.max(MAX_LIVES - lives, 0))}
              </span>
              <span className="text-gray-800">
                คะแนน <span className="text-emerald-600">{score}</span>
              </span>
              {combo >= 2 && <span className="text-orange-500 animate-pulse">🔥 x{combo}</span>}
              <span className="text-gray-500">ระดับ {level}</span>
              <button
                onClick={endGame}
                aria-label="จบเกม"
                className="bg-gray-100 hover:bg-gray-200 text-gray-500 text-xs px-2 py-1 rounded-lg transition"
              >
                ⏹
              </button>
            </div>
          )}

          {/* ===== หน้าเมนู / จบเกม (ครอบคลุมพื้นที่เกม) ===== */}
          {status !== "playing" && (
            <div className="absolute inset-0 z-30 bg-white/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
              {status === "menu" ? (
                <>
                  <div className="text-7xl mb-4">🛸</div>
                  <h2 className="text-2xl md:text-3xl font-black text-gray-800 mb-2">
                    เกมรับขยะกลางอากาศ
                  </h2>
                  <p className="text-gray-500 font-medium mb-6 max-w-md">
                    ขยะกำลังตกลงมา! เลื่อนถังไปรับให้ตรงชนิด รับถูกถังได้คะแนนสะสมคอมโบ
                    ผิดถังหรือปล่อยตกเสีย 1 ❤️ (มี 3 ชีวิต)
                  </p>
                  <div className="text-left bg-emerald-50 rounded-2xl p-4 mb-6 space-y-2 text-sm text-gray-600 font-medium w-full max-w-sm">
                    <p>📱 ลากนิ้วบนจอ หรือกด ◀ ▶ เพื่อเลื่อนถัง</p>
                    <p>🗂️ กดปุ่มสีเพื่อสลับชนิดถัง (คีย์บอร์ด: ↑↓ หรือ 1-4)</p>
                    <p>📈 รับครบ 6 ชิ้น = ปลดล็อกขยะชนิดใหม่ + เกมเร็วขึ้น</p>
                  </div>
                  {best > 0 && (
                    <p className="text-gray-400 font-bold mb-4">🏆 คะแนนสูงสุด: {best}</p>
                  )}
                  <button
                    onClick={startGame}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xl py-4 px-10 rounded-2xl shadow-lg transition-transform active:scale-95"
                  >
                    ▶️ เริ่มเกมเลย!
                  </button>
                </>
              ) : (
                <>
                  <div className="text-7xl mb-4">🏁</div>
                  <p className="text-2xl font-bold text-gray-800 mb-2">จบเกม!</p>
                  <p className="text-5xl font-black text-emerald-500 mb-1">{final.score} คะแนน</p>
                  <p className="text-gray-400 font-bold mb-2">
                    รับขยะได้ {final.caught} ชิ้น · คอมโบสูงสุด x{Math.max(final.combo, 1)}
                  </p>
                  {final.score >= best && final.score > 0 && (
                    <p className="text-yellow-500 font-black mb-4 animate-bounce">🎉 สถิติใหม่!</p>
                  )}
                  {final.score > 0 && final.score < best && (
                    <p className="text-gray-400 font-bold mb-4">🏆 คะแนนสูงสุด: {best}</p>
                  )}
                  <button
                    onClick={startGame}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xl py-4 px-10 rounded-2xl shadow-lg transition-transform active:scale-95"
                  >
                    🔄 เล่นอีกครั้ง
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* ===== ปุ่มควบคุม (แสดงเฉพาะตอนเล่น) ===== */}
        {status === "playing" && (
          <div className="mt-4">
            {/* ปุ่มเลื่อนถัง */}
            <div className="flex items-center gap-3 mb-3">
              <button
                onPointerDown={() => (dirRef.current = -1)}
                onPointerUp={() => (dirRef.current = 0)}
                onPointerLeave={() => (dirRef.current = 0)}
                onPointerCancel={() => (dirRef.current = 0)}
                aria-label="เลื่อนถังไปซ้าย"
                className="w-14 h-14 rounded-2xl bg-gray-100 hover:bg-gray-200 text-2xl font-black text-gray-600 shadow-sm active:scale-90 transition select-none touch-none"
              >
                ◀
              </button>
              <div className="flex-1 text-center text-xs md:text-sm text-gray-400 font-medium">
                ลากบนจอเกมเพื่อเลื่อนถังได้ด้วย (คีย์บอร์ด: ← →)
              </div>
              <button
                onPointerDown={() => (dirRef.current = 1)}
                onPointerUp={() => (dirRef.current = 0)}
                onPointerLeave={() => (dirRef.current = 0)}
                onPointerCancel={() => (dirRef.current = 0)}
                aria-label="เลื่อนถังไปขวา"
                className="w-14 h-14 rounded-2xl bg-gray-100 hover:bg-gray-200 text-2xl font-black text-gray-600 shadow-sm active:scale-90 transition select-none touch-none"
              >
                ▶
              </button>
            </div>

            {/* ปุ่มสลับชนิดถัง */}
            <div className="grid grid-cols-4 gap-3">
              {BIN_TYPES.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBinType(b.id)}
                  className={`${b.bg} text-white rounded-2xl p-3 md:p-4 shadow-md transition-all active:scale-90 flex flex-col items-center gap-1 ${
                    hud.binType === b.id
                      ? "ring-4 ring-offset-2 ring-emerald-300 scale-105"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <span className="text-2xl">{b.emoji}</span>
                  <span className="font-bold text-sm md:text-base">{b.name}</span>
                </button>
              ))}
            </div>

            {/* แถบแสดงชนิดถังที่จะปลดล็อกถัดไป */}
            <p className="text-center text-xs text-gray-400 font-medium mt-3">
              {level < 4
                ? `รับขยะอีก ${6 - (caught % 6)} ชิ้น ปลดล็อกขยะชนิดใหม่ (ระดับ ${level + 1})`
                : "ถึงระดับสูงสุดแล้ว! รับมือให้ได้มากที่สุด 🏆"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
