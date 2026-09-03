import { createHash } from 'node:crypto'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { QUIT_PLAN_TABLE } from '@/lib/quit-engine/store.server'

const region = process.env.AWS_REGION || 'eu-west-2'
const documentClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region }), {
  marshallOptions: { removeUndefinedValues: true },
})

const configuredHourly = Number.parseInt(process.env.AQLA_GUEST_AI_HOURLY_LIMIT || '6', 10)
export const GUEST_AI_HOURLY_LIMIT = Number.isFinite(configuredHourly) && configuredHourly > 0
  ? Math.min(configuredHourly, 50)
  : 6

function utcHour(date = new Date()) {
  return date.toISOString().slice(0, 13)
}

/**
 * Limits only the optional OpenAI personalisation layer for anonymous users.
 * The deterministic Aqla plan remains available if the quota is exceeded.
 *
 * We never persist an email address, IP address or raw browser identifier.
 * The existing random HttpOnly `aqla_vid` browser identifier is SHA-256 hashed
 * before use as the DynamoDB sort key. Quota rows expire automatically.
 */
export async function consumeGuestAiQuota(visitorId: string): Promise<boolean> {
  const clean = visitorId.trim().slice(0, 200)
  if (!clean) return false

  const hash = createHash('sha256').update(clean).digest('hex')
  const hour = utcHour()
  const now = new Date().toISOString()
  const expiresAt = Math.floor(Date.now() / 1000) + 48 * 60 * 60

  try {
    await documentClient.send(new UpdateCommand({
      TableName: QUIT_PLAN_TABLE,
      Key: {
        PK: `QUOTA#GUEST_AI#${hour}`,
        SK: `VISITOR#${hash}`,
      },
      UpdateExpression: 'SET entity_type = :entity, updated_at = :now, expires_at = :expires ADD #count :one',
      ConditionExpression: 'attribute_not_exists(#count) OR #count < :limit',
      ExpressionAttributeNames: { '#count': 'count' },
      ExpressionAttributeValues: {
        ':entity': 'guest_ai_hourly_quota',
        ':now': now,
        ':expires': expiresAt,
        ':one': 1,
        ':limit': GUEST_AI_HOURLY_LIMIT,
      },
    }))
    return true
  } catch (error) {
    if (error instanceof Error && error.name === 'ConditionalCheckFailedException') return false
    console.error('Aqla guest AI quota unavailable', error instanceof Error ? error.message : 'unknown')
    // Fail closed for the optional AI layer; deterministic plan generation still works.
    return false
  }
}
