import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { authCookies, verifyCognitoIdToken } from '@/lib/cognito'

export const dynamic = 'force-dynamic'

export default async function AuthSuccessPage() {
  const cookieStore = await cookies()
  const idToken = cookieStore.get(authCookies.idToken)?.value

  if (!idToken) redirect('/auth/error?code=session_expired')

  try {
    await verifyCognitoIdToken(idToken)
  } catch {
    redirect('/auth/error?code=session_expired')
  }

  redirect('/aqla')
}
