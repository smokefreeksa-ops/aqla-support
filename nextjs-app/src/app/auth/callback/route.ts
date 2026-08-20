import { NextRequest, NextResponse } from 'next/server'
import {
  authCookies,
  cognitoConfig,
  getCognitoClientSecret,
  verifyCognitoIdToken,
} from '@/lib/cognito'

export const runtime = 'nodejs'

const RETURN_TO_COOKIE = 'aqla_auth_return_to'

type TokenResponse = {
  access_token: string
  id_token: string
  refresh_token?: string
  expires_in?: number
  token_type?: string
}

function safeReturnTo(value: string | undefined) {
  if (!value || !value.startsWith('/aqla') || value.startsWith('//')) return '/aqla'
  return value.slice(0, 500)
}

function authError(code: 'cancelled' | 'session_expired' | 'unavailable') {
  const response = NextResponse.redirect(new URL(`/auth/error?code=${code}`, cognitoConfig.appUrl))
  response.cookies.delete(authCookies.state)
  response.cookies.delete(authCookies.nonce)
  response.cookies.delete(authCookies.verifier)
  response.cookies.delete(RETURN_TO_COOKIE)
  return response
}

export async function GET(request: NextRequest) {
  const appUrl = cognitoConfig.appUrl
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')

  if (error || !code || !state) return authError('cancelled')

  const expectedState = request.cookies.get(authCookies.state)?.value
  const expectedNonce = request.cookies.get(authCookies.nonce)?.value
  const verifier = request.cookies.get(authCookies.verifier)?.value
  const returnTo = safeReturnTo(request.cookies.get(RETURN_TO_COOKIE)?.value)

  if (!expectedState || state !== expectedState || !expectedNonce || !verifier) {
    return authError('session_expired')
  }

  try {
    const clientSecret = await getCognitoClientSecret()
    const redirectUri = `${appUrl}/auth/callback`
    const tokenResponse = await fetch(`${cognitoConfig.domain}/oauth2/token`, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        authorization: `Basic ${Buffer.from(`${cognitoConfig.clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: cognitoConfig.clientId,
        code,
        redirect_uri: redirectUri,
        code_verifier: verifier,
      }),
      cache: 'no-store',
    })

    if (!tokenResponse.ok) {
      console.error('Cognito token exchange failed', tokenResponse.status)
      return authError('unavailable')
    }

    const tokens = (await tokenResponse.json()) as TokenResponse
    const payload = await verifyCognitoIdToken(tokens.id_token)

    if (payload.nonce !== expectedNonce) return authError('session_expired')

    const response = NextResponse.redirect(new URL(returnTo, appUrl))
    const authCookie = {
      httpOnly: true,
      secure: true,
      sameSite: 'lax' as const,
      path: '/',
    }

    response.cookies.set(authCookies.idToken, tokens.id_token, {
      ...authCookie,
      maxAge: tokens.expires_in ?? 60 * 60,
    })
    response.cookies.set(authCookies.accessToken, tokens.access_token, {
      ...authCookie,
      maxAge: tokens.expires_in ?? 60 * 60,
    })
    if (tokens.refresh_token) {
      response.cookies.set(authCookies.refreshToken, tokens.refresh_token, {
        ...authCookie,
        maxAge: 5 * 24 * 60 * 60,
      })
    }

    response.cookies.delete(authCookies.state)
    response.cookies.delete(authCookies.nonce)
    response.cookies.delete(authCookies.verifier)
    response.cookies.delete(RETURN_TO_COOKIE)

    return response
  } catch (callbackError) {
    console.error('Cognito callback failed', callbackError instanceof Error ? callbackError.message : 'Unknown error')
    return authError('unavailable')
  }
}
