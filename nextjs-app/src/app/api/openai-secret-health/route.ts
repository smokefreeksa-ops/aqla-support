import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { authCookies, verifyCognitoIdToken } from '@/lib/cognito'

export const dynamic = 'force-dynamic'

const client = new SecretsManagerClient({ region: 'eu-west-2' })

export async function GET() {
  const cookieStore = await cookies()
  const idToken = cookieStore.get(authCookies.idToken)?.value

  if (!idToken) {
    return NextResponse.json({ ok: false, reason: 'not_authenticated' }, { status: 401 })
  }

  try {
    await verifyCognitoIdToken(idToken)
  } catch {
    return NextResponse.json({ ok: false, reason: 'invalid_session' }, { status: 401 })
  }

  try {
    const result = await client.send(
      new GetSecretValueCommand({ SecretId: 'aqla/v2/staging/openai' }),
    )

    if (!result.SecretString) {
      return NextResponse.json({ ok: false, reason: 'secret_empty' }, { status: 500 })
    }

    let configured = false
    try {
      const parsed = JSON.parse(result.SecretString) as Record<string, unknown>
      configured = typeof parsed.apiKey === 'string' && parsed.apiKey.trim().length > 0
    } catch {
      configured = result.SecretString.trim().length > 0
    }

    return NextResponse.json({ ok: configured, secret: configured ? 'configured' : 'empty' })
  } catch (error) {
    console.error('OpenAI secret health check failed', error instanceof Error ? error.message : 'unknown')
    return NextResponse.json({ ok: false, reason: 'secret_unavailable' }, { status: 500 })
  }
}
