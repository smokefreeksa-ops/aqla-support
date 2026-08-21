// Aqla Volunteer Training — static content (privacy-safe, no PII).
// 7 modules · 49 questions · 10 case scenarios.

export type TQuestion = {
  q_ar: string; q_en: string;
  opts_ar: string[]; opts_en: string[];
  correct: number;
  exp_ar: string; exp_en: string;
};

export type TCase = {
  id: string;
  title_ar: string; title_en: string;
  text_ar: string; text_en: string;
  opts_ar: string[]; opts_en: string[];
  correct: number;
  exp_ar: string; exp_en: string;
  script_ar?: string; script_en?: string;
  safety_flag?: string;
  required: boolean;
};

export type TModule = {
  slug: string;
  number: number;
  title_ar: string; title_en: string;
  subtitle_ar: string; subtitle_en: string;
  objectives_ar: string[]; objectives_en: string[];
  lesson_ar: string; lesson_en: string;
  key_points_ar: string[]; key_points_en: string[];
  script_ar?: string; script_en?: string;
  mistakes_ar: string[]; mistakes_en: string[];
  questions: TQuestion[];
  cases: TCase[];
};

// Helper: short MCQ
const Q = (
  q_ar: string, q_en: string,
  opts_ar: string[], opts_en: string[],
  correct: number,
  exp_ar: string, exp_en: string,
): TQuestion => ({ q_ar, q_en, opts_ar, opts_en, correct, exp_ar, exp_en });

export const TRAINING_MODULES: TModule[] = [
  {
    slug: "foundations",
    number: 1,
    title_ar: "أساسيات التدخين والنيكوتين والصحة العامة",
    title_en: "Foundations of Smoking, Nicotine, and Public Health",
    subtitle_ar: "مقدمة عن منتجات التبغ والنيكوتين ودور المتطوع التوعوي.",
    subtitle_en: "Introduction to tobacco and nicotine products and the volunteer awareness role.",
    objectives_ar: [
      "فهم الفرق بين التبغ والنيكوتين والسجائر والشيشة والفيب والمنتجات المسخّنة وأكياس النيكوتين.", "فهم أهمية دعم الإقلاع.", "فهم رسالة أقلع للصحة العامة.", "تجنب اللغة الواصمة.",
    ],
    objectives_en: [
      "Understand the difference between tobacco, nicotine, cigarettes, shisha, vaping, heated tobacco, and nicotine pouches.", "Understand why cessation support matters.", "Understand Aqla's public-health mission.", "Avoid stigmatizing language.",
    ],
    lesson_ar:
      "النيكوتين مادة مسببة للاعتماد توجد في التبغ ومنتجات النيكوتين الحديثة. التدخين بأي شكل يعرّض المستخدم والمحيطين به لمواد ضارة. يأتي الأشخاص بمسارات مختلفة: بعضهم يدخن السجائر، وآخرون يستخدمون الفيب أو الشيشة أو أكياس النيكوتين، والبعض يجمع بين عدة منتجات. دور المتطوع هو التوعية والمساندة والإحالة الآمنة دون إصدار حكم.",
    lesson_en:
      "Nicotine is a dependence-forming substance found in tobacco and modern nicotine products. Smoking in any form exposes the user and bystanders to harmful substances. People arrive with different pathways: some smoke cigarettes, others vape, use shisha, or nicotine pouches, and some combine products. The volunteer's role is awareness, support, and safe referral — without judgment.",
    key_points_ar: [
      "النيكوتين يسبب الاعتماد.", "دخان التبغ يعرّض المستخدم والمحيطين لمواد ضارة.", "قد يستخدم الناس منتجات مختلفة ويحتاجون مسارات دعم مختلفة.", "المتطوع يثقّف ويحيل، ولا يحكم.",
    ],
    key_points_en: [
      "Nicotine can cause dependence.", "Tobacco smoke exposes users and others to harmful substances.", "People may use different products and need different support pathways.", "Volunteers should educate and refer, not judge.",
    ],
    mistakes_ar: [
      "وصف الشخص بأنه «ضعيف» لأنه لم يستطع الإقلاع.", "تقديم معلومات طبية تفصيلية أو جرعات.", "تجاهل الفرق بين المنتجات المختلفة.",
    ],
    mistakes_en: [
      "Calling the person 'weak' for not quitting.", "Giving detailed medical advice or doses.", "Ignoring the difference between products.",
    ],
    questions: [
      Q("ما المادة الأساسية المرتبطة بالاعتماد في منتجات التبغ والنيكوتين؟", "What is the main substance linked to dependence in tobacco and nicotine products?",
        ["النيكوتين","القهوة","الأكسجين","الماء"],
        ["Nicotine","Coffee","Oxygen","Water"], 0, "النيكوتين هو المادة المسببة للاعتماد في هذه المنتجات.", "Nicotine is the dependence-forming substance in these products."),
      Q("أي مما يلي يُعد منتج نيكوتين؟", "Which of the following is a nicotine product?",
        ["أكياس النيكوتين","الحليب","الخبز","الشاي"],
        ["Nicotine pouches","Milk","Bread","Tea"], 0, "أكياس النيكوتين تحتوي على نيكوتين وتسبب الاعتماد.", "Nicotine pouches contain nicotine and can cause dependence."),
      Q("ما الدور المناسب لمتطوع أقلع؟", "What is the appropriate role of an Aqla volunteer?",
        ["تشخيص الاعتماد","وصف الأدوية","التوعية والإحالة الآمنة","إجراء عمليات"],
        ["Diagnose dependence","Prescribe medication","Educate and refer safely","Perform procedures"], 2, "المتطوع يقدم التوعية والمساندة والإحالة، وليس التشخيص أو العلاج.", "The volunteer provides awareness, support, and referral — not diagnosis or treatment."),
      Q("هل يعرّض التدخين السلبي الآخرين للضرر؟", "Does secondhand smoke expose others to harm?",
        ["نعم","لا","فقط للأطفال","فقط في الشتاء"],
        ["Yes","No","Only children","Only in winter"], 0, "التدخين السلبي يعرّض المحيطين لمواد ضارة.", "Secondhand smoke exposes bystanders to harmful substances."),
      Q("ما اللغة المناسبة عند الحديث مع شخص يدخن؟", "What language is appropriate when talking to a person who smokes?",
        ["لغة لائمة وعقابية","لغة محترمة غير حكمية","الصمت التام","السخرية"],
        ["Blaming and punitive","Respectful and non-judgmental","Total silence","Mockery"], 1, "اللغة المحترمة غير الحكمية هي الأساس.", "Respectful, non-judgmental language is essential."),
      Q("هل جميع منتجات النيكوتين متشابهة في طريقة الاستخدام؟", "Are all nicotine products used the same way?",
        ["نعم","لا"],
        ["Yes","No"], 1, "تختلف المنتجات (سجائر، فيب، شيشة، أكياس) في الاستخدام والمخاطر.", "Products differ (cigarettes, vape, shisha, pouches) in use and risk."),
      Q("ما هدف أقلع؟", "What is Aqla's goal?",
        ["بيع منتجات النيكوتين","دعم الإقلاع وحماية الصحة العامة","الترويج للسجائر","لا شيء"],
        ["Sell nicotine products","Support cessation and protect public health","Promote cigarettes","Nothing"], 1, "أقلع برنامج توعية ودعم للإقلاع وحماية الصحة العامة.", "Aqla is an awareness and cessation-support public-health program."),
    ],
    cases: [],
  },
  {
    slug: "dependence",
    number: 2,
    title_ar: "فهم الاعتماد على النيكوتين وأنواع المنتجات",
    title_en: "Understanding Nicotine Dependence and Product Types",
    subtitle_ar: "علامات الاعتماد والفروقات بين المنتجات.",
    subtitle_en: "Signs of dependence and product-type differences.",
    objectives_ar: [
      "التعرف على علامات الاعتماد الشائعة.", "فهم اختلاف الاعتماد بين المنتجات.", "إدراك أن المتطوع لا يشخّص.", "معرفة متى يُوجَّه المستخدم لتقييم أقلع.",
    ],
    objectives_en: [
      "Recognize common signs of nicotine dependence.", "Understand why dependence differs between products.", "Understand that volunteers do not diagnose dependence.", "Know when to direct users to the Aqla assessment.",
    ],
    lesson_ar:
      "علامات الاعتماد تشمل: الرغبة الشديدة، الاستخدام بعد الاستيقاظ مباشرة، محاولات إقلاع غير ناجحة، أعراض انسحاب عند التوقف. تختلف شدة الاعتماد بين السجائر والفيب والشيشة وأكياس النيكوتين والاستخدام المختلط. الفئات الشابة بحاجة لاهتمام خاص. لا يقوم المتطوع بتشخيص الاعتماد بل يوجّه لتقييم أقلع الذي يقدّم القياس الدقيق.",
    lesson_en:
      "Signs of dependence include cravings, use shortly after waking, unsuccessful quit attempts, and withdrawal symptoms on stopping. Severity differs across cigarettes, vape, shisha, nicotine pouches, and mixed use. Youth nicotine use needs special attention. Volunteers do not diagnose — they direct the person to the Aqla assessment for accurate measurement.",
    key_points_ar: [
      "الرغبة الشديدة علامة شائعة.", "الاستخدام المبكر بعد الاستيقاظ مؤشر مهم.", "أعراض الانسحاب طبيعية وليست علامة فشل.", "الاستخدام المختلط (سجائر + فيب) شائع ويحتاج تقييم.",
    ],
    key_points_en: [
      "Cravings are a common sign.", "Use shortly after waking is an important marker.", "Withdrawal symptoms are normal — not a sign of failure.", "Mixed use (cigarettes + vape) is common and needs assessment.",
    ],
    mistakes_ar: [
      "تشخيص الاعتماد بدلاً من الإحالة.", "قول إن الفيب «آمن تمامًا».", "تجاهل الاستخدام المتعدد للمنتجات.",
    ],
    mistakes_en: [
      "Diagnosing dependence instead of referring.", "Saying vaping is 'completely safe'.", "Ignoring multi-product use.",
    ],
    questions: [
      Q("أي مما يلي يُعد علامة على الاعتماد؟", "Which is a sign of nicotine dependence?",
        ["الرغبة الشديدة","حب القراءة","الجوع","النوم الجيد"],
        ["Strong cravings","Love of reading","Hunger","Good sleep"], 0, "الرغبة الشديدة من أبرز علامات الاعتماد.", "Strong cravings are a key dependence sign."),
      Q("الاستخدام خلال أول ٣٠ دقيقة من الاستيقاظ يدل على:", "Use within the first 30 minutes of waking suggests:",
        ["اعتماد منخفض","اعتماد أعلى","لا شيء","تحسن الصحة"],
        ["Low dependence","Higher dependence","Nothing","Improved health"], 1, "الاستخدام المبكر بعد الاستيقاظ يشير لاعتماد أعلى.", "Early-morning use indicates higher dependence."),
      Q("هل يقوم متطوع أقلع بتشخيص الاعتماد؟", "Does an Aqla volunteer diagnose dependence?",
        ["نعم","لا"],
        ["Yes","No"], 1, "المتطوع يحيل لتقييم أقلع، ولا يشخّص.", "Volunteers refer to the Aqla assessment — they don't diagnose."),
      Q("الاستخدام المختلط يعني:", "Mixed use means:",
        ["استخدام منتج واحد","استخدام أكثر من منتج نيكوتين","عدم الاستخدام","استخدام الماء"],
        ["Using one product","Using more than one nicotine product","Not using","Using water"], 1, "الاستخدام المختلط هو استخدام أكثر من منتج نيكوتين.", "Mixed use means using more than one nicotine product."),
      Q("أعراض الانسحاب تعني أن الشخص:", "Withdrawal symptoms mean the person:",
        ["فاشل","يعاني من اعتماد","صحته ممتازة","لا يحتاج دعمًا"],
        ["Has failed","Has dependence","Has perfect health","Needs no support"], 1, "أعراض الانسحاب علامة على الاعتماد، وليست فشلًا.", "Withdrawal indicates dependence — not failure."),
      Q("الفئة الشابة التي تستخدم النيكوتين يوميًا:", "Youth using nicotine daily:",
        ["لا تحتاج اهتمامًا","تحتاج اهتمامًا خاصًا","يجب تجاهلها","ليست مشكلة"],
        ["Need no attention","Need special attention","Should be ignored","Aren't a concern"], 1, "الفئات الشابة تحتاج اهتمامًا خاصًا وإحالة لمختص.", "Youth need special attention and clinician referral."),
      Q("أفضل طريقة لقياس شدة الاعتماد:", "Best way to measure dependence severity:",
        ["تخمين المتطوع","تقييم أقلع المعتمد","سؤال الجيران","لا يقاس"],
        ["Volunteer's guess","The Aqla assessment","Asking neighbors","Cannot be measured"], 1, "تقييم أقلع هو المرجع لقياس الاعتماد بشكل دقيق.", "The Aqla assessment is the reference for accurate measurement."),
    ],
    cases: [],
  },
  {
    slug: "communication",
    number: 3,
    title_ar: "مهارات التواصل: اسأل، استمع، ادعم، أحِل",
    title_en: "Communication Skills: Ask, Listen, Support, Refer",
    subtitle_ar: "نموذج تواصل آمن للمتطوع.",
    subtitle_en: "A safe volunteer communication model.",
    objectives_ar: [
      "استخدام لغة محترمة غير حكمية.", "طلب الإذن قبل تقديم النصيحة.", "الاستماع الفعّال.", "التشجيع دون ضغط.", "الإحالة لتقييم أقلع أو دعم واتساب عند الحاجة.",
    ],
    objectives_en: [
      "Use respectful, non-judgmental language.", "Ask permission before giving advice.", "Listen actively.", "Encourage without pressure.", "Refer to the Aqla assessment or WhatsApp support when needed.",
    ],
    lesson_ar:
      "نموذج المتطوع الآمن يقوم على أربع خطوات: اسأل بإذن، استمع باهتمام، ادعم بصدق، أحِل بأمان. هذا النموذج يحمي المستخدم ويحمي المتطوع من تجاوز حدوده.",
    lesson_en:
      "The safe volunteer model has four steps: Ask with permission, Listen with attention, Support sincerely, Refer safely. This model protects the user and keeps the volunteer within boundaries.",
    key_points_ar: [
      "اطلب الإذن قبل النصيحة.", "استمع دون مقاطعة.", "اعترف بصعوبة الموقف.", "احرص على الإحالة لمسار رسمي.",
    ],
    key_points_en: [
      "Ask permission before advising.", "Listen without interrupting.", "Acknowledge the difficulty.", "Always refer to an official pathway.",
    ],
    script_ar:
      "اسأل: هل ترغب أن نتحدث عن التدخين أو النيكوتين بطريقة بسيطة؟\nاستمع: أفهم أن الموضوع قد يكون صعبًا، وشكرًا لأنك شاركتني.\nادعم: أي خطوة صغيرة تعتبر بداية.\nأحِل: يمكنك إكمال تقييم أقلع ليتم توجيهك للمسار المناسب.",
    script_en:
      "Ask: Would it be okay if we talk briefly about smoking or nicotine?\nListen: I understand this can be difficult. Thank you for sharing.\nSupport: Even a small step can be a real beginning.\nRefer: You can complete the Aqla assessment to be guided to the right pathway.",
    mistakes_ar: [
      "إعطاء النصيحة دون إذن.", "استخدام عبارات لائمة.", "الوعد بنتيجة محددة.",
    ],
    mistakes_en: [
      "Giving advice without permission.", "Using blaming phrases.", "Promising a specific outcome.",
    ],
    questions: [
      Q("ما الخطوة الأولى في نموذج المتطوع الآمن؟", "What is the first step of the safe volunteer model?",
        ["النصيحة المباشرة","طلب الإذن","الجدال","الصمت"],
        ["Give advice directly","Ask permission","Argue","Stay silent"], 1, "اطلب الإذن قبل بدء الحديث.", "Ask permission before starting the conversation."),
      Q("الاستماع الفعّال يعني:", "Active listening means:",
        ["المقاطعة المستمرة","الانتباه دون حكم","تجاهل الشخص","الرد الفوري"],
        ["Constant interruption","Attentive non-judgmental listening","Ignoring the person","Immediate replies"], 1, "الاستماع الفعّال هو الانتباه دون حكم.", "Active listening is attentive non-judgmental presence."),
      Q("عند الإحالة المناسبة، يُوجَّه الشخص إلى:", "For appropriate referral, the person is directed to:",
        ["تقييم أقلع","صديق غير مدرّب","الإنترنت العام","لا أحد"],
        ["The Aqla assessment","An untrained friend","General internet","Nobody"], 0, "الإحالة الرسمية تكون لتقييم أقلع أو القنوات المعتمدة.", "Formal referral is to the Aqla assessment or official channels."),
      Q("التشجيع الصحيح يكون:", "Correct encouragement is:",
        ["بضغط شديد","بدون ضغط","بالتهديد","بالسخرية"],
        ["With heavy pressure","Without pressure","With threats","With mockery"], 1, "التشجيع يكون بصدق ودون ضغط.", "Encouragement is sincere and pressure-free."),
      Q("هل من المناسب الوعد بأن الإقلاع سيكون سهلاً؟", "Is it appropriate to promise quitting will be easy?",
        ["نعم","لا"],
        ["Yes","No"], 1, "تجنب الوعود غير الواقعية.", "Avoid unrealistic promises."),
      Q("أفضل عبارة افتتاحية:", "Best opening sentence:",
        ["يجب أن تقلع الآن","هل ترغب أن نتحدث بإيجاز؟","أنت تؤذي نفسك","لن تنجح"],
        ["You must quit now","Would you like to talk briefly?","You're harming yourself","You won't succeed"], 1, "اطلب الإذن بلطف.", "Politely ask permission."),
      Q("ماذا تفعل إذا رفض الشخص الحديث؟", "What if the person declines to talk?",
        ["تجبره","تحترم قراره","تستهزئ","تتجاهله نهائيًا"],
        ["Force them","Respect their choice","Mock them","Ignore them entirely"], 1, "احترم قرار الشخص دائمًا.", "Always respect the person's decision."),
    ],
    cases: [],
  },
  {
    slug: "readiness",
    number: 4,
    title_ar: "الاستعداد للإقلاع وبناء الخطوة الأولى",
    title_en: "Readiness to Quit and First-Step Planning",
    subtitle_ar: "دعم مختلف مستويات الاستعداد.",
    subtitle_en: "Supporting different readiness levels.",
    objectives_ar: [
      "فهم مستويات الاستعداد المختلفة.", "دعم من هو مستعد أو متردد أو غير مستعد.", "تجنب إجبار الشخص على الإقلاع.", "مساعدة المستخدم على اختيار خطوة أولى آمنة.",
    ],
    objectives_en: [
      "Understand different readiness levels.", "Support people who are ready, unsure, or not ready.", "Avoid forcing someone to quit.", "Help users choose one safe first step.",
    ],
    lesson_ar:
      "مراحل الاستعداد: غير مستعد، يفكّر، يستعد، يبدأ، يحافظ على التغيير. لكل مرحلة دعم مناسب. لا نضغط على من ليس مستعدًا، بل نزرع البذرة. مع المستعد، نبني خطوة أولى صغيرة وواضحة.",
    lesson_en:
      "Readiness stages: not ready, thinking, preparing, taking action, maintaining. Each stage needs different support. We don't pressure those not ready — we plant the seed. With the ready person, we build one small, clear first step.",
    key_points_ar: [
      "احترم استقلالية الشخص.", "اسأل عمّا يهمّه.", "اقترح خطوة واحدة فقط.", "وجّه لتقييم أقلع.",
    ],
    key_points_en: [
      "Respect the person's autonomy.", "Ask what matters to them.", "Suggest just one step.", "Refer to the Aqla assessment.",
    ],
    mistakes_ar: [
      "إعطاء قائمة طويلة من المهام.", "إجبار شخص غير مستعد على تحديد تاريخ.", "إهمال أسباب الشخص الخاصة.",
    ],
    mistakes_en: [
      "Giving a long task list.", "Forcing a not-ready person to set a date.", "Ignoring the person's own reasons.",
    ],
    questions: [
      Q("ما المراحل المعروفة للاستعداد للتغيير؟", "What are the known stages of readiness?",
        ["مرحلة واحدة","عدة مراحل (غير مستعد، يفكر، يستعد، يبدأ، يحافظ)","لا توجد مراحل","ثلاث مراحل فقط"],
        ["Just one","Several (not ready, thinking, preparing, action, maintenance)","None","Only three"], 1, "هناك عدة مراحل لكل منها دعم مختلف.", "There are several stages, each with different support."),
      Q("ماذا تفعل مع شخص غير مستعد للإقلاع؟", "What do you do with a person not ready to quit?",
        ["إجباره","احترام قراره وفتح باب الحوار لاحقًا","السخرية منه","تجاهله نهائيًا"],
        ["Force them","Respect their choice and keep the door open","Mock them","Ignore them entirely"], 1, "احترم القرار وافتح باب الحوار لاحقًا.", "Respect the choice and keep the door open."),
      Q("الخطوة الأولى الجيدة تكون:", "A good first step is:",
        ["كبيرة ومعقدة","صغيرة وواضحة","غير قابلة للتحقيق","سرية"],
        ["Big and complex","Small and clear","Unachievable","Secret"], 1, "ابدأ بخطوة صغيرة وواضحة وقابلة للتحقيق.", "Start small, clear, and achievable."),
      Q("هل يجب تحديد تاريخ إقلاع لكل شخص فورًا؟", "Should every person set a quit date immediately?",
        ["نعم","لا، حسب مرحلة استعداده"],
        ["Yes","No, depending on their stage"], 1, "تحديد التاريخ يناسب من هو في مرحلة الاستعداد أو البدء.", "Quit dates suit those in preparation or action stages."),
      Q("أفضل سؤال لاكتشاف الدافع:", "Best question to find the motivation:",
        ["لماذا أنت ضعيف؟","ما الذي يهمّك في حياتك؟","متى ستبدأ؟","لماذا تماطل؟"],
        ["Why are you weak?","What matters to you in your life?","When will you start?","Why are you stalling?"], 1, "ابحث عمّا يهمّ الشخص فعلاً.", "Look for what truly matters to the person."),
      Q("هل يستفيد من ليس مستعدًا من أدوات أقلع؟", "Can a not-ready person benefit from Aqla tools?",
        ["لا","نعم، مثل خريطة المحفزات أو حاسبة التوفير"],
        ["No","Yes — like the Trigger Map or Savings Calculator"], 1, "الأدوات التوعوية مناسبة حتى لمن ليس مستعدًا.", "Awareness tools suit even not-ready users."),
      Q("الضغط الشديد على المستخدم:", "Heavy pressure on the user:",
        ["يساعد","يضر ويزيد المقاومة","يلزم","لا أثر له"],
        ["Helps","Harms and increases resistance","Is required","Has no effect"], 1, "الضغط الشديد يضر ويزيد المقاومة.", "Heavy pressure harms and increases resistance."),
    ],
    cases: [],
  },
  {
    slug: "cravings",
    number: 5,
    title_ar: "الرغبة الشديدة، المحفزات، والانتكاسة",
    title_en: "Cravings, Triggers, and Relapse Support",
    subtitle_ar: "استراتيجيات مساندة غير دوائية وتطبيع الانتكاسة.",
    subtitle_en: "Non-medical coping strategies and normalizing relapse.",
    objectives_ar: [
      "التعرف على المحفزات الشائعة.", "شرح أن الرغبة قد تمر بمرور الوقت.", "تعليم استراتيجيات مساندة بسيطة وغير دوائية.", "شرح الانتكاسة دون لوم.", "معرفة متى تكون الإحالة ضرورية.",
    ],
    objectives_en: [
      "Recognize common triggers.", "Explain that cravings can pass.", "Teach simple non-medical coping strategies.", "Explain relapse without shame.", "Know when referral is needed.",
    ],
    lesson_ar:
      "الرغبة موجة قصيرة تمر عادة في دقائق. المحفزات تشمل القهوة والضغط والمواقف الاجتماعية. الانتكاسة جزء طبيعي من رحلة كثيرين ولا تعني الفشل. لا توصِ بأي جرعة من أي منتج نيكوتين.",
    lesson_en:
      "Cravings are short waves that usually pass within minutes. Triggers include coffee, stress, and social situations. Relapse is a normal part of many people's journey and does not mean failure. Do not recommend any nicotine product dose.",
    key_points_ar: [
      "تأخير بضع دقائق يساعد كثيرًا.", "شرب الماء وتغيير المكان من أبسط الأدوات.", "الانتكاسة فرصة لتعديل الخطة وليست نهاية الطريق.",
    ],
    key_points_en: [
      "Delaying a few minutes helps a lot.", "Drinking water and changing place are simple tools.", "Relapse is a chance to adjust the plan — not the end.",
    ],
    mistakes_ar: [
      "وصف جرعة بدائل النيكوتين.", "اعتبار الانتكاسة فشلًا نهائيًا.", "تجاهل المحفزات النفسية.",
    ],
    mistakes_en: [
      "Recommending NRT doses.", "Treating relapse as final failure.", "Ignoring psychological triggers.",
    ],
    questions: [
      Q("الرغبة الشديدة عادةً:", "A craving usually:",
        ["تستمر يومًا كاملاً","تمر خلال دقائق","لا تنتهي أبدًا","تزيد إلى الأبد"],
        ["Lasts a whole day","Passes within minutes","Never ends","Grows forever"], 1, "الرغبة موجة قصيرة تمر عادةً في دقائق.", "A craving is a short wave that usually passes in minutes."),
      Q("أي من الآتي استراتيجية مساندة آمنة للمتطوع؟", "Which is a volunteer-safe coping strategy?",
        ["وصف دواء","شرب الماء وتغيير المكان","تحديد جرعة نيكوتين","لا شيء"],
        ["Prescribe medication","Drink water and change place","Set a nicotine dose","Nothing"], 1, "الاستراتيجيات البسيطة غير الدوائية مناسبة للمتطوع.", "Simple non-medical strategies are volunteer-appropriate."),
      Q("الانتكاسة تعني:", "Relapse means:",
        ["الفشل النهائي","إشارة لتعديل الخطة","عدم وجود أمل","لا يجب الحديث عنها"],
        ["Final failure","A signal to adjust the plan","No hope","Shouldn't be discussed"], 1, "الانتكاسة إشارة لتعديل الخطة وإعادة الاتصال بالدعم.", "Relapse is a signal to adjust the plan and reconnect with support."),
      Q("ما المحفز الشائع؟", "What is a common trigger?",
        ["القهوة أو الضغط","الرياضة فقط","النوم","قراءة الكتب"],
        ["Coffee or stress","Only exercise","Sleeping","Reading"], 0, "القهوة والضغط من أكثر المحفزات شيوعًا.", "Coffee and stress are common triggers."),
      Q("هل يصف المتطوع جرعة بديل النيكوتين؟", "Does the volunteer prescribe an NRT dose?",
        ["نعم","لا"],
        ["Yes","No"], 1, "وصف الجرعات يكون من المختص فقط.", "Doses are determined by clinicians only."),
      Q("«تأخير بضع دقائق» يفيد لأن:", "'Delaying a few minutes' helps because:",
        ["الرغبة عادةً تمر","الوقت لا أهمية له","يزيد الرغبة","يسبب ضررًا"],
        ["The craving usually passes","Time doesn't matter","It increases craving","It causes harm"], 0, "تأخير الاستجابة يستغل طبيعة الرغبة المؤقتة.", "Delaying leverages the temporary nature of cravings."),
      Q("بعد الانتكاسة، ما أول خطوة مفيدة؟", "After a relapse, what is the first helpful step?",
        ["الاستسلام","العودة للدعم وتعديل الخطة","اللوم الذاتي","تجاهل الموضوع"],
        ["Giving up","Returning to support and adjusting the plan","Self-blame","Ignoring it"], 1, "العودة للدعم وتعديل الخطة هي الخطوة المثلى.", "Returning to support and adjusting the plan is the optimal step."),
    ],
    cases: [],
  },
  {
    slug: "safety",
    number: 6,
    title_ar: "السلامة، الحدود، والفئات التي تحتاج مراجعة مختص",
    title_en: "Safety, Boundaries, and When to Refer",
    subtitle_ar: "حماية المتطوع والمستخدم.",
    subtitle_en: "Protecting volunteer and user.",
    objectives_ar: [
      "معرفة حدود المتطوع.", "تمييز العلامات العاجلة.", "معرفة الفئات التي تحتاج مراجعة مختص.", "حماية الخصوصية.", "التصعيد بشكل صحيح.",
    ],
    objectives_en: [
      "Know volunteer boundaries.", "Identify urgent red flags.", "Know groups needing clinician review.", "Protect privacy.", "Escalate appropriately.",
    ],
    lesson_ar:
      "العلامات الحمراء العاجلة: ألم شديد في الصدر، ضيق تنفس شديد، إغماء، سعال دم، أفكار إيذاء النفس. فئات تحتاج مختصًا: الحمل والرضاعة، تحت ١٨ مع استخدام يومي، أمراض القلب، السوابق الطبية المعقدة، طلب جرعات. لا تشارك معلومات شخصية، ولا تنشر قصصًا دون إذن.",
    lesson_en:
      "Urgent red flags: severe chest pain, severe breathlessness, fainting, coughing blood, self-harm thoughts. Groups needing a clinician: pregnancy/breastfeeding, under 18 with daily use, heart disease, complex medical history, NRT-dose requests. Don't share personal information; don't post stories without consent.",
    key_points_ar: [
      "الطوارئ تستدعي اتصالًا فوريًا بخدمات الطوارئ.", "اطلب الإذن قبل أي مشاركة.", "استخدم النماذج الرسمية لأقلع فقط.",
    ],
    key_points_en: [
      "Emergencies require an immediate call to local emergency services.", "Ask permission before any sharing.", "Use only official Aqla forms and pathways.",
    ],
    mistakes_ar: [
      "محاولة التعامل مع طوارئ طبية دون تصعيد.", "مشاركة قصص الناس بدون إذن.", "تخزين بيانات شخصية على هاتف المتطوع.",
    ],
    mistakes_en: [
      "Handling medical emergencies without escalation.", "Sharing people's stories without consent.", "Storing personal data on a volunteer's phone.",
    ],
    questions: [
      Q("ألم شديد في الصدر:", "Severe chest pain:",
        ["ينتظر إلى الغد","حالة طارئة تستدعي رعاية فورية","أمر طبيعي","لا يهم"],
        ["Can wait until tomorrow","Is an emergency needing urgent care","Is normal","Doesn't matter"], 1, "ألم الصدر الشديد حالة طارئة.", "Severe chest pain is an emergency."),
      Q("الحامل التي تسأل عن منتج نيكوتين:", "A pregnant person asking about a nicotine product:",
        ["يُوصى لها بمنتج","يجب إحالتها لمختص","تتجاهل","تُهمل"],
        ["Is recommended a product","Should be referred to a clinician","Is ignored","Is dismissed"], 1, "الحمل والرضاعة تستلزم مراجعة مختص.", "Pregnancy/breastfeeding requires clinician review."),
      Q("شخص يذكر أفكار إيذاء النفس:", "A person mentions self-harm thoughts:",
        ["نلتزم بالسرية المطلقة","نشرح حدود السرية ونصعّد للدعم العاجل","نتجاهل","نسخر"],
        ["Keep absolute secrecy","Explain limits and escalate to urgent support","Ignore","Mock"], 1, "السلامة فوق السرية؛ صعّد للدعم المختص العاجل.", "Safety overrides confidentiality — escalate to urgent support."),
      Q("هل يجوز نشر قصة مستخدم دون إذنه؟", "May you publish a user's story without consent?",
        ["نعم","لا"],
        ["Yes","No"], 1, "النشر يحتاج إذنًا صريحًا.", "Publishing requires explicit consent."),
      Q("طلب جرعة بديل النيكوتين:", "A request for an NRT dose:",
        ["يجيب عليها المتطوع","تُحال إلى المختص","تُتجاهل","تُرفض دون شرح"],
        ["Volunteer answers","Refer to a clinician","Ignore","Reject without explanation"], 1, "تحديد الجرعات من اختصاص المختص.", "Dosing is a clinician's responsibility."),
      Q("تخزين بيانات شخصية لمستخدم على هاتف المتطوع:", "Storing a user's personal data on the volunteer's phone:",
        ["ممارسة جيدة","ممارسة غير آمنة","موصى بها","مطلوبة"],
        ["Good practice","Unsafe practice","Recommended","Required"], 1, "البيانات الشخصية تُحفظ في الأنظمة الرسمية فقط.", "Personal data belongs in official systems only."),
      Q("تحت ١٨ ومستخدم يومي للنيكوتين:", "Under 18 with daily nicotine use:",
        ["يستحق دعمًا فقط دون إحالة","يحتاج إحالة لمختص","لا يهم","يتجاهل"],
        ["Only support, no referral","Needs clinician referral","Doesn't matter","Ignore"], 1, "الفئات تحت ١٨ تحتاج إحالة لمختص.", "Under-18 users need clinician referral."),
    ],
    cases: [],
  },
  {
    slug: "scenarios",
    number: 7,
    title_ar: "السيناريوهات التطبيقية ودور المتطوع في المجتمع",
    title_en: "Applied Scenarios and the Volunteer Role in the Community",
    subtitle_ar: "تدرّب على مواقف واقعية واختر الاستجابة الصحيحة.",
    subtitle_en: "Practice real situations and choose the right response.",
    objectives_ar: [
      "تطبيق التواصل الآمن في مواقف واقعية.", "اختيار الاستجابة والإحالة الصحيحة.", "ممارسة دعم التوعية.", "استخدام أدوات أقلع باحترافية.", "معرفة ما يُوثّق وما لا يُوثّق.",
    ],
    objectives_en: [
      "Apply safe communication in realistic situations.", "Choose the correct response and referral.", "Practice awareness support.", "Use Aqla tools appropriately.", "Know what to document and what not to document.",
    ],
    lesson_ar:
      "هذه الوحدة تطبيقية بالكامل. ستواجه ١٠ حالات شائعة، ولكل منها استجابة صحيحة. قراءة الحالة بتأنٍ، اختيار الاستجابة الأفضل، ثم مراجعة التفسير.",
    lesson_en:
      "This module is fully applied. You will face 10 common cases, each with one best response. Read carefully, choose the best response, then review the explanation.",
    key_points_ar: [
      "الإحالة الآمنة دائمًا أفضل من المحاولة دون اختصاص.", "الطوارئ لا تنتظر.", "احترام الخصوصية والكرامة.",
    ],
    key_points_en: [
      "Safe referral always beats unqualified action.", "Emergencies cannot wait.", "Respect privacy and dignity.",
    ],
    mistakes_ar: [
      "تأجيل التصعيد في حالة طارئة.", "الحكم على المستخدم.", "تجاوز حدود التدريب.",
    ],
    mistakes_en: [
      "Delaying escalation in an emergency.", "Judging the user.", "Stepping outside training boundaries.",
    ],
    // Module 7 also has 7 knowledge questions
    questions: [
      Q("في حالة طارئة طبية، ماذا تفعل أولاً؟", "In a medical emergency, what do you do first?",
        ["تستشير الإنترنت","توجّه فورًا لخدمات الطوارئ","تنتظر يومًا","تتجاهل"],
        ["Consult the internet","Direct to emergency services immediately","Wait a day","Ignore"], 1, "الطوارئ تستدعي توجيهًا فوريًا لخدمات الطوارئ.", "Emergencies need immediate direction to emergency services."),
      Q("الإحالة تكون إلى:", "Referral goes to:",
        ["شخص غير مختص","تقييم أقلع أو مختص","صديق","لا أحد"],
        ["Untrained person","The Aqla assessment or a clinician","A friend","Nobody"], 1, "الإحالة الآمنة لتقييم أقلع أو لمختص.", "Safe referral is to Aqla or a clinician."),
      Q("توثيق البيانات الشخصية يكون:", "Documenting personal data is done:",
        ["على الهاتف الشخصي","في الأنظمة الرسمية فقط","بشكل علني","لا توثيق"],
        ["On a personal phone","Only in official systems","Publicly","No documentation"], 1, "البيانات في الأنظمة الرسمية حصرًا.", "Data goes only into official systems."),
      Q("شخص لم يحدد بعد رغبته في الإقلاع:", "A person who hasn't decided about quitting:",
        ["يُجبَر","يُحترم وتُعرض عليه أدوات التوعية","يُهمل","يُحكَم عليه"],
        ["Is forced","Is respected, offered awareness tools","Is neglected","Is judged"], 1, "الاحترام أولاً، ثم عرض الأدوات.", "Respect first, then offer tools."),
      Q("طلب نصيحة دوائية:", "Request for medication advice:",
        ["يستجيب لها المتطوع","تُحال للمختص","تُتجاهل","تُرفض بقسوة"],
        ["Volunteer responds","Refer to a clinician","Ignore","Reject harshly"], 1, "الأدوية اختصاص المختصين.", "Medication advice belongs to clinicians."),
      Q("في بوث توعوي، ما المناسب؟", "At an awareness booth, what is appropriate?",
        ["جمع بيانات بدون إذن","عرض QR للأدوات والتقييم","التشخيص","وصف أدوية"],
        ["Collect data without consent","Share QR for tools and assessment","Diagnose","Prescribe"], 1, "في البوث، استخدم QR لأدوات أقلع وقدّم التوعية.", "At a booth, share the Aqla QR and provide awareness."),
      Q("الانتكاسة في القصص الشخصية:", "Personal-story relapse:",
        ["دليل فشل","فرصة للتعلم وإعادة الاتصال بالدعم","سبب للوم","تجاهل"],
        ["Proof of failure","Chance to learn and reconnect","Reason to blame","To ignore"], 1, "الانتكاسة فرصة للتعلم وإعادة الاتصال بالدعم.", "Relapse is a chance to learn and reconnect."),
    ],
    cases: [
      {
        id: "c1",
        title_ar: "حالة ١: مدخن بالغ يطلب المساعدة اليوم",
        title_en: "Case 1: Adult cigarette smoker asking for help today",
        text_ar: "مدخن بالغ، اعتماد عالٍ، يقول إنه يريد المساعدة اليوم.",
        text_en: "Adult cigarette smoker, high dependence, wants help today.",
        opts_ar: ["وصف جرعة نيكوتين له","تشجيعه على تقييم أقلع ومراجعة مختص","قول إن الأمر صعب جدًا","تجاهله"],
        opts_en: ["Recommend a nicotine dose","Encourage Aqla assessment and clinician review","Say it's too hard","Ignore him"],
        correct: 1,
        exp_ar: "شجّع على تقييم أقلع والمراجعة المختصة. لا توصِ بجرعات.",
        exp_en: "Encourage Aqla assessment and clinician review. Do not recommend doses.",
        script_ar: "يسعدني أنك تفكر في الإقلاع. يمكنك إكمال تقييم أقلع الآن ليتم توجيهك بشكل دقيق.",
        script_en: "I'm glad you're considering quitting. You can complete the Aqla assessment now for accurate guidance.",
        required: true,
      },
      {
        id: "c2",
        title_ar: "حالة ٢: طالبة جامعية تستخدم الفيب يوميًا",
        title_en: "Case 2: University student vaping daily",
        text_ar: "طالبة جامعية تستخدم الفيب يوميًا وتخفيه عن عائلتها.",
        text_en: "University student vapes daily and hides it from her family.",
        opts_ar: ["لومها","الدعم دون لوم، واقتراح تقييم أقلع","إخبار العائلة","تجاهلها"],
        opts_en: ["Blame her","Support without shame, suggest Aqla assessment","Tell her family","Ignore her"],
        correct: 1,
        exp_ar: "ادعم دون لوم، واطرح تقييم أقلع. لا تُفصح لأي طرف ثالث دون إذنها.",
        exp_en: "Support without shame, suggest the Aqla assessment. Don't disclose to third parties without her consent.",
        script_ar: "شكرًا أنك شاركتني. أي خطوة صغيرة تبدأ بها مهمة. يمكنك تجربة تقييم أقلع لمعرفة المسار المناسب.",
        script_en: "Thanks for sharing. Any small step you take matters. The Aqla assessment can help you find the right pathway.",
        required: true,
      },
      {
        id: "c3",
        title_ar: "حالة ٣: حامل تسأل عن منتج نيكوتين",
        title_en: "Case 3: Pregnant person asking about a nicotine product",
        text_ar: "امرأة حامل تسأل أي بديل نيكوتين تستخدم.",
        text_en: "A pregnant person asks which nicotine product to use.",
        opts_ar: ["اقتراح منتج","عدم النصح بمنتج وإحالتها لمختص","تجاهل السؤال","قول كلها آمنة"],
        opts_en: ["Suggest a product","Don't advise a product; refer to a clinician","Ignore the question","Say they're all safe"],
        correct: 1,
        exp_ar: "لا توصِ بمنتج. الحامل تحتاج مراجعة مختص.",
        exp_en: "Don't recommend a product. Pregnant users need clinician review.",
        script_ar: "الحمل يحتاج تقييمًا طبيًا متخصصًا. سأساعدك على التواصل مع مختص لمراجعة الخيارات الآمنة.",
        script_en: "Pregnancy needs specialist medical assessment. I'll help you connect with a clinician to review safe options.",
        safety_flag: "pregnancy",
        required: true,
      },
      {
        id: "c4",
        title_ar: "حالة ٤: ألم صدر وضيق تنفس",
        title_en: "Case 4: Chest pain and shortness of breath",
        text_ar: "مستخدم يشكو من ألم صدر شديد وضيق تنفس.",
        text_en: "A user reports severe chest pain and shortness of breath.",
        opts_ar: ["طمأنته أن الأمر بسيط","رسالة طوارئ فورية وتوجيه لخدمات الطوارئ","إعطاؤه نصيحة دوائية","تجاهله"],
        opts_en: ["Reassure it's minor","Send urgent message and direct to emergency services","Give medication advice","Ignore"],
        correct: 1,
        exp_ar: "هذه الأعراض قد تحتاج رعاية عاجلة فورية.",
        exp_en: "These symptoms may need immediate emergency care.",
        script_ar: "هذه الأعراض قد تحتاج رعاية عاجلة. يرجى طلب الرعاية الطبية العاجلة فورًا أو التواصل مع خدمات الطوارئ المحلية.",
        script_en: "These symptoms may require urgent care. Please seek urgent medical care immediately or contact local emergency services.",
        safety_flag: "emergency",
        required: true,
      },
      {
        id: "c5",
        title_ar: "حالة ٥: شخص شعر أن الانتكاسة فشل",
        title_en: "Case 5: Person feels relapse means failure",
        text_ar: "شخص يقول إن الانتكاسة تعني أنه فشل.",
        text_en: "A person says relapse means they failed.",
        opts_ar: ["تأكيد فشله","تطبيع الانتكاسة وإعادة الاتصال بالدعم","تجاهل المشاعر","السخرية"],
        opts_en: ["Confirm failure","Normalize relapse and reconnect with support","Ignore feelings","Mock"],
        correct: 1,
        exp_ar: "الانتكاسة جزء طبيعي ولا تعني الفشل النهائي.",
        exp_en: "Relapse is a normal part of the journey, not final failure.",
        script_ar: "الانتكاسة لا تعني الفشل. كثير من الناجحين مرّوا بها. الخطوة التالية هي تعديل الخطة والعودة للدعم.",
        script_en: "Relapse doesn't mean failure. Many who succeed have been through it. The next step is to adjust the plan and reconnect with support.",
        required: true,
      },
      {
        id: "c6",
        title_ar: "حالة ٦: صديق يطلب شراء لصقات نيكوتين",
        title_en: "Case 6: Friend asks volunteer to buy nicotine patches",
        text_ar: "صديق يطلب من المتطوع شراء لصقات نيكوتين له.",
        text_en: "A friend asks the volunteer to buy nicotine patches for him.",
        opts_ar: ["الشراء فورًا","عدم الشراء والتوجيه لطلب أقلع أو الصيدلي","رفض دون شرح","نصحه بمنتج آخر"],
        opts_en: ["Buy immediately","Don't buy; direct to Aqla request or pharmacist","Refuse without explanation","Recommend another product"],
        correct: 1,
        exp_ar: "لا تشترِ ولا توصِ. وجّهه لطلب أقلع أو الصيدلي/المختص.",
        exp_en: "Don't buy or recommend. Direct to the Aqla request or pharmacist/clinician.",
        script_ar: "اختيار البديل المناسب لك يحتاج مراجعة مختص أو صيدلي. يمكنك تعبئة طلب أقلع لتلقي المراجعة المناسبة.",
        script_en: "Choosing the right alternative needs a clinician or pharmacist. You can submit an Aqla request to receive proper review.",
        required: true,
      },
      {
        id: "c7",
        title_ar: "حالة ٧: شاب تحت ١٨ يستخدم أكياس النيكوتين يوميًا",
        title_en: "Case 7: Person under 18 using nicotine pouches daily",
        text_ar: "شاب عمره أقل من ١٨ يستخدم أكياس النيكوتين يوميًا.",
        text_en: "A person under 18 uses nicotine pouches daily.",
        opts_ar: ["تجاهله","دعم محترم وإحالة لمختص ومناقشة دور ولي الأمر عند المناسب","لومه أمام الجميع","إجباره على الإقلاع"],
        opts_en: ["Ignore","Respectful support, clinician referral, involve guardian when appropriate","Blame him publicly","Force him to quit"],
        correct: 1,
        exp_ar: "الفئة تحت ١٨ تحتاج دعمًا محترمًا، وإحالة، ودور ولي الأمر عند المناسب.",
        exp_en: "Under 18 users need respectful support, referral, and guardian involvement when appropriate.",
        script_ar: "شكرًا لثقتك. لأنك أصغر من ١٨، الأفضل أن يساعدك مختص، وقد يكون من المفيد إشراك شخص بالغ تثق به.",
        script_en: "Thanks for your trust. Because you're under 18, a clinician should help, and involving a trusted adult could be useful.",
        safety_flag: "minor",
        required: true,
      },
      {
        id: "c8",
        title_ar: "حالة ٨: شخص ليس مستعدًا ويشعر بالحكم",
        title_en: "Case 8: Person not ready, feels judged",
        text_ar: "شخص ليس مستعدًا للإقلاع ويشعر أن الجميع يحكم عليه.",
        text_en: "A person is not ready to quit and feels judged.",
        opts_ar: ["إجباره","احترام استقلاليته وعرض أدوات أولية","الانسحاب الكامل","لومه"],
        opts_en: ["Force him","Respect autonomy, offer first-step tools","Withdraw entirely","Blame him"],
        correct: 1,
        exp_ar: "احترم استقلالية الشخص، وقدّم أدوات الخطوة الأولى دون ضغط.",
        exp_en: "Respect autonomy and offer first-step tools without pressure.",
        script_ar: "قرارك يخصك ولا أحد يحكم عليك. عندما تكون مستعدًا، أنا هنا، وأدوات أقلع متاحة لك متى أردت.",
        script_en: "Your choice is yours, and no one judges you. When you're ready, I'm here, and Aqla tools are available whenever you wish.",
        required: true,
      },
      {
        id: "c9",
        title_ar: "حالة ٩: طلب السرية مع ذكر إيذاء النفس",
        title_en: "Case 9: Confidentiality requested with self-harm mention",
        text_ar: "شخص يطلب الحفاظ على السرية لكنه يذكر أفكار إيذاء النفس.",
        text_en: "A person asks for secrecy but mentions self-harm thoughts.",
        opts_ar: ["الحفاظ على السرية المطلقة","شرح حدود السرية والتصعيد للدعم العاجل","تجاهل الموضوع","السخرية"],
        opts_en: ["Keep absolute secrecy","Explain limits and escalate to urgent support","Ignore","Mock"],
        correct: 1,
        exp_ar: "السلامة فوق السرية؛ صعّد للدعم العاجل المختص.",
        exp_en: "Safety overrides confidentiality; escalate to urgent specialist support.",
        script_ar: "أنا أحترم خصوصيتك، لكن سلامتك أهم. سأساعدك على التواصل مع جهة دعم عاجلة الآن.",
        script_en: "I respect your privacy, but your safety matters most. I'll help you connect to urgent support right now.",
        safety_flag: "self_harm",
        required: true,
      },
      {
        id: "c10",
        title_ar: "حالة ١٠: زائر بوث يطلب رابط QR فقط",
        title_en: "Case 10: Awareness booth visitor wants the QR link only",
        text_ar: "زائر بوث توعوي يطلب QR فقط دون حديث.",
        text_en: "An awareness booth visitor only wants the QR link.",
        opts_ar: ["إجباره على الحديث","تقديم QR وشرح الخصوصية وعرض الأدوات والتقييم","رفض إعطاءه QR","تجاهله"],
        opts_en: ["Force him to talk","Share QR, explain privacy, offer tools and assessment","Refuse the QR","Ignore"],
        correct: 1,
        exp_ar: "احترم رغبته، قدّم QR، اشرح الخصوصية، واعرض الأدوات.",
        exp_en: "Respect his wish, share QR, explain privacy, and offer tools.",
        script_ar: "تفضّل QR لأقلع. بياناتك تبقى مع أقلع فقط، والأدوات والتقييم متاحة لك في أي وقت.",
        script_en: "Here's the Aqla QR. Your data stays with Aqla only, and the tools and assessment are available whenever you wish.",
        required: true,
      },
    ],
  },
];

export const TOTAL_QUESTIONS = TRAINING_MODULES.reduce((s, m) => s + m.questions.length, 0); // 49
export const TOTAL_CASES = TRAINING_MODULES.reduce((s, m) => s + m.cases.length, 0); // 10
export const MODULE_PASS = 70;
export const OVERALL_PASS = 80;
