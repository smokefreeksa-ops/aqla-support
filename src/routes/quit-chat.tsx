import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Send, Printer, LayoutDashboard } from "lucide-react";
import { PrintableQuitPlan } from "@/components/PrintableQuitPlan";

export const Route = createFileRoute("/quit-chat")({
  head: () => ({
    meta: [
      { title: "مساعد أقلع الذكي — بناء خطة الإقلاع التفاعلية" },
      {
        name: "description",
        content:
          "مساعد محادثة ذكي يقودك خطوة بخطوة عبر تقييم Fagerström وبناء خطة START الشخصية للإقلاع عن التدخين.",
      },
    ],
  }),
  component: QuitChatPage,
});

type Msg = {
  from: "bot" | "user";
  text: string;
  quickReplies?: QuickReply[];
  multi?: QuickReply[];
  actions?: { label: string; onClick: () => void; variant?: "primary" | "secondary"; icon?: "print" | "dashboard" }[];
  input?: "text" | "email" | "number-row";
};
type QuickReply = { label: string; value: string; score?: number };

type Answers = {
  userName?: string;
  city?: string;
  product?: string;
  cigsPerDay?: number;
  firstDose?: number;
  hardAbstain?: number;
  morningHeavy?: number;
  readiness?: number;
  quitDate?: string;
  triggers?: string[];
  supporter?: string;
  email?: string;
  fagerstromScore?: number;
};

// Mock email sending — logs payload for both user and platform owner
function sendEmailPayload(userData: Answers) {
  // eslint-disable-next-line no-console
  console.log("[Aqla] sendEmailPayload → user:", userData.email, userData);
  // eslint-disable-next-line no-console
  console.log("[Aqla] sendEmailPayload → platform owner (admin@aqla):", userData);
}

function QuitChatPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-background font-[Tajawal,Cairo,system-ui,sans-serif] text-right">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-3 py-6 sm:py-10">
        <header className="mb-4 text-right">
          <h1 className="text-2xl font-bold tracking-tight">مساعد أقلع الذكي</h1>
          <p className="mt-1 text-sm text-foreground/70">محادثة تفاعلية لبناء خطتك الشخصية للتحرر من النيكوتين.</p>
        </header>
        <Chat />
      </main>
      <SiteFooter />
      <PrintStyles />
    </div>
  );
}

function PrintStyles() {
  return (
    <style>{`
      @media print {
        body * { visibility: hidden !important; }
        #aqla-print-area, #aqla-print-area * { visibility: visible !important; }
        #aqla-print-area { position: absolute; inset: 0; width: 100%; padding: 24px; background: white; color: black; }
      }
      #aqla-print-area { display: none; }
      @media print { #aqla-print-area { display: block; } }
    `}</style>
  );
}

function PrintableSummary({ a }: { a: Answers }) {
  const dependency =
    (a.fagerstromScore ?? 0) >= 5 ? "اعتماد مرتفع — يُنصح بدمج بدائل النيكوتين الطبية (NRT)" : "اعتماد خفيف إلى متوسط — التحكم السلوكي مناسب";
  return (
    <div id="aqla-print-area" dir="rtl" className="text-right">
      <div style={{ borderBottom: "2px solid #0c4a6e", paddingBottom: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0c4a6e", margin: 0 }}>خطة الإقلاع الشخصية — أقلع</h1>
        <p style={{ margin: "6px 0 0", color: "#475569", fontSize: 13 }}>وثيقة مُولّدة آلياً من منصة أقلع للدعم الإكلينيكي</p>
      </div>

      <section style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0c4a6e", marginBottom: 8 }}>المعلومات الأساسية</h2>
        <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
          <tbody>
            <Row k="الاسم" v={a.userName} />
            <Row k="المدينة" v={a.city} />
            <Row k="البريد الإلكتروني" v={a.email} />
            <Row k="المنتج الأساسي" v={a.product} />
          </tbody>
        </table>
      </section>

      <section style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0c4a6e", marginBottom: 8 }}>تقييم Fagerström للاعتماد على النيكوتين</h2>
        <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
          <tbody>
            <Row k="النتيجة الإجمالية (FTND)" v={`${a.fagerstromScore ?? "—"} / 8`} />
            <Row k="التفسير الإكلينيكي" v={dependency} />
            <Row k="مستوى الاستعداد للإقلاع" v={a.readiness ? `${a.readiness} / 10` : "—"} />
          </tbody>
        </table>
      </section>

      <section style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0c4a6e", marginBottom: 8 }}>خطة START</h2>
        <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
          <tbody>
            <Row k="يوم الاستقلال (تاريخ الإقلاع)" v={a.quitDate} />
            <Row k="المحفزات / الفخاخ" v={a.triggers?.join("، ")} />
            <Row k="شخص الدعم" v={a.supporter} />
          </tbody>
        </table>
      </section>

      <p style={{ marginTop: 24, fontSize: 12, color: "#64748b", borderTop: "1px solid #e2e8f0", paddingTop: 10 }}>
        هذه الوثيقة لأغراض الدعم والتثقيف الصحي ولا تُغني عن استشارة الطبيب المختص.
      </p>
    </div>
  );
}

function Row({ k, v }: { k: string; v?: string | number }) {
  return (
    <tr>
      <td style={{ padding: "6px 0", color: "#475569", width: "40%" }}>{k}</td>
      <td style={{ padding: "6px 0", fontWeight: 600 }}>{v ?? "—"}</td>
    </tr>
  );
}

function Chat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [state, setState] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [input, setInput] = useState("");
  const [multiSel, setMultiSel] = useState<string[]>([]);
  const [typing, setTyping] = useState(false);
  const [locked, setLocked] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const say = async (text: string, opts: Partial<Msg> = {}, delay = 1200) => {
    setTyping(true);
    await new Promise((r) => setTimeout(r, delay));
    setTyping(false);
    setMessages((m) => [...m, { from: "bot", text, ...opts }]);
  };

  const userSay = (text: string) => {
    setMessages((m) => {
      const cleaned = m.map((x, i) => (i === m.length - 1 ? { ...x, quickReplies: undefined, multi: undefined } : x));
      return [...cleaned, { from: "user", text }];
    });
  };

  useEffect(() => {
    (async () => {
      await say(
        "أهلاً بك في مركز أقلع الافتراضي لدعم الإقلاع. أنا مساعدك الذكي، ولست هنا لأعطيك وصفة طبية، بل لأرافقك خطوة بخطوة لبناء خطتك الشخصية للتحرر. وتقدر تبدأ بأي وقت 💚",
        {},
        600,
      );
      await say("بِسم الله نبدأ.. وش الاسم أو الكنية اللي تحب أناديك فيها؟", { input: "text" }, 1200);
      setState(1);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const advance = async (next: number, updated: Answers) => {
    setState(next);
    const name = updated.userName ?? "";
    switch (next) {
      case 2:
        await say(`حياك الله يا ${name}. من أي مدينة تكلمنا؟`, { input: "text" });
        break;
      case 3:
        await say(`فرصة سعيدة يا ${name}. عشان أقدر أساعدك صح، إيش هو المنتج الأساسي اللي تستخدمه؟`, {
          quickReplies: [
            { label: "سجائر", value: "سجائر" },
            { label: "فيب (Vape)", value: "فيب" },
            { label: "شيشة/معسل", value: "شيشة" },
            { label: "أكياس نيكوتين", value: "أكياس نيكوتين" },
            { label: "غير ذلك", value: "غير ذلك" },
          ],
        });
        break;
      case 4:
        await say("ممتاز. قبل ما نبني خطة الإقلاع، هل تحب نسوي اختبار علمي سريع (يأخذ دقيقة) عشان نعرف مستوى اعتماد جسدك الفسيولوجي على النيكوتين؟", {
          quickReplies: [
            { label: "نعم، ابدأ الاختبار", value: "yes" },
            { label: "لا، تخطى الاختبار", value: "no" },
          ],
        });
        break;
      case 5:
        await say("ممتاز. كم تستهلك في اليوم الواحد تقريباً؟", {
          quickReplies: [
            { label: "10 أو أقل", value: "10 أو أقل", score: 0 },
            { label: "11 إلى 20", value: "11 إلى 20", score: 1 },
            { label: "21 إلى 30", value: "21 إلى 30", score: 2 },
            { label: "31 فأكثر", value: "31 فأكثر", score: 3 },
          ],
        });
        break;
      case 6:
        await say("متى تأخذ أول جرعة نيكوتين بعد ما تصحى من النوم؟", {
          quickReplies: [
            { label: "خلال 5 دقائق", value: "خلال 5 دقائق", score: 3 },
            { label: "خلال 6-30 دقيقة", value: "خلال 6-30 دقيقة", score: 2 },
            { label: "خلال 31-60 دقيقة", value: "خلال 31-60 دقيقة", score: 1 },
            { label: "بعد أكثر من ساعة", value: "بعد أكثر من ساعة", score: 0 },
          ],
        });
        break;
      case 7:
        await say("هل تجد صعوبة في الامتناع عن التدخين في الأماكن الممنوعة (مثل المستشفيات أو الطيارات)؟", {
          quickReplies: [
            { label: "نعم", value: "نعم", score: 1 },
            { label: "لا", value: "لا", score: 0 },
          ],
        });
        break;
      case 8:
        await say("هل تدخن في الساعات الأولى من الصباح أكثر من باقي اليوم؟", {
          quickReplies: [
            { label: "نعم", value: "نعم", score: 1 },
            { label: "لا", value: "لا", score: 0 },
          ],
        });
        break;
      case 9: {
        const score =
          (updated.cigsPerDay ?? 0) +
          (updated.firstDose ?? 0) +
          (updated.hardAbstain ?? 0) +
          (updated.morningHeavy ?? 0);
        updated.fagerstromScore = score;
        setAnswers({ ...updated });
        const max = 8;
        await say(`حللت إجاباتك يا ${name}.. نتيجتك هي ${score} من ${max} في مقياس الاعتماد.`);
        if (score >= 5) {
          await say(
            "هذا يعني أن اعتماد جسدك الكيميائي مرتفع. لا تقلق، هذا يفسر ليش كانت محاولاتك السابقة صعبة. جسدك يحتاج دعم، وأنصحك جداً تدمج (بدائل النيكوتين الطبية NRT) مثل اللصقات مع خطة أقلع عشان نخفف أعراض الانسحاب وتقدر تركز.",
          );
        } else {
          await say(
            "هذا يعني أن اعتماد جسدك الكيميائي خفيف إلى متوسط. أخبار ممتازة! تقدر تسيطر على الوضع تماماً باستخدام استراتيجيات التحكم السلوكي والتنفس اللي بنوفرها لك في المنصة.",
          );
        }
        advance(10, updated);
        break;
      }
      case 10:
        await say("الآن، على مقياس من 1 إلى 10، كم أنت مستعد من داخلك لاتخاذ قرار الإقلاع اليوم؟", {
          input: "number-row",
        });
        break;
      case 11:
        await say(
          'رائع! روحك العالية هي نصف النجاح. خلنا نعتمد خطة START العالمية. الخطوة الأولى: متى تبي يكون "يوم استقلالك" (تاريخ الإقلاع)؟',
          {
            quickReplies: [
              { label: "اليوم", value: "اليوم" },
              { label: "غداً", value: "غداً" },
              { label: "بعد أسبوع", value: "بعد أسبوع" },
            ],
          },
        );
        break;
      case 12:
        await say("تم التحديد. الخطوة الثانية: وش أكثر المواقف اللي تعتبر (فخ) وترجعك للتدخين عشان نبرمجها في الرادار؟ (يمكنك اختيار أكثر من خيار)", {
          multi: [
            { label: "مع القهوة", value: "مع القهوة" },
            { label: "بعد الأكل", value: "بعد الأكل" },
            { label: "توتر العمل", value: "توتر العمل" },
            { label: "السهر", value: "السهر" },
            { label: "مجالسة المدخنين", value: "مجالسة المدخنين" },
          ],
        });
        break;
      case 13:
        await say('الخطوة الأخيرة: الإقلاع السري صعب. من هو الشخص اللي بتشاركه قرارك اليوم عشان يدعمك؟ (اكتب اسمه الأول فقط، أو اكتب "لا أحد")', {
          input: "text",
        });
        break;
      case 135:
        await say(
          "عشان نرسل لك نسخة من خطتك المخصصة (PDF)، ولإدارة أقلع لمتابعتك، الرجاء كتابة بريدك الإلكتروني:",
          { input: "email" },
        );
        break;
      case 14: {
        await say("جاري بناء خطتك الإكلينيكية وإرسالها للبريد...", {}, 800);
        await new Promise((r) => setTimeout(r, 3000));
        sendEmailPayload(updated);
        toast.success("تم إرسال الخطة للبريد بنجاح!");
        await say(
          `ألف مبروك يا ${name}! خطتك جاهزة وتم إرسال نسخة إلى بريدك (${updated.email}) وإلى إدارة أقلع. لقد تم تفعيل لوحة القيادة الخاصة بك.`,
          {
            actions: [
              {
                label: "انتقل إلى لوحة القيادة",
                variant: "primary",
                icon: "dashboard",
                onClick: () => {
                  try {
                    localStorage.setItem("aqla.quitChat.answers", JSON.stringify(updated));
                  } catch {}
                  navigate({ to: "/dtx" });
                },
              },
              {
                label: "تحميل الخطة / طباعة (PDF)",
                variant: "secondary",
                icon: "print",
                onClick: () => window.print(),
              },
            ],
          },
        );
        setLocked(true);
        break;
      }
      case 99:
        await say(
          "أقدر صراحتك. الإقلاع قرار سيادي يحتاج قناعة. خذ وقتك في تصفح قسم (التوعية) في المنصة متى ما حسيت إنك جاهز، أنا هنا.",
        );
        setLocked(true);
        break;
    }
  };

  const handleQuick = (qr: QuickReply) => {
    if (locked) return;
    userSay(qr.label);
    const updated: Answers = { ...answers };
    switch (state) {
      case 3:
        updated.product = qr.value;
        setAnswers(updated);
        advance(4, updated);
        break;
      case 4:
        if (qr.value === "no") advance(10, updated);
        else advance(5, updated);
        break;
      case 5:
        updated.cigsPerDay = qr.score;
        setAnswers(updated);
        advance(6, updated);
        break;
      case 6:
        updated.firstDose = qr.score;
        setAnswers(updated);
        advance(7, updated);
        break;
      case 7:
        updated.hardAbstain = qr.score;
        setAnswers(updated);
        advance(8, updated);
        break;
      case 8:
        updated.morningHeavy = qr.score;
        setAnswers(updated);
        advance(9, updated);
        break;
      case 11:
        updated.quitDate = qr.value;
        setAnswers(updated);
        advance(12, updated);
        break;
    }
  };

  const handleNumber = (n: number) => {
    if (locked) return;
    userSay(String(n));
    const updated: Answers = { ...answers, readiness: n };
    setAnswers(updated);
    if (n < 5) advance(99, updated);
    else advance(11, updated);
  };

  const handleSendText = () => {
    if (locked) return;
    const v = input.trim();
    if (!v) return;

    if (state === 135) {
      // basic email validation
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (!ok) {
        toast.error("يرجى إدخال بريد إلكتروني صحيح");
        return;
      }
    }

    userSay(v);
    setInput("");
    const updated: Answers = { ...answers };
    switch (state) {
      case 1:
        updated.userName = v;
        setAnswers(updated);
        advance(2, updated);
        break;
      case 2:
        updated.city = v;
        setAnswers(updated);
        advance(3, updated);
        break;
      case 13:
        updated.supporter = v;
        setAnswers(updated);
        advance(135, updated);
        break;
      case 135:
        updated.email = v;
        setAnswers(updated);
        advance(14, updated);
        break;
    }
  };

  const handleMultiSubmit = () => {
    if (locked || multiSel.length === 0) return;
    userSay(multiSel.join("، "));
    const updated: Answers = { ...answers, triggers: multiSel };
    setAnswers(updated);
    setMultiSel([]);
    advance(13, updated);
  };

  const last = messages[messages.length - 1];
  const showText = !locked && last?.from === "bot" && (last.input === "text" || last.input === "email");
  const showNumberRow = !locked && last?.from === "bot" && last.input === "number-row";
  const showMulti = !locked && last?.from === "bot" && !!last.multi;
  const showQuick = !locked && last?.from === "bot" && !!last.quickReplies;
  const inputType = last?.input === "email" ? "email" : "text";

  return (
    <>
      <div
        dir="rtl"
        className="text-right rounded-2xl border border-border bg-card shadow-sm flex flex-col h-[70vh] min-h-[520px]"
      >
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex ${m.from === "bot" ? "justify-end" : "justify-start"}`}
              >
                {m.from === "bot" ? (
                  <div className="flex items-end gap-2 max-w-[85%] flex-row-reverse">
                    <div className="h-8 w-8 rounded-full bg-blue-900 grid place-content-center text-white text-xs font-bold shrink-0">
                      أ
                    </div>
                    <div className="rounded-2xl rounded-tr-sm bg-blue-900 text-white px-4 py-2.5 text-[14px] leading-7 whitespace-pre-wrap text-right">
                      {m.text}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-end gap-2 max-w-[85%]">
                    <div className="h-8 w-8 rounded-full bg-slate-300 grid place-content-center text-slate-700 text-xs font-bold shrink-0">
                      أنا
                    </div>
                    <div className="rounded-2xl rounded-tl-sm bg-muted text-foreground px-4 py-2.5 text-[14px] leading-7 text-right">
                      {m.text}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {typing && (
            <div className="flex justify-end">
              <div className="flex items-end gap-2 flex-row-reverse">
                <div className="h-8 w-8 rounded-full bg-blue-900 grid place-content-center text-white text-xs font-bold">أ</div>
                <div className="rounded-2xl bg-blue-900/80 px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {showQuick && (
            <div className="flex flex-wrap gap-2 justify-end pt-1">
              {last.quickReplies!.map((qr) => (
                <button
                  key={qr.value}
                  onClick={() => handleQuick(qr)}
                  className="rounded-full bg-blue-900 hover:bg-blue-700 text-white px-4 py-1.5 text-sm font-medium shadow-sm transition-colors"
                >
                  {qr.label}
                </button>
              ))}
            </div>
          )}

          {showNumberRow && (
            <div className="flex flex-wrap gap-2 justify-end pt-1">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => handleNumber(n)}
                  className="h-9 w-9 rounded-full bg-blue-900 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-colors"
                >
                  {n}
                </button>
              ))}
            </div>
          )}

          {showMulti && (
            <div className="space-y-2 pt-1">
              <div className="flex flex-wrap gap-2 justify-end">
                {last.multi!.map((qr) => {
                  const active = multiSel.includes(qr.value);
                  return (
                    <button
                      key={qr.value}
                      onClick={() =>
                        setMultiSel((s) => (s.includes(qr.value) ? s.filter((v) => v !== qr.value) : [...s, qr.value]))
                      }
                      className={`rounded-full px-4 py-1.5 text-sm font-medium shadow-sm transition-colors ${
                        active
                          ? "bg-blue-500 hover:bg-blue-400 text-white ring-2 ring-blue-300"
                          : "bg-blue-900 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {qr.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleMultiSubmit}
                  disabled={multiSel.length === 0}
                  className="rounded-full bg-blue-500 hover:bg-blue-400 disabled:opacity-40 text-white px-5 py-1.5 text-sm font-semibold transition-colors"
                >
                  إرسال
                </button>
              </div>
            </div>
          )}

          {last?.from === "bot" && last.actions && (
            <div className="pt-3 grid sm:grid-cols-2 gap-2">
              {last.actions.map((a, i) => {
                const Icon = a.icon === "print" ? Printer : a.icon === "dashboard" ? LayoutDashboard : null;
                const base = "flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-bold shadow-md transition-colors";
                const cls =
                  a.variant === "secondary"
                    ? `${base} border-2 border-blue-900 text-blue-900 bg-white hover:bg-blue-50`
                    : `${base} bg-blue-900 hover:bg-blue-800 text-white`;
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
          <div className="border-t border-border p-3 flex gap-2 items-center" dir="rtl">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendText()}
              placeholder={inputType === "email" ? "example@email.com" : "اكتب هنا..."}
              type={inputType}
              dir={inputType === "email" ? "ltr" : "rtl"}
              className="flex-1 rounded-full bg-muted px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/40 text-right"
            />
            <button
              onClick={handleSendText}
              className="h-10 w-10 rounded-full bg-blue-900 hover:bg-blue-700 text-white grid place-content-center transition-colors"
              aria-label="إرسال"
            >
              <Send className="h-4 w-4 -scale-x-100" />
            </button>
          </div>
        )}
      </div>

      <PrintableSummary a={answers} />
    </>
  );
}
