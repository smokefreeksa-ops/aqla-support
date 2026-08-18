import type { DependenceCategory, EngineAnswers, ReadinessCategory, SafetyFlag, TriggerKey } from './types'

export function computeHSI(a: EngineAnswers): number | undefined {
  if (!a.product_types.includes('cigarettes')) return undefined
  if (!a.cigarettes_per_day || a.cigarettes_per_day === 'غير يومي' || a.cigarettes_per_day === 'Not daily') return undefined

  const time = a.first_use_after_waking === 'lt_5' ? 3
    : a.first_use_after_waking === '6_30' ? 2
      : a.first_use_after_waking === '31_60' ? 1
        : 0

  const cpd = a.cigarettes_per_day === '11–20' ? 1
    : a.cigarettes_per_day === '21–30' ? 2
      : a.cigarettes_per_day === 'أكثر من 30' || a.cigarettes_per_day === 'More than 30' ? 3
        : 0

  return time + cpd
}

/**
 * AQla support-intensity heuristic.
 * This is deliberately NOT presented as a validated dependence instrument.
 * It helps the application select how much behavioural support to surface.
 */
export function computeAqlaSupportIntensity(a: EngineAnswers): number {
  let score = 0
  const realProducts = a.product_types.filter((p) => p !== 'relapse_prevention')

  if (a.first_use_after_waking === 'lt_5' || a.first_use_after_waking === '6_30') score += 1

  const highFrequency =
    a.cigarettes_per_day === '21–30' ||
    a.cigarettes_per_day === 'أكثر من 30' ||
    a.cigarettes_per_day === 'More than 30' ||
    a.shisha_sessions_per_week === 'يوميًا أو شبه يومي' ||
    a.shisha_sessions_per_week === 'Daily or almost daily' ||
    a.vape_pattern === 'طوال اليوم تقريبًا' ||
    a.vape_pattern === 'Almost continuously through the day' ||
    a.vape_pattern === 'أول شيء بعد الاستيقاظ' ||
    a.vape_pattern === 'One of the first things after waking' ||
    a.nicotine_pouch_frequency === 'أكثر من 8' ||
    a.nicotine_pouch_frequency === 'More than 8 a day'
  if (highFrequency) score += 2

  if (realProducts.length > 1 || a.mixed_use) score += 2
  if (a.triggers.includes('stress') || a.triggers.includes('anxiety')) score += 1

  if (a.previous_quit_attempts && !['لا', 'No', 'نعم، أكثر من 3 أشهر ثم عدت', 'Yes, more than 3 months before returning'].includes(a.previous_quit_attempts)) score += 1

  if (a.previous_quit_attempts === 'نعم، أقل من 24 ساعة' || a.previous_quit_attempts === 'Yes, less than 24 hours') score += 1
  if (a.relapse_causes.some((cause) => ['رغبة شديدة', 'Strong cravings', 'عصبية أو توتر', 'Irritability or stress'].includes(cause))) score += 1
  if (a.safety_flags.includes('high_mixed_use') || a.safety_flags.includes('repeated_failure')) score += 1

  return Math.min(10, score)
}

export function classifyDependence(a: EngineAnswers, intensity: number): DependenceCategory {
  const realProducts = a.product_types.filter((p) => p !== 'relapse_prevention')
  if (realProducts.length > 1 || a.mixed_use) return 'complex_mixed'
  if (intensity >= 6) return 'high'
  if (intensity >= 3) return 'moderate'
  return 'low_ritual'
}

export function classifyReadiness(a: EngineAnswers): ReadinessCategory {
  const i = a.importance_score
  const c = a.confidence_score
  const r = a.readiness_score
  if (i >= 7 && c >= 7 && r >= 7) return 'ready_now'
  if (i >= 7 && (c < 7 || r < 7)) return 'wants_but_low_confidence'
  if (i < 7 && c >= 7) return 'low_importance_high_confidence'
  return 'not_ready'
}

export const TRIGGER_PATTERN_LABEL_AR: Record<TriggerKey, string> = {
  coffee: 'نمط القهوة',
  car: 'نمط السيارة والقيادة',
  after_meal: 'نمط بعد الأكل',
  social: 'نمط الأصدقاء والمجالس',
  shisha_session: 'نمط الشيشة الاجتماعي',
  stress: 'نمط التوتر والزعل',
  anxiety: 'نمط القلق والضغط',
  boredom: 'نمط الملل والفراغ',
  before_sleep: 'نمط ما قبل النوم',
  study_work: 'نمط الدراسة والعمل',
  phone_games: 'نمط الجوال والألعاب',
  weekend: 'نمط الويكند والاستراحة',
  routine_prayer: 'نمط الروتين حول الصلاة',
  arabic_coffee_majlis: 'نمط القهوة العربية والمجلس',
}

export const TRIGGER_PATTERN_LABEL_EN: Record<TriggerKey, string> = {
  coffee: 'Coffee pattern',
  car: 'Driving pattern',
  after_meal: 'After-meal pattern',
  social: 'Friends and social pattern',
  shisha_session: 'Social shisha pattern',
  stress: 'Stress pattern',
  anxiety: 'Anxiety and pressure pattern',
  boredom: 'Boredom pattern',
  before_sleep: 'Before-sleep pattern',
  study_work: 'Study/work pattern',
  phone_games: 'Phone/gaming pattern',
  weekend: 'Weekend pattern',
  routine_prayer: 'Prayer-routine pattern',
  arabic_coffee_majlis: 'Arabic coffee/majlis pattern',
}

export function topTriggerPatterns(a: EngineAnswers, lang: 'ar' | 'en' = 'ar'): string[] {
  const labels = lang === 'ar' ? TRIGGER_PATTERN_LABEL_AR : TRIGGER_PATTERN_LABEL_EN
  const counts = new Map<string, number>()
  for (const trigger of a.triggers) {
    const label = labels[trigger]
    counts.set(label, (counts.get(label) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .sort((x, y) => y[1] - x[1])
    .map(([label]) => label)
}

export function requiresReferral(a: EngineAnswers): boolean {
  const refer: SafetyFlag[] = ['pregnancy', 'under_18', 'cardiac', 'respiratory', 'medications', 'mental_health', 'seizures']
  return a.safety_flags.some((flag) => refer.includes(flag))
}

export function hasSuicidalIdeation(a: EngineAnswers): boolean {
  return a.safety_flags.includes('suicidal_ideation')
}
