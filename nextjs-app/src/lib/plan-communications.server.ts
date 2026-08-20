import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { FOLLOWUP_TYPES } from '@/lib/followup-policy'
import { getFollowupState, QUIT_PLAN_TABLE, type FollowupState } from '@/lib/quit-engine/store.server'

const region = process.env.AWS_REGION || 'eu-west-2'
const documentClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region }), {
  marshallOptions: { removeUndefinedValues: true },
})

export type PlanEmailStatus =
  | 'not_requested'
  | 'pending'
  | 'sent'
  | 'suppressed'
  | 'failed'
  | 'no_verified_email'
  | 'safety_hold'

export interface PlanCommunicationState {
  plan_id: string
  plan_email_status: PlanEmailStatus | 'unknown'
  plan_email_updated_at?: string
  plan_email_message_id?: string
  plan_email_error?: string
  followups: FollowupState[]
}

export async function markPlanEmailState({
  userSub,
  planId,
  status,
  messageId,
  errorMessage,
}: {
  userSub: string
  planId: string
  status: PlanEmailStatus
  messageId?: string
  errorMessage?: string
}) {
  const now = new Date().toISOString()
  const sets = ['plan_email_status = :status', 'plan_email_updated_at = :now']
  const values: Record<string, unknown> = {
    ':status': status,
    ':now': now,
  }

  if (messageId) {
    sets.push('plan_email_message_id = :messageId')
    values[':messageId'] = messageId.slice(0, 500)
  }
  if (errorMessage) {
    sets.push('plan_email_error = :errorMessage')
    values[':errorMessage'] = errorMessage.slice(0, 500)
  }

  await documentClient.send(new UpdateCommand({
    TableName: QUIT_PLAN_TABLE,
    Key: { PK: `USER#${userSub}`, SK: `PLAN#${planId}` },
    UpdateExpression: `SET ${sets.join(', ')}`,
    ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)',
    ExpressionAttributeValues: values,
  }))
}

export async function getPlanCommunicationState(userSub: string, planId: string): Promise<PlanCommunicationState | null> {
  const response = await documentClient.send(new GetCommand({
    TableName: QUIT_PLAN_TABLE,
    Key: { PK: `USER#${userSub}`, SK: `PLAN#${planId}` },
    ProjectionExpression: 'plan_id, plan_email_status, plan_email_updated_at, plan_email_message_id, plan_email_error',
    ConsistentRead: true,
  }))
  if (!response.Item) return null

  const followups = (await Promise.all(
    FOLLOWUP_TYPES.map((type) => getFollowupState(userSub, planId, type).catch(() => null)),
  )).filter((item): item is FollowupState => Boolean(item))

  return {
    plan_id: planId,
    plan_email_status: typeof response.Item.plan_email_status === 'string'
      ? response.Item.plan_email_status as PlanEmailStatus
      : 'unknown',
    plan_email_updated_at: typeof response.Item.plan_email_updated_at === 'string' ? response.Item.plan_email_updated_at : undefined,
    plan_email_message_id: typeof response.Item.plan_email_message_id === 'string' ? response.Item.plan_email_message_id : undefined,
    plan_email_error: typeof response.Item.plan_email_error === 'string' ? response.Item.plan_email_error : undefined,
    followups,
  }
}
