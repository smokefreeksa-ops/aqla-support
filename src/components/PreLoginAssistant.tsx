import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { chatWithAssistant } from "@/lib/assistant.functions";
import { useDraggableWidget } from "@/hooks/use-draggable-widget";

type Msg = { role: "user" | "assistant"; content: string };

const OPENING =
  "يا هلا والله. تقدر تسألني عن أقلع، طريقة التسجيل، المسارات المتاحة، الخصوصية، أو كيف تبدأ بعد الدخول.";

export function PreLoginAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", content: OPENING }]);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const movedRef = useRef(false);

  const chatFn = useServerFn(chatWithAssistant);

  const launcher = useDraggableWidget({
    storageKey: "aqla_public_chat_position",
    defaultSide: "left",
    defaultBottom: 24,
    defaultSideOffset: 24,
  });

  useEffect(() => {
    const h = () => launcher.reset();
    window.addEventListener("aqla:reset-widgets", h);
    return () => window.removeEventListener("aqla:reset-widgets", h);
  }, [launcher]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function send() {
    const trimmed = input.trim();
    if (!trimmed || sending) return;
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const res = (await chatFn({
        data: {
          lang: "ar",
          center_type: "general",
          messages: next.map(({ role, content }) => ({ role, content })),
        },
      })) as { reply?: string };
      setMessages([...next, { role: "assistant", content: res.reply || "…" }]);
    } catch (e) {
      console.error(e);
      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            "تعذّر الاتصال حاليًا. للتواصل المباشر استخدم زر واتساب أو حاول لاحقًا.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {!open && (
        <div
          ref={launcher.ref}
          style={{ ...launcher.style, zIndex: 110 }}
          onPointerDown={(e) => {
            movedRef.current = false;
            const sx = e.clientX, sy = e.clientY;
            const mv = (ev: PointerEvent) => {
              if (Math.hypot(ev.clientX - sx, ev.clientY - sy) > 4) movedRef.current = true;
            };
            window.addEventListener("pointermove", mv);
            window.addEventListener("pointerup", () => window.removeEventListener("pointermove", mv), { once: true });
            launcher.onPointerDown(e);
          }}
        >
          <button
            type="button"
            onClick={() => {
              if (movedRef.current || launcher.dragging) return;
              setOpen(true);
            }}
            dir="rtl"
            className="inline-flex items-center gap-2 rounded-full bg-[#c9a84c] px-4 py-2.5 text-sm font-semibold text-[#0b3a25] shadow-lg transition hover:bg-[#d8b85f] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50"
          >
            <MessageCircle className="h-4 w-4" />
            <span>عندك سؤال قبل التسجيل؟</span>
          </button>
        </div>
      )}

      {open && (
        <div
          dir="rtl"
          lang="ar"
          className="fixed bottom-[calc(24px+env(safe-area-inset-bottom,0px))] left-4 sm:left-6 flex w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-[#c9a84c]/40 bg-white text-foreground shadow-2xl"
          style={{ height: "min(28rem, calc(100vh - 8rem))", zIndex: 120 }}
        >
          <div className="flex items-center justify-between gap-2 border-b bg-[#0b3a25] px-3 py-2 text-[#f4f0e1]">
            <span className="text-sm font-semibold">مساعد أقلع قبل التسجيل</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="إغلاق"
              className="rounded p-1 hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto bg-background p-3">
            {messages.map((m, i) => (
              <div
                key={i}
                dir="rtl"
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm text-right ${
                  m.role === "user"
                    ? "mr-auto bg-[#0b3a25] text-[#f4f0e1]"
                    : "ml-auto bg-muted text-foreground"
                }`}
                style={{ unicodeBidi: "plaintext" }}
              >
                {m.content}
              </div>
            ))}
            {sending && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground ml-auto">
                <Loader2 className="h-3 w-3 animate-spin" /> يكتب…
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
            className="border-t bg-card p-2"
          >
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                rows={1}
                placeholder="اكتب سؤالك…"
                dir="rtl"
                className="max-h-32 flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#0b3a25]/30"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                aria-label="إرسال"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#0b3a25] text-[#f4f0e1] disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
