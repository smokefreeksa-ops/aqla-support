type MetricMap = Record<string, number | undefined>
type DailyRow = { date: string; metrics: MetricMap; updated_at?: string }

const LOGO_URL = '/aqla-logo.png'

function valueOrNA(value: number | undefined, locale: string) {
  return typeof value === 'number' ? new Intl.NumberFormat(locale).format(value) : 'Not available'
}

export default function AdminCommandCentre({
  days,
  totals,
  rows,
}: {
  days: number
  totals: MetricMap
  rows: DailyRow[]
}) {
  const locale = 'en-GB'
  const cards = [
    ['Unique visitors', totals.unique_visitors, 'Unique first-party browser visitors in selected window'],
    ['Visits', totals.visits, 'Aqla page visit events'],
    ['AI conversations', totals.conversations_created, 'New saved Aqla conversations'],
    ['AI messages', totals.assistant_messages, 'Participant messages handled by Aqla OS'],
    ['Quit plans generated', totals.plan_generated, 'Plans successfully built by the quit engine'],
    ['Quit plans persisted', totals.plan_persisted, 'Plans saved to the participant account'],
    ['Plan emails sent', totals.plan_email_sent, 'Plan-ready or user-requested plan emails accepted by SES'],
    ['Plan email failures', totals.plan_email_failed, 'Plan email send attempts that failed'],
    ['Follow-ups completed', totals.followup_completed, 'Participant follow-up responses saved'],
    ['Craving support sessions', totals.craving_support_sessions, 'Aqla OS craving-support tool selections'],
    ['Safety escalations', totals.safety_escalations, 'Deterministic urgent-safety overrides in Aqla OS'],
    ['WhatsApp delivered', undefined, 'Available after official WhatsApp provider integration and delivery receipts'],
  ] as const

  const maxVisits = Math.max(1, ...rows.map((row) => row.metrics.visits ?? 0))
  const latestUpdated = rows.map((row) => row.updated_at).filter((value): value is string => Boolean(value)).sort().at(-1)

  return (
    <main className="admin-page" dir="ltr" lang="en">
      <header className="admin-topbar">
        <a href="/aqla/os" className="admin-brand"><img src={LOGO_URL} alt="Aqla — أقلع" /><span><strong>Aqla Command Centre</strong><small>Admin analytics · staging</small></span></a>
        <div className="admin-actions"><a href="/aqla/os">Aqla OS</a><a href="/auth/logout">Sign out</a></div>
      </header>

      <section className="admin-shell">
        <div className="admin-heading">
          <div><span className="admin-eyebrow">AQLA OS / ADMIN</span><h1>Operational command centre</h1><p>Real first-party counters only. Uninstrumented metrics are explicitly marked as unavailable.</p></div>
          <div className="admin-range" aria-label="Analytics date range">
            {[7, 30, 90].map((range) => <a key={range} className={range === days ? 'active' : ''} href={`/aqla/admin?days=${range}`}>{range} days</a>)}
          </div>
        </div>

        <div className="admin-meta"><span>Window: last {days} days</span><span>{latestUpdated ? `Last counter update: ${new Date(latestUpdated).toLocaleString(locale)}` : 'No counters recorded in this window yet'}</span></div>

        <section className="admin-kpis" aria-label="Aqla key performance indicators">
          {cards.map(([label, value, definition]) => (
            <article className="admin-kpi" key={label}>
              <span>{label}</span>
              <strong className={typeof value === 'number' ? '' : 'na'}>{valueOrNA(value, locale)}</strong>
              <small>{definition}</small>
            </article>
          ))}
        </section>

        <section className="admin-panel">
          <div className="admin-panel-head"><div><span>Traffic trend</span><h2>Visits by day</h2></div><small>First-party Aqla counters</small></div>
          {rows.length ? <div className="admin-bars">
            {rows.map((row) => {
              const visits = row.metrics.visits ?? 0
              const uniques = row.metrics.unique_visitors ?? 0
              return <div className="admin-bar-row" key={row.date}>
                <time>{row.date.slice(5)}</time>
                <div className="admin-bar-track"><span style={{ width: `${Math.max(2, (visits / maxVisits) * 100)}%` }} /></div>
                <strong>{visits}</strong><small>{uniques} unique</small>
              </div>
            })}
          </div> : <div className="admin-empty">No analytics counters have been recorded for this window yet.</div>}
        </section>

        <section className="admin-grid">
          <article className="admin-panel">
            <div className="admin-panel-head"><div><span>Journey funnel</span><h2>From visit to saved plan</h2></div></div>
            <div className="admin-funnel">
              <div><span>Visits</span><strong>{valueOrNA(totals.visits, locale)}</strong></div>
              <div><span>Plans generated</span><strong>{valueOrNA(totals.plan_generated, locale)}</strong></div>
              <div><span>Plans persisted</span><strong>{valueOrNA(totals.plan_persisted, locale)}</strong></div>
              <div><span>Follow-ups completed</span><strong>{valueOrNA(totals.followup_completed, locale)}</strong></div>
            </div>
            <p className="admin-definition">This is an operational funnel, not a cessation-outcome funnel. A generated plan or completed follow-up does not equal successful cessation.</p>
          </article>

          <article className="admin-panel">
            <div className="admin-panel-head"><div><span>Communications</span><h2>Channel status</h2></div></div>
            <div className="admin-status-list">
              <div><span>Email sent</span><strong>{valueOrNA(totals.plan_email_sent, locale)}</strong></div>
              <div><span>Email failures</span><strong>{valueOrNA(totals.plan_email_failed, locale)}</strong></div>
              <div><span>Email delivered</span><strong className="na">Not available</strong></div>
              <div><span>WhatsApp sent</span><strong className="na">Not available</strong></div>
              <div><span>WhatsApp delivered/read</span><strong className="na">Not available</strong></div>
            </div>
            <p className="admin-definition">Delivery/read metrics remain unavailable until provider receipts are integrated. “Sent” is never presented as “delivered”.</p>
          </article>
        </section>
      </section>
    </main>
  )
}
