import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { getAssistantStatus, chatWithAssistant } from "@/lib/assistant.functions";

const PUBLIC_PATHS = ["/", "/about", "/assessment", "/volunteer"];

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

  const statusFn = useServerFn(getAssistantStatus);
  const chatFn = useServerFn(chatWithAssistant);

  const { data: status } = useQuery({
    queryKey: ["assistant-status"],
    queryFn: () => statusFn(),
    staleTime: 60_000,
    enabled: isPublic,
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
              ? "مرحباً 👋 أنا مساعد أقلع التعليمي. كيف أستطيع مساعدتك في معلومات الإقلاع عن التدخين والنيكوتين؟"
              : "Hi 👋 I'm the Aqla Education Assistant. How can I help with information about quitting smoking or nicotine?",
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
    title: isRTL ? "مساعد أقلع التعليمي" : "Aqla Education Assistant",
    placeholder: isRTL ? "اكتب سؤالك…" : "Type your question…",
    disclaimer: isRTL
      ? "معلومات تثقيفية فقط — ليست استشارة طبية."
      : "Educational info only — not medical advice.",
    open: isRTL ? "افتح المساعد" : "Open assistant",
    close: isRTL ? "إغلاق" : "Close",
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

  const sideClass = isRTL ? "left-4" : "right-4";
  // Offset so we don't collide with the WhatsApp button (which sits on the opposite side anyway,
  // but on RTL both can end up on the left). Stack vertically when needed.
  const bottom = isRTL ? "bottom-24" : "bottom-24";

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t.open}
          dir={isRTL ? "rtl" : "ltr"}
          className={`fixed ${bottom} ${sideClass} z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-elegant transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/40`}
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div
          dir={isRTL ? "rtl" : "ltr"}
          className={`fixed ${bottom} ${sideClass} z-50 flex w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-elegant`}
          style={{ height: "min(28rem, calc(100vh - 8rem))" }}
        >
          <div className="flex items-center justify-between gap-2 border-b bg-primary px-3 py-2 text-primary-foreground">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-semibold">{t.title}</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t.close}
              className="rounded p-1 hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
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
