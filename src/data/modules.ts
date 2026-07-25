// Aqla Academy — 7 Modules (assessment v2)
// -----------------------------------------------------------------------------
// Content aligned with:
//   • WHO Tobacco Fact Sheet (2024)
//   • WHO Clinical Treatment Guideline for Tobacco Cessation in Adults (2024)
//   • WHO MPOWER
//   • U.S. CDC — Smoking & Tobacco Use / Benefits of Quitting / Nicotine Addiction
//   • U.S. Surgeon General — Smoking Cessation (2020)
//   • Saudi MoH — 937 medical hotline, 911 unified emergency number
//
// v2 CHANGES vs v1:
//   • Correct answers are stored by STABLE KEY, never by position.
//   • Option order is shuffled per attempt at the UI layer.
//   • Every question carries difficulty / competency / source / safetyCritical.
//   • 8 questions per module (was 2–3), with realistic distractors — no
//     absurd, insulting, or "guess-B" pattern.
//   • Safety-critical items MUST all be answered correctly for the certificate.
// -----------------------------------------------------------------------------

import type { AssessmentQuestion, Bi } from "@/lib/assessment-runtime";

export type { Bi };

export type ModuleSection = { heading: Bi; body: Bi };

export type Module = {
  num: string;
  slug: string;
  title: Bi;
  summary: Bi;
  duration: Bi;
  tags: string[];
  wide?: boolean;
  featured?: boolean;
  content: ModuleSection[];
  sources: { label: string; url: string }[];
  quiz: AssessmentQuestion[];
};

// Tiny helper to keep the item bank readable.
type Q = AssessmentQuestion;
const q = (item: Q): Q => item;

// -----------------------------------------------------------------------------
// MODULE 1 — Foundations of Tobacco, Nicotine and Public Health
// -----------------------------------------------------------------------------
const M1: Q[] = [
  q({
    id: "acad.m1.q1",
    q: {
      ar: "أي عبارة تصف النيكوتين بدقة؟",
      en: "Which statement best describes nicotine?",
    },
    options: [
      { key: "a", ar: "مادة مضادة للاكتئاب معتمدة طبيًا", en: "A medically approved antidepressant" },
      { key: "b", ar: "مادة مسبّبة للاعتماد توجد في التبغ ومنتجات النيكوتين", en: "A dependence-forming substance found in tobacco and nicotine products" },
      { key: "c", ar: "فيتامين يساعد على التركيز", en: "A vitamin that helps concentration" },
      { key: "d", ar: "مادة عطرية تُضاف للنكهة", en: "An aromatic flavouring additive" },
    ],
    correctKey: "b",
    explanation: {
      ar: "النيكوتين مادة مسبّبة للاعتماد؛ وليس علاجًا ولا فيتامينًا.",
      en: "Nicotine is a dependence-forming psychoactive substance — not a treatment, not a vitamin.",
    },
    difficulty: "foundational",
    competency: "tobacco_basics",
    source: "U.S. Surgeon General 2020",
  }),
  q({
    id: "acad.m1.q2",
    q: {
      ar: "دخان السيجارة يحتوي على كم مادة كيميائية تقريبًا؟",
      en: "Approximately how many chemicals are in cigarette smoke?",
    },
    options: [
      { key: "a", ar: "أقل من 100 مادة", en: "Fewer than 100" },
      { key: "b", ar: "حوالي 700 مادة", en: "About 700" },
      { key: "c", ar: "أكثر من 7,000 مادة، منها عشرات المسرطنات", en: "More than 7,000, including dozens of carcinogens" },
      { key: "d", ar: "مادة واحدة فقط هي النيكوتين", en: "Only one — nicotine" },
    ],
    correctKey: "c",
    explanation: {
      ar: "CDC: أكثر من 7,000 مادة كيميائية، ونحو 69 منها مسبّب معروف للسرطان.",
      en: "CDC: >7,000 chemicals; about 69 are known human carcinogens.",
    },
    difficulty: "foundational",
    competency: "tobacco_basics",
    source: "CDC",
  }),
  q({
    id: "acad.m1.q3",
    q: {
      ar: "ما الفرق العملي بين الاعتماد على النيكوتين وأضرار الاحتراق؟",
      en: "What is the practical difference between nicotine dependence and combustion harm?",
    },
    options: [
      { key: "a", ar: "لا يوجد فرق؛ كلاهما نفس المفهوم", en: "There is no difference; they are the same" },
      { key: "b", ar: "النيكوتين هو ما يسبّب الإدمان، بينما معظم أمراض القلب والسرطان تنتج من مواد الاحتراق الأخرى", en: "Nicotine drives dependence; most heart and cancer disease comes from other combustion products" },
      { key: "c", ar: "الاحتراق يسبب الإدمان، والنيكوتين لا يضر أبدًا", en: "Combustion causes addiction, and nicotine is entirely harmless" },
      { key: "d", ar: "الفرق نظري ولا يؤثر على الرسائل التوعوية", en: "The distinction is academic and does not affect messaging" },
    ],
    correctKey: "b",
    explanation: {
      ar: "التمييز مهم عمليًا: الاعتماد سببه النيكوتين، لكن معظم الأمراض المميتة سببها الاحتراق ومكوناته.",
      en: "The distinction matters: dependence is driven by nicotine, but most lethal disease is driven by combustion products.",
    },
    difficulty: "intermediate",
    competency: "tobacco_basics",
    source: "U.S. Surgeon General 2020",
  }),
  q({
    id: "acad.m1.q4",
    q: {
      ar: "ما المستوى الآمن للتعرض للتدخين السلبي حسب منظمة الصحة العالمية؟",
      en: "What is the safe level of exposure to second-hand smoke according to WHO?",
    },
    options: [
      { key: "a", ar: "أقل من 10 دقائق يوميًا", en: "Under 10 minutes per day" },
      { key: "b", ar: "لا يوجد مستوى آمن معروف", en: "There is no known safe level" },
      { key: "c", ar: "خارج المنازل فقط", en: "Only outdoors" },
      { key: "d", ar: "عند تشغيل المروحة", en: "When a fan is running" },
    ],
    correctKey: "b",
    explanation: {
      ar: "WHO / CDC: لا يوجد مستوى آمن للتعرض للتدخين السلبي.",
      en: "WHO and CDC state there is no safe level of second-hand smoke exposure.",
    },
    difficulty: "foundational",
    competency: "secondhand_smoke",
    source: "WHO 2024",
  }),
  q({
    id: "acad.m1.q5",
    q: {
      ar: "شخص يقول لك «التدخين اختيار شخصي، لا شأن لك». ما الرد الأنسب لمتطوع أقلع؟",
      en: "Someone says: “Smoking is my personal choice; it's none of your business.” What is the best volunteer response?",
    },
    options: [
      { key: "a", ar: "إخباره بأن هذا ضعف شخصية", en: "Tell them this is a character weakness" },
      { key: "b", ar: "الجدال حتى يقتنع بالإقلاع", en: "Argue until they agree to quit" },
      { key: "c", ar: "احترام قراره وعرض المعلومة إذا أذن، مع ترك الباب مفتوحًا للدعم لاحقًا", en: "Respect their autonomy, offer information only with permission, and leave the door open for later support" },
      { key: "d", ar: "تجاهله والانتقال لشخص آخر دون أي رد", en: "Ignore them and walk away without any reply" },
    ],
    correctKey: "c",
    explanation: {
      ar: "المبدأ التوعوي: احترام الاستقلالية، وطلب الإذن، وعدم الوصم أو الضغط.",
      en: "Respect autonomy, ask permission, avoid stigma or coercion.",
    },
    difficulty: "intermediate",
    competency: "communication",
    source: "Aqla Volunteer Playbook",
  }),
  q({
    id: "acad.m1.q6",
    q: {
      ar: "ما الدور المناسب لمتطوع أقلع؟",
      en: "What is the appropriate role of an Aqla volunteer?",
    },
    options: [
      { key: "a", ar: "التوعية والاستماع والإحالة الآمنة للمختصين", en: "Awareness, listening, and safe referral to qualified professionals" },
      { key: "b", ar: "تشخيص درجة الاعتماد وإقرار الجرعات", en: "Diagnosing dependence and setting medication doses" },
      { key: "c", ar: "وصف الأدوية عند الحاجة", en: "Prescribing medication when needed" },
      { key: "d", ar: "الضغط على المستخدم لتحديد يوم الإقلاع فورًا", en: "Pressuring the user to set a quit date immediately" },
    ],
    correctKey: "a",
    explanation: {
      ar: "المتطوع لا يشخّص ولا يصف؛ يوفّر توعية ومساندة وإحالة.",
      en: "Volunteers do not diagnose or prescribe — they educate, support, and refer.",
    },
    difficulty: "foundational",
    competency: "scope_of_practice",
    safetyCritical: true,
    source: "Aqla Volunteer Playbook",
  }),
  q({
    id: "acad.m1.q7",
    q: {
      ar: "الشيشة أقل ضررًا من السجائر — هل هذه العبارة دقيقة؟",
      en: "“Waterpipe (shisha) is much less harmful than cigarettes” — is this accurate?",
    },
    options: [
      { key: "a", ar: "نعم، جلسة الشيشة أقل ضررًا بكثير من سيجارة واحدة", en: "Yes, a shisha session is much less harmful than one cigarette" },
      { key: "b", ar: "لا؛ جلسة نموذجية قد تعادل التعرّض لدخان مئة سيجارة أو أكثر", en: "No — a typical session can equal the smoke of 100+ cigarettes" },
      { key: "c", ar: "الماء يُنقّي الدخان تمامًا", en: "The water fully filters the smoke" },
      { key: "d", ar: "الشيشة خالية من النيكوتين", en: "Shisha contains no nicotine" },
    ],
    correctKey: "b",
    explanation: {
      ar: "WHO: جلسة شيشة نموذجية (45–60 دقيقة) قد تعادل التعرّض لدخان 100 سيجارة أو أكثر، والماء لا ينقّي المواد الضارة.",
      en: "WHO: a typical 45–60 min waterpipe session can equal the smoke of 100+ cigarettes; water does not filter out the harmful constituents.",
    },
    difficulty: "intermediate",
    competency: "tobacco_products",
    source: "WHO Waterpipe Advisory",
  }),
  q({
    id: "acad.m1.q8",
    q: {
      ar: "أيّ لغة مناسبة عند وصف شخص يستخدم التبغ؟",
      en: "Which language is appropriate when describing a person who uses tobacco?",
    },
    options: [
      { key: "a", ar: "«مدمن ضعيف الإرادة»", en: "“Weak-willed addict”" },
      { key: "b", ar: "«شخص يستخدم التبغ» أو «شخص يعيش مع الاعتماد على النيكوتين»", en: "“Person who uses tobacco” or “person living with nicotine dependence”" },
      { key: "c", ar: "«فاشل صحي»", en: "“Health failure”" },
      { key: "d", ar: "«ضحية دائمة»", en: "“Permanent victim”" },
    ],
    correctKey: "b",
    explanation: {
      ar: "اللغة المحترمة المتمحورة حول الشخص تقلّل الوصمة وتزيد استعداده للحوار.",
      en: "Person-first, respectful language reduces stigma and increases openness to support.",
    },
    difficulty: "foundational",
    competency: "communication",
    source: "WHO / person-first language guidance",
  }),
];

// -----------------------------------------------------------------------------
// MODULE 2 — Dependence, Withdrawal and Product Use
// -----------------------------------------------------------------------------
const M2: Q[] = [
  q({
    id: "acad.m2.q1",
    q: {
      ar: "أي مما يلي مؤشر معتمد على شدّة الاعتماد على النيكوتين؟",
      en: "Which is a recognised indicator of higher nicotine dependence?",
    },
    options: [
      { key: "a", ar: "الوقت القصير بين الاستيقاظ وأول استخدام للنيكوتين", en: "Short time from waking to first nicotine use" },
      { key: "b", ar: "الاستخدام في المناسبات الاجتماعية فقط", en: "Use only at social occasions" },
      { key: "c", ar: "تفضيل نكهات معينة", en: "Preferring certain flavours" },
      { key: "d", ar: "استخدام قداحة ملوّنة", en: "Using a coloured lighter" },
    ],
    correctKey: "a",
    explanation: {
      ar: "«وقت أول سيجارة بعد الاستيقاظ» أحد أقوى مؤشرات الاعتماد (مقياس فاجرستروم).",
      en: "Time to first cigarette after waking is one of the strongest dependence indicators (Fagerström scale).",
    },
    difficulty: "intermediate",
    competency: "dependence",
    source: "Fagerström / WHO 2024",
  }),
  q({
    id: "acad.m2.q2",
    q: {
      ar: "أعراض الانسحاب من النيكوتين تشمل عادةً:",
      en: "Typical nicotine withdrawal symptoms include:",
    },
    options: [
      { key: "a", ar: "ارتفاع حاد في ضغط الدم يستوجب دخول المستشفى", en: "A hypertensive crisis that requires hospitalisation" },
      { key: "b", ar: "التهيّج والقلق وصعوبة التركيز واشتهاء النيكوتين", en: "Irritability, anxiety, difficulty concentrating, and cravings" },
      { key: "c", ar: "طفح جلدي دائم", en: "A permanent skin rash" },
      { key: "d", ar: "فقدان مؤقت للنطق", en: "Temporary loss of speech" },
    ],
    correctKey: "b",
    explanation: {
      ar: "الأعراض السلوكية والمزاجية شائعة ومؤقتة، وتخفّ خلال أسابيع قليلة.",
      en: "Mood, cognitive and craving symptoms are common and time-limited (usually eases within a few weeks).",
    },
    difficulty: "foundational",
    competency: "withdrawal",
    source: "CDC / U.S. Surgeon General 2020",
  }),
  q({
    id: "acad.m2.q3",
    q: {
      ar: "شخص يستخدم السجائر والفيب معًا. ما التصرّف الصحيح؟",
      en: "A person uses both cigarettes and vapes. What is the correct response?",
    },
    options: [
      { key: "a", ar: "إخباره بأن الفيب يُلغي ضرر السجائر تمامًا", en: "Tell them vaping cancels out the harm of cigarettes" },
      { key: "b", ar: "طلب إذنه لجمع معلوماته ثم إحالته إلى تقييم مختص لدراسة الاستخدام المزدوج", en: "With permission, gather basic information and refer them to a qualified assessment that addresses dual use" },
      { key: "c", ar: "افتراض أنه ملتزم بالإقلاع فعلًا", en: "Assume they are already committed to quitting" },
      { key: "d", ar: "تجاهل الفيب لأنه أقل ضررًا", en: "Ignore the vaping because it is “less harmful”" },
    ],
    correctKey: "b",
    explanation: {
      ar: "الاستخدام المزدوج شائع ويحتاج تقييمًا مختصًا؛ ولا يُلغي الفيب مخاطر الاحتراق.",
      en: "Dual use is common and needs a qualified assessment; vaping does not cancel combustion harm.",
    },
    difficulty: "intermediate",
    competency: "product_use",
    source: "WHO 2024",
  }),
  q({
    id: "acad.m2.q4",
    q: {
      ar: "«تقييم أقلع» يعتبر:",
      en: "The “Aqla assessment” is best described as:",
    },
    options: [
      { key: "a", ar: "أداة سريرية معتمدة لتشخيص الاعتماد ووصف الدواء", en: "A clinical tool that diagnoses dependence and prescribes medication" },
      { key: "b", ar: "أداة فرز توعوية غير تشخيصية توجّه المستخدم للدعم المناسب", en: "A non-diagnostic screening tool that directs the person to appropriate support" },
      { key: "c", ar: "بديل عن استشارة الطبيب", en: "A substitute for a doctor's consultation" },
      { key: "d", ar: "تقييم إلزامي لكل زوار الفعالية", en: "A mandatory test for every event visitor" },
    ],
    correctKey: "b",
    explanation: {
      ar: "الفرز يختلف عن التشخيص السريري؛ أقلع يُحيل عند الحاجة إلى مختص.",
      en: "Screening ≠ clinical diagnosis; Aqla refers to qualified professionals when needed.",
    },
    difficulty: "intermediate",
    competency: "screening_vs_diagnosis",
    safetyCritical: true,
    source: "Aqla Volunteer Playbook",
  }),
  q({
    id: "acad.m2.q5",
    q: {
      ar: "شخص جرّب الإقلاع من قبل ورجع للتدخين بعد أسبوع. أي وصف أدقّ؟",
      en: "Someone tried to quit and returned to smoking after a week. Which description is most accurate?",
    },
    options: [
      { key: "a", ar: "فشل كامل يعني أنه لن يستطيع الإقلاع أبدًا", en: "A total failure meaning they will never be able to quit" },
      { key: "b", ar: "خبرة قابلة للتعلّم؛ معظم المقلعين يحتاجون عدة محاولات قبل النجاح", en: "A learnable experience — most quitters need several attempts before succeeding" },
      { key: "c", ar: "دليل على ضعف الشخصية", en: "Evidence of a weak personality" },
      { key: "d", ar: "سبب لإيقاف كل محاولات الإقلاع مستقبلًا", en: "A reason to stop trying to quit forever" },
    ],
    correctKey: "b",
    explanation: {
      ar: "الانتكاسة شائعة وجزء من رحلة الإقلاع؛ اللغة الداعمة تزيد فرص المحاولة القادمة.",
      en: "Relapse is common and part of the quit journey; supportive framing raises the odds of the next attempt.",
    },
    difficulty: "foundational",
    competency: "relapse_framing",
    source: "U.S. Surgeon General 2020",
  }),
  q({
    id: "acad.m2.q6",
    q: {
      ar: "الرغبة الشديدة (Craving) عادةً تستمر:",
      en: "A typical nicotine craving usually lasts:",
    },
    options: [
      { key: "a", ar: "طوال اليوم دون انقطاع", en: "All day without pause" },
      { key: "b", ar: "بضع دقائق ثم تتراجع، وتعود موجات لاحقًا", en: "A few minutes and then subsides, returning in waves later" },
      { key: "c", ar: "أسبوعًا كاملًا كل مرة", en: "A full week each time" },
      { key: "d", ar: "دقيقة واحدة فقط لكل حياة الشخص", en: "Only one minute for the person's entire life" },
    ],
    correctKey: "b",
    explanation: {
      ar: "الرغبة تأتي كموجات قصيرة قابلة للاجتياز؛ التأخير والتشتيت أدوات فعّالة.",
      en: "Cravings come in short manageable waves; delay and distraction are effective coping tools.",
    },
    difficulty: "foundational",
    competency: "cravings",
    source: "CDC",
  }),
  q({
    id: "acad.m2.q7",
    q: {
      ar: "زائر يطلب معرفة «الجرعة الصحيحة» من لصقة النيكوتين. ما التصرّف؟",
      en: "A visitor asks what dose of nicotine patch is right for them. What do you do?",
    },
    options: [
      { key: "a", ar: "اقتراح جرعة بناءً على تجربتك الشخصية", en: "Suggest a dose based on your personal experience" },
      { key: "b", ar: "إحالته إلى صيدلي مرخّص أو طبيب لتحديد الجرعة", en: "Refer them to a licensed pharmacist or physician to decide the dose" },
      { key: "c", ar: "إخباره بأن كل الجرعات آمنة", en: "Tell them all doses are safe" },
      { key: "d", ar: "بيع لصقة له من موقع الفعالية", en: "Sell them a patch at the event" },
    ],
    correctKey: "b",
    explanation: {
      ar: "اختيار جرعة الدواء اختصاص طبي/صيدلي؛ لا يقرّر المتطوع ذلك.",
      en: "Choosing a medication dose is a clinical decision — outside the volunteer's scope.",
    },
    difficulty: "foundational",
    competency: "scope_of_practice",
    safetyCritical: true,
    source: "Aqla Volunteer Playbook",
  }),
  q({
    id: "acad.m2.q8",
    q: {
      ar: "أي مما يلي يُعد سلوكًا شائعًا لدى مستخدمي أكياس النيكوتين؟",
      en: "Which is a common behaviour among nicotine-pouch users?",
    },
    options: [
      { key: "a", ar: "استخدام عدد ثابت من الأكياس يوميًا مع رغبة عند التأخير", en: "Regular daily use with cravings if delayed" },
      { key: "b", ar: "عدم وجود أي رغبة", en: "No cravings at all" },
      { key: "c", ar: "توقف تلقائي دون أعراض انسحاب", en: "Spontaneous stopping with no withdrawal" },
      { key: "d", ar: "استخدام واحد كل عدة أشهر", en: "Use once every several months" },
    ],
    correctKey: "a",
    explanation: {
      ar: "أكياس النيكوتين تسبّب الاعتماد كبقية منتجات النيكوتين.",
      en: "Nicotine pouches cause dependence like other nicotine products.",
    },
    difficulty: "intermediate",
    competency: "product_use",
    source: "WHO 2024",
  }),
];

// -----------------------------------------------------------------------------
// MODULE 3 — Communication Skills
// -----------------------------------------------------------------------------
const M3: Q[] = [
  q({
    id: "acad.m3.q1",
    q: {
      ar: "ما أفضل طريقة لبدء حوار حول التدخين مع زائر في فعالية أقلع؟",
      en: "What is the best way to open a conversation about smoking with an Aqla event visitor?",
    },
    options: [
      { key: "a", ar: "«يبدو أنك تدخن، هذا خطأ كبير»", en: "“You look like a smoker — that's a big mistake.”" },
      { key: "b", ar: "«هل تسمح لي أن أشاركك بعض المعلومات عن التبغ والإقلاع؟»", en: "“May I share some information with you about tobacco and quitting?”" },
      { key: "c", ar: "«لن أدعك تخرج قبل أن تقلع»", en: "“I won't let you leave until you quit.”" },
      { key: "d", ar: "«الإقلاع سهل، فقط قرّر»", en: "“Quitting is easy, just decide.”" },
    ],
    correctKey: "b",
    explanation: {
      ar: "طلب الإذن يحترم الاستقلالية ويزيد الاستعداد للحوار.",
      en: "Asking permission respects autonomy and increases openness.",
    },
    difficulty: "foundational",
    competency: "communication",
    source: "Motivational Interviewing (Miller & Rollnick)",
  }),
  q({
    id: "acad.m3.q2",
    q: {
      ar: "«الاستماع العاكس» (Reflective listening) يعني:",
      en: "Reflective listening means:",
    },
    options: [
      { key: "a", ar: "الرد بمعلومة طبية مباشرة", en: "Replying with a direct medical fact" },
      { key: "b", ar: "إعادة صياغة ما قاله الشخص للتأكد من فهمك", en: "Restating what the person said to confirm your understanding" },
      { key: "c", ar: "مقاطعته لتصحيح معلومة", en: "Interrupting to correct a point" },
      { key: "d", ar: "الصمت التام حتى ينتهي", en: "Staying completely silent until they finish" },
    ],
    correctKey: "b",
    explanation: {
      ar: "الاستماع العاكس يُشعر المتحدث بأنه مسموع ويقلّل المقاومة.",
      en: "Reflective listening makes the speaker feel heard and reduces resistance.",
    },
    difficulty: "intermediate",
    competency: "communication",
    source: "Motivational Interviewing",
  }),
  q({
    id: "acad.m3.q3",
    q: {
      ar: "الأسئلة المفتوحة أفضل من المغلقة لأنها:",
      en: "Open questions are better than closed ones because they:",
    },
    options: [
      { key: "a", ar: "تُطيل الحوار بلا فائدة", en: "Only make the conversation longer" },
      { key: "b", ar: "تشجّع الشخص على شرح تجربته ودوافعه بكلماته", en: "Invite the person to describe their experience and motives in their own words" },
      { key: "c", ar: "تُجبره على إجابة نعم/لا", en: "Force a yes / no answer" },
      { key: "d", ar: "تُعطي المتطوع فرصة لإصدار الحكم", en: "Give the volunteer a chance to judge" },
    ],
    correctKey: "b",
    explanation: {
      ar: "الأسئلة المفتوحة تكشف الدوافع والتردّد وتقود إلى حوار أعمق.",
      en: "Open questions surface motivation and ambivalence and lead to deeper dialogue.",
    },
    difficulty: "foundational",
    competency: "communication",
    source: "Motivational Interviewing",
  }),
  q({
    id: "acad.m3.q4",
    q: {
      ar: "شخص يقول: «لست مستعدًا للإقلاع الآن.» ما الرد الأنسب؟",
      en: "A person says: “I'm not ready to quit right now.” What is the best response?",
    },
    options: [
      { key: "a", ar: "«إذا لم تقلع اليوم، فلن تقلع أبدًا»", en: "“If you don't quit today, you never will.”" },
      { key: "b", ar: "«أشكرك على صراحتك، هل يناسبك أن أشاركك خطوة صغيرة تستطيع تجربتها اليوم؟»", en: "“Thank you for being honest. Would you like me to share one small step you could try today?”" },
      { key: "c", ar: "تجاهله والانتقال لغيره", en: "Ignore them and move on" },
      { key: "d", ar: "الإصرار حتى يوافق", en: "Insist until they agree" },
    ],
    correctKey: "b",
    explanation: {
      ar: "احترام الاستقلالية مع باب مفتوح لخطوة صغيرة يزيد فرص الحركة لاحقًا.",
      en: "Respecting autonomy while offering a small next step keeps the door open for later change.",
    },
    difficulty: "intermediate",
    competency: "readiness",
    source: "Motivational Interviewing",
  }),
  q({
    id: "acad.m3.q5",
    q: {
      ar: "أي عبارة تُعتبر «مواجهة» (Confrontation) يجب تجنّبها؟",
      en: "Which sentence is a confrontation to be avoided?",
    },
    options: [
      { key: "a", ar: "«هذا اختيارك، وأنا هنا لدعمك متى ما رغبت»", en: "“It's your choice, and I'm here to support you when you're ready.”" },
      { key: "b", ar: "«أنت تؤذي عائلتك، ولن أتركك حتى تعترف»", en: "“You're harming your family and I won't leave until you admit it.”" },
      { key: "c", ar: "«أشكرك على مشاركتي تجربتك»", en: "“Thank you for sharing your experience with me.”" },
      { key: "d", ar: "«هل أستطيع أن أعرض عليك خيارات الدعم؟»", en: "“May I show you some support options?”" },
    ],
    correctKey: "b",
    explanation: {
      ar: "المواجهة تزيد المقاومة وتُغلق الحوار.",
      en: "Confrontation raises resistance and shuts down dialogue.",
    },
    difficulty: "intermediate",
    competency: "communication",
    source: "Motivational Interviewing",
  }),
  q({
    id: "acad.m3.q6",
    q: {
      ar: "زائرة تبكي عندما تتحدث عن محاولات إقلاعها السابقة. ما التصرّف الأول؟",
      en: "A visitor cries while talking about her past quit attempts. What is the first response?",
    },
    options: [
      { key: "a", ar: "التركيز على تصحيح المعلومات فورًا", en: "Immediately move to correcting facts" },
      { key: "b", ar: "الاعتراف بمشاعرها بلطف، وسؤالها إن كانت ترغب في الاستمرار الآن أو الرجوع لاحقًا", en: "Acknowledge her feelings kindly and ask if she wants to continue now or return later" },
      { key: "c", ar: "إخبارها أن البكاء علامة ضعف", en: "Tell her that crying is a sign of weakness" },
      { key: "d", ar: "التقاط صورة لتوثيق «قصة نجاح»", en: "Take a photo to document a “success story”" },
    ],
    correctKey: "b",
    explanation: {
      ar: "الاعتراف بالمشاعر يبني الأمان ويحترم الاستقلالية.",
      en: "Acknowledging emotions builds safety and respects autonomy.",
    },
    difficulty: "intermediate",
    competency: "communication",
    source: "Trauma-informed care principles",
  }),
  q({
    id: "acad.m3.q7",
    q: {
      ar: "شخص يعتذر بأدب عن الحوار. ما التصرّف الصحيح؟",
      en: "A person politely declines to talk. What do you do?",
    },
    options: [
      { key: "a", ar: "متابعة الحديث لأنه «سيغيّر رأيه»", en: "Keep talking because “he'll change his mind”" },
      { key: "b", ar: "شكره واحترام قراره، وترك مادة مطبوعة أو رمز QR إن رغب لاحقًا", en: "Thank him, respect the decision, and leave a leaflet or QR code for later if he wishes" },
      { key: "c", ar: "الشكوى منه للمشرف", en: "Complain about him to the supervisor" },
      { key: "d", ar: "تسجيل بياناته دون إذنه", en: "Record his details without permission" },
    ],
    correctKey: "b",
    explanation: {
      ar: "احترام الرفض جزء أساسي من الأخلاقيات التوعوية.",
      en: "Respecting refusal is a core ethical principle of outreach.",
    },
    difficulty: "foundational",
    competency: "communication",
    source: "Aqla Volunteer Playbook",
  }),
  q({
    id: "acad.m3.q8",
    q: {
      ar: "أي عبارة تُعتبر «وعدًا» غير مناسب لمتطوع؟",
      en: "Which is an inappropriate promise for a volunteer to make?",
    },
    options: [
      { key: "a", ar: "«يمكنني إحالتك إلى مسار الدعم المناسب»", en: "“I can refer you to the appropriate support pathway.”" },
      { key: "b", ar: "«أضمن لك أنك ستقلع خلال أسبوع»", en: "“I guarantee you'll quit within a week.”" },
      { key: "c", ar: "«يمكنني مشاركة معلومات موثوقة معك»", en: "“I can share reliable information with you.”" },
      { key: "d", ar: "«يمكنك التواصل مع 937 لأي استفسار صحي»", en: "“You can reach 937 for any health question.”" },
    ],
    correctKey: "b",
    explanation: {
      ar: "الوعود بنتائج مضمونة غير أخلاقية وغير علمية.",
      en: "Guaranteed-outcome promises are neither ethical nor evidence-based.",
    },
    difficulty: "foundational",
    competency: "scope_of_practice",
    source: "Aqla Volunteer Playbook",
  }),
];

// -----------------------------------------------------------------------------
// MODULE 4 — Readiness and Quit Planning
// -----------------------------------------------------------------------------
const M4: Q[] = [
  q({
    id: "acad.m4.q1",
    q: {
      ar: "أي عبارة تدل على «استعداد للتغيير»؟",
      en: "Which statement suggests readiness to change?",
    },
    options: [
      { key: "a", ar: "«لا أرى مشكلة، والتدخين يساعدني»", en: "“I don't see a problem — smoking helps me.”" },
      { key: "b", ar: "«أفكّر أن أُحدّد يومًا لأجرّب الإقلاع خلال الأسبوعين القادمين»", en: "“I'm thinking of picking a day to try quitting in the next two weeks.”" },
      { key: "c", ar: "«لن أفكّر في هذا أبدًا»", en: "“I'll never think about this.”" },
      { key: "d", ar: "«أُدخّن منذ سنوات فقط»", en: "“I've only been smoking for years.”" },
    ],
    correctKey: "b",
    explanation: {
      ar: "التخطيط لخطوة زمنية محدّدة مؤشر واضح على مرحلة الاستعداد.",
      en: "Planning a concrete near-term step is a clear signal of the “preparation” stage.",
    },
    difficulty: "intermediate",
    competency: "readiness",
    source: "Prochaska/DiClemente stages of change",
  }),
  q({
    id: "acad.m4.q2",
    q: {
      ar: "«يوم الإقلاع» يُختار بشكل مثالي:",
      en: "The quit date is ideally chosen:",
    },
    options: [
      { key: "a", ar: "من قبل المتطوع نيابةً عن الشخص", en: "By the volunteer on the person's behalf" },
      { key: "b", ar: "من قبل الشخص نفسه، مع دعم في التحضير", en: "By the person themselves, with support to prepare" },
      { key: "c", ar: "بعد ثلاث سنوات على الأقل", en: "At least three years in the future" },
      { key: "d", ar: "في اليوم الذي يشعر فيه بضغط اجتماعي", en: "On a day when they feel social pressure" },
    ],
    correctKey: "b",
    explanation: {
      ar: "الاستقلالية أساسية؛ الشخص يختار موعده والمتطوع يدعم الاستعداد.",
      en: "Autonomy matters — the person picks the date; the volunteer supports preparation.",
    },
    difficulty: "foundational",
    competency: "quit_planning",
    source: "U.S. Surgeon General 2020",
  }),
  q({
    id: "acad.m4.q3",
    q: {
      ar: "أي مما يلي أفضل لتحديد «المحفزات» (Triggers)؟",
      en: "Which is the best way to identify a person's triggers?",
    },
    options: [
      { key: "a", ar: "استعراض قائمة عامة دون سؤاله", en: "Reading out a generic list without asking" },
      { key: "b", ar: "سؤاله عن أوقات وأماكن ومشاعر ترافق استخدامه", en: "Asking about the times, places, and feelings that accompany his use" },
      { key: "c", ar: "تخمين المحفزات من مظهره", en: "Guessing from his appearance" },
      { key: "d", ar: "إخباره أن المحفزات وهم", en: "Telling him triggers are imaginary" },
    ],
    correctKey: "b",
    explanation: {
      ar: "المحفزات فردية؛ الأسئلة المفتوحة تكشفها بدقة.",
      en: "Triggers are personal; open questions surface them accurately.",
    },
    difficulty: "foundational",
    competency: "quit_planning",
    source: "Aqla Volunteer Playbook",
  }),
  q({
    id: "acad.m4.q4",
    q: {
      ar: "أفضل استراتيجية للإقلاع عامةً:",
      en: "The most effective quit strategy in general is:",
    },
    options: [
      { key: "a", ar: "الاعتماد على قوة الإرادة وحدها", en: "Relying on willpower alone" },
      { key: "b", ar: "دمج الدعم السلوكي مع دواء معتمد عند وصف مختصّ", en: "Combining behavioural support with an approved medication prescribed by a qualified clinician" },
      { key: "c", ar: "التوقف المفاجئ التام دون أي دعم", en: "Abrupt cessation with no support at all" },
      { key: "d", ar: "التخفيف التدريجي إلى الأبد دون هدف إقلاع", en: "Indefinite tapering without any quit goal" },
    ],
    correctKey: "b",
    explanation: {
      ar: "WHO 2024 وUSPSTF: أعلى معدلات النجاح مع الدمج بين السلوك والدواء الموصوف.",
      en: "WHO 2024 and USPSTF: highest success rates come from combined behavioural + prescribed pharmacotherapy.",
    },
    difficulty: "intermediate",
    competency: "quit_planning",
    source: "WHO 2024 / USPSTF",
  }),
  q({
    id: "acad.m4.q5",
    q: {
      ar: "المتابعة (Follow-up) في الأسابيع الأولى بعد الإقلاع:",
      en: "Follow-up during the first weeks after a quit attempt:",
    },
    options: [
      { key: "a", ar: "غير مفيدة عادةً", en: "Is usually not helpful" },
      { key: "b", ar: "ترفع فرص الاستمرار بالإقلاع", en: "Raises the odds of staying quit" },
      { key: "c", ar: "توتّر الشخص وتجعله يعود للتدخين", en: "Stresses the person and drives relapse" },
      { key: "d", ar: "تحلّ محلّ الدعم الطبي", en: "Replaces medical support" },
    ],
    correctKey: "b",
    explanation: {
      ar: "المتابعة الدورية القصيرة تحسّن معدلات النجاح.",
      en: "Brief structured follow-up improves success rates.",
    },
    difficulty: "foundational",
    competency: "quit_planning",
    source: "USPSTF",
  }),
  q({
    id: "acad.m4.q6",
    q: {
      ar: "شخص يقول: «سأقلع خلال شهر واحد بلا أي دواء ولا دعم.» ما التصرّف الأنسب؟",
      en: "Someone says: “I'll quit within a month with no medication and no support.” What is the best response?",
    },
    options: [
      { key: "a", ar: "تثبيط قراره ورفض دعمه", en: "Discourage him and refuse to help" },
      { key: "b", ar: "احترام قراره، ومشاركته بأنّ الجمع بين الدعم والدواء يرفع فرص النجاح، وتركه يقرّر", en: "Respect his choice, share that combined support + medication raises success odds, and let him decide" },
      { key: "c", ar: "الضحك على خطته", en: "Laugh at his plan" },
      { key: "d", ar: "إبلاغ عائلته", en: "Inform his family" },
    ],
    correctKey: "b",
    explanation: {
      ar: "الاستقلالية أولًا؛ نُقدّم المعلومة المبنيّة على الدليل دون ضغط.",
      en: "Autonomy first; offer evidence-based information without pressure.",
    },
    difficulty: "intermediate",
    competency: "readiness",
    source: "Motivational Interviewing",
  }),
  q({
    id: "acad.m4.q7",
    q: {
      ar: "زائر يريد الإقلاع لكنه يستخدم دواء نفسي حاليًا. ما التصرّف؟",
      en: "A visitor wants to quit but is currently on a psychiatric medication. What do you do?",
    },
    options: [
      { key: "a", ar: "اقتراح إيقاف دوائه النفسي أثناء الإقلاع", en: "Suggest stopping the psychiatric medication during the quit attempt" },
      { key: "b", ar: "إحالته إلى مختص لمراجعة خطة الإقلاع مع طبيبه المُعالج", en: "Refer him to a qualified clinician to review the quit plan with his treating physician" },
      { key: "c", ar: "إخباره أن الإقلاع سيعالج مرضه النفسي", en: "Tell him that quitting will cure his mental illness" },
      { key: "d", ar: "إعطاؤه جرعة نيكوتين من الفعالية", en: "Give him a nicotine dose at the event" },
    ],
    correctKey: "b",
    explanation: {
      ar: "تفاعلات الأدوية اختصاص طبي؛ نُحيل ولا نقرّر.",
      en: "Medication interactions are a clinical matter — refer, don't decide.",
    },
    difficulty: "advanced",
    competency: "scope_of_practice",
    safetyCritical: true,
    source: "Aqla Volunteer Playbook / WHO 2024",
  }),
  q({
    id: "acad.m4.q8",
    q: {
      ar: "أفضل مصدر للدعم المتخصص في السعودية للاستفسارات الصحية العامة:",
      en: "The best Saudi resource for general health inquiries is:",
    },
    options: [
      { key: "a", ar: "الرقم 937 (خدمة استشارات وزارة الصحة)", en: "937 (Saudi MoH health advisory line)" },
      { key: "b", ar: "الاتصال بأي رقم عشوائي على الإنترنت", en: "Any random number on the internet" },
      { key: "c", ar: "نصيحة صديق غير مختص", en: "Advice from a non-specialist friend" },
      { key: "d", ar: "لا يوجد مصدر رسمي", en: "There is no official source" },
    ],
    correctKey: "a",
    explanation: {
      ar: "937 هو الرقم الرسمي للاستشارات الصحية في وزارة الصحة السعودية.",
      en: "937 is the Saudi MoH official health advisory number.",
    },
    difficulty: "foundational",
    competency: "referral",
    source: "Saudi MoH",
  }),
];

// -----------------------------------------------------------------------------
// MODULE 5 — Cravings, Lapses and Relapse Support
// -----------------------------------------------------------------------------
const M5: Q[] = [
  q({
    id: "acad.m5.q1",
    q: {
      ar: "أي مما يلي أسلوب منخفض المخاطر للتعامل مع رغبة قوية؟",
      en: "Which is a low-risk way to handle a strong craving?",
    },
    options: [
      { key: "a", ar: "شرب الماء، التنفّس البطيء، وتغيير المكان لعدة دقائق", en: "Drink water, breathe slowly, and change location for a few minutes" },
      { key: "b", ar: "تدخين نصف سيجارة لتخفيف الرغبة", en: "Smoke half a cigarette to ease the craving" },
      { key: "c", ar: "استخدام دواء غير موصوف", en: "Take an unprescribed medication" },
      { key: "d", ar: "الجلوس بجانب مدخّنين", en: "Sit next to smokers" },
    ],
    correctKey: "a",
    explanation: {
      ar: "استراتيجيات التأخير والتشتيت والتنفس آمنة وفعّالة.",
      en: "Delay, distraction, and breathing are safe and effective.",
    },
    difficulty: "foundational",
    competency: "cravings",
    source: "CDC",
  }),
  q({
    id: "acad.m5.q2",
    q: {
      ar: "الفرق بين «الزلّة» (Lapse) و«الانتكاسة» (Relapse):",
      en: "The difference between a lapse and a relapse is:",
    },
    options: [
      { key: "a", ar: "لا فرق؛ كلاهما نفس الشيء", en: "There is no difference" },
      { key: "b", ar: "الزلّة استخدام قصير مؤقّت، والانتكاسة عودة مستمرّة إلى الاستخدام", en: "A lapse is a brief slip; a relapse is a sustained return to use" },
      { key: "c", ar: "الزلّة أخطر من الانتكاسة", en: "A lapse is more dangerous than a relapse" },
      { key: "d", ar: "الانتكاسة تعني أن الشخص لن ينجح أبدًا", en: "Relapse means the person can never succeed" },
    ],
    correctKey: "b",
    explanation: {
      ar: "الزلّة فرصة للتعلّم، والانتكاسة تحتاج مراجعة للخطة وربما دعم متخصص.",
      en: "A lapse is a learning moment; a sustained relapse warrants plan review and possibly more support.",
    },
    difficulty: "intermediate",
    competency: "relapse_framing",
    source: "U.S. Surgeon General 2020",
  }),
  q({
    id: "acad.m5.q3",
    q: {
      ar: "شخص أخبرك بأنه دخّن سيجارة واحدة بعد أسبوع من الإقلاع. ما التصرّف الأفضل؟",
      en: "Someone tells you he smoked one cigarette after a week of quitting. What is the best response?",
    },
    options: [
      { key: "a", ar: "«محاولتك انتهت، ابدأ من جديد بعد سنة»", en: "“Your attempt is over — try again in a year.”" },
      { key: "b", ar: "«زلّة قصيرة لا تُلغي أسبوعك، فلنراجع ما الذي حدث وكيف تعود لخطتك»", en: "“A brief slip doesn't erase your week — let's look at what happened and how you can return to your plan.”" },
      { key: "c", ar: "«فشلت لأنك ضعيف»", en: "“You failed because you're weak.”" },
      { key: "d", ar: "«لا تخبر أحدًا»", en: "“Don't tell anyone.”" },
    ],
    correctKey: "b",
    explanation: {
      ar: "إعادة التأطير الداعمة تحمي المكسب المُتحقّق وتُبقي الحافز.",
      en: "Supportive reframing preserves the progress already made and keeps motivation alive.",
    },
    difficulty: "intermediate",
    competency: "relapse_framing",
    source: "Motivational Interviewing",
  }),
  q({
    id: "acad.m5.q4",
    q: {
      ar: "أي مما يلي محفّز شائع للانتكاسة؟",
      en: "Which is a common relapse trigger?",
    },
    options: [
      { key: "a", ar: "الضغط النفسي، القهوة، والمواقف الاجتماعية المرتبطة بالتدخين", en: "Stress, coffee, and social settings previously linked to smoking" },
      { key: "b", ar: "تنظيف الأسنان يوميًا", en: "Brushing teeth daily" },
      { key: "c", ar: "شرب الماء", en: "Drinking water" },
      { key: "d", ar: "المشي في الصباح", en: "A morning walk" },
    ],
    correctKey: "a",
    explanation: {
      ar: "المحفزات النفسية والاجتماعية والحسية هي أشهر أسباب الانتكاسة.",
      en: "Psychological, social, and sensory cues are the most common relapse triggers.",
    },
    difficulty: "foundational",
    competency: "relapse_framing",
    source: "CDC",
  }),
  q({
    id: "acad.m5.q5",
    q: {
      ar: "شخص مُقلع منذ 3 أشهر عاد للتدخين اليومي لأسبوعين. ما التصرّف؟",
      en: "A person quit 3 months ago and has been smoking daily again for two weeks. What do you do?",
    },
    options: [
      { key: "a", ar: "إخباره بأن كل مجهوده ضاع", en: "Tell him all his effort is lost" },
      { key: "b", ar: "الاعتراف بصعوبة الموقف، ومراجعة الخطة، وإحالته إلى دعم مختص إذا رغب", en: "Acknowledge how hard this is, review the plan, and refer to qualified support if he wishes" },
      { key: "c", ar: "الإصرار على أنه لن ينجح مرة أخرى", en: "Insist he'll never succeed again" },
      { key: "d", ar: "إخباره بأن الانتكاسة أفضل من الإقلاع", en: "Tell him relapse is better than quitting" },
    ],
    correctKey: "b",
    explanation: {
      ar: "الانتكاسة تحتاج مراجعة للخطة ودعم إضافي؛ ليست نهاية الرحلة.",
      en: "Relapse warrants plan review and added support — not the end of the journey.",
    },
    difficulty: "intermediate",
    competency: "relapse_framing",
    source: "U.S. Surgeon General 2020",
  }),
  q({
    id: "acad.m5.q6",
    q: {
      ar: "«الرغبة تختفي دائمًا خلال 3 دقائق بالضبط.» هل هذه العبارة دقيقة؟",
      en: "“Cravings always disappear in exactly 3 minutes.” Is this accurate?",
    },
    options: [
      { key: "a", ar: "نعم، دائمًا 3 دقائق بالضبط", en: "Yes — always exactly 3 minutes" },
      { key: "b", ar: "لا؛ الرغبة تختلف من شخص لآخر، لكنها تأتي في موجات قصيرة وتخفّ", en: "No — cravings vary by person, but come in short waves and subside" },
      { key: "c", ar: "الرغبة تستمر إلى الأبد", en: "Cravings last forever" },
      { key: "d", ar: "الرغبة ثابتة في كل الحالات", en: "Cravings are identical in every case" },
    ],
    correctKey: "b",
    explanation: {
      ar: "الأرقام الحرفية غير علمية؛ الأصح أن الرغبة تأتي كموجات قصيرة قابلة للتجاوز.",
      en: "Literal fixed durations are not evidence-based; the accurate framing is that cravings come in short manageable waves.",
    },
    difficulty: "intermediate",
    competency: "cravings",
    source: "CDC",
  }),
  q({
    id: "acad.m5.q7",
    q: {
      ar: "أي عبارة مناسبة للتقديم لشخص يشعر بالخجل من انتكاسته؟",
      en: "Which sentence is appropriate for someone ashamed of a relapse?",
    },
    options: [
      { key: "a", ar: "«الانتكاسة جزء طبيعي من رحلة كثيرين، وما تعلّمته يفيدك في محاولتك القادمة»", en: "“Relapse is a normal part of many people's journey — what you learned will help the next attempt.”" },
      { key: "b", ar: "«أنت خذلت نفسك وعائلتك»", en: "“You let yourself and your family down.”" },
      { key: "c", ar: "«لن أساعدك بعد اليوم»", en: "“I won't help you again.”" },
      { key: "d", ar: "«أخفِ هذا عن الجميع»", en: "“Hide this from everyone.”" },
    ],
    correctKey: "a",
    explanation: {
      ar: "التطبيع الداعم يقلّل الوصمة ويُعيد الحافز.",
      en: "Supportive normalisation reduces shame and rebuilds motivation.",
    },
    difficulty: "foundational",
    competency: "relapse_framing",
    source: "Motivational Interviewing",
  }),
  q({
    id: "acad.m5.q8",
    q: {
      ar: "شخص يستخدم النيكوتين لإدارة اكتئاب مُشخّص، ويريد الإقلاع. من الأنسب أن يراجعه؟",
      en: "A person uses nicotine to manage diagnosed depression and wants to quit. Who should assess them?",
    },
    options: [
      { key: "a", ar: "متطوع أقلع", en: "An Aqla volunteer" },
      { key: "b", ar: "طبيب مؤهل — يفضّل بالتنسيق مع طبيبه المُعالج للصحة النفسية", en: "A qualified clinician — ideally coordinated with the treating mental-health provider" },
      { key: "c", ar: "صديق مدخّن سابق", en: "A friend who used to smoke" },
      { key: "d", ar: "مؤثّر على الإنترنت", en: "A social-media influencer" },
    ],
    correctKey: "b",
    explanation: {
      ar: "الحالات النفسية المصاحبة تحتاج تنسيقًا سريريًا؛ لا تُعالج بشكل توعوي منفصل.",
      en: "Comorbid mental-health conditions need clinical coordination — not standalone volunteer intervention.",
    },
    difficulty: "advanced",
    competency: "scope_of_practice",
    safetyCritical: true,
    source: "WHO 2024",
  }),
];

// -----------------------------------------------------------------------------
// MODULE 6 — Safety, Boundaries and Referral
// -----------------------------------------------------------------------------
const M6: Q[] = [
  q({
    id: "acad.m6.q1",
    q: {
      ar: "زائر في فعالية أقلع يشكو من ألم شديد في الصدر وضيق تنفّس الآن. ما التصرّف الأول؟",
      en: "An event visitor now reports severe chest pain and shortness of breath. First action?",
    },
    options: [
      { key: "a", ar: "إكمال تقييم الاعتماد أولًا، ثم الحديث عن الطوارئ", en: "Finish the dependence assessment first, then discuss emergencies" },
      { key: "b", ar: "توجيهه فورًا إلى خدمات الطوارئ (911) دون تأخير لأي تقييم", en: "Direct him immediately to emergency services (911) without delaying for any assessment" },
      { key: "c", ar: "طلب منه الجلوس 30 دقيقة قبل اتخاذ قرار", en: "Ask him to sit for 30 minutes before deciding" },
      { key: "d", ar: "حجز موعد إقلاع للأسبوع القادم", en: "Book a routine cessation appointment next week" },
    ],
    correctKey: "b",
    explanation: {
      ar: "الأعراض توحي بحالة قلبية طارئة؛ الإحالة الفورية للطوارئ أولوية قصوى (الرقم الموحّد للطوارئ في السعودية 911).",
      en: "Symptoms suggest a possible cardiac emergency — immediate escalation to emergency services (Saudi 911) is the top priority.",
    },
    difficulty: "advanced",
    competency: "medical_emergency",
    safetyCritical: true,
    source: "Saudi Red Crescent 911",
  }),
  q({
    id: "acad.m6.q2",
    q: {
      ar: "شخص يخبرك أنه يفكّر في إيذاء نفسه ويطلب منك ألا تخبر أحدًا. ما التصرّف؟",
      en: "A person tells you he is thinking of harming himself and asks you to keep it secret. What do you do?",
    },
    options: [
      { key: "a", ar: "احترام السرية المطلقة والصمت", en: "Keep complete confidentiality and stay silent" },
      { key: "b", ar: "الاعتراف بشجاعته في المشاركة، وإخباره بلطف أن السرية لا تشمل الخطر المباشر، والتصعيد لخدمات الدعم النفسي/الطوارئ فورًا (920033360 أو 911 عند الخطر الوشيك)", en: "Acknowledge his courage, gently explain that confidentiality has limits when there is immediate danger, and escalate to mental-health / emergency services immediately (920033360 or 911 if imminent)" },
      { key: "c", ar: "إخباره أن هذا ليس مشكلة كبيرة", en: "Tell him it's not a big deal" },
      { key: "d", ar: "الطلب منه الانتظار حتى نهاية الفعالية", en: "Ask him to wait until the event ends" },
    ],
    correctKey: "b",
    explanation: {
      ar: "لا يوجد سرية مطلقة عند وجود خطر مباشر على الحياة؛ التصعيد المُنظّم يحمي الشخص.",
      en: "There is no absolute confidentiality when life is at immediate risk; structured escalation protects the person.",
    },
    difficulty: "advanced",
    competency: "safeguarding",
    safetyCritical: true,
    source: "Saudi MoH mental-health line 920033360 / 911",
  }),
  q({
    id: "acad.m6.q3",
    q: {
      ar: "امرأة حامل تسأل عن دواء الإقلاع المناسب لها. ما التصرّف؟",
      en: "A pregnant woman asks which cessation medication is right for her. What do you do?",
    },
    options: [
      { key: "a", ar: "اقتراح دواء بناءً على ما قرأته", en: "Suggest a medication based on what you have read" },
      { key: "b", ar: "إحالتها إلى مقدّم رعاية صحية مؤهل (طبيب/مختص) للتقييم؛ ومشاركة معلومات عامة داعمة دون توصية بدواء", en: "Refer her to a qualified clinician for assessment; share general supportive information without recommending a medication" },
      { key: "c", ar: "إخبارها بأن الإقلاع خطر أثناء الحمل", en: "Tell her that quitting is dangerous during pregnancy" },
      { key: "d", ar: "إعطاؤها لصقة نيكوتين", en: "Give her a nicotine patch" },
    ],
    correctKey: "b",
    explanation: {
      ar: "الأدوية أثناء الحمل قرار سريري بحت؛ المتطوع يوجّه ويحيل فقط.",
      en: "Medication decisions in pregnancy are strictly clinical — the volunteer supports and refers only.",
    },
    difficulty: "advanced",
    competency: "pregnancy",
    safetyCritical: true,
    source: "WHO 2024",
  }),
  q({
    id: "acad.m6.q4",
    q: {
      ar: "شاب عمره 15 عامًا يستخدم أكياس النيكوتين يوميًا. المسار المناسب؟",
      en: "A 15-year-old uses nicotine pouches daily. The correct pathway is:",
    },
    options: [
      { key: "a", ar: "تسجيله في مسار البالغين للإقلاع", en: "Enrol him in the adult cessation pathway" },
      { key: "b", ar: "تحويله إلى مسار الشباب/حماية القُصّر المعتمد، وإشراك وليّ الأمر وفق سياسة أقلع", en: "Route him to the approved youth / safeguarding pathway and involve his guardian per Aqla policy" },
      { key: "c", ar: "بيع منتج «أقل ضررًا» له", en: "Sell him a “less harmful” product" },
      { key: "d", ar: "تجاهله لأن السنّ صغيرة", en: "Ignore him because he is young" },
    ],
    correctKey: "b",
    explanation: {
      ar: "القُصّر يحتاجون مسارًا خاصًا وحماية إجرائية.",
      en: "Minors require a dedicated safeguarding pathway.",
    },
    difficulty: "advanced",
    competency: "safeguarding",
    safetyCritical: true,
    source: "Saudi child-safeguarding standards",
  }),
  q({
    id: "acad.m6.q5",
    q: {
      ar: "زميل متطوّع يطلب حفظ بيانات المشاركين في محادثات واتساب شخصية. ما التصرّف الصحيح؟",
      en: "A fellow volunteer wants to store participant data in personal WhatsApp chats. Correct response?",
    },
    options: [
      { key: "a", ar: "الموافقة لأن الأمر أسرع", en: "Agree because it is faster" },
      { key: "b", ar: "الرفض المهذّب، وتذكيره بأن البيانات تُحفظ فقط في الأنظمة الرسمية المعتمدة، وإبلاغ المشرف", en: "Politely refuse, remind him that data must be stored only in approved official systems, and inform the supervisor" },
      { key: "c", ar: "طلب نسخة لنفسك", en: "Ask him for a copy for yourself" },
      { key: "d", ar: "نشر البيانات علنًا للتوعية", en: "Post the data publicly for “awareness”" },
    ],
    correctKey: "b",
    explanation: {
      ar: "حفظ بيانات المستفيدين في تطبيقات شخصية انتهاك خطير للخصوصية.",
      en: "Storing participant data in personal apps is a serious privacy breach.",
    },
    difficulty: "intermediate",
    competency: "privacy",
    safetyCritical: true,
    source: "Aqla Privacy Policy",
  }),
  q({
    id: "acad.m6.q6",
    q: {
      ar: "زائر يطلب دواءً محدّدًا بالاسم لأنه «شاهده على يوتيوب». التصرّف؟",
      en: "A visitor asks for a specific medication by name because he “saw it on YouTube.” Response?",
    },
    options: [
      { key: "a", ar: "إعطاؤه الدواء", en: "Give him the medication" },
      { key: "b", ar: "إخباره أن اختيار الدواء وموانع الاستعمال قرار طبي، وإحالته لطبيب/صيدلي مرخّص", en: "Explain that medication choice and contraindications are a clinical decision, and refer him to a licensed clinician or pharmacist" },
      { key: "c", ar: "اقتراح دواء بديل من عندك", en: "Suggest an alternative medication yourself" },
      { key: "d", ar: "الاتصال بيوتيوبر آخر", en: "Call a different YouTuber" },
    ],
    correctKey: "b",
    explanation: {
      ar: "المتطوع لا يختار دواءً ولا موانع؛ الإحالة السريرية هي الإجابة الصحيحة.",
      en: "Volunteers do not select medications or contraindications — clinical referral is the correct answer.",
    },
    difficulty: "foundational",
    competency: "scope_of_practice",
    safetyCritical: true,
    source: "Aqla Volunteer Playbook",
  }),
  q({
    id: "acad.m6.q7",
    q: {
      ar: "متى يجوز مشاركة بيانات مستفيد خارج فريق أقلع؟",
      en: "When may a participant's data be shared outside the Aqla team?",
    },
    options: [
      { key: "a", ar: "في أي وقت، لأن التوعية أهم من الخصوصية", en: "Any time — awareness is more important than privacy" },
      { key: "b", ar: "فقط بموافقته الصريحة، أو عند وجود خطر مباشر على الحياة يستوجب التصعيد الرسمي", en: "Only with his explicit consent, or when an immediate life-safety risk requires formal escalation" },
      { key: "c", ar: "عندما يطلبها أي شخص", en: "Whenever anyone asks for it" },
      { key: "d", ar: "بعد نشرها في مجموعات واتساب", en: "After posting it in WhatsApp groups" },
    ],
    correctKey: "b",
    explanation: {
      ar: "الموافقة المستنيرة أو الخطر المباشر هما الاستثناءان الوحيدان.",
      en: "Informed consent or an immediate danger are the only two exceptions.",
    },
    difficulty: "intermediate",
    competency: "privacy",
    safetyCritical: true,
    source: "Aqla Privacy Policy",
  }),
  q({
    id: "acad.m6.q8",
    q: {
      ar: "متطوع يريد نشر صورة مقلع ناجح على تويتر للتحفيز. ما التصرّف الصحيح؟",
      en: "A volunteer wants to post a successful quitter's photo on X (Twitter) for motivation. Correct action?",
    },
    options: [
      { key: "a", ar: "النشر مباشرة لأنه لأجل خير", en: "Post it directly — it's for a good cause" },
      { key: "b", ar: "عدم النشر إلا بعد موافقة خطية صريحة من الشخص، مع احترام حقه في السحب لاحقًا", en: "Do not post unless the person has given explicit written consent, with the right to withdraw it later" },
      { key: "c", ar: "النشر بعد إخفاء الوجه فقط", en: "Post it after blurring only the face" },
      { key: "d", ar: "طلب مبلغ مالي منه أولًا", en: "Ask him for a fee first" },
    ],
    correctKey: "b",
    explanation: {
      ar: "الصور والشهادات تحتاج إذنًا مكتوبًا مسبقًا وحقًا في السحب.",
      en: "Photos and testimonials require prior written consent and a withdrawal right.",
    },
    difficulty: "intermediate",
    competency: "privacy",
    safetyCritical: true,
    source: "Aqla Privacy Policy",
  }),
];

// -----------------------------------------------------------------------------
// MODULE 7 — Community Application and Aqla Pathways
// -----------------------------------------------------------------------------
const M7: Q[] = [
  q({
    id: "acad.m7.q1",
    q: {
      ar: "الطريقة المناسبة لتقديم رمز QR لتقييم أقلع في فعالية:",
      en: "The right way to offer the Aqla assessment QR code at an event is to:",
    },
    options: [
      { key: "a", ar: "إجبار كل من يمرّ على مسحه", en: "Force everyone who walks past to scan it" },
      { key: "b", ar: "شرح ما هو التقييم، وأنه اختياري، وإعطاء الشخص حرّية القرار", en: "Explain what the assessment is, that it is optional, and let the person decide freely" },
      { key: "c", ar: "إخفاء الرمز حتى يسأل عنه", en: "Hide the code until someone asks" },
      { key: "d", ar: "مسح الرمز نيابةً عنه", en: "Scan the code on their behalf" },
    ],
    correctKey: "b",
    explanation: {
      ar: "الشرح الواضح والاختيارية أسس الأخلاقيات التوعوية.",
      en: "Clear explanation and voluntariness are foundational to ethical outreach.",
    },
    difficulty: "foundational",
    competency: "community_outreach",
    source: "Aqla Volunteer Playbook",
  }),
  q({
    id: "acad.m7.q2",
    q: {
      ar: "شخص يريد إجراء التقييم لكنه رفض إعطاء اسمه أو رقمه. التصرّف؟",
      en: "Someone wants to take the assessment but refuses to provide a name or phone number. Response?",
    },
    options: [
      { key: "a", ar: "رفض السماح له بالمشاركة", en: "Refuse to let him participate" },
      { key: "b", ar: "السماح له بالمشاركة بشكل مجهول الهوية، فالتقييم يعمل دون بيانات شخصية", en: "Allow him to take part anonymously — the assessment works without personal identifiers" },
      { key: "c", ar: "تسجيل رقم عشوائي بدلًا عنه", en: "Enter a random number for him" },
      { key: "d", ar: "الضغط عليه حتى يعطي بياناته", en: "Pressure him until he provides them" },
    ],
    correctKey: "b",
    explanation: {
      ar: "المشاركة يجب أن تكون طوعية وممكنة دون تحديد الهوية.",
      en: "Participation must be voluntary and possible without identifying information.",
    },
    difficulty: "intermediate",
    competency: "privacy",
    safetyCritical: true,
    source: "Aqla Privacy Policy",
  }),
  q({
    id: "acad.m7.q3",
    q: {
      ar: "زائر يشكو من سعال مزمن أكثر من 3 أسابيع مع فقدان وزن. المناسب:",
      en: "A visitor complains of a chronic cough >3 weeks plus weight loss. The correct step is:",
    },
    options: [
      { key: "a", ar: "الاكتفاء بنصائح توعوية دون إحالة", en: "Give awareness advice only, no referral" },
      { key: "b", ar: "الإحالة الفورية إلى طبيب/مركز رعاية أولية لفحص طبي مناسب", en: "Refer him immediately to a physician / primary care centre for a proper medical evaluation" },
      { key: "c", ar: "إخباره بأن السعال طبيعي بعد الإقلاع", en: "Tell him a cough is normal after quitting" },
      { key: "d", ar: "بيع دواء سعال له", en: "Sell him a cough medication" },
    ],
    correctKey: "b",
    explanation: {
      ar: "«علامات إنذار» طبية تستوجب تقييمًا سريريًا فوريًا؛ لا يشخّص المتطوع.",
      en: "Red-flag symptoms require immediate clinical evaluation — volunteers do not diagnose.",
    },
    difficulty: "advanced",
    competency: "referral",
    safetyCritical: true,
    source: "Saudi MoH primary care",
  }),
  q({
    id: "acad.m7.q4",
    q: {
      ar: "أحد الحاضرين يريد التحدث بشأن مشكلة زوجية معقدة. المناسب:",
      en: "An attendee wants to discuss a complex marital issue. The correct response is:",
    },
    options: [
      { key: "a", ar: "تقديم استشارة نفسية زوجية على الفور", en: "Provide on-the-spot marital counselling" },
      { key: "b", ar: "الاستماع بلطف، إخباره أن هذا خارج نطاق دور أقلع، وإحالته إلى مسار دعم مناسب (مثل 920033360)", en: "Listen kindly, note that it's outside Aqla's scope, and refer him to an appropriate support pathway (e.g. 920033360)" },
      { key: "c", ar: "إخباره أن مشكلته ليست مهمة", en: "Tell him his problem isn't important" },
      { key: "d", ar: "تسجيل تفاصيل حياته الشخصية", en: "Record the details of his private life" },
    ],
    correctKey: "b",
    explanation: {
      ar: "معرفة حدود الدور جزء أساسي من الأخلاقيات التوعوية.",
      en: "Knowing the limits of your role is a core ethical principle.",
    },
    difficulty: "intermediate",
    competency: "scope_of_practice",
    source: "Aqla Volunteer Playbook",
  }),
  q({
    id: "acad.m7.q5",
    q: {
      ar: "أفضل طريقة لجمع البيانات في الفعالية:",
      en: "The best way to collect data at an event is:",
    },
    options: [
      { key: "a", ar: "على الأنظمة الرسمية المعتمدة من أقلع فقط", en: "Only on Aqla's approved official systems" },
      { key: "b", ar: "على دفاتر شخصية للمتطوعين", en: "In volunteers' personal notebooks" },
      { key: "c", ar: "في مذكرات هواتفهم الشخصية", en: "In personal phone notes" },
      { key: "d", ar: "على منصات التواصل الاجتماعي علنًا", en: "Publicly on social media" },
    ],
    correctKey: "a",
    explanation: {
      ar: "الأنظمة الرسمية تحمي الخصوصية وتسمح بالتدقيق.",
      en: "Official systems protect privacy and enable auditability.",
    },
    difficulty: "foundational",
    competency: "privacy",
    safetyCritical: true,
    source: "Aqla Privacy Policy",
  }),
  q({
    id: "acad.m7.q6",
    q: {
      ar: "قبل تسجيل قصة نجاح شخص للنشر، يجب:",
      en: "Before recording someone's success story for publication, you must:",
    },
    options: [
      { key: "a", ar: "الحصول على موافقة صريحة مكتوبة تحدّد كيفية الاستخدام والحق في السحب", en: "Obtain an explicit written consent that defines how the story will be used and the right to withdraw" },
      { key: "b", ar: "أخذ الموافقة الشفوية فقط بعد النشر", en: "Get verbal consent only, after publication" },
      { key: "c", ar: "افتراض أن الجميع يوافقون تلقائيًا", en: "Assume everyone consents automatically" },
      { key: "d", ar: "النشر أولًا ثم السؤال", en: "Publish first, ask later" },
    ],
    correctKey: "a",
    explanation: {
      ar: "الموافقة المسبقة الواضحة شرط أخلاقي وقانوني.",
      en: "Prior explicit consent is both an ethical and legal requirement.",
    },
    difficulty: "intermediate",
    competency: "privacy",
    safetyCritical: true,
    source: "Aqla Privacy Policy",
  }),
  q({
    id: "acad.m7.q7",
    q: {
      ar: "زائر يطلب معلومة طبية دقيقة عن تفاعل دوائي معيّن. التصرّف:",
      en: "A visitor asks a precise medical question about a specific drug interaction. Response:",
    },
    options: [
      { key: "a", ar: "الاعتذار بلطف، وإحالته إلى صيدلي مرخّص أو طبيب، أو خدمة 937", en: "Politely apologise and refer him to a licensed pharmacist / physician, or to 937" },
      { key: "b", ar: "الإجابة بمعلومة عامة قرأتها لتبدو مفيدًا", en: "Reply with a general fact you read to appear helpful" },
      { key: "c", ar: "الإجابة بأي معلومة ثم الاعتذار لاحقًا", en: "Answer with anything, apologise later" },
      { key: "d", ar: "تجاهله دون توجيه", en: "Ignore him with no direction" },
    ],
    correctKey: "a",
    explanation: {
      ar: "معرفة حدود المعرفة والإحالة الصحيحة أساسية.",
      en: "Recognising the limits of your knowledge and referring correctly is essential.",
    },
    difficulty: "foundational",
    competency: "scope_of_practice",
    safetyCritical: true,
    source: "Saudi MoH 937",
  }),
  q({
    id: "acad.m7.q8",
    q: {
      ar: "شخص غير مستعدّ للإقلاع، لكنه مستعدّ لجعل منزله خاليًا من الدخان. المناسب:",
      en: "A person isn't ready to quit but is willing to make his home smoke-free. The right response is:",
    },
    options: [
      { key: "a", ar: "رفض ذلك كخطوة غير كافية", en: "Reject it as an insufficient step" },
      { key: "b", ar: "تشجيع هذه الخطوة الوقائية المهمّة وتقديم نصائح عملية لتنفيذها بأمان", en: "Encourage this important protective step and offer practical tips to implement it safely" },
      { key: "c", ar: "إخباره أن هذا لن يساعد أحدًا", en: "Tell him it will help no one" },
      { key: "d", ar: "الضغط عليه لتحديد يوم إقلاع فورًا", en: "Pressure him to set a quit date immediately" },
    ],
    correctKey: "b",
    explanation: {
      ar: "المنازل الخالية من الدخان تحمي غير المدخنين وتقلّل التعرض؛ خطوة مقبولة ومهمّة.",
      en: "Smoke-free homes protect non-smokers and reduce exposure — a valid and important step.",
    },
    difficulty: "intermediate",
    competency: "secondhand_smoke",
    source: "WHO MPOWER",
  }),
];

// -----------------------------------------------------------------------------
// Assemble modules
// -----------------------------------------------------------------------------
export const MODULES: Module[] = [
  {
    num: "01",
    slug: "tobacco-basics",
    title: { ar: "أساسيات التبغ والنيكوتين والصحة العامة", en: "Foundations of Tobacco, Nicotine & Public Health" },
    summary: {
      ar: "حقائق موثقة من WHO وCDC حول التبغ ودور المتطوع التوعوي.",
      en: "WHO- and CDC-verified facts about tobacco and the volunteer's awareness role.",
    },
    duration: { ar: "20 دقيقة", en: "20 min" },
    tags: ["#WHO", "#CDC"],
    wide: true,
    featured: true,
    content: [
      {
        heading: { ar: "ما هو التبغ والنيكوتين؟", en: "What are tobacco and nicotine?" },
        body: {
          ar: "التبغ نبات تحتوي أوراقه على النيكوتين، مادة مسبّبة للاعتماد. تُستهلك منتجات التبغ بالتدخين أو المضغ أو الاستنشاق. النيكوتين موجود أيضًا في الفيب وأكياس النيكوتين والمنتجات المسخّنة.",
          en: "Tobacco is a plant whose leaves contain nicotine — a dependence-forming substance. Tobacco is smoked, chewed, or snuffed. Nicotine is also delivered by vapes, pouches, and heated tobacco.",
        },
      },
      {
        heading: { ar: "العبء الصحي", en: "Health burden" },
        body: {
          ar: "التبغ يقتل أكثر من 8 ملايين شخص سنويًا حول العالم، منهم نحو 1.3 مليون من غير المدخنين المعرّضين للتدخين السلبي (WHO 2024).",
          en: "Tobacco kills more than 8 million people a year worldwide, including ~1.3 million non-smokers exposed to second-hand smoke (WHO 2024).",
        },
      },
      {
        heading: { ar: "الفرق بين الاعتماد والاحتراق", en: "Dependence vs combustion harm" },
        body: {
          ar: "النيكوتين هو ما يبقي الشخص مستخدمًا؛ لكن معظم الأمراض المميتة (قلب، سرطان، انسداد رئوي) تنتج من دخان الاحتراق ومكوناته الآلاف، وليس من النيكوتين وحده.",
          en: "Nicotine is what keeps a person using; but most lethal disease (heart, cancer, COPD) comes from combustion smoke and its thousands of constituents — not from nicotine alone.",
        },
      },
      {
        heading: { ar: "دور المتطوع", en: "The volunteer's role" },
        body: {
          ar: "التوعية، الاستماع، والإحالة الآمنة. المتطوع لا يشخّص ولا يصف دواءً ولا يقرّر جرعة، ويحترم استقلالية الشخص.",
          en: "Awareness, listening, safe referral. The volunteer does not diagnose or prescribe or set doses; they respect the person's autonomy.",
        },
      },
    ],
    sources: [
      { label: "WHO Tobacco Fact Sheet (2024)", url: "https://www.who.int/news-room/fact-sheets/detail/tobacco" },
      { label: "CDC — Smoking & Tobacco Use", url: "https://www.cdc.gov/tobacco/" },
      { label: "U.S. Surgeon General — Smoking Cessation (2020)", url: "https://www.cdc.gov/tobacco/sgr/2020-smoking-cessation/" },
    ],
    quiz: M1,
  },
  {
    num: "02",
    slug: "dependence-and-products",
    title: { ar: "الاعتماد والانسحاب واستخدام المنتجات", en: "Dependence, Withdrawal & Product Use" },
    summary: {
      ar: "علامات الاعتماد، الانسحاب، والاستخدام المزدوج، والفرق بين الفرز والتشخيص.",
      en: "Dependence signs, withdrawal, dual use, and the screening-vs-diagnosis distinction.",
    },
    duration: { ar: "20 دقيقة", en: "20 min" },
    tags: ["#dependence"],
    content: [
      {
        heading: { ar: "علامات الاعتماد", en: "Signs of dependence" },
        body: {
          ar: "الوقت القصير من الاستيقاظ إلى أول استخدام، صعوبة التوقف رغم المحاولة، الرغبة الشديدة، وأعراض الانسحاب عند التأخير.",
          en: "Short time from waking to first use, difficulty stopping despite trying, strong cravings, and withdrawal symptoms when delayed.",
        },
      },
      {
        heading: { ar: "الانسحاب", en: "Withdrawal" },
        body: {
          ar: "تهيّج، قلق، صعوبة تركيز، رغبات شديدة — أعراض حقيقية لكنها مؤقتة وتخفّ خلال أسابيع قليلة.",
          en: "Irritability, anxiety, difficulty concentrating, strong cravings — real but time-limited, typically easing within a few weeks.",
        },
      },
      {
        heading: { ar: "الفرز مقابل التشخيص", en: "Screening vs diagnosis" },
        body: {
          ar: "تقييم أقلع أداة فرز توعوية تُوجّه إلى الدعم المناسب؛ وهو ليس تشخيصًا سريريًا. الحالات المعقّدة تُحال لمختصّ.",
          en: "The Aqla assessment is a non-diagnostic screening tool that routes people to appropriate support; it is not a clinical diagnosis. Complex cases are referred.",
        },
      },
    ],
    sources: [
      { label: "WHO Clinical Treatment Guideline (2024)", url: "https://www.who.int/publications/i/item/9789240084278" },
      { label: "CDC — Nicotine Addiction", url: "https://www.cdc.gov/tobacco/basic_information/nicotine/" },
    ],
    quiz: M2,
  },
  {
    num: "03",
    slug: "communication-skills",
    title: { ar: "مهارات التواصل", en: "Communication Skills" },
    summary: {
      ar: "طلب الإذن، الأسئلة المفتوحة، الاستماع العاكس، واحترام الاستقلالية.",
      en: "Asking permission, open questions, reflective listening, respecting autonomy.",
    },
    duration: { ar: "18 دقيقة", en: "18 min" },
    tags: ["#communication"],
    content: [
      {
        heading: { ar: "طلب الإذن أولًا", en: "Permission first" },
        body: {
          ar: "قبل أي حديث عن التدخين، اطلب إذن الشخص. هذه الخطوة البسيطة تفتح الحوار وتقلّل المقاومة.",
          en: "Before any tobacco conversation, ask permission. This small step opens dialogue and reduces resistance.",
        },
      },
      {
        heading: { ar: "الأسئلة المفتوحة والاستماع العاكس", en: "Open questions & reflective listening" },
        body: {
          ar: "الأسئلة التي تبدأ بـ«كيف» أو «ماذا» أفضل من الأسئلة المغلقة. أعد صياغة ما قاله الشخص لتؤكّد فهمك.",
          en: "Questions starting with “how” or “what” outperform yes/no questions. Restate what the person said to confirm understanding.",
        },
      },
      {
        heading: { ar: "احترام الرفض", en: "Respecting refusal" },
        body: {
          ar: "إذا رفض الشخص الحوار، اشكره، واحترم قراره، واترك له خيار العودة لاحقًا.",
          en: "If a person declines the conversation, thank them, respect the decision, and leave the door open for later.",
        },
      },
    ],
    sources: [
      { label: "Motivational Interviewing (Miller & Rollnick)", url: "https://motivationalinterviewing.org/" },
    ],
    quiz: M3,
  },
  {
    num: "04",
    slug: "readiness-and-planning",
    title: { ar: "الاستعداد والتخطيط للإقلاع", en: "Readiness & Quit Planning" },
    summary: {
      ar: "تقييم الاستعداد، اختيار يوم الإقلاع، وتحديد المحفزات وطرق التعامل.",
      en: "Assessing readiness, choosing a quit date, identifying triggers and coping tools.",
    },
    duration: { ar: "22 دقيقة", en: "22 min" },
    tags: ["#planning"],
    content: [
      {
        heading: { ar: "مراحل الاستعداد", en: "Stages of readiness" },
        body: {
          ar: "الناس يتحرّكون بين مراحل: قبل التفكير، التفكير، الاستعداد، الفعل، الحفاظ. المتطوع يُلبّي الشخص في مرحلته الحالية.",
          en: "People move through stages: pre-contemplation, contemplation, preparation, action, maintenance. Meet the person where they are.",
        },
      },
      {
        heading: { ar: "خطة إقلاع مبسّطة", en: "A simple quit plan" },
        body: {
          ar: "اختيار يوم، تحديد المحفزات، خطط بديلة لكل محفز، دعم مقرّبين، ومتابعة قصيرة في الأسابيع الأولى، مع دواء موصوف عند الحاجة.",
          en: "Pick a date, list triggers, plan an alternative for each, engage a support person, arrange brief follow-up in the first weeks, add a prescribed medication when appropriate.",
        },
      },
      {
        heading: { ar: "الإحالة", en: "Referral" },
        body: {
          ar: "الحالات المعقدة (حمل، حالات نفسية، أدوية متعددة) تُحال إلى مختص. 937 للاستشارات الصحية.",
          en: "Complex cases (pregnancy, mental-health conditions, poly-pharmacy) go to a qualified clinician. 937 for general health advice.",
        },
      },
    ],
    sources: [
      { label: "USPSTF — Tobacco Cessation", url: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/tobacco-use-in-adults-and-pregnant-women-counseling-and-interventions" },
      { label: "Saudi MoH 937", url: "https://www.moh.gov.sa/" },
    ],
    quiz: M4,
  },
  {
    num: "05",
    slug: "cravings-and-relapse",
    title: { ar: "الرغبة والانتكاسة والدعم اللطيف", en: "Cravings, Lapses & Relapse Support" },
    summary: {
      ar: "التعامل مع الرغبة والانتكاسة دون لوم أو وصم.",
      en: "Handling cravings and relapse without blame or shame.",
    },
    duration: { ar: "18 دقيقة", en: "18 min" },
    tags: ["#coping"],
    content: [
      {
        heading: { ar: "طبيعة الرغبة", en: "The nature of cravings" },
        body: {
          ar: "الرغبة تأتي كموجات قصيرة وتخفّ. أدوات: تأخير، تشتيت، تنفّس بطيء، شرب ماء، تغيير المكان.",
          en: "Cravings come as short waves and subside. Tools: delay, distraction, slow breathing, water, change of location.",
        },
      },
      {
        heading: { ar: "زلّة أم انتكاسة", en: "Lapse vs relapse" },
        body: {
          ar: "الزلّة استخدام قصير مؤقت لا يُلغي المكسب؛ الانتكاسة عودة مستمرّة تحتاج مراجعة للخطة ودعم إضافي.",
          en: "A lapse is a brief slip that does not erase progress; a sustained relapse warrants plan review and additional support.",
        },
      },
      {
        heading: { ar: "لغة داعمة", en: "Supportive language" },
        body: {
          ar: "لا لوم ولا وصم؛ نُطبّع الصعوبة ونركّز على ما يمكن فعله في الخطوة القادمة.",
          en: "No blame, no stigma; normalise difficulty and focus on the next step forward.",
        },
      },
    ],
    sources: [
      { label: "U.S. Surgeon General (2020)", url: "https://www.cdc.gov/tobacco/sgr/2020-smoking-cessation/" },
    ],
    quiz: M5,
  },
  {
    num: "06",
    slug: "safety-and-referral",
    title: { ar: "السلامة والحدود والإحالة", en: "Safety, Boundaries & Referral" },
    summary: {
      ar: "الطوارئ، حماية القُصّر، الحمل، الأدوية، وحدود السرية.",
      en: "Emergencies, safeguarding minors, pregnancy, medications, and confidentiality limits.",
    },
    duration: { ar: "25 دقيقة", en: "25 min" },
    tags: ["#safety"],
    wide: true,
    content: [
      {
        heading: { ar: "الطوارئ الطبية", en: "Medical emergencies" },
        body: {
          ar: "ألم صدر شديد، ضيق تنفّس، فقدان وعي — تصعيد فوري لخدمات الطوارئ (911). لا يقوم المتطوع بأي تدخّل طبي.",
          en: "Severe chest pain, shortness of breath, loss of consciousness — immediate escalation to emergency services (911). Volunteers do not perform any medical intervention.",
        },
      },
      {
        heading: { ar: "المخاطر النفسية", en: "Mental-health risks" },
        body: {
          ar: "أفكار إيذاء الذات أو الانتحار: لا سرية مطلقة؛ التصعيد إلى خط الصحة النفسية (920033360) أو الطوارئ (911) عند الخطر الوشيك.",
          en: "Self-harm or suicidal thoughts: no absolute confidentiality; escalate to the mental-health line (920033360) or 911 if the risk is imminent.",
        },
      },
      {
        heading: { ar: "الحمل والقُصّر", en: "Pregnancy & minors" },
        body: {
          ar: "أي سؤال عن دواء أثناء الحمل يُحال لطبيب مؤهّل. مستخدمو النيكوتين تحت 18 عامًا يدخلون مسار حماية القُصّر مع إشراك وليّ الأمر.",
          en: "Any medication question during pregnancy goes to a qualified clinician. Under-18 nicotine users enter the safeguarding pathway with guardian involvement.",
        },
      },
      {
        heading: { ar: "الأدوية", en: "Medications" },
        body: {
          ar: "المتطوع لا يختار دواءً ولا جرعة ولا يناقش موانع الاستعمال؛ الإحالة إلى صيدلي مرخّص أو طبيب.",
          en: "Volunteers do not choose medications, doses, or contraindications; refer to a licensed pharmacist or physician.",
        },
      },
      {
        heading: { ar: "الخصوصية", en: "Privacy" },
        body: {
          ar: "بيانات المستفيدين تُحفظ فقط في الأنظمة الرسمية المعتمدة. ممنوع منعًا باتًا حفظها في الهواتف الشخصية أو تطبيقات المراسلة الشخصية.",
          en: "Participant data is stored only in Aqla's approved systems. Never on personal phones or personal messaging apps.",
        },
      },
    ],
    sources: [
      { label: "Saudi Red Crescent (911)", url: "https://www.srca.org.sa/" },
      { label: "Saudi MoH mental-health line 920033360", url: "https://www.moh.gov.sa/" },
      { label: "WHO Clinical Treatment Guideline (2024)", url: "https://www.who.int/publications/i/item/9789240084278" },
    ],
    quiz: M6,
  },
  {
    num: "07",
    slug: "community-and-pathways",
    title: { ar: "التطبيق المجتمعي ومسارات أقلع", en: "Community Application & Aqla Pathways" },
    summary: {
      ar: "أخلاقيات الفعاليات، الخصوصية، والإحالة إلى المسارات الرسمية.",
      en: "Event ethics, privacy, and referral to official pathways.",
    },
    duration: { ar: "20 دقيقة", en: "20 min" },
    tags: ["#outreach"],
    content: [
      {
        heading: { ar: "الحوارات الآمنة في الفعاليات", en: "Safe conversations at events" },
        body: {
          ar: "اعرض التقييم كخيار، اشرح ما يفعل، واحترم الرفض. لا تضغط ولا تجادل.",
          en: "Offer the assessment as an option, explain what it does, and respect refusal. Do not pressure or argue.",
        },
      },
      {
        heading: { ar: "الخصوصية أولًا", en: "Privacy first" },
        body: {
          ar: "اذكر إشعار الخصوصية قبل جمع أي معلومة. المشاركة يمكن أن تكون مجهولة الهوية.",
          en: "State the privacy notice before collecting any information. Participation can be fully anonymous.",
        },
      },
      {
        heading: { ar: "خارج نطاق الدور", en: "Out of scope" },
        body: {
          ar: "المشكلات النفسية المعقّدة، والاستفسارات الطبية الدقيقة، والقصص الحسّاسة تُحال إلى المسار المناسب أو الخط الرسمي 937.",
          en: "Complex mental-health issues, precise medical questions, and sensitive stories are referred to the appropriate pathway or the official 937 line.",
        },
      },
    ],
    sources: [
      { label: "Aqla Volunteer Playbook", url: "https://aqla1.com/" },
      { label: "Saudi MoH 937", url: "https://www.moh.gov.sa/" },
    ],
    quiz: M7,
  },
];

export function getModule(slug: string): Module | undefined {
  return MODULES.find((m) => m.slug === slug);
}
