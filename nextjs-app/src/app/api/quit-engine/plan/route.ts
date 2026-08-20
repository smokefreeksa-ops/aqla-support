import { randomUUID } from 'node:crypto'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { authCookies, verifyCognitoIdToken } from '@/lib/cognito'
import { sendPlanReadyEmail } from '@/lib/email.server'
import { schedulePlanFollowups } from '@/lib/followup-scheduler.server'
import { openAIStructuredResponse } from '@/lib/openai.server'
import { buildPlan } from '@/lib/quit-engine/plan-builder'
import { persistQuitPlan } from '@/lib/quit-engine/store.server'
import type { StoredQuitPlan } from '@/lib/quit-engine/types'
import { validateEngineAnswers } from '@/lib/quit-engine/validation'

export const dynamic = 'force-dynamic'

type Body = { lang?: 'ar' | 'en'; answers?: unknown }
type Personalisation = { personal_summary: string; micro_challenge: string }
type CurrentUser = { sub: string; email?: string; emailVerified: boolean }
type EmailStatus = 'sent' | 'failed' | 'skipped_unverified' | 'skipped_plan_not_persisted'
type FollowupSchedulingStatus = 'scheduled' | 'partial' | 'failed' | 'skipped_unverified' | 'skipped_plan_not_persisted'

const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    personal_summary: { type: 'string' },
    micro_challenge: { type: 'string' },
  },
  required: ['personal_summary', 'micro_challenge'],
}

async function currentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(authCookies.idToken)?.value
  if (!token) return null

  try {
    const payload = await verifyCognitoIdToken(token)
    if (typeof payload.sub !== 'string') return null

    const email = typeof payload.email === 'string' ? payload.email.trim() : undefined
    const emailVerified = payload.email_verified === true || payload.email_verified === 'true'

    return { sub: payload.sub, email, emailVerified }
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })

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
    console.warn('Aqla quit engine validation failed', error instanceof Error ? error.message : 'unknown')
    return NextResponse.json({ error: 'invalid_answers' }, { status: 400 })
  }

  const result = buildPlan(answers, lang)
  let model: string | undefined
  let aiRequestId: string | undefined

  // The model only personalises language. Aqla's deterministic code owns scoring,
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
        instructions: `You personalise two short coaching fields for Aqla, a Saudi smoking and nicotine cessation support platform.\nAqla's application has already calculated all scoring, safety, referral and plan logic. Do not recalculate, contradict or reinterpret those decisions.\nDo not diagnose, prescribe, name a medication dose, or promise health outcomes.\nDo not shame the user. Support quitting now, reducing first, preparation, or relapse prevention.\nDo not mention that you are an AI.\nUse ${lang === 'ar' ? 'clear modern Arabic' : 'clear British English'}.\nThe personal_summary must be 1-3 sentences and explain why the first step fits this user's triggers and readiness.\nThe micro_challenge must be one concrete action that can be completed in the next 24 hours.\nReturn only the requested JSON schema.`,
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
      console.error('Aqla quit-plan personalisation unavailable', error instanceof Error ? error.message : 'unknown')
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

  const verifiedEmail = user.email && user.emailVerified ? user.email : undefined
  let emailStatus: EmailStatus = 'skipped_plan_not_persisted'
  let emailMessageId: string | undefined
  let followupSchedulingStatus: FollowupSchedulingStatus = 'skipped_plan_not_persisted'
  let followupScheduleResults: Awaited<ReturnType<typeof schedulePlanFollowups>>['results'] = []

  try {
    await persistQuitPlan({
      userSub: user.sub,
      plan,
      model,
      aiRequestId,
      recipientEmail: verifiedEmail,
      lang,
    })
    plan.persisted = true

    if (verifiedEmail) {
      const scheduling = await schedulePlanFollowups({ userSub: user.sub, plan })
      followupSchedulingStatus = scheduling.status
      followupScheduleResults = scheduling.results

      try {
        const sent = await sendPlanReadyEmail({
          to: verifiedEmail,
          planId: plan.plan_id,
          lang,
          followupsScheduled: scheduling.status === 'scheduled',
        })
        emailStatus = 'sent'
        emailMessageId = sent.messageId
      } catch (error) {
        // Email delivery failure must never remove or invalidate a successfully saved plan.
        emailStatus = 'failed'
        console.error('Aqla SES plan-ready email unavailable', error instanceof Error ? error.message : 'unknown')
      }
    } else {
      followupSchedulingStatus = 'skipped_unverified'
      emailStatus = 'skipped_unverified'
      console.warn('Aqla email and automated follow-ups skipped because the authenticated Cognito email is not verified')
    }
  } catch (error) {
    // The plan remains usable and is saved locally by the browser if staging
    // DynamoDB is temporarily unavailable. We deliberately do not send an email
    // that claims the plan is saved when persistence has failed.
    console.error('Aqla DynamoDB persistence unavailable', error instanceof Error ? error.message : 'unknown')
  }

  return NextResponse.json({
    plan,
    model: model ?? 'deterministic',
    email: { status: emailStatus, message_id: emailMessageId },
    followups: { status: followupSchedulingStatus, schedules: followupScheduleResults },
  })
}
