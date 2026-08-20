import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { incrementAnalyticsMetric } from '@/lib/analytics.server'
import { authCookies, verifyCognitoIdToken } from '@/lib/cognito'
import { validateMutationRequest } from '@/lib/http-security.server'
import { updatePersonalTwinFromFollowup } from '@/lib/personal-twin.server'
import {
  getFollowupState,
  saveFollowupResponse,
  type FollowupOutcome,
  type FollowupState,
  type FollowupType,
} from '@/lib/quit-engine/store.server'

export const dynamic = 'force-dynamic'

const PRIVATE_HEADERS = { 'Cache-Control': 'no-store, private' }
const followupTypes = new Set<FollowupType>(['day_3', 'day_7', 'day_30'])
const outcomes = new Set<FollowupOutcome>(['quit', 'reduced', 'continued', 'slipped', 'relapsed', 'needs_support'])

type Body = {
  outcome?: unknown
  craving_score?: unknown
  confidence_score?: unknown
}

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: PRIVATE_HEADERS })
}

async function track(metric: Parameters<typeof incrementAnalyticsMetric>[0]) {
  try {
    await incrementAnalyticsMetric(metric)
  } catch (error) {
    console.error('Aqla follow-up analytics unavailable', metric, error instanceof Error ? error.message : 'unknown')
  }
}

function participantFollowup(followup: FollowupState) {
  return {
    plan_id: followup.plan_id,
    followup_type: followup.followup_type,
    scheduled_at: followup.scheduled_at,
    available: followup.available,
    response: followup.response,
    previous_response: followup.previous_response,
  }
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
  if (!userSub) return json({ error: 'not_authenticated' }, 401)

  const raw = await context.params
  const params = parseParams(raw.planId, raw.followupType)
  if (!params) return json({ error: 'invalid_followup' }, 400)

  try {
    const followup = await getFollowupState(userSub, params.planId, params.followupType)
    if (!followup) return json({ error: 'not_found' }, 404)
    return json({ followup: participantFollowup(followup) })
  } catch (error) {
    console.error('Aqla follow-up retrieval unavailable', error instanceof Error ? error.message : 'unknown')
    return json({ error: 'followup_unavailable' }, 503)
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ planId: string; followupType: string }> }) {
  const mutationError = validateMutationRequest(request, 8 * 1024)
  if (mutationError) return json({ error: mutationError.error }, mutationError.status)

  const userSub = await currentUserSub()
  if (!userSub) return json({ error: 'not_authenticated' }, 401)

  const raw = await context.params
  const params = parseParams(raw.planId, raw.followupType)
  if (!params) return json({ error: 'invalid_followup' }, 400)

  let body: Body
  try {
    body = await request.json() as Body
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  if (typeof body.outcome !== 'string' || !outcomes.has(body.outcome as FollowupOutcome)) {
    return json({ error: 'invalid_outcome' }, 400)
  }

  const cravingScore = score(body.craving_score)
  const confidenceScore = score(body.confidence_score)
  if (cravingScore === null || confidenceScore === null) {
    return json({ error: 'invalid_score' }, 400)
  }

  try {
    const current = await getFollowupState(userSub, params.planId, params.followupType)
    if (!current) return json({ error: 'not_found' }, 404)
    if (!current.available) return json({ error: 'not_due', available_at: current.scheduled_at }, 409)

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

    await track('followup_completed')
    if (saved.outcome === 'slipped') await track('slip_recovery_sessions')
    if (saved.outcome === 'relapsed') await track('relapse_recovery_sessions')

    try {
      await updatePersonalTwinFromFollowup({ userSub, response: saved })
    } catch (error) {
      console.error('Aqla Personal Twin follow-up update unavailable', error instanceof Error ? error.message : 'unknown')
    }

    return json({ response: saved })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown'
    if (message === 'followup_not_due') return json({ error: 'not_due' }, 409)
    console.error('Aqla follow-up response persistence unavailable', message)
    return json({ error: 'save_unavailable' }, 503)
  }
}
