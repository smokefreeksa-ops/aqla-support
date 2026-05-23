// Build a structured Arabic quit-plan JSON from intake answers + deterministic score.
// AI never runs here. Pure functions.
// Evidence-based standardized template, personalized by user answers.
// Sources cited inline: WHO 2024, USPSTF 2021, CDC 2024, FDA, NCI PDQ.

import {
  scoreFtnd,
  scorePennStateEcig,
  scoreLwds11,
  scoreOralNicotineAdapted,
  scoreHonc,
  type FtndAnswers,
  type PennStateEcigAnswers,
  type Lwds11Answers,
  type OralNicotineAnswers,
  type HoncAnswers,
} from "./scoring";

export type QuitProduct = "cigarettes" | "vape" | "shisha" | "pouches" | "youth" | "other";
export type QuitGoal = "quit_full" | "reduce_first" | "understand" | "not_ready_now";
export type ReadinessStage =
  | "quit_now"
  | "quit_prepare"
  | "reduce_first"
  | "not_ready_score"
  | "discuss_alternatives";

export interface QuitPlanIntake {
  nickname: string;
  email: string;
  city: string;
  product: QuitProduct;
  age?: number;
  daily_use_pattern?: string;
  time_to_first_use?: string;
  craving_pattern?: string;
  previous_quit_attempts?: string;
  readiness: ReadinessStage;
  goal: QuitGoal;
  quit_date?: string | null;
  triggers: string[];
  support_person?: { name?: string; relation?: string; phone?: string } | null;
  followup_preference?: "email" | "whatsapp" | "none";
  reminder_consent?: boolean;
  assessment_answers: Record<string, unknown>;
  emergency_consent?: boolean;
}

export interface QuitPlanScore {
  instrument: string;
  instrument_label_ar: string;
  total: number;
  band: string;
  band_ar: string;
  validated: boolean;
  risk_flag: boolean;
}

const BAND_AR: Record<string, string> = {
  very_low: "منخفض جدًا",
  low: "منخفض",
  moderate: "متوسط",
  high: "مرتفع",
  very_high: "مرتفع جدًا",
  not_dependent: "غير معتمد",
  medium: "متوسط",
  none: "لا يوجد",
  early: "مبكر",
};

export function computeScore(intake: QuitPlanIntake): QuitPlanScore {
  const a = intake.assessment_answers;
  if (intake.product === "youth" || (intake.age && intake.age < 18)) {
    const r = scoreHonc(a as unknown as HoncAnswers);
    return {
      instrument: "honc_youth",
      instrument_label_ar: "تقييم فقدان الاستقلالية (HONC)",
      total: r.positive_count,
      band: r.category,
      band_ar: BAND_AR[r.category] ?? r.category,
      validated: true,
      risk_flag: r.category === "high" || r.category === "moderate",
    };
  }
  switch (intake.product) {
    case "cigarettes": {
      const r = scoreFtnd(a as unknown as FtndAnswers);
      return {
        instrument: "ftnd_cigarettes",
        instrument_label_ar: "اختبار فاجرستروم (FTND)",
        total: r.total,
        band: r.category,
        band_ar: BAND_AR[r.category] ?? r.category,
        validated: true,
        risk_flag: r.category === "high" || r.category === "very_high",
      };
    }
    case "vape": {
      const r = scorePennStateEcig(a as unknown as PennStateEcigAnswers);
      return {
        instrument: "ps_ecdi_vape",
        instrument_label_ar: "مؤشر بِن ستيت لاعتماد السجائر الإلكترونية (PSECDI)",
        total: r.total,
        band: r.category,
        band_ar: BAND_AR[r.category] ?? r.category,
        validated: true,
        risk_flag: r.category === "medium" || r.category === "high",
      };
    }
    case "shisha": {
      const r = scoreLwds11(a as unknown as Lwds11Answers);
      return {
        instrument: "lwds11_waterpipe",
        instrument_label_ar: "مقياس لبنان لاعتماد الشيشة (LWDS-11)",
        total: r.total,
        band: r.category,
        band_ar: BAND_AR[r.category] ?? r.category,
        validated: true,
        risk_flag: r.category === "high",
      };
    }
    case "pouches": {
      const r = scoreOralNicotineAdapted(a as unknown as OralNicotineAnswers);
      return {
        instrument: "oral_nicotine_adapted",
        instrument_label_ar: "تقييم مكيّف لمنتجات النيكوتين الفموية (غير معتمد)",
        total: r.yes_count,
        band: r.category,
        band_ar: BAND_AR[r.category] ?? r.category,
        validated: false,
        risk_flag: r.category === "high",
      };
    }
    default: {
      try {
        const r = scoreFtnd(a as unknown as FtndAnswers);
        return {
          instrument: "ftnd_cigarettes",
          instrument_label_ar: "اختبار فاجرستروم (FTND)",
          total: r.total,
          band: r.category,
          band_ar: BAND_AR[r.category] ?? r.category,
          validated: true,
          risk_flag: r.category === "high" || r.category === "very_high",
        };
      } catch {
        return {
          instrument: "none",
          instrument_label_ar: "—",
          total: 0,
          band: "low",
          band_ar: "—",
          validated: false,
          risk_flag: false,
        };
      }
    }
  }
}

const GOAL_AR: Record<QuitGoal, string> = {
  quit_full: "الإقلاع تمامًا",
  reduce_first: "التقليل أولًا",
  understand: "فهم الوضع",
  not_ready_now: "غير جاهز الآن",
};

const READINESS_AR: Record<ReadinessStage, string> = {
  quit_now: "مستعد للإقلاع الآن",
  quit_prepare: "أستعد للإقلاع قريبًا",
  reduce_first: "أرغب بالتقليل أولًا",
  not_ready_score: "غير جاهز الآن",
  discuss_alternatives: "أرغب بمناقشة البدائل",
};

const PRODUCT_AR: Record<QuitProduct, string> = {
  cigarettes: "سجائر",
  vape: "سجائر إلكترونية / فيب",
  shisha: "شيشة / معسل",
  pouches: "أكياس / منتجات نيكوتين فموية",
  youth: "تقييم الشباب وفقدان الاستقلالية",
  other: "أخرى",
};

const FOLLOWUP_AR: Record<NonNullable<QuitPlanIntake["followup_preference"]>, string> = {
  email: "إيميل",
  whatsapp: "واتساب",
  none: "بدون متابعة",
};

// ---- Evidence-based trigger-specific actions (Arabic) ----
const TRIGGER_ACTIONS: Record<string, string> = {
  "مع القهوة":
    "غيّر مكان شرب القهوة أو أخّرها 10 دقائق، واجعل يدك مشغولة بكوب ماء أو علكة خالية من السكر.",
  "القهوة":
    "غيّر مكان شرب القهوة أو أخّرها 10 دقائق، واجعل يدك مشغولة بكوب ماء أو علكة خالية من السكر.",
  "التوتر":
    "استخدم قاعدة 10 دقائق: تنفس ببطء، اشرب ماء، غيّر المكان، ثم قرر بعد أن تهدأ الرغبة.",
  "بعد الأكل":
    "قم مباشرة بعد الأكل، اغسل أسنانك، أو امشِ 5 دقائق قبل أن تجلس.",
  "السيارة":
    "نظّف السيارة من أي بقايا، ضع علكة/ماء بجانبك، وغيّر مسارك المعتاد لأول أسبوع.",
  "العمل":
    "اربط الاستراحة بنشاط بديل (مشي قصير، اتصال، ماء) بدل الخروج للتدخين.",
  "الدراسة":
    "حدّد فترات تركيز قصيرة (25 دقيقة) ثم استراحة بنشاط حركي بدل النيكوتين.",
  "التجمعات":
    "أخبر شخصًا بقرارك قبل التجمع، اجلس بعيدًا عن المدخنين، وخطّط لمغادرة مبكرة لو زادت الرغبة.",
  "الأصدقاء المدخنون":
    "أخبر شخصًا بقرارك قبل التجمع، اجلس بعيدًا عن المدخنين، وخطّط لمغادرة مبكرة لو زادت الرغبة.",
  "الفراغ":
    "جهّز قائمة قصيرة من 5 أنشطة بديلة (مشي، قراءة، مكالمة، رياضة خفيفة، ترتيب) واستخدمها فورًا.",
  "الملل":
    "جهّز قائمة قصيرة من 5 أنشطة بديلة (مشي، قراءة، مكالمة، رياضة خفيفة، ترتيب) واستخدمها فورًا.",
  "قبل النوم":
    "غيّر روتين ما قبل النوم: دش دافئ، قراءة، أو تنفس بطيء بدل التدخين.",
  "السهر":
    "قلّل وقت السهر تدريجيًا، وغيّر بيئة السهر بعيدًا عن المثيرات أول أسبوعين.",
  "أول استخدام بعد الاستيقاظ":
    "أخّر أول رغبة 15 دقيقة بعد الاستيقاظ، اشرب ماء، وخذ دش قصير قبل أي قرار.",
  "بعد الصلاة":
    "اربط ما بعد الصلاة بدعاء قصير + كوب ماء + خروج للهواء بدل التدخين.",
  "القيادة":
    "نظّف السيارة من أي بقايا، ضع علكة/ماء بجانبك، وغيّر مسارك المعتاد لأول أسبوع.",
};

function actionFor(trigger: string): string {
  return (
    TRIGGER_ACTIONS[trigger] ??
    `عند مواجهة "${trigger}": خذ نفسًا عميقًا 4 ثواني، اشرب ماء، وحوّل النشاط (مشي قصير / مكالمة لشخص داعم) لمدة 5 دقائق قبل أي قرار.`
  );
}

// ---- Standard reference registry ----
export const REFERENCES: { id: string; citation: string; full: string }[] = [
  {
    id: "WHO 2024",
    citation: "WHO 2024",
    full: "World Health Organization. WHO clinical treatment guideline for tobacco cessation in adults. 2024.",
  },
  {
    id: "USPSTF 2021",
    citation: "USPSTF 2021",
    full: "U.S. Preventive Services Task Force. Tobacco Smoking Cessation in Adults, Including Pregnant Persons: Interventions. 2021.",
  },
  {
    id: "CDC 2024",
    citation: "CDC 2024",
    full: "Centers for Disease Control and Prevention. Learn About Quit Smoking Medicines / How Quit Smoking Medicines Work. 2024.",
  },
  {
    id: "FDA",
    citation: "FDA",
    full: "U.S. Food and Drug Administration. Want to Quit Smoking? FDA-Approved and FDA-Cleared Cessation Products Can Help.",
  },
  {
    id: "NCI PDQ",
    citation: "NCI PDQ",
    full: "National Cancer Institute. Cigarette Smoking: Health Risks and How to Quit (PDQ®).",
  },
];

export interface PharmacyOptionDetail {
  name: string;
  what_is: string;
  purpose: string;
  common_issues: string;
  safety: string;
}

export interface QuitPlanJSON {
  meta: { generated_at: string; version: 2 };
  title: string;
  subtitle: string;
  identity: { nickname: string; email: string; city: string };
  use: { product: QuitProduct; product_ar: string; age?: number };
  assessment: QuitPlanScore;
  summary_citation: string;
  score_meaning: string;
  readiness: { code: ReadinessStage; label_ar: string };
  goal: { code: QuitGoal; label_ar: string; text: string };
  dates: { quit_or_reduce_date: string | null; followup_next: string };
  followup_preference_ar: string;
  triggers: string[];
  trigger_plan: string[];
  trigger_plan_citation: string;
  craving_rescue: string[];
  craving_rescue_citation: string;
  first_24h: string[];
  first_7d: string[];
  follow_up_28d: string[];
  follow_up_28d_citation: string;
  relapse_plan: string[];
  relapse_plan_citation: string;
  support_person_plan: string[];
  pharmacy_discussion: {
    intro: string;
    nrt_intro: string;
    nrt_options: string[]; // back-compat short list
    nrt_details: PharmacyOptionDetail[];
    prescription_options: string[]; // back-compat
    prescription_details: PharmacyOptionDetail[];
    important_notes: string[];
    closing: string;
    citations: string;
  };
  when_to_seek_help: string[];
  when_to_seek_help_citation: string;
  emergency_disclaimer: string;
  followup_schedule: string[];
  contact: { whatsapp: string; email: string; site: string };
  aqla_links: { label: string; href: string }[];
  references: { id: string; full: string }[];
}

function addDays(base: Date, n: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export function buildQuitPlan(intake: QuitPlanIntake, score: QuitPlanScore): QuitPlanJSON {
  const now = new Date();
  const quitDate = intake.quit_date ?? addDays(now, 7);
  const triggers = intake.triggers.length ? intake.triggers : ["—"];
  const trigger_plan = triggers.map(actionFor);

  const goalText =
    intake.goal === "quit_full"
      ? "هدفك الآن هو الإقلاع الكامل. سنبني الخطة حول تاريخ بداية واضح، إدارة المحفزات، خطة رغبة شديدة، ومتابعة منتظمة. (WHO 2024; USPSTF 2021)"
      : intake.goal === "reduce_first"
        ? "هدفك الآن هو التقليل أولًا كخطوة نحو الإقلاع. سنركّز على تقليل عدد المرات، تحديد أوقات الاستخدام، وبناء بدائل عملية لكل محفز. (WHO 2024; NCI PDQ)"
        : intake.goal === "not_ready_now"
          ? "هدفك الآن ليس الإقلاع الكامل فورًا. الخطة ستركّز على تقليل الضرر، فهم المحفزات، وتجهيز خطوة صغيرة دون ضغط أو لوم. (WHO 2024; NCI PDQ)"
          : "هدفك الآن هو فهم وضعك. حتى لو لم تكن جاهزًا للإقلاع الكامل اليوم، يمكن البدء بخطوة واضحة مثل فهم المحفزات أو تحديد موعد قريب. (WHO 2024; NCI PDQ)";

  const score_meaning = `نطاق نتيجتك: ${score.band_ar} على ${score.instrument_label_ar}. هذه النتيجة ليست تشخيصًا، لكنها مؤشر يساعدنا على اختيار مستوى الدعم المناسب وبناء خطة عملية تناسب نمط استخدامك. (WHO 2024)`;

  return {
    meta: { generated_at: now.toISOString(), version: 2 },
    title: "خطة أقلع الشخصية للإقلاع عن التدخين أو النيكوتين",
    subtitle:
      "خطة مبنية على إجاباتك، وتجمع بين الدعم السلوكي، إدارة المحفزات، المتابعة، وخيارات يمكن مناقشتها مع الصيدلي أو الطبيب.",
    identity: { nickname: intake.nickname, email: intake.email, city: intake.city },
    use: { product: intake.product, product_ar: PRODUCT_AR[intake.product], age: intake.age },
    assessment: score,
    summary_citation: "(WHO 2024; USPSTF 2021)",
    score_meaning,
    readiness: { code: intake.readiness, label_ar: READINESS_AR[intake.readiness] },
    goal: { code: intake.goal, label_ar: GOAL_AR[intake.goal], text: goalText },
    dates: { quit_or_reduce_date: quitDate, followup_next: addDays(now, 7) },
    followup_preference_ar: FOLLOWUP_AR[intake.followup_preference ?? "email"],
    triggers,
    trigger_plan,
    trigger_plan_citation: "(CDC 2024; NCI PDQ)",
    craving_rescue: [
      "أجّل القرار 10 دقائق.",
      "غيّر مكانك فورًا.",
      "اشرب كوب ماء بارد ببطء.",
      "تنفس ببطء لمدة 60 ثانية (شهيق 4، حبس 4، زفير 6).",
      "اشغل يدك بشيء آخر (علكة خالية من السكر، قلم، مفاتيح).",
      "تواصل مع شخص داعم برسالة قصيرة.",
      "افتح أقلع وراجع خطتك.",
    ],
    craving_rescue_citation: "(CDC 2024)",
    first_24h: [
      "أبعد كل منتجات التدخين/النيكوتين من المنزل والسيارة والعمل.",
      "حدّد أصعب موقفين متوقعين اليوم، وجهّز بديلًا لكل واحد منهما.",
      "جهّز بدائل في متناول اليد (ماء، علكة، سناك صحي).",
      "أخبر شخصًا داعمًا واحدًا بقرارك اليوم.",
      "خطّط لخطة رغبة شديدة واحفظ خطوات الإنقاذ السبع.",
      "احفظ رابط أقلع وافتحه عند الحاجة.",
    ],
    first_7d: [
      "اليوم الأول: ركّز على البيئة وتجنّب المحفزات المباشرة، ونم مبكرًا.",
      "اليوم 2–3: راقب الرغبات وسجّل أوقات الضعف ومدتها.",
      "اليوم 4–7: عدّل الخطة حسب أكثر محفز تكرّر، وكافئ نفسك بنهاية اليوم 7.",
      "احتفظ بمذكرة قصيرة: متى جاءت الرغبة، وما الذي ساعد.",
      "حرّك المال الذي كنت تنفقه إلى حصّالة أو تحويل شهري.",
      "إذا حدث رجوع: لا تحكم على نفسك، عُد للخطة من نفس النقطة.",
    ],
    follow_up_28d: [
      "الأسبوع الأول: تثبيت البداية وإدارة الانسحاب وبيئة آمنة.",
      "الأسبوع الثاني: تعديل خطة المحفزات بناءً على التجربة الواقعية.",
      "الأسبوع الثالث: تقوية الدعم (شخص الدعم، صيدلي، مختص عند الحاجة).",
      "الأسبوع الرابع: تثبيت العادات الجديدة، مراجعة الخطة، وضع هدف لـ 3 أشهر القادمة.",
    ],
    follow_up_28d_citation: "(WHO 2024; USPSTF 2021)",
    relapse_plan: [
      "الرجوع للاستخدام لا يعني أن الخطة فشلت.",
      "اسأل نفسك: ما المحفز؟ ماذا حدث قبلها؟ وما التعديل المطلوب قبل المرة القادمة؟",
      "أعد ضبط تاريخ الإقلاع خلال 24–72 ساعة.",
      "إذا تكرّر الرجوع، اطلب دعمًا مهنيًا (صيدلي/طبيب/مختص).",
    ],
    relapse_plan_citation: "(WHO 2024; NCI PDQ)",
    support_person_plan: intake.support_person?.name
      ? [
          `شخص الدعم: ${intake.support_person.name}${intake.support_person.relation ? ` (${intake.support_person.relation})` : ""}.`,
          "اتفق معه على رسالة واحدة محفّزة عند الرغبة الشديدة.",
          "لا يفرض عليك، ولا يلومك إذا حدث رجوع.",
        ]
      : [
          "اختر شخصًا واحدًا تثق به (صديق/قريب/زميل).",
          "أخبره بقرارك واطلب رسالة دعم قصيرة عند الحاجة.",
          "لا حاجة لأي ضغط أو مراقبة، فقط حضور إنساني.",
        ],
    pharmacy_discussion: {
      intro:
        "هذه الخيارات للتثقيف فقط، وليست وصفة طبية. اختيار المنتج أو الجرعة المناسبة يحتاج مراجعة صيدلي أو طبيب، خصوصًا في الحمل أو الرضاعة، أمراض القلب، ارتفاع الضغط، الأمراض النفسية، استخدام أدوية أخرى، أو وجود أعراض غير معتادة. (FDA; USPSTF 2021)",
      nrt_intro:
        "بدائل النيكوتين تعطي الجسم كمية مضبوطة من النيكوتين دون التعرض لمئات المواد الضارة الموجودة في دخان السجائر، وتساعد على تخفيف أعراض الانسحاب والرغبة. (CDC 2024; FDA)",
      nrt_options: [
        "لصقات النيكوتين",
        "علكة النيكوتين",
        "أقراص/مصّات النيكوتين",
        "بخاخ النيكوتين إن كان متاحًا محليًا",
        "مستنشق النيكوتين إن كان متاحًا محليًا",
      ],
      nrt_details: [
        {
          name: "لصقات النيكوتين",
          purpose:
            "تعطي مستوى ثابتًا من النيكوتين خلال اليوم، وقد تناسب من لديه رغبة متكررة أو استخدام يومي منتظم.",
          common_issues: "تهيج الجلد، أحلام مزعجة أو اضطراب النوم عند بعض الأشخاص.",
          safety:
            "اسأل الصيدلي عن الاستخدام المناسب لك، ولا تجمعها مع منتجات أخرى دون توجيه مختص.",
        },
        {
          name: "علكة النيكوتين",
          purpose: "تساعد مع الرغبات المفاجئة لأنها تُستخدم عند الحاجة.",
          common_issues: "تهيج الفم، الفواق، ألم الفك أو اضطراب المعدة.",
          safety: "يجب استخدامها بالطريقة الصحيحة حسب تعليمات المنتج والصيدلي.",
        },
        {
          name: "أقراص/مصّات النيكوتين",
          purpose:
            "تذوب في الفم وتساعد في الرغبات المفاجئة، وقد تناسب من لا يفضّل العلكة.",
          common_issues: "تهيج الحلق أو الفم، الفواق، حرقة المعدة.",
          safety: "اتبع تعليمات المنتج، واسأل الصيدلي إذا كانت لديك أمراض أو تستخدم أدوية.",
        },
        {
          name: "بخاخ النيكوتين أو مستنشق النيكوتين (إن توفر)",
          purpose:
            "خيارات أسرع لبعض الرغبات، وقد تحتاج وصفة أو إرشاد مختص حسب النظام المحلي.",
          common_issues: "تهيج الأنف أو الحلق أو السعال حسب المنتج.",
          safety: "اسأل الصيدلي أو الطبيب عن التوفر والمناسبة.",
        },
      ],
      prescription_options: [
        "Varenicline / Champix — يُسأل عنه الطبيب أو الصيدلي.",
        "Bupropion SR — يُسأل عنه الطبيب أو الصيدلي.",
      ],
      prescription_details: [
        {
          name: "Varenicline / Champix (حيث يتوفر)",
          purpose:
            "دواء غير نيكوتيني قد يساعد على تقليل الرغبة ويقلل الإحساس بالمكافأة من النيكوتين. يرتبط بمستقبلات النيكوتين في الدماغ، فيخفّف بعض أعراض الانسحاب ويجعل تأثير النيكوتين أقل إشباعًا عند حدوث استخدام.",
          common_issues:
            "الغثيان، الإمساك، الغازات، القيء، اضطراب النوم أو الأحلام الواضحة. قد يؤثر على تحمل الكحول عند بعض الأشخاص.",
          safety:
            "يحتاج مراجعة طبيب أو صيدلي، وقد لا يكون مناسبًا للجميع. لا تبدأه من نفسك. (CDC 2024; FDA)",
        },
        {
          name: "Bupropion SR",
          purpose:
            "دواء وصفي غير نيكوتيني قد يساعد بعض الأشخاص على تقليل الرغبة وأعراض الانسحاب. يؤثر على مسارات في الدماغ مرتبطة بالرغبة والمزاج وأعراض الانسحاب.",
          common_issues:
            "جفاف الفم، الأرق، وقد لا يناسب من لديهم تاريخ نوبات/تشنجات أو بعض الحالات النفسية أو استخدام أدوية معينة.",
          safety:
            "يحتاج تقييم طبي أو صيدلي قبل الاستخدام. لا تبدأه من نفسك. (CDC 2024; FDA)",
        },
      ],
      important_notes: [
        "أقلع لا يصف أدوية ولا يحدد جرعات ولا يحدد مدة الاستخدام.",
        "اختيار المنتج أو الجرعة المناسبة يحتاج مراجعة صيدلي أو طبيب.",
        "أبلغ الصيدلي/الطبيب بأي حالة صحية، حمل أو رضاعة، أو أدوية أخرى تستخدمها.",
      ],
      closing:
        "اسأل الصيدلي أو الطبيب عن الخيار الأنسب لك، واذكر لهم نوع المنتج الذي تستخدمه، عدد مرات الاستخدام، تاريخك الصحي، وأي أدوية أخرى تستخدمها.",
      citations: "(FDA; USPSTF 2021; CDC 2024)",
    },
    when_to_seek_help: [
      "الحمل أو الرضاعة.",
      "العمر أقل من 18 سنة.",
      "أمراض قلب، ضغط، سكري، أو ربو شديد.",
      "تاريخ نوبات أو تشنجات.",
      "قلق أو اكتئاب شديد، أو أفكار إيذاء النفس.",
      "استخدام أدوية متعددة.",
      "أعراض انسحاب شديدة أو مستمرة.",
      "رغبة في استخدام دواء أو بديل نيكوتين.",
      "فشل محاولات إقلاع متكررة.",
      "استخدام أكثر من منتج نيكوتين في نفس الوقت.",
    ],
    when_to_seek_help_citation: "(FDA; USPSTF 2021)",
    emergency_disclaimer:
      "إذا كان لديك ألم شديد في الصدر، ضيق تنفس شديد، إغماء، سعال مصحوب بدم، أو أفكار بإيذاء نفسك، اطلب الرعاية الطبية العاجلة فورًا (الإسعاف 997).",
    followup_schedule: [
      "متابعة بعد 24 ساعة.",
      "متابعة بعد 3 أيام.",
      "متابعة بعد 7 أيام.",
      "متابعة بعد 14 يوم.",
      "متابعة بعد 28 يوم.",
    ],
    contact: {
      whatsapp: "https://wa.me/966555096412",
      email: "smokefreeksa@gmail.com",
      site: "https://aqla-support.lovable.app",
    },
    references: REFERENCES.map((r) => ({ id: r.id, full: r.full })),
  };
}
