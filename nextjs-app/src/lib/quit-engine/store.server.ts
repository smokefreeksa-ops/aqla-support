import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, TransactWriteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import type { StoredQuitPlan } from './types'

const region = process.env.AWS_REGION || 'eu-west-2'
export const QUIT_PLAN_TABLE = process.env.AQLA_DYNAMODB_TABLE || 'aqla-v2-staging'

const documentClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region }), {
  marshallOptions: { removeUndefinedValues: true },
})

export type FollowupType = 'day_3' | 'day_7' | 'day_30'
export type FollowupOutcome = 'quit' | 'reduced' | 'continued' | 'slipped' | 'relapsed' | 'needs_support'
export type FollowupAdaptation =
  | 'maintain_quit'
  | 'build_on_reduction'
  | 'small_step'
  | 'recover_from_slip'
  | 'restart_without_shame'
  | 'professional_support'

export interface FollowupResponseInput {
  outcome: FollowupOutcome
  craving_score: number
  confidence_score: number
}

export interface StoredFollowupResponse extends FollowupResponseInput {
  followup_type: FollowupType
  plan_id: string
  adaptation_key: FollowupAdaptation
  responded_at: string
}

export interface FollowupState {
  plan_id: string
  followup_type: FollowupType
  scheduled_at: string
  status: string
  sent_at?: string
  responded_at?: string
  response?: StoredFollowupResponse
  previous_response?: StoredFollowupResponse
}

function responseSk(planId: string, followupType: FollowupType) {
  return `FOLLOWUP_RESPONSE#${planId}#${followupType}`
}

function referenceSk(planId: string, followupType: FollowupType) {
  return `FOLLOWUPREF#${planId}#${followupType}`
}

export function deriveFollowupAdaptation(outcome: FollowupOutcome): FollowupAdaptation {
  if (outcome === 'quit') return 'maintain_quit'
  if (outcome === 'reduced') return 'build_on_reduction'
  if (outcome === 'slipped') return 'recover_from_slip'
  if (outcome === 'relapsed') return 'restart_without_shame'
  if (outcome === 'needs_support') return 'professional_support'
  return 'small_step'
}

async function getFollowupReference(userSub: string, planId: string, followupType: FollowupType) {
  const response = await documentClient.send(new GetCommand({
    TableName: QUIT_PLAN_TABLE,
    Key: { PK: `USER#${userSub}`, SK: referenceSk(planId, followupType) },
    ConsistentRead: true,
  }))

  const followupSk = typeof response.Item?.followup_sk === 'string' ? response.Item.followup_sk : null
  const scheduledAt = typeof response.Item?.scheduled_at === 'string' ? response.Item.scheduled_at : null
  return followupSk && scheduledAt ? { followupSk, scheduledAt } : null
}

async function getStoredFollowupResponse(userSub: string, planId: string, followupType: FollowupType): Promise<StoredFollowupResponse | null> {
  const response = await documentClient.send(new GetCommand({
    TableName: QUIT_PLAN_TABLE,
    Key: { PK: `USER#${userSub}`, SK: responseSk(planId, followupType) },
    ConsistentRead: true,
  }))
  if (!response.Item) return null

  return {
    plan_id: planId,
    followup_type: followupType,
    outcome: response.Item.outcome as FollowupOutcome,
    craving_score: Number(response.Item.craving_score ?? 0),
    confidence_score: Number(response.Item.confidence_score ?? 0),
    adaptation_key: response.Item.adaptation_key as FollowupAdaptation,
    responded_at: String(response.Item.responded_at),
  }
}

async function getPreviousResponse(userSub: string, planId: string, followupType: FollowupType): Promise<StoredFollowupResponse | null> {
  if (followupType === 'day_3') return null
  if (followupType === 'day_7') return getStoredFollowupResponse(userSub, planId, 'day_3')

  const day7 = await getStoredFollowupResponse(userSub, planId, 'day_7')
  if (day7) return day7
  return getStoredFollowupResponse(userSub, planId, 'day_3')
}

export async function persistQuitPlan({
  userSub,
  plan,
  model,
  aiRequestId,
  recipientEmail,
  lang,
}: {
  userSub: string
  plan: StoredQuitPlan
  model?: string
  aiRequestId?: string
  recipientEmail?: string
  lang: 'ar' | 'en'
}): Promise<void> {
  const pk = `USER#${userSub}`
  const scheduledAt = (offsetDays: number) => new Date(new Date(plan.created_at).getTime() + offsetDays * 86400000).toISOString()

  const followups = plan.result.follow_up_schedule.flatMap((followup) => {
    const type = followup.type as FollowupType
    const at = scheduledAt(followup.offset_days)
    const followupSk = `FOLLOWUP#${at}#${plan.plan_id}#${type}`
    const status = recipientEmail ? 'pending_schedule' : 'no_verified_email'

    return [
      {
        Put: {
          TableName: QUIT_PLAN_TABLE,
          Item: {
            PK: pk,
            SK: followupSk,
            entity_type: 'quit_followup',
            plan_id: plan.plan_id,
            followup_type: type,
            scheduled_at: at,
            status,
            recipient_email: recipientEmail,
            lang,
            created_at: plan.created_at,
            updated_at: plan.created_at,
          },
        },
      },
      {
        Put: {
          TableName: QUIT_PLAN_TABLE,
          Item: {
            PK: pk,
            SK: referenceSk(plan.plan_id, type),
            entity_type: 'quit_followup_reference',
            plan_id: plan.plan_id,
            followup_type: type,
            scheduled_at: at,
            followup_sk: followupSk,
            created_at: plan.created_at,
          },
        },
      },
    ]
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
            lang,
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

export async function markFollowupScheduleState({
  userSub,
  planId,
  followupType,
  status,
  scheduleName,
  errorMessage,
}: {
  userSub: string
  planId: string
  followupType: FollowupType
  status: 'scheduled' | 'schedule_failed'
  scheduleName?: string
  errorMessage?: string
}): Promise<void> {
  const reference = await getFollowupReference(userSub, planId, followupType)
  if (!reference) throw new Error('followup_reference_not_found')

  const now = new Date().toISOString()
  const sets = ['#status = :status', 'updated_at = :now']
  const values: Record<string, unknown> = { ':status': status, ':now': now }

  if (scheduleName) {
    sets.push('scheduler_name = :scheduleName', 'schedule_created_at = :now')
    values[':scheduleName'] = scheduleName
  }
  if (errorMessage) {
    sets.push('schedule_error = :scheduleError')
    values[':scheduleError'] = errorMessage.slice(0, 500)
  }

  await documentClient.send(new UpdateCommand({
    TableName: QUIT_PLAN_TABLE,
    Key: { PK: `USER#${userSub}`, SK: reference.followupSk },
    UpdateExpression: `SET ${sets.join(', ')}`,
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: values,
  }))
}

export async function getFollowupState(userSub: string, planId: string, followupType: FollowupType): Promise<FollowupState | null> {
  const reference = await getFollowupReference(userSub, planId, followupType)
  if (!reference) return null

  const [followupResult, response, previousResponse] = await Promise.all([
    documentClient.send(new GetCommand({
      TableName: QUIT_PLAN_TABLE,
      Key: { PK: `USER#${userSub}`, SK: reference.followupSk },
      ConsistentRead: true,
    })),
    getStoredFollowupResponse(userSub, planId, followupType),
    getPreviousResponse(userSub, planId, followupType),
  ])

  if (!followupResult.Item) return null
  return {
    plan_id: planId,
    followup_type: followupType,
    scheduled_at: reference.scheduledAt,
    status: String(followupResult.Item.status ?? 'unknown'),
    sent_at: typeof followupResult.Item.sent_at === 'string' ? followupResult.Item.sent_at : undefined,
    responded_at: typeof followupResult.Item.responded_at === 'string' ? followupResult.Item.responded_at : undefined,
    response: response ?? undefined,
    previous_response: previousResponse ?? undefined,
  }
}

export async function saveFollowupResponse({
  userSub,
  planId,
  followupType,
  response,
}: {
  userSub: string
  planId: string
  followupType: FollowupType
  response: FollowupResponseInput
}): Promise<StoredFollowupResponse> {
  const reference = await getFollowupReference(userSub, planId, followupType)
  if (!reference) throw new Error('followup_reference_not_found')

  const respondedAt = new Date().toISOString()
  const adaptationKey = deriveFollowupAdaptation(response.outcome)
  const stored: StoredFollowupResponse = {
    ...response,
    plan_id: planId,
    followup_type: followupType,
    adaptation_key: adaptationKey,
    responded_at: respondedAt,
  }

  await documentClient.send(new TransactWriteCommand({
    TransactItems: [
      {
        Put: {
          TableName: QUIT_PLAN_TABLE,
          Item: {
            PK: `USER#${userSub}`,
            SK: responseSk(planId, followupType),
            entity_type: 'quit_followup_response',
            ...stored,
            updated_at: respondedAt,
          },
        },
      },
      {
        Update: {
          TableName: QUIT_PLAN_TABLE,
          Key: { PK: `USER#${userSub}`, SK: reference.followupSk },
          UpdateExpression: 'SET #status = :responded, responded_at = :now, response_outcome = :outcome, adaptation_key = :adaptation, updated_at = :now',
          ExpressionAttributeNames: { '#status': 'status' },
          ExpressionAttributeValues: {
            ':responded': 'responded',
            ':now': respondedAt,
            ':outcome': response.outcome,
            ':adaptation': adaptationKey,
          },
        },
      },
    ],
  }))

  return stored
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
