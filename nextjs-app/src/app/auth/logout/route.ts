import { NextResponse } from 'next/server'
import { authCookies, getCognitoConfig } from '@/lib/cognito'

export const runtime = 'nodejs'

export async function GET() {
  const { clientId, domain, appUrl } = getCognitoConfig()
  const logoutUrl = new URL(`${domain}/logout`)
  logoutUrl.searchParams.set('client_id', clientId)
  logoutUrl.searchParams.set('logout_uri', `${appUrl}/`)

  const response = NextResponse.redirect(logoutUrl)
  Object.values(authCookies).forEach((name) => response.cookies.delete(name))
  return response
}
