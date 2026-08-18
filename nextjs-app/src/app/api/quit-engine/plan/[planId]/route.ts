import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { authCookies, verifyCognitoIdToken } from '@/lib/cognito'
import { getQuitPlan } from '@/lib/quit-engine/store.server'

export const dynamic = 'force-dynamic'

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
  if (!userSub) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })

  const { planId } = await context.params
  if (!/^[0-9a-f-]{36}$/i.test(planId)) return NextResponse.json({ error: 'invalid_plan_id' }, { status: 400 })

  try {
    const plan = await getQuitPlan(userSub, planId)
    if (!plan) return NextResponse.json({ error: 'not_found' }, { status: 404 })
    return NextResponse.json({ plan })
  } catch (error) {
    console.error('AQla plan retrieval unavailable', error instanceof Error ? error.message : 'unknown')
    return NextResponse.json({ error: 'persistence_unavailable' }, { status: 503 })
  }
}
