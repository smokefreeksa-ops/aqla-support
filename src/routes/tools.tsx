import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { recordCityChallengeEvent } from "@/lib/city-challenge.functions";
import { getAnonSessionId } from "@/lib/analytics";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useLang, useLangState, LangContext } from "@/lib/i18n";
import { trackEvent } from "@/lib/track-event";
import { VisitTracker } from "@/components/VisitTracker";
import { SocialLinks } from "@/components/SocialLinks";
import { ShareResult } from "@/components/ShareResult";
import {
  Calculator, Gauge, Wind, Clock, MapPin, HeartHandshake, Sparkles,
  ArrowRight, Languages, Download, Copy, MessageCircle, Twitter,
} from "lucide-react";
import aqlaLogo from "@/assets/aqla-logo.png";

export const Route = createFileRoute("/tools")({
  head: () => ({
    meta: [
      { title: "Aqla Tools — أدوات أقلع التفاعلية" },
      { name: "description", content: "Interactive awareness tools from Aqla: smoking cost calculator, nicotine dependence check, breath awareness challenge, quit timeline, trigger map, quit pledge, and readiness meter." },
      { property: "og:title", content: "Aqla Tools — أدوات أقلع" },
      { property: "og:description", content: "Free interactive awareness tools to understand smoking and nicotine, and start your first step with Aqla." },
    ],
  }),
  component: ToolsPage,
});

function ToolsPage() {
  const ctx = useLangState();
  return (
    <LangContext.Provider value={ctx}>
      <Inner />
    </LangContext.Provider>
  );
}

const CATEGORIES = [
  { v: "money",      ar: "المال",       en: "Money" },
  { v: "dependence", ar: "الاعتماد",    en: "Dependence" },
  { v: "breathing",  ar: "التنفس",      en: "Breathing" },
  { v: "triggers",   ar: "المحفزات",    en: "Triggers" },
  { v: "readiness",  ar: "الاستعداد",   en: "Readiness" },
  { v: "share",      ar: "المشاركة",    en: "Share" },
] as const;

function Inner() {
  const { lang, setLang, dir } = useLang();
  const isAr = lang === "ar";
  const t = (ar: string, en: string) => (isAr ? ar : en);
  const [tab, setTab] = useState<string>("all");

  useEffect(() => { trackEvent("tools_page_viewed"); }, []);

  return (
    <div dir={dir} className="min-h-screen bg-background">
      <header className="border-b bg-card/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-3">
            <img src={aqlaLogo} alt="Aqla logo" className="h-[38px] w-auto object-contain sm:h-12" />
            <div className="leading-tight">
              <div className="font-semibold tracking-tight">Aqla — أقلع</div>
              <div className="text-[11px] text-muted-foreground">{t("أدوات أقلع", "Aqla Tools")}</div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setLang(isAr ? "en" : "ar")} className="gap-1.5">
              <Languages className="h-4 w-4" />
              {isAr ? "English" : "العربية"}
            </Button>
            <Link to="/"><Button variant="ghost" size="sm">{t("الرئيسية", "Home")}</Button></Link>
            <Link to="/assessment"><Button size="sm" className="quit-gradient border-0 text-white">{t("ابدأ التقييم", "Start assessment")}</Button></Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <section className="text-center">
          <span className="inline-block rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
            {t("أدوات توعوية تفاعلية", "Interactive awareness tools")}
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {t("جرّب أدوات أقلع التفاعلية", "Try Aqla Interactive Tools")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground sm:text-lg">
            {t(
              "أدوات بسيطة وممتعة تساعدك على فهم التدخين والنيكوتين بطريقة عملية، وتشجعك على بدء الخطوة الأولى أو مساعدة غيرك.",
              "Simple, engaging tools to help you understand smoking and nicotine, take your first step, or help someone else begin."
            )}
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-xs text-muted-foreground/80">
            {t(
              "هذه الأدوات للتوعية والتأمل الذاتي فقط، وليست تشخيصًا طبيًا ولا تغني عن مراجعة المختص.",
              "These tools are for awareness and self-reflection only. They are not a medical diagnosis and do not replace clinician review."
            )}
          </p>
        </section>

        <Tabs value={tab} onValueChange={setTab} className="mt-8">
          <TabsList className="mx-auto flex w-full max-w-3xl flex-wrap justify-center gap-1 bg-muted/50">
            <TabsTrigger value="all">{t("الكل", "All")}</TabsTrigger>
            {CATEGORIES.map((c) => (
              <TabsTrigger key={c.v} value={c.v}>{isAr ? c.ar : c.en}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={tab} forceMount>
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {(tab === "all" || tab === "money")      && <CostCalculator isAr={isAr} />}
              {(tab === "all" || tab === "dependence") && <DependenceCheck isAr={isAr} />}
              {(tab === "all" || tab === "breathing")  && <BreathChallenge isAr={isAr} />}
              {(tab === "all" || tab === "share")      && <QuitTimeline isAr={isAr} />}
              {(tab === "all" || tab === "triggers")   && <TriggerMap isAr={isAr} />}
              {(tab === "all" || tab === "share")      && <PledgeCard isAr={isAr} />}
              {(tab === "all" || tab === "readiness")  && <ReadinessMeter isAr={isAr} />}
            </div>
          </TabsContent>
        </Tabs>

        <Card className="mt-12 rounded-2xl border-l-4 border-l-secondary p-4 card-gradient">
          <p className="text-sm text-muted-foreground">
            {t(
              "تنبيه: لا تشارك معلومات صحية خاصة إذا لم تكن مرتاحًا لذلك.",
              "Note: Do not share private health information unless you are comfortable doing so."
            )}
          </p>
        </Card>

        <VisitTracker path="/tools" />
      </main>

      <footer className="mx-auto max-w-6xl px-4 py-8 text-center text-xs text-muted-foreground">
        <SocialLinks />
        <p className="mt-3">© Aqla — {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

/* ---------- Shared helpers ---------- */

function ShareRow({ text, isAr, onShare }: { text: string; isAr: boolean; onShare?: (channel: string) => void }) {
  const enc = encodeURIComponent(text);
  const wa = `https://wa.me/?text=${enc}`;
  const tw = `https://x.com/intent/tweet?text=${enc}`;
  const t = (ar: string, en: string) => (isAr ? ar : en);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      trackEvent("share_text_copied");
      onShare?.("copy");
    } catch { /* ignore */ }
  }
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <a href={wa} target="_blank" rel="noopener noreferrer"
         onClick={() => { trackEvent("share_whatsapp_clicked"); onShare?.("whatsapp"); }}>
        <Button size="sm" variant="outline" className="gap-1.5">
          <MessageCircle className="h-4 w-4" />{t("واتساب", "WhatsApp")}
        </Button>
      </a>
      <a href={tw} target="_blank" rel="noopener noreferrer"
         onClick={() => { trackEvent("share_x_clicked"); onShare?.("x"); }}>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Twitter className="h-4 w-4" />X
        </Button>
      </a>
      <Button size="sm" variant="outline" className="gap-1.5" onClick={copy}>
        <Copy className="h-4 w-4" />{t("نسخ النص", "Copy text")}
      </Button>
    </div>
  );
}

function StartAssessment({ isAr, from, label }: { isAr: boolean; from: string; label?: string }) {
  const txt = label ?? (isAr ? "ابدأ تقييم أقلع" : "Start Aqla assessment");
  return (
    <Link to="/assessment" className="mt-3 block"
          onClick={() => trackEvent("start_assessment_clicked_from_tool", from)}>
      <Button className="w-full quit-gradient border-0 text-white hover:opacity-95">
        {txt}<ArrowRight className="h-4 w-4 rtl:rotate-180" />
      </Button>
    </Link>
  );
}

async function saveAsImage(node: HTMLElement, filename: string) {
  try {
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(node, { backgroundColor: null, scale: 2 });
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch { /* ignore */ }
}

function ToolHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-11 w-11 place-items-center rounded-2xl quit-gradient text-white shadow-md">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
  );
}

/* ---------- 1. Cost Calculator ---------- */
function CostCalculator({ isAr }: { isAr: boolean }) {
  const t = (ar: string, en: string) => (isAr ? ar : en);
  const [cpd, setCpd] = useState("");
  const [perPack, setPerPack] = useState("20");
  const [price, setPrice] = useState("");
  const [years, setYears] = useState("");
  const [out, setOut] = useState<null | { daily:number; monthly:number; yearly:number; five:number; ten:number; past:number|null }>(null);

  function calc() {
    const c = parseFloat(cpd) || 0;
    const pk = Math.max(1, parseFloat(perPack) || 20);
    const p = parseFloat(price) || 0;
    const y = parseFloat(years);
    if (c <= 0 || p <= 0) { setOut(null); return; }
    const daily = (c / pk) * p;
    const yearly = daily * 365;
    setOut({
      daily, monthly: daily * 30, yearly,
      five: yearly * 5, ten: yearly * 10,
      past: !isNaN(y) && y > 0 ? yearly * y : null,
    });
    trackEvent("cost_calculator_used");
  }
  const fmt = (n: number) =>
    new Intl.NumberFormat(isAr ? "ar-SA" : "en-US", { maximumFractionDigits: 0 }).format(Math.round(n));
  const sar = t("ر.س", "SAR");
  const yearlyFmt = out
    ? new Intl.NumberFormat(isAr ? "ar-SA" : "en-US", { maximumFractionDigits: 0 }).format(Math.round(out.yearly))
    : "";
  const messageAr = out
    ? `اكتشفت أن التدخين قد يكلّفني حوالي ${yearlyFmt} ريال في السنة.\nتخيل لو هذا المبلغ راح لشيء يفيد صحتك أو مستقبلك.\n\nجرّب الحاسبة وشوف رقمك:`
    : "";
  const messageEn = out
    ? `I found out smoking may cost me about ${yearlyFmt} SAR per year.\nImagine if that money went toward your health or future.\n\nTry the calculator and see your number:`
    : "";

  return (
    <Card className="rounded-3xl border-0 p-6 shadow-elegant card-gradient">
      <ToolHeader icon={<Calculator className="h-5 w-5" />} title={t("حاسبة تكلفة التدخين", "Smoking Cost Calculator")} />
      <div className="mt-5 space-y-3">
        <div>
          <Label className="text-xs">{t("عدد السجائر يوميًا", "Cigarettes per day")}</Label>
          <Input inputMode="numeric" value={cpd} onChange={(e) => setCpd(e.target.value)} placeholder="20" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">{t("السجائر في العلبة", "Cigarettes per pack")}</Label>
            <Input inputMode="numeric" value={perPack} onChange={(e) => setPerPack(e.target.value)} placeholder="20" />
          </div>
          <div>
            <Label className="text-xs">{t("سعر العلبة", "Pack price")} ({sar})</Label>
            <Input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="27" />
          </div>
        </div>
        <div>
          <Label className="text-xs">{t("سنوات التدخين (اختياري)", "Years smoked (optional)")}</Label>
          <Input inputMode="numeric" value={years} onChange={(e) => setYears(e.target.value)} placeholder="—" />
        </div>
      </div>
      <Button onClick={calc} className="mt-4 w-full quit-gradient border-0 text-white hover:opacity-95">
        {t("احسب التكلفة", "Calculate cost")}
      </Button>

      {out && (
        <div className="mt-4 space-y-1.5 rounded-2xl bg-primary-soft p-4 text-sm">
          <Row label={t("يوميًا", "Daily")} value={`${fmt(out.daily)} ${sar}`} />
          <Row label={t("شهريًا", "Monthly")} value={`${fmt(out.monthly)} ${sar}`} />
          <Row label={t("سنويًا", "Yearly")} value={`${fmt(out.yearly)} ${sar}`} bold />
          <Row label={t("خلال 5 سنوات", "Over 5 years")} value={`${fmt(out.five)} ${sar}`} />
          <Row label={t("خلال 10 سنوات", "Over 10 years")} value={`${fmt(out.ten)} ${sar}`} />
          {out.past !== null && <Row label={t("خلال سنوات التدخين السابقة", "Across years smoked")} value={`${fmt(out.past)} ${sar}`} />}
          <p className="pt-2 text-xs leading-6 text-foreground/70">
            {t("قد يكون التدخين مكلفًا أكثر مما تتوقع. معرفة الرقم قد تكون أول خطوة للتغيير.",
               "Smoking may cost more than you think. Seeing the number can be the first step toward change.")}
          </p>
          <ShareResult
            shareType="cost"
            isAr={isAr}
            messageAr={messageAr}
            messageEn={messageEn}
            targetPath="/tools"
            titleAr="حاسبة تكلفة التدخين"
            titleEn="Smoking Cost Calculator"
            payload={{ yearly_cost_sar: Math.round(out.yearly) }}
          />
          <StartAssessment isAr={isAr} from="cost_calculator" />
        </div>
      )}
    </Card>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "font-semibold text-primary" : ""}`}>
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

/* ---------- 2. Dependence Check ---------- */
function DependenceCheck({ isAr }: { isAr: boolean }) {
  const t = (ar: string, en: string) => (isAr ? ar : en);
  const qs = [
    t("هل تستخدم النيكوتين بعد الاستيقاظ بفترة قصيرة؟", "Do you use nicotine soon after waking?"),
    t("هل تشعر برغبة قوية أو ملحّة لاستخدام النيكوتين؟", "Do you feel strong cravings?"),
    t("هل حاولت التوقف من قبل ولم تستطع؟", "Have you tried to stop but could not?"),
    t("هل تستخدم أكثر من منتج نيكوتين؟", "Do you use more than one nicotine product?"),
    t("هل تشعر بتوتر أو عصبية أو قلق عندما لا تستطيع استخدام النيكوتين؟",
      "Do you feel irritable, restless, or anxious when you cannot use nicotine?"),
  ];
  const [a, setA] = useState<(boolean|null)[]>(Array(qs.length).fill(null));
  const [done, setDone] = useState(false);
  const score = a.filter(Boolean).length;
  const level =
    score <= 1 ? { ar: "اهتمام منخفض", en: "Low concern", cls: "text-primary" } :
    score <= 3 ? { ar: "اهتمام متوسط", en: "Moderate concern", cls: "text-amber-600" } :
                 { ar: "اهتمام مرتفع", en: "High concern", cls: "text-rose-600" };
  const levelLabel = isAr ? level.ar : level.en;
  const messageAr =
    "اكتشفت اليوم أن علاقتي بالنيكوتين أقوى مما توقعت.\nأول خطوة للتغيير هي الفهم.\n\nجرّب فحص أقلع السريع واعرف درجتك خلال دقيقة:";
  const messageEn =
    "Today I realized my relationship with nicotine may be stronger than I thought.\nThe first step toward change is understanding.\n\nTry Aqla's quick check and see yours in a minute:";

  return (
    <Card className="rounded-3xl border-0 p-6 shadow-elegant card-gradient">
      <ToolHeader icon={<Gauge className="h-5 w-5" />} title={t("اعرف مستوى اعتمادك خلال دقيقة", "Know Your Dependence Level in 1 Minute")} />
      {!done ? (
        <div className="mt-5 space-y-3">
          {qs.map((q, i) => (
            <div key={i} className="rounded-xl border bg-card/50 p-3">
              <p className="text-sm">{q}</p>
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant={a[i] === true ? "default" : "outline"}
                        onClick={() => { const n=[...a]; n[i]=true; setA(n); }}>
                  {t("نعم", "Yes")}
                </Button>
                <Button size="sm" variant={a[i] === false ? "default" : "outline"}
                        onClick={() => { const n=[...a]; n[i]=false; setA(n); }}>
                  {t("لا", "No")}
                </Button>
              </div>
            </div>
          ))}
          <Button onClick={() => { setDone(true); trackEvent("quick_dependence_check_used"); }}
                  disabled={a.some(x => x === null)}
                  className="w-full quit-gradient border-0 text-white hover:opacity-95">
            {t("اعرض النتيجة", "Show result")}
          </Button>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl bg-primary-soft p-4 text-sm">
          <p className="text-xs text-muted-foreground">{t("النتيجة", "Result")}</p>
          <p className={`mt-1 text-xl font-semibold ${level.cls}`}>{levelLabel}</p>
          <p className="mt-3 text-xs leading-6 text-foreground/70">
            {t("هذه نتيجة توعوية سريعة وليست تشخيصًا. للحصول على مسار أدق، أكمل تقييم أقلع الكامل.",
               "This is a quick educational check, not a diagnosis. For a more accurate pathway, complete the full Aqla assessment.")}
          </p>
          <ShareResult
            shareType="quick-check"
            isAr={isAr}
            messageAr={messageAr}
            messageEn={messageEn}
            targetPath="/tools"
            titleAr="فحص النيكوتين السريع"
            titleEn="Quick Nicotine Check"
            payload={{ level: isAr ? level.ar : level.en }}
          />
          <StartAssessment isAr={isAr} from="dependence_check" label={t("أكمل التقييم الكامل", "Complete full assessment")} />
        </div>
      )}
    </Card>
  );
}

/* ---------- 3. Breath Awareness Challenge ---------- */
function BreathChallenge({ isAr }: { isAr: boolean }) {
  const t = (ar: string, en: string) => (isAr ? ar : en);
  const [acknowledged, setAcknowledged] = useState(false);
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [final, setFinal] = useState<number | null>(null);
  const [autoStopped, setAutoStopped] = useState(false);
  const intRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const MAX = 60;

  useEffect(() => () => { if (intRef.current) clearInterval(intRef.current); }, []);

  function start() {
    setFinal(null); setAutoStopped(false); setSeconds(0); setRunning(true);
    trackEvent("breath_challenge_started");
    intRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s + 1 >= MAX) {
          if (intRef.current) clearInterval(intRef.current);
          setRunning(false); setFinal(MAX); setAutoStopped(true);
          trackEvent("breath_challenge_completed");
          return MAX;
        }
        return s + 1;
      });
    }, 1000);
  }
  function stop() {
    if (intRef.current) clearInterval(intRef.current);
    setRunning(false); setFinal(seconds);
    trackEvent("breath_challenge_completed");
  }

  const band = (s: number) =>
    s <= 10 ? { ar: "بداية بسيطة — ركّز على التنفس الهادئ ولا تضغط على نفسك.", en: "A gentle start — focus on calm breathing and do not push yourself.", cls: "text-sky-700" } :
    s <= 25 ? { ar: "وعي جيد بالتنفس — يمكنك تجربة تمارين تنفس هادئة.", en: "Good breath awareness — you can try calm breathing exercises.", cls: "text-emerald-700" } :
    s <= 45 ? { ar: "تحكم جيد اليوم — تذكر أن هذا ليس اختبارًا طبيًا.", en: "Good control today — remember this is not a medical test.", cls: "text-teal-700" } :
              { ar: "تحكم عالٍ اليوم — لا تعتمد على هذا كمقياس لصحة الرئة.", en: "Strong control today — do not use this as a measure of lung health.", cls: "text-teal-800" };

  const messageAr = final !== null
    ? `جربت تحدي الوعي بالتنفس في أقلع ووصلت إلى ${final} ثوانٍ.\nمو اختبارًا طبيًا، لكنه تذكير بسيط أن ننتبه لتنفسنا وصحتنا.\n\nجرّبه أنت الآن:`
    : "";
  const messageEn = final !== null
    ? `I tried Aqla's Breath Awareness Challenge and reached ${final} seconds.\nIt's not a medical test, just a gentle reminder to notice our breathing and health.\n\nTry it yourself:`
    : "";

  return (
    <Card className="rounded-3xl border-0 p-6 shadow-elegant card-gradient">
      <ToolHeader icon={<Wind className="h-5 w-5" />} title={t("تحدي الوعي بالتنفس", "Breath Awareness Challenge")} />
      <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 p-3 text-xs leading-6 text-sky-900">
        {t(
          "هذا تحدٍ توعوي بسيط، وليس اختبارًا طبيًا للرئة. لا تستخدمه إذا كنت تعاني من ألم في الصدر، ضيق تنفس، دوخة، حمل، ربو غير مستقر، أو أي مشكلة صحية. توقف فورًا إذا شعرت بعدم ارتياح.",
          "This is a simple awareness challenge, not a medical lung test. Do not use it if you have chest pain, shortness of breath, dizziness, pregnancy, unstable asthma, or any health concern. Stop immediately if you feel uncomfortable."
        )}
      </div>

      {!acknowledged ? (
        <Button onClick={() => setAcknowledged(true)} variant="outline" className="mt-4 w-full">
          {t("فهمت — متابعة", "I understand — continue")}
        </Button>
      ) : (
        <>
          <div className="mt-5 grid place-items-center rounded-2xl bg-gradient-to-br from-sky-100 via-teal-50 to-emerald-100 p-6">
            <div className="text-5xl font-bold tabular-nums text-teal-700">{running ? seconds : (final ?? 0)}s</div>
            <p className="mt-1 text-xs text-muted-foreground">{t("الحد الأقصى 60 ثانية للسلامة", "Max 60 seconds for safety")}</p>
            <div className="mt-4 flex gap-2">
              {!running
                ? <Button onClick={start} className="quit-gradient border-0 text-white">{t("ابدأ", "Start")}</Button>
                : <Button onClick={stop} variant="destructive">{t("توقف", "Stop")}</Button>}
            </div>
          </div>

          {final !== null && (
            <div className="mt-4 rounded-2xl bg-primary-soft p-4 text-sm">
              {autoStopped && (
                <p className="mb-2 text-xs font-medium text-rose-600">
                  {t("تم إيقاف التحدي تلقائيًا للحفاظ على السلامة.",
                     "The challenge stopped automatically for safety.")}
                </p>
              )}
              <p className={`text-base font-semibold ${band(final).cls}`}>{isAr ? band(final).ar : band(final).en}</p>
              <p className="mt-2 text-xs text-foreground/70">
                {t("هذه أداة توعية فقط، وليست تقييمًا لوظائف الرئة.",
                   "This is an awareness tool only and does not assess lung function.")}
              </p>
              <ShareResult
                shareType="breath"
                isAr={isAr}
                messageAr={messageAr}
                messageEn={messageEn}
                targetPath="/tools"
                titleAr="تحدي الوعي بالتنفس"
                titleEn="Breath Awareness Challenge"
                payload={{ seconds: final }}
              />
              <StartAssessment isAr={isAr} from="breath_challenge" />
            </div>
          )}
        </>
      )}
    </Card>
  );
}

/* ---------- 4. Quit Timeline ---------- */
function QuitTimeline({ isAr }: { isAr: boolean }) {
  const t = (ar: string, en: string) => (isAr ? ar : en);
  useEffect(() => { trackEvent("quit_timeline_viewed"); }, []);
  const items = [
    { when: t("20 دقيقة", "20 minutes"),
      text: t("يبدأ معدل النبض وضغط الدم بالعودة نحو القيم الطبيعية.",
              "Heart rate and blood pressure begin to ease toward normal levels.") },
    { when: t("24 ساعة", "24 hours"),
      text: t("تبدأ مستويات أول أكسيد الكربون في الدم بالانخفاض.",
              "Carbon monoxide levels in the blood start to decrease.") },
    { when: t("48 ساعة", "48 hours"),
      text: t("قد تلاحظ تحسنًا تدريجيًا في حاستي الشم والتذوق.",
              "You may notice gradual improvement in smell and taste.") },
    { when: t("2–12 أسبوع", "2–12 weeks"),
      text: t("قد تتحسن الدورة الدموية وكفاءة التنفس مع الوقت.",
              "Circulation and breathing efficiency may improve over time.") },
    { when: t("3–9 أشهر", "3–9 months"),
      text: t("قد يقل السعال وضيق التنفس تدريجيًا.",
              "Cough and shortness of breath may gradually decrease.") },
    { when: t("سنة واحدة", "1 year"),
      text: t("قد ينخفض خطر بعض أمراض القلب مقارنة بالتدخين المستمر.",
              "Risk of some heart-related conditions may decrease compared to continued smoking.") },
    { when: t("5 سنوات", "5 years"),
      text: t("قد يستمر تحسن المؤشرات الصحية العامة على المدى الطويل.",
              "General health indicators may continue to improve over the long term.") },
  ];
  const shareText = t(
    "تعرفت على رحلة التعافي بعد الإقلاع مع أقلع. الخطوة الأولى تبدأ اليوم.",
    "I explored the quitting recovery timeline with Aqla. The first step starts today."
  );
  return (
    <Card className="rounded-3xl border-0 p-6 shadow-elegant card-gradient md:col-span-2 xl:col-span-2">
      <ToolHeader icon={<Clock className="h-5 w-5" />} title={t("ماذا يحدث بعد الإقلاع؟", "What Happens After Quitting?")} />
      <p className="mt-3 text-sm text-muted-foreground">
        {t("رحلة الإقلاع تبدأ بخطوة. تعرّف على التغيرات الإيجابية التي قد تحدث مع الوقت.",
           "Quitting starts with one step. Explore positive changes that may happen over time.")}
      </p>
      <ol className="relative mt-5 space-y-3 border-s-2 border-primary/30 ps-5">
        {items.map((it, i) => (
          <li key={i} className="relative">
            <span className="absolute -start-[27px] top-1.5 grid h-4 w-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{i+1}</span>
            <div className="rounded-xl bg-primary-soft/60 p-3">
              <div className="text-xs font-semibold text-primary">{it.when}</div>
              <div className="mt-1 text-sm text-foreground/85">{it.text}</div>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-xs text-muted-foreground/80">
        {t("معلومات تثقيفية عامة وليست توقعات فردية.",
           "General educational information, not individual predictions.")}
      </p>
      <ShareRow text={shareText} isAr={isAr} />
      <StartAssessment isAr={isAr} from="quit_timeline" label={t("ابدأ رحلتك الآن", "Start your journey now")} />
    </Card>
  );
}

/* ---------- 5. Trigger Map ---------- */
function TriggerMap({ isAr }: { isAr: boolean }) {
  const t = (ar: string, en: string) => (isAr ? ar : en);
  const opts = [
    { v: "coffee",   ar: "القهوة",            en: "Coffee" },
    { v: "meals",    ar: "بعد الأكل",         en: "After meals" },
    { v: "stress",   ar: "التوتر",            en: "Stress" },
    { v: "boredom",  ar: "الملل",             en: "Boredom" },
    { v: "friends",  ar: "الأصدقاء",          en: "Friends" },
    { v: "study",    ar: "الدراسة أو الاختبارات", en: "Studying / exams" },
    { v: "driving",  ar: "القيادة",           en: "Driving" },
    { v: "social",   ar: "المناسبات الاجتماعية", en: "Social gatherings" },
    { v: "sleep",    ar: "قبل النوم",          en: "Before sleep" },
    { v: "wake",     ar: "بعد الاستيقاظ",      en: "After waking" },
    { v: "anger",    ar: "الغضب",             en: "Anger" },
    { v: "sad",      ar: "الحزن",             en: "Sadness" },
    { v: "work",     ar: "ضغط العمل",         en: "Work pressure" },
    { v: "other",    ar: "أخرى",              en: "Other" },
  ];
  const [sel, setSel] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const toggle = (v: string) => setSel((s) => s.includes(v) ? s.filter(x => x !== v) : [...s, v]);
  const top = useMemo(() => {
    return sel.map((v) => {
      const o = opts.find((x) => x.v === v)!;
      return isAr ? o.ar : o.en;
    }).slice(0, 3);
  }, [sel, isAr]);
  const tips = [
    t("اشرب الماء", "Drink water"),
    t("أجّل لمدة 5 دقائق", "Delay 5 minutes"),
    t("امشِ قليلًا", "Take a short walk"),
    t("جرّب تمرين تنفس هادئ", "Try a calm breathing exercise"),
    t("غيّر المكان", "Change your place"),
    t("راسل شخصًا داعمًا", "Message a support person"),
    t("استخدم تقييم أقلع", "Use the Aqla assessment"),
    t("تواصل مع الفريق عبر واتساب", "Contact the team via WhatsApp"),
  ];
  const messageAr = top.length
    ? `اكتشفت أكثر محفزاتي مع أقلع: ${top.join("، ")}.\nالوعي بالمحفزات أول خطوة للتغيير.\n\nاكتشف محفزاتك أنت أيضًا:`
    : "";
  const messageEn = top.length
    ? `I discovered my top triggers with Aqla: ${top.join(", ")}.\nKnowing your triggers is the first step toward change.\n\nDiscover yours:`
    : "";

  return (
    <Card className="rounded-3xl border-0 p-6 shadow-elegant card-gradient md:col-span-2 xl:col-span-2">
      <ToolHeader icon={<MapPin className="h-5 w-5" />} title={t("خريطة محفزاتك", "Your Trigger Map")} />
      <p className="mt-3 text-sm">
        {t("متى تزداد رغبتك في التدخين أو النيكوتين؟", "When do you feel the strongest urge to smoke or use nicotine?")}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {opts.map((o) => (
          <Button key={o.v} size="sm" variant={sel.includes(o.v) ? "default" : "outline"} onClick={() => toggle(o.v)}>
            {isAr ? o.ar : o.en}
          </Button>
        ))}
      </div>
      <Button className="mt-4 w-full quit-gradient border-0 text-white"
              disabled={sel.length === 0}
              onClick={() => { setDone(true); trackEvent("trigger_map_completed"); }}>
        {t("اعرض خريطتي", "Show my map")}
      </Button>

      {done && top.length > 0 && (
        <div className="mt-4 rounded-2xl bg-primary-soft p-4 text-sm">
          <p className="text-xs text-muted-foreground">{t("أكثر محفزاتك", "Your top triggers")}</p>
          <p className="mt-1 font-semibold text-primary">{top.join(isAr ? "، " : ", ")}</p>
          <p className="mt-3 text-xs font-medium">{t("أفكار بسيطة للتعامل:", "Simple coping ideas:")}</p>
          <ul className="mt-1 grid list-disc grid-cols-1 gap-1 ps-5 text-xs leading-6 sm:grid-cols-2">
            {tips.map((tip, i) => <li key={i}>{tip}</li>)}
          </ul>
          <p className="mt-2 text-[11px] text-muted-foreground/80">
            {t("ملاحظة: لا توصي هذه الأداة بأي أدوية أو بدائل نيكوتين.",
               "Note: this tool does not recommend medication or nicotine alternatives.")}
          </p>
          <ShareResult
            shareType="trigger"
            isAr={isAr}
            messageAr={messageAr}
            messageEn={messageEn}
            targetPath="/tools"
            titleAr="خريطة المحفزات"
            titleEn="Trigger Map"
            payload={{ top_triggers: top }}
          />
          <StartAssessment isAr={isAr} from="trigger_map" />
        </div>
      )}
    </Card>
  );
}

/* ---------- 6. Pledge Card ---------- */
function PledgeCard({ isAr }: { isAr: boolean }) {
  const t = (ar: string, en: string) => (isAr ? ar : en);
  const reasons = [
    { v: "health",    ar: "صحتي",         en: "My health" },
    { v: "family",    ar: "عائلتي",       en: "My family" },
    { v: "future",    ar: "مستقبلي",      en: "My future" },
    { v: "fitness",   ar: "لياقتي",       en: "My fitness" },
    { v: "money",     ar: "توفير المال",  en: "Saving money" },
    { v: "rolemodel", ar: "أن أكون قدوة", en: "Being a role model" },
    { v: "confidence",ar: "ثقتي بنفسي",   en: "My confidence" },
    { v: "other",     ar: "أخرى",         en: "Other" },
  ];
  const [reason, setReason] = useState<string | null>(null);
  const [other, setOther] = useState("");
  const [city, setCity] = useState("");
  const [created, setCreated] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const recordCity = useServerFn(recordCityChallengeEvent);
  const chosen = reasons.find((r) => r.v === reason);
  const reasonLabel = reason === "other" ? other.trim() : (chosen ? (isAr ? chosen.ar : chosen.en) : "");
  const messageAr =
    `مستقبلي يستاهل أبدأ من اليوم.\n\nاخترت أول خطوة مع أقلع${reasonLabel ? ` لأجل ${reasonLabel}` : ""}، ويمكن خطوة بسيطة اليوم تصنع فرق كبير بكرة.\n\nاكتب سببك أنت أيضًا وصمّم بطاقتك:`;
  const messageEn =
    `My future is worth starting for today.\n\nI chose my first step with Aqla${reasonLabel ? ` for ${reasonLabel}` : ""}, and one small step today may create a bigger change tomorrow.\n\nWrite your reason and create your card:`;

  return (
    <Card className="rounded-3xl border-0 p-6 shadow-elegant card-gradient">
      <ToolHeader icon={<HeartHandshake className="h-5 w-5" />} title={t("وعد الإقلاع", "Quit Pledge")} />
      {!created ? (
        <div className="mt-5 space-y-3">
          <p className="text-xs text-muted-foreground">{t("اختر سببك للبدء", "Choose your reason to start")}</p>
          <div className="flex flex-wrap gap-2">
            {reasons.map((r) => (
              <Button key={r.v} size="sm" variant={reason === r.v ? "default" : "outline"} onClick={() => setReason(r.v)}>
                {isAr ? r.ar : r.en}
              </Button>
            ))}
          </div>
          {reason === "other" && (
            <Input value={other} onChange={(e) => setOther(e.target.value)} placeholder={t("اكتب سببك", "Write your reason")} />
          )}
          <div>
            <Label className="text-xs">
              {t("اختر مدينتك لإضافة تعهدك إلى تحدي المدن (اختياري)",
                 "Choose your city to add your pledge to the City Challenge (optional)")}
            </Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)}
                   placeholder={t("مدينتك", "Your city")} maxLength={60} />
            <p className="mt-1 text-[10px] text-muted-foreground">
              {t("لا نطلب اسمك أو رقمك. تُستخدم المدينة لأغراض إحصائية فقط.",
                 "We don't ask for your name or phone. City is used for aggregate stats only.")}
            </p>
          </div>
          <Button onClick={() => {
                    setCreated(true);
                    trackEvent("quit_pledge_created");
                    const trimmed = city.trim();
                    void recordCity({ data: {
                      event_type: "quit_pledge_created",
                      city: trimmed ? trimmed : null,
                      anonymous_session_id: getAnonSessionId(),
                    }});
                  }}
                  disabled={!reason || (reason === "other" && !other.trim())}
                  className="w-full quit-gradient border-0 text-white hover:opacity-95">
            {t("أنشئ بطاقتي", "Create my pledge")}
          </Button>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          <div ref={cardRef} dir={isAr ? "rtl" : "ltr"}
               className="relative overflow-hidden rounded-2xl p-6 text-center text-white shadow-elegant quit-gradient">
            <div className="absolute -end-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -start-6 -bottom-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <img src={aqlaLogo} alt="Aqla" className="mx-auto h-10 w-auto opacity-95" />
              <p className="mt-3 text-xs opacity-90">Aqla — أقلع</p>
              <p className="mt-2 text-lg font-semibold leading-7">
                {t("بدأت خطوتي الأولى مع أقلع", "I started my first step with Aqla")}
              </p>
              <p className="mt-3 text-sm opacity-95">
                {t("سببي:", "My reason:")} <span className="font-semibold">{reasonLabel}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" className="flex-1 gap-1.5"
                    onClick={() => cardRef.current && saveAsImage(cardRef.current, "aqla-pledge.png")}>
              <Download className="h-4 w-4" />{t("احفظ البطاقة", "Save card")}
            </Button>
          </div>
          <ShareResult
            shareType="pledge"
            isAr={isAr}
            messageAr={messageAr}
            messageEn={messageEn}
            targetPath="/tools"
            titleAr="وعد الإقلاع"
            titleEn="Quit Pledge"
            payload={{ reason: reasonLabel, city: city.trim() || null }}
            snapshotRef={cardRef}
          />
          <StartAssessment isAr={isAr} from="pledge" />
        </div>
      )}
    </Card>
  );
}

/* ---------- 7. Readiness Meter ---------- */
function ReadinessMeter({ isAr }: { isAr: boolean }) {
  const t = (ar: string, en: string) => (isAr ? ar : en);
  const [val, setVal] = useState<number>(5);
  const [done, setDone] = useState(false);
  const band = val <= 3
    ? { ar: "لا بأس. البداية قد تكون فقط في فهم وضعك دون ضغط.",
        en: "That's okay. The first step can simply be understanding where you are, without pressure.",
        cls: "text-sky-700" }
    : val <= 6
    ? { ar: "أنت في مرحلة التفكير. هذه خطوة مهمة، ويمكن لأقلع مساعدتك على ترتيب الخطوة التالية.",
        en: "You are in the thinking stage. That is an important step, and Aqla can help you plan what comes next.",
        cls: "text-emerald-700" }
    : { ar: "يبدو أنك قريب من بداية حقيقية. لنضع لك مسارًا أوضح من خلال تقييم أقلع.",
        en: "You may be close to a real start. Complete the Aqla assessment to get a clearer pathway.",
        cls: "text-teal-700" };
  const messageAr =
    `درجة استعدادي اليوم على مقياس أقلع: ${val}/10.\nمو مهم وين أنا الحين، المهم إني بدأت أفكر بخطوتي القادمة.\n\nشوف درجتك أنت:`;
  const messageEn =
    `My readiness today on the Aqla scale: ${val}/10.\nWhere I am right now matters less than the fact I'm thinking about my next step.\n\nSee your readiness:`;
  return (
    <Card className="rounded-3xl border-0 p-6 shadow-elegant card-gradient">
      <ToolHeader icon={<Sparkles className="h-5 w-5" />} title={t("مقياس الاستعداد للإقلاع", "Quit Readiness Meter")} />
      <p className="mt-3 text-sm">
        {t("كم تشعر أنك مستعد للإقلاع أو التقليل اليوم؟",
           "How ready do you feel to quit or reduce today?")}
      </p>
      <div className="mt-4">
        <Slider value={[val]} min={0} max={10} step={1} onValueChange={(v) => setVal(v[0] ?? 0)} />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>0</span><span className="font-semibold text-primary">{val}/10</span><span>10</span>
        </div>
      </div>
      <Button onClick={() => { setDone(true); trackEvent("readiness_meter_used"); }}
              className="mt-4 w-full quit-gradient border-0 text-white">
        {t("اعرض النتيجة", "Show result")}
      </Button>
      {done && (
        <div className="mt-4 rounded-2xl bg-primary-soft p-4 text-sm">
          <p className={`font-semibold ${band.cls}`}>{isAr ? band.ar : band.en}</p>
          <ShareRow text={shareText} isAr={isAr} />
          <StartAssessment isAr={isAr} from="readiness_meter" />
        </div>
      )}
    </Card>
  );
}
