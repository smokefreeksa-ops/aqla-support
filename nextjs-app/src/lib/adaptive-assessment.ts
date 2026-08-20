import { scoreOralNicotineAdapted, scorePennStateEcig } from '@/lib/research/instruments'
import { computeHSI, requiresReferral, hasSuicidalIdeation } from '@/lib/quit-engine/scoring'
import type { EngineAnswers, ProductType } from '@/lib/quit-engine/types'
import type { PersonalPlanV2Answers } from '@/lib/personal-plan-v2'

export type VapeDeviceType = 'disposable' | 'pod' | 'refillable' | 'other' | 'not_sure'
export type VapeUrgeStrength = 'none_or_slight' | 'moderate_or_strong' | 'very_or_extremely_strong'

export interface VapeAdaptiveAnswers {
  device_type?: VapeDeviceType
  nicotine_strength_mg_ml?: number
  times_per_day?: number
  minutes_after_waking?: number
  awakens_at_night?: boolean
  nights_per_week?: number
  hard_to_quit?: boolean
  strong_cravings?: boolean
  urge_strength?: VapeUrgeStrength
  hard_to_refrain_where_not_allowed?: boolean
  irritable_when_unable?: boolean
  nervous_restless_anxious_when_unable?: boolean
}

export interface PouchAdaptiveAnswers {
  brand?: string
  strength_mg_per_pouch?: number
  pouches_per_day?: number
  uses_multiple_at_once?: boolean
  changes_strength?: boolean
  night_use?: boolean
  strong_cravings?: boolean
  hard_to_cut_down?: boolean
  irritable_when_unable?: boolean
  uses_more_than_intended?: boolean
}

export interface AdaptiveAssessmentAnswers {
  schema_version: 1
  dominant_product?: ProductType
  substitutes_between_products?: boolean
  vape?: VapeAdaptiveAnswers
  pouches?: PouchAdaptiveAnswers
}

export type TriageLevel = 'low' | 'moderate' | 'high' | 'complex'
export type BehaviouralLevel = 'low' | 'moderate' | 'high'
export type SupportNeed = 'standard' | 'enhanced' | 'professional'
export type SafetyTrack = 'routine' | 'professional_review' | 'immediate_safety'
export type FollowupFocus = 'maintain' | 'mixed_use' | 'cravings' | 'triggers' | 'confidence' | 'reduction' | 'general'

export interface ProductMeasureResult {
  product: 'cigarettes' | 'vape' | 'pouches'
  instrument: 'HSI' | 'PSECDI' | 'AQla oral nicotine adapted screen'
  score: number
  category: string
  validated: boolean
  note: string
}

export interface AdaptiveTriageProfile {
  schema_version: 1
  primary_product: ProductType
  nicotine_exposure: TriageLevel
  behavioural_pattern: BehaviouralLevel
  mixed_product_complexity: 'single' | 'mixed' | 'mixed_with_substitution'
  readiness: 'high' | 'moderate' | 'low'
  confidence: 'high' | 'moderate' | 'low'
  relapse_vulnerability: BehaviouralLevel
  support_need: SupportNeed
  safety_track: SafetyTrack
  followup_focus: FollowupFocus
  product_measures: ProductMeasureResult[]
  profile_labels_ar: string[]
  profile_labels_en: string[]
}

export const VAPE_DEVICE_OPTIONS = [
  { value: 'disposable', ar: 'فيب أحادي الاستخدام', en: 'Disposable vape' },
  { value: 'pod', ar: 'جهاز بود', en: 'Pod device' },
  { value: 'refillable', ar: 'جهاز قابل لإعادة التعبئة', en: 'Refillable device' },
  { value: 'other', ar: 'نوع آخر', en: 'Another type' },
  { value: 'not_sure', ar: 'لست متأكدًا', en: 'I am not sure' },
] as const

export const VAPE_URGE_OPTIONS = [
  { value: 'none_or_slight', ar: 'لا توجد أو خفيفة', en: 'None or slight' },
  { value: 'moderate_or_strong', ar: 'متوسطة أو قوية', en: 'Moderate or strong' },
  { value: 'very_or_extremely_strong', ar: 'قوية جدًا أو شديدة للغاية', en: 'Very or extremely strong' },
] as const

export const DOMINANT_PRODUCT_OPTIONS = [
  { value: 'cigarettes', ar: 'السجائر', en: 'Cigarettes' },
  { value: 'shisha', ar: 'الشيشة', en: 'Shisha / waterpipe' },
  { value: 'vape', ar: 'الفيب / السيجارة الإلكترونية', en: 'Vape / e-cigarette' },
  { value: 'heated_tobacco', ar: 'التبغ المسخن', en: 'Heated tobacco' },
  { value: 'pouches', ar: 'أكياس النيكوتين', en: 'Nicotine pouches' },
  { value: 'smokeless', ar: 'تبغ غير مدخن', en: 'Smokeless tobacco' },
] as const

const deviceValues = new Set<VapeDeviceType>(['disposable', 'pod', 'refillable', 'other', 'not_sure'])
const urgeValues = new Set<VapeUrgeStrength>(['none_or_slight', 'moderate_or_strong', 'very_or_extremely_strong'])
const productValues = new Set<ProductType>(['cigarettes', 'shisha', 'vape', 'heated_tobacco', 'pouches', 'smokeless', 'relapse_prevention'])

function numberValue(value: unknown, min: number, max: number): number | undefined {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Number(value) : NaN
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) return undefined
  return Math.round(parsed * 100) / 100
}

function booleanValue(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined
}

function shortText(value: unknown, max = 80): string | undefined {
  if (typeof value !== 'string') return undefined
  const text = value.trim().slice(0, max)
  return text || undefined
}

export function validateAdaptiveAssessment(input: unknown, base: EngineAnswers): AdaptiveAssessmentAnswers {
  const raw = input && typeof input === 'object' ? input as Record<string, unknown> : {}
  const rawVape = raw.vape && typeof raw.vape === 'object' ? raw.vape as Record<string, unknown> : {}
  const rawPouch = raw.pouches && typeof raw.pouches === 'object' ? raw.pouches as Record<string, unknown> : {}

  const dominant = typeof raw.dominant_product === 'string' && productValues.has(raw.dominant_product as ProductType) && base.product_types.includes(raw.dominant_product as ProductType)
    ? raw.dominant_product as ProductType
    : undefined

  const vape: VapeAdaptiveAnswers | undefined = base.product_types.includes('vape') ? {
    device_type: typeof rawVape.device_type === 'string' && deviceValues.has(rawVape.device_type as VapeDeviceType) ? rawVape.device_type as VapeDeviceType : undefined,
    nicotine_strength_mg_ml: numberValue(rawVape.nicotine_strength_mg_ml, 0, 100),
    times_per_day: numberValue(rawVape.times_per_day, 0, 500),
    minutes_after_waking: numberValue(rawVape.minutes_after_waking, 0, 1440),
    awakens_at_night: booleanValue(rawVape.awakens_at_night),
    nights_per_week: numberValue(rawVape.nights_per_week, 0, 7),
    hard_to_quit: booleanValue(rawVape.hard_to_quit),
    strong_cravings: booleanValue(rawVape.strong_cravings),
    urge_strength: typeof rawVape.urge_strength === 'string' && urgeValues.has(rawVape.urge_strength as VapeUrgeStrength) ? rawVape.urge_strength as VapeUrgeStrength : undefined,
    hard_to_refrain_where_not_allowed: booleanValue(rawVape.hard_to_refrain_where_not_allowed),
    irritable_when_unable: booleanValue(rawVape.irritable_when_unable),
    nervous_restless_anxious_when_unable: booleanValue(rawVape.nervous_restless_anxious_when_unable),
  } : undefined

  const pouches: PouchAdaptiveAnswers | undefined = base.product_types.includes('pouches') ? {
    brand: shortText(rawPouch.brand),
    strength_mg_per_pouch: numberValue(rawPouch.strength_mg_per_pouch, 0, 100),
    pouches_per_day: numberValue(rawPouch.pouches_per_day, 0, 100),
    uses_multiple_at_once: booleanValue(rawPouch.uses_multiple_at_once),
    changes_strength: booleanValue(rawPouch.changes_strength),
    night_use: booleanValue(rawPouch.night_use),
    strong_cravings: booleanValue(rawPouch.strong_cravings),
    hard_to_cut_down: booleanValue(rawPouch.hard_to_cut_down),
    irritable_when_unable: booleanValue(rawPouch.irritable_when_unable),
    uses_more_than_intended: booleanValue(rawPouch.uses_more_than_intended),
  } : undefined

  return {
    schema_version: 1,
    dominant_product: dominant,
    substitutes_between_products: base.mixed_use ? booleanValue(raw.substitutes_between_products) : undefined,
    vape,
    pouches,
  }
}

function completeVapeMeasure(vape?: VapeAdaptiveAnswers) {
  return Boolean(vape
    && vape.times_per_day !== undefined
    && vape.minutes_after_waking !== undefined
    && vape.awakens_at_night !== undefined
    && (vape.awakens_at_night === false || vape.nights_per_week !== undefined)
    && vape.hard_to_quit !== undefined
    && vape.strong_cravings !== undefined
    && vape.urge_strength
    && vape.hard_to_refrain_where_not_allowed !== undefined
    && vape.irritable_when_unable !== undefined
    && vape.nervous_restless_anxious_when_unable !== undefined)
}

function vapeMeasure(vape?: VapeAdaptiveAnswers): ProductMeasureResult | undefined {
  if (!completeVapeMeasure(vape) || !vape) return undefined
  const result = scorePennStateEcig({
    timesPerDay: vape.times_per_day!,
    minutesAfterWaking: vape.minutes_after_waking!,
    awakensAtNight: vape.awakens_at_night!,
    nightsPerWeek: vape.awakens_at_night ? vape.nights_per_week! : 0,
    hardToQuit: vape.hard_to_quit!,
    strongCravings: vape.strong_cravings!,
    urgeStrength: vape.urge_strength!,
    hardToRefrainWhereNotAllowed: vape.hard_to_refrain_where_not_allowed!,
    irritableWhenUnable: vape.irritable_when_unable!,
    nervousRestlessAnxiousWhenUnable: vape.nervous_restless_anxious_when_unable!,
  })
  return {
    product: 'vape',
    instrument: 'PSECDI',
    score: result.total,
    category: result.category,
    validated: true,
    note: 'Penn State Electronic Cigarette Dependence Index; score supports assessment and is not a diagnosis.',
  }
}

function pouchMeasure(base: EngineAnswers, pouch?: PouchAdaptiveAnswers): ProductMeasureResult | undefined {
  if (!pouch) return undefined
  const early = base.first_use_after_waking === 'lt_5' || base.first_use_after_waking === '6_30'
  const items = [
    early,
    pouch.night_use,
    pouch.strong_cravings,
    pouch.hard_to_cut_down,
    pouch.irritable_when_unable,
    pouch.uses_more_than_intended,
  ]
  if (items.some((value) => value === undefined)) return undefined
  const result = scoreOralNicotineAdapted(items as [boolean, boolean, boolean, boolean, boolean, boolean])
  return {
    product: 'pouches',
    instrument: 'AQla oral nicotine adapted screen',
    score: result.positiveCount,
    category: result.category,
    validated: false,
    note: 'AQla adapted oral-nicotine screen; explicitly non-validated and not a diagnosis.',
  }
}

function cigaretteMeasure(base: EngineAnswers): ProductMeasureResult | undefined {
  const score = computeHSI(base)
  if (score === undefined) return undefined
  const category = score <= 1 ? 'low' : score <= 3 ? 'moderate' : 'high'
  return {
    product: 'cigarettes',
    instrument: 'HSI',
    score,
    category,
    validated: true,
    note: 'Heaviness of Smoking Index for cigarette use; screening indicator, not a diagnosis.',
  }
}

function highestExposure(measures: ProductMeasureResult[], base: EngineAnswers, adaptive: AdaptiveAssessmentAnswers): TriageLevel {
  if (base.mixed_use) return 'complex'
  const high = measures.some((item) => item.category === 'high')
  if (high) return 'high'
  const moderate = measures.some((item) => item.category === 'moderate' || item.category === 'medium')
  if (moderate) return 'moderate'
  if (base.vape_pattern === 'all_day' || base.vape_pattern === 'morning_first' || base.nicotine_pouch_frequency === 'gt_8') return 'high'
  if ((adaptive.pouches?.pouches_per_day ?? 0) >= 8) return 'high'
  return 'low'
}

function behaviouralLevel(base: EngineAnswers, v2: PersonalPlanV2Answers): BehaviouralLevel {
  const triggerCount = base.triggers.length + v2.additional_triggers.filter((item) => item !== 'not_sure').length
  if (triggerCount >= 5 || base.vape_pattern === 'all_day') return 'high'
  if (triggerCount >= 2) return 'moderate'
  return 'low'
}

function relapseLevel(base: EngineAnswers): BehaviouralLevel {
  if (base.previous_quit_attempts === 'lt_24h' || base.relapse_causes.length >= 3 || base.safety_flags.includes('repeated_failure')) return 'high'
  if (base.previous_quit_attempts && base.previous_quit_attempts !== 'none') return 'moderate'
  return 'low'
}

function scoreBand(value: number): 'high' | 'moderate' | 'low' {
  return value >= 7 ? 'high' : value >= 4 ? 'moderate' : 'low'
}

export function buildAdaptiveTriage(base: EngineAnswers, v2: PersonalPlanV2Answers, adaptive: AdaptiveAssessmentAnswers): AdaptiveTriageProfile {
  const realProducts = base.product_types.filter((item) => item !== 'relapse_prevention')
  const primary = adaptive.dominant_product && realProducts.includes(adaptive.dominant_product)
    ? adaptive.dominant_product
    : base.primary_product ?? realProducts[0] ?? 'relapse_prevention'

  const measures = [
    base.product_types.includes('cigarettes') ? cigaretteMeasure(base) : undefined,
    base.product_types.includes('vape') ? vapeMeasure(adaptive.vape) : undefined,
    base.product_types.includes('pouches') ? pouchMeasure(base, adaptive.pouches) : undefined,
  ].filter((item): item is ProductMeasureResult => Boolean(item))

  const exposure = highestExposure(measures, base, adaptive)
  const behavioural = behaviouralLevel(base, v2)
  const relapse = relapseLevel(base)
  const safetyTrack: SafetyTrack = hasSuicidalIdeation(base) ? 'immediate_safety' : requiresReferral(base) ? 'professional_review' : 'routine'
  const confidence = scoreBand(base.confidence_score)
  const readiness = scoreBand(base.readiness_score)
  const mixedComplexity = !base.mixed_use ? 'single' : adaptive.substitutes_between_products ? 'mixed_with_substitution' : 'mixed'

  const supportNeed: SupportNeed = safetyTrack === 'professional_review' || safetyTrack === 'immediate_safety'
    ? 'professional'
    : exposure === 'high' || exposure === 'complex' || behavioural === 'high' || relapse === 'high' || confidence === 'low'
      ? 'enhanced'
      : 'standard'

  const followupFocus: FollowupFocus = v2.change_goal_type === 'maintain_abstinence'
    ? 'maintain'
    : base.mixed_use
      ? 'mixed_use'
      : v2.change_goal_type === 'reduce'
        ? 'reduction'
        : relapse === 'high' || exposure === 'high'
          ? 'cravings'
          : behavioural === 'high'
            ? 'triggers'
            : confidence === 'low'
              ? 'confidence'
              : 'general'

  const ar: string[] = []
  const en: string[] = []
  if (base.mixed_use) { ar.push('استخدام متعدد المنتجات'); en.push('Multiple-product nicotine use') }
  if (adaptive.substitutes_between_products) { ar.push('استبدال منتج بآخر عند عدم توفره'); en.push('Substitution between nicotine products') }
  if (exposure === 'high' || exposure === 'complex') { ar.push('نمط تعرض للنيكوتين يحتاج دعمًا أقوى'); en.push('Nicotine-exposure pattern needing stronger support') }
  if (behavioural === 'high') { ar.push('محفزات وروتين متكرر'); en.push('Strong trigger/routine pattern') }
  if (confidence === 'low') { ar.push('الثقة الحالية منخفضة وتحتاج خطوات أصغر'); en.push('Current confidence is low; smaller steps may help') }
  if (relapse === 'high') { ar.push('قابلية أعلى للرجوع وفق المحاولات السابقة'); en.push('Higher return-to-use vulnerability from previous attempts') }
  if (!ar.length) { ar.push('مسار دعم اعتيادي قابل للتخصيص'); en.push('Standard personalised support pathway') }

  return {
    schema_version: 1,
    primary_product: primary,
    nicotine_exposure: exposure,
    behavioural_pattern: behavioural,
    mixed_product_complexity: mixedComplexity,
    readiness,
    confidence,
    relapse_vulnerability: relapse,
    support_need: supportNeed,
    safety_track: safetyTrack,
    followup_focus: followupFocus,
    product_measures: measures,
    profile_labels_ar: ar,
    profile_labels_en: en,
  }
}

export function adaptiveAssessmentComplete(base: EngineAnswers, adaptive: AdaptiveAssessmentAnswers): boolean {
  if (base.mixed_use && !adaptive.dominant_product) return false
  if (base.product_types.includes('vape')) {
    const vape = adaptive.vape
    if (!vape?.device_type || vape.times_per_day === undefined || vape.minutes_after_waking === undefined || vape.awakens_at_night === undefined || vape.hard_to_quit === undefined || vape.strong_cravings === undefined || !vape.urge_strength || vape.hard_to_refrain_where_not_allowed === undefined || vape.irritable_when_unable === undefined || vape.nervous_restless_anxious_when_unable === undefined) return false
    if (vape.awakens_at_night && vape.nights_per_week === undefined) return false
  }
  if (base.product_types.includes('pouches')) {
    const pouch = adaptive.pouches
    if (pouch?.pouches_per_day === undefined || pouch.night_use === undefined || pouch.strong_cravings === undefined || pouch.hard_to_cut_down === undefined || pouch.irritable_when_unable === undefined || pouch.uses_more_than_intended === undefined) return false
  }
  return true
}
