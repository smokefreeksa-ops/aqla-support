import { createHash, randomUUID } from 'node:crypto'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  GetCommand,
  TransactWriteCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb'
import { QUIT_PLAN_TABLE } from '@/lib/quit-engine/store.server'

const region = process.env.AWS_REGION || 'eu-west-2'
const documentClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region }), {
  marshallOptions: { removeUndefinedValues: true },
})

export type EmailCategory = 'transactional' | 'followup' | 'research'
export type UnsubscribeScope = 'followup' | 'research' | 'all_non_transactional'
export type SuppressionReason = 'hard_bounce' | 'complaint' | 'manual' | 'invalid_address'

export interface EmailPreferenceState {
  email_hash: string
  unsubscribe_token?: string
  followup_enabled: boolean
  research_enabled: boolean
  global_suppressed: boolean
  suppression_reason?: SuppressionReason
  suppression_source?: string
  suppressed_at?: string
  created_at: string
  updated_at: string
}

const stateKeyFromHash = (emailHash: string) => ({ PK: `COMM#EMAIL#${emailHash}`, SK: 'STATE' })
const tokenKey = (token: string) => ({ PK: `COMM#UNSUB#${token}`, SK: 'TOKEN' })

export function normaliseEmail(email: string) {
  return email.trim().toLowerCase().slice(0, 320)
}

export function emailHash(email: string) {
  return createHash('sha256').update(normaliseEmail(email)).digest('hex')
}

function stateFromItem(item: Record<string, unknown>): EmailPreferenceState {
  return {
    email_hash: String(item.email_hash || ''),
    unsubscribe_token: typeof item.unsubscribe_token === 'string' ? item.unsubscribe_token : undefined,
    followup_enabled: item.followup_enabled !== false,
    research_enabled: item.research_enabled !== false,
    global_suppressed: item.global_suppressed === true,
    suppression_reason: typeof item.suppression_reason === 'string' ? item.suppression_reason as SuppressionReason : undefined,
    suppression_source: typeof item.suppression_source === 'string' ? item.suppression_source : undefined,
    suppressed_at: typeof item.suppressed_at === 'string' ? item.suppressed_at : undefined,
    created_at: String(item.created_at || item.updated_at || ''),
    updated_at: String(item.updated_at || ''),
  }
}

async function getStateByHash(hash: string) {
  const response = await documentClient.send(new GetCommand({
    TableName: QUIT_PLAN_TABLE,
    Key: stateKeyFromHash(hash),
    ConsistentRead: true,
  }))
  return response.Item ? stateFromItem(response.Item as Record<string, unknown>) : null
}

export async function getEmailPreference(email: string) {
  return getStateByHash(emailHash(email))
}

/**
 * Creates a stable opaque unsubscribe token without storing the raw email in the
 * preference index. The actual recipient address remains in the communication
 * workflow that already needs it; this index is hash-addressed for suppression.
 */
export async function getOrCreateEmailPreference(email: string): Promise<EmailPreferenceState> {
  const hash = emailHash(email)
  const existing = await getStateByHash(hash)
  if (existing?.unsubscribe_token) return existing

  const token = randomUUID()
  const now = new Date().toISOString()
  try {
    await documentClient.send(new TransactWriteCommand({
      TransactItems: [
        {
          Put: {
            TableName: QUIT_PLAN_TABLE,
            Item: {
              ...stateKeyFromHash(hash),
              entity_type: 'email_preference',
              schema_version: 1,
              email_hash: hash,
              unsubscribe_token: token,
              followup_enabled: existing?.followup_enabled ?? true,
              research_enabled: existing?.research_enabled ?? true,
              global_suppressed: existing?.global_suppressed ?? false,
              suppression_reason: existing?.suppression_reason,
              suppression_source: existing?.suppression_source,
              suppressed_at: existing?.suppressed_at,
              created_at: existing?.created_at || now,
              updated_at: now,
            },
            ConditionExpression: existing
              ? 'attribute_not_exists(unsubscribe_token)'
              : 'attribute_not_exists(PK) AND attribute_not_exists(SK)',
          },
        },
        {
          Put: {
            TableName: QUIT_PLAN_TABLE,
            Item: {
              ...tokenKey(token),
              entity_type: 'email_unsubscribe_token',
              email_hash: hash,
              created_at: now,
            },
            ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)',
          },
        },
      ],
    }))
  } catch (error) {
    const afterRace = await getStateByHash(hash)
    if (afterRace?.unsubscribe_token) return afterRace
    throw error
  }

  const created = await getStateByHash(hash)
  if (!created) throw new Error('email_preference_create_failed')
  return created
}

export async function isEmailAllowed(email: string, category: EmailCategory): Promise<boolean> {
  const state = await getEmailPreference(email)
  if (!state) return true
  if (state.global_suppressed) return false
  if (category === 'followup') return state.followup_enabled
  if (category === 'research') return state.research_enabled
  return true
}

export async function suppressEmail({
  email,
  reason,
  source,
}: {
  email: string
  reason: SuppressionReason
  source: string
}) {
  const hash = emailHash(email)
  const now = new Date().toISOString()
  await documentClient.send(new UpdateCommand({
    TableName: QUIT_PLAN_TABLE,
    Key: stateKeyFromHash(hash),
    UpdateExpression: 'SET entity_type = :type, schema_version = :version, email_hash = :hash, followup_enabled = if_not_exists(followup_enabled, :true), research_enabled = if_not_exists(research_enabled, :true), global_suppressed = :true, suppression_reason = :reason, suppression_source = :source, suppressed_at = :now, updated_at = :now, created_at = if_not_exists(created_at, :now)',
    ExpressionAttributeValues: {
      ':type': 'email_preference',
      ':version': 1,
      ':hash': hash,
      ':true': true,
      ':reason': reason,
      ':source': source.slice(0, 120),
      ':now': now,
    },
  }))
}

export async function getUnsubscribeTokenState(token: string): Promise<EmailPreferenceState | null> {
  const clean = token.trim().slice(0, 100)
  if (!/^[0-9a-f-]{36}$/i.test(clean)) return null
  const response = await documentClient.send(new GetCommand({
    TableName: QUIT_PLAN_TABLE,
    Key: tokenKey(clean),
    ConsistentRead: true,
  }))
  const hash = typeof response.Item?.email_hash === 'string' ? response.Item.email_hash : null
  return hash ? getStateByHash(hash) : null
}

export async function unsubscribeByToken(token: string, scope: UnsubscribeScope) {
  const clean = token.trim().slice(0, 100)
  if (!/^[0-9a-f-]{36}$/i.test(clean)) throw new Error('invalid_unsubscribe_token')

  const tokenResponse = await documentClient.send(new GetCommand({
    TableName: QUIT_PLAN_TABLE,
    Key: tokenKey(clean),
    ConsistentRead: true,
  }))
  const hash = typeof tokenResponse.Item?.email_hash === 'string' ? tokenResponse.Item.email_hash : null
  if (!hash) throw new Error('invalid_unsubscribe_token')

  const now = new Date().toISOString()
  const sets = ['updated_at = :now']
  const values: Record<string, unknown> = { ':now': now, ':false': false }
  if (scope === 'followup' || scope === 'all_non_transactional') sets.push('followup_enabled = :false')
  if (scope === 'research' || scope === 'all_non_transactional') sets.push('research_enabled = :false')

  await documentClient.send(new UpdateCommand({
    TableName: QUIT_PLAN_TABLE,
    Key: stateKeyFromHash(hash),
    UpdateExpression: `SET ${sets.join(', ')}`,
    ExpressionAttributeValues: values,
    ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)',
  }))

  return getStateByHash(hash)
}

export function unsubscribeUrl(token: string, scope: UnsubscribeScope = 'followup') {
  const appUrl = (process.env.AQLA_APP_URL || 'https://staging.smokefreeksa.com').replace(/\/$/, '')
  return `${appUrl}/email/unsubscribe?token=${encodeURIComponent(token)}&scope=${encodeURIComponent(scope)}`
}
