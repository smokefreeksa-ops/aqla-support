import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import FollowupCheckIn from '@/components/FollowupCheckIn'
import { authCookies, verifyCognitoIdToken } from '@/lib/cognito'
import type { FollowupType } from '@/lib/quit-engine/store.server'

export const dynamic = 'force-dynamic'

const followupTypes = new Set<FollowupType>(['day_3', 'day_7', 'day_30'])

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

  if (!/^[0-9a-f-]{36}$/i.test(raw.planId) || !followupTypes.has(raw.followupType as FollowupType)) {
    redirect('/aqla')
  }

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

  const returnTo = `/aqla/followup/${encodeURIComponent(raw.planId)}/${raw.followupType}?lang=${lang}`
  if (!authenticated) redirect(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`)

  return <FollowupCheckIn planId={raw.planId} followupType={raw.followupType as FollowupType} initialLang={lang} />
}
