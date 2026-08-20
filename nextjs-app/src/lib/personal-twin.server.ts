import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import { QUIT_PLAN_TABLE, type StoredFollowupResponse } from '@/lib/quit-engine/store.server'
import type { StoredQuitPlan } from '@/lib/quit-engine/types'

const region = process.env.AWS_REGION || 'eu-west-2'
const documentClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region }), {
  marshallOptions: { removeUndefinedValues: true },
})

export const PERSONAL_TWIN_SCHEMA_VERSION = 1

export interface PersonalTwinState {
  schema_version: number
  updated_at: string
  language?: 'ar' | 'en'
  current_plan_id?: string
  current_plan_created_at?: string
  product_types?: string[]
  mixed_use?: boolean
  triggers?: string[]
  importance_score?: number
  confidence_score?: number
  readiness_score?: number
  personal_reasons?: string[]
  previous_quit_attempts?: string | number | null
  relapse_causes?: string[]
  dependence_category?: string
  readiness_category?: string
  support_intensity?: string
  referral_needed?: boolean
  safety_immediate?: boolean
  first_24h_step?: string
  followups?: Record<string, {
    outcome: string
    craving_score: number
    confidence_score: number
    adaptation_key: string
    responded_at: string
  }>
}

const twinKey = (userSub: string) => ({ PK: `USER#${userSub}`, SK: 'TWIN#CURRENT' })

export async function getPersonalTwin(userSub: string): Promise<PersonalTwinState | null> {
  const result = await documentClient.send(new GetCommand({
    TableName: QUIT_PLAN_TABLE,
    Key: twinKey(userSub),
    ConsistentRead: true,
  }))
  if (!result.Item) return null

  const item = result.Item as Record<string, unknown>
  return {
    schema_version: Number(item.schema_version || PERSONAL_TWIN_SCHEMA_VERSION),
    updated_at: String(item.updated_at || ''),
    language: item.language === 'en' ? 'en' : item.language === 'ar' ? 'ar' : undefined,
    current_plan_id: typeof item.current_plan_id === 'string' ? item.current_plan_id : undefined,
    current_plan_created_at: typeof item.current_plan_created_at === 'string' ? item.current_plan_created_at : undefined,
    product_types: Array.isArray(item.product_types) ? item.product_types.map(String) : undefined,
    mixed_use: typeof item.mixed_use === 'boolean' ? item.mixed_use : undefined,
    triggers: Array.isArray(item.triggers) ? item.triggers.map(String) : undefined,
    importance_score: typeof item.importance_score === 'number' ? item.importance_score : undefined,
    confidence_score: typeof item.confidence_score === 'number' ? item.confidence_score : undefined,
    readiness_score: typeof item.readiness_score === 'number' ? item.readiness_score : undefined,
    personal_reasons: Array.isArray(item.personal_reasons) ? item.personal_reasons.map(String) : undefined,
    previous_quit_attempts: typeof item.previous_quit_attempts === 'number' || typeof item.previous_quit_attempts === 'string' ? item.previous_quit_attempts : null,
    relapse_causes: Array.isArray(item.relapse_causes) ? item.relapse_causes.map(String) : undefined,
    dependence_category: typeof item.dependence_category === 'string' ? item.dependence_category : undefined,
    readiness_category: typeof item.readiness_category === 'string' ? item.readiness_category : undefined,
    support_intensity: typeof item.support_intensity === 'string' ? item.support_intensity : undefined,
    referral_needed: typeof item.referral_needed === 'boolean' ? item.referral_needed : undefined,
    safety_immediate: typeof item.safety_immediate === 'boolean' ? item.safety_immediate : undefined,
    first_24h_step: typeof item.first_24h_step === 'string' ? item.first_24h_step : undefined,
    followups: item.followups && typeof item.followups === 'object' ? item.followups as PersonalTwinState['followups'] : undefined,
  }
}

export async function updatePersonalTwinFromPlan({
  userSub,
  plan,
  lang,
}: {
  userSub: string
  plan: StoredQuitPlan
  lang: 'ar' | 'en'
}) {
  const existing = await getPersonalTwin(userSub)
  const now = new Date().toISOString()
  const a = plan.answers
  const r = plan.result

  const twin: PersonalTwinState = {
    ...existing,
    schema_version: PERSONAL_TWIN_SCHEMA_VERSION,
    updated_at: now,
    language: lang,
    current_plan_id: plan.plan_id,
    current_plan_created_at: plan.created_at,
    product_types: a.product_types,
    mixed_use: a.mixed_use,
    triggers: a.triggers,
    importance_score: a.importance_score,
    confidence_score: a.confidence_score,
    readiness_score: a.readiness_score,
    personal_reasons: a.personal_reasons,
    previous_quit_attempts: a.previous_quit_attempts ?? null,
    relapse_causes: a.relapse_causes,
    dependence_category: r.dependence_category,
    readiness_category: r.readiness_category,
    support_intensity: r.aqla_support_intensity,
    referral_needed: r.referral_needed,
    safety_immediate: r.safety_immediate,
    first_24h_step: r.first_24h_step,
  }

  await documentClient.send(new PutCommand({
    TableName: QUIT_PLAN_TABLE,
    Item: {
      ...twinKey(userSub),
      entity_type: 'aqla_personal_twin',
      ...twin,
    },
  }))

  return twin
}

export async function updatePersonalTwinFromFollowup({
  userSub,
  response,
}: {
  userSub: string
  response: StoredFollowupResponse
}) {
  const existing = await getPersonalTwin(userSub)
  const now = new Date().toISOString()
  const followups = { ...(existing?.followups ?? {}) }
  followups[response.followup_type] = {
    outcome: response.outcome,
    craving_score: response.craving_score,
    confidence_score: response.confidence_score,
    adaptation_key: response.adaptation_key,
    responded_at: response.responded_at,
  }

  const twin: PersonalTwinState = {
    ...(existing ?? { schema_version: PERSONAL_TWIN_SCHEMA_VERSION, updated_at: now }),
    schema_version: PERSONAL_TWIN_SCHEMA_VERSION,
    updated_at: now,
    confidence_score: response.confidence_score,
    followups,
  }

  await documentClient.send(new PutCommand({
    TableName: QUIT_PLAN_TABLE,
    Item: {
      ...twinKey(userSub),
      entity_type: 'aqla_personal_twin',
      ...twin,
    },
  }))

  return twin
}

export function personalTwinForAI(twin: PersonalTwinState | null) {
  if (!twin) return null
  return {
    schema_version: twin.schema_version,
    language: twin.language,
    current_plan_id: twin.current_plan_id,
    current_plan_created_at: twin.current_plan_created_at,
    products: twin.product_types,
    mixed_use: twin.mixed_use,
    triggers: twin.triggers,
    importance: twin.importance_score,
    confidence: twin.confidence_score,
    readiness: twin.readiness_score,
    personal_reasons: twin.personal_reasons,
    previous_attempts: twin.previous_quit_attempts,
    relapse_causes: twin.relapse_causes,
    dependence_category: twin.dependence_category,
    readiness_category: twin.readiness_category,
    support_intensity: twin.support_intensity,
    referral_needed: twin.referral_needed,
    first_24h_step: twin.first_24h_step,
    followups: twin.followups,
  }
}
