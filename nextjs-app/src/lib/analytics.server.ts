import { createHash } from 'node:crypto'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { QUIT_PLAN_TABLE } from '@/lib/quit-engine/store.server'

const region = process.env.AWS_REGION || 'eu-west-2'
const documentClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region }), {
  marshallOptions: { removeUndefinedValues: true },
})

export const ANALYTICS_SCHEMA_VERSION = 1

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

export async function recordVisit(visitorId: string) {
  const cleanVisitorId = visitorId.trim().slice(0, 200)
  if (!cleanVisitorId) return

  await incrementAnalyticsMetric('visits')

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
    if (name !== 'ConditionalCheckFailedException') throw error
  }
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
