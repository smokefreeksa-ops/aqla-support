import { NextRequest, NextResponse } from 'next/server'
import { authCookies, cognitoConfig } from '@/lib/cognito'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const logoutUrl = new URL(`${cognitoConfig.domain}/logout`)
  logoutUrl.searchParams.set('client_id', cognitoConfig.clientId)
  logoutUrl.searchParams.set('logout_uri', `${request.nextUrl.origin}/`)

  const response = NextResponse.redirect(logoutUrl)
  Object.values(authCookies).forEach((name) => response.cookies.delete(name))
  return response
}
