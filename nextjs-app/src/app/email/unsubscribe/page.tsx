import EmailUnsubscribeForm from '@/components/EmailUnsubscribeForm'
import { getUnsubscribeTokenState, type UnsubscribeScope } from '@/lib/communication-preferences.server'

export const dynamic = 'force-dynamic'

function scopeValue(value: string | undefined): UnsubscribeScope {
  if (value === 'research' || value === 'all_non_transactional') return value
  return 'followup'
}

export default async function EmailUnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; scope?: string }>
}) {
  const params = await searchParams
  const token = params.token?.trim().slice(0, 100) ?? ''
  const state = token ? await getUnsubscribeTokenState(token).catch(() => null) : null
  const scope = scopeValue(params.scope)

  return (
    <main className="ax-page" dir="rtl" lang="ar">
      <header className="ax-topbar">
        <a className="ax-brand" href="/aqla"><img src="/aqla-logo.png" alt="Aqla — أقلع" /><span>أقلع | Aqla</span></a>
      </header>
      <div className="ax-shell ax-narrow">
        <section className="ax-hero">
          <span className="ax-eyebrow">تفضيلات التواصل | Communication preferences</span>
          <h1>تحكم في رسائل البريد الإلكتروني</h1>
          <p>No email address or health information is displayed on this page.</p>
        </section>

        {state ? (
          <EmailUnsubscribeForm token={token} initialScope={scope} />
        ) : (
          <section className="ax-card">
            <h2>هذا الرابط غير صالح أو لم يعد متاحًا</h2>
            <p>This preference link is invalid or unavailable. You can return to Aqla and contact support if needed.</p>
            <a className="ax-button primary" href="/aqla">العودة إلى أقلع | Back to Aqla</a>
          </section>
        )}
      </div>
    </main>
  )
}
