import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentAqlaUser, hasAqlaRole } from '@/lib/current-user.server'
import { AWS_DATA_DICTIONARY_VERSION } from '@/lib/research/data-dictionary'
import { RESEARCH_EXPORT_SCHEMA_VERSION } from '@/lib/research/export.server'

export const dynamic = 'force-dynamic'

export default async function ResearchExportsPage(){
 const user=await getCurrentAqlaUser();if(!user)redirect('/auth/login?returnTo=%2Faqla%2Fadmin%2Fresearch-exports');if(!hasAqlaRole(user,'admin'))redirect('/aqla')
 const enabled=process.env.AQLA_RESEARCH_EXPORT_ENABLED==='true'
 return <main className="eng-page" dir="ltr" lang="en"><div className="eng-shell">
  <header className="eng-top"><Link className="eng-brand" href="/aqla/admin"><img src="/aqla-logo.png" alt="Aqla"/><span>Aqla Research Exports</span></Link><nav className="eng-nav"><Link href="/aqla/admin/data-dictionary">Data Dictionary</Link><Link href="/aqla/admin/participants">Participant CRM</Link><Link href="/aqla/admin">Command Centre</Link></nav></header>
  <section className="eng-card"><span className="eng-kicker">ADMIN / RESEARCH</span><h1>Pseudonymised research export</h1><p className="eng-muted">The AWS export excludes email, Cognito subject, staff notes, safety flags, communication suppression data and internal Aqla support-intensity scores. Participant and plan identifiers are replaced by deterministic research pseudonyms.</p><div className={`eng-note ${enabled?'':'eng-alert'}`}><strong>{enabled?'Export enabled':'Export disabled by default'}</strong><br/>{enabled?'The deployment governance flag is enabled. Confirm the applicable protocol/data-use scope before downloading.':'Set AQLA_RESEARCH_EXPORT_ENABLED=true only after the applicable protocol/data-use basis and scope are explicitly configured.'}</div><div className="eng-note" style={{marginTop:12}}>Export schema v{RESEARCH_EXPORT_SCHEMA_VERSION} · Data Dictionary v{AWS_DATA_DICTIONARY_VERSION}. Only the participant&apos;s latest saved plan is included in this first AWS export slice.</div>{enabled?<div className="eng-actions"><a className="eng-btn primary" href="/api/admin/research-export?limit=200">Download first 200 rows (CSV)</a><a className="eng-btn" href="/api/admin/research-export?limit=500">Download first 500 rows (CSV)</a></div>:null}</section>
  <section className="eng-card" style={{marginTop:16}}><h2>Current safeguards</h2><ul className="eng-list"><li><strong>Deny by default</strong><div className="eng-muted">The export endpoint returns 403 until the deployment explicitly enables research export.</div></li><li><strong>No direct identifiers</strong><div className="eng-muted">No name, email, phone, raw Cognito ID or staff notes.</div></li><li><strong>No clinical safety flags in research CSV</strong><div className="eng-muted">Safety data remains operational/clinical unless a protocol explicitly authorises a separate export.</div></li><li><strong>Version lineage retained</strong><div className="eng-muted">New plans carry plan, clinical-rule, scoring and follow-up policy versions.</div></li><li><strong>Paginated architecture</strong><div className="eng-muted">The endpoint reads the dedicated CRM partition rather than scanning the whole DynamoDB table. Large production exports should move to a controlled S3 export job.</div></li></ul></section>
 </div></main>
}
