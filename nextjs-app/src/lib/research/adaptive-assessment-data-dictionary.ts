export type AdaptiveDataClass = 'clinical' | 'behavioural' | 'operational' | 'derived'

export interface AdaptiveDictionaryEntry {
  variable: string
  labelEn: string
  type: 'string' | 'number' | 'boolean' | 'enum' | 'string[]'
  dataClass: AdaptiveDataClass
  required: boolean
  researchEligible: boolean
  identifiableOrSensitive: boolean
  purpose: string
  notes?: string
}

export const ADAPTIVE_ASSESSMENT_DATA_DICTIONARY_VERSION = 1

export const ADAPTIVE_ASSESSMENT_DATA_DICTIONARY: AdaptiveDictionaryEntry[] = [
  { variable: 'adaptive_assessment.dominant_product', labelEn: 'Dominant/priority nicotine product', type: 'enum', dataClass: 'clinical', required: false, researchEligible: true, identifiableOrSensitive: true, purpose: 'Prioritise mixed-product cessation support' },
  { variable: 'adaptive_assessment.substitutes_between_products', labelEn: 'Substitution between nicotine products', type: 'boolean', dataClass: 'behavioural', required: false, researchEligible: true, identifiableOrSensitive: true, purpose: 'Detect cross-product substitution in mixed use' },
  { variable: 'adaptive_assessment.vape.device_type', labelEn: 'Vape device type', type: 'enum', dataClass: 'behavioural', required: false, researchEligible: true, identifiableOrSensitive: true, purpose: 'Product-specific vaping context' },
  { variable: 'adaptive_assessment.vape.nicotine_strength_mg_ml', labelEn: 'Vape nicotine strength (mg/mL)', type: 'number', dataClass: 'clinical', required: false, researchEligible: true, identifiableOrSensitive: true, purpose: 'Describe nicotine-product exposure without estimating an unreported value' },
  { variable: 'adaptive_assessment.vape.times_per_day', labelEn: 'Vape use frequency per day', type: 'number', dataClass: 'clinical', required: false, researchEligible: true, identifiableOrSensitive: true, purpose: 'PSECDI scoring when the complete validated instrument is collected' },
  { variable: 'adaptive_assessment.vape.minutes_after_waking', labelEn: 'Minutes after waking to first vape', type: 'number', dataClass: 'clinical', required: false, researchEligible: true, identifiableOrSensitive: true, purpose: 'PSECDI scoring' },
  { variable: 'adaptive_assessment.vape.awakens_at_night', labelEn: 'Wakes at night to vape', type: 'boolean', dataClass: 'clinical', required: false, researchEligible: true, identifiableOrSensitive: true, purpose: 'PSECDI scoring' },
  { variable: 'adaptive_assessment.vape.nights_per_week', labelEn: 'Nights per week waking to vape', type: 'number', dataClass: 'clinical', required: false, researchEligible: true, identifiableOrSensitive: true, purpose: 'PSECDI scoring' },
  { variable: 'adaptive_assessment.vape.hard_to_quit', labelEn: 'Finds vaping hard to quit', type: 'boolean', dataClass: 'clinical', required: false, researchEligible: true, identifiableOrSensitive: true, purpose: 'PSECDI scoring' },
  { variable: 'adaptive_assessment.vape.strong_cravings', labelEn: 'Strong vaping cravings', type: 'boolean', dataClass: 'clinical', required: false, researchEligible: true, identifiableOrSensitive: true, purpose: 'PSECDI scoring and adaptive follow-up focus' },
  { variable: 'adaptive_assessment.vape.urge_strength', labelEn: 'Vaping urge strength', type: 'enum', dataClass: 'clinical', required: false, researchEligible: true, identifiableOrSensitive: true, purpose: 'PSECDI scoring' },
  { variable: 'adaptive_assessment.vape.hard_to_refrain_where_not_allowed', labelEn: 'Difficulty refraining from vaping where prohibited', type: 'boolean', dataClass: 'clinical', required: false, researchEligible: true, identifiableOrSensitive: true, purpose: 'PSECDI scoring' },
  { variable: 'adaptive_assessment.vape.irritable_when_unable', labelEn: 'Irritable when unable to vape', type: 'boolean', dataClass: 'clinical', required: false, researchEligible: true, identifiableOrSensitive: true, purpose: 'PSECDI scoring' },
  { variable: 'adaptive_assessment.vape.nervous_restless_anxious_when_unable', labelEn: 'Nervous/restless/anxious when unable to vape', type: 'boolean', dataClass: 'clinical', required: false, researchEligible: true, identifiableOrSensitive: true, purpose: 'PSECDI scoring' },
  { variable: 'adaptive_assessment.pouches.brand', labelEn: 'Nicotine pouch brand/product', type: 'string', dataClass: 'behavioural', required: false, researchEligible: false, identifiableOrSensitive: true, purpose: 'Participant-facing product context', notes: 'Excluded from default research export; product names can change and may create unnecessary commercial detail.' },
  { variable: 'adaptive_assessment.pouches.strength_mg_per_pouch', labelEn: 'Nicotine strength per pouch (mg)', type: 'number', dataClass: 'clinical', required: false, researchEligible: true, identifiableOrSensitive: true, purpose: 'Pouch-specific exposure context' },
  { variable: 'adaptive_assessment.pouches.pouches_per_day', labelEn: 'Pouches used per day', type: 'number', dataClass: 'clinical', required: false, researchEligible: true, identifiableOrSensitive: true, purpose: 'Pouch-specific exposure context and triage' },
  { variable: 'adaptive_assessment.pouches.uses_multiple_at_once', labelEn: 'Uses multiple pouches at once', type: 'boolean', dataClass: 'clinical', required: false, researchEligible: true, identifiableOrSensitive: true, purpose: 'Pouch-use complexity and safety context' },
  { variable: 'adaptive_assessment.pouches.changes_strength', labelEn: 'Switches between pouch strengths', type: 'boolean', dataClass: 'behavioural', required: false, researchEligible: true, identifiableOrSensitive: true, purpose: 'Pouch-use pattern context' },
  { variable: 'adaptive_assessment.pouches.night_use', labelEn: 'Night-time pouch use', type: 'boolean', dataClass: 'clinical', required: false, researchEligible: true, identifiableOrSensitive: true, purpose: 'AQla adapted oral-nicotine screen; non-validated' },
  { variable: 'adaptive_assessment.pouches.strong_cravings', labelEn: 'Strong pouch cravings', type: 'boolean', dataClass: 'clinical', required: false, researchEligible: true, identifiableOrSensitive: true, purpose: 'AQla adapted oral-nicotine screen; non-validated' },
  { variable: 'adaptive_assessment.pouches.hard_to_cut_down', labelEn: 'Difficulty cutting down pouches', type: 'boolean', dataClass: 'clinical', required: false, researchEligible: true, identifiableOrSensitive: true, purpose: 'AQla adapted oral-nicotine screen; non-validated' },
  { variable: 'adaptive_assessment.pouches.irritable_when_unable', labelEn: 'Irritable when unable to use pouch', type: 'boolean', dataClass: 'clinical', required: false, researchEligible: true, identifiableOrSensitive: true, purpose: 'AQla adapted oral-nicotine screen; non-validated' },
  { variable: 'adaptive_assessment.pouches.uses_more_than_intended', labelEn: 'Uses more pouches than intended', type: 'boolean', dataClass: 'clinical', required: false, researchEligible: true, identifiableOrSensitive: true, purpose: 'AQla adapted oral-nicotine screen; non-validated' },
  { variable: 'result.adaptive_triage.nicotine_exposure', labelEn: 'Adaptive nicotine exposure level', type: 'enum', dataClass: 'derived', required: true, researchEligible: false, identifiableOrSensitive: true, purpose: 'Operational support routing', notes: 'Internal triage dimension; not a validated cross-product diagnosis.' },
  { variable: 'result.adaptive_triage.behavioural_pattern', labelEn: 'Adaptive behavioural trigger level', type: 'enum', dataClass: 'derived', required: true, researchEligible: false, identifiableOrSensitive: true, purpose: 'Operational support routing' },
  { variable: 'result.adaptive_triage.relapse_vulnerability', labelEn: 'Adaptive return-to-use vulnerability', type: 'enum', dataClass: 'derived', required: true, researchEligible: false, identifiableOrSensitive: true, purpose: 'Operational support routing' },
  { variable: 'result.adaptive_triage.support_need', labelEn: 'Adaptive support-need level', type: 'enum', dataClass: 'derived', required: true, researchEligible: false, identifiableOrSensitive: true, purpose: 'Operational support routing; deterministic safety still takes priority' },
  { variable: 'result.adaptive_triage.followup_focus', labelEn: 'Secure follow-up focus', type: 'enum', dataClass: 'derived', required: true, researchEligible: false, identifiableOrSensitive: true, purpose: 'Tailor authenticated follow-up after email click without exposing health detail in email' },
  { variable: 'result.adaptive_triage.product_measures', labelEn: 'Product-specific instrument results', type: 'string[]', dataClass: 'derived', required: false, researchEligible: false, identifiableOrSensitive: true, purpose: 'Participant/clinical interpretation and support routing', notes: 'Includes validated HSI/PSECDI only when required inputs are complete; pouch screen remains explicitly non-validated.' },
]
