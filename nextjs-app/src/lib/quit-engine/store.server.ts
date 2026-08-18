import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb'
import type { StoredQuitPlan } from './types'

const region = process.env.AWS_REGION || 'eu-west-2'
export const QUIT_PLAN_TABLE = process.env.AQLA_DYNAMODB_TABLE || 'aqla-v2-staging'

const documentClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region }), {
  marshallOptions: { removeUndefinedValues: true },
})

export async function persistQuitPlan({
  userSub,
  plan,
  model,
  aiRequestId,
}: {
  userSub: string
  plan: StoredQuitPlan
  model?: string
  aiRequestId?: string
}): Promise<void> {
  const pk = `USER#${userSub}`
  const scheduledAt = (offsetDays: number) => new Date(new Date(plan.created_at).getTime() + offsetDays * 86400000).toISOString()

  const followups = plan.result.follow_up_schedule.map((followup) => {
    const at = scheduledAt(followup.offset_days)
    return {
      Put: {
        TableName: QUIT_PLAN_TABLE,
        Item: {
          PK: pk,
          SK: `FOLLOWUP#${at}#${plan.plan_id}#${followup.type}`,
          entity_type: 'quit_followup',
          plan_id: plan.plan_id,
          followup_type: followup.type,
          scheduled_at: at,
          status: 'scheduled',
          created_at: plan.created_at,
        },
      },
    }
  })

  await documentClient.send(new TransactWriteCommand({
    TransactItems: [
      {
        Put: {
          TableName: QUIT_PLAN_TABLE,
          Item: {
            PK: pk,
            SK: `PLAN#${plan.plan_id}`,
            entity_type: 'quit_plan',
            plan_id: plan.plan_id,
            created_at: plan.created_at,
            version: plan.version,
            answers: plan.answers,
            result: plan.result,
            model: model ?? 'deterministic',
            ai_request_id: aiRequestId,
          },
          ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)',
        },
      },
      {
        Put: {
          TableName: QUIT_PLAN_TABLE,
          Item: {
            PK: pk,
            SK: 'PLAN#LATEST',
            entity_type: 'quit_plan_pointer',
            plan_id: plan.plan_id,
            updated_at: plan.created_at,
          },
        },
      },
      ...followups,
    ],
  }))
}

export async function getQuitPlan(userSub: string, planId: string): Promise<StoredQuitPlan | null> {
  const response = await documentClient.send(new GetCommand({
    TableName: QUIT_PLAN_TABLE,
    Key: { PK: `USER#${userSub}`, SK: `PLAN#${planId}` },
    ConsistentRead: true,
  }))

  if (!response.Item) return null
  const item = response.Item as Record<string, unknown>
  return {
    plan_id: String(item.plan_id),
    created_at: String(item.created_at),
    version: 1,
    persisted: true,
    answers: item.answers as StoredQuitPlan['answers'],
    result: item.result as StoredQuitPlan['result'],
  }
}

export async function getLatestQuitPlanId(userSub: string): Promise<string | null> {
  const response = await documentClient.send(new GetCommand({
    TableName: QUIT_PLAN_TABLE,
    Key: { PK: `USER#${userSub}`, SK: 'PLAN#LATEST' },
    ConsistentRead: true,
  }))
  return typeof response.Item?.plan_id === 'string' ? response.Item.plan_id : null
}
