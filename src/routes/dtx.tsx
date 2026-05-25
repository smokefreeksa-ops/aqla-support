import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Activity, AlertOctagon, Flame, HandHeart, Heart, Sparkles, Wind, Zap, ChevronRight,
  CheckCircle2, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  dtxGetState, dtxSavePact, dtxUpdateScores, dtxLogHalt, dtxLogSlip, dtxLogNrt,
} from "@/lib/dtx.functions";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export const Route = createFileRoute("/dtx")({
  head: () => ({
    meta: [
      { title: "أقلع DTx — رحلة الإقلاع العلاجية الرقمية" },
      { name: "description", content: "وحدة DTx السريرية: الميثاق السيادي، تقييم الجاهزية، لوحة القيادة الحية، وأدوات السيطرة على الرغبة." },
    ],
  }),
  component: DtxPage,
});

// ============ TYPES ============
type Pact = {
  id: string;
  full_name: string;
  quit_start_date: string;
  monthly_spend: number;
  reason_1: string;
  reason_2: string;
  ftnd_score: number | null;
  readiness_score: number | null;
};
type HaltKey = "hungry" | "angry" | "lonely" | "tired";
type SlipKey = "work_stress" | "argument" | "social" | "boredom";

// ============ COPY (ar) ============
const HALT_LABELS: Record<HaltKey, string> = {
  hungry: "أنا جائع (Hungry)",
  angry: "أنا غاضب/متوتر (Angry)",
  lonely: "أنا وحيد/مملول (Lonely)",
  tired: "أنا مرهق (Tired)",
};
const HALT_TOASTS: Record<HaltKey, string> = {
  hungry: "الجوع يخدع الدماغ. اشرب كوب ماء وتناول فاكهة. الرغبة ستزول.",
  angry: "الغضب طاقة مكبوتة. غادر مكانك فوراً وامشِ لـ 5 دقائق لتفريغ الأدرينالين.",
  lonely: "الملل يطلب الدوبامين. اتصل بمن تحب، أو ابدأ قراءة شيء جديد.",
  tired: "الجسد يطلب الراحة لا التخدير. أغمض عينيك لمدة 10 دقائق.",
};
const SLIP_LABELS: Record<SlipKey, string> = {
  work_stress: "ضغط عمل",
  argument: "شجار",
  social: "مجاملة اجتماعية",
  boredom: "ملل",
};
const DOPAMINE = [
  "قم بتنفيذ 15 تمرين ضغط (Push-ups) أو إطالة الآن لضخ الدم.",
  "اشرب 500 مل من الماء البارد جداً دفعة واحدة لغسل السموم.",
  "اكتب 3 أشياء تمتن لوجودها في حياتك اليوم.",
  "اغسل وجهك بماء مثلج فوراً لتفعيل العصب الحائر وتهدئة النبض.",
];
const TRIGGERS = [
  { t: "ارتباط القهوة الصباحية", a: "إذن: سأشرب القهوة في غرفة مختلفة وأنا أقرأ، وسأكسر الرابط المكاني." },
  { t: "القيادة وزحام الطريق", a: "إذن: سأشغل بودكاست علمي أو تلاوة، ولن أحول سيارتي لغرفة غاز." },
  { t: "بعد وجبات الطعام الدسمة", a: "إذن: سأقوم فوراً لغسل أسناني بمعجون نعناع لاذع لإنهاء الطقس." },
];

// ============ HELPERS ============
function elapsed(from: string) {
  const ms = Math.max(0, Date.now() - new Date(from).getTime());
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return { d, h, m, hours: ms / 3600000, days: ms / 86400000 };
}
function arabicMoney(n: number) {
  return new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 0 }).format(n);
}

// ============ PAGE ============
function DtxPage() {
  const getState = useServerFn(dtxGetState);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["dtx-state"],
    queryFn: () => getState(),
    retry: false,
  });

  if (isLoading) {
    return (
      <div dir="rtl" className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-slate-400 text-sm">جاري التحميل…</div>
      </div>
    );
  }

  const pact = (data?.pact as Pact | null) ?? null;

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 font-[system-ui,'Tajawal','Cairo',sans-serif]">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-slate-950/70 border-b border-cyan-900/40">
        <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-teal-600 grid place-content-center">
              <Wind className="h-4 w-4 text-slate-950" />
            </div>
            <span className="font-bold tracking-tight">أقلع · DTx</span>
          </div>
          <Link to="/" className="text-xs text-cyan-400 hover:text-cyan-300">العودة للموقع ←</Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 space-y-8 pb-32">
        {!pact ? (
          <PactWizard onDone={() => refetch()} />
        ) : (
          <DtxDashboard
            pact={pact}
            halt={(data?.halt ?? []) as { trigger_type: HaltKey; created_at: string }[]}
            slips={(data?.slips ?? []) as { reason: SlipKey; created_at: string }[]}
            nrt={(data?.nrt ?? []) as { log_date: string; taken: boolean }[]}
            onChange={() => refetch()}
          />
        )}
      </main>

      {pact && <HaltFab onLogged={() => refetch()} />}
    </div>
  );
}

// ============ SOVEREIGN PACT WIZARD ============
function PactWizard({ onDone }: { onDone: () => void }) {
  const savePact = useServerFn(dtxSavePact);
  const updateScores = useServerFn(dtxUpdateScores);
  const [step, setStep] = useState<"pact" | "certificate" | "readiness" | "ftnd" | "done">("pact");
  const [form, setForm] = useState({
    full_name: "",
    quit_start_date: new Date().toISOString().slice(0, 10),
    monthly_spend: 0,
    reason_1: "",
    reason_2: "",
  });
  const [pactId, setPactId] = useState<string | null>(null);
  const [readiness, setReadiness] = useState(7);
  const [q1, setQ1] = useState<number | null>(null); // FTND Q1
  const [q2, setQ2] = useState<number | null>(null);

  if (step === "pact") {
    const valid = form.full_name && form.reason_1 && form.reason_2 && form.quit_start_date;
    return (
      <Card title="صناعة الميثاق السيادي" icon={<HandHeart className="h-5 w-5 text-cyan-400" />}>
        <div className="space-y-4">
          <Field label="اسمك الكريم">
            <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="bg-slate-900 border-slate-700 text-slate-100" />
          </Field>
          <Field label="تاريخ بدء الإقلاع (تاريخ اليوم)">
            <Input type="date" value={form.quit_start_date}
              onChange={(e) => setForm({ ...form, quit_start_date: e.target.value })}
              className="bg-slate-900 border-slate-700 text-slate-100" />
          </Field>
          <Field label="متوسط إنفاقك الشهري على التدخين (بالعملة المحلية)">
            <Input type="number" min={0} value={form.monthly_spend}
              onChange={(e) => setForm({ ...form, monthly_spend: Number(e.target.value || 0) })}
              className="bg-slate-900 border-slate-700 text-slate-100" />
          </Field>
          <Field label="السبب الجوهري الأول للإقلاع (مثال: صحتي، أبنائي)">
            <Input value={form.reason_1} onChange={(e) => setForm({ ...form, reason_1: e.target.value })}
              className="bg-slate-900 border-slate-700 text-slate-100" />
          </Field>
          <Field label="السبب الجوهري الثاني للإقلاع">
            <Input value={form.reason_2} onChange={(e) => setForm({ ...form, reason_2: e.target.value })}
              className="bg-slate-900 border-slate-700 text-slate-100" />
          </Field>
          <Button
            disabled={!valid}
            onClick={async () => {
              try {
                const row = await savePact({ data: form });
                setPactId(row.id);
                setStep("certificate");
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "تعذر الحفظ");
              }
            }}
            className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 hover:opacity-90 font-bold"
          >
            أوقع وألتزم سيادياً
          </Button>
        </div>
      </Card>
    );
  }

  if (step === "certificate") {
    return (
      <Card title="ميثاق التحرر العظيم" icon={<Sparkles className="h-5 w-5 text-amber-400" />}>
        <div className="rounded-xl border border-cyan-500/40 bg-gradient-to-br from-slate-900 to-cyan-950/40 p-6 text-center space-y-3">
          <div className="text-amber-400 text-xs tracking-widest">CERTIFIED · موثّق</div>
          <h3 className="text-2xl font-extrabold">ميثاق التحرر العظيم</h3>
          <p className="text-sm leading-7 text-slate-200">
            أنا الموقع أدناه <b className="text-cyan-300">{form.full_name}</b>، أقرر اليوم بتاريخ{" "}
            <b className="text-cyan-300">{form.quit_start_date}</b> أن أسترد حريتي وأكسجيني،
            وأتوقف نهائياً عن استهلاك أي منتج يحتوي على النيكوتين.
          </p>
          <p className="text-sm leading-7 text-slate-200">
            قررت ذلك لأنني أستحق: <b className="text-cyan-300">{form.reason_1}</b> و{" "}
            <b className="text-cyan-300">{form.reason_2}</b>.
          </p>
          <p className="text-emerald-400 font-bold pt-2">تم التوقيع بنجاح. هذا العقد لا يقبل النقض.</p>
        </div>
        <Button onClick={() => setStep("readiness")} className="mt-5 w-full bg-cyan-600 hover:bg-cyan-500">
          متابعة إلى التقييم السريري <ChevronRight className="h-4 w-4 rotate-180" />
        </Button>
      </Card>
    );
  }

  if (step === "readiness") {
    return (
      <Card title="مقياس الجاهزية" icon={<Activity className="h-5 w-5 text-cyan-400" />}>
        <p className="text-sm text-slate-300">على مقياس من 1 إلى 10، ما مدى استعدادك وقرارك الداخلي للإقلاع الآن؟</p>
        <div className="mt-6 mb-2 text-center text-4xl font-extrabold text-cyan-300">{readiness}</div>
        <Slider value={[readiness]} min={1} max={10} step={1} onValueChange={(v) => setReadiness(v[0])} />
        <Button onClick={() => setStep("ftnd")} className="mt-6 w-full bg-cyan-600 hover:bg-cyan-500">
          متابعة إلى اختبار الاعتماد (Fagerström)
        </Button>
      </Card>
    );
  }

  if (step === "ftnd") {
    const q1Opts = [
      { l: "خلال 5 دقائق", v: 3 },
      { l: "خلال 6 إلى 30 دقيقة", v: 2 },
      { l: "خلال 31 إلى 60 دقيقة", v: 1 },
      { l: "بعد أكثر من ساعة", v: 0 },
    ];
    const q2Opts = [
      { l: "10 أو أقل", v: 0 },
      { l: "11 إلى 20", v: 1 },
      { l: "21 إلى 30", v: 2 },
      { l: "31 أو أكثر", v: 3 },
    ];
    const done = q1 !== null && q2 !== null;
    return (
      <Card title="اختبار الاعتماد الكيميائي (FTND)" icon={<Activity className="h-5 w-5 text-cyan-400" />}>
        <div className="space-y-6">
          <RadioBlock label="متى تدخن سيجارتك الأولى (أو الفيب) بعد الاستيقاظ؟"
            opts={q1Opts} value={q1} onChange={setQ1} />
          <RadioBlock label="كم تستهلك في اليوم الواحد تقريباً؟"
            opts={q2Opts} value={q2} onChange={setQ2} />
          <Button
            disabled={!done}
            onClick={async () => {
              const score = (q1 ?? 0) + (q2 ?? 0);
              try {
                if (pactId) await updateScores({ data: { pact_id: pactId, ftnd_score: score, readiness_score: readiness } });
                if (score >= 4) {
                  toast.success("مستوى الاعتماد الكيميائي: مرتفع. نوصيك بدمج بدائل النيكوتين الطبية (NRT).", { duration: 8000 });
                } else {
                  toast.success("مستوى الاعتماد الكيميائي: خفيف إلى متوسط. أنت جاهز للسيطرة عليه عبر أدوات التطبيق.", { duration: 8000 });
                }
                onDone();
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "تعذر الحفظ");
              }
            }}
            className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold"
          >
            إنهاء التقييم وفتح لوحة القيادة
          </Button>
        </div>
      </Card>
    );
  }

  return null;
}

function RadioBlock({ label, opts, value, onChange }:
  { label: string; opts: { l: string; v: number }[]; value: number | null; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="text-sm text-slate-200 mb-2">{label}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {opts.map((o) => (
          <button key={o.v} type="button" onClick={() => onChange(o.v)}
            className={`text-right rounded-lg border px-3 py-2 text-sm transition ${
              value === o.v
                ? "border-cyan-400 bg-cyan-500/10 text-cyan-200"
                : "border-slate-700 bg-slate-900 hover:border-slate-500"
            }`}>
            {o.l}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============ DASHBOARD ============
function DtxDashboard({ pact, halt, slips, nrt, onChange }: {
  pact: Pact;
  halt: { trigger_type: HaltKey; created_at: string }[];
  slips: { reason: SlipKey; created_at: string }[];
  nrt: { log_date: string; taken: boolean }[];
  onChange: () => void;
}) {
  const [, force] = useState(0);
  useEffect(() => {
    const t = setInterval(() => force((x) => x + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  const e = elapsed(pact.quit_start_date);
  const monthlySaved = pact.monthly_spend * (e.days / 30);

  const co = Math.min(100, (e.hours / 12) * 100);
  const taste = Math.min(100, (e.hours / 48) * 100);
  const lung = Math.min(100, (e.days / 90) * 100);

  return (
    <div className="space-y-8">
      {/* Welcome strip */}
      <div className="rounded-2xl border border-cyan-900/40 bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-900 p-5 flex flex-wrap items-center gap-4">
        <div className="h-10 w-10 rounded-full bg-cyan-500/20 grid place-content-center">
          <Heart className="h-5 w-5 text-cyan-300" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <div className="text-xs text-cyan-400">أهلاً بعودتك</div>
          <div className="text-lg font-bold">{pact.full_name}</div>
        </div>
        {pact.ftnd_score !== null && (
          <div className="text-xs text-slate-300">
            FTND: <b className="text-cyan-300">{pact.ftnd_score}/6</b> · جاهزية: <b className="text-cyan-300">{pact.readiness_score}/10</b>
          </div>
        )}
      </div>

      {/* Live ROI Dashboard */}
      <Section title="لوحة القيادة الحية" icon={<Activity className="h-5 w-5 text-cyan-400" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Stat label="مدة النقاء والحرية" value={`${e.d} يوم · ${e.h} ساعة · ${e.m} دقيقة`} accent="from-cyan-500 to-teal-400" />
          <Stat label="المال المسترد" value={`${arabicMoney(monthlySaved)}`} accent="from-amber-400 to-orange-500" />
        </div>
        <div className="mt-5 space-y-4">
          <Metric label="تطهير الدم من أول أكسيد الكربون (CO Washout)" pct={co} />
          <Metric label="استرداد حواس التذوق والشم" pct={taste} />
          <Metric label="كفاءة الرئة ونمو الأهداب التنفسية" pct={lung} />
        </div>
      </Section>

      <Section title="تحدي الـ 3 دقائق (كسر موجة الرغبة)" icon={<Wind className="h-5 w-5 text-cyan-400" />}>
        <BreathingChallenge />
      </Section>

      <Section title="رادار المحفزات (البرمجة المسبقة)" icon={<Zap className="h-5 w-5 text-cyan-400" />}>
        <div className="space-y-2">
          {TRIGGERS.map((t, i) => (
            <details key={i} className="rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3 group">
              <summary className="cursor-pointer text-sm font-semibold text-slate-100 flex items-center justify-between">
                {t.t} <ChevronRight className="h-4 w-4 text-slate-500 group-open:rotate-90 transition" />
              </summary>
              <p className="mt-2 text-sm text-slate-300 leading-7">{t.a}</p>
            </details>
          ))}
        </div>
      </Section>

      <Section title="خوارزمية الدوبامين" icon={<Sparkles className="h-5 w-5 text-cyan-400" />}>
        <DopamineGen />
      </Section>

      <Section title="رادار التعافي (ماذا يحدث لجسدك الآن؟)" icon={<Activity className="h-5 w-5 text-emerald-400" />}>
        <RecoveryTimeline days={e.days} />
      </Section>

      <Section title="مجدول البدائل الطبية (NRT)" icon={<CheckCircle2 className="h-5 w-5 text-emerald-400" />}>
        <NrtTracker nrt={nrt} onChange={onChange} />
      </Section>

      <Section title="تحليلاتي (أوقات الخطر العالية)" icon={<Activity className="h-5 w-5 text-amber-400" />}>
        <HaltHeatmap halt={halt} />
      </Section>

      <Section title="محرك احتواء الزلات" icon={<AlertTriangle className="h-5 w-5 text-amber-400" />}>
        <SlipIntercept slips={slips} onChange={onChange} />
      </Section>

      <SosButton />
    </div>
  );
}

// ============ COMPONENTS ============
function Card({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-4">{icon}<h2 className="font-bold text-lg">{title}</h2></div>
      {children}
    </div>
  );
}
function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">{icon}<h2 className="font-bold text-lg">{title}</h2></div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">{children}</div>
    </section>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm text-slate-300 mb-1.5">{label}</span>
      {children}
    </label>
  );
}
function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
      <div className="text-xs text-slate-400">{label}</div>
      <div className={`mt-1 text-2xl font-extrabold bg-gradient-to-r ${accent} bg-clip-text text-transparent`}>{value}</div>
    </div>
  );
}
function Metric({ label, pct }: { label: string; pct: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-slate-300">{label}</span>
        <span className="text-cyan-300 font-mono">{Math.round(pct)}%</span>
      </div>
      <Progress value={pct} className="bg-slate-800 [&>div]:bg-gradient-to-r [&>div]:from-cyan-400 [&>div]:to-teal-400" />
    </div>
  );
}

// ============ BREATHING ============
function BreathingChallenge() {
  const [running, setRunning] = useState(false);
  const [secs, setSecs] = useState(180);
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");
  const phaseLeftRef = useRef(4);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setSecs((s) => {
        if (s <= 1) { setRunning(false); return 0; }
        return s - 1;
      });
      phaseLeftRef.current -= 1;
      if (phaseLeftRef.current <= 0) {
        setPhase((p) => {
          if (p === "in") { phaseLeftRef.current = 7; return "hold"; }
          if (p === "hold") { phaseLeftRef.current = 8; return "out"; }
          phaseLeftRef.current = 4; return "in";
        });
      }
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => {
    if (secs === 0 && !running) {
      toast.success("لقد مرت الموجة. مستوى الأكسجين لديك ممتاز. لقد انتصرت!");
    }
  }, [secs, running]);

  const phaseText = phase === "in" ? "شهيق عميق من الأنف..." : phase === "hold" ? "احبس أنفاسك..." : "زفير بطيء من الفم...";
  const scale = phase === "in" ? "scale-100" : phase === "hold" ? "scale-100" : "scale-50";
  const dur = phase === "in" ? "duration-[4000ms]" : phase === "hold" ? "duration-[7000ms]" : "duration-[8000ms]";

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative h-48 w-48 grid place-content-center my-2">
        <div className={`absolute inset-0 m-auto h-40 w-40 rounded-full bg-gradient-to-br from-cyan-500/30 to-teal-500/20 border border-cyan-400/40 transition-transform ease-in-out ${dur} ${running ? scale : "scale-75"}`} />
        <div className="relative z-10 font-mono text-3xl text-cyan-200">{String(Math.floor(secs / 60)).padStart(2, "0")}:{String(secs % 60).padStart(2, "0")}</div>
      </div>
      <div className="text-sm text-slate-300 min-h-[1.5rem]">{running ? phaseText : "ابدأ التحدي لكسر موجة الرغبة"}</div>
      <Button onClick={() => { setRunning(true); setSecs(180); setPhase("in"); phaseLeftRef.current = 4; }}
        disabled={running} className="mt-4 bg-cyan-600 hover:bg-cyan-500">
        {running ? "جاري التنفس…" : "ابدأ التحدي"}
      </Button>
    </div>
  );
}

// ============ DOPAMINE ============
function DopamineGen() {
  const [task, setTask] = useState<string | null>(null);
  return (
    <div className="text-center">
      <Button onClick={() => setTask(DOPAMINE[Math.floor(Math.random() * DOPAMINE.length)])}
        className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold">
        اكسر الملل (توليد مهمة عشوائية)
      </Button>
      {task && (
        <div key={task} className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-100 animate-in fade-in slide-in-from-bottom-2 duration-500">
          ✨ {task}
        </div>
      )}
    </div>
  );
}

// ============ RECOVERY TIMELINE ============
function RecoveryTimeline({ days }: { days: number }) {
  const phases = [
    { range: [0, 3], title: "أيام 1-3 · المرحلة الحادة", text: "ذروة خروج النيكوتين. قد تشعر بصداع وتوتر. هذا صراخ الإدمان وهو يموت. اشرب الكثير من الماء." },
    { range: [4, 7], title: "أيام 4-7 · مرحلة التنظيف", text: "الأهداب التنفسية تستيقظ. قد تلاحظ زيادة في السعال لطرد المخاط. هذه علامة ممتازة للتعافي." },
    { range: [8, 28], title: "أسبوع 2-4 · مرحلة التوازن", text: "انخفاض هائل في الرغبات الملحة. ستلاحظ تحسناً كبيراً في جودة النوم والنشاط البدني." },
  ];
  return (
    <ol className="space-y-3">
      {phases.map((p, i) => {
        const active = days >= p.range[0] && days <= p.range[1];
        const past = days > p.range[1];
        return (
          <li key={i} className={`rounded-xl border p-4 flex gap-3 ${
            active ? "border-cyan-400 bg-cyan-500/10" : past ? "border-emerald-700/40 bg-emerald-500/5 opacity-80" : "border-slate-800 bg-slate-950/40 opacity-60"
          }`}>
            <div className={`mt-1 h-3 w-3 rounded-full ${active ? "bg-cyan-400 animate-pulse" : past ? "bg-emerald-500" : "bg-slate-600"}`} />
            <div>
              <div className="font-bold text-sm">{p.title}</div>
              <div className="text-sm text-slate-300 leading-7 mt-1">{p.text}</div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ============ NRT ============
function NrtTracker({ nrt, onChange }: { nrt: { log_date: string; taken: boolean }[]; onChange: () => void }) {
  const logNrt = useServerFn(dtxLogNrt);
  const today = new Date().toISOString().slice(0, 10);
  const todayRow = nrt.find((n) => n.log_date === today);
  const [using, setUsing] = useState(nrt.length > 0);
  const takenDays = nrt.filter((n) => n.taken).length;

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm text-slate-200">
        <Checkbox checked={using} onCheckedChange={(v) => setUsing(!!v)} />
        هل تستخدم لصقات، علكة، أو أدوية طبية مساعدة؟
      </label>
      {using && (
        <>
          <label className="flex items-center gap-2 text-sm text-slate-200 rounded-lg border border-slate-800 bg-slate-950/40 p-3">
            <Checkbox
              checked={!!todayRow?.taken}
              onCheckedChange={async (v) => {
                try { await logNrt({ data: { log_date: today, taken: !!v } }); onChange(); }
                catch (e) { toast.error(e instanceof Error ? e.message : "خطأ"); }
              }}
            />
            تم أخذ جرعة اليوم.
          </label>
          <div className="text-xs text-slate-400">تم تسجيل {takenDays} يوم.</div>
          {takenDays >= 28 && (
            <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-100">
              لقد أتممت 4 أسابيع بنجاح. حان الوقت لاستشارة طبيبك لخفض الجرعة إلى المستوى التالي (Step-down).
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============ HALT HEATMAP ============
function HaltHeatmap({ halt }: { halt: { trigger_type: HaltKey; created_at: string }[] }) {
  const data = useMemo(() => {
    const counts: Record<HaltKey, number> = { hungry: 0, angry: 0, lonely: 0, tired: 0 };
    halt.forEach((h) => { counts[h.trigger_type] = (counts[h.trigger_type] || 0) + 1; });
    return (Object.keys(counts) as HaltKey[]).map((k) => ({ name: HALT_LABELS[k].split(" ")[1] || HALT_LABELS[k], value: counts[k] }));
  }, [halt]);

  if (halt.length === 0) {
    return <div className="text-sm text-slate-400 text-center py-6">استخدم زر (أواجه رغبة الآن) ليقوم النظام بتحليل نمط إدمانك هنا.</div>;
  }
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} />
          <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} allowDecimals={false} />
          <RTooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0" }} />
          <Bar dataKey="value" fill="url(#dtxBar)" radius={[6, 6, 0, 0]} />
          <defs>
            <linearGradient id="dtxBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#0e7490" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============ SLIP INTERCEPT ============
function SlipIntercept({ slips, onChange }: { slips: { reason: SlipKey; created_at: string }[]; onChange: () => void }) {
  const logSlip = useServerFn(dtxLogSlip);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<SlipKey>("work_stress");

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline"
        className="w-full border-amber-500/40 bg-amber-500/5 text-amber-200 hover:bg-amber-500/10">
        هل زلت قدمك ودخنت؟ (اضغط هنا ولا تحبط)
      </Button>
      <div className="mt-3 text-xs text-slate-400">عدد الزلات المسجلة: {slips.length}</div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl" className="bg-slate-900 border-slate-700 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-right">لا تجلد ذاتك. الزلة ليست سقوطاً.</DialogTitle>
          </DialogHeader>
          <p className="text-sm leading-7 text-slate-300">
            التعافي رحلة، والزلة هي مجرد معلومة تخبرنا بوجود ثغرة يجب سدها. أنت لم تفقد كل ما بنيته. دعنا نحلل ما حدث.
          </p>
          <div>
            <div className="text-sm mb-2">ما الذي دفعك للزلة؟</div>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(SLIP_LABELS) as SlipKey[]).map((k) => (
                <button key={k} onClick={() => setReason(k)}
                  className={`rounded-lg border px-3 py-2 text-sm ${reason === k ? "border-amber-400 bg-amber-500/10 text-amber-200" : "border-slate-700 bg-slate-950"}`}>
                  {SLIP_LABELS[k]}
                </button>
              ))}
            </div>
          </div>
          <Button
            onClick={async () => {
              try {
                await logSlip({ data: { reason } });
                toast.success("تم تسجيل الثغرة. استعد تركيزك. جسدك لا يزال نظيفاً بنسبة 99%. لا تدخن السيجارة الثانية.", { duration: 8000 });
                setOpen(false); onChange();
              } catch (e) { toast.error(e instanceof Error ? e.message : "خطأ"); }
            }}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
          >
            سجل الزلة، وسأكمل طريقي فوراً
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ============ SOS ============
function SosButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}
        className="w-full rounded-2xl border border-red-500/50 bg-gradient-to-br from-red-950/60 to-red-900/40 p-5 text-red-100 hover:from-red-900/70 transition flex items-center justify-center gap-2 font-bold">
        <AlertOctagon className="h-5 w-5" />
        أنا على وشك الانهيار (طوارئ قصوى)
      </button>
      {open && (
        <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-lg flex items-center justify-center p-6" dir="rtl">
          <div className="max-w-md w-full rounded-2xl border-2 border-red-500 bg-gradient-to-br from-red-950 to-black p-6 text-center space-y-4 animate-in zoom-in-95 duration-300">
            <Flame className="h-12 w-12 text-red-400 mx-auto" />
            <h2 className="text-2xl font-extrabold text-red-100">توقف فوراً! عقلك يخدعك الآن.</h2>
            <p className="text-sm leading-7 text-red-50/90">
              أعلم أنك تتألم الآن، وعقلك يخبرك أن سيجارة واحدة لن تضر. هذا فخ فسيولوجي بحت.
              السيجارة الواحدة ستوقظ كل الخلايا النائمة وستعيدك لنقطة الصفر. ضع ما في يدك فوراً.
              أنت قائد لا تُسيره الكيماويات.
            </p>
            <Button onClick={() => setOpen(false)} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold">
              لقد تراجعت، أنا أقوى من هذا (إغلاق)
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

// ============ HALT FAB ============
function HaltFab({ onLogged }: { onLogged: () => void }) {
  const logHalt = useServerFn(dtxLogHalt);
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}
        className="fixed bottom-5 left-5 z-40 rounded-full bg-gradient-to-br from-cyan-400 to-teal-600 px-5 py-3 text-sm font-bold text-slate-950 shadow-2xl shadow-cyan-500/30 hover:scale-105 transition">
        ⚡ أواجه رغبة الآن!
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl" className="bg-slate-900 border-slate-700 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-right">توقف لحظة. ماذا تشعر في جسدك الآن؟ (HALT)</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-2">
            {(Object.keys(HALT_LABELS) as HaltKey[]).map((k) => (
              <button key={k}
                onClick={async () => {
                  try {
                    await logHalt({ data: { trigger_type: k } });
                    toast.message(HALT_TOASTS[k], { duration: 8000 });
                    setOpen(false); onLogged();
                  } catch (e) { toast.error(e instanceof Error ? e.message : "خطأ"); }
                }}
                className="rounded-lg border border-slate-700 bg-slate-950 hover:border-cyan-500 hover:bg-cyan-500/10 px-4 py-3 text-right">
                <div className="font-semibold text-cyan-200">{HALT_LABELS[k]}</div>
                <div className="text-xs text-slate-400 mt-0.5">{HALT_TOASTS[k]}</div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
