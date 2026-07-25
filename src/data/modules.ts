// Aqla Academy — 7 Modules
// Content synthesized from WHO (Tobacco fact sheet 2024, MPOWER, WHO clinical
// treatment guidelines 2024) and U.S. CDC (Smoking & Tobacco Use, Benefits of
// Quitting, Nicotine Addiction), plus U.S. Surgeon General 2020 report.
// Every quiz answer is derived directly from the module's "content" section
// and cross-referenced with the primary sources listed under `sources`.

export type Bi = { ar: string; en: string };

export type ModuleSection = {
  heading: Bi;
  body: Bi;
};

export type QuizQuestion = {
  q: Bi;
  options: Bi[];
  correctIndex: number;
  explanation: Bi;
};

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
  quiz: QuizQuestion[];
};

export const MODULES: Module[] = [
  // ─────────────────────────────────────────────────────────────
  {
    num: "01",
    slug: "tobacco-basics",
    title: { ar: "أساسيات التبغ", en: "Tobacco Basics" },
    summary: {
      ar: "حقائق موثقة من منظمة الصحة العالمية ومراكز CDC حول التبغ ومخاطره.",
      en: "WHO- and CDC-verified facts about tobacco and its health burden.",
    },
    duration: { ar: "15 دقيقة", en: "15 min" },
    tags: ["#WHO", "#CDC"],
    wide: true,
    featured: true,
    content: [
      {
        heading: { ar: "ما هو التبغ؟", en: "What is tobacco?" },
        body: {
          ar: "التبغ نبات تحتوي أوراقه على النيكوتين، وهي مادة مسببة للإدمان. يُستهلك التبغ بالتدخين أو المضغ أو الاستنشاق، وكل أشكاله ضارة ولا يوجد مستوى آمن للتعرض.",
          en: "Tobacco is a plant whose leaves contain nicotine, an addictive drug. It is smoked, chewed, or snuffed. All forms are harmful and there is no safe level of exposure.",
        },
      },
      {
        heading: { ar: "العبء الصحي العالمي", en: "Global health burden" },
        body: {
          ar: "يقتل التبغ أكثر من 8 ملايين شخص سنويًا حول العالم، منهم نحو 1.3 مليون من غير المدخنين المعرّضين للتدخين السلبي (منظمة الصحة العالمية، 2024).",
          en: "Tobacco kills more than 8 million people every year worldwide, including about 1.3 million non-smokers exposed to second-hand smoke (WHO, 2024).",
        },
      },
      {
        heading: { ar: "المكونات الضارة", en: "Harmful constituents" },
        body: {
          ar: "يحتوي دخان السجائر على أكثر من 7,000 مادة كيميائية، منها ما لا يقل عن 250 مادة ضارة و 69 مادة معروفة بأنها مسببة للسرطان (CDC).",
          en: "Cigarette smoke contains more than 7,000 chemicals, of which at least 250 are known to be harmful and about 69 are known human carcinogens (CDC).",
        },
      },
    ],
    sources: [
      { label: "WHO Tobacco Fact Sheet (2024)", url: "https://www.who.int/news-room/fact-sheets/detail/tobacco" },
      { label: "CDC — Smoking & Tobacco Use", url: "https://www.cdc.gov/tobacco/" },
    ],
    quiz: [
      {
        q: { ar: "كم عدد الوفيات السنوية بسبب التبغ حسب منظمة الصحة العالمية؟", en: "How many people does tobacco kill each year according to WHO?" },
        options: [
          { ar: "أقل من مليون", en: "Less than 1 million" },
          { ar: "حوالي 3 ملايين", en: "About 3 million" },
          { ar: "أكثر من 8 ملايين", en: "More than 8 million" },
          { ar: "أكثر من 20 مليون", en: "More than 20 million" },
        ],
        correctIndex: 2,
        explanation: {
          ar: "منظمة الصحة العالمية (2024): التبغ يقتل أكثر من 8 ملايين شخص سنويًا.",
          en: "WHO (2024): tobacco kills more than 8 million people each year.",
        },
      },
      {
        q: { ar: "كم عدد المواد الكيميائية في دخان السجائر؟", en: "How many chemicals are in cigarette smoke?" },
        options: [
          { ar: "حوالي 100", en: "About 100" },
          { ar: "حوالي 700", en: "About 700" },
          { ar: "أكثر من 7,000", en: "More than 7,000" },
          { ar: "حوالي 70,000", en: "About 70,000" },
        ],
        correctIndex: 2,
        explanation: {
          ar: "CDC: دخان السجائر يحتوي على أكثر من 7,000 مادة كيميائية.",
          en: "CDC: cigarette smoke contains more than 7,000 chemicals.",
        },
      },
      {
        q: { ar: "ما عدد الوفيات السنوية الناتجة عن التدخين السلبي؟", en: "How many annual deaths are caused by second-hand smoke?" },
        options: [
          { ar: "لا يسبب وفيات", en: "It causes no deaths" },
          { ar: "حوالي 1.3 مليون", en: "About 1.3 million" },
          { ar: "حوالي 100,000", en: "About 100,000" },
          { ar: "أكثر من 5 ملايين", en: "More than 5 million" },
        ],
        correctIndex: 1,
        explanation: {
          ar: "منظمة الصحة العالمية: نحو 1.3 مليون من غير المدخنين يموتون سنويًا بسبب التدخين السلبي.",
          en: "WHO: about 1.3 million non-smokers die each year from second-hand smoke.",
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    num: "02",
    slug: "tobacco-products",
    title: { ar: "أنواع منتجات التبغ", en: "Tobacco Product Types" },
    summary: {
      ar: "السجائر، الشيشة، السجائر الإلكترونية، وأظرف النيكوتين — الحقائق كما نشرتها WHO و CDC.",
      en: "Cigarettes, waterpipe, e-cigarettes, and nicotine pouches — as documented by WHO and CDC.",
    },
    duration: { ar: "20 دقيقة", en: "20 min" },
    tags: ["#products"],
    content: [
      {
        heading: { ar: "السجائر التقليدية", en: "Combustible cigarettes" },
        body: {
          ar: "أكثر أشكال التبغ استخدامًا وأكثرها فتكًا، وترتبط بأمراض القلب والسرطان وأمراض الرئة المزمنة (CDC).",
          en: "The most common and most lethal form of tobacco, causing heart disease, cancer, and chronic lung disease (CDC).",
        },
      },
      {
        heading: { ar: "الشيشة (النارجيلة)", en: "Waterpipe (shisha)" },
        body: {
          ar: "جلسة شيشة نموذجية (45–60 دقيقة) قد تُعرّض المستخدم لكمية دخان تعادل استنشاق 100 سيجارة أو أكثر (WHO).",
          en: "A typical waterpipe session (45–60 minutes) can expose the user to smoke equivalent to 100+ cigarettes (WHO).",
        },
      },
      {
        heading: { ar: "السجائر الإلكترونية (فيب)", en: "E-cigarettes (vapes)" },
        body: {
          ar: "ليست آمنة؛ يحتوي رذاذها على النيكوتين ومعادن ثقيلة ومركبات ضارة، ومنظمة الصحة العالمية لا توصي بها كوسيلة لعامة السكان للإقلاع.",
          en: "Not harmless; the aerosol contains nicotine, heavy metals, and harmful compounds. WHO does not recommend them as a population-level cessation aid.",
        },
      },
      {
        heading: { ar: "أظرف النيكوتين والتبغ غير المدخن", en: "Nicotine pouches & smokeless tobacco" },
        body: {
          ar: "توفر النيكوتين عبر الغشاء المخاطي للفم، وتسبب الإدمان، وترتبط باضطرابات اللثة وسرطان الفم في حالات التبغ غير المدخن.",
          en: "Deliver nicotine via the oral mucosa, cause addiction, and (for smokeless tobacco) are linked to gum disease and oral cancer.",
        },
      },
    ],
    sources: [
      { label: "WHO — Waterpipe tobacco smoking", url: "https://www.who.int/publications/i/item/advisory-note-waterpipe-tobacco-smoking-health-effects" },
      { label: "CDC — E-cigarettes", url: "https://www.cdc.gov/tobacco/e-cigarettes/" },
    ],
    quiz: [
      {
        q: { ar: "جلسة شيشة نموذجية قد تعادل تدخين كم سيجارة؟", en: "One typical waterpipe session can equal how many cigarettes?" },
        options: [
          { ar: "1–2 سيجارة", en: "1–2 cigarettes" },
          { ar: "10 سجائر", en: "10 cigarettes" },
          { ar: "100 سيجارة أو أكثر", en: "100 cigarettes or more" },
          { ar: "لا يعادل أي سيجارة", en: "Zero cigarettes" },
        ],
        correctIndex: 2,
        explanation: { ar: "WHO: جلسة شيشة قد تعادل 100 سيجارة أو أكثر.", en: "WHO: one waterpipe session can equal 100+ cigarettes." },
      },
      {
        q: { ar: "هل السجائر الإلكترونية آمنة؟", en: "Are e-cigarettes safe?" },
        options: [
          { ar: "آمنة تمامًا", en: "Completely safe" },
          { ar: "ليست آمنة وتحتوي على مواد ضارة", en: "Not safe; contain harmful substances" },
          { ar: "توصي بها WHO للجميع", en: "WHO recommends them for everyone" },
          { ar: "لا تحتوي على نيكوتين", en: "Contain no nicotine" },
        ],
        correctIndex: 1,
        explanation: { ar: "WHO/CDC: رذاذها يحتوي نيكوتين ومعادن ومركبات ضارة.", en: "WHO/CDC: the aerosol contains nicotine, metals, and harmful compounds." },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    num: "03",
    slug: "nicotine-and-risks",
    title: { ar: "النيكوتين والمخاطر", en: "Nicotine & Health Risks" },
    summary: { ar: "كيف يعمل النيكوتين على الدماغ ولماذا يسبب الإدمان.", en: "How nicotine acts on the brain and why it is addictive." },
    duration: { ar: "18 دقيقة", en: "18 min" },
    tags: ["#neuro"],
    content: [
      {
        heading: { ar: "الوصول إلى الدماغ", en: "Reaching the brain" },
        body: {
          ar: "يصل النيكوتين إلى الدماغ خلال 10–20 ثانية من استنشاق دخان السيجارة (CDC / NIDA).",
          en: "Nicotine reaches the brain within about 10–20 seconds of inhaling cigarette smoke (CDC / NIDA).",
        },
      },
      {
        heading: { ar: "الإدمان", en: "Addiction" },
        body: {
          ar: "يرفع النيكوتين إفراز الدوبامين في مسار المكافأة، مما يعزز السلوك المتكرر ويؤدي إلى الإدمان الجسدي والنفسي. النيكوتين مسبب للإدمان بقدر الهيروين والكوكايين (تقرير الجراح العام الأمريكي 1988، وأعيد تأكيده 2020).",
          en: "Nicotine boosts dopamine in the brain’s reward pathway, reinforcing repeated use and producing physical and psychological dependence. Nicotine is as addictive as heroin or cocaine (U.S. Surgeon General 1988, reaffirmed 2020).",
        },
      },
      {
        heading: { ar: "الأمراض المرتبطة بالتدخين", en: "Diseases caused by smoking" },
        body: {
          ar: "أمراض القلب التاجية، السكتة الدماغية، سرطان الرئة والحنجرة والفم والمثانة، الانسداد الرئوي المزمن (COPD)، وضعف الخصوبة (CDC).",
          en: "Coronary heart disease, stroke, cancers of the lung, larynx, mouth and bladder, chronic obstructive pulmonary disease (COPD), and reduced fertility (CDC).",
        },
      },
    ],
    sources: [
      { label: "U.S. Surgeon General — Smoking Cessation (2020)", url: "https://www.cdc.gov/tobacco/sgr/2020-smoking-cessation/" },
      { label: "CDC — Health Effects of Smoking", url: "https://www.cdc.gov/tobacco/basic_information/health_effects/" },
    ],
    quiz: [
      {
        q: { ar: "خلال كم ثانية يصل النيكوتين إلى الدماغ؟", en: "Within how many seconds does nicotine reach the brain?" },
        options: [
          { ar: "10–20 ثانية", en: "10–20 seconds" },
          { ar: "دقيقة واحدة", en: "1 minute" },
          { ar: "5 دقائق", en: "5 minutes" },
          { ar: "30 دقيقة", en: "30 minutes" },
        ],
        correctIndex: 0,
        explanation: { ar: "CDC/NIDA: يصل النيكوتين إلى الدماغ خلال 10–20 ثانية.", en: "CDC/NIDA: nicotine reaches the brain in 10–20 seconds." },
      },
      {
        q: { ar: "أي عبارة صحيحة عن النيكوتين؟", en: "Which statement is correct about nicotine?" },
        options: [
          { ar: "غير مسبب للإدمان", en: "Not addictive" },
          { ar: "مسبب للإدمان بقدر الهيروين والكوكايين", en: "As addictive as heroin and cocaine" },
          { ar: "يُنقص السرطان", en: "Reduces cancer risk" },
          { ar: "معتمد كعلاج للاكتئاب", en: "Approved to treat depression" },
        ],
        correctIndex: 1,
        explanation: { ar: "تقرير الجراح العام الأمريكي: النيكوتين مسبب للإدمان بقدر الهيروين والكوكايين.", en: "U.S. Surgeon General: nicotine is as addictive as heroin/cocaine." },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    num: "04",
    slug: "quit-strategies",
    title: { ar: "استراتيجيات الإقلاع", en: "Quit Strategies" },
    summary: { ar: "علاجات مثبتة علميًا حسب توصيات WHO 2024 و USPSTF.", en: "Evidence-based treatments per WHO 2024 & USPSTF." },
    duration: { ar: "25 دقيقة", en: "25 min" },
    tags: ["#evidence"],
    wide: true,
    content: [
      {
        heading: { ar: "الخيارات المعتمدة من WHO (2024)", en: "WHO-endorsed options (2024)" },
        body: {
          ar: "تنصح إرشادات WHO لعلاج الاعتماد على التبغ (2024) بدمج الدعم السلوكي مع الدواء. الأدوية الأولى: العلاج التعويضي بالنيكوتين (NRT)، فارينيكلين، بوبروبيون، وسايتيسين.",
          en: "The WHO 2024 clinical treatment guideline recommends combining behavioural support with pharmacotherapy. First-line medications: nicotine replacement therapy (NRT), varenicline, bupropion, and cytisine.",
        },
      },
      {
        heading: { ar: "الدعم السلوكي", en: "Behavioural support" },
        body: {
          ar: "المشورة الفردية أو الجماعية أو الهاتفية (خطوط المساعدة على الإقلاع quitlines) تزيد فرص الإقلاع، وتزيد أكثر عند دمجها مع الدواء.",
          en: "Individual, group, or telephone counselling (quitlines) raises quit rates, and raises them further when combined with medication.",
        },
      },
      {
        heading: { ar: "خطة الإقلاع العملية", en: "A practical quit plan" },
        body: {
          ar: "حدّد يوم الإقلاع، أزل المحفزات، أخبر المقربين، استخدم دواءً معتمدًا، وتابع مع مستشار في الأسابيع الأولى — النموذج المعروف بـ START (Set / Tell / Anticipate / Remove / Talk).",
          en: "Set a quit date, tell your circle, anticipate triggers, remove tobacco from your environment, and talk to a counsellor — the classic START framework.",
        },
      },
    ],
    sources: [
      { label: "WHO Clinical Treatment Guideline for Tobacco Cessation (2024)", url: "https://www.who.int/publications/i/item/9789240084278" },
      { label: "USPSTF — Tobacco Smoking Cessation", url: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/tobacco-use-in-adults-and-pregnant-women-counseling-and-interventions" },
    ],
    quiz: [
      {
        q: { ar: "أي من التالي دواء أولي معتمد من WHO للإقلاع؟", en: "Which is a WHO first-line quit medication?" },
        options: [
          { ar: "المضادات الحيوية", en: "Antibiotics" },
          { ar: "فارينيكلين", en: "Varenicline" },
          { ar: "الباراسيتامول", en: "Paracetamol" },
          { ar: "فيتامين C", en: "Vitamin C" },
        ],
        correctIndex: 1,
        explanation: { ar: "WHO 2024: فارينيكلين وNRT وبوبروبيون وسايتيسين خطوط أولى.", en: "WHO 2024: varenicline, NRT, bupropion, cytisine are first-line." },
      },
      {
        q: { ar: "أفضل استراتيجية للإقلاع هي:", en: "The most effective quit strategy is:" },
        options: [
          { ar: "الدواء وحده", en: "Medication alone" },
          { ar: "المشورة وحدها", en: "Counselling alone" },
          { ar: "دمج المشورة مع الدواء", en: "Combining counselling with medication" },
          { ar: "الانتظار دون فعل شيء", en: "Doing nothing" },
        ],
        correctIndex: 2,
        explanation: { ar: "الدمج بين السلوك والدواء يعطي أعلى فرص للإقلاع (WHO/USPSTF).", en: "Combined behavioural + pharmacotherapy gives the highest quit rates." },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    num: "05",
    slug: "institutional-policies",
    title: { ar: "السياسات المؤسسية", en: "Institutional Policies" },
    summary: { ar: "إطار MPOWER من منظمة الصحة العالمية والبيئات الخالية من الدخان.", en: "WHO MPOWER framework and smoke-free environments." },
    duration: { ar: "12 دقيقة", en: "12 min" },
    tags: ["#policy"],
    content: [
      {
        heading: { ar: "إطار MPOWER", en: "MPOWER framework" },
        body: {
          ar: "M: مراقبة الاستخدام. P: حماية الناس من الدخان. O: عرض المساعدة على الإقلاع. W: التحذير من الأخطار. E: فرض حظر الإعلانات. R: رفع الضرائب.",
          en: "M: Monitor use. P: Protect from smoke. O: Offer help to quit. W: Warn about dangers. E: Enforce advertising bans. R: Raise taxes.",
        },
      },
      {
        heading: { ar: "الأماكن الخالية من الدخان", en: "Smoke-free environments" },
        body: {
          ar: "لا يوجد مستوى آمن للتعرض للتدخين السلبي. تشريعات الأماكن الخالية من الدخان تقلل الاحتشاء والوفيات الرئوية (WHO / CDC).",
          en: "There is no safe level of second-hand smoke. Smoke-free laws reduce heart attacks and lung deaths (WHO / CDC).",
        },
      },
    ],
    sources: [
      { label: "WHO MPOWER", url: "https://www.who.int/initiatives/mpower" },
    ],
    quiz: [
      {
        q: { ar: "ماذا يعني حرف R في MPOWER؟", en: "What does the R in MPOWER stand for?" },
        options: [
          { ar: "Reduce staff", en: "Reduce staff" },
          { ar: "Raise taxes on tobacco", en: "Raise taxes on tobacco" },
          { ar: "Remove hospitals", en: "Remove hospitals" },
          { ar: "Restrict water", en: "Restrict water" },
        ],
        correctIndex: 1,
        explanation: { ar: "R = رفع الضرائب على التبغ.", en: "R = Raise taxes on tobacco." },
      },
      {
        q: { ar: "ما المستوى الآمن للتعرض للتدخين السلبي؟", en: "What is the safe level of second-hand smoke exposure?" },
        options: [
          { ar: "ساعة يوميًا", en: "1 hour/day" },
          { ar: "لا يوجد مستوى آمن", en: "No safe level" },
          { ar: "10 دقائق فقط", en: "Only 10 minutes" },
          { ar: "في الأماكن المفتوحة فقط", en: "Only outdoors" },
        ],
        correctIndex: 1,
        explanation: { ar: "WHO/CDC: لا يوجد مستوى آمن للتدخين السلبي.", en: "WHO/CDC: there is no safe level of second-hand smoke." },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    num: "06",
    slug: "benefits-of-quitting",
    title: { ar: "فوائد الإقلاع", en: "Benefits of Quitting" },
    summary: { ar: "جدول التعافي الزمني الرسمي من CDC.", en: "The official CDC recovery timeline." },
    duration: { ar: "16 دقيقة", en: "16 min" },
    tags: ["#recovery"],
    content: [
      {
        heading: { ar: "خلال 20 دقيقة", en: "Within 20 minutes" },
        body: { ar: "ينخفض معدل ضربات القلب وضغط الدم.", en: "Heart rate and blood pressure drop." },
      },
      {
        heading: { ar: "خلال 12 ساعة", en: "Within 12 hours" },
        body: { ar: "يعود مستوى أول أكسيد الكربون في الدم إلى الطبيعي.", en: "Blood carbon monoxide returns to normal." },
      },
      {
        heading: { ar: "خلال سنة", en: "Within 1 year" },
        body: { ar: "ينخفض خطر أمراض القلب التاجية إلى نحو نصف خطر المدخن.", en: "Coronary heart disease risk drops to about half that of a smoker." },
      },
      {
        heading: { ar: "خلال 5 سنوات", en: "Within 5 years" },
        body: { ar: "ينخفض خطر السكتة الدماغية ليصل خلال 5–15 سنة إلى مستوى غير المدخن.", en: "Stroke risk falls to that of a non-smoker within 5–15 years." },
      },
      {
        heading: { ar: "خلال 10 سنوات", en: "Within 10 years" },
        body: { ar: "ينخفض خطر الوفاة بسرطان الرئة إلى نحو نصف خطر المدخن.", en: "Lung cancer death risk drops to about half that of a smoker." },
      },
    ],
    sources: [
      { label: "CDC — Benefits of Quitting", url: "https://www.cdc.gov/tobacco/quit_smoking/how_to_quit/benefits/" },
    ],
    quiz: [
      {
        q: { ar: "متى يعود أول أكسيد الكربون في الدم إلى الطبيعي بعد الإقلاع؟", en: "When does blood carbon monoxide return to normal after quitting?" },
        options: [
          { ar: "خلال 20 دقيقة", en: "Within 20 minutes" },
          { ar: "خلال 12 ساعة", en: "Within 12 hours" },
          { ar: "خلال أسبوع", en: "Within 1 week" },
          { ar: "خلال شهر", en: "Within 1 month" },
        ],
        correctIndex: 1,
        explanation: { ar: "CDC: خلال 12 ساعة يعود أول أكسيد الكربون إلى الطبيعي.", en: "CDC: within 12 hours CO returns to normal." },
      },
      {
        q: { ar: "بعد كم سنة من الإقلاع ينخفض خطر الوفاة بسرطان الرئة للنصف؟", en: "After how many years does lung cancer death risk drop by half?" },
        options: [
          { ar: "سنة واحدة", en: "1 year" },
          { ar: "3 سنوات", en: "3 years" },
          { ar: "10 سنوات", en: "10 years" },
          { ar: "30 سنة", en: "30 years" },
        ],
        correctIndex: 2,
        explanation: { ar: "CDC: بعد 10 سنوات ينخفض خطر الوفاة بسرطان الرئة للنصف.", en: "CDC: at 10 years, lung cancer death risk halves." },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    num: "07",
    slug: "support-clinics",
    title: { ar: "عيادات ومصادر الدعم", en: "Support Clinics & Resources" },
    summary: { ar: "الخدمات الوطنية والدولية المعتمدة لدعم الإقلاع.", en: "Endorsed national and international cessation resources." },
    duration: { ar: "22 دقيقة", en: "22 min" },
    tags: ["#support"],
    content: [
      {
        heading: { ar: "خطوط المساعدة (Quitlines)", en: "Quitlines" },
        body: {
          ar: "توصي WHO و CDC بخطوط المساعدة الهاتفية كتدخل فعّال ومنخفض التكلفة. في المملكة العربية السعودية: عيادات إسعاف التبغ التابعة لوزارة الصحة والاتصال على 937.",
          en: "WHO and CDC endorse telephone quitlines as effective and low-cost. In Saudi Arabia: Ministry of Health tobacco cessation clinics and 937 helpline.",
        },
      },
      {
        heading: { ar: "المتابعة الطبية", en: "Clinical follow-up" },
        body: {
          ar: "المتابعة المتكررة (زيارة أو مكالمة) خلال الأسابيع الأربعة الأولى تزيد بشكل كبير فرص النجاح.",
          en: "Frequent follow-up (visit or call) during the first 4 weeks significantly improves success rates.",
        },
      },
    ],
    sources: [
      { label: "CDC — Quitlines", url: "https://www.cdc.gov/tobacco/quit_smoking/cessation/quitlines/" },
      { label: "WHO — Cessation services", url: "https://www.who.int/activities/helping-people-to-quit-tobacco" },
    ],
    quiz: [
      {
        q: { ar: "ما رقم خط مساعدة الصحة في المملكة العربية السعودية؟", en: "What is the Saudi Ministry of Health helpline?" },
        options: [
          { ar: "911", en: "911" },
          { ar: "997", en: "997" },
          { ar: "937", en: "937" },
          { ar: "999", en: "999" },
        ],
        correctIndex: 2,
        explanation: { ar: "937 هو الرقم الرسمي لوزارة الصحة السعودية.", en: "937 is the official Saudi MoH helpline." },
      },
      {
        q: { ar: "ما فترة المتابعة الأكثر أهمية بعد الإقلاع؟", en: "Which follow-up window matters most after quitting?" },
        options: [
          { ar: "أول 4 أسابيع", en: "The first 4 weeks" },
          { ar: "بعد سنة", en: "After 1 year" },
          { ar: "بعد 10 سنوات", en: "After 10 years" },
          { ar: "لا حاجة للمتابعة", en: "No follow-up needed" },
        ],
        correctIndex: 0,
        explanation: { ar: "الأسابيع الأربعة الأولى هي الأعلى خطرًا للانتكاس.", en: "Weeks 1–4 carry the highest relapse risk." },
      },
    ],
  },
];

export function getModule(slug: string): Module | undefined {
  return MODULES.find((m) => m.slug === slug);
}
