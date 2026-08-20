import { createHash } from 'node:crypto'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { QUIT_PLAN_TABLE } from '@/lib/quit-engine/store.server'

const region = process.env.AWS_REGION || 'eu-west-2'
const documentClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region }), {
  marshallOptions: { removeUndefinedValues: true },
})

export const ANALYTICS_SCHEMA_VERSION = 1

/**
 * Public visit counter migration baseline.
 *
 * The legacy Aqla homepage displayed 1,852 visits at the point the AWS
 * homepage counter was migrated on 20 Aug 2026. This value is used only
 * when the persistent DynamoDB all-time counter does not yet exist. The
 * first AWS homepage visit therefore atomically becomes 1,853, then 1,854,
 * and so on. A deployment can override the seed once, before first use,
 * with AQLA_PUBLIC_VISIT_SEED if a newer legacy total is confirmed.
 */
const configuredPublicVisitSeed = Number.parseInt(process.env.AQLA_PUBLIC_VISIT_SEED || '1852', 10)
export const PUBLIC_VISIT_SEED = Number.isFinite(configuredPublicVisitSeed) && configuredPublicVisitSeed >= 0
  ? configuredPublicVisitSeed
  : 1852

const PUBLIC_COUNTER_KEY = { PK: 'ANALYTICS#PUBLIC', SK: 'VISITS#TOTAL' } as const

export type AnalyticsMetric =
  | 'visits'
  | 'unique_visitors'
  | 'research_clicks'
  | 'support_entry_clicks'
  | 'assistant_messages'
  | 'assistant_failures'
  | 'conversations_created'
  | 'plan_generated'
  | 'plan_persisted'
  | 'plan_email_sent'
  | 'plan_email_failed'
  | 'email_delivered'
  | 'email_bounced'
  | 'email_complained'
  | 'email_rejected'
  | 'email_delivery_delayed'
  | 'followup_completed'
  | 'challenge_started'
  | 'challenge_completed'
  | 'craving_support_sessions'
  | 'slip_recovery_sessions'
  | 'relapse_recovery_sessions'
  | 'safety_escalations'

export interface DailyAnalyticsRow {
  date: string
  updated_at?: string
  metrics: Partial<Record<AnalyticsMetric, number>>
}

const METRICS: AnalyticsMetric[] = [
  'visits',
  'unique_visitors',
  'research_clicks',
  'support_entry_clicks',
  'assistant_messages',
  'assistant_failures',
  'conversations_created',
  'plan_generated',
  'plan_persisted',
  'plan_email_sent',
  'plan_email_failed',
  'email_delivered',
  'email_bounced',
  'email_complained',
  'email_rejected',
  'email_delivery_delayed',
  'followup_completed',
  'challenge_started',
  'challenge_completed',
  'craving_support_sessions',
  'slip_recovery_sessions',
  'relapse_recovery_sessions',
  'safety_escalations',
]

function utcDay(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

export async function incrementAnalyticsMetric(metric: AnalyticsMetric, amount = 1, date = new Date()) {
  if (!Number.isFinite(amount) || amount <= 0) return
  const day = utcDay(date)
  const now = new Date().toISOString()

  await documentClient.send(new UpdateCommand({
    TableName: QUIT_PLAN_TABLE,
    Key: { PK: 'ANALYTICS#DAILY', SK: day },
    UpdateExpression: 'SET schema_version = :version, updated_at = :now ADD #metric :amount',
    ExpressionAttributeNames: { '#metric': metric },
    ExpressionAttributeValues: {
      ':version': ANALYTICS_SCHEMA_VERSION,
      ':now': now,
      ':amount': amount,
    },
  }))
}

export async function getPublicVisitTotal(): Promise<number> {
  const result = await documentClient.send(new GetCommand({
    TableName: QUIT_PLAN_TABLE,
    Key: PUBLIC_COUNTER_KEY,
    ProjectionExpression: '#count',
    ExpressionAttributeNames: { '#count': 'count' },
  }))
  const count = result.Item?.count
  return typeof count === 'number' && Number.isFinite(count) && count >= 0 ? count : PUBLIC_VISIT_SEED
}

async function incrementPublicVisitTotal(): Promise<number> {
  const now = new Date().toISOString()
  const result = await documentClient.send(new UpdateCommand({
    TableName: QUIT_PLAN_TABLE,
    Key: PUBLIC_COUNTER_KEY,
    UpdateExpression: 'SET entity_type = :entity, schema_version = :version, updated_at = :now, #count = if_not_exists(#count, :seed) + :one',
    ExpressionAttributeNames: { '#count': 'count' },
    ExpressionAttributeValues: {
      ':entity': 'analytics_public_visit_counter',
      ':version': ANALYTICS_SCHEMA_VERSION,
      ':now': now,
      ':seed': PUBLIC_VISIT_SEED,
      ':one': 1,
    },
    ReturnValues: 'ALL_NEW',
  }))
  const count = result.Attributes?.count
  if (typeof count !== 'number' || !Number.isFinite(count) || count < 0) {
    throw new Error('public_visit_counter_invalid')
  }
  return count
}

export async function recordVisit(visitorId: string): Promise<number> {
  const cleanVisitorId = visitorId.trim().slice(0, 200)
  if (!cleanVisitorId) return getPublicVisitTotal()

  await incrementAnalyticsMetric('visits')
  const publicVisitTotal = await incrementPublicVisitTotal()

  const day = utcDay()
  const hash = createHash('sha256').update(cleanVisitorId).digest('hex')
  const expiresAt = Math.floor(Date.now() / 1000) + 400 * 24 * 60 * 60

  try {
    await documentClient.send(new PutCommand({
      TableName: QUIT_PLAN_TABLE,
      Item: {
        PK: `ANALYTICS#UNIQUE#${day}`,
        SK: `VISITOR#${hash}`,
        entity_type: 'analytics_unique_visitor_marker',
        schema_version: ANALYTICS_SCHEMA_VERSION,
        created_at: new Date().toISOString(),
        expires_at: expiresAt,
      },
      ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)',
    }))
    await incrementAnalyticsMetric('unique_visitors')
  } catch (error) {
    const name = error instanceof Error ? error.name : ''
    if (name !== 'ConditionalCheckFailedException') {
      console.error('Aqla unique-visitor analytics unavailable', error instanceof Error ? error.message : 'unknown')
    }
  }

  return publicVisitTotal
}

export async function getDailyAnalytics(days = 30): Promise<DailyAnalyticsRow[]> {
  const safeDays = Math.max(1, Math.min(365, Math.floor(days)))
  const end = new Date()
  const start = new Date(end.getTime() - (safeDays - 1) * 86400000)

  const result = await documentClient.send(new QueryCommand({
    TableName: QUIT_PLAN_TABLE,
    KeyConditionExpression: 'PK = :pk AND SK BETWEEN :start AND :end',
    ExpressionAttributeValues: {
      ':pk': 'ANALYTICS#DAILY',
      ':start': utcDay(start),
      ':end': utcDay(end),
    },
    ScanIndexForward: true,
  }))

  return (result.Items ?? []).map((item) => {
    const metrics: Partial<Record<AnalyticsMetric, number>> = {}
    for (const metric of METRICS) {
      if (typeof item[metric] === 'number') metrics[metric] = Number(item[metric])
    }
    return {
      date: String(item.SK),
      updated_at: typeof item.updated_at === 'string' ? item.updated_at : undefined,
      metrics,
    }
  })
}

export function aggregateAnalytics(rows: DailyAnalyticsRow[]) {
  const totals: Partial<Record<AnalyticsMetric, number>> = {}
  for (const row of rows) {
    for (const metric of METRICS) {
      const value = row.metrics[metric]
      if (typeof value === 'number') totals[metric] = (totals[metric] ?? 0) + value
    }
  }
  return totals
}
