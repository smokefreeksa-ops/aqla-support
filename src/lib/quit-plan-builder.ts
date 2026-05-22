// Build a structured Arabic quit-plan JSON from intake answers + deterministic score.
// AI never runs here. Pure functions.

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
export type QuitGoal = "quit_full" | "reduce_first" | "understand";
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
  readiness: ReadinessStage;
  goal: QuitGoal;
  quit_date?: string | null;
  triggers: string[];
  support_person?: { name?: string; relation?: string; phone?: string } | null;
  followup_preference?: "email" | "whatsapp" | "none";
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
  // Youth / loss of control override
  if (intake.product === "youth" || (intake.age && intake.age < 18)) {
    const r = scoreHonc(a as HoncAnswers);
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
      const r = scoreFtnd(a as FtndAnswers);
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
      const r = scorePennStateEcig(a as PennStateEcigAnswers);
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
      const r = scoreLwds11(a as Lwds11Answers);
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
      const r = scoreOralNicotineAdapted(a as OralNicotineAnswers);
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
      // Fallback: treat as cigarettes-style FTND if answers provided, else zero
      try {
        const r = scoreFtnd(a as FtndAnswers);
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

export interface QuitPlanJSON {
  meta: {
    generated_at: string;
    version: 1;
  };
  identity: {
    nickname: string;
    email: string;
    city: string;
  };
  use: {
    product: QuitProduct;
    product_ar: string;
    age?: number;
  };
  assessment: QuitPlanScore;
  readiness: { code: ReadinessStage; label_ar: string };
  goal: { code: QuitGoal; label_ar: string };
  dates: { quit_or_reduce_date: string | null; followup_next: string };
  triggers: string[];
  trigger_plan: string[];
  craving_rescue: string[];
  first_24h: string[];
  first_7d: string[];
  follow_up_28d: string[];
  relapse_plan: string[];
  support_person_plan: string[];
  pharmacy_discussion: {
    intro: string;
    nrt_options: string[];
    prescription_options: string[];
    important_notes: string[];
  };
  when_to_seek_help: string[];
  emergency_disclaimer: string;
  contact: { whatsapp: string; email: string; site: string };
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

  const trigger_plan = triggers.map(
    (t) =>
      `عند مواجهة "${t}": خذ نفسًا عميقًا 4 ثواني، اشرب ماء، وحوّل النشاط (مشي قصير / مكالمة لشخص داعم) لمدة 5 دقائق قبل أي قرار.`,
  );

  return {
    meta: { generated_at: now.toISOString(), version: 1 },
    identity: { nickname: intake.nickname, email: intake.email, city: intake.city },
    use: { product: intake.product, product_ar: PRODUCT_AR[intake.product], age: intake.age },
    assessment: score,
    readiness: { code: intake.readiness, label_ar: READINESS_AR[intake.readiness] },
    goal: { code: intake.goal, label_ar: GOAL_AR[intake.goal] },
    dates: {
      quit_or_reduce_date: quitDate,
      followup_next: addDays(now, 7),
    },
    triggers,
    trigger_plan,
    craving_rescue: [
      "تذكّر أن أغلب الرغبة تمر خلال 3-5 دقائق.",
      "تقنية 4-7-8 للتنفس: شهيق 4، حبس 7، زفير 8.",
      "اشرب كوب ماء بارد ببطء.",
      "غيّر المكان مباشرة لمدة 5 دقائق.",
      "تواصل مع شخص الدعم أو اكتب شعورك في ملاحظة قصيرة.",
    ],
    first_24h: [
      "تخلّص من السجائر/الأجهزة/المنتجات من المنزل والسيارة.",
      "أبلغ شخص ثقة بقرارك.",
      "خطّط لـ 3 وجبات منتظمة + ماء كافٍ.",
      "تجنّب المثيرات الأقوى اليوم (قهوة قوية، سهرة مدخنين).",
      "نم مبكرًا، فالنوم يقلّل الرغبة.",
    ],
    first_7d: [
      "احتفظ بمذكرة يومية قصيرة: متى جاءت الرغبة، وما الذي ساعد.",
      "حرّك المال الذي كنت تنفقه إلى حصّالة/تحويل شهري.",
      "خصّص مكافأة صغيرة بنهاية اليوم 3 ويوم 7.",
      "ابتعد عن الأماكن التي ترتبط بقوة بالاستخدام أول أسبوع.",
      "إذا حدث رجوع: لا تحكم على نفسك، عدّ للخطة من نفس النقطة.",
    ],
    follow_up_28d: [
      "راجع خطتك بعد 28 يومًا واحتفل بأي تقدم.",
      "حدّث قائمة المثيرات بعد التجربة الواقعية.",
      "إذا الرغبة ما زالت قوية، ناقش مع صيدلي/طبيب خيارات الدعم.",
      "ضع هدفًا جديدًا لـ 3 أشهر القادمة.",
    ],
    relapse_plan: [
      "الرجوع جزء طبيعي من رحلة الإقلاع، وليس فشلًا.",
      "سجّل: ما الذي حصل قبل الرجوع، وما الذي يمكن تغييره.",
      "أعد ضبط تاريخ الإقلاع خلال 24-72 ساعة.",
      "إذا تكرّر الرجوع، اطلب دعمًا مهنيًا (صيدلي/طبيب/مختص).",
    ],
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
        "هذه خيارات يمكنك مناقشتها مع صيدلي أو طبيب. اختيار المنتج أو الجرعة المناسبة يحتاج مراجعة صيدلي أو طبيب.",
      nrt_options: [
        "لصقات النيكوتين",
        "علكة النيكوتين",
        "أقراص/مصّات النيكوتين",
        "بخاخ النيكوتين إن كان متاحًا",
        "مستنشق النيكوتين إن كان متاحًا",
      ],
      prescription_options: [
        "Varenicline / Champix — يُسأل عنه الطبيب أو الصيدلي.",
        "Bupropion — يُسأل عنه الطبيب أو الصيدلي.",
      ],
      important_notes: [
        "أقلع لا يصف أدوية ولا يحدد جرعات.",
        "اختيار المنتج أو الجرعة المناسبة يحتاج مراجعة صيدلي أو طبيب.",
        "أبلغ الصيدلي/الطبيب بأي حالة صحية أو حمل أو رضاعة أو أدوية أخرى.",
      ],
    },
    when_to_seek_help: [
      "إذا تكرر الرجوع رغم المحاولة الجادة.",
      "إذا ظهرت أعراض انسحاب شديدة (قلق/اكتئاب/أرق متواصل).",
      "إذا كان هناك حمل أو حالات قلب/تنفس مزمنة.",
      "إذا كان عمرك أقل من 18 وتشعر بفقدان السيطرة على الاستخدام.",
    ],
    emergency_disclaimer:
      "في حال ألم شديد في الصدر، أو ضيق تنفس حاد، أو إغماء، أو سعال دم، أو أفكار لإيذاء النفس — توجّه فورًا لأقرب طوارئ أو اتصل بالإسعاف 997.",
    contact: {
      whatsapp: "https://wa.me/966555096412",
      email: "smokefreeksa@gmail.com",
      site: "https://aqla-support.lovable.app",
    },
  };
}
