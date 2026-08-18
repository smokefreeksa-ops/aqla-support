import { NextRequest, NextResponse } from 'next/server'
import {
  authCookies,
  cognitoConfig,
  getCognitoClientSecret,
  verifyCognitoIdToken,
} from '@/lib/cognito'

export const runtime = 'nodejs'

type TokenResponse = {
  access_token: string
  id_token: string
  refresh_token?: string
  expires_in?: number
  token_type?: string
}

export async function GET(request: NextRequest) {
  const appUrl = cognitoConfig.appUrl
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')

  if (error || !code || !state) {
    return NextResponse.redirect(new URL('/?auth=cancelled', appUrl))
  }

  const expectedState = request.cookies.get(authCookies.state)?.value
  const expectedNonce = request.cookies.get(authCookies.nonce)?.value
  const verifier = request.cookies.get(authCookies.verifier)?.value

  if (!expectedState || state !== expectedState || !expectedNonce || !verifier) {
    return NextResponse.redirect(new URL('/?auth=invalid_state', appUrl))
  }

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
    return NextResponse.redirect(new URL('/?auth=token_exchange_failed', appUrl))
  }

  const tokens = (await tokenResponse.json()) as TokenResponse
  const payload = await verifyCognitoIdToken(tokens.id_token)

  if (payload.nonce !== expectedNonce) {
    return NextResponse.redirect(new URL('/?auth=invalid_nonce', appUrl))
  }

  const response = NextResponse.redirect(new URL('/auth/success', appUrl))
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

  return response
}
