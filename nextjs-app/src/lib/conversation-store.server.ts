import { randomUUID } from 'node:crypto'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { QUIT_PLAN_TABLE } from '@/lib/quit-engine/store.server'

const region = process.env.AWS_REGION || 'eu-west-2'
const documentClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region }), {
  marshallOptions: { removeUndefinedValues: true },
})

export const CONVERSATION_SCHEMA_VERSION = 1

export type AqlaMode = 'quit' | 'academy' | 'clinician' | 'admin'
export type ConversationRole = 'user' | 'assistant'

export interface StoredConversationSummary {
  conversation_id: string
  title: string
  mode: AqlaMode
  created_at: string
  updated_at: string
}

export interface StoredConversationMessage {
  message_id: string
  conversation_id: string
  role: ConversationRole
  content: string
  created_at: string
  action?: string
}

function conversationSk(conversationId: string) {
  return `CONVERSATION#${conversationId}`
}

function messagePrefix(conversationId: string) {
  return `CHAT#${conversationId}#`
}

function messageSk(conversationId: string, createdAt: string, messageId: string) {
  return `${messagePrefix(conversationId)}${createdAt}#${messageId}`
}

function safeTitle(text: string, fallback: string) {
  const compact = text.replace(/\s+/g, ' ').trim()
  if (!compact) return fallback
  return compact.length > 56 ? `${compact.slice(0, 55)}…` : compact
}

export async function ensureConversation({
  userSub,
  conversationId,
  mode,
  firstUserMessage,
  fallbackTitle,
}: {
  userSub: string
  conversationId?: string
  mode: AqlaMode
  firstUserMessage: string
  fallbackTitle: string
}): Promise<{ conversationId: string; created: boolean }> {
  const id = conversationId?.trim().slice(0, 100) || randomUUID()
  const pk = `USER#${userSub}`
  const key = { PK: pk, SK: conversationSk(id) }

  const existing = await documentClient.send(new GetCommand({
    TableName: QUIT_PLAN_TABLE,
    Key: key,
    ConsistentRead: true,
  }))

  if (existing.Item) return { conversationId: id, created: false }

  const now = new Date().toISOString()
  await documentClient.send(new PutCommand({
    TableName: QUIT_PLAN_TABLE,
    Item: {
      ...key,
      entity_type: 'aqla_conversation',
      schema_version: CONVERSATION_SCHEMA_VERSION,
      conversation_id: id,
      mode,
      title: safeTitle(firstUserMessage, fallbackTitle),
      created_at: now,
      updated_at: now,
    },
    ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)',
  }))

  return { conversationId: id, created: true }
}

export async function appendConversationMessage({
  userSub,
  conversationId,
  role,
  content,
  action,
}: {
  userSub: string
  conversationId: string
  role: ConversationRole
  content: string
  action?: string
}) {
  const now = new Date().toISOString()
  const messageId = randomUUID()
  const pk = `USER#${userSub}`
  const clean = content.trim().slice(0, 6000)
  if (!clean) return

  await documentClient.send(new PutCommand({
    TableName: QUIT_PLAN_TABLE,
    Item: {
      PK: pk,
      SK: messageSk(conversationId, now, messageId),
      entity_type: 'aqla_conversation_message',
      schema_version: CONVERSATION_SCHEMA_VERSION,
      message_id: messageId,
      conversation_id: conversationId,
      role,
      content: clean,
      action,
      created_at: now,
    },
    ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)',
  }))

  await documentClient.send(new UpdateCommand({
    TableName: QUIT_PLAN_TABLE,
    Key: { PK: pk, SK: conversationSk(conversationId) },
    UpdateExpression: 'SET updated_at = :now, last_message_role = :role',
    ExpressionAttributeValues: { ':now': now, ':role': role },
  }))
}

export async function listConversations(userSub: string, limit = 30): Promise<StoredConversationSummary[]> {
  const result = await documentClient.send(new QueryCommand({
    TableName: QUIT_PLAN_TABLE,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
    ExpressionAttributeValues: {
      ':pk': `USER#${userSub}`,
      ':prefix': 'CONVERSATION#',
    },
    Limit: Math.max(1, Math.min(100, Math.floor(limit))),
  }))

  return (result.Items ?? [])
    .map((item) => ({
      conversation_id: String(item.conversation_id),
      title: String(item.title || 'Aqla'),
      mode: (item.mode === 'academy' || item.mode === 'clinician' || item.mode === 'admin') ? item.mode : 'quit',
      created_at: String(item.created_at),
      updated_at: String(item.updated_at || item.created_at),
    }) satisfies StoredConversationSummary)
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
}

export async function getConversationMessages(userSub: string, conversationId: string, limit = 80): Promise<StoredConversationMessage[]> {
  const id = conversationId.trim().slice(0, 100)
  if (!id) return []

  const owner = await documentClient.send(new GetCommand({
    TableName: QUIT_PLAN_TABLE,
    Key: { PK: `USER#${userSub}`, SK: conversationSk(id) },
    ConsistentRead: true,
  }))
  if (!owner.Item) return []

  const result = await documentClient.send(new QueryCommand({
    TableName: QUIT_PLAN_TABLE,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
    ExpressionAttributeValues: {
      ':pk': `USER#${userSub}`,
      ':prefix': messagePrefix(id),
    },
    ScanIndexForward: true,
    Limit: Math.max(1, Math.min(200, Math.floor(limit))),
  }))

  return (result.Items ?? []).map((item) => ({
    message_id: String(item.message_id),
    conversation_id: id,
    role: item.role === 'assistant' ? 'assistant' : 'user',
    content: String(item.content || ''),
    created_at: String(item.created_at),
    action: typeof item.action === 'string' ? item.action : undefined,
  }))
}
