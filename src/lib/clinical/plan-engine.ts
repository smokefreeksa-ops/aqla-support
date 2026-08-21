// Aqla Release 1 — deterministic behavioural plan engine.
// Same answers in => same plan_json out. No medication content can be produced here.

import { scoreFtnd } from "@/lib/scoring";
import {
  CLINICAL_RULE_VERSION,
  PLAN_SCHEMA_VERSION,
  PRIVACY_NOTICE_VERSION,
  canRenderMedicationContent,
} from "./release-flags";
import { evaluateSafety } from "./safety";
import { getJurisdictionProfile } from "./jurisdiction";
import type {
  ClinicalAnswers,
  ClinicalPlanJSON,
  DependenceStatus,
  Jurisdiction,
  LapsePathway,
  PlanSection,
  PlanVariant,
  QuitStrategy,
} from "./types";

const BAND_AR: Record<string, string> = {
  very_low: "اعتماد منخفض جدًا",
  low: "اعتماد منخفض",
  moderate: "اعتماد متوسط",
  high: "اعتماد مرتفع",
  very_high: "اعتماد مرتفع جدًا",
};

function quitDateFromChoice(choice?: string): string {
  const d = new Date();
  const offset =
    choice === "tomorrow"? 1 : choice === "in_7_days"? 7 : choice === "in_14_days" ? 14 : 0;
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

/**
 * The eleven Release 1 lifetime timeline sections.
 * Each section is generated as its own independent plan_json object — they are
 * never collapsed into a shared object rendered under different headings.
 */
export const LIFETIME_SECTION_IDS = [
  "preparation", "quit_day", "first_24_hours", "hours_24_to_72", "days_4_to_7", "weeks_2_to_4", "months_2_to_3", "months_4_to_6", "months_7_to_12", "after_one_year", "long_term_maintenance",
] as const;

export type LifetimeSectionId = (typeof LIFETIME_SECTION_IDS)[number];

function buildTimeline(strategy: QuitStrategy, nickname: string): PlanSection[] {
  const strategyIntro: Record<QuitStrategy, string[]> = {
    quit_now: ["أنت اخترت الإقلاع الفوري — يوم الإقلاع هو اليوم."],
    future_date: ["أنت اخترت تحديد تاريخ — استغل أيام التحضير كاملة."],
    reduce_to_quit: [
      "أنت اخترت التقليل ثم الإقلاع: قلّل 25% كل 3 أيام حتى تصل ليوم الإقلاع.", "أخّر أول سيجارة في اليوم 30 دقيقة إضافية كل يومين.",
    ],
    not_ready_yet: [
      "أنت لست جاهزًا بعد وهذا مقبول تمامًا. هذه الخطة للفهم والاستعداد فقط.", "سجّل كل سيجارة تدخنها لمدة أسبوع: الوقت، المكان، الشعور.",
    ],
  };

  const preparation: PlanSection = {
    id: "preparation",
    title_ar: "مرحلة التحضير (قبل يوم الإقلاع)",
    title_en: "Preparation",
    items: [
      ...strategyIntro[strategy],
      "حدّد يوم الإقلاع واكتبه في مكان تشوفه يوميًا.", "تخلّص من كل السجائر والولاعات والطفايات من البيت والسيارة والعمل.", "أخبر شخصًا واحدًا على الأقل بقرارك.", "اكتب أهم ثلاثة أسباب دفعتك للإقلاع واحتفظ فيها بجوالك.", "جهّز بدائل فورية: ماء، مكسرات غير مملحة، علكة، مسبحة، أو كرة ضغط.",
    ],
  };

  const quit_day: PlanSection = {
    id: "quit_day",
    title_ar: "يوم الإقلاع",
    title_en: "Quit day",
    items: [
      "ابدأ يومك بروتين مختلف: اشرب ماء بدل القهوة الأولى إذا كانت مرتبطة بالتدخين.", "تجنّب أماكن التدخين المعتادة اليوم بالكامل.", "أخبر من حولك أن اليوم هو يوم إقلاعك حتى لا يُعرض عليك التدخين.",
      `تذكّر يا ${nickname}: قرار اليوم واحد فقط — لا تفكر في بقية العمر.`,
    ],
  };

  const first_24_hours: PlanSection = {
    id: "first_24_hours",
    title_ar: "أول 24 ساعة",
    title_en: "First 24 hours",
    items: [
      "الرغبات في هذه الفترة متقاربة وقصيرة؛ كل رغبة عادةً تمر خلال دقائق.", "طبّق قاعدة الـ4 دقائق مع كل رغبة: تأجيل + ماء + تنفس عميق + انشغال.", "قلّل المواقف عالية الخطورة اليوم قدر ما تستطيع بدل مواجهتها كلها.", "نم مبكرًا إن أمكن؛ التعب يرفع احتمال الاستسلام للرغبة.",
    ],
  };

  const hours_24_to_72: PlanSection = {
    id: "hours_24_to_72",
    title_ar: "من 24 إلى 72 ساعة",
    title_en: "24–72 hours",
    items: [
      "أعراض الانسحاب عادةً تكون أشد في هذه الفترة لدى كثير من الناس: عصبية، أرق، صعوبة تركيز. هذا شائع ومؤقت.", "قلّل الكافيين تدريجيًا إذا لاحظت زيادة في التوتر أو صعوبة النوم.", "أكثر من شرب الماء ووزّع وجبات خفيفة على اليوم.", "لا تتخذ قرارات كبيرة أو نقاشات متوترة في هذه الأيام إن أمكن تأجيلها.",
    ],
  };

  const days_4_to_7: PlanSection = {
    id: "days_4_to_7",
    title_ar: "من اليوم 4 إلى اليوم 7",
    title_en: "Days 4–7",
    items: [
      "غالبًا تبدأ حدة الأعراض بالتراجع تدريجيًا، لكن المحفزات الموقفية تبقى قوية.", "امشِ 10 دقائق مرتين يوميًا — النشاط الخفيف يخفف الرغبة لدى كثيرين.", "راجع محفزاتك المكتوبة وأضف خطة مضادة لأي محفز فاجأك هذا الأسبوع.", "احتفل بنهاية الأسبوع الأول بمكافأة صغيرة غير مرتبطة بالتدخين.",
    ],
  };

  const weeks_2_to_4: PlanSection = {
    id: "weeks_2_to_4",
    title_ar: "الأسبوع 2 إلى الأسبوع 4",
    title_en: "Weeks 2–4",
    items: [
      "الرغبات تصير أقصر وأقل تكرارًا عادةً، لكنها أشد ارتباطًا بالمواقف والأشخاص.", "غيّر مسار طريقك، ومكان جلوسك، ووقت استراحتك.", "أكبر خطر في هذه المرحلة هو الثقة الزائدة: «سيجارة وحدة ما تضر» فخ حقيقي.", "ابدأ نشاطًا بدنيًا منتظمًا 3 مرات أسبوعيًا إذا كان مناسبًا لحالتك.",
    ],
  };

  const months_2_to_3: PlanSection = {
    id: "months_2_to_3",
    title_ar: "الشهر 2 إلى الشهر 3",
    title_en: "Months 2–3",
    items: [
      "كثير ممن يقلعون يلاحظون تحسنًا في التنفس والسعال خلال هذه الفترة؛ يختلف ذلك من شخص لآخر.", "راجع قائمة محفزاتك: أي محفز ما زال يزعجك؟ اكتب له خطة مخصصة.", "انتبه لتغيّر الوزن أو الشهية وعالجها بالنشاط والوجبات المنتظمة لا بالحرمان.", "ثبّت روتينًا أسبوعيًا لمراجعة تقدمك.",
    ],
  };

  const months_4_to_6: PlanSection = {
    id: "months_4_to_6",
    title_ar: "الشهر 4 إلى الشهر 6",
    title_en: "Months 4–6",
    items: [
      "ابدأ تعرّف نفسك كشخص غير مدخن، لا كمدخن يحاول التوقف.", "المناسبات الاجتماعية والسفر من أخطر مواقف هذه المرحلة — جهّز ردك المسبق.", "أعد قراءة أسبابك الثلاثة كل شهر.",
    ],
  };

  const months_7_to_12: PlanSection = {
    id: "months_7_to_12",
    title_ar: "الشهر 7 إلى الشهر 12",
    title_en: "Months 7–12",
    items: [
      "احتمال العودة للتدخين ينخفض عادةً، لكنه لا ينعدم، خصوصًا مع الضغوط الكبيرة.", "احتفظ بخطة التعامل مع الزلّة في جوالك حتى لو ما احتجتها.", "حدد شخص دعم واحد تتواصل معه عند أي ضغط مفاجئ.",
    ],
  };

  const after_one_year: PlanSection = {
    id: "after_one_year",
    title_ar: "بعد سنة",
    title_en: "After one year",
    items: [
      "الأدلة تشير إلى أن الإقلاع المستمر يقلّل مخاطر صحية عديدة مقارنة بالاستمرار في التدخين؛ المقدار يختلف حسب الشخص وتاريخه الصحي.", "أكثر أسباب العودة بعد سنة: أزمة مفاجئة، أو «تجربة سيجارة واحدة» في مناسبة.", "راجع أسبابك الثلاثة مرة كل سنة في تاريخ إقلاعك.",
    ],
  };

  const long_term_maintenance: PlanSection = {
    id: "long_term_maintenance",
    title_ar: "المحافظة طويلة المدى",
    title_en: "Long-term maintenance",
    items: [
      "اعتبر نفسك في وضع «محافظة دائمة»: لا سيجارة تجريبية، ولا استثناءات في السفر أو الأزمات.", "أعد تقييم مواقفك عالية الخطورة عند أي تغيّر كبير في حياتك (عمل جديد، فقد، انتقال).", "إذا حدثت زلّة بعد سنوات، ارجع لخطة الزلّة فورًا بدل الانتظار.", "شارك تجربتك مع شخص يفكر في الإقلاع — الاستمرارية تقوى بالمساندة.",
    ],
  };

  return [
    preparation,
    quit_day,
    first_24_hours,
    hours_24_to_72,
    days_4_to_7,
    weeks_2_to_4,
    months_2_to_3,
    months_4_to_6,
    months_7_to_12,
    after_one_year,
    long_term_maintenance,
  ];
}


const TRIGGER_PLAYBOOK: Record<string, string> = {
  coffee: "القهوة: غيّر نوع الكوب ومكان الشرب، واشرب ماء بارد بعدها مباشرة.",
  after_meal: "بعد الأكل: قم من الطاولة فورًا، اغسل أسنانك أو امشِ 5 دقائق.",
  stress: "التوتر: تنفّس 4-7-8 (شهيق 4، حبس 7، زفير 8) ثلاث دورات قبل أي قرار.",
  car: "السيارة: نظّفها من رائحة الدخان، وشغّل بودكاست أو قرآن طول الطريق.",
  social: "المجالس: قف في المكان غير المخصص للتدخين، وجهّز ردًا قصيرًا: «تركتها، شكرًا».",
  night: "السهر: حدد وقت نوم ثابت، والسهرة الطويلة أكبر باب للانتكاسة.",
  boredom: "الملل: جهّز قائمة 5 أنشطة قصيرة تنفذها فورًا بدل السيجارة.",
};

function buildLapsePathways(): LapsePathway[] {
  return [
    {
      id: "one_puff",
      title_ar: "سحبة واحدة",
      title_en: "One puff",
      trigger_ar: "أخذت سحبة أو نفسًا واحدًا فقط.",
      steps: [
        "توقف الآن. سحبة واحدة ليست انتكاسة ولا تلغي إنجازك.", "تخلّص من السيجارة فورًا واغسل يديك وفمك.", "اكتب في جوالك: وش الموقف اللي سبب السحبة؟", "أكمل نفس خطتك بدون أي تغيير — لا تعيد ضبط عدّاد أيامك.",
      ],
    },
    {
      id: "one_cigarette",
      title_ar: "سيجارة كاملة",
      title_en: "One cigarette",
      trigger_ar: "دخّنت سيجارة كاملة واحدة.",
      steps: [
        "هذه زلّة، وليست فشلًا. أغلب من أقلع نهائيًا مرّ بزلّة.", "تخلّص من أي سجائر متبقية معك الآن.", "حدد المحفز بدقة، وأضف له خطة مضادة مكتوبة.", "أبلغ شخص الدعم لديك اليوم — الصمت هو ما يحوّل الزلّة لانتكاسة.", "استأنف الإقلاع من هذه اللحظة، لا من الغد.",
      ],
    },
    {
      id: "one_day",
      title_ar: "يوم كامل من التدخين",
      title_en: "One full day",
      trigger_ar: "رجعت للتدخين ليوم كامل.",
      steps: [
        "أعد ضبط يوم إقلاع جديد خلال 48 ساعة كحد أقصى — لا تؤجله لبداية الشهر.", "أعد تنظيف البيئة: السجائر، الولاعات، الطفايات.", "راجع أي مرحلة من الجدول الزمني انهارت، وابدأ منها لا من الصفر.", "خفّض المحفز الأكبر لهذا اليوم بشكل مؤقت (مثلًا: تجنّب مجلس المدخنين أسبوعين).",
      ],
    },
    {
      id: "regular_relapse",
      title_ar: "العودة المنتظمة للتدخين",
      title_en: "Regular relapse",
      trigger_ar: "رجعت للتدخين بشكل منتظم لأكثر من أسبوع.",
      steps: [
        "هذه انتكاسة كاملة، وهي جزء معروف من رحلة الإقلاع وليست نهايتها.", "لا تبدأ من الصفر نفسيًا: كل محاولة سابقة ترفع فرص نجاح المحاولة القادمة.", "اطلب دعمًا مختصًا هذه المرة — المحاولة المدعومة أنجح من المحاولة الفردية.", "أعد تقييم مستوى الاعتماد لديك من جديد داخل المنصة قبل المحاولة التالية.", "حدد محاولة جديدة بتاريخ واضح، وغيّر عاملًا واحدًا على الأقل عن المحاولة السابقة.",
      ],
    },
  ];
}

export interface GenerateInput {
  answers: ClinicalAnswers;
  planVersion: number;
}

export function generatePlan({ answers, planVersion }: GenerateInput): ClinicalPlanJSON {
  const jurisdiction: Jurisdiction = answers.jurisdiction ?? "GENERIC";
  const profile = getJurisdictionProfile(jurisdiction);
  const nickname = (answers.nickname ?? "صديقي").trim() || "صديقي";
  const safety = evaluateSafety(answers, jurisdiction);

  // Dependence
  const isCig = (answers.products ?? []).includes("cigarettes");
  const ftndComplete =
    isCig &&
    answers.ftnd_opt_in === true &&
    [answers.ftnd_q1, answers.ftnd_q2, answers.ftnd_q3, answers.ftnd_q4, answers.ftnd_q5, answers.ftnd_q6].every(
      (v) => typeof v === "number",
    );

  let dependence_status: DependenceStatus = "descriptive_only";
  let ftndTotal: number | null = null;
  let bandAr: string | null = null;
  if (ftndComplete) {
    const scored = scoreFtnd({
      q1: answers.ftnd_q1!,
      q2: answers.ftnd_q2!,
      q3: answers.ftnd_q3!,
      q4: answers.ftnd_q4!,
      q5: answers.ftnd_q5!,
      q6: answers.ftnd_q6!,
    });
    ftndTotal = scored.total;
    bandAr = BAND_AR[scored.category] ?? null;
    dependence_status = "ftnd_scored";
  } else if (isCig && answers.ftnd_opt_in === false) {
    dependence_status = "ftnd_declined";
  }

  const descriptive_notes: string[] = [];
  if (answers.vape_pattern) descriptive_notes.push("نمط استخدام الفيب مسجّل وصفيًا (بدون درجة اعتماد رقمية).");
  if (answers.shisha_frequency) descriptive_notes.push("تكرار استخدام الشيشة مسجّل وصفيًا (بدون درجة اعتماد رقمية).");
  if (answers.pouch_frequency) descriptive_notes.push("استخدام أكياس النيكوتين مسجّل وصفيًا (بدون درجة اعتماد رقمية).");
  if (!isCig) {
    descriptive_notes.push(
      "لا يوجد مقياس اعتماد معتمد ومُتحقَّق منه لهذه المنتجات في هذه النسخة، لذلك نعتمد على وصف نمط الاستخدام فقط.",
    );
  }

  const strategy: QuitStrategy = answers.strategy ?? "quit_now";

  let plan_variant: PlanVariant = "adult_standard";
  if (safety.suppress_plan) plan_variant = "emergency_hold";
  else if (answers.age_band === "under_18") plan_variant = "adolescent";
  else if (answers.pregnancy === "pregnant"|| answers.pregnancy === "breastfeeding")
    plan_variant = "pregnancy";

  const timeline = safety.suppress_plan ? [] : buildTimeline(strategy, nickname);

  const trigger_plan: PlanSection = {
    id: "triggers",
    title_ar: "خطة المحفزات",
    title_en: "Trigger plan",
    items: (answers.triggers ?? []).map((t) => TRIGGER_PLAYBOOK[t]).filter(Boolean) as string[],
  };
  if (trigger_plan.items.length === 0) {
    trigger_plan.items.push("راقب أسبوعًا كاملًا ودوّن المواقف التي تزيد فيها الرغبة، ثم ابنِ خطة لكل موقف.");
  }

  const craving_management: PlanSection = {
    id: "craving",
    title_ar: "إدارة الرغبة الملحّة",
    title_en: "Craving management",
    items: [
      "الرغبة موجة: ترتفع وتنزل خلال 3 – 5 دقائق. مهمتك أن تعبرها لا أن تقاومها للأبد.", "قاعدة الـ4D: أجّل (Delay)، تنفّس عميق (Deep breathe)، اشرب ماء (Drink water)، اشغل نفسك (Distract).", "قم من مكانك وغيّر الغرفة فورًا عند الرغبة القوية.", "استخدم يديك: مسبحة، كرة ضغط، أو ترتيب شيء أمامك.", "لا تقل «ما أقدر أدخن»، قل «أنا اخترت ما أدخن» — الفرق في الشعور كبير.",
    ],
  };

  const support: PlanSection = {
    id: "support",
    title_ar: "شبكة الدعم",
    title_en: "Support",
    items: [
      answers.supporter && answers.supporter !== "لا أحد"
        ? `شارك ${answers.supporter} تقدّمك مرة كل أسبوع على الأقل.`
        : "حاول تختار شخصًا واحدًا تخبره بقرارك — الدعم يضاعف فرص النجاح.", "سجّل تقدمك اليومي داخل منصة أقلع.",
      profile.support_ar,
    ],
  };

  let money: PlanSection | null = null;
  if (answers.money_opt_in && typeof answers.weekly_spend === "number" && answers.weekly_spend > 0) {
    const w = answers.weekly_spend;
    money = {
      id: "money",
      title_ar: "التوفير المالي",
      title_en: "Money saved",
      items: [
        `في الشهر: ${Math.round(w * 4.33).toLocaleString("ar-SA")} ريال تقريبًا.`,
        `في السنة: ${Math.round(w * 52).toLocaleString("ar-SA")} ريال تقريبًا.`,
        `في 5 سنوات: ${Math.round(w * 52 * 5).toLocaleString("ar-SA")} ريال تقريبًا.`, "خصّص جزءًا من هذا المبلغ لمكافأة نفسك في نهاية كل شهر ناجح.",
      ],
    };
  }

  const services: PlanSection = {
    id: "services",
    title_ar: "خدمات وإحالات",
    title_en: "Services",
    items: [...profile.services, ...safety.actions_ar],
  };

  const references = [
    "WHO — Tobacco cessation guideline (behavioural support).", "US CDC — Quitting smoking: benefits timeline and behavioural strategies.", "Heatherton TF et al. The Fagerström Test for Nicotine Dependence (FTND).",
  ];

  // Structural guarantee: no medication content is included in Release 1.
  const medication_content_included = canRenderMedicationContent(null) as false;

  return {
    schema_version: PLAN_SCHEMA_VERSION,
    clinical_rule_version: CLINICAL_RULE_VERSION,
    plan_version: planVersion,
    generated_at: new Date().toISOString(),

    jurisdiction,
    country_code: answers.country_code ?? (jurisdiction === "SA"? "SA" : null),
    plan_variant,
    dependence_status,
    quit_strategy: strategy,
    safety_gate_level: safety.level,
    safety_flags: safety.flags,

    medication_content_included,

    identity: { nickname, city: answers.city ?? null },
    dependence: {
      instrument: dependence_status === "ftnd_scored"? "FTND" : null,
      total: ftndTotal,
      band_ar: bandAr,
      descriptive_notes,
    },
    readiness: {
      score: answers.readiness ?? null,
      text_ar:
        (answers.readiness ?? 0) >= 8
          ? "جاهزيتك عالية — استثمرها في أول 72 ساعة."
          : (answers.readiness ?? 0) >= 5
            ? "جاهزيتك متوسطة — ركّز على تقوية أسبابك قبل يوم الإقلاع.": "جاهزيتك منخفضة حاليًا، والهدف الآن هو الفهم والاستعداد لا الضغط.",
    },

    safety,
    privacy_notice_version: PRIVACY_NOTICE_VERSION,

    timeline,
    trigger_plan,
    craving_management,
    lapse_pathways: safety.suppress_plan ? [] : buildLapsePathways(),
    support,
    money,
    services,
    followup: safety.suppress_plan
      ? []
      : [
          { label_ar: "متابعة بعد 24 ساعة", offset_days: 1 },
          { label_ar: "متابعة بعد 3 أيام", offset_days: 3 },
          { label_ar: "متابعة بعد أسبوع", offset_days: 7 },
          { label_ar: "متابعة بعد شهر", offset_days: 30 },
          { label_ar: "متابعة بعد 3 أشهر", offset_days: 90 },
        ],
    references,
    disclaimer_ar:
      "هذه خطة دعم سلوكي تعليمية من منصة أقلع، وليست تشخيصًا طبيًا ولا وصفة علاجية. لا تحتوي هذه النسخة على أي محتوى دوائي. راجع مختصًا صحيًا قبل اتخاذ أي قرار علاجي.",
  };
}

export { quitDateFromChoice };
