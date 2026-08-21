// Aqla Release 1 — data-driven bilingual question bank.
// Order is declared here; scoring never depends on position.

import type { ClinicalAnswers, ProductKey } from "./types";
import { EMERGENCY_RED_FLAGS } from "./safety";

export type QuestionKind =
  | "text"| "email"| "choice"| "multi"| "scale"| "notice"| "number";

export interface Choice {
  value: string;
  label_ar: string;
  label_en: string;
  score?: number;
}

export interface Question {
  id: keyof ClinicalAnswers | "privacy_ack";
  kind: QuestionKind;
  prompt_ar: (a: ClinicalAnswers) => string;
  prompt_en: string;
  choices?: Choice[];
  /** Health-related items must come after the privacy notice. */
  health: boolean;
  when?: (a: ClinicalAnswers) => boolean;
}

const isCigaretteUser = (a: ClinicalAnswers) => (a.products ?? []).includes("cigarettes");
const hasProduct = (a: ClinicalAnswers, p: ProductKey) => (a.products ?? []).includes(p);

export const PRIVACY_NOTICE_AR = `قبل ما نبدأ الأسئلة الصحية، تحب تعرف التالي:

• بنسألك أسئلة عن استخدامك للنيكوتين وصحتك العامة، وهذا الشيء ضروري عشان نبني لك خطة إقلاع شخصية وآمنة.
• إجاباتك تُستخدم فقط لتوليد خطتك وحفظها لك، ولمتابعتك داخل المنصة.
• مشاركة بياناتك بشكل يعرّف بهويتك مع إدارة أقلع أو لأي غرض بحثي معطّلة تمامًا في هذه النسخة.
• إرسال الخطة على بريدك الإلكتروني اختياري ومنفصل، ويحتاج موافقة صريحة منك في نهاية المحادثة.

(هذه الصياغة أولية وتخضع للمراجعة القانونية ومراجعة نظام حماية البيانات الشخصية قبل الإطلاق العام.)`;

export const QUESTIONS: Question[] = [
  {
    id: "nickname",
    kind: "text",
    health: false,
    prompt_ar: () => "بِسم الله نبدأ.. وش الاسم أو الكنية اللي تحب أناديك فيها؟",
    prompt_en: "What name or nickname should I use for you?",
  },
  {
    id: "jurisdiction",
    kind: "choice",
    health: false,
    prompt_ar: (a) => `حياك الله يا ${a.nickname ?? ""}. وين مكانك حاليًا؟ هذا يساعدني أوجهك للخدمات الصحيحة.`,
    prompt_en: "Where are you currently based?",
    choices: [
      { value: "SA", label_ar: "داخل السعودية", label_en: "In Saudi Arabia" },
      { value: "GENERIC", label_ar: "خارج السعودية", label_en: "Outside Saudi Arabia" },
    ],
  },
  {
    id: "city",
    kind: "text",
    health: false,
    when: (a) => a.jurisdiction === "SA",
    prompt_ar: () => "من أي مدينة تكلمنا؟",
    prompt_en: "Which city are you in?",
  },
  {
    id: "privacy_ack",
    kind: "notice",
    health: false,
    prompt_ar: () => PRIVACY_NOTICE_AR,
    prompt_en: "Privacy notice before health questions.",
    choices: [{ value: "ack", label_ar: "فهمت، نكمل", label_en: "Understood, continue" }],
  },

  // ---------------- health questions start here ----------------
  {
    id: "age_band",
    kind: "choice",
    health: true,
    prompt_ar: () => "كم عمرك تقريبًا؟",
    prompt_en: "What is your age range?",
    choices: [
      { value: "under_18", label_ar: "أقل من 18", label_en: "Under 18" },
      { value: "18_24", label_ar: "18 – 24", label_en: "18–24" },
      { value: "25_39", label_ar: "25 – 39", label_en: "25–39" },
      { value: "40_59", label_ar: "40 – 59", label_en: "40–59" },
      { value: "60_plus", label_ar: "60 فأكثر", label_en: "60+" },
    ],
  },
  {
    id: "sex",
    kind: "choice",
    health: true,
    prompt_ar: () => "الجنس؟ (يساعدنا في تخصيص بعض التوصيات)",
    prompt_en: "Sex?",
    choices: [
      { value: "male", label_ar: "ذكر", label_en: "Male" },
      { value: "female", label_ar: "أنثى", label_en: "Female" },
      { value: "prefer_not", label_ar: "أفضل عدم الإفصاح", label_en: "Prefer not to say" },
    ],
  },
  {
    id: "pregnancy",
    kind: "choice",
    health: true,
    when: (a) => a.sex === "female",
    prompt_ar: () => "هل أنتِ حامل أو مرضعة حاليًا؟",
    prompt_en: "Are you currently pregnant or breastfeeding?",
    choices: [
      { value: "pregnant", label_ar: "حامل", label_en: "Pregnant" },
      { value: "breastfeeding", label_ar: "مرضعة", label_en: "Breastfeeding" },
      { value: "neither", label_ar: "لا", label_en: "Neither" },
    ],
  },
  {
    id: "products",
    kind: "multi",
    health: true,
    prompt_ar: () => "وش المنتجات اللي تستخدمها حاليًا؟ (تقدر تختار أكثر من واحد)",
    prompt_en: "Which products do you currently use?",
    choices: [
      { value: "cigarettes", label_ar: "سجائر", label_en: "Cigarettes" },
      { value: "vape", label_ar: "فيب", label_en: "Vape" },
      { value: "shisha", label_ar: "شيشة / معسل", label_en: "Shisha" },
      { value: "pouches", label_ar: "أكياس نيكوتين", label_en: "Nicotine pouches" },
      { value: "heated", label_ar: "تبغ مسخّن", label_en: "Heated tobacco" },
      { value: "other", label_ar: "غير ذلك", label_en: "Other" },
    ],
  },

  // ---- Descriptive-only use info for non-cigarette products (no scoring) ----
  {
    id: "vape_pattern",
    kind: "choice",
    health: true,
    when: (a) => hasProduct(a, "vape"),
    prompt_ar: () => "بالنسبة للفيب، كيف تصف استخدامك؟",
    prompt_en: "How would you describe your vape use?",
    choices: [
      { value: "all_day", label_ar: "طوال اليوم تقريبًا", label_en: "Most of the day" },
      { value: "after_waking", label_ar: "أول شيء بعد الاستيقاظ", label_en: "First thing after waking" },
      { value: "specific_times", label_ar: "في أوقات محددة فقط", label_en: "Only at specific times" },
      { value: "occasional", label_ar: "نادرًا / اجتماعيًا", label_en: "Occasionally / socially" },
    ],
  },
  {
    id: "shisha_frequency",
    kind: "choice",
    health: true,
    when: (a) => hasProduct(a, "shisha"),
    prompt_ar: () => "كم مرة تجلس على الشيشة؟",
    prompt_en: "How often do you use shisha?",
    choices: [
      { value: "daily", label_ar: "يوميًا أو شبه يومي", label_en: "Daily or almost daily" },
      { value: "weekly", label_ar: "مرة أو مرتين أسبوعيًا", label_en: "1–2 times a week" },
      { value: "monthly", label_ar: "مناسبات فقط", label_en: "Occasions only" },
    ],
  },
  {
    id: "pouch_frequency",
    kind: "choice",
    health: true,
    when: (a) => hasProduct(a, "pouches"),
    prompt_ar: () => "كم كيس نيكوتين تستخدم في اليوم تقريبًا؟",
    prompt_en: "How many nicotine pouches per day?",
    choices: [
      { value: "1_3", label_ar: "1 – 3", label_en: "1–3" },
      { value: "4_8", label_ar: "4 – 8", label_en: "4–8" },
      { value: "gt_8", label_ar: "أكثر من 8", label_en: "More than 8" },
    ],
  },

  // ---- FTND: cigarette users only, optional ----
  {
    id: "ftnd_opt_in",
    kind: "choice",
    health: true,
    when: isCigaretteUser,
    prompt_ar: () =>
      "تحب نسوي اختبار فاجرستروم العلمي (6 أسئلة، أقل من دقيقة) عشان نعرف مستوى اعتماد جسدك على النيكوتين؟ اختياري تمامًا.",
    prompt_en: "Would you like to take the 6-item Fagerström test? Entirely optional.",
    choices: [
      { value: "yes", label_ar: "نعم، ابدأ الاختبار", label_en: "Yes, start" },
      { value: "no", label_ar: "لا، تخطَّ الاختبار", label_en: "No, skip" },
    ],
  },
  {
    id: "ftnd_q1",
    kind: "choice",
    health: true,
    when: (a) => isCigaretteUser(a) && a.ftnd_opt_in === true,
    prompt_ar: () => "متى تدخن أول سيجارة بعد ما تصحى من النوم؟",
    prompt_en: "How soon after waking do you smoke your first cigarette?",
    choices: [
      { value: "lte5", label_ar: "خلال 5 دقائق", label_en: "Within 5 min", score: 3 },
      { value: "6_30", label_ar: "خلال 6 – 30 دقيقة", label_en: "6–30 min", score: 2 },
      { value: "31_60", label_ar: "خلال 31 – 60 دقيقة", label_en: "31–60 min", score: 1 },
      { value: "gt60", label_ar: "بعد أكثر من ساعة", label_en: "After 60 min", score: 0 },
    ],
  },
  {
    id: "ftnd_q2",
    kind: "choice",
    health: true,
    when: (a) => isCigaretteUser(a) && a.ftnd_opt_in === true,
    prompt_ar: () => "هل تجد صعوبة في الامتناع عن التدخين في الأماكن الممنوعة؟",
    prompt_en: "Do you find it difficult to refrain in forbidden places?",
    choices: [
      { value: "yes", label_ar: "نعم", label_en: "Yes", score: 1 },
      { value: "no", label_ar: "لا", label_en: "No", score: 0 },
    ],
  },
  {
    id: "ftnd_q3",
    kind: "choice",
    health: true,
    when: (a) => isCigaretteUser(a) && a.ftnd_opt_in === true,
    prompt_ar: () => "أي سيجارة يصعب عليك التخلي عنها أكثر؟",
    prompt_en: "Which cigarette would you hate most to give up?",
    choices: [
      { value: "first", label_ar: "أول سيجارة في الصباح", label_en: "The first one in the morning", score: 1 },
      { value: "other", label_ar: "أي سيجارة أخرى", label_en: "Any other", score: 0 },
    ],
  },
  {
    id: "ftnd_q4",
    kind: "choice",
    health: true,
    when: (a) => isCigaretteUser(a) && a.ftnd_opt_in === true,
    prompt_ar: () => "كم سيجارة تدخن في اليوم؟",
    prompt_en: "How many cigarettes per day?",
    choices: [
      { value: "lte10", label_ar: "10 أو أقل", label_en: "10 or fewer", score: 0 },
      { value: "11_20", label_ar: "11 – 20", label_en: "11–20", score: 1 },
      { value: "21_30", label_ar: "21 – 30", label_en: "21–30", score: 2 },
      { value: "gte31", label_ar: "31 فأكثر", label_en: "31 or more", score: 3 },
    ],
  },
  {
    id: "ftnd_q5",
    kind: "choice",
    health: true,
    when: (a) => isCigaretteUser(a) && a.ftnd_opt_in === true,
    prompt_ar: () => "هل تدخن في الساعات الأولى من الصباح أكثر من باقي اليوم؟",
    prompt_en: "Do you smoke more in the first hours after waking?",
    choices: [
      { value: "yes", label_ar: "نعم", label_en: "Yes", score: 1 },
      { value: "no", label_ar: "لا", label_en: "No", score: 0 },
    ],
  },
  {
    id: "ftnd_q6",
    kind: "choice",
    health: true,
    when: (a) => isCigaretteUser(a) && a.ftnd_opt_in === true,
    prompt_ar: () => "هل تدخن حتى وأنت مريض وطريح الفراش؟",
    prompt_en: "Do you smoke even when ill in bed?",
    choices: [
      { value: "yes", label_ar: "نعم", label_en: "Yes", score: 1 },
      { value: "no", label_ar: "لا", label_en: "No", score: 0 },
    ],
  },

  // ---- Safety ----
  {
    id: "red_flags",
    kind: "multi",
    health: true,
    prompt_ar: () =>
      "سؤال مهم لسلامتك: هل تعاني الآن من أي من التالي؟ (اختر «لا شيء» إذا لا ينطبق)",
    prompt_en: "Do you currently have any of the following?",
    choices: [
      { value: "chest_pain_now", label_ar: "ألم في الصدر الآن", label_en: "Chest pain right now" },
      { value: "severe_breathlessness", label_ar: "ضيق تنفس شديد", label_en: "Severe breathlessness" },
      { value: "coughing_blood", label_ar: "سعال مصحوب بدم", label_en: "Coughing blood" },
      { value: "loss_of_consciousness", label_ar: "فقدان وعي أو تدهور مفاجئ", label_en: "Loss of consciousness" },
      { value: "self_harm_risk", label_ar: "أفكار إيذاء النفس", label_en: "Thoughts of self-harm" },
      { value: "none", label_ar: "لا شيء مما سبق", label_en: "None of the above" },
    ],
  },
  {
    id: "cardiac",
    kind: "choice",
    health: true,
    prompt_ar: () => "بخصوص القلب، أي وصف ينطبق عليك؟",
    prompt_en: "Which best describes your cardiac status?",
    choices: [
      { value: "none", label_ar: "لا يوجد شيء بالقلب", label_en: "No cardiac history" },
      { value: "stable", label_ar: "عندي تاريخ قلبي لكنه مستقر ومتابع", label_en: "Stable, monitored cardiac history" },
      { value: "recent_event", label_ar: "حدث قلبي حديث (آخر 6 أشهر) بدون أعراض الآن", label_en: "Recent cardiac event, no current symptoms" },
      { value: "active_symptoms", label_ar: "أعراض متزايدة مؤخرًا (مثل ضيق نفس عند الجهد)", label_en: "Active or worsening symptoms" },
    ],
  },
  {
    id: "respiratory",
    kind: "choice",
    health: true,
    prompt_ar: () => "وبخصوص التنفس والصدر؟",
    prompt_en: "And your respiratory status?",
    choices: [
      { value: "none", label_ar: "لا يوجد", label_en: "None" },
      { value: "diagnosed_stable", label_ar: "ربو أو انسداد رئوي مشخّص ومستقر", label_en: "Diagnosed and stable" },
      { value: "worsening", label_ar: "أعراض تنفسية تزداد مؤخرًا", label_en: "Worsening symptoms" },
    ],
  },
  {
    id: "mental_health",
    kind: "choice",
    health: true,
    prompt_ar: () => "هل لديك حالة نفسية مشخّصة (قلق، اكتئاب، غيرها)؟",
    prompt_en: "Do you have a diagnosed mental health condition?",
    choices: [
      { value: "none", label_ar: "لا", label_en: "No" },
      { value: "stable", label_ar: "نعم، ومستقرة ومتابعة", label_en: "Yes, stable and monitored" },
      { value: "unstable", label_ar: "نعم، وغير مستقرة أو غير متابعة", label_en: "Yes, unstable or unmonitored" },
    ],
  },
  {
    id: "other_conditions",
    kind: "multi",
    health: true,
    prompt_ar: () => "هل ينطبق عليك أي من التالي؟",
    prompt_en: "Do any of the following apply?",
    choices: [
      { value: "diabetes", label_ar: "سكري", label_en: "Diabetes" },
      { value: "seizures", label_ar: "تشنجات / صرع", label_en: "Seizures" },
      { value: "kidney_liver", label_ar: "مشاكل كلى أو كبد", label_en: "Kidney or liver problems" },
      { value: "regular_meds", label_ar: "أتناول أدوية بشكل منتظم", label_en: "I take regular medication" },
      { value: "none", label_ar: "لا شيء مما سبق", label_en: "None of the above" },
    ],
  },

  // ---- Motivation ----
  {
    id: "readiness",
    kind: "scale",
    health: true,
    prompt_ar: () => "على مقياس من 1 إلى 10، كم أنت مستعد من داخلك لاتخاذ قرار الإقلاع؟",
    prompt_en: "On a scale of 1–10, how ready are you to quit?",
  },
  {
    id: "strategy",
    kind: "choice",
    health: true,
    prompt_ar: (a) =>
      (a.readiness ?? 10) < 5
        ? "أقدّر صراحتك. ما راح أضغطك على قرار ما أنت مقتنع فيه. أي خيار أقرب لك الآن؟": "ممتاز. وش الخطة اللي تناسبك؟",
    prompt_en: "Which option is closest to what you want now?",
    choices: [
      { value: "quit_now", label_ar: "أبي أقلع الآن", label_en: "Quit now" },
      { value: "future_date", label_ar: "أحدد تاريخ إقلاع قريب", label_en: "Set a future quit date" },
      { value: "reduce_to_quit", label_ar: "أقلل أولًا ثم أقلع", label_en: "Reduce first, then quit" },
      { value: "not_ready_yet", label_ar: "لست جاهزًا بعد، أبي أفهم أكثر", label_en: "Not ready yet" },
    ],
  },
  {
    id: "quit_date",
    kind: "choice",
    health: true,
    when: (a) => a.strategy === "quit_now"|| a.strategy === "future_date"|| a.strategy === "reduce_to_quit",
    prompt_ar: () => 'متى تبي يكون "يوم استقلالك"؟',
    prompt_en: "When is your independence day?",
    choices: [
      { value: "today", label_ar: "اليوم", label_en: "Today" },
      { value: "tomorrow", label_ar: "غدًا", label_en: "Tomorrow" },
      { value: "in_7_days", label_ar: "بعد أسبوع", label_en: "In a week" },
      { value: "in_14_days", label_ar: "بعد أسبوعين", label_en: "In two weeks" },
    ],
  },
  {
    id: "triggers",
    kind: "multi",
    health: true,
    prompt_ar: () => "وش المواقف اللي ترجعك للتدخين عادة؟ (اختر كل ما ينطبق)",
    prompt_en: "Which situations usually trigger you?",
    choices: [
      { value: "coffee", label_ar: "مع القهوة", label_en: "With coffee" },
      { value: "after_meal", label_ar: "بعد الأكل", label_en: "After meals" },
      { value: "stress", label_ar: "التوتر والعصبية", label_en: "Stress" },
      { value: "car", label_ar: "في السيارة", label_en: "In the car" },
      { value: "social", label_ar: "مجالسة المدخنين", label_en: "With smokers" },
      { value: "night", label_ar: "السهر", label_en: "Late nights" },
      { value: "boredom", label_ar: "الملل والفراغ", label_en: "Boredom" },
    ],
  },
  {
    id: "past_attempts",
    kind: "choice",
    health: true,
    prompt_ar: () => "هل حاولت الإقلاع من قبل؟",
    prompt_en: "Have you tried quitting before?",
    choices: [
      { value: "never", label_ar: "لا، هذه أول مرة", label_en: "No, first time" },
      { value: "lt_24h", label_ar: "نعم، أقل من يوم", label_en: "Yes, less than a day" },
      { value: "days", label_ar: "نعم، أيام", label_en: "Yes, days" },
      { value: "weeks", label_ar: "نعم، أسابيع", label_en: "Yes, weeks" },
      { value: "months", label_ar: "نعم، أشهر ثم عدت", label_en: "Yes, months then relapsed" },
    ],
  },
  {
    id: "supporter",
    kind: "text",
    health: false,
    prompt_ar: () => 'الإقلاع السري صعب. من الشخص اللي بتشاركه قرارك؟ (اكتب اسمه الأول، أو اكتب "لا أحد")',
    prompt_en: "Who will you tell about your decision?",
  },
  {
    id: "money_opt_in",
    kind: "choice",
    health: false,
    prompt_ar: () => "تحب نحسب لك كم توفر ماديًا في خطتك؟",
    prompt_en: "Would you like a money-saved calculation?",
    choices: [
      { value: "yes", label_ar: "نعم، احسبها لي", label_en: "Yes" },
      { value: "no", label_ar: "لا، تخطَّ", label_en: "No" },
    ],
  },
  {
    id: "weekly_spend",
    kind: "number",
    health: false,
    when: (a) => a.money_opt_in === true,
    prompt_ar: () => "كم تصرف تقريبًا على منتجات النيكوتين في الأسبوع؟ (بالريال)",
    prompt_en: "Roughly how much do you spend per week?",
  },
  {
    id: "plan_email_consent",
    kind: "choice",
    health: false,
    when: (a) => a.age_band !== "under_18",
    prompt_ar: () =>
      "خطتك بتكون جاهزة للعرض والتحميل مباشرة. تحب كمان نرسل لك نسخة على بريدك الإلكتروني؟ (موافقة اختيارية ومنفصلة)",
    prompt_en: "Would you also like your plan emailed to you?",
    choices: [
      { value: "yes", label_ar: "نعم، أوافق على إرسالها لبريدي", label_en: "Yes, email it to me" },
      { value: "no", label_ar: "لا، يكفي العرض والتحميل", label_en: "No, screen and download only" },
    ],
  },
  {
    id: "email",
    kind: "email",
    health: false,
    when: (a) => a.plan_email_consent === true,
    prompt_ar: () => "اكتب بريدك الإلكتروني:",
    prompt_en: "Your email address:",
  },
];

/**
 * True when the user has selected at least one true emergency red flag.
 * Once true, the ordinary assessment must stop immediately.
 */
export function hasEmergencyRedFlag(answers: ClinicalAnswers): boolean {
  return (answers.red_flags ?? []).some(
    (f) => f !== "none" && (EMERGENCY_RED_FLAGS as readonly string[]).includes(f),
  );
}

export function nextQuestion(answers: ClinicalAnswers, answeredIds: string[]): Question | null {
  // Emergency hold: no further assessment questions may be asked.
  if (hasEmergencyRedFlag(answers)) return null;
  for (const q of QUESTIONS) {
    if (answeredIds.includes(q.id as string)) continue;
    if (q.when && !q.when(answers)) continue;
    return q;
  }
  return null;
}
