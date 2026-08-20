import { cookies } from 'next/headers'
import AqlaPublicLanding from '@/components/AqlaPublicLanding'
import StudyInvitation from '@/components/StudyInvitation'
import { authCookies, verifyCognitoIdToken } from '@/lib/cognito'
import { getPublicVisitTotal, PUBLIC_VISIT_SEED } from '@/lib/analytics.server'
import { getLatestQuitPlanId } from '@/lib/quit-engine/store.server'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const cookieStore = await cookies()
  const idToken = cookieStore.get(authCookies.idToken)?.value

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
          console.error('Aqla homepage latest-plan lookup unavailable', error instanceof Error ? error.message : 'unknown')
        }
      }
    } catch {
      signedIn = false
    }
  }

  let initialVisitCount = PUBLIC_VISIT_SEED
  try {
    initialVisitCount = await getPublicVisitTotal()
  } catch (error) {
    console.error('Aqla public visit counter unavailable', error instanceof Error ? error.message : 'unknown')
  }

  return <>
    <AqlaPublicLanding signedIn={signedIn} latestPlanId={latestPlanId} initialVisitCount={initialVisitCount} />
    <StudyInvitation overlay />
  </>
}
