import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { authCookies, verifyCognitoIdToken } from '@/lib/cognito'

export const dynamic = 'force-dynamic'

export default async function AuthSuccessPage() {
  const cookieStore = await cookies()
  const idToken = cookieStore.get(authCookies.idToken)?.value

  if (!idToken) redirect('/?auth=no_session')

  let user
  try {
    user = await verifyCognitoIdToken(idToken)
  } catch {
    redirect('/?auth=invalid_session')
  }

  const label =
    (typeof user.email === 'string' && user.email) ||
    (typeof user['cognito:username'] === 'string' && user['cognito:username']) ||
    'AQla user'

  return (
    <main className="min-h-screen bg-white px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold tracking-wide text-emerald-700">AQla v2</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Authentication successful</h1>
        <p className="mt-5 text-lg text-slate-600">
          Signed in securely with Amazon Cognito as <strong>{label}</strong>.
        </p>
        <div className="mt-8 flex gap-4">
          <a className="rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white" href="/">
            Continue to AQla
          </a>
          <a className="rounded-lg border border-slate-300 px-5 py-3 font-semibold" href="/auth/logout">
            Sign out
          </a>
        </div>
      </div>
    </main>
  )
}
