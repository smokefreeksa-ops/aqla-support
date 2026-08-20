import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AqlaHome from '@/components/AqlaHome'
import { authCookies, verifyCognitoIdToken } from '@/lib/cognito'
import { getLatestQuitPlanId } from '@/lib/quit-engine/store.server'

export const dynamic = 'force-dynamic'

export default async function AqlaPage() {
  const cookieStore = await cookies()
  const idToken = cookieStore.get(authCookies.idToken)?.value
  const refreshToken = cookieStore.get(authCookies.refreshToken)?.value

  let signedIn = false
  let latestPlanId: string | undefined

  if (idToken) {
    try {
      const user = await verifyCognitoIdToken(idToken)
      if (typeof user.sub === 'string') {
        signedIn = true
        try {
          latestPlanId = (await getLatestQuitPlanId(user.sub)) ?? undefined
        } catch (error) {
          console.error('Aqla latest-plan lookup unavailable', error instanceof Error ? error.message : 'unknown')
        }
      }
    } catch {
      signedIn = false
    }
  }

  if (!signedIn && refreshToken) {
    redirect(`/auth/refresh?returnTo=${encodeURIComponent('/aqla')}`)
  }

  return <AqlaHome signedIn={signedIn} latestPlanId={latestPlanId} />
}
