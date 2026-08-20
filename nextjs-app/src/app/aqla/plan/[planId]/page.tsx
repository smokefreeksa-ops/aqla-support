import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import QuitPlanResult from '@/components/QuitPlanResult'
import { authCookies, verifyCognitoIdToken } from '@/lib/cognito'

export const dynamic = 'force-dynamic'

export default async function PlanPage({ params, searchParams }: { params: Promise<{ planId: string }>; searchParams: Promise<{ lang?: string }> }) {
  const { planId } = await params
  const query = await searchParams
  const lang = query.lang === 'en' ? 'en' : 'ar'

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
    const returnTo = `/aqla/plan/${encodeURIComponent(planId)}?lang=${lang}`
    redirect(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`)
  }

  return <QuitPlanResult planId={planId} initialLang={lang} />
}
