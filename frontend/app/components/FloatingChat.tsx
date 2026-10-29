"use client";
import React, { useState, useEffect, useRef, KeyboardEvent } from "react";
import { usePathname } from "next/navigation";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "กล่องโฟมทิ้งถังไหน?",
  "จุดทิ้งขยะที่ Complex อยู่ตรงไหน?",
  "ขวดพลาสติกต้องล้างก่อนทิ้งไหม?",
  "ถ่านไฟฉายเก่าทิ้งที่ไหน?",
];

const STORAGE_KEY = "waste-chat-history";

export default function FloatingChat() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ไม่แสดงปุ่มแชทลอยในหน้า Login, Register หรือ Admin
  const isAuthOrAdmin = pathname === "/login" || pathname === "/register" || pathname.startsWith("/admin");

  // โหลดประวัติแชทจาก localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setMessages(
            parsed.filter(
              (m): m is ChatMessage =>
                m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string"
            )
          );
        }
      }
    } catch {
      // ignore
    }
    setHasLoaded(true);
  }, []);

  // บันทึกประวัติ
  useEffect(() => {
    if (!hasLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)));
    } catch {
      // ignore
    }
  }, [messages, hasLoaded]);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isSending, isOpen]);

  const sendMessage = async (textToSend?: string) => {
    const content = (textToSend ?? input).trim();
    if (!content || isSending) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      alert("กรุณาเข้าสู่ระบบก่อนใช้งานแชทบอทครับ");
      return;
    }

    const userMessage: ChatMessage = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);

    // Placeholder สำหรับ streaming
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const history = messages
        .filter((m) => m.content)
        .map((m) => ({ role: m.role === "assistant" ? ("model" as const) : ("user" as const), content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: content, history }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "เกิดข้อผิดพลาดในการติดต่อผู้ช่วย");
      }
      if (!res.body) throw new Error("ไม่สามารถรับข้อมูลจากเซิร์ฟเวอร์ได้");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";
        for (const event of events) {
          if (!event.startsWith("data: ")) continue;
          const payload = event.slice("data: ".length);
          if (payload === "[DONE]") continue;
          try {
            const parsed = JSON.parse(payload);
            if (parsed.error) throw new Error(parsed.error);
            if (typeof parsed.text === "string") {
              setMessages((prev) => {
                const next = [...prev];
                const last = next[next.length - 1];
                if (last?.role === "assistant") {
                  next[next.length - 1] = { ...last, content: last.content + parsed.text };
                }
                return next;
              });
            }
          } catch (err) {
            if (err instanceof Error && err.message) throw err;
          }
        }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.role === "assistant") {
          next[next.length - 1] = {
            role: "assistant",
            content: last.content || `⚠️ ${message}`,
          };
        }
        return next;
      });
    } finally {
      setIsSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    if (messages.length === 0) return;
    if (confirm("ต้องการล้างประวัติแชทหรือไม่?")) {
      setMessages([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  if (isAuthOrAdmin) return null;

  return (
    <>
      {/* 🌟 Floating Action Button (FAB) อยู่มุมขวาล่าง */}
      <div className="fixed bottom-24 md:bottom-7 right-5 z-40 flex flex-col items-end">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            aria-label="เปิดแชทผู้ช่วยแยกขยะ"
            className="group relative flex items-center gap-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-3.5 rounded-full shadow-2xl shadow-emerald-700/40 hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white"
          >
            <span className="text-2xl animate-bounce">💬</span>
            <span className="font-extrabold text-sm hidden sm:inline-block pr-1 tracking-tight">
              ถาม AI แยกขยะ
            </span>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
            </span>
          </button>
        )}

        {/* 🌟 หน้าต่างแชทลอย (Floating Chat Drawer / Box) */}
        {isOpen && (
          <div className="w-[92vw] sm:w-[390px] h-[520px] max-h-[82vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-fade-in z-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-700 to-teal-800 p-4 text-white flex items-center justify-between shadow-md shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-xl shadow-inner border border-white/20">
                  🤖
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-tight">ผู้ช่วยแยกขยะ AI</h3>
                  <p className="text-[11px] text-emerald-200 font-medium flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                    พร้อมตอบคำถามขยะ & จุดทิ้ง มข.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    title="ล้างข้อความ"
                    className="p-1.5 hover:bg-white/20 rounded-xl transition text-sm text-emerald-100 hover:text-white"
                  >
                    🗑️
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  title="ย่อหน้าต่าง"
                  className="p-1.5 hover:bg-white/20 rounded-xl transition text-base font-bold text-emerald-100 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50/60 space-y-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-6 text-slate-600">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center text-3xl mb-3 border border-emerald-200">
                    ♻️
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm mb-1">สวัสดีครับ! ถามวิธีแยกขยะได้เลย</h4>
                  <p className="text-xs text-slate-500 font-medium mb-4 max-w-[240px]">
                    สอบถามวิธีทิ้งขยะ หรือค้นหาจุดทิ้งขยะที่ใกล้ที่สุดใน มข. ได้ทันที
                  </p>
                  <div className="w-full space-y-2">
                    {SUGGESTIONS.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => sendMessage(s)}
                        className="w-full text-left text-xs font-semibold bg-white hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-300 text-slate-800 hover:text-emerald-900 p-2.5 rounded-xl transition shadow-xs"
                      >
                        💬 {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-7 h-7 bg-emerald-100 border border-emerald-200 rounded-lg flex items-center justify-center text-xs mr-2 shrink-0 mt-1">
                        🤖
                      </div>
                    )}
                    <div
                      className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs md:text-sm leading-relaxed whitespace-pre-wrap shadow-xs font-medium ${
                        msg.role === "user"
                          ? "bg-emerald-600 text-white rounded-br-xs"
                          : "bg-white text-slate-900 border border-slate-200/80 rounded-bl-xs"
                      }`}
                    >
                      {msg.content}
                      {isSending && idx === messages.length - 1 && msg.content === "" && (
                        <span className="inline-flex gap-1 items-center py-1">
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="พิมพ์ถามเรื่องขยะ/จุดทิ้ง... (Enter ส่ง)"
                rows={1}
                className="flex-1 resize-none bg-slate-50 text-slate-900 text-xs md:text-sm font-medium py-2 px-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 max-h-20 placeholder-slate-400"
              />
              <button
                onClick={() => sendMessage()}
                disabled={isSending || !input.trim()}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition shrink-0 ${
                  isSending || !input.trim()
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-95"
                }`}
              >
                {isSending ? "⏳" : "➤"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
