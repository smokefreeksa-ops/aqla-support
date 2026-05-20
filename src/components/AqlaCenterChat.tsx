import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Send, Loader2 } from "lucide-react";
import { getAssistantStatus, chatWithAssistant } from "@/lib/assistant.functions";
import { useAqlaButtonHandler, routeToButton, type AqlaButton } from "@/lib/aqla-actions";

type CenterType = "quit_pathway" | "help_pathway" | "learn_train" | "challenge_pathway";

type Msg = { role: "user" | "assistant"; content: string; buttons?: AqlaButton[] };

export function AqlaCenterChat({ centerType }: { centerType: CenterType }) {
  const [lang, setLang] = useState<"en" | "ar">("ar");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [sending, setSending] = useState(false);
  const [booted, setBooted] = useState(false);
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
    const sync = () =>
      setLang(document.documentElement.lang === "en" ? "en" : "ar");
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
          const btn = routeToButton(r.suggested_route, lang);
          if (btn && !buttons.some((b) => b.action === btn.action)) buttons.push(btn);
        }
        setMessages([{ role: "assistant", content: r.reply || "…", buttons }]);
      } catch (e) {
        console.error(e);
        setMessages([
          {
            role: "assistant",
            content: lang === "ar" ? "تعذّر تحميل المساعد. حاول مرة أخرى." : "Couldn't load assistant.",
          },
        ]);
      }
    })();
  }, [booted, status?.enabled, lang, centerType, chatFn]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const isRTL = lang === "ar";

  async function sendText(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
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
        const btn = routeToButton(r.suggested_route, lang);
        if (btn && !buttons.some((b) => b.action === btn.action)) buttons.push(btn);
      }
      setMessages([...next, { role: "assistant", content: r.reply || "…", buttons }]);
    } catch (e) {
      console.error(e);
      setMessages([
        ...next,
        {
          role: "assistant",
          content: lang === "ar" ? "تعذّر الإرسال. حاول مرة أخرى." : "Couldn't send. Please try again.",
        },
      ]);
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
        dir={isRTL ? "rtl" : "ltr"}
        className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground"
      >
        {isRTL
          ? "المساعد التفاعلي غير متاح حاليًا. يمكنك تصفّح الموارد أدناه."
          : "The interactive assistant is currently unavailable."}
      </div>
    );
  }

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="flex h-[36rem] max-h-[80vh] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-elegant"
    >
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
                  isRTL ? "ml-auto justify-end" : "mr-auto justify-start"
                } max-w-[88%]`}
              >
                {m.buttons.map((b, j) => (
                  <button
                    key={j}
                    type="button"
                    onClick={() => handleButton(b)}
                    className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-[12.5px] font-medium text-primary transition hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/40"
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
            dir={isRTL ? "rtl" : "ltr"}
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
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          {isRTL
            ? "معلومات تثقيفية فقط — ليست تشخيصًا أو علاجًا."
            : "Educational info only — not diagnosis or treatment."}
        </p>
      </form>
    </div>
  );
}
