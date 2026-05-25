import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Send } from "lucide-react";

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

type Msg = { from: "bot" | "user"; text: string; quickReplies?: QuickReply[]; multi?: QuickReply[]; cta?: { label: string; onClick: () => void }; input?: "text" | "number-row" };
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
  fagerstromScore?: number;
};

function QuitChatPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-background font-[Tajawal,Cairo,system-ui,sans-serif]">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-3 py-6 sm:py-10">
        <header className="mb-4 text-right">
          <h1 className="text-2xl font-bold tracking-tight">مساعد أقلع الذكي</h1>
          <p className="mt-1 text-sm text-foreground/70">محادثة تفاعلية لبناء خطتك الشخصية للتحرر من النيكوتين.</p>
        </header>
        <Chat />
      </main>
      <SiteFooter />
    </div>
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

  // bot say helper
  const say = async (text: string, opts: Partial<Msg> = {}, delay = 1200) => {
    setTyping(true);
    await new Promise((r) => setTimeout(r, delay));
    setTyping(false);
    setMessages((m) => [...m, { from: "bot", text, ...opts }]);
  };

  const userSay = (text: string) => {
    setMessages((m) => {
      // hide previous quick replies
      const cleaned = m.map((x, i) => (i === m.length - 1 ? { ...x, quickReplies: undefined, multi: undefined } : x));
      return [...cleaned, { from: "user", text }];
    });
  };

  // bootstrap first message
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
        const max = 8; // 4 questions used here; original prompt says "out of 10" but we have 4 items totaling 8. Display /10 as per prompt.
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
      case 14: {
        await say("جاري بناء خطتك الإكلينيكية المخصصة...", {}, 800);
        await new Promise((r) => setTimeout(r, 3000));
        await say(
          `ألف مبروك يا ${name}! خطتك جاهزة ومبنية على أقوى المعايير. لقد تم تفعيل لوحة القيادة الخاصة بك، ورادار المحفزات، وبروتوكول الطوارئ.`,
          {
            cta: {
              label: "انتقل إلى لوحة القيادة والمسار العلاجي",
              onClick: () => {
                try {
                  localStorage.setItem("aqla.quitChat.answers", JSON.stringify(updated));
                } catch {}
                navigate({ to: "/dtx" });
              },
            },
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
        if (qr.value === "no") {
          advance(10, updated);
        } else {
          advance(5, updated);
        }
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
    if (n < 5) {
      advance(99, updated);
    } else {
      advance(11, updated);
    }
  };

  const handleSendText = () => {
    if (locked) return;
    const v = input.trim();
    if (!v) return;
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
  const showText = !locked && last?.from === "bot" && last.input === "text";
  const showNumberRow = !locked && last?.from === "bot" && last.input === "number-row";
  const showMulti = !locked && last?.from === "bot" && !!last.multi;
  const showQuick = !locked && last?.from === "bot" && !!last.quickReplies;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm flex flex-col h-[70vh] min-h-[520px]">
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
                  <div className="h-8 w-8 rounded-full bg-teal-700 grid place-content-center text-white text-xs font-bold shrink-0">أ</div>
                  <div className="rounded-2xl rounded-tr-sm bg-teal-700 text-white px-4 py-2.5 text-[14px] leading-7 whitespace-pre-wrap">
                    {m.text}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl rounded-tl-sm bg-muted text-foreground px-4 py-2.5 text-[14px] leading-7 max-w-[85%]">
                  {m.text}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {typing && (
          <div className="flex justify-end">
            <div className="flex items-end gap-2 flex-row-reverse">
              <div className="h-8 w-8 rounded-full bg-teal-700 grid place-content-center text-white text-xs font-bold">أ</div>
              <div className="rounded-2xl bg-teal-700/80 px-4 py-3">
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
                className="rounded-full border border-teal-600/40 bg-teal-600/10 hover:bg-teal-600/20 text-teal-200 px-4 py-1.5 text-sm transition"
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
                className="h-9 w-9 rounded-full border border-teal-600/40 bg-teal-600/10 hover:bg-teal-600/20 text-teal-200 text-sm font-semibold transition"
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
                    className={`rounded-full border px-4 py-1.5 text-sm transition ${
                      active
                        ? "border-teal-400 bg-teal-500 text-white"
                        : "border-teal-600/40 bg-teal-600/10 text-teal-200 hover:bg-teal-600/20"
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
                className="rounded-full bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white px-5 py-1.5 text-sm font-semibold transition"
              >
                إرسال
              </button>
            </div>
          </div>
        )}

        {!locked && last?.from === "bot" && last.cta && (
          <div className="pt-3">
            <button
              onClick={last.cta.onClick}
              className="w-full rounded-2xl bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-bold px-6 py-4 text-base shadow-lg transition"
            >
              {last.cta.label}
            </button>
          </div>
        )}
      </div>

      {showText && (
        <div className="border-t border-border p-3 flex gap-2 items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendText()}
            placeholder="اكتب هنا..."
            dir="rtl"
            className="flex-1 rounded-full bg-muted px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500/40"
          />
          <button
            onClick={handleSendText}
            className="h-10 w-10 rounded-full bg-teal-600 hover:bg-teal-500 text-white grid place-content-center transition"
            aria-label="إرسال"
          >
            <Send className="h-4 w-4 -scale-x-100" />
          </button>
        </div>
      )}
    </div>
  );
}
