import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import QuitEngineAssessmentV4 from '@/components/QuitEngineAssessmentV4'
import { authCookies, verifyCognitoIdToken } from '@/lib/cognito'

export const dynamic = 'force-dynamic'

export default async function AssessmentPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(authCookies.idToken)?.value
  const refreshToken = cookieStore.get(authCookies.refreshToken)?.value
  let signedIn = false

  if (token) {
    try {
      await verifyCognitoIdToken(token)
      signedIn = true
    } catch {
      signedIn = false
    }
  }

  if (!signedIn && refreshToken) {
    redirect(`/auth/refresh?returnTo=${encodeURIComponent('/aqla/assessment')}`)
  }

  return <QuitEngineAssessmentV4 signedIn={signedIn} />
}
