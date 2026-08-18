import { createHash, randomBytes } from 'node:crypto'
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose'

export const authCookies = {
  state: 'aqla_oauth_state',
  nonce: 'aqla_oauth_nonce',
  verifier: 'aqla_pkce_verifier',
  idToken: 'aqla_id_token',
  accessToken: 'aqla_access_token',
  refreshToken: 'aqla_refresh_token',
} as const

export function getCognitoConfig() {
  const clientId = process.env.COGNITO_CLIENT_ID
  const clientSecret = process.env.COGNITO_CLIENT_SECRET
  const issuer = process.env.COGNITO_ISSUER
  const domain = process.env.COGNITO_DOMAIN
  const appUrl = process.env.APP_URL

  const missing = [
    ['COGNITO_CLIENT_ID', clientId],
    ['COGNITO_CLIENT_SECRET', clientSecret],
    ['COGNITO_ISSUER', issuer],
    ['COGNITO_DOMAIN', domain],
    ['APP_URL', appUrl],
  ].filter(([, value]) => !value)

  if (missing.length > 0) {
    throw new Error(`Missing server environment variables: ${missing.map(([name]) => name).join(', ')}`)
  }

  return {
    clientId: clientId!,
    clientSecret: clientSecret!,
    issuer: issuer!.replace(/\/$/, ''),
    domain: domain!.replace(/\/$/, ''),
    appUrl: appUrl!.replace(/\/$/, ''),
  }
}

export function randomBase64Url(bytes = 32) {
  return randomBytes(bytes).toString('base64url')
}

export function createPkceChallenge(verifier: string) {
  return createHash('sha256').update(verifier).digest('base64url')
}

export async function verifyCognitoIdToken(idToken: string): Promise<JWTPayload> {
  const { issuer, clientId } = getCognitoConfig()
  const jwks = createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`))
  const { payload } = await jwtVerify(idToken, jwks, {
    issuer,
    audience: clientId,
  })
  return payload
}
