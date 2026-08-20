import { randomUUID } from 'node:crypto'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb'
import { QUIT_PLAN_TABLE } from '@/lib/quit-engine/store.server'
import type { StoredQuitPlan } from '@/lib/quit-engine/types'

const region = process.env.AWS_REGION || 'eu-west-2'
const documentClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region }), {
  marshallOptions: { removeUndefinedValues: true },
})

export const CRM_SCHEMA_VERSION = 1

export const WORKFLOW_STATUSES = [
  'new',
  'outreach',
  'contacted',
  'appointment',
  'clinician_review',
  'followup',
  'completed',
  'unable_contact',
  'closed',
] as const

export const CONTACT_STATUSES = [
  'not_contacted',
  'attempted',
  'reached',
  'appointment_booked',
  'declined',
  'unable_contact',
] as const

export const ESCALATION_LEVELS = ['none', 'routine', 'priority', 'urgent'] as const

export type WorkflowStatus = typeof WORKFLOW_STATUSES[number]
export type ContactStatus = typeof CONTACT_STATUSES[number]
export type EscalationLevel = typeof ESCALATION_LEVELS[number]
export type StaffRole = 'admin' | 'clinician' | 'receptionist'

export interface ParticipantIndexRecord {
  user_sub: string
  email?: string
  email_verified: boolean
  language?: 'ar' | 'en'
  workflow_status: WorkflowStatus
  contact_status: ContactStatus
  escalation_level: EscalationLevel
  latest_plan_id?: string
  latest_plan_created_at?: string
  product_types?: string[]
  readiness_category?: string
  support_intensity?: number
  referral_needed?: boolean
  safety_hold?: boolean
  appointment_at?: string
  updated_at: string
  created_at: string
}

export interface ParticipantProfile extends ParticipantIndexRecord {
  latest_safety_flags?: string[]
  receptionist_notes?: string
  clinician_notes?: string
  last_contact_at?: string
  last_contact_by?: string
  assigned_clinician?: string
}

export interface ParticipantAuditEvent {
  event_id: string
  user_sub: string
  actor_sub: string
  actor_role: StaffRole
  event_type: 'crm_updated'
  changed_fields: string[]
  changes: Record<string, { from?: unknown; to?: unknown }>
  created_at: string
}

export interface ParticipantListResult {
  participants: ParticipantIndexRecord[]
  next_cursor?: string
}

export interface ParticipantUpdateInput {
  workflow_status?: WorkflowStatus
  contact_status?: ContactStatus
  escalation_level?: EscalationLevel
  appointment_at?: string | null
  receptionist_notes?: string | null
  clinician_notes?: string | null
  assigned_clinician?: string | null
}

const MASTER_PK = 'CRM#PARTICIPANTS'
const LOOKUP_PK = 'CRM#LOOKUP'
const participantSk = (userSub: string) => `USER#${userSub}`
const profileKey = (userSub: string) => ({ PK: `USER#${userSub}`, SK: 'CRM#PROFILE' })
const masterKey = (userSub: string) => ({ PK: MASTER_PK, SK: participantSk(userSub) })
const statusPk = (status: WorkflowStatus) => `CRM#STATUS#${status}`
const escalationPk = (level: EscalationLevel) => `CRM#ESCALATION#${level}`

const escalationRank: Record<EscalationLevel, number> = {
  none: 0,
  routine: 1,
  priority: 2,
  urgent: 3,
}

function strongestEscalation(a: EscalationLevel, b: EscalationLevel): EscalationLevel {
  return escalationRank[a] >= escalationRank[b] ? a : b
}

function planEscalation(plan: StoredQuitPlan): EscalationLevel {
  if (plan.result.safety_immediate) return 'urgent'
  if (plan.result.referral_needed) return 'priority'
  if (plan.result.aqla_support_intensity >= 6) return 'routine'
  return 'none'
}

function normaliseEmail(email: string) {
  return email.trim().toLowerCase().slice(0, 320)
}

function summaryItem(record: ParticipantIndexRecord, pk: string) {
  return {
    PK: pk,
    SK: participantSk(record.user_sub),
    entity_type: 'participant_crm_index',
    schema_version: CRM_SCHEMA_VERSION,
    ...record,
  }
}

function asWorkflowStatus(value: unknown): WorkflowStatus {
  return typeof value === 'string' && (WORKFLOW_STATUSES as readonly string[]).includes(value) ? value as WorkflowStatus : 'new'
}

function asContactStatus(value: unknown): ContactStatus {
  return typeof value === 'string' && (CONTACT_STATUSES as readonly string[]).includes(value) ? value as ContactStatus : 'not_contacted'
}

function asEscalationLevel(value: unknown): EscalationLevel {
  return typeof value === 'string' && (ESCALATION_LEVELS as readonly string[]).includes(value) ? value as EscalationLevel : 'none'
}

function fromIndexItem(item: Record<string, unknown>): ParticipantIndexRecord {
  return {
    user_sub: String(item.user_sub || ''),
    email: typeof item.email === 'string' ? item.email : undefined,
    email_verified: item.email_verified === true,
    language: item.language === 'en' ? 'en' : item.language === 'ar' ? 'ar' : undefined,
    workflow_status: asWorkflowStatus(item.workflow_status),
    contact_status: asContactStatus(item.contact_status),
    escalation_level: asEscalationLevel(item.escalation_level),
    latest_plan_id: typeof item.latest_plan_id === 'string' ? item.latest_plan_id : undefined,
    latest_plan_created_at: typeof item.latest_plan_created_at === 'string' ? item.latest_plan_created_at : undefined,
    product_types: Array.isArray(item.product_types) ? item.product_types.map(String) : undefined,
    readiness_category: typeof item.readiness_category === 'string' ? item.readiness_category : undefined,
    support_intensity: typeof item.support_intensity === 'number' ? item.support_intensity : undefined,
    referral_needed: typeof item.referral_needed === 'boolean' ? item.referral_needed : undefined,
    safety_hold: typeof item.safety_hold === 'boolean' ? item.safety_hold : undefined,
    appointment_at: typeof item.appointment_at === 'string' ? item.appointment_at : undefined,
    updated_at: String(item.updated_at || ''),
    created_at: String(item.created_at || item.updated_at || ''),
  }
}

function encodeCursor(key: Record<string, unknown> | undefined) {
  if (!key) return undefined
  return Buffer.from(JSON.stringify(key), 'utf8').toString('base64url')
}

function decodeCursor(cursor: string | undefined) {
  if (!cursor) return undefined
  try {
    const value = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as Record<string, unknown>
    return value && typeof value === 'object' ? value : undefined
  } catch {
    return undefined
  }
}

async function getMaster(userSub: string) {
  const response = await documentClient.send(new GetCommand({
    TableName: QUIT_PLAN_TABLE,
    Key: masterKey(userSub),
    ConsistentRead: true,
  }))
  return response.Item ? fromIndexItem(response.Item as Record<string, unknown>) : null
}

/**
 * Creates/refreshes a compact operational CRM index whenever a plan is persisted.
 *
 * Important scaling property: staff listing queries a dedicated CRM partition;
 * it never scans the 100k-user journey table.
 */
export async function upsertParticipantCrmFromPlan({
  userSub,
  email,
  emailVerified,
  plan,
  lang,
}: {
  userSub: string
  email?: string
  emailVerified: boolean
  plan: StoredQuitPlan
  lang: 'ar' | 'en'
}) {
  const existing = await getMaster(userSub)
  const now = new Date().toISOString()
  const workflowStatus = existing?.workflow_status ?? 'new'
  const contactStatus = existing?.contact_status ?? 'not_contacted'
  const escalationLevel = strongestEscalation(existing?.escalation_level ?? 'none', planEscalation(plan))
  const createdAt = existing?.created_at || now

  const record: ParticipantIndexRecord = {
    user_sub: userSub,
    email: email ? normaliseEmail(email) : existing?.email,
    email_verified: emailVerified,
    language: lang,
    workflow_status: workflowStatus,
    contact_status: contactStatus,
    escalation_level: escalationLevel,
    latest_plan_id: plan.plan_id,
    latest_plan_created_at: plan.created_at,
    product_types: plan.answers.product_types,
    readiness_category: plan.result.readiness_category,
    support_intensity: plan.result.aqla_support_intensity,
    referral_needed: plan.result.referral_needed,
    safety_hold: Boolean(plan.result.safety_immediate),
    appointment_at: existing?.appointment_at,
    updated_at: now,
    created_at: createdAt,
  }

  const profileUpdateParts = [
    'schema_version = :version',
    'entity_type = :entityType',
    'user_sub = :userSub',
    'email_verified = :emailVerified',
    '#language = :language',
    'workflow_status = if_not_exists(workflow_status, :workflowStatus)',
    'contact_status = if_not_exists(contact_status, :contactStatus)',
    'escalation_level = :escalationLevel',
    'latest_plan_id = :planId',
    'latest_plan_created_at = :planCreatedAt',
    'product_types = :products',
    'readiness_category = :readiness',
    'support_intensity = :supportIntensity',
    'referral_needed = :referralNeeded',
    'safety_hold = :safetyHold',
    'latest_safety_flags = :safetyFlags',
    'updated_at = :now',
    'created_at = if_not_exists(created_at, :createdAt)',
  ]
  const values: Record<string, unknown> = {
    ':version': CRM_SCHEMA_VERSION,
    ':entityType': 'participant_crm_profile',
    ':userSub': userSub,
    ':emailVerified': emailVerified,
    ':language': lang,
    ':workflowStatus': workflowStatus,
    ':contactStatus': contactStatus,
    ':escalationLevel': escalationLevel,
    ':planId': plan.plan_id,
    ':planCreatedAt': plan.created_at,
    ':products': plan.answers.product_types,
    ':readiness': plan.result.readiness_category,
    ':supportIntensity': plan.result.aqla_support_intensity,
    ':referralNeeded': plan.result.referral_needed,
    ':safetyHold': Boolean(plan.result.safety_immediate),
    ':safetyFlags': plan.answers.safety_flags,
    ':now': now,
    ':createdAt': createdAt,
  }
  if (record.email) {
    profileUpdateParts.push('email = :email')
    values[':email'] = record.email
  }

  const items: Parameters<typeof documentClient.send>[0] extends never ? never[] : Array<Record<string, unknown>> = []
  void items

  await documentClient.send(new TransactWriteCommand({
    TransactItems: [
      {
        Put: {
          TableName: QUIT_PLAN_TABLE,
          Item: summaryItem(record, MASTER_PK),
        },
      },
      {
        Update: {
          TableName: QUIT_PLAN_TABLE,
          Key: profileKey(userSub),
          UpdateExpression: `SET ${profileUpdateParts.join(', ')}`,
          ExpressionAttributeNames: { '#language': 'language' },
          ExpressionAttributeValues: values,
        },
      },
      {
        Put: {
          TableName: QUIT_PLAN_TABLE,
          Item: summaryItem(record, statusPk(workflowStatus)),
        },
      },
      {
        Put: {
          TableName: QUIT_PLAN_TABLE,
          Item: summaryItem(record, escalationPk(escalationLevel)),
        },
      },
      {
        Put: {
          TableName: QUIT_PLAN_TABLE,
          Item: {
            PK: LOOKUP_PK,
            SK: `USER#${userSub}`,
            entity_type: 'participant_crm_lookup',
            user_sub: userSub,
            updated_at: now,
          },
        },
      },
      ...(record.email ? [{
        Put: {
          TableName: QUIT_PLAN_TABLE,
          Item: {
            PK: LOOKUP_PK,
            SK: `EMAIL#${record.email}#USER#${userSub}`,
            entity_type: 'participant_crm_lookup',
            user_sub: userSub,
            updated_at: now,
          },
        },
      }] : []),
      ...(existing && existing.escalation_level !== escalationLevel ? [{
        Delete: {
          TableName: QUIT_PLAN_TABLE,
          Key: { PK: escalationPk(existing.escalation_level), SK: participantSk(userSub) },
        },
      }] : []),
    ],
  }))
}

export async function listParticipants({
  status,
  escalation,
  cursor,
  limit = 40,
}: {
  status?: WorkflowStatus
  escalation?: EscalationLevel
  cursor?: string
  limit?: number
} = {}): Promise<ParticipantListResult> {
  const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)))
  const pk = status ? statusPk(status) : escalation ? escalationPk(escalation) : MASTER_PK
  const response = await documentClient.send(new QueryCommand({
    TableName: QUIT_PLAN_TABLE,
    KeyConditionExpression: 'PK = :pk',
    ExpressionAttributeValues: { ':pk': pk },
    ExclusiveStartKey: decodeCursor(cursor),
    Limit: safeLimit,
    ScanIndexForward: true,
  }))

  return {
    participants: (response.Items ?? []).map((item) => fromIndexItem(item as Record<string, unknown>)),
    next_cursor: encodeCursor(response.LastEvaluatedKey),
  }
}

async function lookupUsers(prefix: string, limit = 20) {
  const response = await documentClient.send(new QueryCommand({
    TableName: QUIT_PLAN_TABLE,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
    ExpressionAttributeValues: { ':pk': LOOKUP_PK, ':prefix': prefix },
    Limit: Math.max(1, Math.min(50, limit)),
  }))
  return (response.Items ?? [])
    .map((item) => typeof item.user_sub === 'string' ? item.user_sub : '')
    .filter(Boolean)
}

export async function searchParticipants(query: string, limit = 20): Promise<ParticipantIndexRecord[]> {
  const clean = query.trim().slice(0, 320)
  if (!clean) return []

  const userLookups = await lookupUsers(`USER#${clean}`, limit)
  const emailLookups = await lookupUsers(`EMAIL#${clean.toLowerCase()}`, limit)
  const userSubs = Array.from(new Set([...userLookups, ...emailLookups])).slice(0, limit)

  const records = await Promise.all(userSubs.map((userSub) => getMaster(userSub)))
  return records.filter((record): record is ParticipantIndexRecord => Boolean(record))
}

export async function getParticipantProfile(userSub: string): Promise<ParticipantProfile | null> {
  const response = await documentClient.send(new GetCommand({
    TableName: QUIT_PLAN_TABLE,
    Key: profileKey(userSub),
    ConsistentRead: true,
  }))
  if (!response.Item) return null
  const item = response.Item as Record<string, unknown>
  return {
    ...fromIndexItem(item),
    latest_safety_flags: Array.isArray(item.latest_safety_flags) ? item.latest_safety_flags.map(String) : undefined,
    receptionist_notes: typeof item.receptionist_notes === 'string' ? item.receptionist_notes : undefined,
    clinician_notes: typeof item.clinician_notes === 'string' ? item.clinician_notes : undefined,
    last_contact_at: typeof item.last_contact_at === 'string' ? item.last_contact_at : undefined,
    last_contact_by: typeof item.last_contact_by === 'string' ? item.last_contact_by : undefined,
    assigned_clinician: typeof item.assigned_clinician === 'string' ? item.assigned_clinician : undefined,
  }
}

export async function listParticipantAuditEvents(userSub: string, limit = 50): Promise<ParticipantAuditEvent[]> {
  const response = await documentClient.send(new QueryCommand({
    TableName: QUIT_PLAN_TABLE,
    KeyConditionExpression: 'PK = :pk',
    ExpressionAttributeValues: { ':pk': `AUDIT#CRM#${userSub}` },
    Limit: Math.max(1, Math.min(100, limit)),
    ScanIndexForward: false,
  }))
  return (response.Items ?? []).map((item) => ({
    event_id: String(item.event_id || ''),
    user_sub: String(item.user_sub || userSub),
    actor_sub: String(item.actor_sub || ''),
    actor_role: item.actor_role as StaffRole,
    event_type: 'crm_updated',
    changed_fields: Array.isArray(item.changed_fields) ? item.changed_fields.map(String) : [],
    changes: item.changes && typeof item.changes === 'object' ? item.changes as ParticipantAuditEvent['changes'] : {},
    created_at: String(item.created_at || ''),
  }))
}

function cleanText(value: string | null | undefined, max: number) {
  if (value == null) return undefined
  const clean = value.trim().slice(0, max)
  return clean || undefined
}

export async function updateParticipantCrm({
  userSub,
  actorSub,
  actorRole,
  patch,
}: {
  userSub: string
  actorSub: string
  actorRole: StaffRole
  patch: ParticipantUpdateInput
}) {
  const current = await getParticipantProfile(userSub)
  if (!current) throw new Error('participant_not_found')

  const next: ParticipantProfile = {
    ...current,
    workflow_status: patch.workflow_status ?? current.workflow_status,
    contact_status: patch.contact_status ?? current.contact_status,
    escalation_level: patch.escalation_level ?? current.escalation_level,
    appointment_at: patch.appointment_at === null ? undefined : cleanText(patch.appointment_at, 64) ?? current.appointment_at,
    receptionist_notes: patch.receptionist_notes === null ? undefined : cleanText(patch.receptionist_notes, 4000) ?? current.receptionist_notes,
    clinician_notes: patch.clinician_notes === null ? undefined : cleanText(patch.clinician_notes, 6000) ?? current.clinician_notes,
    assigned_clinician: patch.assigned_clinician === null ? undefined : cleanText(patch.assigned_clinician, 200) ?? current.assigned_clinician,
    updated_at: new Date().toISOString(),
  }

  const changedFields = (Object.keys(patch) as Array<keyof ParticipantUpdateInput>).filter((key) => {
    const nextValue = next[key as keyof ParticipantProfile]
    const currentValue = current[key as keyof ParticipantProfile]
    return JSON.stringify(nextValue ?? null) !== JSON.stringify(currentValue ?? null)
  })
  if (!changedFields.length) return current

  const changes: ParticipantAuditEvent['changes'] = {}
  for (const field of changedFields) {
    changes[field] = {
      from: current[field as keyof ParticipantProfile],
      to: next[field as keyof ParticipantProfile],
    }
  }

  const indexRecord: ParticipantIndexRecord = {
    user_sub: next.user_sub,
    email: next.email,
    email_verified: next.email_verified,
    language: next.language,
    workflow_status: next.workflow_status,
    contact_status: next.contact_status,
    escalation_level: next.escalation_level,
    latest_plan_id: next.latest_plan_id,
    latest_plan_created_at: next.latest_plan_created_at,
    product_types: next.product_types,
    readiness_category: next.readiness_category,
    support_intensity: next.support_intensity,
    referral_needed: next.referral_needed,
    safety_hold: next.safety_hold,
    appointment_at: next.appointment_at,
    updated_at: next.updated_at,
    created_at: next.created_at,
  }

  const auditId = randomUUID()
  const audit: ParticipantAuditEvent = {
    event_id: auditId,
    user_sub: userSub,
    actor_sub: actorSub,
    actor_role: actorRole,
    event_type: 'crm_updated',
    changed_fields: changedFields,
    changes,
    created_at: next.updated_at,
  }

  const profileItem = {
    PK: `USER#${userSub}`,
    SK: 'CRM#PROFILE',
    entity_type: 'participant_crm_profile',
    schema_version: CRM_SCHEMA_VERSION,
    ...next,
  }

  const tx = [
    { Put: { TableName: QUIT_PLAN_TABLE, Item: summaryItem(indexRecord, MASTER_PK) } },
    { Put: { TableName: QUIT_PLAN_TABLE, Item: profileItem } },
    { Put: { TableName: QUIT_PLAN_TABLE, Item: summaryItem(indexRecord, statusPk(next.workflow_status)) } },
    { Put: { TableName: QUIT_PLAN_TABLE, Item: summaryItem(indexRecord, escalationPk(next.escalation_level)) } },
    {
      Put: {
        TableName: QUIT_PLAN_TABLE,
        Item: {
          PK: `AUDIT#CRM#${userSub}`,
          SK: `${audit.created_at}#${auditId}`,
          entity_type: 'participant_crm_audit',
          ...audit,
        },
        ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)',
      },
    },
    ...(current.workflow_status !== next.workflow_status ? [{
      Delete: { TableName: QUIT_PLAN_TABLE, Key: { PK: statusPk(current.workflow_status), SK: participantSk(userSub) } },
    }] : []),
    ...(current.escalation_level !== next.escalation_level ? [{
      Delete: { TableName: QUIT_PLAN_TABLE, Key: { PK: escalationPk(current.escalation_level), SK: participantSk(userSub) } },
    }] : []),
  ]

  await documentClient.send(new TransactWriteCommand({ TransactItems: tx }))
  return next
}

export async function removeStaleLookup({ kind, value, userSub }: { kind: 'EMAIL'; value: string; userSub: string }) {
  await documentClient.send(new DeleteCommand({
    TableName: QUIT_PLAN_TABLE,
    Key: { PK: LOOKUP_PK, SK: `${kind}#${normaliseEmail(value)}#USER#${userSub}` },
  }))
}

export async function ensureUserLookup(userSub: string) {
  await documentClient.send(new PutCommand({
    TableName: QUIT_PLAN_TABLE,
    Item: { PK: LOOKUP_PK, SK: `USER#${userSub}`, entity_type: 'participant_crm_lookup', user_sub: userSub, updated_at: new Date().toISOString() },
  }))
}
