import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, Gauge, HeartHandshake, ArrowRight, Download } from "lucide-react";
import { trackEvent } from "@/lib/track-event";

type Props = { isAr: boolean };

export function InteractiveTools({ isAr }: Props) {
  const t = (ar: string, en: string) => (isAr ? ar : en);

  return (
    <section className="mt-12">
      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
          {t("جرّب أدوات أقلع التفاعلية", "Try Aqla Interactive Tools")}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          {t(
            "أدوات بسيطة تساعدك على فهم التدخين والنيكوتين بطريقة عملية، دون عرض أي بيانات شخصية.",
            "Simple tools to help you understand smoking and nicotine in a practical way, without displaying personal data."
          )}
        </p>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <CostCalculator isAr={isAr} />
        <DependenceCheck isAr={isAr} />
        <PledgeCard isAr={isAr} />
      </div>
    </section>
  );
}

/* ---------------- Cost Calculator ---------------- */
function CostCalculator({ isAr }: { isAr: boolean }) {
  const t = (ar: string, en: string) => (isAr ? ar : en);
  const [cpd, setCpd] = useState("");
  const [price, setPrice] = useState("");
  const [years, setYears] = useState("");
  const [out, setOut] = useState<null | {
    daily: number; monthly: number; yearly: number; fiveYear: number; pastYears: number | null;
  }>(null);

  function calc() {
    const c = parseFloat(cpd) || 0;
    const p = parseFloat(price) || 0;
    const y = parseFloat(years);
    if (c <= 0 || p <= 0) { setOut(null); return; }
    const daily = (c / 20) * p;
    const monthly = daily * 30;
    const yearly = daily * 365;
    const fiveYear = yearly * 5;
    const pastYears = !isNaN(y) && y > 0 ? yearly * y : null;
    setOut({ daily, monthly, yearly, fiveYear, pastYears });
    trackEvent("cost_calculator_used");
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat(isAr ? "ar-SA" : "en-US", { maximumFractionDigits: 0 }).format(Math.round(n));
  const sar = t("ر.س", "SAR");

  return (
    <Card className="rounded-3xl border-0 p-6 shadow-elegant card-gradient">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl quit-gradient text-white shadow-md">
          <Calculator className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-semibold">{t("حاسبة تكلفة التدخين", "Smoking Cost Calculator")}</h3>
      </div>

      <div className="mt-5 space-y-3">
        <div>
          <Label className="text-xs">{t("عدد السجائر يوميًا", "Cigarettes per day")}</Label>
          <Input inputMode="numeric" value={cpd} onChange={(e) => setCpd(e.target.value)} placeholder="20" />
        </div>
        <div>
          <Label className="text-xs">{t("سعر العلبة", "Pack price")} ({sar})</Label>
          <Input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="27" />
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
        <div className="mt-4 space-y-2 rounded-2xl bg-primary-soft p-4 text-sm">
          <Row label={t("يوميًا", "Daily")} value={`${fmt(out.daily)} ${sar}`} />
          <Row label={t("شهريًا", "Monthly")} value={`${fmt(out.monthly)} ${sar}`} />
          <Row label={t("سنويًا", "Yearly")} value={`${fmt(out.yearly)} ${sar}`} />
          <Row label={t("خلال 5 سنوات", "Over 5 years")} value={`${fmt(out.fiveYear)} ${sar}`} bold />
          {out.pastYears !== null && (
            <Row label={t("خلال سنوات التدخين السابقة", "Across years smoked")} value={`${fmt(out.pastYears)} ${sar}`} />
          )}
          <p className="pt-2 text-xs leading-6 text-foreground/70">
            {t(
              "قد يكون التدخين مكلفًا أكثر مما تتوقع. معرفة الرقم قد تكون أول خطوة للتغيير.",
              "Smoking may cost more than you think. Seeing the number can be the first step toward change."
            )}
          </p>
          <StartAssessmentBtn isAr={isAr} from="cost_calculator" />
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

/* ---------------- Dependence Check ---------------- */
function DependenceCheck({ isAr }: { isAr: boolean }) {
  const t = (ar: string, en: string) => (isAr ? ar : en);
  const questions = [
    t("هل تستخدم النيكوتين بعد الاستيقاظ بفترة قصيرة؟", "Do you use nicotine soon after waking?"),
    t("هل تشعر برغبة قوية في استخدام النيكوتين؟", "Do you feel strong cravings?"),
    t("هل حاولت التوقف ولم تستطع؟", "Have you tried to stop but could not?"),
    t("هل تستخدم أكثر من منتج نيكوتين؟", "Do you use more than one nicotine product?"),
    t("هل تشعر بالانفعال أو القلق عند عدم التمكن من استخدام النيكوتين؟", "Do you feel irritable or restless when you cannot use nicotine?"),
  ];
  const [answers, setAnswers] = useState<(boolean | null)[]>(Array(questions.length).fill(null));
  const [done, setDone] = useState(false);

  function setA(i: number, v: boolean) {
    const next = [...answers];
    next[i] = v;
    setAnswers(next);
  }
  function submit() {
    if (answers.some((a) => a === null)) return;
    setDone(true);
    trackEvent("quick_dependence_check_used");
  }
  const score = answers.filter(Boolean).length;
  const level =
    score <= 1 ? { label: t("اهتمام منخفض", "Low concern"), cls: "text-primary" } :
    score <= 3 ? { label: t("اهتمام متوسط", "Moderate concern"), cls: "text-amber-600" } :
                 { label: t("اهتمام مرتفع", "High concern"), cls: "text-destructive" };

  return (
    <Card className="rounded-3xl border-0 p-6 shadow-elegant card-gradient">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl quit-gradient text-white shadow-md">
          <Gauge className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-semibold">
          {t("اعرف مستوى اعتمادك خلال دقيقة", "Know Your Dependence Level in 1 Minute")}
        </h3>
      </div>

      {!done ? (
        <div className="mt-5 space-y-3">
          {questions.map((q, i) => (
            <div key={i} className="rounded-xl border bg-card/50 p-3">
              <p className="text-sm">{q}</p>
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant={answers[i] === true ? "default" : "outline"} onClick={() => setA(i, true)}>
                  {t("نعم", "Yes")}
                </Button>
                <Button size="sm" variant={answers[i] === false ? "default" : "outline"} onClick={() => setA(i, false)}>
                  {t("لا", "No")}
                </Button>
              </div>
            </div>
          ))}
          <Button onClick={submit} disabled={answers.some((a) => a === null)} className="w-full quit-gradient border-0 text-white hover:opacity-95">
            {t("اعرض النتيجة", "Show result")}
          </Button>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl bg-primary-soft p-4 text-sm">
          <p className="text-xs text-muted-foreground">{t("النتيجة", "Result")}</p>
          <p className={`mt-1 text-xl font-semibold ${level.cls}`}>{level.label}</p>
          <p className="mt-3 text-xs leading-6 text-foreground/70">
            {t(
              "هذه ليست تشخيصًا طبيًا ولا تغني عن التقييم الكامل في أقلع.",
              "This is not a medical diagnosis and does not replace the full Aqla assessment."
            )}
          </p>
          <p className="mt-2 text-xs leading-6 text-foreground/70">
            {t("أكمل التقييم الكامل للحصول على مسار أدق.", "Complete the full Aqla assessment for a more accurate pathway.")}
          </p>
          <StartAssessmentBtn isAr={isAr} from="dependence_check" />
        </div>
      )}
    </Card>
  );
}

/* ---------------- Quit Pledge Card ---------------- */
function PledgeCard({ isAr }: { isAr: boolean }) {
  const t = (ar: string, en: string) => (isAr ? ar : en);
  const reasons = [
    { v: "health", ar: "صحتي", en: "My health" },
    { v: "family", ar: "عائلتي", en: "My family" },
    { v: "future", ar: "مستقبلي", en: "My future" },
    { v: "money", ar: "المال", en: "Money" },
    { v: "fitness", ar: "اللياقة", en: "Fitness" },
    { v: "role_model", ar: "أن أكون قدوة", en: "I want to be a role model" },
    { v: "other", ar: "سبب آخر", en: "Other" },
  ];
  const [reason, setReason] = useState<string | null>(null);
  const [other, setOther] = useState("");
  const [created, setCreated] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const chosen = reasons.find((r) => r.v === reason);
  const reasonLabel = reason === "other" ? other.trim() : (chosen ? (isAr ? chosen.ar : chosen.en) : "");

  function create() {
    if (!reason || (reason === "other" && !other.trim())) return;
    setCreated(true);
    trackEvent("quit_pledge_created");
  }

  async function save() {
    if (!cardRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 2 });
      const link = document.createElement("a");
      link.download = "aqla-pledge.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      // Fallback: trigger print
      window.print();
    }
  }

  return (
    <Card className="rounded-3xl border-0 p-6 shadow-elegant card-gradient">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl quit-gradient text-white shadow-md">
          <HeartHandshake className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-semibold">{t("وعد الإقلاع", "Quit Pledge")}</h3>
      </div>

      {!created ? (
        <div className="mt-5 space-y-3">
          <p className="text-xs text-muted-foreground">{t("اختر سبب الإقلاع:", "Choose a reason:")}</p>
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
          <Button onClick={create} disabled={!reason || (reason === "other" && !other.trim())} className="w-full quit-gradient border-0 text-white hover:opacity-95">
            {t("أنشئ بطاقتي", "Create my pledge")}
          </Button>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          <div
            ref={cardRef}
            className="rounded-2xl p-6 text-center text-white shadow-elegant quit-gradient"
            dir={isAr ? "rtl" : "ltr"}
          >
            <p className="text-xs opacity-90">Aqla — أقلع</p>
            <p className="mt-3 text-lg font-semibold leading-7">
              {t("بدأت خطوتي الأولى مع أقلع", "I started my first step with Aqla")}
            </p>
            <p className="mt-3 text-sm opacity-95">
              {t("من أجل:", "For:")} <span className="font-semibold">{reasonLabel}</span>
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={save} variant="outline" className="flex-1 gap-1.5">
              <Download className="h-4 w-4" />
              {t("احفظ البطاقة", "Save card")}
            </Button>
            <Link to="/assessment" className="flex-1" onClick={() => trackEvent("start_assessment_clicked_from_tool", "pledge")}>
              <Button className="w-full quit-gradient border-0 text-white hover:opacity-95">
                {t("ابدأ التقييم", "Start assessment")}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </Card>
  );
}

function StartAssessmentBtn({ isAr, from }: { isAr: boolean; from: string }) {
  return (
    <Link
      to="/assessment"
      className="mt-3 block"
      onClick={() => trackEvent("start_assessment_clicked_from_tool", from)}
    >
      <Button className="w-full quit-gradient border-0 text-white hover:opacity-95">
        {isAr ? "ابدأ التقييم الكامل" : "Start full assessment"}
      </Button>
    </Link>
  );
}
