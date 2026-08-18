import { randomUUID } from 'node:crypto'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { authCookies, verifyCognitoIdToken } from '@/lib/cognito'
import { openAIStructuredResponse } from '@/lib/openai.server'
import { buildPlan } from '@/lib/quit-engine/plan-builder'
import { persistQuitPlan } from '@/lib/quit-engine/store.server'
import type { StoredQuitPlan } from '@/lib/quit-engine/types'
import { validateEngineAnswers } from '@/lib/quit-engine/validation'

export const dynamic = 'force-dynamic'

type Body = { lang?: 'ar' | 'en'; answers?: unknown }
type Personalisation = { personal_summary: string; micro_challenge: string }

const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    personal_summary: { type: 'string' },
    micro_challenge: { type: 'string' },
  },
  required: ['personal_summary', 'micro_challenge'],
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

export async function POST(request: NextRequest) {
  const userSub = await currentUserSub()
  if (!userSub) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })

  let body: Body
  try {
    body = await request.json() as Body
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const lang = body.lang === 'en' ? 'en' : 'ar'
  let answers
  try {
    answers = validateEngineAnswers(body.answers)
  } catch (error) {
    console.warn('AQla quit engine validation failed', error instanceof Error ? error.message : 'unknown')
    return NextResponse.json({ error: 'invalid_answers' }, { status: 400 })
  }

  const result = buildPlan(answers, lang)
  let model: string | undefined
  let aiRequestId: string | undefined

  // The model only personalises language. AQla's deterministic code owns scoring,
  // safety, referral and pathway logic. Never send names or account identifiers.
  if (!result.safety_immediate) {
    try {
      const anonymised = {
        products: answers.product_types,
        mixed_use: answers.mixed_use,
        triggers: answers.triggers,
        importance: answers.importance_score,
        confidence: answers.confidence_score,
        readiness: answers.readiness_score,
        previous_attempt: answers.previous_quit_attempts ?? null,
        relapse_causes: answers.relapse_causes,
        personal_reasons: answers.personal_reasons,
        dependence_category: result.dependence_category,
        referral_needed: result.referral_needed,
        deterministic_first_step: result.first_24h_step,
      }

      const ai = await openAIStructuredResponse<Personalisation>({
        schemaName: 'aqla_quit_plan_personalisation',
        schema,
        maxOutputTokens: 300,
        instructions: `You personalise two short coaching fields for AQla, a Saudi smoking and nicotine cessation support platform.\nAQla's application has already calculated all scoring, safety, referral and plan logic. Do not recalculate, contradict or reinterpret those decisions.\nDo not diagnose, prescribe, name a medication dose, or promise health outcomes.\nDo not shame the user. Support quitting now, reducing first, preparation, or relapse prevention.\nDo not mention that you are an AI.\nUse ${lang === 'ar' ? 'clear modern Arabic' : 'clear British English'}.\nThe personal_summary must be 1-3 sentences and explain why the first step fits this user's triggers and readiness.\nThe micro_challenge must be one concrete action that can be completed in the next 24 hours.\nReturn only the requested JSON schema.`,
        input: JSON.stringify(anonymised),
      })

      const personalSummary = ai.data.personal_summary?.trim().slice(0, 900)
      const microChallenge = ai.data.micro_challenge?.trim().slice(0, 500)
      if (personalSummary) result.ai_personal_summary = personalSummary
      if (microChallenge) result.ai_micro_challenge = microChallenge
      result.ai_used = Boolean(personalSummary || microChallenge)
      model = ai.model
      aiRequestId = ai.requestId
    } catch (error) {
      console.error('AQla quit-plan personalisation unavailable', error instanceof Error ? error.message : 'unknown')
      result.ai_used = false
    }
  } else {
    result.ai_used = false
  }

  const plan: StoredQuitPlan = {
    plan_id: randomUUID(),
    created_at: new Date().toISOString(),
    version: 1,
    persisted: false,
    answers,
    result,
  }

  try {
    await persistQuitPlan({ userSub, plan, model, aiRequestId })
    plan.persisted = true
  } catch (error) {
    // The plan remains usable and is saved locally by the browser until the
    // staging DynamoDB resource is provisioned/available.
    console.error('AQla DynamoDB persistence unavailable', error instanceof Error ? error.message : 'unknown')
  }

  return NextResponse.json({ plan, model: model ?? 'deterministic' })
}
