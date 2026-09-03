import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import { QUIT_PLAN_TABLE } from '@/lib/quit-engine/store.server'
import type { AdaptiveAssessmentAnswers, AdaptiveTriageProfile } from '@/lib/adaptive-assessment'

const region = process.env.AWS_REGION || 'eu-west-2'
const documentClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region }), {
  marshallOptions: { removeUndefinedValues: true },
})

export const ADAPTIVE_TRIAGE_SCHEMA_VERSION = 1

export interface StoredAdaptiveTriageContext {
  schema_version: 1
  updated_at: string
  plan_id: string
  assessment: AdaptiveAssessmentAnswers
  triage: AdaptiveTriageProfile
}

export async function saveAdaptiveTriageContext({
  userSub,
  planId,
  assessment,
  triage,
}: {
  userSub: string
  planId: string
  assessment: AdaptiveAssessmentAnswers
  triage: AdaptiveTriageProfile
}) {
  const item: StoredAdaptiveTriageContext = {
    schema_version: ADAPTIVE_TRIAGE_SCHEMA_VERSION,
    updated_at: new Date().toISOString(),
    plan_id: planId,
    assessment,
    triage,
  }

  await documentClient.send(new PutCommand({
    TableName: QUIT_PLAN_TABLE,
    Item: {
      PK: `USER#${userSub}`,
      SK: 'TWIN#ADAPTIVE_TRIAGE',
      entity_type: 'aqla_adaptive_triage_context',
      ...item,
    },
  }))

  return item
}

export async function getAdaptiveTriageContext(userSub: string): Promise<StoredAdaptiveTriageContext | null> {
  const response = await documentClient.send(new GetCommand({
    TableName: QUIT_PLAN_TABLE,
    Key: { PK: `USER#${userSub}`, SK: 'TWIN#ADAPTIVE_TRIAGE' },
    ConsistentRead: true,
  }))
  if (!response.Item) return null
  const item = response.Item as Record<string, unknown>
  if (!item.assessment || !item.triage || typeof item.plan_id !== 'string') return null
  return {
    schema_version: 1,
    updated_at: String(item.updated_at ?? ''),
    plan_id: item.plan_id,
    assessment: item.assessment as AdaptiveAssessmentAnswers,
    triage: item.triage as AdaptiveTriageProfile,
  }
}
