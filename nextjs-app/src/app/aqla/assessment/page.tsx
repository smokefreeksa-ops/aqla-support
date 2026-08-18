import { cookies } from 'next/headers'
import QuitEngineAssessment from '@/components/QuitEngineAssessment'
import { authCookies, verifyCognitoIdToken } from '@/lib/cognito'

export const dynamic = 'force-dynamic'

export default async function AssessmentPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(authCookies.idToken)?.value
  let signedIn = false

  if (token) {
    try {
      await verifyCognitoIdToken(token)
      signedIn = true
    } catch {
      signedIn = false
    }
  }

  return <QuitEngineAssessment signedIn={signedIn} />
}
