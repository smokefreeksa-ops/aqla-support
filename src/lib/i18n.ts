import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "en" | "ar";

export const dict = {
  en: {
    appName: "La-tatten Smoking & Nicotine Cessation Support",
    tagline: "A free physician-led support pathway to help you understand your nicotine dependence and choose the right next step.",
    startBtn: "Start Nicotine Dependence Assessment",
    takesMinutes: "Takes 3–5 minutes",
    disclaimer: "This service provides education and support. It is not an emergency service.",
    emergency: "If you have severe chest pain, severe shortness of breath, coughing blood, or a medical emergency, seek urgent medical care.",
    adminLogin: "Staff Login",
    back: "Back",
    next: "Next",
    submit: "Submit",
    saving: "Saving…",
    yes: "Yes",
    no: "No",
    optional: "(optional)",
    required: "Required",
    // steps
    stepConsent: "Consent",
    stepTriage: "Triage",
    stepProducts: "Product Type",
    stepDependence: "Dependence Score",
    stepReadiness: "Readiness",
    stepResult: "Result",
    // consent
    consentTitle: "Consent",
    consentBlurb: "Before we begin, please review and agree:",
    consent1: "I agree to complete the nicotine assessment.",
    consent2: "I agree that the team may contact me by WhatsApp/SMS/phone/email for support.",
    consent3: "I understand this is educational/supportive and not emergency care.",
    consent4: "I agree that my anonymized data may be used for service evaluation and improvement.",
    consent5: "Optional: I agree that my anonymized data may be used for research/publication, if ethically approved.",
    guardianNotice: "If under 18, a parent/guardian should be aware and consent. Your case will be flagged for clinical review.",
    // triage
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
    // products
    productsTitle: "What nicotine or tobacco products do you currently use?",
    productsHint: "Select all that apply.",
    // dependence
    cigTitle: "Cigarette Dependence Score",
    cigSubtitle: "This section estimates how strongly your body may depend on cigarettes. Your score is not a judgment. It helps us choose the right support pathway.",
    nicTitle: "Nicotine Control Check",
    nicSubtitle: "This checks whether nicotine is starting to control your routine, mood, or ability to stop.",
    // readiness
    readinessTitle: "What best describes you today?",
    // risk
    riskTitle: "Safety Screen",
    riskSubtitle: "Do any of the following apply to you?",
    urgentMsg: "Please seek urgent medical care now. Call emergency services or go to the nearest emergency department.",
    // result
    resultTitle: "Your Support Pathway",
    yourId: "Participant ID",
    doctorReview: "Doctor review required",
    requestFollowup: "Request follow-up",
    downloadPdf: "Download summary",
    backHome: "Back to home",
    notDiagnosis: "This score helps us understand how much support you may need. It does not define you and it is not a diagnosis.",
  },
  ar: {
    appName: "لا تتّن — دعم الإقلاع عن التدخين والنيكوتين",
    tagline: "مسار دعم مجاني بإشراف طبيب لمساعدتك على فهم مستوى اعتمادك على النيكوتين واختيار الخطوة المناسبة لك.",
    startBtn: "ابدأ تقييم الاعتماد على النيكوتين",
    takesMinutes: "يستغرق ٣–٥ دقائق",
    disclaimer: "هذه الخدمة للتثقيف والدعم. وليست خدمة طوارئ.",
    emergency: "إذا كنت تعاني من ألم شديد في الصدر، أو ضيق تنفس شديد، أو سعال مصحوب بدم، أو حالة طارئة، فاطلب الرعاية الطبية العاجلة.",
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
    stepResult: "النتيجة",
    consentTitle: "الموافقة",
    consentBlurb: "قبل أن نبدأ، يرجى مراجعة ما يلي والموافقة عليه:",
    consent1: "أوافق على إكمال تقييم النيكوتين.",
    consent2: "أوافق على أن يتواصل الفريق معي عبر واتساب/رسالة/مكالمة/بريد إلكتروني للدعم.",
    consent3: "أفهم أن هذه الخدمة تثقيفية وداعمة وليست رعاية طارئة.",
    consent4: "أوافق على استخدام بياناتي بشكل مجهول لتقييم الخدمة وتحسينها.",
    consent5: "اختياري: أوافق على استخدام بياناتي بشكل مجهول للبحث/النشر إذا تمت الموافقة الأخلاقية.",
    guardianNotice: "إذا كان عمرك أقل من ١٨، يجب أن يكون ولي الأمر على علم وموافقاً. ستتم مراجعة حالتك سريرياً.",
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
    cigSubtitle: "هذا القسم يقدّر مدى اعتماد جسمك على السجائر. الدرجة ليست حكماً عليك بل تساعدنا في اختيار الدعم المناسب.",
    nicTitle: "فحص التحكم في النيكوتين",
    nicSubtitle: "يفحص هذا القسم ما إذا كان النيكوتين بدأ يتحكم في يومك أو مزاجك أو قدرتك على التوقف.",
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
    const saved = (typeof window !== "undefined" && (localStorage.getItem("lang") as Lang)) || "ar";
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
