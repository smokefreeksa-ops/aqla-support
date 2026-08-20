import type { DependenceCategory, EngineAnswers, ReadinessCategory, SafetyFlag, TriggerKey } from './types'

export function computeHSI(a: EngineAnswers): number | undefined {
  if (!a.product_types.includes('cigarettes')) return undefined
  if (!a.cigarettes_per_day || a.cigarettes_per_day === 'not_daily') return undefined

  const time = a.first_use_after_waking === 'lt_5' ? 3
    : a.first_use_after_waking === '6_30' ? 2
      : a.first_use_after_waking === '31_60' ? 1
        : 0

  const cpd = a.cigarettes_per_day === '11_20' ? 1
    : a.cigarettes_per_day === '21_30' ? 2
      : a.cigarettes_per_day === 'gt_30' ? 3
        : 0

  return time + cpd
}

/**
 * Aqla support-intensity heuristic.
 * This is deliberately NOT a validated dependence instrument.
 * It only helps Aqla choose how much behavioural support to surface.
 */
export function computeAqlaSupportIntensity(a: EngineAnswers): number {
  let score = 0
  const realProducts = a.product_types.filter((p) => p !== 'relapse_prevention')

  if (a.first_use_after_waking === 'lt_5' || a.first_use_after_waking === '6_30') score += 1

  const highFrequency =
    a.cigarettes_per_day === '21_30' ||
    a.cigarettes_per_day === 'gt_30' ||
    a.shisha_sessions_per_week === 'daily' ||
    a.vape_pattern === 'all_day' ||
    a.vape_pattern === 'morning_first' ||
    a.nicotine_pouch_frequency === 'gt_8'
  if (highFrequency) score += 2

  if (realProducts.length > 1 || a.mixed_use) score += 2
  if (a.triggers.includes('stress') || a.triggers.includes('anxiety')) score += 1
  if (a.previous_quit_attempts && !['none', 'gt_3m_relapse'].includes(a.previous_quit_attempts)) score += 1
  if (a.previous_quit_attempts === 'lt_24h') score += 1
  if (a.relapse_causes.includes('craving') || a.relapse_causes.includes('stress')) score += 1
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
  return a.triggers.map((trigger) => labels[trigger])
}

export function requiresReferral(a: EngineAnswers): boolean {
  const refer: SafetyFlag[] = [
    'pregnancy',
    'under_18',
    'cardiac',
    'respiratory',
    'medications',
    'mental_health',
    'seizures',
    'high_mixed_use',
    'repeated_failure',
  ]
  return a.safety_flags.some((flag) => refer.includes(flag))
}

export function hasSuicidalIdeation(a: EngineAnswers): boolean {
  return a.safety_flags.includes('suicidal_ideation')
}
