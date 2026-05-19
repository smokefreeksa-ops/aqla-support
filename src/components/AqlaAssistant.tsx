import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, X, Send, Loader2, RotateCcw } from "lucide-react";
import { getAssistantStatus, chatWithAssistant } from "@/lib/assistant.functions";
import { useDraggableWidget } from "@/hooks/use-draggable-widget";
import aqlaLogo from "@/assets/aqla-logo.png";

const PUBLIC_PATHS = ["/", "/about", "/assessment", "/volunteer", "/request-support", "/city-challenge", "/challenges", "/learn-train", "/shop", "/poster-studio", "/impact"];

type Msg = { role: "user" | "assistant"; content: string };

export function AqlaAssistant() {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isPublic = PUBLIC_PATHS.includes(location.pathname);
  const movedRef = useRef(false);

  const statusFn = useServerFn(getAssistantStatus);
  const chatFn = useServerFn(chatWithAssistant);

  const { data: status } = useQuery({
    queryKey: ["assistant-status"],
    queryFn: () => statusFn(),
    staleTime: 60_000,
    enabled: isPublic,
  });

  const launcher = useDraggableWidget({
    storageKey: "aqla_chat_position",
    defaultSide: "left",
    defaultBottom: 24,
    defaultSideOffset: 24,
  });

  useEffect(() => {
    const sync = () =>
      setLang((document.documentElement.lang === "ar" ? "ar" : "en"));
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["lang", "dir"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content:
            lang === "ar"
              ? "مرحبًا، أنا مساعد أقلع التثقيفي المبني على توجيهات د. مالك. أستطيع مساعدتك بالمعلومات العامة، الإرشاد المبني على الأدلة، وطريقة استخدام المنصة. لا أقدم تشخيصًا أو علاجًا، ولا أغني عن مراجعة المختص. في حال وجود أعراض طارئة، اطلب الرعاية الطبية العاجلة."
              : "Hello, I am Aqla’s AI education assistant based on Dr. Malik’s guidance. I can help with general education, evidence-based guidance, and using the platform. I do not provide diagnosis or treatment, and I am not a substitute for clinician review. For urgent symptoms, seek urgent medical care.",
        },
      ]);
    }
  }, [open, lang, messages.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  if (!isPublic || !status?.enabled) return null;

  const isRTL = lang === "ar";
  const t = {
    title: isRTL ? "اسأل دكتور مالك" : "Ask Dr. Malik",
    placeholder: isRTL ? "اكتب سؤالك…" : "Type your question…",
    disclaimer: isRTL
      ? "معلومات تثقيفية فقط — ليست استشارة طبية."
      : "Educational info only — not medical advice.",
    open: isRTL ? "اسأل د. مالك" : "Ask Dr. Malik",
    close: isRTL ? "إغلاق" : "Close",
    reset: isRTL ? "إعادة موضع الأزرار" : "Reset position",
    error: isRTL ? "تعذّر الإرسال. حاول مرة أخرى." : "Couldn't send. Please try again.",
  };

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const { reply } = await chatFn({ data: { lang, messages: next } });
      setMessages([...next, { role: "assistant", content: reply || "…" }]);
    } catch (e) {
      console.error(e);
      setMessages([...next, { role: "assistant", content: t.error }]);
    } finally {
      setSending(false);
    }
  }

  function resetPositions() {
    try {
      localStorage.removeItem("aqla_chat_position");
      localStorage.removeItem("aqla_whatsapp_position");
    } catch {
      /* ignore */
    }
    launcher.reset();
    // Force WhatsApp button to re-read by reloading — simplest reliable signal.
    window.dispatchEvent(new Event("aqla:reset-widgets"));
  }

  return (
    <>
      {!open && (
        <div
          ref={launcher.ref}
          style={{ ...launcher.style, zIndex: 40 }}
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
            aria-label={t.open}
            title={t.open}
            dir={isRTL ? "rtl" : "ltr"}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-shadow hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary/40 motion-reduce:transition-none"
          >
            <MessageCircle className="h-5 w-5 pointer-events-none" />
          </button>
        </div>
      )}

      {open && (
        <div
          dir={isRTL ? "rtl" : "ltr"}
          className="fixed bottom-[calc(24px+env(safe-area-inset-bottom,0px))] left-4 sm:left-6 flex w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-elegant"
          style={{ height: "min(28rem, calc(100vh - 8rem))", zIndex: 50 }}
        >
          <div className="flex items-center justify-between gap-2 border-b bg-primary px-3 py-2 text-primary-foreground">
            <div className="flex items-center gap-2">
              <img src={aqlaLogo} alt="Aqla — أقلع logo" className="h-6 w-6 rounded-full bg-white object-contain p-0.5" />
              <span className="text-sm font-semibold">{t.title}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={resetPositions}
                aria-label={t.reset}
                title={t.reset}
                className="rounded p-1 hover:bg-white/10"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t.close}
                className="rounded p-1 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto bg-background p-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                  m.role === "user"
                    ? `${isRTL ? "mr-auto" : "ml-auto"} bg-primary text-primary-foreground`
                    : `${isRTL ? "ml-auto" : "mr-auto"} bg-muted text-foreground`
                }`}
              >
                {m.content}
              </div>
            ))}
            {sending && (
              <div className={`flex items-center gap-2 text-xs text-muted-foreground ${isRTL ? "ml-auto" : "mr-auto"}`}>
                <Loader2 className="h-3 w-3 animate-spin" />
                {isRTL ? "يكتب…" : "Thinking…"}
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
                placeholder={t.placeholder}
                className="max-h-32 flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground disabled:opacity-50"
                aria-label={isRTL ? "إرسال" : "Send"}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">{t.disclaimer}</p>
          </form>
        </div>
      )}
    </>
  );
}
