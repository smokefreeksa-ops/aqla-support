import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import { QUIT_PLAN_TABLE } from '@/lib/quit-engine/store.server'
import type { PersonalPlanV2Answers, PersonalPlanV2Enrichment } from '@/lib/personal-plan-v2'

const region = process.env.AWS_REGION || 'eu-west-2'
const documentClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region }), {
  marshallOptions: { removeUndefinedValues: true },
})

export const PERSONAL_PLAN_V2_SCHEMA_VERSION = 1

export interface StoredPersonalPlanV2Context {
  schema_version: 1
  updated_at: string
  plan_id: string
  answers: PersonalPlanV2Answers
  enrichment: PersonalPlanV2Enrichment
}

export async function savePersonalPlanV2TwinContext({
  userSub,
  planId,
  answers,
  enrichment,
}: {
  userSub: string
  planId: string
  answers: PersonalPlanV2Answers
  enrichment: PersonalPlanV2Enrichment
}) {
  const now = new Date().toISOString()
  const item: StoredPersonalPlanV2Context = {
    schema_version: PERSONAL_PLAN_V2_SCHEMA_VERSION,
    updated_at: now,
    plan_id: planId,
    answers,
    enrichment,
  }

  await documentClient.send(new PutCommand({
    TableName: QUIT_PLAN_TABLE,
    Item: {
      PK: `USER#${userSub}`,
      SK: 'TWIN#PERSONAL_PLAN_V2',
      entity_type: 'aqla_personal_twin_plan_context',
      ...item,
    },
  }))

  return item
}

export async function getPersonalPlanV2TwinContext(userSub: string): Promise<StoredPersonalPlanV2Context | null> {
  const result = await documentClient.send(new GetCommand({
    TableName: QUIT_PLAN_TABLE,
    Key: { PK: `USER#${userSub}`, SK: 'TWIN#PERSONAL_PLAN_V2' },
    ConsistentRead: true,
  }))
  if (!result.Item) return null
  const item = result.Item as Record<string, unknown>
  if (!item.answers || !item.enrichment || typeof item.plan_id !== 'string') return null
  return {
    schema_version: 1,
    updated_at: String(item.updated_at ?? ''),
    plan_id: item.plan_id,
    answers: item.answers as PersonalPlanV2Answers,
    enrichment: item.enrichment as PersonalPlanV2Enrichment,
  }
}
