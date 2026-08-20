import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { authCookies, verifyCognitoIdToken } from '@/lib/cognito'
import {
  getFollowupState,
  saveFollowupResponse,
  type FollowupOutcome,
  type FollowupType,
} from '@/lib/quit-engine/store.server'

export const dynamic = 'force-dynamic'

const followupTypes = new Set<FollowupType>(['day_3', 'day_7', 'day_30'])
const outcomes = new Set<FollowupOutcome>(['quit', 'reduced', 'continued', 'slipped', 'relapsed', 'needs_support'])

type Body = {
  outcome?: unknown
  craving_score?: unknown
  confidence_score?: unknown
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

function parseParams(planId: string, followupType: string) {
  if (!/^[0-9a-f-]{36}$/i.test(planId)) return null
  if (!followupTypes.has(followupType as FollowupType)) return null
  return { planId, followupType: followupType as FollowupType }
}

function score(value: unknown): number | null {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 10 ? parsed : null
}

export async function GET(_request: NextRequest, context: { params: Promise<{ planId: string; followupType: string }> }) {
  const userSub = await currentUserSub()
  if (!userSub) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })

  const raw = await context.params
  const params = parseParams(raw.planId, raw.followupType)
  if (!params) return NextResponse.json({ error: 'invalid_followup' }, { status: 400 })

  try {
    const followup = await getFollowupState(userSub, params.planId, params.followupType)
    if (!followup) return NextResponse.json({ error: 'not_found' }, { status: 404 })
    return NextResponse.json({ followup })
  } catch (error) {
    console.error('Aqla follow-up retrieval unavailable', error instanceof Error ? error.message : 'unknown')
    return NextResponse.json({ error: 'followup_unavailable' }, { status: 503 })
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ planId: string; followupType: string }> }) {
  const userSub = await currentUserSub()
  if (!userSub) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })

  const raw = await context.params
  const params = parseParams(raw.planId, raw.followupType)
  if (!params) return NextResponse.json({ error: 'invalid_followup' }, { status: 400 })

  let body: Body
  try {
    body = await request.json() as Body
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  if (typeof body.outcome !== 'string' || !outcomes.has(body.outcome as FollowupOutcome)) {
    return NextResponse.json({ error: 'invalid_outcome' }, { status: 400 })
  }

  const cravingScore = score(body.craving_score)
  const confidenceScore = score(body.confidence_score)
  if (cravingScore === null || confidenceScore === null) {
    return NextResponse.json({ error: 'invalid_score' }, { status: 400 })
  }

  try {
    const current = await getFollowupState(userSub, params.planId, params.followupType)
    if (!current) return NextResponse.json({ error: 'not_found' }, { status: 404 })

    const saved = await saveFollowupResponse({
      userSub,
      planId: params.planId,
      followupType: params.followupType,
      response: {
        outcome: body.outcome as FollowupOutcome,
        craving_score: cravingScore,
        confidence_score: confidenceScore,
      },
    })

    return NextResponse.json({ response: saved })
  } catch (error) {
    console.error('Aqla follow-up response persistence unavailable', error instanceof Error ? error.message : 'unknown')
    return NextResponse.json({ error: 'save_unavailable' }, { status: 503 })
  }
}
