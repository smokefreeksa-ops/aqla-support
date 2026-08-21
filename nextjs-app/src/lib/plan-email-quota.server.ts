import { createHash } from 'node:crypto'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { QUIT_PLAN_TABLE } from '@/lib/quit-engine/store.server'

const region = process.env.AWS_REGION || 'eu-west-2'
const documentClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region }), {
  marshallOptions: { removeUndefinedValues: true },
})

const configuredHourly = Number.parseInt(process.env.AQLA_PLAN_EMAIL_HOURLY_LIMIT || '5', 10)
export const PLAN_EMAIL_HOURLY_LIMIT = Number.isFinite(configuredHourly) && configuredHourly > 0
  ? Math.min(configuredHourly, 20)
  : 5

function utcHour(date = new Date()) {
  return date.toISOString().slice(0, 13)
}

/**
 * Limits user-requested plan-delivery emails without persisting a raw account ID,
 * browser ID, IP address or email address. The supplied subject identifier is
 * SHA-256 hashed and the quota row expires automatically.
 */
export async function consumePlanEmailQuota(subjectIdentifier: string): Promise<boolean> {
  const clean = subjectIdentifier.trim().slice(0, 300)
  if (!clean) return false

  const hash = createHash('sha256').update(clean).digest('hex')
  const hour = utcHour()
  const now = new Date().toISOString()
  const expiresAt = Math.floor(Date.now() / 1000) + 48 * 60 * 60

  try {
    await documentClient.send(new UpdateCommand({
      TableName: QUIT_PLAN_TABLE,
      Key: {
        PK: `QUOTA#PLAN_EMAIL#${hour}`,
        SK: `SUBJECT#${hash}`,
      },
      UpdateExpression: 'SET entity_type = :entity, updated_at = :now, expires_at = :expires ADD #count :one',
      ConditionExpression: 'attribute_not_exists(#count) OR #count < :limit',
      ExpressionAttributeNames: { '#count': 'count' },
      ExpressionAttributeValues: {
        ':entity': 'plan_email_hourly_quota',
        ':now': now,
        ':expires': expiresAt,
        ':one': 1,
        ':limit': PLAN_EMAIL_HOURLY_LIMIT,
      },
    }))
    return true
  } catch (error) {
    if (error instanceof Error && error.name === 'ConditionalCheckFailedException') return false
    console.error('Aqla plan-email quota unavailable', error instanceof Error ? error.message : 'unknown')
    return false
  }
}
