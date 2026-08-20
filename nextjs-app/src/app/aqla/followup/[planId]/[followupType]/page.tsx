import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import FollowupCheckIn from '@/components/FollowupCheckIn'
import { authCookies, verifyCognitoIdToken } from '@/lib/cognito'
import { isFollowupType } from '@/lib/followup-policy'

export const dynamic = 'force-dynamic'

export default async function FollowupPage({
  params,
  searchParams,
}: {
  params: Promise<{ planId: string; followupType: string }>
  searchParams: Promise<{ lang?: string }>
}) {
  const raw = await params
  const query = await searchParams
  const lang = query.lang === 'en' ? 'en' : 'ar'

  if (!/^[0-9a-f-]{36}$/i.test(raw.planId) || !isFollowupType(raw.followupType)) {
    redirect('/aqla')
  }

  const returnTo = `/aqla/followup/${encodeURIComponent(raw.planId)}/${raw.followupType}?lang=${lang}`
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

  return <FollowupCheckIn planId={raw.planId} followupType={raw.followupType} initialLang={lang} />
}
