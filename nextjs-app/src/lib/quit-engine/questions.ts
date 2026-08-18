import type { FirstUseAfterWaking, ProductType, SafetyFlag, TriggerKey } from './types'

type BiOption<T extends string> = { value: T; ar: string; en: string }

export const PRODUCT_OPTIONS: BiOption<ProductType>[] = [
  { value: 'cigarettes', ar: 'سجائر', en: 'Cigarettes' },
  { value: 'shisha', ar: 'شيشة / معسل / جراك', en: 'Shisha / waterpipe' },
  { value: 'vape', ar: 'فيب / سحبة / سيجارة إلكترونية', en: 'Vape / e-cigarette' },
  { value: 'heated_tobacco', ar: 'تبغ مسخن', en: 'Heated tobacco' },
  { value: 'pouches', ar: 'أكياس نيكوتين', en: 'Nicotine pouches' },
  { value: 'smokeless', ar: 'تبغ بلا دخان', en: 'Smokeless tobacco' },
  { value: 'relapse_prevention', ar: 'لا أستخدم حاليًا لكني أخاف من الرجوع', en: 'I do not currently use nicotine but I am worried about relapse' },
]

export const FIRST_USE_OPTIONS: BiOption<FirstUseAfterWaking>[] = [
  { value: 'lt_5', ar: 'خلال 5 دقائق', en: 'Within 5 minutes' },
  { value: '6_30', ar: 'خلال 6–30 دقيقة', en: 'Within 6–30 minutes' },
  { value: '31_60', ar: 'خلال 31–60 دقيقة', en: 'Within 31–60 minutes' },
  { value: 'gt_60', ar: 'بعد أكثر من ساعة', en: 'After more than 60 minutes' },
  { value: 'not_daily', ar: 'لا أستخدم يوميًا', en: 'I do not use nicotine daily' },
]

export const CIGS_PER_DAY = [
  { ar: '1–10', en: '1–10' },
  { ar: '11–20', en: '11–20' },
  { ar: '21–30', en: '21–30' },
  { ar: 'أكثر من 30', en: 'More than 30' },
  { ar: 'غير يومي', en: 'Not daily' },
]

export const SHISHA_SESSIONS = [
  { ar: 'أقل من جلسة أسبوعيًا', en: 'Less than once a week' },
  { ar: 'جلسة 1–2', en: '1–2 sessions a week' },
  { ar: 'جلسات 3–5', en: '3–5 sessions a week' },
  { ar: 'يوميًا أو شبه يومي', en: 'Daily or almost daily' },
]

export const SHISHA_DURATION = [
  { ar: 'أقل من 30 دقيقة', en: 'Less than 30 minutes' },
  { ar: '30–60 دقيقة', en: '30–60 minutes' },
  { ar: '1–2 ساعة', en: '1–2 hours' },
  { ar: 'أكثر من ساعتين', en: 'More than 2 hours' },
]

export const VAPE_PATTERNS = [
  { ar: 'مرات قليلة في اليوم', en: 'A few times a day' },
  { ar: 'على فترات كثيرة', en: 'Many times throughout the day' },
  { ar: 'طوال اليوم تقريبًا', en: 'Almost continuously through the day' },
  { ar: 'أول شيء بعد الاستيقاظ', en: 'One of the first things after waking' },
  { ar: 'لا أعرف الكمية', en: 'I am not sure how much I use' },
]

export const POUCH_FREQ = [
  { ar: '1–3', en: '1–3 a day' },
  { ar: '4–8', en: '4–8 a day' },
  { ar: 'أكثر من 8', en: 'More than 8 a day' },
  { ar: 'أستخدمها عند الرغبة فقط', en: 'Only when I feel a craving' },
]

export const TRIGGER_OPTIONS: BiOption<TriggerKey>[] = [
  { value: 'coffee', ar: 'مع قهوة الصباح', en: 'With morning coffee' },
  { value: 'car', ar: 'أثناء القيادة أو الزحمة', en: 'While driving or in traffic' },
  { value: 'after_meal', ar: 'بعد الأكل', en: 'After meals' },
  { value: 'social', ar: 'مع الأصدقاء', en: 'With friends' },
  { value: 'shisha_session', ar: 'في جلسة شيشة', en: 'At a shisha session' },
  { value: 'stress', ar: 'عند الزعل أو الغضب', en: 'When upset or angry' },
  { value: 'anxiety', ar: 'عند القلق أو الضغط', en: 'When anxious or under pressure' },
  { value: 'boredom', ar: 'عند الملل', en: 'When bored' },
  { value: 'before_sleep', ar: 'قبل النوم', en: 'Before sleep' },
  { value: 'study_work', ar: 'أثناء الدراسة أو العمل', en: 'During study or work' },
  { value: 'phone_games', ar: 'عند استخدام الجوال أو الألعاب', en: 'While using the phone or gaming' },
  { value: 'weekend', ar: 'في الويكند أو الاستراحة', en: 'At weekends or during breaks' },
  { value: 'routine_prayer', ar: 'بعد الصلاة أو قبلها بسبب الروتين', en: 'Around prayer time as part of a routine' },
  { value: 'arabic_coffee_majlis', ar: 'عند الشاي / القهوة العربية أو المجلس', en: 'With tea, Arabic coffee or at a majlis' },
]

export const PREV_ATTEMPTS = [
  { ar: 'لا', en: 'No' },
  { ar: 'نعم، أقل من 24 ساعة', en: 'Yes, less than 24 hours' },
  { ar: 'نعم، عدة أيام', en: 'Yes, several days' },
  { ar: 'نعم، أسبوع أو أكثر', en: 'Yes, one week or more' },
  { ar: 'نعم، شهر أو أكثر', en: 'Yes, one month or more' },
  { ar: 'نعم، أكثر من 3 أشهر ثم عدت', en: 'Yes, more than 3 months before returning' },
]

export const RELAPSE_CAUSES = [
  { ar: 'رغبة شديدة', en: 'Strong cravings' },
  { ar: 'عصبية أو توتر', en: 'Irritability or stress' },
  { ar: 'جلسة أصدقاء', en: 'Being with friends' },
  { ar: 'شيشة', en: 'Shisha' },
  { ar: 'قهوة', en: 'Coffee' },
  { ar: 'قيادة', en: 'Driving' },
  { ar: 'بعد الأكل', en: 'After meals' },
  { ar: 'زيادة الشهية أو الوزن', en: 'Increased appetite or weight concerns' },
  { ar: 'حزن أو ضغط نفسي', en: 'Low mood or emotional pressure' },
  { ar: 'قلت: واحدة فقط', en: 'I thought one would be okay' },
  { ar: 'لم أستخدم علاجًا أو دعمًا', en: 'I did not use treatment or support' },
  { ar: 'لا أعرف', en: 'I am not sure' },
]

export const SAFETY_OPTIONS: BiOption<SafetyFlag>[] = [
  { value: 'pregnancy', ar: 'حامل أو مرضع', en: 'Pregnant or breastfeeding' },
  { value: 'under_18', ar: 'أقل من 18 سنة', en: 'Under 18 years old' },
  { value: 'cardiac', ar: 'مرض قلبي أو ألم صدر أو جلطة سابقة', en: 'Heart disease, chest pain or previous heart attack' },
  { value: 'respiratory', ar: 'ربو أو COPD أو مرض تنفسي مهم', en: 'Asthma, COPD or another significant respiratory condition' },
  { value: 'medications', ar: 'أستخدم أدوية نفسية أو أدوية مزمنة مهمة', en: 'I use psychiatric medicines or other important long-term medicines' },
  { value: 'mental_health', ar: 'لديّ قلق أو اكتئاب شديد', en: 'I have severe anxiety or depression' },
  { value: 'suicidal_ideation', ar: 'لديّ أفكار إيذاء للنفس', en: 'I have thoughts of harming myself' },
  { value: 'seizures', ar: 'لديّ نوبات صرع', en: 'I have a seizure disorder' },
  { value: 'high_mixed_use', ar: 'أستخدم أكثر من منتج نيكوتين بكمية عالية', en: 'I use several nicotine products heavily' },
  { value: 'repeated_failure', ar: 'محاولات كثيرة ولم أستطع الاستمرار وحدي', en: 'I have tried many times and struggle to continue on my own' },
  { value: 'none', ar: 'لا ينطبق شيء مما سبق', en: 'None of the above' },
]

export const PERSONAL_REASONS = [
  { ar: 'صحتي ونفسي', en: 'My health and wellbeing' },
  { ar: 'أطفالي أو أسرتي', en: 'My children or family' },
  { ar: 'الرائحة والشكل', en: 'Smell and appearance' },
  { ar: 'المال', en: 'Money' },
  { ar: 'الدين والجسد كأمانة', en: 'Faith and caring for my body' },
  { ar: 'الرياضة والطاقة', en: 'Fitness and energy' },
  { ar: 'النوم والتركيز', en: 'Sleep and concentration' },
  { ar: 'الاستعداد لعملية أو علاج', en: 'Preparing for an operation or treatment' },
  { ar: 'الحمل أو حماية طفل', en: 'Pregnancy or protecting a child' },
  { ar: 'كرامتي وحريتي من النيكوتين', en: 'My freedom from nicotine' },
  { ar: 'شخص أحبه طلب مني', en: 'Someone I care about asked me' },
  { ar: 'لا أعرف، لكن أشعر أن الوقت حان', en: 'I am not sure, but I feel it is time' },
]
