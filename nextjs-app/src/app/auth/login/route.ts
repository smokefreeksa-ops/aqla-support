import { NextResponse } from 'next/server'
import {
  authCookies,
  createPkceChallenge,
  getCognitoConfig,
  randomBase64Url,
} from '@/lib/cognito'

export const runtime = 'nodejs'

export async function GET() {
  const { clientId, domain, appUrl } = getCognitoConfig()
  const state = randomBase64Url()
  const nonce = randomBase64Url()
  const verifier = randomBase64Url(48)
  const challenge = createPkceChallenge(verifier)
  const redirectUri = `${appUrl}/auth/callback`

  const authorizeUrl = new URL(`${domain}/oauth2/authorize`)
  authorizeUrl.searchParams.set('client_id', clientId)
  authorizeUrl.searchParams.set('response_type', 'code')
  authorizeUrl.searchParams.set('scope', 'openid email phone')
  authorizeUrl.searchParams.set('redirect_uri', redirectUri)
  authorizeUrl.searchParams.set('state', state)
  authorizeUrl.searchParams.set('nonce', nonce)
  authorizeUrl.searchParams.set('code_challenge_method', 'S256')
  authorizeUrl.searchParams.set('code_challenge', challenge)

  const response = NextResponse.redirect(authorizeUrl)
  const temporaryCookie = {
    httpOnly: true,
    secure: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 10 * 60,
  }

  response.cookies.set(authCookies.state, state, temporaryCookie)
  response.cookies.set(authCookies.nonce, nonce, temporaryCookie)
  response.cookies.set(authCookies.verifier, verifier, temporaryCookie)

  return response
}
