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

const preferredKeys = new Set([
  'clientsecret',
  'cognitoclientsecret',
  'secret',
  'secretvalue',
  'value',
])

function normalizeKey(key: string) {
  return key.replace(/[^a-z0-9]/gi, '').toLowerCase()
}

function collectStringLeaves(value: unknown, depth = 0): string[] {
  if (depth > 5 || value == null) return []

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return []

    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        return collectStringLeaves(JSON.parse(trimmed), depth + 1)
      } catch {
        // Not nested JSON; treat as a plain string below.
      }
    }

    return [trimmed]
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectStringLeaves(item, depth + 1))
  }

  if (typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).flatMap((item) =>
      collectStringLeaves(item, depth + 1),
    )
  }

  return []
}

function extractPreferredObjectValue(value: unknown, depth = 0): string | undefined {
  if (depth > 5 || !value || typeof value !== 'object') return undefined

  if (Array.isArray(value)) {
    for (const item of value) {
      const nested = extractPreferredObjectValue(item, depth + 1)
      if (nested) return nested
    }
    return undefined
  }

  const object = value as Record<string, unknown>
  const entries = Object.entries(object)

  for (const [key, entryValue] of entries) {
    if (preferredKeys.has(normalizeKey(key))) {
      const values = collectStringLeaves(entryValue, depth + 1)
      if (values.length > 0) return values[0]
    }
  }

  const keyLabel = entries.find(([key]) => ['key', 'name'].includes(normalizeKey(key)))?.[1]
  const pairedValue = entries.find(([key]) => ['value', 'secretvalue'].includes(normalizeKey(key)))?.[1]
  if (typeof keyLabel === 'string' && normalizeKey(keyLabel).includes('clientsecret') && pairedValue != null) {
    const values = collectStringLeaves(pairedValue, depth + 1)
    if (values.length > 0) return values[0]
  }

  for (const [, entryValue] of entries) {
    const nested = extractPreferredObjectValue(entryValue, depth + 1)
    if (nested) return nested
  }

  return undefined
}

function extractSecretValue(secretString: string): string {
  const raw = secretString.trim()
  if (!raw) throw new Error('Cognito client secret is empty')

  let parsed: unknown = raw
  try {
    parsed = JSON.parse(raw)
  } catch {
    return raw
  }

  if (typeof parsed === 'string' && parsed.trim()) return parsed.trim()

  const preferred = extractPreferredObjectValue(parsed)
  if (preferred) return preferred

  const leaves = collectStringLeaves(parsed)
    .filter((value) => !['clientsecret', 'cognitoclientsecret', 'secret', 'secretvalue', 'value'].includes(normalizeKey(value)))

  if (leaves.length === 1) return leaves[0]

  const tokenLike = leaves
    .filter((value) => value.length >= 20 && /^[A-Za-z0-9+/=_-]+$/.test(value))
    .sort((a, b) => b.length - a.length)

  if (tokenLike.length > 0) return tokenLike[0]

  const topLevelKeys =
    parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? Object.keys(parsed as Record<string, unknown>).join(',')
      : typeof parsed

  throw new Error(`Cognito client secret has an unsupported Secrets Manager format (${topLevelKeys})`)
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
