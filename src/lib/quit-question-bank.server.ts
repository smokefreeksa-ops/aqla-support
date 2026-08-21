// ============================================================
// STEP 5 — server-only question banks for the quit pathway.
// The client only ever sees `{ id, label_ar, label_en }` for options.
// Point values stay here, on the server, and are applied in code.
// ============================================================
import type { Instrument } from "./scoring";

export type ServerOption = {
  id: string;            // opaque id sent to client
  label_ar: string;
  label_en: string;
  // Numeric value used by scoring (FTND, LWDS-11, PSECDI Q1–Q4).
  // For yes/no items we use 1/0.
  value: number;
  // For PSECDI Q1–Q4 only — declarative mapping back to typed answer.
  ps_key?: "q1"| "q2"| "q3"| "q4";
};
export type ServerQuestion = {
  id: string;            // e.g. "ftnd_q1"field: string;         // typed answer field, e.g. "q1"
  prompt_ar: string;
  prompt_en: string;
  kind: "single"| "yesno";
  options: ServerOption[];
};
export type ServerBank = {
  instrument: Instrument;
  title_ar: string;
  title_en: string;
  /** When false, UI MUST display "غير معتمد" and stored row has validated:false. */
  validated: boolean;
  questions: ServerQuestion[];
};

// ---------- FTND (cigarettes) ----------
const FTND_BANK: ServerBank = {
  instrument: "ftnd_cigarettes",
  title_ar: "اختبار فاجرستروم للاعتماد على النيكوتين",
  title_en: "Fagerström Test for Nicotine Dependence (FTND)",
  validated: true,
  questions: [
    {
      id: "ftnd_q1",
      field: "q1",
      prompt_ar: "متى تدخّن أول سيجارة بعد الاستيقاظ؟",
      prompt_en: "When do you smoke your first cigarette after waking?",
      kind: "single",
      options: [
        { id: "le5", label_ar: "خلال ٥ دقائق", label_en: "Within 5 minutes", value: 3 },
        { id: "6_30", label_ar: "٦–٣٠ دقيقة", label_en: "6–30 minutes", value: 2 },
        { id: "31_60", label_ar: "٣١–٦٠ دقيقة", label_en: "31–60 minutes", value: 1 },
        { id: "gt60", label_ar: "بعد ٦٠ دقيقة", label_en: "After 60 minutes", value: 0 },
      ],
    },
    {
      id: "ftnd_q2",
      field: "q2",
      prompt_ar: "هل تجد صعوبة في الامتناع عن التدخين في الأماكن الممنوعة؟",
      prompt_en: "Hard to refrain from smoking in places where it's forbidden?",
      kind: "yesno",
      options: [
        { id: "yes", label_ar: "نعم", label_en: "Yes", value: 1 },
        { id: "no", label_ar: "لا", label_en: "No", value: 0 },
      ],
    },
    {
      id: "ftnd_q3",
      field: "q3",
      prompt_ar: "أي سيجارة يصعب التخلي عنها؟",
      prompt_en: "Which cigarette would you most hate to give up?",
      kind: "single",
      options: [
        { id: "first_morning", label_ar: "الأولى صباحًا", label_en: "The first one in the morning", value: 1 },
        { id: "any_other", label_ar: "أي سيجارة أخرى", label_en: "Any other", value: 0 },
      ],
    },
    {
      id: "ftnd_q4",
      field: "q4",
      prompt_ar: "كم سيجارة تدخّن يوميًا؟",
      prompt_en: "How many cigarettes per day?",
      kind: "single",
      options: [
        { id: "le10", label_ar: "١٠ أو أقل", label_en: "10 or fewer", value: 0 },
        { id: "11_20", label_ar: "١١–٢٠", label_en: "11–20", value: 1 },
        { id: "21_30", label_ar: "٢١–٣٠", label_en: "21–30", value: 2 },
        { id: "gt30", label_ar: "أكثر من ٣٠", label_en: "31 or more", value: 3 },
      ],
    },
    {
      id: "ftnd_q5",
      field: "q5",
      prompt_ar: "هل تدخّن أكثر في الساعات الأولى بعد الاستيقاظ؟",
      prompt_en: "Do you smoke more in the first hours after waking?",
      kind: "yesno",
      options: [
        { id: "yes", label_ar: "نعم", label_en: "Yes", value: 1 },
        { id: "no", label_ar: "لا", label_en: "No", value: 0 },
      ],
    },
    {
      id: "ftnd_q6",
      field: "q6",
      prompt_ar: "هل تدخّن حتى وأنت مريض في الفراش؟",
      prompt_en: "Do you smoke when you're ill in bed?",
      kind: "yesno",
      options: [
        { id: "yes", label_ar: "نعم", label_en: "Yes", value: 1 },
        { id: "no", label_ar: "لا", label_en: "No", value: 0 },
      ],
    },
  ],
};

// ---------- PSECDI (vape) ----------
const PSECDI_BANK: ServerBank = {
  instrument: "ps_ecdi_vape",
  title_ar: "مؤشر بنسلفانيا للاعتماد على السجائر الإلكترونية",
  title_en: "Penn State Electronic Cigarette Dependence Index (PSECDI)",
  validated: true,
  questions: [
    {
      id: "ps_q1",
      field: "q1",
      prompt_ar: "كم مرة في اليوم تستخدم السيجارة الإلكترونية؟",
      prompt_en: "How many times per day do you usually use your e-cig?",
      kind: "single",
      options: [
        { id: "0", label_ar: "صفر", label_en: "0", value: 0 },
        { id: "1-4", label_ar: "١–٤", label_en: "1–4", value: 0 },
        { id: "5-9", label_ar: "٥–٩", label_en: "5–9", value: 1 },
        { id: "10-14", label_ar: "١٠–١٤", label_en: "10–14", value: 2 },
        { id: "15+", label_ar: "١٥ أو أكثر", label_en: "15+", value: 3 },
      ],
    },
    {
      id: "ps_q2",
      field: "q2",
      prompt_ar: "متى تستخدم السيجارة الإلكترونية بعد الاستيقاظ؟",
      prompt_en: "How soon after waking do you first use your e-cig?",
      kind: "single",
      options: [
        { id: ">60", label_ar: "بعد ٦٠ دقيقة", label_en: "After 60 minutes", value: 0 },
        { id: "31-60", label_ar: "٣١–٦٠ دقيقة", label_en: "31–60 minutes", value: 1 },
        { id: "6-30", label_ar: "٦–٣٠ دقيقة", label_en: "6–30 minutes", value: 2 },
        { id: "<=5", label_ar: "خلال ٥ دقائق", label_en: "Within 5 minutes", value: 3 },
      ],
    },
    {
      id: "ps_q3",
      field: "q3",
      prompt_ar: "هل تستخدم السيجارة الإلكترونية لأنه يصعب فعلاً التوقف؟",
      prompt_en: "Do you vape now because it's really hard to quit?",
      kind: "yesno",
      options: [
        { id: "yes", label_ar: "نعم", label_en: "Yes", value: 1 },
        { id: "no", label_ar: "لا", label_en: "No", value: 0 },
      ],
    },
    {
      id: "ps_q4",
      field: "q4",
      prompt_ar: "هل تشعر برغبة شديدة (Craving) لاستخدامها؟",
      prompt_en: "Do you ever crave to use your e-cig?",
      kind: "yesno",
      options: [
        { id: "yes", label_ar: "نعم", label_en: "Yes", value: 1 },
        { id: "no", label_ar: "لا", label_en: "No", value: 0 },
      ],
    },
    {
      id: "ps_q5",
      field: "q5",
      prompt_ar: "هل تشعر أنك تحتاج فعلاً إلى استخدامها؟",
      prompt_en: "Do you feel like you NEED to vape?",
      kind: "yesno",
      options: [
        { id: "yes", label_ar: "نعم", label_en: "Yes", value: 1 },
        { id: "no", label_ar: "لا", label_en: "No", value: 0 },
      ],
    },
    {
      id: "ps_q6",
      field: "q6",
      prompt_ar: "هل يصعب عليك الامتناع عن استخدامها في الأماكن الممنوعة؟",
      prompt_en: "Hard to refrain in places where it's not allowed?",
      kind: "yesno",
      options: [
        { id: "yes", label_ar: "نعم", label_en: "Yes", value: 1 },
        { id: "no", label_ar: "لا", label_en: "No", value: 0 },
      ],
    },
    {
      id: "ps_q7",
      field: "q7",
      prompt_ar: "عند الامتناع، هل تصبح أكثر تهيّجًا؟",
      prompt_en: "When you haven't vaped a while, do you feel more irritable?",
      kind: "yesno",
      options: [
        { id: "yes", label_ar: "نعم", label_en: "Yes", value: 1 },
        { id: "no", label_ar: "لا", label_en: "No", value: 0 },
      ],
    },
    {
      id: "ps_q8",
      field: "q8",
      prompt_ar: "عند الامتناع، هل تشعر بقلق أكبر؟",
      prompt_en: "More anxious?",
      kind: "yesno",
      options: [
        { id: "yes", label_ar: "نعم", label_en: "Yes", value: 1 },
        { id: "no", label_ar: "لا", label_en: "No", value: 0 },
      ],
    },
    {
      id: "ps_q9",
      field: "q9",
      prompt_ar: "عند الامتناع، هل تشعر بعدم الاستقرار؟",
      prompt_en: "More restless?",
      kind: "yesno",
      options: [
        { id: "yes", label_ar: "نعم", label_en: "Yes", value: 1 },
        { id: "no", label_ar: "لا", label_en: "No", value: 0 },
      ],
    },
    {
      id: "ps_q10",
      field: "q10",
      prompt_ar: "عند الامتناع، هل يزداد شعورك بالجوع؟",
      prompt_en: "More hungry?",
      kind: "yesno",
      options: [
        { id: "yes", label_ar: "نعم", label_en: "Yes", value: 1 },
        { id: "no", label_ar: "لا", label_en: "No", value: 0 },
      ],
    },
  ],
};

// ---------- LWDS-11 (shisha/waterpipe) ----------
// Item scoring kept as 0–3 / 0–1 in line with the published instrument.
const yesno1: ServerOption[] = [
  { id: "yes", label_ar: "نعم", label_en: "Yes", value: 1 },
  { id: "no", label_ar: "لا", label_en: "No", value: 0 },
];
const LWDS11_BANK: ServerBank = {
  instrument: "lwds11_waterpipe",
  title_ar: "مقياس الاعتماد على الشيشة/المعسل (LWDS-11)",
  title_en: "Lebanon Waterpipe Dependence Scale (LWDS-11)",
  validated: true,
  questions: [
    {
      id: "lw_q1",
      field: "q1",
      prompt_ar: "كم مرة تدخّن الشيشة أسبوعيًا؟",
      prompt_en: "How often do you smoke waterpipe per week?",
      kind: "single",
      options: [
        { id: "lt1", label_ar: "أقل من مرة", label_en: "<1", value: 0 },
        { id: "1_2", label_ar: "١–٢", label_en: "1–2", value: 1 },
        { id: "3_6", label_ar: "٣–٦", label_en: "3–6", value: 2 },
        { id: "daily", label_ar: "يوميًا", label_en: "Daily", value: 3 },
      ],
    },
    {
      id: "lw_q2",
      field: "q2",
      prompt_ar: "كم رأس معسل في اليوم؟",
      prompt_en: "How many heads per day?",
      kind: "single",
      options: [
        { id: "0", label_ar: "صفر", label_en: "0", value: 0 },
        { id: "1", label_ar: "١", label_en: "1", value: 1 },
        { id: "2", label_ar: "٢", label_en: "2", value: 2 },
        { id: "3+", label_ar: "٣ أو أكثر", label_en: "3+", value: 3 },
      ],
    },
    { id: "lw_q3", field: "q3", prompt_ar: "هل تشعر بحاجة قوية للشيشة عند الاستيقاظ؟", prompt_en: "Strong urge on waking?", kind: "yesno", options: yesno1 },
    { id: "lw_q4", field: "q4", prompt_ar: "هل تجد صعوبة في الامتناع في الأماكن الممنوعة؟", prompt_en: "Hard to refrain where forbidden?", kind: "yesno", options: yesno1 },
    { id: "lw_q5", field: "q5", prompt_ar: "هل تستمر في التدخين رغم المرض؟", prompt_en: "Continue when ill?", kind: "yesno", options: yesno1 },
    { id: "lw_q6", field: "q6", prompt_ar: "هل تشعر بالتوتر إن لم تتمكن من تدخين الشيشة؟", prompt_en: "Tense when can't smoke?", kind: "yesno", options: yesno1 },
    { id: "lw_q7", field: "q7", prompt_ar: "هل أخبرك أحد بضرورة تقليل التدخين؟", prompt_en: "Told you to cut down?", kind: "yesno", options: yesno1 },
    { id: "lw_q8", field: "q8", prompt_ar: "هل حاولت سابقًا التوقف وفشلت؟", prompt_en: "Tried to stop and failed?", kind: "yesno", options: yesno1 },
    { id: "lw_q9", field: "q9", prompt_ar: "هل تفكر في الشيشة كثيرًا خلال اليوم؟", prompt_en: "Think about it often?", kind: "yesno", options: yesno1 },
    { id: "lw_q10", field: "q10", prompt_ar: "هل تشعر بأنك لا تستطيع الاستغناء عنها؟", prompt_en: "Feel you can't do without it?", kind: "yesno", options: yesno1 },
    { id: "lw_q11", field: "q11", prompt_ar: "هل سبق أن سافرت أو تأخّرت لتدخّنها؟", prompt_en: "Travelled/been late to smoke it?", kind: "yesno", options: yesno1 },
  ],
};

// ---------- Oral nicotine / pouches — ADAPTED, NOT VALIDATED ----------
const POUCH_BANK: ServerBank = {
  instrument: "ps_ndi_all_nicotine",
  title_ar: "تقييم مكيّف لمنتجات النيكوتين الفموية (غير معتمد)",
  title_en: "Adapted oral-nicotine screen (not validated)",
  validated: false,
  questions: [
    { id: "pn_q1", field: "q1", prompt_ar: "هل تستخدم الأكياس يوميًا؟", prompt_en: "Use pouches daily?", kind: "yesno", options: yesno1 },
    { id: "pn_q2", field: "q2", prompt_ar: "هل تضع كيسًا خلال ٣٠ دقيقة من الاستيقاظ؟", prompt_en: "Within 30 min of waking?", kind: "yesno", options: yesno1 },
    { id: "pn_q3", field: "q3", prompt_ar: "هل يصعب عليك المرور بساعات دون كيس؟", prompt_en: "Hard to go hours without?", kind: "yesno", options: yesno1 },
    { id: "pn_q4", field: "q4", prompt_ar: "هل تستمر في الاستخدام رغم تأثيرات على الفم/اللثة؟", prompt_en: "Continue despite mouth effects?", kind: "yesno", options: yesno1 },
    { id: "pn_q5", field: "q5", prompt_ar: "هل حاولت التوقف وفشلت؟", prompt_en: "Tried to stop and failed?", kind: "yesno", options: yesno1 },
    { id: "pn_q6", field: "q6", prompt_ar: "هل تشعر بأنك تحتاجه فعلاً للتركيز أو الهدوء؟", prompt_en: "Feel you need it to focus/calm?", kind: "yesno", options: yesno1 },
  ],
};

// ---------- HONC — youth / loss-of-control (10 yes/no) ----------
const HONC_BANK: ServerBank = {
  instrument: "honc_youth",
  title_ar: "قائمة فقدان التحكم مع النيكوتين (HONC)",
  title_en: "Hooked on Nicotine Checklist (HONC)",
  validated: true,
  questions: [
    { id: "honc_q1", field: "q1", prompt_ar: "هل سبق أن حاولت التوقف ولم تستطع؟", prompt_en: "Ever tried to stop and couldn't?", kind: "yesno", options: yesno1 },
    { id: "honc_q2", field: "q2", prompt_ar: "هل تدخّن الآن لأنه يصعب التوقف؟", prompt_en: "Smoke now because hard to stop?", kind: "yesno", options: yesno1 },
    { id: "honc_q3", field: "q3", prompt_ar: "هل شعرت بإدمان على التبغ؟", prompt_en: "Ever felt addicted to tobacco?", kind: "yesno", options: yesno1 },
    { id: "honc_q4", field: "q4", prompt_ar: "هل سبق أن اشتهيت سيجارة بشدة؟", prompt_en: "Strong cravings?", kind: "yesno", options: yesno1 },
    { id: "honc_q5", field: "q5", prompt_ar: "هل شعرت بحاجة فعلية للتدخين؟", prompt_en: "Really needed a cigarette?", kind: "yesno", options: yesno1 },
    { id: "honc_q6", field: "q6", prompt_ar: "هل وجدت صعوبة في الامتناع في الأماكن الممنوعة؟", prompt_en: "Hard to refrain where forbidden?", kind: "yesno", options: yesno1 },
    { id: "honc_q7", field: "q7", prompt_ar: "حين تحاول التوقف، هل تجد صعوبة في التركيز؟", prompt_en: "Hard to concentrate when stopping?", kind: "yesno", options: yesno1 },
    { id: "honc_q8", field: "q8", prompt_ar: "حين تحاول التوقف، هل تشعر بالتهيّج؟", prompt_en: "Irritable when stopping?", kind: "yesno", options: yesno1 },
    { id: "honc_q9", field: "q9", prompt_ar: "حين تحاول التوقف، هل تشعر برغبة قوية بالتدخين؟", prompt_en: "Strong urge when stopping?", kind: "yesno", options: yesno1 },
    { id: "honc_q10", field: "q10", prompt_ar: "حين تحاول التوقف، هل تشعر بقلق أو توتر؟", prompt_en: "Anxious/nervous when stopping?", kind: "yesno", options: yesno1 },
  ],
};

const BANKS: Record<Instrument, ServerBank> = {
  ftnd_cigarettes: FTND_BANK,
  ps_ecdi_vape: PSECDI_BANK,
  lwds11_waterpipe: LWDS11_BANK,
  ps_ndi_all_nicotine: POUCH_BANK,
  honc_youth: HONC_BANK,
};

export function getBank(instrument: Instrument): ServerBank {
  return BANKS[instrument];
}

/** Strip point values before sending to the client. */
export function publicBank(instrument: Instrument) {
  const b = getBank(instrument);
  return {
    instrument: b.instrument,
    title_ar: b.title_ar,
    title_en: b.title_en,
    validated: b.validated,
    questions: b.questions.map((q) => ({
      id: q.id,
      field: q.field,
      prompt_ar: q.prompt_ar,
      prompt_en: q.prompt_en,
      kind: q.kind,
      options: q.options.map((o) => ({ id: o.id, label_ar: o.label_ar, label_en: o.label_en })),
    })),
  };
}

/**
 * Apply selected option ids to a server bank and return the typed answer object
 * that the matching scoring function expects.
 *
 * `selections` is `{ [question.field]: option.id }`.
 *
 * For yes/no items the answer is a boolean.
 * For single-choice items the answer is the option's numeric `value`
 * (this matches the typed answer shapes in `scoring.ts`).
 */
export function buildAnswerObject(
  instrument: Instrument,
  selections: Record<string, string>,
): Record<string, number | boolean> {
  const bank = getBank(instrument);
  const out: Record<string, number | boolean> = {};
  for (const q of bank.questions) {
    const sel = selections[q.field];
    const opt = q.options.find((o) => o.id === sel);
    if (!opt) continue;
    if (q.kind === "yesno") {
      out[q.field] = opt.value === 1;
    } else {
      out[q.field] = opt.value;
    }
  }
  return out;
}
