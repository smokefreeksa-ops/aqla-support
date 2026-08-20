import { createHash } from 'node:crypto'
import { listParticipants } from '@/lib/crm/participant.server'
import { getQuitPlan } from '@/lib/quit-engine/store.server'

export const RESEARCH_EXPORT_SCHEMA_VERSION = 1

export interface ResearchExportRow {
  participant_key: string
  plan_id: string
  plan_created_at: string
  product_types: string
  primary_product: string
  mixed_use: string
  first_use_after_waking: string
  cigarettes_per_day: string
  shisha_sessions_per_week: string
  shisha_session_duration: string
  vape_pattern: string
  nicotine_pouch_frequency: string
  triggers: string
  importance_score: string
  confidence_score: string
  readiness_score: string
  previous_quit_attempts: string
  relapse_causes: string
  personal_reasons: string
  hsi_score: string
  readiness_category: string
  dependence_category: string
  referral_needed: string
  plan_schema_version: string
  clinical_rule_version: string
  scoring_rule_version: string
  followup_policy_version: string
}

const HEADERS: (keyof ResearchExportRow)[] = [
  'participant_key','plan_id','plan_created_at','product_types','primary_product','mixed_use','first_use_after_waking','cigarettes_per_day',
  'shisha_sessions_per_week','shisha_session_duration','vape_pattern','nicotine_pouch_frequency','triggers','importance_score','confidence_score',
  'readiness_score','previous_quit_attempts','relapse_causes','personal_reasons','hsi_score','readiness_category','dependence_category','referral_needed',
  'plan_schema_version','clinical_rule_version','scoring_rule_version','followup_policy_version',
]

function pseudonym(value: string) {
  return `AQ-R-${createHash('sha256').update(`aqla-research-v1:${value}`).digest('hex').slice(0, 20)}`
}

function cell(value: unknown) {
  if (value === undefined || value === null) return ''
  if (Array.isArray(value)) return value.map(String).join('|')
  return String(value)
}

function csvEscape(value: string) {
  if (/[",\n\r]/.test(value)) return `"${value.replaceAll('"','""')}"`
  return value
}

export async function buildResearchExportBatch({ cursor, limit = 200 }: { cursor?: string; limit?: number } = {}) {
  const safeLimit = Math.max(1, Math.min(500, Math.floor(limit)))
  const page = await listParticipants({ cursor, limit: safeLimit })
  const rows: ResearchExportRow[] = []

  for (const participant of page.participants) {
    if (!participant.latest_plan_id) continue
    const plan = await getQuitPlan(participant.user_sub, participant.latest_plan_id)
    if (!plan) continue
    const a = plan.answers
    const r = plan.result
    rows.push({
      participant_key: pseudonym(participant.user_sub),
      plan_id: pseudonym(plan.plan_id),
      plan_created_at: plan.created_at,
      product_types: cell(a.product_types),
      primary_product: cell(a.primary_product),
      mixed_use: cell(a.mixed_use),
      first_use_after_waking: cell(a.first_use_after_waking),
      cigarettes_per_day: cell(a.cigarettes_per_day),
      shisha_sessions_per_week: cell(a.shisha_sessions_per_week),
      shisha_session_duration: cell(a.shisha_session_duration),
      vape_pattern: cell(a.vape_pattern),
      nicotine_pouch_frequency: cell(a.nicotine_pouch_frequency),
      triggers: cell(a.triggers),
      importance_score: cell(a.importance_score),
      confidence_score: cell(a.confidence_score),
      readiness_score: cell(a.readiness_score),
      previous_quit_attempts: cell(a.previous_quit_attempts),
      relapse_causes: cell(a.relapse_causes),
      personal_reasons: cell(a.personal_reasons),
      hsi_score: cell(r.hsi_score),
      readiness_category: cell(r.readiness_category),
      dependence_category: cell(r.dependence_category),
      referral_needed: cell(r.referral_needed),
      plan_schema_version: cell(plan.provenance?.plan_schema_version),
      clinical_rule_version: cell(plan.provenance?.clinical_rule_version),
      scoring_rule_version: cell(plan.provenance?.scoring_rule_version),
      followup_policy_version: cell(plan.provenance?.followup_policy_version),
    })
  }

  const csv = [HEADERS.join(','), ...rows.map(row => HEADERS.map(header => csvEscape(row[header])).join(','))].join('\n')
  return { csv, rows: rows.length, nextCursor: page.next_cursor }
}
