import { PRODUCT_OPTIONS, SAFETY_OPTIONS, TRIGGER_OPTIONS } from './questions'
import type { EngineAnswers, FirstUseAfterWaking, ProductType, SafetyFlag, TriggerKey } from './types'

const productValues = new Set(PRODUCT_OPTIONS.map((o) => o.value))
const triggerValues = new Set(TRIGGER_OPTIONS.map((o) => o.value))
const safetyValues = new Set(SAFETY_OPTIONS.map((o) => o.value))
const wakingValues = new Set<FirstUseAfterWaking>(['lt_5', '6_30', '31_60', 'gt_60', 'not_daily'])
const cigs = new Set(['1_10', '11_20', '21_30', 'gt_30', 'not_daily'])
const shishaSessions = new Set(['lt_weekly', '1_2_week', '3_5_week', 'daily'])
const shishaDuration = new Set(['lt_30m', '30_60m', '1_2h', 'gt_2h'])
const vapePatterns = new Set(['few', 'frequent', 'all_day', 'morning_first', 'unknown'])
const pouchFrequency = new Set(['1_3', '4_8', 'gt_8', 'craving_only'])
const previousAttempts = new Set(['none', 'lt_24h', 'days', 'week_plus', 'month_plus', 'gt_3m_relapse'])
const relapseCauses = new Set(['craving', 'stress', 'friends', 'shisha', 'coffee', 'driving', 'after_meal', 'appetite_weight', 'low_mood', 'one_only', 'no_support', 'unknown'])
const personalReasons = new Set(['health', 'family', 'smell', 'money', 'faith', 'fitness', 'sleep_focus', 'procedure', 'pregnancy_child', 'freedom', 'loved_one', 'time'])

function asString(value: unknown, max = 120): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed.slice(0, max) : undefined
}

function score(value: unknown): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > 10) throw new Error('invalid_score')
  return value
}

function filtered<T extends string>(value: unknown, allowed: Set<T>, max: number): T[] {
  if (!Array.isArray(value)) return []
  const unique = Array.from(new Set(value.filter((v): v is T => typeof v === 'string' && allowed.has(v as T))))
  return unique.slice(0, max)
}

function allowedString<T extends string>(value: unknown, allowed: Set<T>): T | undefined {
  return typeof value === 'string' && allowed.has(value as T) ? value as T : undefined
}

export function validateEngineAnswers(input: unknown): EngineAnswers {
  if (!input || typeof input !== 'object') throw new Error('invalid_answers')
  const raw = input as Record<string, unknown>

  let products = filtered(raw.product_types, productValues, 7) as ProductType[]
  if (!products.length) throw new Error('product_required')

  const relapseOnly = products.includes('relapse_prevention')
  if (relapseOnly) products = ['relapse_prevention']
  const realProducts = products.filter((p) => p !== 'relapse_prevention')

  const waking = allowedString(raw.first_use_after_waking, wakingValues)
  if (!relapseOnly && !waking) throw new Error('first_use_required')

  const triggers = filtered(raw.triggers, triggerValues, 14) as TriggerKey[]
  if (!triggers.length) throw new Error('trigger_required')

  const previousQuitAttempts = allowedString(raw.previous_quit_attempts, previousAttempts)
  if (!previousQuitAttempts) throw new Error('previous_attempt_required')

  const reasons = filtered(raw.personal_reasons, personalReasons, 3)
  if (!reasons.length) throw new Error('personal_reason_required')

  const safetyFlags = filtered(raw.safety_flags, safetyValues, 11) as SafetyFlag[]
  if (!safetyFlags.length) throw new Error('safety_required')
  const sanitisedSafety = safetyFlags.includes('none') && safetyFlags.length > 1
    ? safetyFlags.filter((flag) => flag !== 'none')
    : safetyFlags

  const usesCigarettes = products.includes('cigarettes')
  const usesShisha = products.includes('shisha')
  const usesVape = products.includes('vape')
  const usesPouches = products.includes('pouches')

  const cigarettesPerDay = usesCigarettes ? allowedString(raw.cigarettes_per_day, cigs) : undefined
  const shishaSessionsPerWeek = usesShisha ? allowedString(raw.shisha_sessions_per_week, shishaSessions) : undefined
  const shishaSessionDuration = usesShisha ? allowedString(raw.shisha_session_duration, shishaDuration) : undefined
  const vapePattern = usesVape ? allowedString(raw.vape_pattern, vapePatterns) : undefined
  const nicotinePouchFrequency = usesPouches ? allowedString(raw.nicotine_pouch_frequency, pouchFrequency) : undefined

  if (usesCigarettes && !cigarettesPerDay) throw new Error('cigarettes_quantity_required')
  if (usesShisha && (!shishaSessionsPerWeek || !shishaSessionDuration)) throw new Error('shisha_quantity_required')
  if (usesVape && !vapePattern) throw new Error('vape_pattern_required')
  if (usesPouches && !nicotinePouchFrequency) throw new Error('pouch_frequency_required')

  const answers: EngineAnswers = {
    user_name: asString(raw.user_name),
    support_person_name: asString(raw.support_person_name),
    product_types: products,
    primary_product: realProducts[0] ?? 'relapse_prevention',
    mixed_use: realProducts.length > 1,
    relapse_prevention_mode: relapseOnly,
    first_use_after_waking: relapseOnly ? 'not_daily' : waking,
    cigarettes_per_day: cigarettesPerDay,
    shisha_sessions_per_week: shishaSessionsPerWeek,
    shisha_session_duration: shishaSessionDuration,
    vape_pattern: vapePattern,
    nicotine_pouch_frequency: nicotinePouchFrequency,
    triggers,
    importance_score: score(raw.importance_score),
    confidence_score: score(raw.confidence_score),
    readiness_score: score(raw.readiness_score),
    previous_quit_attempts: previousQuitAttempts,
    longest_abstinence: previousQuitAttempts,
    relapse_causes: previousQuitAttempts === 'none' ? [] : filtered(raw.relapse_causes, relapseCauses, 12),
    safety_flags: sanitisedSafety,
    personal_reasons: reasons,
  }

  return answers
}
