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
