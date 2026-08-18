import { cookies } from 'next/headers'
import AqlaHome from '@/components/AqlaHome'
import { authCookies, verifyCognitoIdToken } from '@/lib/cognito'

export const dynamic = 'force-dynamic'

export default async function AqlaPage() {
  const cookieStore = await cookies()
  const idToken = cookieStore.get(authCookies.idToken)?.value

  let signedIn = false
  let email: string | undefined

  if (idToken) {
    try {
      const user = await verifyCognitoIdToken(idToken)
      signedIn = true
      email = typeof user.email === 'string' ? user.email : undefined
    } catch {
      signedIn = false
    }
  }

  return <AqlaHome signedIn={signedIn} email={email} />
}
