"use client";
import { useEffect, useRef, useState, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "กล่องโฟมทิ้งถังไหน?",
  "ขวดพลาสติกต้องล้างก่อนทิ้งไหม?",
  "ถ่านไฟฉายเก่าทิ้งยังไง?",
  "กระดาษทิชชู่รีไซเคิลได้ไหม?",
];

const STORAGE_KEY = "waste-chat-history";

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  useEffect(() => {
    if (!hasLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50)));
    } catch {
      // ignore
    }
  }, [messages, hasLoaded]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isSending) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("กรุณาเข้าสู่ระบบก่อนใช้แชทบอทครับ");
      router.push("/login");
      return;
    }

    const userMessage: ChatMessage = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);

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
    if (confirm("ต้องการล้างประวัติแชททั้งหมดหรือไม่?")) {
      setMessages([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in pb-10 flex flex-col h-full">
      {/* ส่วนหัวแชท */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[2rem] p-6 text-white shadow-lg flex items-center justify-between mb-6 relative overflow-hidden shrink-0">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-3xl shadow-inner">
            🤖
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">ผู้ช่วยแยกขยะอัจฉริยะ</h1>
            <p className="text-emerald-50 text-sm font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse inline-block"></span>
              ออนไลน์ — พร้อมตอบคำถามเกี่ยวกับการจัดการขยะ
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="relative z-10 bg-white/20 hover:bg-white/30 backdrop-blur px-4 py-2 rounded-xl text-sm font-bold transition-colors active:scale-95"
          >
            🗑️ ล้างแชท
          </button>
        )}
        <div className="absolute -top-8 -right-8 text-8xl opacity-15 blur-sm pointer-events-none">♻️</div>
      </div>

      {/* พื้นที่แสดงข้อความ */}
      <div className="flex-1 bg-white rounded-[2rem] shadow-sm border border-slate-200/80 p-4 md:p-6 overflow-y-auto min-h-[300px] flex flex-col gap-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-10 flex-1">
            <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-4xl mb-4 border border-emerald-100">♻️</div>
            <h2 className="text-xl font-extrabold text-slate-900 mb-2">สวัสดีครับ! มีคำถามอะไรสงสัยไหม?</h2>
            <p className="text-slate-600 text-sm font-medium mb-8 max-w-sm">
              สอบถามการแยกขยะได้เลย เช่น กล่องโฟมทิ้งถังไหน? ขวดน้ำต้องล้างไหม? หรือถ่านไฟฉายทิ้งยังไง?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => sendMessage(suggestion)}
                  className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-bold text-sm px-4 py-3.5 rounded-2xl transition-colors text-left"
                >
                  💬 {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
              {msg.role === "assistant" && (
                <div className="w-9 h-9 bg-emerald-100 border border-emerald-200 rounded-xl flex items-center justify-center text-lg mr-2 shrink-0 mt-1">
                  🤖
                </div>
              )}
              <div
                className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm md:text-base leading-relaxed whitespace-pre-wrap shadow-sm font-medium ${
                  msg.role === "user"
                    ? "bg-emerald-600 text-white rounded-br-md"
                    : "bg-slate-100 text-slate-900 border border-slate-200/60 rounded-bl-md"
                }`}
              >
                {msg.content}
                {isSending && index === messages.length - 1 && msg.content === "" && (
                  <span className="inline-flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                  </span>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* ช่องพิมพ์ข้อความ */}
      <div className="mt-4 bg-white rounded-[2rem] shadow-sm border border-slate-200/80 p-3 flex items-end gap-3 shrink-0">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="พิมพ์คำถามเกี่ยวกับการจัดการขยะ... (Enter เพื่อส่ง)"
          rows={1}
          className="flex-1 resize-none bg-transparent outline-none text-slate-900 text-sm md:text-base font-semibold py-2 px-3 max-h-32 placeholder-slate-400"
        />
        <button
          onClick={() => sendMessage()}
          disabled={isSending || !input.trim()}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all shrink-0 ${
            isSending || !input.trim()
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 active:scale-95"
          }`}
        >
          {isSending ? "⏳" : "➤"}
        </button>
      </div>
    </div>
  );
}
