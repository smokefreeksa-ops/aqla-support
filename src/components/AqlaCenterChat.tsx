import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Send, Loader2 } from "lucide-react";
import { getAssistantStatus, chatWithAssistant } from "@/lib/assistant.functions";
import { useAqlaButtonHandler, routeToButton, type AqlaButton } from "@/lib/aqla-actions";

type CenterType = "quit_pathway" | "help_pathway" | "learn_train" | "challenge_pathway";
type Language = "ar" | "en" | "ur" | "id" | "ms" | "tr" | "fa" | "fr" | "bn" | "hi" | "ha";

type Msg = { role: "user" | "assistant"; content: string; buttons?: AqlaButton[] };
const VALID_LANGS = new Set<Language>(["ar", "en", "ur", "id", "ms", "tr", "fa", "fr", "bn", "hi", "ha"]);
const RTL_LANGS = new Set<Language>(["ar", "ur", "fa"]);
const CONNECTION_ERROR_AR = "تعذّر الاتصال بالمركز حاليًا. يرجى المحاولة لاحقًا أو التواصل عبر واتساب.";
const CONNECTION_ERROR_EN = "The center is currently unavailable. Please try again later or contact us through WhatsApp.";
const CENTER_NAMES: Record<CenterType, { ar: string; en: string }> = {
  quit_pathway: { ar: "فريق مركز أقلع لدعم الإقلاع", en: "Aqla Quit Center Team" },
  learn_train: { ar: "مدرب أكاديمية أقلع", en: "Aqla Academy Instructor" },
  help_pathway: { ar: "مرشد مسار المساعدة من أقلع", en: "Aqla Help Pathway Guide" },
  challenge_pathway: { ar: "منسق مجتمع وتحديات أقلع", en: "Aqla Community & Challenges Coordinator" },
};

function safeLanguage(raw: string | null | undefined): Language {
  return raw && VALID_LANGS.has(raw as Language) ? (raw as Language) : "ar";
}

export function AqlaCenterChat({ centerType }: { centerType: CenterType }) {
  const [lang, setLang] = useState<Language>("ar");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [sending, setSending] = useState(false);
  const [booted, setBooted] = useState(false);
  const [hasConnectionError, setHasConnectionError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const statusFn = useServerFn(getAssistantStatus);
  const chatFn = useServerFn(chatWithAssistant);

  const { data: status } = useQuery({
    queryKey: ["assistant-status"],
    queryFn: () => statusFn(),
    staleTime: 60_000,
  });

  // Sync language with <html dir/lang>
  useEffect(() => {
    const sync = () => setLang(safeLanguage(document.documentElement.lang || localStorage.getItem("aqla_lang") || localStorage.getItem("lang")));
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["lang", "dir"] });
    return () => obs.disconnect();
  }, []);

  // Boot opening: ask server for static approved opening (sends a tiny ping)
  useEffect(() => {
    if (booted || !status?.enabled) return;
    setBooted(true);
    (async () => {
      try {
        const res = await chatFn({
          data: {
            lang,
            center_type: centerType,
            messages: [{ role: "user", content: " " }], // triggers approved opening
          },
        });
        const r = res as { reply?: string; suggested_route?: string | null; buttons?: AqlaButton[] };
        const buttons: AqlaButton[] = Array.isArray(r.buttons) ? r.buttons : [];
        if (r.suggested_route) {
          const btn = routeToButton(r.suggested_route, lang === "en" ? "en" : "ar");
          if (btn && !buttons.some((b) => b.action === btn.action)) buttons.push(btn);
        }
        setMessages([{ role: "assistant", content: r.reply || "…", buttons }]);
      } catch (e) {
        console.error("Aqla center chat boot failed", e);
        setHasConnectionError(true);
        setMessages([
          {
            role: "assistant",
            content: lang === "ar" ? CONNECTION_ERROR_AR : CONNECTION_ERROR_EN,
          },
        ]);
      }
    })();
  }, [booted, status?.enabled, lang, centerType, chatFn]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const dir = RTL_LANGS.has(lang) ? "rtl" : "ltr";
  const isRTL = dir === "rtl";

  async function sendText(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      setHasConnectionError(false);
      const res = await chatFn({
        data: {
          lang,
          center_type: centerType,
          messages: next.map(({ role, content }) => ({ role, content })),
        },
      });
      const r = res as { reply?: string; suggested_route?: string | null; buttons?: AqlaButton[] };
      const buttons: AqlaButton[] = Array.isArray(r.buttons) ? r.buttons : [];
      if (r.suggested_route) {
        const btn = routeToButton(r.suggested_route, lang === "en" ? "en" : "ar");
        if (btn && !buttons.some((b) => b.action === btn.action)) buttons.push(btn);
      }
      setMessages([...next, { role: "assistant", content: r.reply || "…", buttons }]);
    } catch (e) {
      console.error("Aqla center chat send failed", e);
      if (!hasConnectionError) {
        setHasConnectionError(true);
        setMessages([...next, { role: "assistant", content: lang === "ar" ? CONNECTION_ERROR_AR : CONNECTION_ERROR_EN }]);
      } else {
        setMessages(next);
      }
    } finally {
      setSending(false);
    }
  }

  const handleButton = useAqlaButtonHandler({
    sendMessage: (text: string) => void sendText(text),
  });

  if (!status?.enabled) {
    return (
      <div
        dir={dir}
        lang={lang}
        className={`rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground ${isRTL ? "text-right" : "text-left"}`}
      >
        {isRTL
          ? "المساعد التفاعلي غير متاح حاليًا. يمكنك تصفّح الموارد أدناه."
          : "The interactive assistant is currently unavailable."}
      </div>
    );
  }

  return (
    <div
      dir={dir}
      lang={lang}
      className={`flex h-[36rem] max-h-[80vh] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-elegant ${isRTL ? "text-right" : "text-left"}`}
    >
      <div className="border-b border-border bg-card px-4 py-3">
        <div className="text-sm font-semibold text-foreground">
          {lang === "en" ? CENTER_NAMES[centerType].en : CENTER_NAMES[centerType].ar}
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-background p-4">
        {messages.length === 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            {isRTL ? "جارٍ التحميل…" : "Loading…"}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className="space-y-2">
            <div
              dir={dir}
              className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[14px] leading-6 ${
                m.role === "user"
                  ? `${isRTL ? "mr-auto" : "ml-auto"} bg-primary text-primary-foreground`
                  : `${isRTL ? "ml-auto" : "mr-auto"} bg-muted text-foreground`
              }`}
            >
              {m.content}
            </div>
            {m.role === "assistant" && m.buttons && m.buttons.length > 0 && (
              <div
                className={`flex flex-wrap gap-2 ${
                  isRTL ? "ml-auto flex-row-reverse justify-end" : "mr-auto justify-start"
                } max-w-[88%]`}
              >
                {m.buttons.map((b, j) => (
                  <button
                    key={j}
                    type="button"
                    onClick={() => handleButton(b)}
                    className={`rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-[12.5px] font-medium text-primary transition hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/40 ${isRTL ? "text-right" : "text-left"}`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {sending && (
          <div
            className={`flex items-center gap-2 text-xs text-muted-foreground ${
              isRTL ? "ml-auto" : "mr-auto"
            }`}
          >
            <Loader2 className="h-3 w-3 animate-spin" />
            {isRTL ? "يكتب…" : "Thinking…"}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void sendText(input);
        }}
        className="border-t bg-card p-3"
      >
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void sendText(input);
              }
            }}
            rows={1}
            placeholder={isRTL ? "اكتب رسالتك…" : "Type your message…"}
            dir={dir}
            className={`max-h-32 flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${isRTL ? "text-right" : "text-left"}`}
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
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          {isRTL
            ? "معلومات تثقيفية فقط — ليست تشخيصًا أو علاجًا."
            : "Educational info only — not diagnosis or treatment."}
        </p>
      </form>
    </div>
  );
}
