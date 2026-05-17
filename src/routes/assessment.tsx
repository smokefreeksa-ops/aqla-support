import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useLang, useLangState, LangContext, type Lang } from "@/lib/i18n";
import { submitAssessment, saveFollowUpPreference } from "@/lib/submit.functions";
import { AlertTriangle, ArrowLeft, ArrowRight, ShieldAlert, Languages } from "lucide-react";

export const Route = createFileRoute("/assessment")({
  head: () => ({
    meta: [
      { title: "Nicotine Assessment — Aqla" },
      { name: "description", content: "Complete a brief, confidential nicotine dependence assessment." },
    ],
  }),
  component: AssessmentPage,
});

function AssessmentPage() {
  const ctx = useLangState();
  return (
    <LangContext.Provider value={ctx}>
      <Flow />
    </LangContext.Provider>
  );
}

type State = {
  consent: {
    consent_assessment: boolean;
    consent_contact: boolean;
    consent_educational: boolean;
    consent_service_eval: boolean;
    consent_research: boolean;
    guardian_notice_shown: boolean;
  };
  triage: {
    full_name: string;
    mobile: string;
    email: string;
    age: string;
    date_of_birth: string;
    gender: string;
    city: string;
    affiliation: string;
    preferred_language: Lang;
    preferred_contact: "whatsapp" | "phone" | "sms" | "email";
    self_completing: boolean;
    previously_tried_quit: boolean | null;
    previous_quit_attempts: string;
    main_reason: string;
  };
  products: string[];
  ftnd: { q1: number; q2: number; q3: number; q4: number; q5: number; q6: number };
  nicotine: Record<"q1"|"q2"|"q3"|"q4"|"q5"|"q6"|"q7"|"q8"|"q9"|"q10", boolean>;
  readiness: string;
  riskFlags: string[];
  followUp: string;
  research: {
    enabled: boolean;
    consent_publication: boolean;
    importance_0_10: string;
    confidence_0_10: string;
    main_reason: string;
    ever_tried: boolean | null;
    attempts_count: string;
    longest_quit_duration: string;
  };
};

const PRODUCT_OPTIONS = [
  { key: "cigarettes", en: "Cigarettes", ar: "السجائر" },
  { key: "vape", en: "Vape / e-cigarette", ar: "الفيب / السيجارة الإلكترونية" },
  { key: "shisha", en: "Shisha / hookah", ar: "الشيشة" },
  { key: "pouches", en: "Nicotine pouches", ar: "أكياس النيكوتين" },
  { key: "smokeless", en: "Smokeless tobacco", ar: "التبغ غير المدخّن" },
  { key: "multiple", en: "More than one product", ar: "أكثر من منتج" },
  { key: "former", en: "I used before but stopped", ar: "استخدمت سابقاً وتوقفت" },
  { key: "non_user", en: "I do not currently use — I want to understand my risk", ar: "لا أستخدم حالياً — أريد فهم المخاطر" },
];

const FTND_Q = [
  {
    key: "q1", en: "How soon after waking do you smoke your first cigarette?",
    ar: "بعد كم من الوقت من الاستيقاظ تدخّن أول سيجارة؟",
    opts: [
      { v: 3, en: "Within 5 minutes", ar: "خلال ٥ دقائق" },
      { v: 2, en: "6–30 minutes", ar: "٦–٣٠ دقيقة" },
      { v: 1, en: "31–60 minutes", ar: "٣١–٦٠ دقيقة" },
      { v: 0, en: "After 60 minutes", ar: "بعد ٦٠ دقيقة" },
    ],
  },
  {
    key: "q2", en: "Do you find it difficult to refrain from smoking in places where it is forbidden?",
    ar: "هل يصعب عليك الامتناع عن التدخين في الأماكن الممنوعة؟",
    opts: [
      { v: 1, en: "Yes", ar: "نعم" },
      { v: 0, en: "No", ar: "لا" },
    ],
  },
  {
    key: "q3", en: "Which cigarette would you hate to give up most?",
    ar: "أيُّ سيجارة سيصعب التخلي عنها أكثر؟",
    opts: [
      { v: 1, en: "The first one in the morning", ar: "الأولى في الصباح" },
      { v: 0, en: "Any other", ar: "أيٌّ أخرى" },
    ],
  },
  {
    key: "q4", en: "How many cigarettes per day do you smoke?",
    ar: "كم سيجارة تدخّن يومياً؟",
    opts: [
      { v: 0, en: "10 or fewer", ar: "١٠ أو أقل" },
      { v: 1, en: "11–20", ar: "١١–٢٠" },
      { v: 2, en: "21–30", ar: "٢١–٣٠" },
      { v: 3, en: "31 or more", ar: "٣١ أو أكثر" },
    ],
  },
  {
    key: "q5", en: "Do you smoke more frequently during the first hours after waking?",
    ar: "هل تدخّن بشكل أكثر تكراراً في الساعات الأولى بعد الاستيقاظ؟",
    opts: [
      { v: 1, en: "Yes", ar: "نعم" },
      { v: 0, en: "No", ar: "لا" },
    ],
  },
  {
    key: "q6", en: "Do you smoke even when you are so ill you are in bed most of the day?",
    ar: "هل تدخّن حتى عندما تكون مريضاً وتلازم الفراش؟",
    opts: [
      { v: 1, en: "Yes", ar: "نعم" },
      { v: 0, en: "No", ar: "لا" },
    ],
  },
];

const NIC_Q = [
  { k: "q1", en: "Have you ever tried to stop using nicotine but found that you could not?", ar: "هل حاولت التوقف عن النيكوتين ووجدت أنك لا تستطيع؟" },
  { k: "q2", en: "Do you feel strong cravings or urges to use nicotine?", ar: "هل تشعر برغبة شديدة في استخدام النيكوتين؟" },
  { k: "q3", en: "Do you feel nervous, restless, anxious, or irritable when you cannot use nicotine?", ar: "هل تشعر بالعصبية أو القلق أو الانفعال عندما لا تستطيع استخدامه؟" },
  { k: "q4", en: "Do you use nicotine soon after waking?", ar: "هل تستخدم النيكوتين بعد الاستيقاظ مباشرة؟" },
  { k: "q5", en: "Is it difficult not to use nicotine in restricted places (school, work)?", ar: "هل يصعب الامتناع عنه في الأماكن المقيدة (المدرسة، العمل)؟" },
  { k: "q6", en: "Do you feel you need nicotine to concentrate, relax, or feel normal?", ar: "هل تشعر أنك تحتاجه للتركيز أو الاسترخاء أو الشعور بالطبيعية؟" },
  { k: "q7", en: "Have you increased the amount or frequency of nicotine use over time?", ar: "هل زادت الكمية أو التكرار مع الوقت؟" },
  { k: "q8", en: "Do you continue using nicotine even when worried about your health?", ar: "هل تستمر بالاستخدام رغم قلقك على صحتك؟" },
  { k: "q9", en: "Do you feel addicted or controlled by nicotine?", ar: "هل تشعر بأنك مدمن أو يتحكم بك النيكوتين؟" },
  { k: "q10", en: "Would stopping nicotine feel very difficult for you right now?", ar: "هل التوقف عن النيكوتين يبدو صعباً جداً الآن؟" },
] as const;

const READINESS = [
  { v: "quit_now", en: "I want to quit completely now", ar: "أريد الإقلاع كلياً الآن" },
  { v: "quit_prepare", en: "I want to quit, but I need help preparing", ar: "أريد الإقلاع لكني بحاجة للاستعداد" },
  { v: "reduce_first", en: "I want to reduce first", ar: "أريد التقليل أولاً" },
  { v: "not_ready_score", en: "Not ready to quit, but I want to understand my dependence", ar: "لست جاهزاً للإقلاع، لكن أريد فهم اعتمادي" },
  { v: "discuss_alternatives", en: "I want to discuss nicotine alternatives with a clinician", ar: "أرغب بمناقشة البدائل مع طبيب" },
  { v: "score_only", en: "I only want my score today", ar: "أريد درجتي فقط اليوم" },
  { v: "helping_someone", en: "I am helping someone else", ar: "أساعد شخصاً آخر" },
];

const RISK_OPTS = [
  { v: "under_18", en: "Age under 18", ar: "العمر أقل من ١٨" },
  { v: "pregnancy", en: "Pregnancy", ar: "الحمل" },
  { v: "severe_chest_pain", en: "Severe chest pain", ar: "ألم شديد في الصدر", urgent: true },
  { v: "severe_sob", en: "Severe shortness of breath", ar: "ضيق تنفس شديد", urgent: true },
  { v: "coughing_blood", en: "Coughing blood", ar: "سعال مصحوب بدم", urgent: true },
  { v: "severe_withdrawal", en: "Severe withdrawal symptoms", ar: "أعراض انسحاب شديدة" },
  { v: "mental_health", en: "Mental-health concern or severe anxiety/depression", ar: "قلق صحة نفسية أو اكتئاب شديد" },
  { v: "repeated_failed", en: "Repeated failed quit attempts", ar: "محاولات إقلاع فاشلة متكررة" },
  { v: "multi_product", en: "Using multiple nicotine products", ar: "استخدام أكثر من منتج" },
  { v: "wants_medication", en: "Wants medication or nicotine replacement", ar: "أرغب بأدوية أو بدائل النيكوتين" },
  { v: "wants_alternatives", en: "Wants to discuss nicotine alternatives", ar: "أرغب بمناقشة البدائل" },
  { v: "requests_clinician", en: "Requests clinician review", ar: "أطلب مراجعة الطبيب" },
];

const FOLLOWUP_OPTS = [
  { v: "whatsapp_messages", en: "WhatsApp educational messages", ar: "رسائل تثقيفية على واتساب" },
  { v: "phone_call", en: "Phone call from receptionist", ar: "مكالمة من الاستقبال" },
  { v: "physician_review", en: "Physician review if needed", ar: "مراجعة طبيب عند الحاجة" },
  { v: "email_only", en: "Email only", ar: "بريد إلكتروني فقط" },
  { v: "no_contact", en: "No contact now", ar: "لا تواصل الآن" },
];

const STEP_LABELS: (keyof import("@/lib/i18n").Dict)[] = [
  "stepConsent",
  "stepTriage",
  "stepProducts",
  "stepDependence",
  "stepReadiness",
  "stepRisk",
  "stepResult",
];

type Result = Awaited<ReturnType<typeof submitAssessment>>;

function Flow() {
  const { t, lang, setLang, dir } = useLang();
  const nav = useNavigate();
  const submit = useServerFn(submitAssessment);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const [s, setS] = useState<State>({
    consent: {
      consent_assessment: false, consent_contact: false, consent_educational: false,
      consent_service_eval: false, consent_research: false, guardian_notice_shown: false,
    },
    triage: {
      full_name: "", mobile: "", email: "", age: "", date_of_birth: "", gender: "",
      city: "", affiliation: "", preferred_language: lang, preferred_contact: "whatsapp",
      self_completing: true, previously_tried_quit: null, previous_quit_attempts: "0",
      main_reason: "",
    },
    products: [],
    ftnd: { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, q6: 0 },
    nicotine: { q1:false,q2:false,q3:false,q4:false,q5:false,q6:false,q7:false,q8:false,q9:false,q10:false },
    readiness: "",
    riskFlags: [],
    followUp: "whatsapp_messages",
  });

  const hasCig = s.products.includes("cigarettes");
  const hasNicProduct = ["vape", "pouches", "smokeless", "shisha", "multiple"].some((p) => s.products.includes(p));
  const showDependenceStep = hasCig || hasNicProduct;

  // Step indexes: 0 consent, 1 triage, 2 products, 3 dependence, 4 readiness, 5 risk, 6 result.
  const stepsVisible: number[] = showDependenceStep ? [0, 1, 2, 3, 4, 5, 6] : [0, 1, 2, 4, 5, 6];
  const totalVisible = stepsVisible.length;
  const visibleIndex = Math.max(0, stepsVisible.indexOf(step));
  const progress = ((visibleIndex + 1) / totalVisible) * 100;

  function next() {
    const idx = stepsVisible.indexOf(step);
    const nx = stepsVisible[Math.min(idx + 1, totalVisible - 1)];
    setStep(nx);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function prev() {
    const idx = stepsVisible.indexOf(step);
    setStep(stepsVisible[Math.max(idx - 1, 0)]);
  }

  function toggleProduct(k: string) {
    setS((p) => ({
      ...p,
      products: p.products.includes(k) ? p.products.filter((x) => x !== k) : [...p.products, k],
    }));
  }
  function toggleRisk(k: string) {
    setS((p) => ({
      ...p,
      riskFlags: p.riskFlags.includes(k) ? p.riskFlags.filter((x) => x !== k) : [...p.riskFlags, k],
    }));
  }

  function canAdvance(): string | null {
    if (step === 0) {
      const c = s.consent;
      if (!c.consent_assessment || !c.consent_contact || !c.consent_educational || !c.consent_service_eval) {
        return lang === "ar" ? "يرجى الموافقة على البنود المطلوبة" : "Please accept the required consents";
      }
    }
    if (step === 1) {
      const tr = s.triage;
      if (!tr.full_name.trim() || tr.mobile.trim().length < 5 || !tr.city.trim() || !tr.main_reason) {
        return lang === "ar" ? "يرجى تعبئة الحقول المطلوبة" : "Please complete required fields";
      }
    }
    if (step === 2 && s.products.length === 0) {
      return lang === "ar" ? "اختر منتجاً واحداً على الأقل" : "Select at least one";
    }
    if (step === 4 && !s.readiness) {
      return lang === "ar" ? "اختر خياراً" : "Pick one option";
    }
    return null;
  }

  async function handleNext() {
    const err = canAdvance();
    if (err) { toast.error(err); return; }
    next();
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const ftnd = hasCig ? s.ftnd : null;
      const nicotine = hasNicProduct ? s.nicotine : null;
      const ageNum = s.triage.age ? Number(s.triage.age) : null;
      const r = await submit({
        data: {
          triage: {
            ...s.triage,
            age: ageNum,
            email: s.triage.email || "",
          },
          consent: { ...s.consent, guardian_notice_shown: (ageNum ?? 99) < 18 },
          products: s.products,
          ftnd,
          nicotine,
          readiness: s.readiness as never,
          riskFlags: s.riskFlags,
        },
      });
      setResult(r);
      setStep(6);
      toast.success(lang === "ar" ? "تم حفظ تقييمك" : "Your assessment was saved");
      if (typeof window !== "undefined") window.scrollTo({ top: 0 });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div dir={dir} className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            ← Aqla
          </Link>
          <Button variant="ghost" size="sm" onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="gap-1.5">
            <Languages className="h-4 w-4" />
            {lang === "ar" ? "English" : "العربية"}
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        {step < 6 && (
          <div className="mb-6">
            <Progress value={progress} className="h-2" />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              {STEP_LABELS.map((k, i) => (
                <span key={k} className={i === visibleIndex ? "font-semibold text-primary" : ""}>
                  {t[k]}
                </span>
              ))}
            </div>
          </div>
        )}

        {step === 0 && (
          <Card className="p-5">
            <h2 className="text-xl font-semibold">{t.consentTitle}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t.consentBlurb}</p>
            <div className="mt-4 space-y-3">
              {[
                ["consent_assessment", t.consent1, true],
                ["consent_contact", t.consent2, true],
                ["consent_educational", t.consent3, true],
                ["consent_service_eval", t.consent4, true],
                ["consent_research", t.consent5, false],
              ].map(([key, label, req]) => (
                <label key={key as string} className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/40">
                  <Checkbox
                    checked={s.consent[key as keyof State["consent"]]}
                    onCheckedChange={(v) =>
                      setS((p) => ({ ...p, consent: { ...p.consent, [key as string]: !!v } }))
                    }
                  />
                  <span className="text-sm leading-relaxed">
                    {label as string}
                    {req ? <span className="ml-1 text-destructive">*</span> : null}
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-4 rounded-lg bg-warning/10 border border-warning/30 p-3 text-sm">
              <AlertTriangle className="inline h-4 w-4 mr-1 text-warning" />
              {t.guardianNotice}
            </div>
          </Card>
        )}

        {step === 1 && (
          <Card className="p-5 space-y-4">
            <div>
              <h2 className="text-xl font-semibold">{t.triageTitle}</h2>
            </div>
            <Field label={t.fullName} required>
              <Input value={s.triage.full_name} onChange={(e) => setS((p) => ({ ...p, triage: { ...p.triage, full_name: e.target.value } }))} />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label={t.mobile} required>
                <Input inputMode="tel" value={s.triage.mobile} onChange={(e) => setS((p) => ({ ...p, triage: { ...p.triage, mobile: e.target.value } }))} />
              </Field>
              <Field label={`${t.email} ${t.optional}`}>
                <Input type="email" value={s.triage.email} onChange={(e) => setS((p) => ({ ...p, triage: { ...p.triage, email: e.target.value } }))} />
              </Field>
              <Field label={t.age}>
                <Input type="number" min={8} max={110} value={s.triage.age} onChange={(e) => setS((p) => ({ ...p, triage: { ...p.triage, age: e.target.value } }))} />
              </Field>
              <Field label={`${t.gender} ${t.optional}`}>
                <Select value={s.triage.gender} onValueChange={(v) => setS((p) => ({ ...p, triage: { ...p.triage, gender: v } }))}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{lang === "ar" ? "ذكر" : "Male"}</SelectItem>
                    <SelectItem value="female">{lang === "ar" ? "أنثى" : "Female"}</SelectItem>
                    <SelectItem value="prefer_not">{lang === "ar" ? "أفضل عدم القول" : "Prefer not to say"}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label={t.city} required>
                <Input value={s.triage.city} onChange={(e) => setS((p) => ({ ...p, triage: { ...p.triage, city: e.target.value } }))} />
              </Field>
              <Field label={t.affiliation}>
                <Input value={s.triage.affiliation} onChange={(e) => setS((p) => ({ ...p, triage: { ...p.triage, affiliation: e.target.value } }))} />
              </Field>
              <Field label={t.prefLang}>
                <Select value={s.triage.preferred_language} onValueChange={(v) => setS((p) => ({ ...p, triage: { ...p.triage, preferred_language: v as Lang } }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label={t.prefContact}>
                <Select value={s.triage.preferred_contact} onValueChange={(v) => setS((p) => ({ ...p, triage: { ...p.triage, preferred_contact: v as State["triage"]["preferred_contact"] } }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="phone">{lang === "ar" ? "مكالمة" : "Phone call"}</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <YesNo label={t.selfCompleting} value={s.triage.self_completing} onChange={(v) => setS((p) => ({ ...p, triage: { ...p.triage, self_completing: v } }))} />
            <YesNo label={t.prevTried} value={s.triage.previously_tried_quit ?? false}
              onChange={(v) => setS((p) => ({ ...p, triage: { ...p.triage, previously_tried_quit: v } }))} />
            {s.triage.previously_tried_quit && (
              <Field label={t.prevAttempts}>
                <Select value={s.triage.previous_quit_attempts} onValueChange={(v) => setS((p) => ({ ...p, triage: { ...p.triage, previous_quit_attempts: v } }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2-3">2–3</SelectItem>
                    <SelectItem value=">3">{lang === "ar" ? "أكثر من ٣" : "More than 3"}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            )}
            <Field label={t.mainReason} required>
              <Select value={s.triage.main_reason} onValueChange={(v) => setS((p) => ({ ...p, triage: { ...p.triage, main_reason: v } }))}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="know_score">{lang === "ar" ? "أريد معرفة درجة اعتمادي" : "I want to know my dependence score"}</SelectItem>
                  <SelectItem value="quit_completely">{lang === "ar" ? "أريد الإقلاع كلياً" : "I want to quit completely"}</SelectItem>
                  <SelectItem value="reduce">{lang === "ar" ? "أريد التقليل" : "I want to reduce"}</SelectItem>
                  <SelectItem value="worried_health">{lang === "ar" ? "قلق على صحتي" : "I am worried about my health"}</SelectItem>
                  <SelectItem value="family_advised">{lang === "ar" ? "نصحتني عائلتي/مدرستي" : "Family/school advised me"}</SelectItem>
                  <SelectItem value="discuss_alts">{lang === "ar" ? "مناقشة البدائل مع طبيب" : "Discuss alternatives with a clinician"}</SelectItem>
                  <SelectItem value="other">{lang === "ar" ? "أخرى" : "Other"}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </Card>
        )}

        {step === 2 && (
          <Card className="p-5">
            <h2 className="text-xl font-semibold">{t.productsTitle}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t.productsHint}</p>
            <div className="mt-4 grid gap-2">
              {PRODUCT_OPTIONS.map((p) => (
                <label key={p.key} className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/40">
                  <Checkbox checked={s.products.includes(p.key)} onCheckedChange={() => toggleProduct(p.key)} />
                  <span className="text-sm">{lang === "ar" ? p.ar : p.en}</span>
                </label>
              ))}
            </div>
          </Card>
        )}

        {step === 3 && (
          <div className="space-y-4">
            {hasCig && (
              <Card className="p-5">
                <h2 className="text-xl font-semibold text-primary">{t.cigTitle}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{t.cigSubtitle}</p>
                <div className="mt-4 space-y-5">
                  {FTND_Q.map((q) => (
                    <div key={q.key}>
                      <p className="text-sm font-medium">{lang === "ar" ? q.ar : q.en}</p>
                      <RadioGroup
                        className="mt-2"
                        value={String(s.ftnd[q.key as keyof State["ftnd"]])}
                        onValueChange={(v) => setS((p) => ({ ...p, ftnd: { ...p.ftnd, [q.key]: Number(v) } }))}
                      >
                        {q.opts.map((o, i) => (
                          <label key={i} className="flex items-center gap-2 cursor-pointer rounded p-1.5 hover:bg-muted/40">
                            <RadioGroupItem value={String(o.v)} />
                            <span className="text-sm">{lang === "ar" ? o.ar : o.en}</span>
                          </label>
                        ))}
                      </RadioGroup>
                    </div>
                  ))}
                  <LiveCigScore ftnd={s.ftnd} />
                </div>
              </Card>
            )}
            {hasNicProduct && (
              <Card className="p-5">
                <h2 className="text-xl font-semibold text-secondary">{t.nicTitle}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{t.nicSubtitle}</p>
                <div className="mt-4 space-y-2">
                  {NIC_Q.map((q) => (
                    <div key={q.k} className="flex items-start justify-between gap-3 rounded-lg border p-3">
                      <span className="text-sm">{lang === "ar" ? q.ar : q.en}</span>
                      <div className="flex gap-1">
                        <Button type="button" size="sm" variant={s.nicotine[q.k] ? "default" : "outline"} onClick={() => setS((p) => ({ ...p, nicotine: { ...p.nicotine, [q.k]: true } }))}>{t.yes}</Button>
                        <Button type="button" size="sm" variant={!s.nicotine[q.k] ? "default" : "outline"} onClick={() => setS((p) => ({ ...p, nicotine: { ...p.nicotine, [q.k]: false } }))}>{t.no}</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {step === 4 && (
          <Card className="p-5">
            <h2 className="text-xl font-semibold">{t.readinessTitle}</h2>
            <RadioGroup className="mt-3" value={s.readiness} onValueChange={(v) => setS((p) => ({ ...p, readiness: v }))}>
              {READINESS.map((r) => (
                <label key={r.v} className="flex items-center gap-2 cursor-pointer rounded-lg border p-3 hover:bg-muted/40">
                  <RadioGroupItem value={r.v} />
                  <span className="text-sm">{lang === "ar" ? r.ar : r.en}</span>
                </label>
              ))}
            </RadioGroup>
          </Card>
        )}

        {step === 5 && (
          <Card className="p-5">
            <h2 className="text-xl font-semibold">{t.riskTitle}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t.riskSubtitle}</p>
            <div className="mt-3 grid gap-2">
              {RISK_OPTS.map((r) => (
                <label key={r.v} className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer hover:bg-muted/40 ${r.urgent ? "border-destructive/40" : ""}`}>
                  <Checkbox checked={s.riskFlags.includes(r.v)} onCheckedChange={() => toggleRisk(r.v)} />
                  <span className="text-sm">{lang === "ar" ? r.ar : r.en}</span>
                </label>
              ))}
            </div>
            {s.riskFlags.some((f) => ["severe_chest_pain", "severe_sob", "coughing_blood"].includes(f)) && (
              <div className="mt-3 rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive flex gap-2">
                <ShieldAlert className="h-5 w-5 shrink-0" /> {t.urgentMsg}
              </div>
            )}
          </Card>
        )}

        {step === 6 && result && (
          <ResultView
            result={result}
            products={s.products}
            readiness={s.readiness}
            readinessLabel={READINESS.find((r) => r.v === s.readiness)?.[lang] ?? s.readiness}
            productLabels={s.products.map((k) => {
              const p = PRODUCT_OPTIONS.find((o) => o.key === k);
              return p ? (lang === "ar" ? p.ar : p.en) : k;
            })}
            followOptions={FOLLOWUP_OPTS.map((o) => ({ v: o.v, label: lang === "ar" ? o.ar : o.en }))}
            initialFollow={s.followUp}
            onHome={() => nav({ to: "/" })}
          />
        )}

        {step < 6 && (
          <div className="mt-6 flex items-center justify-between">
            <Button variant="ghost" onClick={prev} disabled={step === 0} className="gap-1">
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t.back}
            </Button>
            {step === 5 ? (
              <Button onClick={handleSubmit} disabled={submitting} className="gap-1">
                {submitting ? t.saving : t.submit}
              </Button>
            ) : (
              <Button onClick={handleNext} className="gap-1">
                {t.next} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">
        {label}
        {required ? <span className="ml-1 text-destructive">*</span> : null}
      </Label>
      {children}
    </div>
  );
}

function YesNo({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  const { t } = useLang();
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
      <span className="text-sm">{label}</span>
      <div className="flex gap-1">
        <Button type="button" size="sm" variant={value ? "default" : "outline"} onClick={() => onChange(true)}>{t.yes}</Button>
        <Button type="button" size="sm" variant={!value ? "default" : "outline"} onClick={() => onChange(false)}>{t.no}</Button>
      </div>
    </div>
  );
}

function LiveCigScore({ ftnd }: { ftnd: State["ftnd"] }) {
  const total = ftnd.q1 + ftnd.q2 + ftnd.q3 + ftnd.q4 + ftnd.q5 + ftnd.q6;
  const pct = (total / 10) * 100;
  return (
    <div className="rounded-2xl border-2 border-primary/20 bg-primary-soft/30 p-4 text-center">
      <div className="text-xs uppercase tracking-wider text-primary font-medium">Live Score</div>
      <div className="mt-1 text-4xl font-bold text-primary">{total}<span className="text-base text-muted-foreground">/10</span></div>
      <Progress value={pct} className="mt-3 h-2" />
    </div>
  );
}

function ResultView({
  result, onHome, products, productLabels, readiness, readinessLabel,
  followOptions, initialFollow,
}: {
  result: Result;
  onHome: () => void;
  products: string[];
  productLabels: string[];
  readiness: string;
  readinessLabel: string;
  followOptions: { v: string; label: string }[];
  initialFollow: string;
}) {
  const { t, lang, dir } = useLang();
  const ftnd = result.ftnd;
  const nic = result.nicotine;
  const saveFollow = useServerFn(saveFollowUpPreference);
  const [follow, setFollow] = useState(initialFollow);
  const [savedFollow, setSavedFollow] = useState<string | null>(null);
  const [savingFollow, setSavingFollow] = useState(false);

  async function commitFollow(value: string) {
    setFollow(value);
    setSavingFollow(true);
    try {
      await saveFollow({
        data: {
          participantId: result.participantId,
          participantCode: result.participantCode,
          preference: value as never,
        },
      });
      setSavedFollow(value);
      toast.success(lang === "ar" ? "تم حفظ تفضيل المتابعة" : "Follow-up preference saved");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSavingFollow(false);
    }
  }

  function downloadSummary() {
    const lines = [
      `Aqla Assessment Summary`,
      `Participant ID: ${result.participantCode}`,
      `Products: ${productLabels.join(", ")}`,
      `Readiness: ${readinessLabel}`,
      `Cohort: ${result.cohort}`,
      `Cohort reason: ${result.cohortReason}`,
      `Doctor review needed: ${result.doctorReviewNeeded ? "Yes" : "No"}`,
      ftnd ? `FTND score: ${ftnd.total}/10 — ${ftnd.category}` : "",
      nic ? `Nicotine control: ${nic.yes_count}/10 — ${nic.category}` : "",
      savedFollow ? `Follow-up preference: ${savedFollow}` : "",
    ].filter(Boolean).join("\n");
    const blob = new Blob([lines], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `aqla_${result.participantCode}.txt`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div dir={dir} className="space-y-4">
      {result.urgent && (
        <Card className="border-destructive bg-destructive/10 p-4 text-destructive">
          <div className="flex gap-2"><ShieldAlert className="h-5 w-5" /> <span>{t.urgentMsg}</span></div>
        </Card>
      )}
      <Card className="p-6 text-center card-gradient">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{t.yourId}</div>
        <div className="mt-1 font-mono text-lg">{result.participantCode}</div>
        <h2 className="mt-4 text-2xl font-bold">{t.resultTitle}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{result.cohortReason}</p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary font-medium">
          {lang === "ar" ? "المسار" : "Cohort"} {result.cohort}
        </div>
      </Card>

      <Card className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-xs text-muted-foreground">{lang === "ar" ? "المنتجات" : "Products"}</div>
          <div className="mt-0.5">{productLabels.join(" • ") || "—"}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{lang === "ar" ? "الجاهزية" : "Readiness"}</div>
          <div className="mt-0.5">{readinessLabel}</div>
        </div>
      </Card>

      {ftnd && (
        <Card className="p-6 text-center">
          <div className="text-xs uppercase tracking-wider text-primary font-medium">{lang === "ar" ? "درجة الاعتماد على السجائر" : "Cigarette Dependence"}</div>
          <div className="my-3 text-6xl font-bold text-primary">{ftnd.total}<span className="text-2xl text-muted-foreground">/10</span></div>
          <Progress value={(ftnd.total / 10) * 100} className="h-3" />
          <div className="mt-3 text-sm font-medium">{ftnd.category}</div>
          <p className="mt-2 text-xs text-muted-foreground">{t.notDiagnosis}</p>
        </Card>
      )}

      {nic && (
        <Card className="p-6 text-center">
          <div className="text-xs uppercase tracking-wider text-secondary font-medium">{lang === "ar" ? "التحكم في النيكوتين" : "Nicotine Control"}</div>
          <div className="my-3 text-6xl font-bold text-secondary">{nic.yes_count}<span className="text-2xl text-muted-foreground">/10</span></div>
          <Progress value={(nic.yes_count / 10) * 100} className="h-3" />
          <div className="mt-3 text-sm font-medium">{nic.category}</div>
        </Card>
      )}

      {result.doctorReviewNeeded && (
        <Card className="border-warning bg-warning/10 p-4">
          <div className="text-sm font-semibold">{t.doctorReview}</div>
          <p className="mt-1 text-sm text-muted-foreground">
            {lang === "ar"
              ? "سيتم توجيه حالتك لمراجعة الطبيب وفقاً لتفضيلات التواصل."
              : "Your case will be routed to clinician review using your preferred contact method."}
          </p>
        </Card>
      )}

      <Card className="p-5">
        <h3 className="text-lg font-semibold">
          {lang === "ar" ? "كيف تفضل أن ندعمك؟" : "How would you like us to support you?"}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {lang === "ar"
            ? "اختر تفضيل المتابعة وسيتم حفظه فوراً."
            : "Pick your follow-up preference — it will be saved immediately."}
        </p>
        <RadioGroup
          className="mt-3"
          value={follow}
          onValueChange={(v) => { if (!savingFollow) commitFollow(v); }}
        >
          {followOptions.map((r) => (
            <label key={r.v} className="flex items-center gap-2 cursor-pointer rounded-lg border p-3 hover:bg-muted/40">
              <RadioGroupItem value={r.v} />
              <span className="text-sm">{r.label}</span>
            </label>
          ))}
        </RadioGroup>
        {savedFollow && (
          <p className="mt-2 text-xs text-success font-medium">
            {lang === "ar" ? "تم الحفظ ✓" : "Saved ✓"}
          </p>
        )}
      </Card>

      <div className="grid gap-2 sm:grid-cols-2">
        <Button variant="outline" onClick={downloadSummary}>{t.downloadPdf}</Button>
        <Button onClick={onHome}>{t.backHome}</Button>
      </div>

      {/* Silence unused warnings — props passed through */}
      <span className="hidden">{products.join(",")}|{readiness}</span>
    </div>
  );
}
