import { FOLLOWUP_POLICY_VERSION } from '@/lib/followup-policy'

export const AQLA_PLAN_SCHEMA_VERSION = 2
export const AQLA_ASSESSMENT_SCHEMA_VERSION = 1
export const AQLA_CLINICAL_RULE_VERSION = 'aqla-clinical-rules-2026-08-20'
export const AQLA_SCORING_RULE_VERSION = 'aqla-scoring-2026-08-20'
export const AQLA_AI_PROMPT_VERSION = 'aqla-plan-personalisation-v2'

export interface PlanProvenance {
  plan_schema_version: number
  assessment_schema_version: number
  clinical_rule_version: string
  scoring_rule_version: string
  followup_policy_version: number
  ai_prompt_version: string
}

export function currentPlanProvenance(): PlanProvenance {
  return {
    plan_schema_version: AQLA_PLAN_SCHEMA_VERSION,
    assessment_schema_version: AQLA_ASSESSMENT_SCHEMA_VERSION,
    clinical_rule_version: AQLA_CLINICAL_RULE_VERSION,
    scoring_rule_version: AQLA_SCORING_RULE_VERSION,
    followup_policy_version: FOLLOWUP_POLICY_VERSION,
    ai_prompt_version: AQLA_AI_PROMPT_VERSION,
  }
}
