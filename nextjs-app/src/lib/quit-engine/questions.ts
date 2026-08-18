import type { FirstUseAfterWaking, ProductType, SafetyFlag, TriggerKey } from './types'

export type BiOption<T extends string> = { value: T; ar: string; en: string }

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

export const CIGS_PER_DAY: BiOption<'1_10' | '11_20' | '21_30' | 'gt_30' | 'not_daily'>[] = [
  { value: '1_10', ar: '1–10', en: '1–10' },
  { value: '11_20', ar: '11–20', en: '11–20' },
  { value: '21_30', ar: '21–30', en: '21–30' },
  { value: 'gt_30', ar: 'أكثر من 30', en: 'More than 30' },
  { value: 'not_daily', ar: 'غير يومي', en: 'Not daily' },
]

export const SHISHA_SESSIONS: BiOption<'lt_weekly' | '1_2_week' | '3_5_week' | 'daily'>[] = [
  { value: 'lt_weekly', ar: 'أقل من جلسة أسبوعيًا', en: 'Less than once a week' },
  { value: '1_2_week', ar: 'جلسة 1–2', en: '1–2 sessions a week' },
  { value: '3_5_week', ar: 'جلسات 3–5', en: '3–5 sessions a week' },
  { value: 'daily', ar: 'يوميًا أو شبه يومي', en: 'Daily or almost daily' },
]

export const SHISHA_DURATION: BiOption<'lt_30m' | '30_60m' | '1_2h' | 'gt_2h'>[] = [
  { value: 'lt_30m', ar: 'أقل من 30 دقيقة', en: 'Less than 30 minutes' },
  { value: '30_60m', ar: '30–60 دقيقة', en: '30–60 minutes' },
  { value: '1_2h', ar: '1–2 ساعة', en: '1–2 hours' },
  { value: 'gt_2h', ar: 'أكثر من ساعتين', en: 'More than 2 hours' },
]

export const VAPE_PATTERNS: BiOption<'few' | 'frequent' | 'all_day' | 'morning_first' | 'unknown'>[] = [
  { value: 'few', ar: 'مرات قليلة في اليوم', en: 'A few times a day' },
  { value: 'frequent', ar: 'على فترات كثيرة', en: 'Many times throughout the day' },
  { value: 'all_day', ar: 'طوال اليوم تقريبًا', en: 'Almost continuously through the day' },
  { value: 'morning_first', ar: 'أول شيء بعد الاستيقاظ', en: 'One of the first things after waking' },
  { value: 'unknown', ar: 'لا أعرف الكمية', en: 'I am not sure how much I use' },
]

export const POUCH_FREQ: BiOption<'1_3' | '4_8' | 'gt_8' | 'craving_only'>[] = [
  { value: '1_3', ar: '1–3', en: '1–3 a day' },
  { value: '4_8', ar: '4–8', en: '4–8 a day' },
  { value: 'gt_8', ar: 'أكثر من 8', en: 'More than 8 a day' },
  { value: 'craving_only', ar: 'أستخدمها عند الرغبة فقط', en: 'Only when I feel a craving' },
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

export const PREV_ATTEMPTS: BiOption<'none' | 'lt_24h' | 'days' | 'week_plus' | 'month_plus' | 'gt_3m_relapse'>[] = [
  { value: 'none', ar: 'لا', en: 'No' },
  { value: 'lt_24h', ar: 'نعم، أقل من 24 ساعة', en: 'Yes, less than 24 hours' },
  { value: 'days', ar: 'نعم، عدة أيام', en: 'Yes, several days' },
  { value: 'week_plus', ar: 'نعم، أسبوع أو أكثر', en: 'Yes, one week or more' },
  { value: 'month_plus', ar: 'نعم، شهر أو أكثر', en: 'Yes, one month or more' },
  { value: 'gt_3m_relapse', ar: 'نعم، أكثر من 3 أشهر ثم عدت', en: 'Yes, more than 3 months before returning' },
]

export const RELAPSE_CAUSES: BiOption<'craving' | 'stress' | 'friends' | 'shisha' | 'coffee' | 'driving' | 'after_meal' | 'appetite_weight' | 'low_mood' | 'one_only' | 'no_support' | 'unknown'>[] = [
  { value: 'craving', ar: 'رغبة شديدة', en: 'Strong cravings' },
  { value: 'stress', ar: 'عصبية أو توتر', en: 'Irritability or stress' },
  { value: 'friends', ar: 'جلسة أصدقاء', en: 'Being with friends' },
  { value: 'shisha', ar: 'شيشة', en: 'Shisha' },
  { value: 'coffee', ar: 'قهوة', en: 'Coffee' },
  { value: 'driving', ar: 'قيادة', en: 'Driving' },
  { value: 'after_meal', ar: 'بعد الأكل', en: 'After meals' },
  { value: 'appetite_weight', ar: 'زيادة الشهية أو الوزن', en: 'Increased appetite or weight concerns' },
  { value: 'low_mood', ar: 'حزن أو ضغط نفسي', en: 'Low mood or emotional pressure' },
  { value: 'one_only', ar: 'قلت: واحدة فقط', en: 'I thought one would be okay' },
  { value: 'no_support', ar: 'لم أستخدم علاجًا أو دعمًا', en: 'I did not use treatment or support' },
  { value: 'unknown', ar: 'لا أعرف', en: 'I am not sure' },
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

export const PERSONAL_REASONS: BiOption<'health' | 'family' | 'smell' | 'money' | 'faith' | 'fitness' | 'sleep_focus' | 'procedure' | 'pregnancy_child' | 'freedom' | 'loved_one' | 'time'>[] = [
  { value: 'health', ar: 'صحتي ونفسي', en: 'My health and wellbeing' },
  { value: 'family', ar: 'أطفالي أو أسرتي', en: 'My children or family' },
  { value: 'smell', ar: 'الرائحة والشكل', en: 'Smell and appearance' },
  { value: 'money', ar: 'المال', en: 'Money' },
  { value: 'faith', ar: 'الدين والجسد كأمانة', en: 'Faith and caring for my body' },
  { value: 'fitness', ar: 'الرياضة والطاقة', en: 'Fitness and energy' },
  { value: 'sleep_focus', ar: 'النوم والتركيز', en: 'Sleep and concentration' },
  { value: 'procedure', ar: 'الاستعداد لعملية أو علاج', en: 'Preparing for an operation or treatment' },
  { value: 'pregnancy_child', ar: 'الحمل أو حماية طفل', en: 'Pregnancy or protecting a child' },
  { value: 'freedom', ar: 'كرامتي وحريتي من النيكوتين', en: 'My freedom from nicotine' },
  { value: 'loved_one', ar: 'شخص أحبه طلب مني', en: 'Someone I care about asked me' },
  { value: 'time', ar: 'لا أعرف، لكن أشعر أن الوقت حان', en: 'I am not sure, but I feel it is time' },
]
