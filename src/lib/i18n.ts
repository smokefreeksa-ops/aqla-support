import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "en" | "ar";

export const dict = {
  en: {
    appName: "Aqla — Smoking & Nicotine Cessation Support",
    brandShort: "Aqla",
    tagline:
      "A free physician- and specialist-supervised digital pathway to help users understand their smoking or nicotine dependence, choose the right support step, and join a volunteer training pathway for community awareness and support.",
    chooseTrackHeader: "Choose the path that fits you",
    quitTrackTitle: "I Want Help to Quit",
    quitTrackDesc:
      "For smokers or nicotine users who want to know their dependence level, start quitting, reduce use, or request support.",
    quitTrackBtn: "Start This Path",
    volunteerTrackTitle: "I Want to Join as a Volunteer / Trainee",
    volunteerTrackDesc:
      "For students or individuals who want training and want to help support smokers through awareness and supportive guidance under physician and specialist supervision.",
    volunteerTrackBtn: "Join as Volunteer",
    startBtn: "Start Nicotine Dependence Assessment",
    takesMinutes: "Takes 3–5 minutes",
    disclaimer: "This service provides education and support. It is not an emergency service.",
    emergency:
      "If you have severe chest pain, severe shortness of breath, coughing blood, or a medical emergency, seek urgent medical care.",
    adminLogin: "Staff Login",
    back: "Back",
    next: "Next",
    submit: "Submit",
    saving: "Saving…",
    yes: "Yes",
    no: "No",
    optional: "(optional)",
    required: "Required",
    stepConsent: "Consent",
    stepTriage: "Triage",
    stepProducts: "Product Type",
    stepDependence: "Dependence Score",
    stepReadiness: "Readiness",
    stepRisk: "Safety",
    stepResult: "Result",
    consentTitle: "Consent",
    consentBlurb: "Before we begin, please review and agree:",
    consent1: "I agree to complete the nicotine assessment.",
    consent2: "I agree that the team may contact me by WhatsApp/SMS/phone/email for support.",
    consent3: "I understand this is educational/supportive and not emergency care.",
    consent4: "I agree that my anonymized data may be used for service evaluation and improvement.",
    consent5: "Optional: I agree that my anonymized data may be used for research/publication, if ethically approved.",
    guardianNotice:
      "If under 18, a parent/guardian should be aware and consent. Your case will be flagged for clinical review.",
    triageTitle: "Initial Triage & Nicotine Assessment",
    fullName: "Full name",
    mobile: "Mobile number",
    email: "Email",
    age: "Age",
    dob: "Date of birth",
    gender: "Gender",
    city: "City",
    affiliation: "School / university / workplace",
    prefLang: "Preferred language",
    prefContact: "Preferred contact method",
    selfCompleting: "Are you completing this for yourself?",
    prevTried: "Have you previously tried to quit?",
    prevAttempts: "Number of previous quit attempts",
    mainReason: "Main reason for using the service",
    productsTitle: "What nicotine or tobacco products do you currently use?",
    productsHint: "Select all that apply.",
    cigTitle: "Cigarette Dependence Score",
    cigSubtitle:
      "This section estimates how strongly your body may depend on cigarettes. Your score is not a judgment. It helps us choose the right support pathway.",
    nicTitle: "Nicotine Control Check",
    nicSubtitle:
      "This checks whether nicotine is starting to control your routine, mood, or ability to stop.",
    readinessTitle: "What best describes you today?",
    riskTitle: "Safety Screen",
    riskSubtitle: "Do any of the following apply to you?",
    urgentMsg:
      "Please seek urgent medical care now. Call emergency services or go to the nearest emergency department.",
    resultTitle: "Your Support Pathway",
    yourId: "Participant ID",
    doctorReview: "Doctor review required",
    requestFollowup: "Request follow-up",
    downloadPdf: "Download summary",
    backHome: "Back to home",
    notDiagnosis:
      "This score helps us understand how much support you may need. It does not define you and it is not a diagnosis.",
    // volunteer
    volIntroTitle: "Volunteer & Training Pathway",
    volIntroBody:
      "This pathway allows you to register to support smokers through awareness and supportive guidance after appropriate training and under physician and specialist supervision.",
    volIntroNote:
      "This pathway does not authorize medical consultation or treatment advice. It is intended for structured training and supportive awareness roles only.",
    volBegin: "Begin Volunteer Registration",
    volFormTitle: "Volunteer Registration",
    academicLevel: "Academic level",
    motivation: "Why do you want to volunteer?",
    priorAwareness: "Have you participated in health awareness work before?",
    smokingStatus: "Are you a smoker, former smoker, or non-smoker?",
    smoker: "Smoker",
    formerSmoker: "Former smoker",
    nonSmoker: "Non-smoker",
    interestsTitle: "Which areas are you interested in?",
    int_awareness_campaigns: "Awareness campaigns",
    int_smoker_support: "Supporting smokers after training",
    int_data_entry: "Data entry / administrative support",
    int_follow_up_coordination: "Follow-up coordination",
    int_content_creation: "Content creation / social media awareness",
    int_events: "Event participation",
    availability: "Available days and times",
    screeningTitle: "Volunteer Screening",
    screen1: "I agree to follow professional boundaries.",
    screen2: "I understand that volunteers do not provide medical advice.",
    screen3: "I agree that smoker cases needing clinical input will be referred to the physician/specialist team.",
    screen4: "I agree to complete training before participating in support activities.",
    volSubmittedTitle: "Application Received",
    volSubmittedBody:
      "Thank you for applying. The team will review your application and contact you using your preferred method.",
    yourApplicationCode: "Application code",
  },
  ar: {
    appName: "أقلع — Aqla",
    brandShort: "أقلع",
    tagline:
      "ابدأ رحلتك للإقلاع، أو كن سببًا في مساعدة غيرك",
    chooseTrackHeader: "اختر المسار المناسب لك",
    quitTrackTitle: "أريد المساعدة للإقلاع",
    quitTrackDesc:
      "للمدخنين أو مستخدمي النيكوتين الذين يرغبون في معرفة مستوى الاعتماد لديهم، أو البدء في الإقلاع، أو تقليل الاستخدام، أو طلب الدعم.",
    quitTrackBtn: "ابدأ المسار",
    volunteerTrackTitle: "أريد الانضمام كمتطوع / متدرب",
    volunteerTrackDesc:
      "للطلاب أو الأفراد الراغبين في التدريب والمساهمة في دعم المدخنين من خلال التوعية والمساندة تحت إشراف طبيب وأخصائيين.",
    volunteerTrackBtn: "انضم كمتطوع",
    startBtn: "ابدأ تقييم الاعتماد على النيكوتين",
    takesMinutes: "يستغرق ٣–٥ دقائق",
    disclaimer: "هذه الخدمة للتثقيف والدعم. وليست خدمة طوارئ.",
    emergency:
      "إذا كنت تعاني من ألم شديد في الصدر، أو ضيق تنفس شديد، أو سعال مصحوب بدم، أو حالة طارئة، فاطلب الرعاية الطبية العاجلة.",
    adminLogin: "دخول الموظفين",
    back: "السابق",
    next: "التالي",
    submit: "إرسال",
    saving: "جارٍ الحفظ…",
    yes: "نعم",
    no: "لا",
    optional: "(اختياري)",
    required: "مطلوب",
    stepConsent: "الموافقة",
    stepTriage: "التقييم الأولي",
    stepProducts: "نوع المنتج",
    stepDependence: "درجة الاعتماد",
    stepReadiness: "الجاهزية",
    stepRisk: "السلامة",
    stepResult: "النتيجة",
    consentTitle: "الموافقة",
    consentBlurb: "قبل أن نبدأ، يرجى مراجعة ما يلي والموافقة عليه:",
    consent1: "أوافق على إكمال تقييم النيكوتين.",
    consent2: "أوافق على أن يتواصل الفريق معي عبر واتساب/رسالة/مكالمة/بريد إلكتروني للدعم.",
    consent3: "أفهم أن هذه الخدمة تثقيفية وداعمة وليست رعاية طارئة.",
    consent4: "أوافق على استخدام بياناتي بشكل مجهول لتقييم الخدمة وتحسينها.",
    consent5: "اختياري: أوافق على استخدام بياناتي بشكل مجهول للبحث/النشر إذا تمت الموافقة الأخلاقية.",
    guardianNotice:
      "إذا كان عمرك أقل من ١٨، يجب أن يكون ولي الأمر على علم وموافقاً. ستتم مراجعة حالتك سريرياً.",
    triageTitle: "التقييم الأولي للنيكوتين",
    fullName: "الاسم الكامل",
    mobile: "رقم الجوال",
    email: "البريد الإلكتروني",
    age: "العمر",
    dob: "تاريخ الميلاد",
    gender: "الجنس",
    city: "المدينة",
    affiliation: "المدرسة / الجامعة / العمل",
    prefLang: "اللغة المفضلة",
    prefContact: "وسيلة التواصل المفضلة",
    selfCompleting: "هل تكمل هذا النموذج لنفسك؟",
    prevTried: "هل حاولت الإقلاع سابقاً؟",
    prevAttempts: "عدد محاولات الإقلاع السابقة",
    mainReason: "السبب الرئيسي لاستخدام الخدمة",
    productsTitle: "ما المنتجات التي تستخدمها حالياً؟",
    productsHint: "اختر كل ما ينطبق.",
    cigTitle: "درجة الاعتماد على السجائر",
    cigSubtitle:
      "هذا القسم يقدّر مدى اعتماد جسمك على السجائر. الدرجة ليست حكماً عليك بل تساعدنا في اختيار الدعم المناسب.",
    nicTitle: "فحص التحكم في النيكوتين",
    nicSubtitle:
      "يفحص هذا القسم ما إذا كان النيكوتين بدأ يتحكم في يومك أو مزاجك أو قدرتك على التوقف.",
    readinessTitle: "أيٌّ مما يلي يصفك اليوم؟",
    riskTitle: "فحص السلامة",
    riskSubtitle: "هل ينطبق عليك أيٌّ مما يلي؟",
    urgentMsg: "يرجى طلب الرعاية الطبية العاجلة الآن. اتصل بالطوارئ أو توجه لأقرب قسم طوارئ.",
    resultTitle: "مسار الدعم الخاص بك",
    yourId: "رقم المشارك",
    doctorReview: "يلزم مراجعة الطبيب",
    requestFollowup: "اطلب متابعة",
    downloadPdf: "تنزيل الملخص",
    backHome: "العودة للرئيسية",
    notDiagnosis: "هذه الدرجة تساعدنا في فهم حجم الدعم الذي قد تحتاجه. وهي ليست تشخيصاً ولا تعرّفك.",
    volIntroTitle: "مسار التطوع والتدريب",
    volIntroBody:
      "يتيح لك هذا المسار التسجيل للمساهمة في دعم المدخنين من خلال التوعية والمساندة، بعد التدريب المناسب وتحت إشراف طبيب وأخصائيين.",
    volIntroNote:
      "هذا المسار لا يمنح صلاحية تقديم استشارات طبية أو وصف علاجات، وإنما يهدف إلى التدريب والمساندة التوعوية المنظمة.",
    volBegin: "ابدأ تسجيل التطوع",
    volFormTitle: "تسجيل المتطوعين",
    academicLevel: "المستوى الدراسي",
    motivation: "لماذا ترغب في التطوع؟",
    priorAwareness: "هل سبق لك المشاركة في عمل توعوي صحي؟",
    smokingStatus: "هل أنت مدخن، أو مدخن سابق، أو غير مدخن؟",
    smoker: "مدخن",
    formerSmoker: "مدخن سابق",
    nonSmoker: "غير مدخن",
    interestsTitle: "في أي المجالات ترغب في المشاركة؟",
    int_awareness_campaigns: "حملات التوعية",
    int_smoker_support: "دعم المدخنين بعد التدريب",
    int_data_entry: "إدخال بيانات / دعم إداري",
    int_follow_up_coordination: "تنسيق المتابعة",
    int_content_creation: "إنشاء محتوى / توعية عبر وسائل التواصل",
    int_events: "المشاركة في الفعاليات",
    availability: "الأيام والأوقات المتاحة",
    screeningTitle: "أسئلة التأهيل",
    screen1: "أوافق على الالتزام بالحدود المهنية.",
    screen2: "أفهم أن المتطوع لا يقدّم استشارات طبية.",
    screen3: "أوافق على إحالة حالات المدخنين التي تتطلب تدخلاً سريرياً إلى فريق الطبيب/الأخصائيين.",
    screen4: "أوافق على إكمال التدريب قبل المشاركة في أنشطة الدعم.",
    volSubmittedTitle: "تم استلام طلبك",
    volSubmittedBody:
      "شكراً لتقديم طلبك. سيقوم الفريق بمراجعته والتواصل معك عبر وسيلتك المفضلة.",
    yourApplicationCode: "رقم الطلب",
  },
} as const;

export type Dict = typeof dict.en;

export const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "ar",
  setLang: () => {},
});

export function useLang() {
  const ctx = useContext(LangContext);
  const t = dict[ctx.lang];
  return { ...ctx, t, dir: ctx.lang === "ar" ? "rtl" : "ltr" };
}

export function useLangState() {
  const [lang, setLangState] = useState<Lang>("ar");
  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("lang") : null;
    const saved: Lang = raw === "en" || raw === "ar" ? raw : "ar";
    setLangState(saved);
  }, []);
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = lang;
    }
  }, [lang]);
  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("lang", l);
  };
  return { lang, setLang };
}
