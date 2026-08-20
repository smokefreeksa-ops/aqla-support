import { NextRequest, NextResponse } from 'next/server'
import {
  authCookies,
  cognitoConfig,
  getCognitoClientSecret,
  verifyCognitoIdToken,
} from '@/lib/cognito'

export const runtime = 'nodejs'

function safeReturnTo(value: string | null) {
  if (!value || !value.startsWith('/aqla') || value.startsWith('//')) return '/aqla'
  return value.slice(0, 500)
}

function loginUrl(returnTo: string) {
  return new URL(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`, cognitoConfig.appUrl)
}

function clearAuth(response: NextResponse) {
  response.cookies.delete(authCookies.idToken)
  response.cookies.delete(authCookies.accessToken)
  response.cookies.delete(authCookies.refreshToken)
  return response
}

export async function GET(request: NextRequest) {
  const returnTo = safeReturnTo(new URL(request.url).searchParams.get('returnTo'))
  const refreshToken = request.cookies.get(authCookies.refreshToken)?.value
  if (!refreshToken) return NextResponse.redirect(loginUrl(returnTo))

  try {
    const clientSecret = await getCognitoClientSecret()
    const tokenResponse = await fetch(`${cognitoConfig.domain}/oauth2/token`, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        authorization: `Basic ${Buffer.from(`${cognitoConfig.clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: cognitoConfig.clientId,
        refresh_token: refreshToken,
      }),
      cache: 'no-store',
    })

    if (!tokenResponse.ok) {
      console.warn('Aqla Cognito refresh rejected', tokenResponse.status)
      return clearAuth(NextResponse.redirect(loginUrl(returnTo)))
    }

    const tokens = await tokenResponse.json() as {
      access_token?: string
      id_token?: string
      expires_in?: number
    }
    if (!tokens.id_token || !tokens.access_token) {
      console.warn('Aqla Cognito refresh returned incomplete tokens')
      return clearAuth(NextResponse.redirect(loginUrl(returnTo)))
    }

    await verifyCognitoIdToken(tokens.id_token)

    const response = NextResponse.redirect(new URL(returnTo, cognitoConfig.appUrl))
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: tokens.expires_in ?? 60 * 60,
    }
    response.cookies.set(authCookies.idToken, tokens.id_token, cookieOptions)
    response.cookies.set(authCookies.accessToken, tokens.access_token, cookieOptions)
    return response
  } catch (error) {
    console.error('Aqla session refresh unavailable', error instanceof Error ? error.message : 'unknown')
    return clearAuth(NextResponse.redirect(loginUrl(returnTo)))
  }
}
