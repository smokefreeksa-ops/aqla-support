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

export async function getCognitoClientSecret() {
  if (!cachedSecret) {
    cachedSecret = secretsClient
      .send(new GetSecretValueCommand({ SecretId: cognitoConfig.clientSecretId }))
      .then((result) => {
        if (!result.SecretString) throw new Error('Cognito client secret is empty')
        try {
          const parsed = JSON.parse(result.SecretString) as { clientSecret?: string }
          if (parsed.clientSecret) return parsed.clientSecret
        } catch {
          return result.SecretString
        }
        throw new Error('Cognito client secret is missing clientSecret')
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
