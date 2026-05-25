// Question metadata for the Aqla Quit Engine wizard (Arabic-first).
import type { ProductType, FirstUseAfterWaking, TriggerKey, SafetyFlag } from "./types";

export const PRODUCT_OPTIONS: { value: ProductType; label: string }[] = [
  { value: "cigarettes", label: "سجائر" },
  { value: "shisha", label: "شيشة/معسل/جراك" },
  { value: "vape", label: "فيب/سحبة/سيجارة إلكترونية" },
  { value: "heated_tobacco", label: "تبغ مسخن" },
  { value: "pouches", label: "أكياس نيكوتين" },
  { value: "smokeless", label: "تبغ بلا دخان" },
  { value: "multiple", label: "أكثر من نوع" },
  { value: "relapse_prevention", label: "لا أستخدم حاليًا لكني أخاف من الرجوع" },
];

export const FIRST_USE_OPTIONS: { value: FirstUseAfterWaking; label: string }[] = [
  { value: "lt_5", label: "خلال 5 دقائق" },
  { value: "6_30", label: "خلال 6–30 دقيقة" },
  { value: "31_60", label: "خلال 31–60 دقيقة" },
  { value: "gt_60", label: "بعد أكثر من ساعة" },
  { value: "not_daily", label: "لا أستخدم يوميًا" },
];

export const CIGS_PER_DAY = ["1–10", "11–20", "21–30", "أكثر من 30", "غير يومي"];
export const SHISHA_SESSIONS = [
  "أقل من جلسة أسبوعيًا",
  "جلسة 1–2",
  "جلسات 3–5",
  "يوميًا أو شبه يومي",
];
export const SHISHA_DURATION = [
  "أقل من 30 دقيقة",
  "30–60 دقيقة",
  "1–2 ساعة",
  "أكثر من ساعتين",
];
export const VAPE_PATTERNS = [
  "مرات قليلة في اليوم",
  "على فترات كثيرة",
  "طوال اليوم تقريبًا",
  "أول شيء بعد الاستيقاظ",
  "لا أعرف الكمية",
];
export const POUCH_FREQ = [
  "1–3",
  "4–8",
  "أكثر من 8",
  "أستخدمها عند الرغبة فقط",
];

export const TRIGGER_OPTIONS: { value: TriggerKey; label: string }[] = [
  { value: "coffee", label: "مع قهوة الصباح" },
  { value: "car", label: "أثناء القيادة أو الزحمة" },
  { value: "after_meal", label: "بعد الأكل" },
  { value: "social", label: "مع الأصدقاء" },
  { value: "shisha_session", label: "في جلسة شيشة" },
  { value: "stress", label: "عند الزعل أو الغضب" },
  { value: "anxiety", label: "عند القلق أو الضغط" },
  { value: "boredom", label: "عند الملل" },
  { value: "before_sleep", label: "قبل النوم" },
  { value: "study_work", label: "أثناء الدراسة أو العمل" },
  { value: "phone_games", label: "عند استخدام الجوال أو الألعاب" },
  { value: "weekend", label: "في الويكند أو الاستراحة" },
  { value: "routine_prayer", label: "بعد الصلاة أو قبلها بسبب الروتين" },
  { value: "arabic_coffee_majlis", label: "عند الشاي/القهوة العربية أو المجلس" },
];

export const PREV_ATTEMPTS = [
  "لا",
  "نعم، أقل من 24 ساعة",
  "نعم، عدة أيام",
  "نعم، أسبوع أو أكثر",
  "نعم، شهر أو أكثر",
  "نعم، أكثر من 3 أشهر ثم عدت",
];

export const RELAPSE_CAUSES = [
  "رغبة شديدة",
  "عصبية أو توتر",
  "جلسة أصدقاء",
  "شيشة",
  "قهوة",
  "قيادة",
  "بعد الأكل",
  "زيادة الشهية أو الوزن",
  "حزن أو ضغط نفسي",
  "قلت: واحدة فقط",
  "لم أستخدم علاجًا أو دعمًا",
  "لا أعرف",
];

export const SAFETY_OPTIONS: { value: SafetyFlag; label: string }[] = [
  { value: "pregnancy", label: "حامل أو مرضع" },
  { value: "under_18", label: "أقل من 18 سنة" },
  { value: "cardiac", label: "مرض قلبي أو ألم صدر أو جلطة سابقة" },
  { value: "respiratory", label: "ربو أو COPD أو مرض تنفسي مهم" },
  { value: "medications", label: "أستخدم أدوية نفسية أو أدوية مزمنة مهمة" },
  { value: "mental_health", label: "لديّ قلق أو اكتئاب شديد" },
  { value: "suicidal_ideation", label: "لديّ أفكار إيذاء للنفس" },
  { value: "seizures", label: "لديّ نوبات صرع" },
  { value: "high_mixed_use", label: "أستخدم أكثر من منتج نيكوتين بكمية عالية" },
  { value: "repeated_failure", label: "فشلت محاولات كثيرة وأشعر أني لا أستطيع وحدي" },
  { value: "none", label: "لا ينطبق شيء مما سبق" },
];

export const PERSONAL_REASONS = [
  "صحتي ونفسي",
  "أطفالي أو أسرتي",
  "الرائحة والشكل",
  "المال",
  "الدين والجسد كأمانة",
  "الرياضة والطاقة",
  "النوم والتركيز",
  "الاستعداد لعملية أو علاج",
  "الحمل أو حماية طفل",
  "كرامتي وحريتي من النيكوتين",
  "شخص أحبه طلب مني",
  "لا أعرف، لكن أشعر أن الوقت حان",
];

export const STEP_TITLES = [
  "المنتج ونمط الاستخدام",
  "أول استخدام بعد الاستيقاظ",
  "كمية الاستخدام",
  "خريطة المحفزات",
  "الاستعداد والثقة والدافعية",
  "محاولات الإقلاع السابقة",
  "فحص السلامة والإحالة",
  "معنى الإقلاع والأسباب الشخصية",
];
