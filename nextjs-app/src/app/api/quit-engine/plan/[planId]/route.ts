import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { authCookies, verifyCognitoIdToken } from '@/lib/cognito'
import { getQuitPlan } from '@/lib/quit-engine/store.server'

export const dynamic = 'force-dynamic'

const PRIVATE_HEADERS = { 'Cache-Control': 'no-store, private' }

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: PRIVATE_HEADERS })
}

async function currentUserSub(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(authCookies.idToken)?.value
  if (!token) return null
  try {
    const payload = await verifyCognitoIdToken(token)
    return typeof payload.sub === 'string' ? payload.sub : null
  } catch {
    return null
  }
}

export async function GET(_request: Request, context: { params: Promise<{ planId: string }> }) {
  const userSub = await currentUserSub()
  if (!userSub) return json({ error: 'not_authenticated' }, 401)

  const { planId } = await context.params
  if (!/^[0-9a-f-]{36}$/i.test(planId)) return json({ error: 'invalid_plan_id' }, 400)

  try {
    const plan = await getQuitPlan(userSub, planId)
    if (!plan) return json({ error: 'not_found' }, 404)
    return json({ plan })
  } catch (error) {
    console.error('Aqla plan retrieval unavailable', error instanceof Error ? error.message : 'unknown')
    return json({ error: 'persistence_unavailable' }, 503)
  }
}
