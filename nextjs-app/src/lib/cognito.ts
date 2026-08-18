import { createHash, randomBytes } from 'node:crypto'
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager'
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose'

export const cognitoConfig = {
  region: 'eu-west-2',
  clientId: '7m1po5aph23iv3d9btms8n3udb',
  issuer: 'https://cognito-idp.eu-west-2.amazonaws.com/eu-west-2_xYZywGOuy',
  domain: 'https://eu-west-2xyzywgouy.auth.eu-west-2.amazoncognito.com',
  appUrl: 'https://staging.smokefreeksa.com',
  clientSecretId: 'aqla/v2/staging/cognito-client',
} as const

export const authCookies = {
  state: 'aqla_oauth_state',
  nonce: 'aqla_oauth_nonce',
  verifier: 'aqla_pkce_verifier',
  idToken: 'aqla_id_token',
  accessToken: 'aqla_access_token',
  refreshToken: 'aqla_refresh_token',
} as const

const secretsClient = new SecretsManagerClient({ region: cognitoConfig.region })
let cachedSecret: Promise<string> | undefined

function extractSecretValue(secretString: string): string {
  const raw = secretString.trim()
  if (!raw) throw new Error('Cognito client secret is empty')

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return raw
  }

  if (typeof parsed === 'string' && parsed.trim()) return parsed.trim()

  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    const entries = Object.entries(parsed as Record<string, unknown>)
    const normalized = new Map(
      entries.map(([key, value]) => [key.replace(/[^a-z0-9]/gi, '').toLowerCase(), value]),
    )

    for (const key of ['clientsecret', 'cognitoclientsecret', 'secret', 'value']) {
      const value = normalized.get(key)
      if (typeof value === 'string' && value.trim()) return value.trim()
    }

    const stringValues = entries
      .map(([, value]) => value)
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)

    if (stringValues.length === 1) return stringValues[0].trim()
  }

  throw new Error('Cognito client secret has an unsupported Secrets Manager format')
}

export async function getCognitoClientSecret() {
  if (!cachedSecret) {
    cachedSecret = secretsClient
      .send(new GetSecretValueCommand({ SecretId: cognitoConfig.clientSecretId }))
      .then((result) => {
        if (!result.SecretString) throw new Error('Cognito client secret is empty')
        return extractSecretValue(result.SecretString)
      })
  }

  try {
    return await cachedSecret
  } catch (error) {
    cachedSecret = undefined
    throw error
  }
}

export function randomBase64Url(bytes = 32) {
  return randomBytes(bytes).toString('base64url')
}

export function createPkceChallenge(verifier: string) {
  return createHash('sha256').update(verifier).digest('base64url')
}

export async function verifyCognitoIdToken(idToken: string): Promise<JWTPayload> {
  const jwks = createRemoteJWKSet(new URL(`${cognitoConfig.issuer}/.well-known/jwks.json`))
  const { payload } = await jwtVerify(idToken, jwks, {
    issuer: cognitoConfig.issuer,
    audience: cognitoConfig.clientId,
  })
  return payload
}
