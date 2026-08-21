// Deterministic plan builder for the Aqla Quit Engine.
import type {
  EngineAnswers,
  EngineResult,
  PlanSection,
  TriggerKey,
} from "./types";
import {
  classifyDependence,
  classifyReadiness,
  computeAqlaIntensity,
  computeHSI,
  hasSuicidalIdeation,
  requiresReferral,
  topTriggerPatterns,
} from "./scoring";

const DEPENDENCE_TEXT: Record<string, string> = {
  high: "يبدو أن النيكوتين يدخل يومك بقوة، وربما مبكرًا أو في أكثر من موقف. الأفضل ألا تواجه هذا وحدك. خطتك تحتاج دعمًا سلوكيًا، متابعة قريبة، ومناقشة العلاج المناسب مع مختص.",
  moderate: "النيكوتين ليس مجرد عادة بسيطة عندك. هناك اعتماد واضح ومحفزات متكررة. لا تحتاج جلد ذات؛ تحتاج خطة منظمة ومتابعة.",
  low_ritual: "يبدو أن النيكوتين عندك مرتبط أكثر بمواقف محددة من كونه حاضرًا طوال اليوم. هذه فرصة ممتازة. خطتك تبدأ بكسر أقوى 3 طقوس قبل أن تتحول إلى اعتماد أعمق.",
  complex_mixed: "لديك أكثر من باب يدخل منه النيكوتين. سنغلقها بترتيب: المنتج اليومي أولًا، ثم المنتج الاجتماعي، ثم محفزات الانتكاسة.",
};

const READINESS_TEXT: Record<string, string> = {
  ready_now: "أنت جاهز فعلًا. سنحدد تاريخ إقلاع خلال 14 يومًا ونبني خطة محكمة لأول 72 ساعة.",
  wants_but_low_confidence: "واضح أن الإقلاع مهم لك، لكن ثقتك ليست عالية بعد. هذا طبيعي. لا نحتاج وعدًا كبيرًا الآن؛ نحتاج خطة تجعل أول خطوة أسهل.",
  low_importance_high_confidence: "عندك القدرة، لكن السبب لم يكتمل بعد. سنشتغل على ربط الإقلاع بأقوى أسبابك الشخصية أولًا.",
  not_ready: "لا نريد أن نضغطك إلى وعد كبير لا تؤمن به. نريد أن نقرّبك خطوة من القرار.",
};

const TRIGGER_PLAN_TEMPLATES: Partial<Record<TriggerKey, PlanSection>> = {
  coffee: {
    title: "خطة 14 قهوة بلا دخان",
    steps: [
      "غيّر مكان القهوة.", "غيّر الكوب.", "اشرب ماء معها.", "بعد القهوة، امشِ دقيقتين.", "سجّل كل قهوة ناجحة.", "لا تشربها مع مدخنين أول أسبوعين.",
    ],
    craving_card: "هذه ليست حاجة قهوة. هذه ذاكرة نيكوتين. سأكمل القهوة بلا دخان، أشرب ماء، وأمشي دقيقتين.",
  },
  car: {
    title: "خطة السيارة النظيفة",
    steps: [
      "نظّف السيارة من الرائحة.", "أزل كل الولاعات والعلب.", "ضع ماء وعلكة داخل السيارة.", "جهّز محتوى صوتي مخصص للقيادة.", "لا قهوة داخل السيارة أول أسبوع إذا كانت محفزة.", "إذا اشتدت الرغبة: توقف في مكان آمن وامشِ.",
    ],
    craving_card: "الزحمة لا تحتاج سيجارة. سأشغل المحتوى الصوتي، أشرب ماء، وأبقي السيارة نظيفة.",
  },
  after_meal: {
    title: "خطة بعد الأكل",
    steps: [
      "انهض فورًا بعد الأكل.", "اغسل فمك أو أسنانك.", "امشِ خمس دقائق.", "لا تجلس في مكان التدخين المعتاد.", "جهّز ماء أو علكة خالية من السكر.",
    ],
    craving_card: "الأكل انتهى. لا أحتاج طقس الدخان بعده. سأقوم وأمشي 5 دقائق.",
  },
  stress: {
    title: "خطة التوتر بلا نيكوتين",
    steps: [
      "عند التوتر: لا قرار أول 60 ثانية.", "اخرج من المكان.", "تنفس 10 مرات ببطء.", "امشِ 5 دقائق.", "أرسل رسالة: عندي رغبة، أحتاج دعم.", "عالج المشكلة بعد الهدوء.",
    ],
    craving_card: "أنا غاضب، لا مدخن. سأخرج 5 دقائق قبل أي قرار.",
  },
  shisha_session: {
    title: "خطة الشيشة الاجتماعية",
    steps: [
      "لا تحضر جلسات شيشة أول 30 يومًا.", "اقترح جلسة بديلة لصديق واحد.", "لا تمسك الخرطوم حتى للمزاح.", "جهّز جملة: أنا مقلع، لا أجرب حتى نفس.", "استبدل الويكند بنشاط بلا دخان.",
    ],
    craving_card: "الجلسة لا تحتاج خرطومًا. إذا بدأت الشيشة، سأغادر أو أغير المكان.",
  },
  social: {
    title: "خطة المجالس والأصدقاء",
    steps: [
      "اختر مجلسًا واحدًا تتجنبه أول شهر.", "أخبر صديقًا واحدًا أنك مقلع.", "اجلس بعيدًا عن المدخنين في أي مجلس.", "جهّز جملة قصيرة للرفض دون حرج.", "اقترح نشاطًا بديلًا للجلسة (مشي، قهوة في مكان مفتوح).",
    ],
    craving_card: "أنا أحب صحبتهم، لكن لا أحب الدخان. سأبقى وأرفض بهدوء.",
  },
};

const VAPE_PLAN: PlanSection = {
  title: "خطة ضبط الفيب والخروج من النيكوتين",
  steps: [
    "سجّل عدد مرات الاستخدام أو أوقاته يوميًا.", "امنع الاستخدام في السرير والسيارة والحمام.", "حدد نوافذ استخدام مؤقتة إذا لم تكن جاهزًا للتوقف.", "ناقش خطة علاج أو تقليل مع مختص.", "الهدف النهائي: لا اعتماد على النيكوتين.",
  ],
  craving_card: "السحبة الواحدة ليست حلًا، هي إعادة برمجة. سأؤجل 10 دقائق وأمشي.",
};

function buildTriggerPlans(a: EngineAnswers): PlanSection[] {
  const out: PlanSection[] = [];
  const seen = new Set<string>();
  for (const t of a.triggers) {
    const tmpl = TRIGGER_PLAN_TEMPLATES[t];
    if (tmpl && !seen.has(tmpl.title)) {
      out.push(tmpl);
      seen.add(tmpl.title);
    }
    if (out.length >= 3) break;
  }
  if (
    a.vape_pattern === "طوال اليوم تقريبًا" ||
    a.vape_pattern === "أول شيء بعد الاستيقاظ" ||
    a.product_types.includes("vape")
  ) {
    if (!seen.has(VAPE_PLAN.title)) out.push(VAPE_PLAN);
  }
  return out;
}

function buildBasePlan(a: EngineAnswers, dep: string, ready: string): PlanSection {
  if (dep === "high") {
    return {
      title: "خطة الاعتماد المرتفع",
      steps: [
        "لا تواجه النيكوتين وحدك. ناقش العلاج المناسب مع طبيب/صيدلي/عيادة إقلاع.", "لا تبدأ يوم الإقلاع دون خطة انسحاب واضحة.", "استخدم متابعة قريبة (شخص داعم + مختص).", "اجعل أول استخدام صباحي هو الهدف الأول الذي تكسره.", "تجنب المجالس عالية الخطورة أول شهر كامل.",
      ],
    };
  }
  if (ready === "ready_now"|| ready === "wants_but_low_confidence") {
    return {
      title: "خطة 14 يومًا قبل الإقلاع",
      steps: [
        "حدد تاريخ الإقلاع خلال 7–14 يومًا.", "قبل التاريخ بـ 7 أيام: سجّل كل استخدام.", "قبل التاريخ بـ 5 أيام: نظّف السيارة والبيت من الأدوات.", "قبل التاريخ بـ 3 أيام: أخبر شخصًا داعمًا.", "قبل التاريخ بيوم: جهّز بطاقة الرغبة وسلة البدائل.", "يوم الإقلاع: لا تختبر نفسك في مجلس دخان.", "أول 72 ساعة: اتبع الخطة اليومية حرفيًا.",
      ],
    };
  }
  return {
    title: "خطة الاقتراب من القرار",
    steps: [
      "اجعل البيت والسيارة بلا دخان.", "سجّل استخدامك 7 أيام.", "اختر محفزًا واحدًا فقط لتغييره.", "جرّب 24 ساعة بلا نيكوتين أو تأخير أول استخدام.", "اقرأ أسبابك الشخصية كل صباح.", "احجز استشارة دون التزام إذا أمكن.",
    ],
  };
}

function firstStep24h(triggers: TriggerKey[]): string {
  if (triggers.includes("coffee")) return "غدًا صباحًا: اشرب قهوتك في مكان جديد بلا أي منتج نيكوتين، ثم امشِ دقيقتين.";
  if (triggers.includes("car")) return "اليوم: نظّف سيارتك من كل ولاعة وعلبة، وضع ماء وعلكة بدلًا منها.";
  if (triggers.includes("after_meal")) return "اليوم بعد أول وجبة: قم فورًا، اغسل أسنانك، وامشِ 5 دقائق بدلًا من جلسة الدخان.";
  if (triggers.includes("stress") || triggers.includes("anxiety")) return "عند أول لحظة توتر اليوم: لا تتخذ قرارًا أول 60 ثانية، اخرج من المكان، وتنفس 10 أنفاس بطيئة.";
  if (triggers.includes("shisha_session") || triggers.includes("social")) return "خلال 24 ساعة: اعتذر عن أول جلسة شيشة أو دخان قادمة، واقترح بديلًا.";
  return "اليوم: اكتب أهم 3 أسباب تجعلك تريد الإقلاع، وضعها في مكان تراه كل صباح.";
}

export function buildPlan(a: EngineAnswers): EngineResult {
  const suicidal = hasSuicidalIdeation(a);
  const intensity = computeAqlaIntensity(a);
  const hsi = computeHSI(a);
  const dep = classifyDependence(a, intensity);
  const ready = classifyReadiness(a);
  const patterns = topTriggerPatterns(a);
  const referral = requiresReferral(a) || dep === "high"|| dep === "complex_mixed";

  const triggerPlans = buildTriggerPlans(a);
  const basePlan = buildBasePlan(a, dep, ready);
  const cravingCard =
    triggerPlans[0]?.craving_card ??
    "هذه الرغبة موجة لا تتجاوز 3 دقائق. سأشرب ماء، أمشي، وأذكر سببي الشخصي.";

  const result: EngineResult = {
    result_title: "نتيجتك ليست حكمًا عليك",
    human_explanation: DEPENDENCE_TEXT[dep],
    pattern_labels: patterns.slice(0, 3),
    primary_trigger_pattern: patterns[0] ?? "لم تُحدد محفزات واضحة بعد",
    secondary_trigger_pattern: patterns[1],
    dependence_category: dep,
    dependence_text: DEPENDENCE_TEXT[dep],
    hsi_score: hsi,
    aqla_intensity_score: intensity,
    readiness_category: ready,
    readiness_text: READINESS_TEXT[ready],
    first_24h_step: firstStep24h(a.triggers),
    seven_day_plan: [
      { day: 1, task: "سجّل كل استخدام للنيكوتين خلال اليوم." },
      { day: 2, task: "اكتب سببك الشخصي الأقوى وعلّقه في مكان تراه." },
      { day: 3, task: "غيّر أقوى محفز عندك (قهوة/سيارة/مجلس)." },
      { day: 4, task: "اختر داعمًا واحدًا وأخبره أنك بدأت." },
      { day: 5, task: "جهّز بطاقة الرغبة وسلة بدائل (ماء، علكة، تمر)." },
      { day: 6, task: "ناقش خيارات العلاج مع مختص إذا كان الاعتماد مرتفعًا." },
      { day: 7, task: "حدد تاريخ الإقلاع أو تاريخ التجربة." },
    ],
    seventy_two_hour_plan: [
      "لا مجالس دخان.", "لا سيارة فيها أدوات تدخين.", "لا قهوة في المكان القديم.", "بعد الأكل: حركة وتنظيف فم.", "عند الرغبة: استخدم بطاقة الطوارئ.", "متابعة قصيرة مع شخصك الداعم بعد 3 أيام.",
    ],
    trigger_plans: triggerPlans,
    base_plan: basePlan,
    craving_card: cravingCard,
    referral_needed: referral,
    referral_message: referral
      ? "بناءً على إجاباتك، الأفضل أن تتواصل مع طبيب أو صيدلي أو عيادة إقلاع قبل اختيار أي علاج دوائي. هذا لا يعني أن حالتك صعبة فقط، بل يعني أن خطتك تستحق أن تكون آمنة وقوية.": "لا يظهر من إجاباتك ما يستدعي إحالة عاجلة، لكن يمكنك دائمًا مناقشة خيارات الدعم والعلاج مع صيدلي أو طبيب إذا رغبت.",
    safety_immediate: suicidal
      ? "سلامتك أهم من الإقلاع الآن. إذا لديك أفكار إيذاء للنفس أو تشعر أنك في خطر، تواصل فورًا مع خدمات الطوارئ في بلدك أو شخص موثوق قريب منك. يمكننا العودة لخطة الإقلاع بعد تأمين سلامتك."
      : undefined,
    personal_reasons: a.personal_reasons,
    support_message_template: a.support_person_name
      ? `عندي رغبة الآن. أحتاجك تذكرني بسبب إقلاعي وتخليني أعدّي 10 دقائق.`
      : undefined,
    follow_up_schedule: [
      { type: "day_3", offset_days: 3, label_ar: "متابعة بعد 3 أيام" },
      { type: "day_7", offset_days: 7, label_ar: "متابعة بعد 7 أيام" },
      { type: "day_30", offset_days: 30, label_ar: "متابعة بعد 30 يومًا" },
    ],
    share_text:
      "بدأت اليوم أفهم علاقتي بالنيكوتين بشكل أوضح مع أقلع. النتيجة ليست حكمًا عليّ، لكنها خريطة تساعدني أبدأ خطوة عملية. جرّبها أنت الآن.",
  };
  return result;
}
