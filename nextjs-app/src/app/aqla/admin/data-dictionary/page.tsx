import { redirect } from 'next/navigation'
import { getCurrentAqlaUser, hasAqlaRole } from '@/lib/current-user.server'
import {
  AWS_DATA_DICTIONARY,
  AWS_DATA_DICTIONARY_VERSION,
  dictionaryBySection,
} from '@/lib/research/data-dictionary'
import { RESEARCH_INSTRUMENTS } from '@/lib/research/instruments'

export const dynamic = 'force-dynamic'

function statusLabel(mode: 'current' | 'optional_research' | 'derived' | 'system') {
  if (mode === 'current') return 'Collected now'
  if (mode === 'optional_research') return 'Protocol-enabled'
  if (mode === 'derived') return 'Derived'
  return 'System'
}

export default async function AqlaDataDictionaryPage() {
  const user = await getCurrentAqlaUser()
  if (!user || !hasAqlaRole(user, 'admin')) redirect('/aqla/os')

  const sections = dictionaryBySection()
  const instruments = Object.values(RESEARCH_INSTRUMENTS)

  return (
    <main className="admin-page" dir="ltr" lang="en">
      <header className="admin-topbar">
        <a href="/aqla/admin" className="admin-brand">
          <img src="/aqla-logo.png" alt="Aqla — أقلع" />
          <span><strong>Aqla Data Dictionary</strong><small>Research governance · staging</small></span>
        </a>
        <div className="admin-actions"><a href="/aqla/admin">Command Centre</a><a href="/aqla/os">Aqla OS</a></div>
      </header>

      <section className="admin-shell">
        <div className="admin-heading">
          <div>
            <span className="admin-eyebrow">AQLA OS / GOVERNANCE</span>
            <h1>Data dictionary</h1>
            <p>
              Version {AWS_DATA_DICTIONARY_VERSION}. This page distinguishes data already collected in AWS staging from
              optional protocol-specific research instruments and system-derived state.
            </p>
          </div>
        </div>

        <section className="admin-panel">
          <div className="admin-panel-head"><div><span>Instrument registry</span><h2>Dependence measures</h2></div></div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
              <thead>
                <tr>
                  {['Instrument', 'Product', 'Range', 'Validated', 'Governance note'].map((label) => (
                    <th key={label} style={{ textAlign: 'left', padding: '12px 10px', borderBottom: '1px solid rgba(255,255,255,.14)' }}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {instruments.map((instrument) => (
                  <tr key={instrument.id}>
                    <td style={{ padding: '12px 10px', borderBottom: '1px solid rgba(255,255,255,.08)' }}><strong>{instrument.name}</strong></td>
                    <td style={{ padding: '12px 10px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>{instrument.product}</td>
                    <td style={{ padding: '12px 10px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>{instrument.scoreRange}</td>
                    <td style={{ padding: '12px 10px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>{instrument.validated ? 'Yes' : 'No — adapted'}</td>
                    <td style={{ padding: '12px 10px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>{instrument.citation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {Object.entries(sections).map(([section, rows]) => (
          <section className="admin-panel" key={section}>
            <div className="admin-panel-head">
              <div><span>Data dictionary</span><h2>{section}</h2></div><small>{rows.length} variables</small>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1120 }}>
                <thead>
                  <tr>
                    {['Variable', 'English label', 'Type', 'Status', 'Source', 'Purpose', 'Research', 'Sensitive', 'Notes'].map((label) => (
                      <th key={label} style={{ textAlign: 'left', padding: '10px 8px', borderBottom: '1px solid rgba(255,255,255,.14)', fontSize: 12 }}>{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((entry) => (
                    <tr key={entry.variable}>
                      <td style={{ padding: '10px 8px', borderBottom: '1px solid rgba(255,255,255,.07)', fontFamily: 'monospace', fontSize: 12 }}>{entry.variable}</td>
                      <td style={{ padding: '10px 8px', borderBottom: '1px solid rgba(255,255,255,.07)' }}>{entry.labelEn}</td>
                      <td style={{ padding: '10px 8px', borderBottom: '1px solid rgba(255,255,255,.07)' }}>{entry.type}</td>
                      <td style={{ padding: '10px 8px', borderBottom: '1px solid rgba(255,255,255,.07)' }}>{statusLabel(entry.participantUi)}</td>
                      <td style={{ padding: '10px 8px', borderBottom: '1px solid rgba(255,255,255,.07)' }}>{entry.source}</td>
                      <td style={{ padding: '10px 8px', borderBottom: '1px solid rgba(255,255,255,.07)' }}>{entry.purpose}</td>
                      <td style={{ padding: '10px 8px', borderBottom: '1px solid rgba(255,255,255,.07)' }}>{entry.researchEligible ? 'Yes' : 'No'}</td>
                      <td style={{ padding: '10px 8px', borderBottom: '1px solid rgba(255,255,255,.07)' }}>{entry.identifiableOrSensitive ? 'Yes' : 'No'}</td>
                      <td style={{ padding: '10px 8px', borderBottom: '1px solid rgba(255,255,255,.07)', maxWidth: 340 }}>{entry.notes ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}

        <section className="admin-panel">
          <div className="admin-panel-head"><div><span>Governance</span><h2>Important interpretation rules</h2></div></div>
          <ul style={{ lineHeight: 1.8 }}>
            <li>FTND requires all six FTND items; it is not inferred from the simplified Aqla assessment.</li>
            <li>PSECDI uses the published 0–20 Penn State scoring, not the older simplified Aqla1 implementation.</li>
            <li>LWDS-11 retains its 11 × 0–3 scoring and threshold of 10 without invented severity bands.</li>
            <li>HONC-style and oral-nicotine screens remain explicitly adapted/non-validated.</li>
            <li>Research eligibility in this dictionary never overrides participant consent, protocol approval or data-governance rules.</li>
          </ul>
        </section>
      </section>
    </main>
  )
}
