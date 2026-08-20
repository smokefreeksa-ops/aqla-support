import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import QuitPlanResult from '@/components/QuitPlanResult'
import { authCookies, verifyCognitoIdToken } from '@/lib/cognito'

export const dynamic = 'force-dynamic'

export default async function PlanPage({ params, searchParams }: { params: Promise<{ planId: string }>; searchParams: Promise<{ lang?: string }> }) {
  const { planId } = await params
  const query = await searchParams
  const lang = query.lang === 'en' ? 'en' : 'ar'
  const returnTo = `/aqla/plan/${encodeURIComponent(planId)}?lang=${lang}`

  if (!/^[0-9a-f-]{36}$/i.test(planId)) redirect('/aqla')

  const cookieStore = await cookies()
  const token = cookieStore.get(authCookies.idToken)?.value
  let authenticated = false

  if (token) {
    try {
      const payload = await verifyCognitoIdToken(token)
      authenticated = typeof payload.sub === 'string'
    } catch {
      authenticated = false
    }
  }

  if (!authenticated) {
    const refreshToken = cookieStore.get(authCookies.refreshToken)?.value
    redirect(refreshToken
      ? `/auth/refresh?returnTo=${encodeURIComponent(returnTo)}`
      : `/auth/login?returnTo=${encodeURIComponent(returnTo)}`)
  }

  return (
    <>
      <div className="screen-only" style={{ position: 'fixed', insetInlineEnd: 18, bottom: 18, zIndex: 1200 }}>
        <a
          className="qe-button primary"
          href={`/api/quit-engine/plan/${encodeURIComponent(planId)}/pdf?lang=${lang}`}
          style={{ boxShadow: '0 10px 30px rgba(0,0,0,.24)' }}
        >
          {lang === 'ar' ? 'PDF نصي' : 'Text PDF'}
        </a>
      </div>
      <QuitPlanResult planId={planId} initialLang={lang} />
    </>
  )
}
