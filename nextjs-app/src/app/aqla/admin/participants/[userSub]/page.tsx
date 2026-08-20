import { notFound, redirect } from 'next/navigation'
import ParticipantCrmEditor from '@/components/ParticipantCrmEditor'
import { getAqlaStaffRole, getCurrentAqlaUser } from '@/lib/current-user.server'
import { getParticipantProfile, listParticipantAuditEvents } from '@/lib/crm/participant.server'
import { getPersonalTwin } from '@/lib/personal-twin.server'
import { getQuitPlan } from '@/lib/quit-engine/store.server'

export const dynamic = 'force-dynamic'

function dateLabel(value?: string) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
}

function show(value: unknown) {
  if (value == null || value === '') return '—'
  if (Array.isArray(value)) return value.join(', ') || '—'
  return String(value).replaceAll('_', ' ')
}

export default async function ParticipantCrmDetailPage({
  params,
}: {
  params: Promise<{ userSub: string }>
}) {
  const user = await getCurrentAqlaUser()
  if (!user) redirect('/auth/login?returnTo=%2Faqla%2Fadmin%2Fparticipants')
  const role = getAqlaStaffRole(user)
  if (!role) redirect('/aqla/os')

  const route = await params
  const userSub = decodeURIComponent(route.userSub).trim().slice(0, 200)
  if (!userSub) notFound()

  const [participant, audit] = await Promise.all([
    getParticipantProfile(userSub),
    listParticipantAuditEvents(userSub, 30).catch(() => []),
  ])
  if (!participant) notFound()

  const canSeeClinical = role === 'admin' || role === 'clinician'
  let plan = null
  let twin = null
  if (canSeeClinical) {
    const [storedPlan, storedTwin] = await Promise.all([
      participant.latest_plan_id ? getQuitPlan(userSub, participant.latest_plan_id).catch(() => null) : Promise.resolve(null),
      getPersonalTwin(userSub).catch(() => null),
    ])
    plan = storedPlan
    twin = storedTwin
  }

  return (
    <main className="admin-page" dir="ltr" lang="en">
      <header className="admin-topbar">
        <a href="/aqla/admin/participants" className="admin-brand"><img src="/aqla-logo.png" alt="Aqla — أقلع" /><span><strong>Participant record</strong><small>{participant.email ?? participant.user_sub}</small></span></a>
        <div className="admin-actions"><a href="/aqla/admin/participants">Participants</a><a href="/aqla/admin">Command Centre</a><a href="/auth/logout">Sign out</a></div>
      </header>

      <section className="admin-shell">
        <div className="admin-heading">
          <div><span className="admin-eyebrow">AQLA CRM / {role.toUpperCase()}</span><h1>{participant.email ?? 'Participant account'}</h1><p>Account ID: <code>{participant.user_sub}</code></p></div>
        </div>

        {participant.safety_hold && canSeeClinical ? (
          <section className="admin-panel" style={{ borderColor: 'rgba(220,70,70,.65)' }}>
            <strong>Safety hold recorded on the latest plan.</strong>
            <p>Automated clinical-plan communications must not override the deterministic safety pathway. Review the participant state before routine outreach.</p>
          </section>
        ) : null}

        <section className="admin-kpis">
          <article className="admin-kpi"><span>Workflow</span><strong>{show(participant.workflow_status)}</strong><small>Operational state</small></article>
          <article className="admin-kpi"><span>Contact</span><strong>{show(participant.contact_status)}</strong><small>{participant.last_contact_at ? `Last update ${dateLabel(participant.last_contact_at)}` : 'No contact update recorded'}</small></article>
          <article className="admin-kpi"><span>Escalation</span><strong>{show(participant.escalation_level)}</strong><small>{participant.referral_needed ? 'Referral indicated by latest plan' : 'No current referral flag'}</small></article>
          <article className="admin-kpi"><span>Appointment</span><strong>{dateLabel(participant.appointment_at)}</strong><small>{participant.assigned_clinician ? `Assigned: ${participant.assigned_clinician}` : 'No clinician assigned'}</small></article>
        </section>

        {canSeeClinical ? (
          <section className="admin-grid">
            <article className="admin-panel">
              <div className="admin-panel-head"><div><span>Latest plan</span><h2>Structured clinical summary</h2></div><small>{dateLabel(participant.latest_plan_created_at)}</small></div>
              <div className="admin-status-list">
                <div><span>Products</span><strong>{show(participant.product_types)}</strong></div>
                <div><span>Readiness</span><strong>{show(participant.readiness_category)}</strong></div>
                <div><span>Aqla support intensity</span><strong>{typeof participant.support_intensity === 'number' ? `${participant.support_intensity}/10` : '—'}</strong></div>
                <div><span>Safety flags</span><strong>{show(participant.latest_safety_flags)}</strong></div>
                <div><span>Referral</span><strong>{participant.referral_needed ? 'Yes' : 'No'}</strong></div>
              </div>
              {plan?.result.referral_message ? <p className="admin-definition">{plan.result.referral_message}</p> : null}
              {plan?.result.first_24h_step ? <p className="admin-definition"><strong>First 24h step:</strong> {plan.result.first_24h_step}</p> : null}
            </article>

            <article className="admin-panel">
              <div className="admin-panel-head"><div><span>Personal Digital Twin</span><h2>Longitudinal state</h2></div><small>{twin?.updated_at ? dateLabel(twin.updated_at) : 'Unavailable'}</small></div>
              {twin ? <div className="admin-status-list">
                <div><span>Triggers</span><strong>{show(twin.triggers)}</strong></div>
                <div><span>Confidence</span><strong>{typeof twin.confidence_score === 'number' ? `${twin.confidence_score}/10` : '—'}</strong></div>
                <div><span>Readiness</span><strong>{typeof twin.readiness_score === 'number' ? `${twin.readiness_score}/10` : '—'}</strong></div>
                <div><span>Previous attempts</span><strong>{show(twin.previous_quit_attempts)}</strong></div>
                <div><span>Follow-up records</span><strong>{twin.followups ? Object.keys(twin.followups).length : 0}</strong></div>
              </div> : <p>Structured Twin state is not available for this participant.</p>}
            </article>
          </section>
        ) : (
          <section className="admin-panel"><strong>Receptionist view</strong><p>Clinical plan content, safety details and Personal Digital Twin data are intentionally hidden from this role. Contact workflow information remains available below.</p></section>
        )}

        <ParticipantCrmEditor participant={participant} role={role} />

        <section className="admin-panel">
          <div className="admin-panel-head"><div><span>Audit</span><h2>Recent CRM changes</h2></div><small>Immutable staff-change events</small></div>
          {audit.length ? <div className="admin-status-list">
            {audit.map((event) => <div key={event.event_id}><span>{dateLabel(event.created_at)} · {event.actor_role}</span><strong>{event.changed_fields.join(', ')}</strong></div>)}
          </div> : <div className="admin-empty">No staff CRM changes have been recorded yet.</div>}
        </section>
      </section>
    </main>
  )
}
