export type PublicPageKey =
  | 'about'
  | 'faq'
  | 'contact'
  | 'privacy'
  | 'terms'
  | 'medical-disclaimer'
  | 'accessibility'

export interface PublicSection {
  titleAr: string
  titleEn: string
  bodyAr: string
  bodyEn: string
}

export interface PublicPageContent {
  titleAr: string
  titleEn: string
  introAr: string
  introEn: string
  sections: PublicSection[]
}

export const publicPageContent: Record<PublicPageKey, PublicPageContent> = {
  about: {
    titleAr: 'عن أقلع',
    titleEn: 'About Aqla',
    introAr: 'أقلع منصة رقمية لدعم الإقلاع عن التدخين والنيكوتين بخطوات عملية وشخصية، مع الحفاظ على الفصل الواضح بين منطق السلامة والتخصيص اللغوي بالذكاء الاصطناعي.',
    introEn: 'Aqla is a digital smoking and nicotine cessation support platform built around practical, personal next steps, with a clear separation between safety logic and AI-assisted wording.',
    sections: [
      { titleAr: 'كيف يعمل أقلع؟', titleEn: 'How Aqla works', bodyAr: 'يبدأ المستخدم بتقييم نمط الاستخدام والمحـفزات والاستعداد والثقة والمحاولات السابقة. ثم يبني محرك أقلع خطة دعم شخصية ويحدد المتابعة المناسبة.', bodyEn: 'Aqla starts with an assessment of use patterns, triggers, readiness, confidence and previous attempts. Its deterministic engine then builds a personal support plan and planned follow-up.' },
      { titleAr: 'دور الذكاء الاصطناعي', titleEn: 'The role of AI', bodyAr: 'قد يساعد الذكاء الاصطناعي في صياغة رسائل داعمة بصورة شخصية، لكنه لا يقرر التشخيص أو الجرعات الدوائية أو قواعد السلامة أو الإحالة.', bodyEn: 'AI may help personalise supportive wording, but it does not decide diagnoses, medication doses, safety rules or referral decisions.' },
      { titleAr: 'البحث والدعم', titleEn: 'Research and support', bodyAr: 'المشاركة في الدراسة البحثية منفصلة عن الحصول على دعم الإقلاع. يمكن للمستخدم تخطي الدراسة والاستمرار مباشرة إلى خدمات أقلع.', bodyEn: 'Research participation is separate from cessation support. A user can skip the study and continue directly to Aqla support.' },
    ],
  },
  faq: {
    titleAr: 'الأسئلة الشائعة',
    titleEn: 'Frequently asked questions',
    introAr: 'إجابات مختصرة عن استخدام أقلع وخطته الشخصية والمتابعة والخصوصية.',
    introEn: 'Short answers about using Aqla, personal plans, follow-up and privacy.',
    sections: [
      { titleAr: 'هل يجب أن أشارك في الدراسة لاستخدام أقلع؟', titleEn: 'Do I have to join the study to use Aqla?', bodyAr: 'لا. يمكنك تخطي المشاركة البحثية والبدء بخطة الإقلاع الشخصية.', bodyEn: 'No. You can skip research participation and start your personal quit plan.' },
      { titleAr: 'هل أحتاج إلى حساب لاستخدام أقلع؟', titleEn: 'Do I need an account to use Aqla?', bodyAr: 'لا لبدء الخطة. يمكنك استخدام وضع الضيف وإنشاء خطة داخل جلسة المتصفح دون تسجيل. إذا أردت حفظ الخطة في حسابك والعودة إليها لاحقًا أو الاشتراك في المتابعة عبر البريد، فستحتاج إلى تسجيل الدخول بحساب موثق.', bodyEn: 'Not to start a plan. Guest mode lets you build a plan in the current browser session without registering. A verified account is needed if you want durable saving, later access or opted-in email follow-up.' },
      { titleAr: 'هل الخطة تشخيص أو وصفة طبية؟', titleEn: 'Is the plan a diagnosis or prescription?', bodyAr: 'لا. الخطة أداة دعم وتعليم وليست تشخيصًا طبيًا أو وصفة علاجية.', bodyEn: 'No. The plan is supportive educational guidance, not a medical diagnosis or prescription.' },
      { titleAr: 'هل أستطيع العودة إلى خطتي؟', titleEn: 'Can I return to my plan?', bodyAr: 'نعم، عند تسجيل الدخول تُحفظ الخطة المرتبطة بحسابك ويمكن فتح أحدث خطة من لوحة أقلع. خطط الضيف لا تُحفظ على خوادم أقلع وتبقى في جلسة المتصفح الحالية فقط.', bodyEn: 'Yes. When signed in, your plan is linked to your account and your latest plan can be reopened from the Aqla dashboard. Guest plans are not stored on Aqla servers and remain only in the current browser session.' },
      { titleAr: 'متى تكون المتابعة؟', titleEn: 'When are the check-ins?', bodyAr: 'للحسابات التي اختارت المتابعة عبر البريد، تستخدم الخطة الحالية نقاط متابعة في اليوم 1 و3 و7 و14 و21 و30 و60 و90، ثم بعد 6 و12 شهرًا. قد تتوقف الرسائل أو لا تُرسل بحسب موافقة المستخدم وتفضيلات التواصل وقواعد السلامة.', bodyEn: 'For accounts that opt into email follow-up, the current pathway uses Day 1, 3, 7, 14, 21, 30, 60 and 90 check-ins, followed by 6- and 12-month checkpoints. Messages may be withheld or stopped according to consent, communication preferences and safety rules.' },
      { titleAr: 'هل يمكنني استخدام أقلع وقت الرغبة الشديدة؟', titleEn: 'Can I use Aqla during a strong craving?', bodyAr: 'نعم. صفحة المساعدة السريعة تعطي خطوات عملية فورية، وتعرض بطاقة الرغبة الشخصية إذا كانت لديك خطة محفوظة.', bodyEn: 'Yes. The quick-support page gives immediate practical steps and can show your personal craving card when you have a saved plan.' },
    ],
  },
  contact: {
    titleAr: 'تواصل معنا',
    titleEn: 'Contact us',
    introAr: 'للاستفسارات غير العاجلة حول أقلع أو الملاحظات التقنية يمكنك التواصل عبر البريد الإلكتروني.',
    introEn: 'For non-urgent questions about Aqla or technical feedback, you can contact us by email.',
    sections: [
      { titleAr: 'البريد الإلكتروني', titleEn: 'Email', bodyAr: 'smokefreeksa@gmail.com', bodyEn: 'smokefreeksa@gmail.com' },
      { titleAr: 'المساعدة العاجلة', titleEn: 'Urgent help', bodyAr: 'أقلع ليس خدمة طوارئ. إذا كان هناك خطر فوري أو أعراض شديدة، تواصل مع خدمات الطوارئ المحلية أو توجّه لأقرب قسم طوارئ.', bodyEn: 'Aqla is not an emergency service. If there is immediate danger or severe symptoms, contact your local emergency service or attend the nearest emergency department.' },
    ],
  },
  privacy: {
    titleAr: 'الخصوصية',
    titleEn: 'Privacy',
    introAr: 'نصمم أقلع بحيث يستخدم الحد الأدنى العملي من البيانات اللازمة لتقديم الخطة والمتابعة، مع إبقاء بيانات الصحة الحساسة خارج الرسائل قدر الإمكان.',
    introEn: 'Aqla is designed to use the practical minimum data needed to provide plans and follow-up, while keeping sensitive health details out of messages wherever possible.',
    sections: [
      { titleAr: 'وضع الضيف', titleEn: 'Guest mode', bodyAr: 'يمكن إنشاء خطة ضيف دون تسجيل. خطة الضيف لا تُحفظ في قاعدة بيانات أقلع ولا تنشئ ملفًا شخصيًا أو رسائل متابعة؛ وتبقى داخل جلسة المتصفح الحالية فقط.', bodyEn: 'A guest plan can be created without registering. It is not saved to Aqla\'s database, does not create a participant profile or follow-up emails, and remains only in the current browser session.' },
      { titleAr: 'بيانات الحساب والخطة', titleEn: 'Account and plan data', bodyAr: 'عند تسجيل الدخول ترتبط خطتك ومعطيات التقييم والمتابعة بحسابك حتى تتمكن من العودة إليها ومتابعة تقدمك.', bodyEn: 'When you sign in, your assessment, plan and follow-up data are linked to your account so you can return and review progress.' },
      { titleAr: 'البريد والمتابعة', titleEn: 'Email and follow-up', bodyAr: 'رسائل أقلع مصممة لتكون مختصرة وألا تتضمن تفاصيل صحية غير ضرورية. إرسال رابط الخطة والمتابعة عبر البريد يخضعان لاختيارات منفصلة للمستخدم، ويمكن إيقاف الرسائل غير الأساسية.', bodyEn: 'Aqla messages are designed to be brief and avoid unnecessary health details. Plan-link email and ongoing follow-up use separate participant choices, and non-essential messages can be stopped.' },
      { titleAr: 'الدراسة البحثية', titleEn: 'Research study', bodyAr: 'الدراسة البحثية مسار منفصل عن دعم الإقلاع. اختيار عدم المشاركة لا يمنع استخدام خطة أقلع، وتطبق الدراسة صفحة الموافقة وإجراءاتها الخاصة بها.', bodyEn: 'The research study is a separate pathway from cessation support. Choosing not to participate does not block access to an Aqla plan, and the study uses its own consent page and procedures.' },
    ],
  },
  terms: {
    titleAr: 'شروط الاستخدام',
    titleEn: 'Terms of use',
    introAr: 'باستخدام أقلع، أنت تقر بأن المنصة أداة دعم وتثقيف ولا تحل محل التقييم الطبي أو خدمات الطوارئ.',
    introEn: 'By using Aqla, you acknowledge that the platform provides support and education and does not replace medical assessment or emergency services.',
    sections: [
      { titleAr: 'الاستخدام المناسب', titleEn: 'Appropriate use', bodyAr: 'استخدم المعلومات والخطة كأداة مساعدة، واطلب تقييمًا مهنيًا عندما يوصي أقلع بذلك أو عندما تكون لديك مخاوف صحية.', bodyEn: 'Use the information and plan as a support tool, and seek professional assessment when Aqla recommends it or when you have health concerns.' },
      { titleAr: 'دقة المعلومات', titleEn: 'Accurate information', bodyAr: 'تعتمد الخطة على المعلومات التي تدخلها. الإجابات الدقيقة تساعد على جعل التوجيه أكثر ملاءمة.', bodyEn: 'Your plan depends on the information you provide. Accurate answers help make the guidance more relevant.' },
      { titleAr: 'التوفر', titleEn: 'Availability', bodyAr: 'قد تتغير خصائص الخدمة أو تتوقف مؤقتًا للصيانة والتحسين. لا تعتمد على أقلع في حالة طارئة.', bodyEn: 'Service features may change or be temporarily unavailable for maintenance and improvement. Do not rely on Aqla during an emergency.' },
    ],
  },
  'medical-disclaimer': {
    titleAr: 'التنبيه الطبي',
    titleEn: 'Medical disclaimer',
    introAr: 'أقلع يقدم دعمًا تثقيفيًا وسلوكيًا عامًا للمساعدة في رحلة الإقلاع عن التدخين والنيكوتين.',
    introEn: 'Aqla provides general educational and behavioural support for smoking and nicotine cessation.',
    sections: [
      { titleAr: 'ليس تشخيصًا أو علاجًا فرديًا', titleEn: 'Not a diagnosis or individual treatment', bodyAr: 'المحتوى والخطة لا يشكلان تشخيصًا طبيًا أو وصفة دوائية أو تحديدًا لجرعة علاجية.', bodyEn: 'The content and plan do not constitute a medical diagnosis, prescription or medication-dose decision.' },
      { titleAr: 'متى تطلب مساعدة مهنية؟', titleEn: 'When to seek professional help', bodyAr: 'إذا كانت لديك حالة صحية، أدوية منتظمة، حمل، أعراض مقلقة، استخدام متعدد شديد، أو صعوبة متكررة في الإقلاع، فقد يكون الدعم المهني مهمًا.', bodyEn: 'Professional support may be important if you have a health condition, regular medicines, pregnancy, concerning symptoms, heavy mixed use or repeated difficulty quitting.' },
      { titleAr: 'الطوارئ', titleEn: 'Emergencies', bodyAr: 'أقلع ليس خدمة طوارئ. عند وجود خطر فوري، ألم صدر شديد، صعوبة تنفس شديدة، فقدان وعي، أو أفكار جادة بإيذاء النفس، اطلب مساعدة طارئة فورًا.', bodyEn: 'Aqla is not an emergency service. For immediate danger, severe chest pain, severe breathing difficulty, loss of consciousness or serious thoughts of self-harm, seek emergency help immediately.' },
    ],
  },
  accessibility: {
    titleAr: 'إمكانية الوصول',
    titleEn: 'Accessibility',
    introAr: 'نهدف إلى أن يكون أقلع قابلًا للاستخدام على الهاتف والحاسب ولوحة المفاتيح وباللغتين العربية والإنجليزية.',
    introEn: 'Aqla aims to be usable on mobile and desktop, with keyboard access and first-class Arabic and English support.',
    sections: [
      { titleAr: 'التنقل والتركيز', titleEn: 'Navigation and focus', bodyAr: 'تستخدم الواجهة مؤشرات تركيز واضحة وعناصر تفاعلية مناسبة للاستخدام بلوحة المفاتيح.', bodyEn: 'The interface uses visible focus indicators and interactive controls designed for keyboard use.' },
      { titleAr: 'الحركة', titleEn: 'Motion', bodyAr: 'نحترم إعدادات تقليل الحركة في الجهاز حيثما تستخدم الواجهة تأثيرات حركية.', bodyEn: 'Where motion is used, the interface respects device reduced-motion preferences.' },
      { titleAr: 'الإبلاغ عن مشكلة', titleEn: 'Report an accessibility issue', bodyAr: 'إذا واجهت عائقًا في استخدام أقلع، أرسل وصفًا مختصرًا للمشكلة إلى smokefreeksa@gmail.com.', bodyEn: 'If you encounter an accessibility barrier, send a short description of the issue to smokefreeksa@gmail.com.' },
    ],
  },
}

export function isPublicPageKey(value: string): value is PublicPageKey {
  return value in publicPageContent
}
