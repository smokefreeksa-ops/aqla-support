import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Send, Loader2, AlertTriangle } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { startQuitPlan, saveAnswer, finalizeQuitPlan } from "@/lib/quit-plan.functions";
import type { QuitProduct, QuitGoal, ReadinessStage } from "@/lib/quit-plan-builder";

type Msg = { role: "user" | "assistant"; content: string };
type Choice = { label: string; value: string };

interface Step {
  key: string;
  prompt: string;
  type: "text" | "email" | "number" | "choice" | "multi" | "date" | "skip-or-text";
  choices?: Choice[];
  validate?: (v: string) => string | null; // return error msg or null
  optional?: boolean;
  when?: (s: State) => boolean;
}

interface State {
  nickname: string;
  email: string;
  city: string;
  age?: number;
  product: QuitProduct;
  readiness: ReadinessStage;
  goal: QuitGoal;
  quit_date?: string;
  triggers: string[];
  support_name?: string;
  support_relation?: string;
  followup_preference?: "email" | "whatsapp" | "none";
  assessment_answers: Record<string, unknown>;
  emergency_consent?: boolean;
}

const SESSION_KEY = "aqla_quit_plan_session_v1";
const PROGRESS_KEY = "aqla_quit_plan_progress_v1";

function getOrCreateAnonId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `anon_${crypto.randomUUID()}`;
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

// Emergency & safety detection
const EMERGENCY_PATTERNS = [
  /ألم\s*شديد\s*في\s*الصدر/i,
  /ضيق\s*تنفس/i,
  /إغماء/i,
  /سعال\s*دم/i,
  /أؤذي\s*نفسي/i,
  /انتحار/i,
];
const DOSE_PATTERNS = [/كم\s*جرعة/i, /كم\s*حبة/i, /كم\s*ملغ/i, /جرعة\s*(لصقة|علكة|شامبكس|بوبروبيون|champix|varenicline|bupropion)/i];

function checkSafety(text: string): string | null {
  if (EMERGENCY_PATTERNS.some((r) => r.test(text))) {
    return "⚠️ إذا كنت تواجه ألمًا شديدًا في الصدر، أو ضيق تنفس حاد، أو إغماء، أو سعال دم، أو أفكار لإيذاء النفس — توجّه فورًا لأقرب طوارئ أو اتصل بالإسعاف 997. هذه الخطة التوعوية لا تغني عن الرعاية الطارئة.";
  }
  if (DOSE_PATTERNS.some((r) => r.test(text))) {
    return "أقلع لا يحدّد جرعات دوائية. اختيار المنتج أو الجرعة المناسبة يحتاج مراجعة صيدلي أو طبيب. يمكنك سؤال صيدلي الحي أو طبيبك مباشرة.";
  }
  return null;
}

// FTND questions
const FTND_QS: Step[] = [
  {
    key: "ftnd_q1",
    prompt: "بعد كم من الاستيقاظ تدخّن أول سيجارة؟",
    type: "choice",
    choices: [
      { label: "خلال 5 دقائق", value: "3" },
      { label: "6 – 30 دقيقة", value: "2" },
      { label: "31 – 60 دقيقة", value: "1" },
      { label: "أكثر من 60 دقيقة", value: "0" },
    ],
  },
  { key: "ftnd_q2", prompt: "هل تجد صعوبة في الامتناع عن التدخين في الأماكن الممنوعة؟", type: "choice", choices: [{ label: "نعم", value: "1" }, { label: "لا", value: "0" }] },
  { key: "ftnd_q3", prompt: "أي سيجارة يصعب عليك تركها أكثر؟", type: "choice", choices: [{ label: "أول سيجارة في الصباح", value: "1" }, { label: "أي سيجارة أخرى", value: "0" }] },
  { key: "ftnd_q4", prompt: "كم سيجارة في اليوم؟", type: "choice", choices: [{ label: "10 أو أقل", value: "0" }, { label: "11 – 20", value: "1" }, { label: "21 – 30", value: "2" }, { label: "31 فأكثر", value: "3" }] },
  { key: "ftnd_q5", prompt: "هل تدخّن في الساعات الأولى أكثر من بقية اليوم؟", type: "choice", choices: [{ label: "نعم", value: "1" }, { label: "لا", value: "0" }] },
  { key: "ftnd_q6", prompt: "هل تدخّن حتى عندما تكون مريضًا في الفراش؟", type: "choice", choices: [{ label: "نعم", value: "1" }, { label: "لا", value: "0" }] },
];

const PSECDI_QS: Step[] = [
  { key: "ps_q1", prompt: "كم مرة تستخدم الفيب في اليوم؟", type: "choice", choices: [
    { label: "0", value: "0" }, { label: "1 – 4", value: "0" }, { label: "5 – 9", value: "1" }, { label: "10 – 14", value: "2" }, { label: "15 أو أكثر", value: "3" },
  ] },
  { key: "ps_q2", prompt: "بعد كم من الاستيقاظ تستخدم الفيب لأول مرة؟", type: "choice", choices: [
    { label: "أكثر من 60 دقيقة", value: "0" }, { label: "31 – 60 دقيقة", value: "1" }, { label: "6 – 30 دقيقة", value: "2" }, { label: "خلال 5 دقائق", value: "3" },
  ] },
  { key: "ps_q3", prompt: "هل تستخدم الفيب الآن لأنه يصعب الإقلاع؟", type: "choice", choices: [{ label: "نعم", value: "1" }, { label: "لا", value: "0" }] },
  { key: "ps_q4", prompt: "هل تشتهي الفيب أحيانًا؟", type: "choice", choices: [{ label: "نعم", value: "1" }, { label: "لا", value: "0" }] },
  { key: "ps_q5", prompt: "هل تشعر بالحاجة الماسّة للفيب؟", type: "choice", choices: [{ label: "نعم", value: "true" }, { label: "لا", value: "false" }] },
  { key: "ps_q6", prompt: "هل يصعب عليك الامتناع في الأماكن الممنوعة؟", type: "choice", choices: [{ label: "نعم", value: "true" }, { label: "لا", value: "false" }] },
  { key: "ps_q7", prompt: "عند الامتناع، هل تصبح أكثر تهيّجًا؟", type: "choice", choices: [{ label: "نعم", value: "true" }, { label: "لا", value: "false" }] },
  { key: "ps_q8", prompt: "أكثر قلقًا؟", type: "choice", choices: [{ label: "نعم", value: "true" }, { label: "لا", value: "false" }] },
  { key: "ps_q9", prompt: "أكثر تململًا؟", type: "choice", choices: [{ label: "نعم", value: "true" }, { label: "لا", value: "false" }] },
  { key: "ps_q10", prompt: "أكثر جوعًا؟", type: "choice", choices: [{ label: "نعم", value: "true" }, { label: "لا", value: "false" }] },
];

const LWDS_QS: Step[] = Array.from({ length: 11 }, (_, i) => ({
  key: `lwds_q${i + 1}`,
  prompt: `سؤال ${i + 1} من 11 — مقياس اعتماد الشيشة: ما مدى انطباق العبارة عليك؟`,
  type: "choice" as const,
  choices: [
    { label: "لا تنطبق (0)", value: "0" },
    { label: "نادرًا (1)", value: "1" },
    { label: "أحيانًا (2)", value: "2" },
    { label: "كثيرًا (3)", value: "3" },
  ],
}));

const POUCHES_QS: Step[] = [
  { key: "op_q1", prompt: "هل تستخدمها يوميًا؟", type: "choice", choices: [{ label: "نعم", value: "true" }, { label: "لا", value: "false" }] },
  { key: "op_q2", prompt: "هل تستخدمها خلال أول 30 دقيقة بعد الاستيقاظ؟", type: "choice", choices: [{ label: "نعم", value: "true" }, { label: "لا", value: "false" }] },
  { key: "op_q3", prompt: "هل تشعر بالقلق إذا لم تتوفر؟", type: "choice", choices: [{ label: "نعم", value: "true" }, { label: "لا", value: "false" }] },
  { key: "op_q4", prompt: "هل حاولت التقليل وفشلت؟", type: "choice", choices: [{ label: "نعم", value: "true" }, { label: "لا", value: "false" }] },
  { key: "op_q5", prompt: "هل تستخدمها في الأماكن الممنوعة؟", type: "choice", choices: [{ label: "نعم", value: "true" }, { label: "لا", value: "false" }] },
  { key: "op_q6", prompt: "هل ازداد عدد الأكياس اليومي مع الوقت؟", type: "choice", choices: [{ label: "نعم", value: "true" }, { label: "لا", value: "false" }] },
];

const HONC_QS: Step[] = Array.from({ length: 10 }, (_, i) => ({
  key: `honc_q${i + 1}`,
  prompt: `سؤال ${i + 1} من 10 — هل شعرت بفقدان السيطرة على الاستخدام؟`,
  type: "choice" as const,
  choices: [{ label: "نعم", value: "true" }, { label: "لا", value: "false" }],
}));

function assessmentSteps(product: QuitProduct, age?: number): Step[] {
  if (product === "youth" || (age && age < 18)) return HONC_QS;
  if (product === "cigarettes") return FTND_QS;
  if (product === "vape") return PSECDI_QS;
  if (product === "shisha") return LWDS_QS;
  if (product === "pouches") return POUCHES_QS;
  return FTND_QS;
}

function normalizeAssessment(product: QuitProduct, age: number | undefined, raw: Record<string, string>): Record<string, unknown> {
  const useYouth = product === "youth" || (age && age < 18);
  if (useYouth) {
    const out: Record<string, boolean> = {};
    for (let i = 1; i <= 10; i++) out[`q${i}`] = raw[`honc_q${i}`] === "true";
    return out;
  }
  switch (product) {
    case "cigarettes": {
      const o: Record<string, number> = {};
      for (let i = 1; i <= 6; i++) o[`q${i}`] = Number(raw[`ftnd_q${i}`] ?? 0);
      return o;
    }
    case "vape": {
      const o: Record<string, number | boolean> = {};
      for (let i = 1; i <= 4; i++) o[`q${i}`] = Number(raw[`ps_q${i}`] ?? 0);
      for (let i = 5; i <= 10; i++) o[`q${i}`] = raw[`ps_q${i}`] === "true";
      return o;
    }
    case "shisha": {
      const o: Record<string, number> = {};
      for (let i = 1; i <= 11; i++) o[`q${i}`] = Number(raw[`lwds_q${i}`] ?? 0);
      return o;
    }
    case "pouches": {
      const o: Record<string, boolean> = {};
      for (let i = 1; i <= 6; i++) o[`q${i}`] = raw[`op_q${i}`] === "true";
      return o;
    }
    default:
      return {};
  }
}

const TRIGGER_OPTIONS = [
  "بعد الأكل",
  "مع القهوة",
  "السهر",
  "التوتر",
  "الفراغ",
  "الأصدقاء المدخنون",
  "السيارة",
  "بعد الصلاة",
  "العمل",
];

export function QuitPlanChat() {
  const navigate = useNavigate();
  const startFn = useServerFn(startQuitPlan);
  const saveFn = useServerFn(saveAnswer);
  const finalizeFn = useServerFn(finalizeQuitPlan);

  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "أهلًا بك في مركز أقلع لدعم الإقلاع. سأرافقك خطوة بخطوة لبناء خطتك الشخصية. لن أصف لك دواء ولا أحدد جرعة، فقط دعم وتنظيم. تقدر تبدأ بأي وقت 💚",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [planId, setPlanId] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [emergency, setEmergency] = useState<string | null>(null);
  const [state, setState] = useState<State>(() => {
    if (typeof window === "undefined") return defaultState();
    try {
      const raw = localStorage.getItem(PROGRESS_KEY);
      if (raw) return { ...defaultState(), ...JSON.parse(raw) };
    } catch { /* ignore */ }
    return defaultState();
  });
  const [rawAssessment, setRawAssessment] = useState<Record<string, string>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  function defaultState(): State {
    return {
      nickname: "",
      email: "",
      city: "",
      product: "cigarettes",
      readiness: "quit_prepare",
      goal: "quit_full",
      triggers: [],
      followup_preference: "email",
      assessment_answers: {},
    };
  }

  useEffect(() => {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(state));
    } catch { /* ignore */ }
  }, [state]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const buildSteps = (st: State): Step[] => {
    const aQs = assessmentSteps(st.product, st.age);
    const base: Step[] = [
      { key: "nickname", prompt: "وش الاسم أو الكنية اللي تحب أناديك فيها؟", type: "text", validate: (v) => (v.trim().length < 1 ? "اكتب الاسم من فضلك." : null) },
      { key: "email", prompt: "إيش إيميلك؟ (نرسل لك نسخة من الخطة)", type: "email", validate: (v) => (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) ? null : "صيغة الإيميل غير صحيحة.") },
      { key: "city", prompt: "من أي مدينة؟", type: "text", validate: (v) => (v.trim().length < 1 ? "اكتب المدينة من فضلك." : null) },
      {
        key: "product",
        prompt: "إيش المنتج الأساسي الذي تستخدمه؟",
        type: "choice",
        choices: [
          { label: "سجائر", value: "cigarettes" },
          { label: "فيب / سجائر إلكترونية", value: "vape" },
          { label: "شيشة / معسل", value: "shisha" },
          { label: "أكياس نيكوتين فموية", value: "pouches" },
          { label: "تقييم الشباب / فقدان السيطرة", value: "youth" },
          { label: "أخرى", value: "other" },
        ],
      },
      { key: "age", prompt: "كم عمرك؟ (اختياري، يساعد على اختيار الأداة المناسبة)", type: "number", optional: true },
      ...aQs,
      {
        key: "readiness",
        prompt: "وين تشوف نفسك الحين؟",
        type: "choice",
        choices: [
          { label: "مستعد للإقلاع الآن", value: "quit_now" },
          { label: "أستعد للإقلاع قريبًا", value: "quit_prepare" },
          { label: "أرغب بالتقليل أولًا", value: "reduce_first" },
          { label: "غير جاهز الآن، أبي أفهم وضعي", value: "not_ready_score" },
          { label: "أرغب بمناقشة البدائل", value: "discuss_alternatives" },
        ],
      },
      {
        key: "goal",
        prompt: "إيش هدفك من الخطة؟",
        type: "choice",
        choices: [
          { label: "الإقلاع تمامًا", value: "quit_full" },
          { label: "التقليل أولًا", value: "reduce_first" },
          { label: "فهم الوضع", value: "understand" },
        ],
      },
      { key: "quit_date", prompt: "متى تنوي تاريخ الإقلاع أو بدء التقليل؟ (YYYY-MM-DD، أو اكتب 'تخطّي')", type: "skip-or-text", optional: true },
      { key: "triggers", prompt: "إيش أكثر المثيرات اللي ترجّعك للاستخدام؟ (اختر/اكتب، فاصلة بين كل واحد)", type: "multi", choices: TRIGGER_OPTIONS.map((t) => ({ label: t, value: t })) },
      { key: "support_name", prompt: "اسم شخص الدعم (اختياري — اكتب 'تخطّي')", type: "skip-or-text", optional: true },
      { key: "support_relation", prompt: "علاقتك به (اختياري — اكتب 'تخطّي')", type: "skip-or-text", optional: true, when: (s) => Boolean(s.support_name) },
      {
        key: "followup_preference",
        prompt: "كيف تحب نتابع معك؟",
        type: "choice",
        choices: [
          { label: "إيميل", value: "email" },
          { label: "واتساب (رابط wa.me)", value: "whatsapp" },
          { label: "بدون متابعة", value: "none" },
        ],
      },
      {
        key: "consent",
        prompt: "تأكيد أخير: الخطة توعوية ولا تستبدل الطبيب أو الصيدلي. هل توافق على بدء الخطة؟",
        type: "choice",
        choices: [
          { label: "موافق، أنشئ الخطة", value: "yes" },
          { label: "لا، أرجع لاحقًا", value: "no" },
        ],
      },
    ];
    return base.filter((s) => !s.when || s.when(state));
  }, [state]);

  const current = steps[stepIndex];

  // Initial prompt on first render
  useEffect(() => {
    if (messages.length === 1 && current) {
      setMessages((m) => [...m, { role: "assistant", content: current.prompt }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function persistAnswer(key: string, value: unknown) {
    if (!planId) return;
    try {
      await saveFn({ data: { planId, key, value } });
    } catch { /* best effort */ }
  }

  async function ensurePlan(s: State) {
    if (planId) return planId;
    const anon = getOrCreateAnonId();
    const res = await startFn({
      data: {
        nickname: s.nickname,
        email: s.email,
        city: s.city,
        product: s.product,
        age: s.age,
        anonymousSessionId: anon,
      },
    });
    setPlanId(res.planId);
    return res.planId;
  }

  async function advance(userText: string, displayLabel?: string) {
    if (!current) return;
    const safety = checkSafety(userText);
    if (safety) {
      setEmergency(safety);
      setMessages((m) => [...m, { role: "user", content: displayLabel ?? userText }, { role: "assistant", content: safety }]);
      return;
    }

    const value = userText.trim();
    if (current.type !== "skip-or-text" && current.validate) {
      const err = current.validate(value);
      if (err) {
        setMessages((m) => [...m, { role: "user", content: displayLabel ?? value }, { role: "assistant", content: err }]);
        return;
      }
    }

    // Update state based on current.key
    const next: State = { ...state };
    let savePromise: Promise<unknown> | null = null;
    const rawA = { ...rawAssessment };

    switch (current.key) {
      case "nickname": next.nickname = value; break;
      case "email": next.email = value; break;
      case "city": next.city = value; break;
      case "product": next.product = value as QuitProduct; break;
      case "age": next.age = value && value !== "تخطّي" ? Number(value) : undefined; break;
      case "readiness": next.readiness = value as ReadinessStage; break;
      case "goal": next.goal = value as QuitGoal; break;
      case "quit_date":
        next.quit_date = value && value !== "تخطّي" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
        break;
      case "triggers":
        next.triggers = value.split(",").map((s) => s.trim()).filter(Boolean);
        break;
      case "support_name":
        next.support_name = value && value !== "تخطّي" ? value : undefined;
        break;
      case "support_relation":
        next.support_relation = value && value !== "تخطّي" ? value : undefined;
        break;
      case "followup_preference":
        next.followup_preference = value as State["followup_preference"];
        break;
      case "consent":
        if (value !== "yes") {
          setMessages((m) => [...m, { role: "user", content: displayLabel ?? "لا" }, { role: "assistant", content: "تمام، لا ضغط. تقدر ترجع متى تجهز 💚" }]);
          return;
        }
        break;
      default:
        if (current.key.startsWith("ftnd_") || current.key.startsWith("ps_") || current.key.startsWith("lwds_") || current.key.startsWith("op_") || current.key.startsWith("honc_")) {
          rawA[current.key] = value;
          setRawAssessment(rawA);
        }
    }

    setState(next);
    setMessages((m) => [...m, { role: "user", content: displayLabel ?? value }]);
    setInput("");

    // After basic 4 fields collected, create plan row
    if (!planId && next.nickname && next.email && next.city && current.key === "product") {
      try {
        const id = await ensurePlan(next);
        await saveFn({ data: { planId: id, key: current.key, value } });
      } catch (e) {
        console.error(e);
      }
    } else if (planId) {
      savePromise = persistAnswer(current.key, value);
    }

    // If finishing consent, finalize
    if (current.key === "consent" && value === "yes") {
      setBusy(true);
      try {
        const id = planId ?? (await ensurePlan(next));
        const assessment_answers = normalizeAssessment(next.product, next.age, rawA);
        const res = await finalizeFn({
          data: {
            planId: id,
            intake: {
              nickname: next.nickname,
              email: next.email,
              city: next.city,
              product: next.product,
              age: next.age,
              readiness: next.readiness,
              goal: next.goal,
              quit_date: next.quit_date ?? null,
              triggers: next.triggers,
              support_person: next.support_name ? { name: next.support_name, relation: next.support_relation } : null,
              followup_preference: next.followup_preference,
              assessment_answers,
            },
          },
        });
        localStorage.removeItem(PROGRESS_KEY);
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: res.userEmailSent
              ? "تم إنشاء خطتك وإرسالها إلى بريدك ✅ تحوّل الآن لعرض الخطة وتحميل PDF."
              : "تم إنشاء الخطة، لكن تعذر إرسال البريد الإلكتروني حاليًا. يمكنك تحميل الخطة PDF أو نسخ الرابط.",
          },
        ]);
        await navigate({ to: "/quit-plan/$planId", params: { planId: res.planId } });
      } catch (e) {
        console.error(e);
        setMessages((m) => [...m, { role: "assistant", content: "صار خطأ تقني أثناء إنشاء الخطة. حاول مرة ثانية، وإذا تكرر، تواصل معنا واتساب." }]);
      } finally {
        setBusy(false);
      }
      if (savePromise) await savePromise.catch(() => null);
      return;
    }

    // Advance step
    const nextIdx = stepIndex + 1;
    setStepIndex(nextIdx);
    const after = computeNextSteps(next)[nextIdx];
    if (after) {
      setMessages((m) => [...m, { role: "assistant", content: after.prompt }]);
    }
    if (savePromise) await savePromise.catch(() => null);
  }

  function computeNextSteps(s: State): Step[] {
    // Same as `steps` memo but using `s` to recompute the list (assessment depends on product/age)
    const aQs = assessmentSteps(s.product, s.age);
    const base: Step[] = [
      { key: "nickname", prompt: "" , type: "text" },
      { key: "email", prompt: "", type: "email" },
      { key: "city", prompt: "", type: "text" },
      { key: "product", prompt: "", type: "choice" },
      { key: "age", prompt: "", type: "number", optional: true },
      ...aQs,
      { key: "readiness", prompt: "", type: "choice" },
      { key: "goal", prompt: "", type: "choice" },
      { key: "quit_date", prompt: "", type: "skip-or-text" },
      { key: "triggers", prompt: "", type: "multi" },
      { key: "support_name", prompt: "", type: "skip-or-text" },
      { key: "support_relation", prompt: "", type: "skip-or-text", when: (st) => Boolean(st.support_name) },
      { key: "followup_preference", prompt: "", type: "choice" },
      { key: "consent", prompt: "", type: "choice" },
    ].filter((step) => !step.when || step.when(s));
    // Use the live `steps` prompts
    return steps.map((real, i) => ({ ...real, prompt: real.prompt })).concat(base.slice(steps.length));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || busy || !current) return;
    advance(input);
  }

  return (
    <div dir="rtl" className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border p-3 text-sm font-semibold text-foreground">
        دردشة خطة أقلع الشخصية
      </div>
      <div ref={scrollRef} className="h-[480px] overflow-y-auto p-4 space-y-3 text-sm">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-start" : "flex justify-end"}>
            <div
              className={
                m.role === "user"
                  ? "max-w-[85%] rounded-2xl bg-primary/10 px-3 py-2 text-foreground"
                  : "max-w-[85%] rounded-2xl bg-muted px-3 py-2 text-foreground leading-7 whitespace-pre-wrap"
              }
            >
              {m.content}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-end">
            <div className="rounded-2xl bg-muted px-3 py-2 text-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}
      </div>
      {emergency && (
        <div className="border-t border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{emergency}</span>
        </div>
      )}
      {current && current.type === "choice" && current.choices && (
        <div className="border-t border-border p-3 flex flex-wrap gap-2">
          {current.choices.map((c) => (
            <button
              key={c.value}
              type="button"
              disabled={busy}
              onClick={() => advance(c.value, c.label)}
              className="rounded-full border border-input bg-background px-3 py-1.5 text-xs hover:bg-accent disabled:opacity-50"
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
      {current && current.type === "multi" && current.choices && (
        <div className="border-t border-border p-3 space-y-2">
          <div className="flex flex-wrap gap-2">
            {current.choices.map((c) => (
              <button
                key={c.value}
                type="button"
                disabled={busy}
                onClick={() => setInput((prev) => (prev ? `${prev}, ${c.value}` : c.value))}
                className="rounded-full border border-input bg-background px-3 py-1 text-xs hover:bg-accent disabled:opacity-50"
              >
                {c.label}
              </button>
            ))}
          </div>
          <form onSubmit={onSubmit} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب أو اختر، ثم أرسل…"
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={busy}
            />
            <button type="submit" disabled={busy || !input.trim()} className="rounded-md bg-primary px-3 py-2 text-primary-foreground disabled:opacity-50">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
      {current && (current.type === "text" || current.type === "email" || current.type === "number" || current.type === "skip-or-text") && (
        <form onSubmit={onSubmit} className="border-t border-border p-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            type={current.type === "number" ? "number" : current.type === "email" ? "email" : "text"}
            placeholder={current.type === "skip-or-text" ? "اكتب الإجابة أو 'تخطّي'" : "اكتب إجابتك…"}
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
            disabled={busy}
          />
          {current.optional && (
            <button type="button" onClick={() => advance("تخطّي")} className="rounded-md border border-input bg-background px-3 py-2 text-xs hover:bg-accent" disabled={busy}>
              تخطّي
            </button>
          )}
          <button type="submit" disabled={busy || !input.trim()} className="rounded-md bg-primary px-3 py-2 text-primary-foreground disabled:opacity-50">
            <Send className="h-4 w-4" />
          </button>
        </form>
      )}
      {!current && (
        <div className="border-t border-border p-3 text-xs text-muted-foreground">
          اكتملت جميع الأسئلة.
        </div>
      )}
    </div>
  );
}
