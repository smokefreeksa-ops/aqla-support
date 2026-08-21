import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Printer, LayoutDashboard } from "lucide-react";
import {
  startClinicalPlan,
  saveClinicalAnswers,
  finalizeClinicalPlan,
  claimClinicalPlan,

} from "@/lib/clinical/clinical-plan.functions";
import { QUESTIONS, nextQuestion, hasEmergencyRedFlag, type Question } from "@/lib/clinical/questions";
import { evaluateSafety } from "@/lib/clinical/safety";
import type { ClinicalAnswers, ClinicalPlanJSON } from "@/lib/clinical/types";
import aqlaLogo from "@/assets/aqla-logo.png";
import { ClinicalPlanView } from "@/components/clinical/ClinicalPlanView";

type Msg = {
  from: "bot"| "user";
  text: string;
  quickReplies?: QuickReply[];
  multi?: QuickReply[];
  actions?: { label: string; onClick: () => void; variant?: "primary"| "secondary"; icon?: "print"| "dashboard" }[];
  input?: "text"| "email"| "number-row"| "number";
  plan?: ClinicalPlanJSON;
};
type QuickReply = { label: string; value: string };

function anonId(): string {
  const k = "aqla_anon_session";
  let v = typeof window !== "undefined" ? localStorage.getItem(k) : null;
  if (!v) {
    v = crypto.randomUUID();
    if (typeof window !== "undefined") localStorage.setItem(k, v);
  }
  return v;
}

export function QuitChatConversation({
  onPlan,
  onBeforeNavigate,
}: {
  onPlan: (p: ClinicalPlanJSON) => void;
  /** Called right before any in-app navigation (lets a host drawer/modal close first). */
  onBeforeNavigate?: () => void;
}) {
  const go = (fn: () => void) => {
    onBeforeNavigate?.();
    fn();
  };
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [answers, setAnswers] = useState<ClinicalAnswers>({});
  const [answeredIds, setAnsweredIds] = useState<string[]>([]);
  const [current, setCurrent] = useState<Question | null>(null);
  const [input, setInput] = useState("");
  const [multiSel, setMultiSel] = useState<string[]>([]);
  const [typing, setTyping] = useState(false);
  const [locked, setLocked] = useState(false);
  const planIdRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const say = async (text: string, opts: Partial<Msg> = {}, delay = 900) => {
    setTyping(true);
    await new Promise((r) => setTimeout(r, delay));
    setTyping(false);
    setMessages((m) => [...m, { from: "bot", text, ...opts }]);
  };

  const userSay = (text: string) => {
    setMessages((m) => {
      const cleaned = m.map((x, i) =>
        i === m.length - 1 ? { ...x, quickReplies: undefined, multi: undefined, input: undefined } : x,
      );
      return [...cleaned, { from: "user", text }];
    });
  };

  const askQuestion = async (q: Question, a: ClinicalAnswers) => {
    setCurrent(q);
    const opts: Partial<Msg> = {};
    if (q.kind === "choice"|| q.kind === "notice") {
      opts.quickReplies = (q.choices ?? []).map((c) => ({ label: c.label_ar, value: c.value }));
    } else if (q.kind === "multi") {
      opts.multi = (q.choices ?? []).map((c) => ({ label: c.label_ar, value: c.value }));
    } else if (q.kind === "scale") {
      opts.input = "number-row";
    } else if (q.kind === "email") {
      opts.input = "email";
    } else if (q.kind === "number") {
      opts.input = "number";
    } else {
      opts.input = "text";
    }
    await say(q.prompt_ar(a), opts);
  };

  const finish = async (a: ClinicalAnswers) => {
    setCurrent(null);
    setLocked(true);
    setTyping(true);
    try {
      const res = await finalizeClinicalPlan({
        data: { planId: planIdRef.current!, answers: a as Record<string, unknown> },
      });
      setTyping(false);
      onPlan(res.plan);
      const emailLine =
        res.emailStatus === "sent"? "أرسلنا لك نسخة على بريدك الإلكتروني.": res.emailStatus === "disabled_minor"? "لم نرسل نسخة بالبريد لأن الإرسال معطّل لمن هم دون 18 سنة.": res.emailStatus === "not_requested"? "لم نرسل أي بريد لأنك لم توافق على ذلك.": "لم نتمكن من إرسال البريد الآن، لكن خطتك محفوظة ومتاحة للعرض والتحميل.";

      await say(
        res.plan.safety.suppress_plan
          ? "سلامتك أولًا — راجع التنبيه بالأسفل."
          : `تمت خطتك يا ${res.plan.identity.nickname}. ${emailLine}`,
        { plan: res.plan },
        400,
      );
      // Attach the plan to the signed-in user so it reopens from the dashboard.
      void (async () => {
        try {
          const { supabase } = await import("@/integrations/supabase/client");
          const { data: sess } = await supabase.auth.getSession();
          if (sess.session) await claimClinicalPlan({ data: { planToken: res.planToken } });
        } catch {
          /* anonymous users keep the tokenised link only */
        }
      })();

      setMessages((m) => [
        ...m,
        {
          from: "bot",
          text: "وش تحب تسوي الحين؟",
          actions: [
            {
              label: "تحميل خطتي PDF",
              onClick: () => go(() => navigate({ to: "/quit-plan/$planToken", params: { planToken: res.planToken } })),
              icon: "print",
            },
            {
              label: "الذهاب للوحة التحكم",
              onClick: () => go(() => navigate({ to: "/dashboard" })),
              variant: "secondary",
              icon: "dashboard",
            },
          ],
        },
      ]);

    } catch (e) {
      setTyping(false);
      setLocked(false);
      await say(
        `ما قدرنا نحفظ خطتك الآن بسبب مشكلة تقنية (${(e as Error).message}). جرّب مرة ثانية بعد قليل — إجاباتك ما زالت محفوظة في هذه الجلسة.`,
        {},
        200,
      );
    }
  };

  const emergencyHold = async (a: ClinicalAnswers) => {
    setCurrent(null);
    setLocked(true);
    const safety = evaluateSafety(a, a.jurisdiction === "SA"? "SA": "GENERIC");
    await say(
      `سلامتك الآن أهم من أي خطة.\n\n${safety.message_ar}\n\n${safety.actions_ar.join("\n")}`,
      {},
      400,
    );
    setMessages((m) => [
      ...m,
      {
        from: "bot",
        text: "أوقفنا بقية الأسئلة مؤقتًا. تقدر ترجع لأقلع وتكمل خطتك بعد ما تطمئن على سلامتك.",
        actions: [
          {
            label: "العودة إلى أقلع",
            onClick: () => go(() => navigate({ to: "/" })),
            variant: "secondary",
          },
        ],
      },
    ]);
  };

  const advance = async (a: ClinicalAnswers, ids: string[]) => {
    if (planIdRef.current) {
      void saveClinicalAnswers({
        data: { planId: planIdRef.current, answers: a as Record<string, unknown> },
      }).catch(() => undefined);
    }
    // Emergency gate fires immediately — no further questions, no plan, no email, no PDF.
    if (hasEmergencyRedFlag(a)) {
      await emergencyHold(a);
      return;
    }
    const q = nextQuestion(a, ids);
    if (!q) {
      await finish(a);
      return;
    }
    await askQuestion(q, a);
  };

  const commit = async (patch: Partial<ClinicalAnswers>, id: string) => {
    const a = { ...answers, ...patch };
    const ids = [...answeredIds, id];
    setAnswers(a);
    setAnsweredIds(ids);
    await advance(a, ids);
  };

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    (async () => {
      await say(
        "أهلاً بك في مركز أقلع الافتراضي لدعم الإقلاع. أنا مساعدك الذكي، ولست هنا لأعطيك وصفة طبية، بل لأرافقك خطوة بخطوة لبناء خطتك السلوكية الشخصية ",
        {},
        500,
      );
      try {
        const res = await startClinicalPlan({ data: { anonymousSessionId: anonId() } });
        planIdRef.current = res.planId;
      } catch {
        await say("ملاحظة: تعذّر الاتصال بالخادم الآن، فلن تُحفظ خطتك تلقائيًا. تقدر تكمل وتطبعها.", {}, 300);
      }
      await askQuestion(QUESTIONS[0], {});
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- answer handlers ----
  const handleQuick = async (qr: QuickReply) => {
    if (!current || locked) return;
    const q = current;
    const choice = (q.choices ?? []).find((c) => c.value === qr.value);
    userSay(qr.label);

    if (q.kind === "notice") return commit({ privacy_ack: true }, q.id as string);

    const id = q.id as string;
    if (id.startsWith("ftnd_q")) {
      return commit({ [id]: choice?.score ?? 0 } as Partial<ClinicalAnswers>, id);
    }
    if (id === "ftnd_opt_in"|| id === "money_opt_in"|| id === "plan_email_consent") {
      return commit({ [id]: qr.value === "yes" } as Partial<ClinicalAnswers>, id);
    }
    return commit({ [id]: qr.value } as Partial<ClinicalAnswers>, id);
  };

  const handleNumber = async (n: number) => {
    if (!current || locked) return;
    userSay(String(n));
    await commit({ [current.id]: n } as Partial<ClinicalAnswers>, current.id as string);
  };

  const handleSendText = async () => {
    if (!current || locked) return;
    const v = input.trim();
    if (!v) return;
    if (current.kind === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return;
    setInput("");
    userSay(v);
    if (current.kind === "number") {
      const n = Number(v.replace(/[^\d.]/g, ""));
      await commit({ [current.id]: Number.isFinite(n) ? n : 0 } as Partial<ClinicalAnswers>, current.id as string);
      return;
    }
    await commit({ [current.id]: v } as Partial<ClinicalAnswers>, current.id as string);
  };

  const handleMultiSubmit = async () => {
    if (!current || locked || multiSel.length === 0) return;
    const q = current;
    const labels = multiSel
      .map((v) => (q.choices ?? []).find((c) => c.value === v)?.label_ar ?? v)
      .join("، ");
    userSay(labels);
    const sel = [...multiSel];
    setMultiSel([]);
    await commit({ [q.id]: sel } as Partial<ClinicalAnswers>, q.id as string);
  };

  const last = messages[messages.length - 1];
  const showText = !locked && last?.from === "bot"&& (last.input === "text"|| last.input === "email"|| last.input === "number");
  const showNumberRow = !locked && last?.from === "bot"&& last.input === "number-row";
  const showMulti = !locked && last?.from === "bot" && !!last.multi;
  const showQuick = !locked && last?.from === "bot" && !!last.quickReplies;
  const inputType = last?.input === "email"? "email": last?.input === "number"? "number": "text";

  return (
    <div
      dir="rtl"lang="ar"className="text-right rounded-2xl border border-[#0b3a25]/15 bg-white shadow-sm flex flex-col h-[70vh] min-h-[520px] font-[IBM_Plex_Sans_Arabic,Tajawal,system-ui,sans-serif]"
    >
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-5">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              dir="rtl"className="flex justify-start"
            >
              {m.from === "bot" ? (
                <div className="flex items-start gap-2 sm:gap-3 max-w-[92%] sm:max-w-[86%] w-full">
                  <img
                    src={aqlaLogo}
                    alt="مساعد أقلع"className="h-8 w-8 shrink-0 rounded-full bg-white object-contain p-0.5 ring-1 ring-[#0b3a25]/20"
                  />
                  <div className="min-w-0 flex-1">
                    <div
                      className="inline-block rounded-2xl rounded-tr-md bg-[#0b3a25] text-white px-4 py-2.5 text-[14.5px] leading-7 whitespace-pre-wrap"style={{ unicodeBidi: "plaintext" }}
                    >
                      {m.text}
                    </div>
                    {m.plan ? (
                      <div className="mt-3">
                        <ClinicalPlanView plan={m.plan} />
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 sm:gap-3 max-w-[80%] sm:max-w-[68%] pe-6 sm:pe-10">
                  <div className="h-8 w-8 shrink-0 rounded-full bg-[#eaf3ed] grid place-content-center text-[#0b3a25] text-[11px] font-bold ring-1 ring-[#0b3a25]/15">
                    أنا
                  </div>
                  <div
                    className="rounded-2xl rounded-tr-md bg-[#f2f8f4] text-[#12241b] ring-1 ring-[#0b3a25]/10 px-4 py-2.5 text-[14.5px] leading-7 whitespace-pre-wrap"style={{ unicodeBidi: "plaintext" }}
                  >
                    {m.text}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {typing && (
          <div dir="rtl"className="flex justify-start">
            <div className="flex items-start gap-2 sm:gap-3">
              <img src={aqlaLogo} alt=""className="h-8 w-8 rounded-full bg-white object-contain p-0.5 ring-1 ring-[#0b3a25]/20" />
              <div className="rounded-2xl rounded-tr-md bg-[#0b3a25]/90 px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-bounce"style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-bounce"style={{ animationDelay: "150ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-bounce"style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {showQuick && (
          <div dir="rtl"className="flex flex-wrap gap-2 justify-start pt-1">
            {last.quickReplies!.map((qr) => (
              <button
                key={qr.value}
                onClick={() => handleQuick(qr)}
                style={{ unicodeBidi: "plaintext" }}
                className="rounded-full bg-[#0b3a25] hover:bg-[#12543a] text-white px-4 py-1.5 text-sm font-medium shadow-sm transition-colors"
              >
                {qr.label}
              </button>
            ))}
          </div>
        )}

        {showNumberRow && (
          <div dir="rtl"className="flex flex-wrap gap-2 justify-start pt-1">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => handleNumber(n)}
                className="h-9 w-9 rounded-full bg-[#0b3a25] hover:bg-[#12543a] text-white text-sm font-semibold shadow-sm transition-colors"
              >
                {n}
              </button>
            ))}
          </div>
        )}

        {showMulti && (
          <div dir="rtl"className="space-y-2 pt-1">
            <div className="flex flex-wrap gap-2 justify-start">
              {last.multi!.map((qr) => {
                const active = multiSel.includes(qr.value);
                return (
                  <button
                    key={qr.value}
                    onClick={() =>
                      setMultiSel((s) =>
                        qr.value === "none"? s.includes("none")
                            ? []
                            : ["none"]
                          : s.includes(qr.value)
                            ? s.filter((v) => v !== qr.value)
                            : [...s.filter((v) => v !== "none"), qr.value],
                      )
                    }
                    style={{ unicodeBidi: "plaintext" }}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium shadow-sm transition-colors ${
                      active
                        ? "bg-[#0b3a25] text-white ring-2 ring-[#c9a84c]": "bg-[#f2f8f4] text-[#0b3a25] ring-1 ring-[#0b3a25]/20 hover:bg-[#e6f1ea]"
                    }`}
                  >
                    {qr.label}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-start">
              <button
                onClick={handleMultiSubmit}
                disabled={multiSel.length === 0}
                className="rounded-full bg-[#0b3a25] hover:bg-[#12543a] disabled:opacity-40 text-white px-5 py-1.5 text-sm font-semibold transition-colors"
              >
                إرسال
              </button>
            </div>
          </div>
        )}

        {last?.from === "bot" && last.actions && (
          <div dir="rtl"className="pt-3 grid sm:grid-cols-2 gap-2">
            {last.actions.map((a, i) => {
              const Icon = a.icon === "print"? Printer : a.icon === "dashboard" ? LayoutDashboard : null;
              const base =
                "flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-bold shadow-md transition-colors";
              const cls =
                a.variant === "secondary"
                  ? `${base} border-2 border-[#0b3a25] text-[#0b3a25] bg-white hover:bg-[#f2f8f4]`
                  : `${base} bg-[#0b3a25] hover:bg-[#12543a] text-white`;
              return (
                <button key={i} onClick={a.onClick} className={cls}>
                  {Icon ? <Icon className="h-5 w-5" /> : null}
                  {a.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {showText && (
        <div className="border-t border-[#0b3a25]/10 p-3 flex gap-2 items-center"dir="rtl">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendText()}
            placeholder={inputType === "email"? "example@email.com": "اكتب هنا..."}
            type={inputType}
            dir={inputType === "text"? "rtl": "ltr"}
            lang="ar"className="flex-1 rounded-full bg-[#f2f8f4] ring-1 ring-[#0b3a25]/10 px-4 py-2.5 text-sm text-[#0b3a25] placeholder:text-[#66756d] outline-none focus:ring-2 focus:ring-[#0b3a25]/40 text-start"
          />
          <button
            onClick={handleSendText}
            className="h-10 w-10 shrink-0 rounded-full bg-[#0b3a25] hover:bg-[#12543a] text-white grid place-content-center transition-colors"aria-label="إرسال"
          >
            <Send className="h-4 w-4 -scale-x-100" />
          </button>
        </div>
      )}
    </div>
  );
}
