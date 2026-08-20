import { NextRequest, NextResponse } from 'next/server'
import { getAqlaStaffRole, getCurrentAqlaUser } from '@/lib/current-user.server'
import {
  CONTACT_STATUSES,
  ESCALATION_LEVELS,
  WORKFLOW_STATUSES,
  updateParticipantCrm,
  type ContactStatus,
  type EscalationLevel,
  type ParticipantUpdateInput,
  type WorkflowStatus,
} from '@/lib/crm/participant.server'
import { validateMutationRequest } from '@/lib/http-security.server'

export const dynamic = 'force-dynamic'

const PRIVATE_HEADERS = { 'Cache-Control': 'no-store, private' }

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: PRIVATE_HEADERS })
}

function stringOrNull(value: unknown, max: number) {
  if (value === null) return null
  if (typeof value !== 'string') return undefined
  return value.trim().slice(0, max)
}

function enumValue<T extends string>(value: unknown, allowed: readonly T[]): T | undefined {
  return typeof value === 'string' && allowed.includes(value as T) ? value as T : undefined
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userSub: string }> },
) {
  const mutationError = validateMutationRequest(request, 16 * 1024)
  if (mutationError) return json({ error: mutationError.error }, mutationError.status)

  const user = await getCurrentAqlaUser()
  const role = user ? getAqlaStaffRole(user) : null
  if (!user) return json({ error: 'not_authenticated' }, 401)
  if (!role) return json({ error: 'not_authorised' }, 403)

  const { userSub } = await context.params
  const participantSub = decodeURIComponent(userSub).trim().slice(0, 200)
  if (!participantSub) return json({ error: 'participant_required' }, 400)

  let raw: Record<string, unknown>
  try {
    raw = await request.json() as Record<string, unknown>
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  const patch: ParticipantUpdateInput = {}
  const workflow = enumValue<WorkflowStatus>(raw.workflow_status, WORKFLOW_STATUSES)
  const contact = enumValue<ContactStatus>(raw.contact_status, CONTACT_STATUSES)
  const escalation = enumValue<EscalationLevel>(raw.escalation_level, ESCALATION_LEVELS)

  if (workflow) patch.workflow_status = workflow
  if (contact) patch.contact_status = contact
  if (escalation) patch.escalation_level = escalation

  if ('appointment_at' in raw) patch.appointment_at = stringOrNull(raw.appointment_at, 64)
  if ('receptionist_notes' in raw) patch.receptionist_notes = stringOrNull(raw.receptionist_notes, 4000)
  if ('clinician_notes' in raw) patch.clinician_notes = stringOrNull(raw.clinician_notes, 6000)
  if ('assigned_clinician' in raw) patch.assigned_clinician = stringOrNull(raw.assigned_clinician, 200)

  if (role === 'receptionist') {
    const receptionistWorkflow: WorkflowStatus[] = ['new', 'outreach', 'contacted', 'appointment', 'clinician_review', 'followup', 'unable_contact']
    if (patch.workflow_status && !receptionistWorkflow.includes(patch.workflow_status)) {
      return json({ error: 'workflow_not_allowed_for_role' }, 403)
    }
    if (patch.escalation_level && !['routine', 'priority'].includes(patch.escalation_level)) {
      return json({ error: 'escalation_not_allowed_for_role' }, 403)
    }
    delete patch.clinician_notes
    delete patch.assigned_clinician
  }

  if (role === 'clinician') {
    delete patch.receptionist_notes
  }

  if (!Object.keys(patch).length) return json({ error: 'no_valid_changes' }, 400)

  try {
    const participant = await updateParticipantCrm({
      userSub: participantSub,
      actorSub: user.sub,
      actorRole: role,
      patch,
    })
    return json({ participant })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'crm_update_failed'
    if (message === 'participant_not_found') return json({ error: message }, 404)
    console.error('Aqla CRM update failed', message)
    return json({ error: 'crm_update_failed' }, 500)
  }
}
