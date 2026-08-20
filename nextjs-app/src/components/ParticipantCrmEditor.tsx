'use client'

import { FormEvent, useState } from 'react'
import {
  CONTACT_STATUSES,
  ESCALATION_LEVELS,
  WORKFLOW_STATUSES,
  type ContactStatus,
  type EscalationLevel,
  type ParticipantProfile,
  type StaffRole,
  type WorkflowStatus,
} from '@/lib/crm/participant.types'

const workflowLabels: Record<WorkflowStatus, string> = {
  new: 'New',
  outreach: 'Outreach',
  contacted: 'Contacted',
  appointment: 'Appointment',
  clinician_review: 'Clinician review',
  followup: 'Follow-up',
  completed: 'Completed',
  unable_contact: 'Unable to contact',
  closed: 'Closed',
}

const contactLabels: Record<ContactStatus, string> = {
  not_contacted: 'Not contacted',
  attempted: 'Attempted',
  reached: 'Reached',
  appointment_booked: 'Appointment booked',
  declined: 'Declined',
  unable_contact: 'Unable to contact',
}

const escalationLabels: Record<EscalationLevel, string> = {
  none: 'None',
  routine: 'Routine',
  priority: 'Priority',
  urgent: 'Urgent',
}

function localDateTime(value?: string) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

export default function ParticipantCrmEditor({
  participant,
  role,
}: {
  participant: ParticipantProfile
  role: StaffRole
}) {
  const [workflow, setWorkflow] = useState<WorkflowStatus>(participant.workflow_status)
  const [contact, setContact] = useState<ContactStatus>(participant.contact_status)
  const [escalation, setEscalation] = useState<EscalationLevel>(participant.escalation_level)
  const [appointment, setAppointment] = useState(localDateTime(participant.appointment_at))
  const [receptionistNotes, setReceptionistNotes] = useState(participant.receptionist_notes ?? '')
  const [clinicianNotes, setClinicianNotes] = useState(participant.clinician_notes ?? '')
  const [assignedClinician, setAssignedClinician] = useState(participant.assigned_clinician ?? '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const receptionist = role === 'receptionist'
  const clinician = role === 'clinician'
  const allowedWorkflow = receptionist
    ? WORKFLOW_STATUSES.filter((status) => !['completed', 'closed'].includes(status))
    : WORKFLOW_STATUSES
  const allowedEscalation = receptionist
    ? ESCALATION_LEVELS.filter((level) => level === 'routine' || level === 'priority')
    : ESCALATION_LEVELS

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (saving) return
    setSaving(true)
    setMessage('')

    const payload: Record<string, unknown> = {
      workflow_status: workflow,
      contact_status: contact,
      escalation_level: escalation,
      appointment_at: appointment ? new Date(appointment).toISOString() : null,
    }
    if (!clinician) payload.receptionist_notes = receptionistNotes
    if (!receptionist) {
      payload.clinician_notes = clinicianNotes
      payload.assigned_clinician = assignedClinician
    }

    try {
      const response = await fetch(`/api/admin/participants/${encodeURIComponent(participant.user_sub)}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json() as { error?: string }
      if (!response.ok) throw new Error(data.error || 'update_failed')
      setMessage('Saved')
      window.setTimeout(() => window.location.reload(), 350)
    } catch (error) {
      setMessage(error instanceof Error ? `Could not save: ${error.message}` : 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="admin-panel" onSubmit={submit}>
      <div className="admin-panel-head"><div><span>Workflow</span><h2>Participant management</h2></div><small>Role: {role}</small></div>

      <div className="admin-grid" style={{ marginTop: 18 }}>
        <label>
          <span>Workflow status</span>
          <select value={workflow} onChange={(event) => setWorkflow(event.target.value as WorkflowStatus)}>
            {allowedWorkflow.map((status) => <option value={status} key={status}>{workflowLabels[status]}</option>)}
          </select>
        </label>
        <label>
          <span>Contact status</span>
          <select value={contact} onChange={(event) => setContact(event.target.value as ContactStatus)}>
            {CONTACT_STATUSES.map((status) => <option value={status} key={status}>{contactLabels[status]}</option>)}
          </select>
        </label>
        <label>
          <span>Escalation</span>
          <select value={allowedEscalation.includes(escalation) ? escalation : allowedEscalation[0]} onChange={(event) => setEscalation(event.target.value as EscalationLevel)}>
            {allowedEscalation.map((level) => <option value={level} key={level}>{escalationLabels[level]}</option>)}
          </select>
        </label>
        <label>
          <span>Appointment</span>
          <input type="datetime-local" value={appointment} onChange={(event) => setAppointment(event.target.value)} />
        </label>
      </div>

      {!clinician ? (
        <label style={{ display: 'grid', gap: 8, marginTop: 18 }}>
          <span>Reception / contact notes</span>
          <textarea rows={5} maxLength={4000} value={receptionistNotes} onChange={(event) => setReceptionistNotes(event.target.value)} />
        </label>
      ) : null}

      {!receptionist ? (
        <>
          <label style={{ display: 'grid', gap: 8, marginTop: 18 }}>
            <span>Assigned clinician</span>
            <input maxLength={200} value={assignedClinician} onChange={(event) => setAssignedClinician(event.target.value)} placeholder="Name or service identifier" />
          </label>
          <label style={{ display: 'grid', gap: 8, marginTop: 18 }}>
            <span>Clinical notes</span>
            <textarea rows={7} maxLength={6000} value={clinicianNotes} onChange={(event) => setClinicianNotes(event.target.value)} />
          </label>
        </>
      ) : null}

      <div className="admin-actions" style={{ marginTop: 18 }}>
        <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
        {message ? <span>{message}</span> : null}
      </div>
    </form>
  )
}
