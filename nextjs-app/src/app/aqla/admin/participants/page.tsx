import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAqlaStaffRole, getCurrentAqlaUser } from '@/lib/current-user.server'
import { listParticipants, searchParticipants } from '@/lib/crm/participant.server'
import {
  ESCALATION_LEVELS,
  WORKFLOW_STATUSES,
  type EscalationLevel,
  type ParticipantIndexRecord,
  type WorkflowStatus,
} from '@/lib/crm/participant.types'

export const dynamic = 'force-dynamic'

function validStatus(value: string | undefined): WorkflowStatus | undefined {
  return value && (WORKFLOW_STATUSES as readonly string[]).includes(value) ? value as WorkflowStatus : undefined
}

function validEscalation(value: string | undefined): EscalationLevel | undefined {
  return value && (ESCALATION_LEVELS as readonly string[]).includes(value) ? value as EscalationLevel : undefined
}

function shortId(value: string) {
  return value.length > 18 ? `${value.slice(0, 8)}…${value.slice(-6)}` : value
}

function dateLabel(value?: string) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
}

function buildHref(params: Record<string, string | undefined>) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) if (value) query.set(key, value)
  const suffix = query.toString()
  return suffix ? `/aqla/admin/participants?${suffix}` : '/aqla/admin/participants'
}

export default async function ParticipantCrmPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; escalation?: string; cursor?: string }>
}) {
  const user = await getCurrentAqlaUser()
  if (!user) redirect('/auth/login?returnTo=%2Faqla%2Fadmin%2Fparticipants')
  const role = getAqlaStaffRole(user)
  if (!role) redirect('/aqla/os')

  const params = await searchParams
  const q = params.q?.trim().slice(0, 320) ?? ''
  const status = validStatus(params.status)
  const escalation = status ? undefined : validEscalation(params.escalation)
  const canSeeClinicalSummary = role === 'admin' || role === 'clinician'

  let participants: ParticipantIndexRecord[]
  let nextCursor: string | undefined
  let unavailable = false
  try {
    if (q) {
      participants = await searchParticipants(q, 50)
    } else {
      const result = await listParticipants({ status, escalation, cursor: params.cursor, limit: 50 })
      participants = result.participants
      nextCursor = result.next_cursor
    }
  } catch (error) {
    console.error('Aqla participant CRM unavailable', error instanceof Error ? error.message : 'unknown')
    participants = []
    unavailable = true
  }

  return (
    <main className="admin-page" dir="ltr" lang="en">
      <header className="admin-topbar">
        <Link href="/aqla/admin" className="admin-brand"><img src="/aqla-logo.png" alt="Aqla — أقلع" /><span><strong>Aqla Participant CRM</strong><small>{role} workspace · staging</small></span></Link>
        <div className="admin-actions"><Link href="/aqla/admin">Command Centre</Link><Link href="/aqla/os">Aqla OS</Link><a href="/auth/logout">Sign out</a></div>
      </header>

      <section className="admin-shell">
        <div className="admin-heading">
          <div><span className="admin-eyebrow">AQLA / OPERATIONS</span><h1>Participants</h1><p>Dedicated DynamoDB CRM indexes are queried directly. This page never scans the full journey table.</p></div>
        </div>

        <section className="admin-panel">
          <form method="get" style={{ display: 'grid', gridTemplateColumns: 'minmax(220px,2fr) minmax(160px,1fr) minmax(160px,1fr) auto', gap: 10, alignItems: 'end' }}>
            <label><span>Search</span><input name="q" defaultValue={q} placeholder="Email or Cognito account ID" /></label>
            <label><span>Workflow</span><select name="status" defaultValue={status ?? ''}><option value="">All</option>{WORKFLOW_STATUSES.map((item) => <option key={item} value={item}>{item.replaceAll('_', ' ')}</option>)}</select></label>
            <label><span>Escalation</span><select name="escalation" defaultValue={escalation ?? ''}><option value="">All</option>{ESCALATION_LEVELS.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            <button type="submit">Apply</button>
          </form>
          <div className="admin-actions" style={{ marginTop: 12 }}><Link href="/aqla/admin/participants">Clear filters</Link></div>
        </section>

        {unavailable ? <section className="admin-panel"><strong>CRM data is temporarily unavailable.</strong><p>No participant data is being shown as zero or empty by assumption.</p></section> : null}

        <section className="admin-panel" style={{ overflowX: 'auto' }}>
          <div className="admin-panel-head"><div><span>Operational register</span><h2>{q ? `Search results (${participants.length})` : 'Participant index'}</h2></div><small>50 per page</small></div>
          {participants.length ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 920 }}>
              <thead><tr><th align="left">Participant</th><th align="left">Workflow</th><th align="left">Contact</th><th align="left">Escalation</th>{canSeeClinicalSummary ? <><th align="left">Products</th><th align="left">Readiness</th></> : null}<th align="left">Latest plan</th><th align="left">Open</th></tr></thead>
              <tbody>
                {participants.map((participant) => (
                  <tr key={participant.user_sub} style={{ borderTop: '1px solid rgba(255,255,255,.08)' }}>
                    <td style={{ padding: '12px 10px 12px 0' }}><strong>{participant.email ?? 'No verified email'}</strong><br /><small title={participant.user_sub}>{shortId(participant.user_sub)}</small></td>
                    <td>{participant.workflow_status.replaceAll('_', ' ')}</td>
                    <td>{participant.contact_status.replaceAll('_', ' ')}</td>
                    <td><strong>{participant.escalation_level}</strong>{participant.safety_hold ? <><br /><small>Safety hold</small></> : null}</td>
                    {canSeeClinicalSummary ? <><td>{participant.product_types?.join(', ') || '—'}</td><td>{participant.readiness_category?.replaceAll('_', ' ') || '—'}</td></> : null}
                    <td>{dateLabel(participant.latest_plan_created_at)}</td>
                    <td><Link href={`/aqla/admin/participants/${encodeURIComponent(participant.user_sub)}`}>View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <div className="admin-empty">No participants matched this view.</div>}
        </section>

        {!q && nextCursor ? (
          <div className="admin-actions">
            <Link href={buildHref({ status, escalation, cursor: nextCursor })}>Next 50 →</Link>
          </div>
        ) : null}
      </section>
    </main>
  )
}
