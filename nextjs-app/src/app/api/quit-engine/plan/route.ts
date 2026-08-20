import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { incrementAnalyticsMetric } from '@/lib/analytics.server'
import { upsertParticipantCrmFromPlan } from '@/lib/crm/participant.server'
import { getCurrentAqlaUser } from '@/lib/current-user.server'
import { sendPlanReadyEmail } from '@/lib/email.server'
import { FOLLOWUP_DEFINITIONS } from '@/lib/followup-policy'
import { schedulePlanFollowups } from '@/lib/followup-scheduler.server'
import { validateMutationRequest } from '@/lib/http-security.server'
import { openAIStructuredResponse } from '@/lib/openai.server'
import { updatePersonalTwinFromPlan } from '@/lib/personal-twin.server'
import { buildPlan } from '@/lib/quit-engine/plan-builder'
import { persistQuitPlan } from '@/lib/quit-engine/store.server'
import type { StoredQuitPlan } from '@/lib/quit-engine/types'
import { validateEngineAnswers } from '@/lib/quit-engine/validation'

export const dynamic = 'force-dynamic'

const PRIVATE_HEADERS = { 'Cache-Control': 'no-store, private' }

type Body = { lang?: 'ar' | 'en'; answers?: unknown }
type Personalisation = {
  personal_summary: string
  pattern_explanation: string
  first_24h_coaching: string
  seventy_two_hour_coaching: string[]
  trigger_coaching: string[]
  relapse_recovery: string
  support_person_message: string
  micro_challenge: string
}

const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    personal_summary: { type: 'string' },
    pattern_explanation: { type: 'string' },
    first_24h_coaching: { type: 'string' },
    seventy_two_hour_coaching: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 3 },
    trigger_coaching: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 4 },
    relapse_recovery: { type: 'string' },
    support_person_message: { type: 'string' },
    micro_challenge: { type: 'string' },
  },
  required: [
    'personal_summary',
    'pattern_explanation',
    'first_24h_coaching',
    'seventy_two_hour_coaching',
    'trigger_coaching',
    'relapse_recovery',
    'support_person_message',
    'micro_challenge',
  ],
}

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: PRIVATE_HEADERS })
}

async function track(metric: Parameters<typeof incrementAnalyticsMetric>[0]) {
  try {
    await incrementAnalyticsMetric(metric)
  } catch (error) {
    console.error('Aqla plan analytics unavailable', metric, error instanceof Error ? error.message : 'unknown')
  }
}

function clippedList(values: unknown, maxItems: number, maxLength: number) {
  if (!Array.isArray(values)) return []
  return values
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.trim().slice(0, maxLength))
    .filter(Boolean)
    .slice(0, maxItems)
}

export async function POST(request: NextRequest) {
  const mutationError = validateMutationRequest(request, 32 * 1024)
  if (mutationError) return json({ error: mutationError.error }, mutationError.status)

  const user = await getCurrentAqlaUser()
  if (!user) return json({ error: 'not_authenticated' }, 401)

  let body: Body
  try {
    body = await request.json() as Body
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  const lang = body.lang === 'en' ? 'en' : 'ar'
  let answers
  try {
    answers = validateEngineAnswers(body.answers)
  } catch (error) {
    console.warn('Aqla quit engine validation failed', error instanceof Error ? error.message : 'unknown')
    return json({ error: 'invalid_answers' }, 400)
  }

  const result = buildPlan(answers, lang)
  // Versioned longitudinal policy: early support is intentionally denser, while
  // later points include formal outcome checkpoints. This is an Aqla operational
  // cadence informed by cessation guidance, not a claim that every listed day is
  // itself a universally mandated clinical standard.
  result.follow_up_schedule = FOLLOWUP_DEFINITIONS.map((item) => ({ ...item }))

  let model: string | undefined
  let aiRequestId: string | undefined

  // Aqla's deterministic engine remains authoritative for scoring, safety,
  // referral and pathway constraints. OpenAI receives a minimised structured
  // context and personalises the human experience inside those constraints.
  if (!result.safety_immediate) {
    try {
      const anonymised = {
        products: answers.product_types,
        primary_product: answers.primary_product ?? null,
        mixed_use: answers.mixed_use,
        triggers: answers.triggers,
        importance: answers.importance_score,
        confidence: answers.confidence_score,
        readiness: answers.readiness_score,
        previous_attempt: answers.previous_quit_attempts ?? null,
        longest_abstinence: answers.longest_abstinence ?? null,
        relapse_causes: answers.relapse_causes,
        personal_reasons: answers.personal_reasons,
        dependence_category: result.dependence_category,
        readiness_category: result.readiness_category,
        support_intensity: result.aqla_support_intensity,
        referral_needed: result.referral_needed,
        deterministic_first_step: result.first_24h_step,
        deterministic_72h: result.seventy_two_hour_plan,
        deterministic_7day: result.seven_day_plan,
        deterministic_trigger_plans: result.trigger_plans.map((section) => ({ title: section.title, steps: section.steps })),
        deterministic_craving_card: result.craving_card,
      }

      const ai = await openAIStructuredResponse<Personalisation>({
        schemaName: 'aqla_quit_plan_personalisation_v2',
        schema,
        maxOutputTokens: 950,
        instructions: `You personalise the coaching layer of Aqla, a Saudi smoking and nicotine cessation support platform.\nAqla's deterministic engine has already calculated all scoring, safety, referral, readiness and pathway decisions. Treat every deterministic field in the input as a constraint. Never recalculate, contradict, weaken or reinterpret those decisions.\nDo not diagnose, prescribe, choose medication doses, promise outcomes or invent facts.\nDo not shame the participant. Support quitting now, preparation, reduction-first or relapse prevention according to the supplied state.\nDo not mention that you are an AI.\nUse ${lang === 'ar' ? 'clear modern Arabic suitable for Saudi users' : 'clear British English'}.\nPersonalise using the participant's actual product pattern, triggers, confidence/readiness, reasons and previous attempt information when present.\nDo not repeat generic template text if a more specific explanation is supported.\nThe personal_summary should be 2-4 concise sentences explaining the overall pattern and next direction.\nThe pattern_explanation should explain how the supplied triggers/product pattern connect to the plan without making medical claims.\nThe first_24h_coaching should turn the deterministic first step into an immediately usable personal action.\nThe 72-hour coaching array should contain 1-3 concise personalised coaching points that complement, not replace, the deterministic 72-hour plan.\nThe trigger_coaching array should contain 1-4 specific strategies tied to supplied triggers.\nThe relapse_recovery field should be a short non-shaming recovery strategy grounded in previous attempts/relapse causes when present.\nThe support_person_message should be a ready-to-send short message for a trusted support person; if no support-person context exists, make it generic and optional.\nThe micro_challenge must be one concrete action achievable in the next 24 hours.\nReturn only the requested JSON schema.`,
        input: JSON.stringify(anonymised),
      })

      const personalSummary = ai.data.personal_summary?.trim().slice(0, 1200)
      const patternExplanation = ai.data.pattern_explanation?.trim().slice(0, 1200)
      const first24h = ai.data.first_24h_coaching?.trim().slice(0, 900)
      const coaching72h = clippedList(ai.data.seventy_two_hour_coaching, 3, 600)
      const triggerCoaching = clippedList(ai.data.trigger_coaching, 4, 600)
      const relapseRecovery = ai.data.relapse_recovery?.trim().slice(0, 900)
      const supportPersonMessage = ai.data.support_person_message?.trim().slice(0, 800)
      const microChallenge = ai.data.micro_challenge?.trim().slice(0, 500)

      if (personalSummary) result.ai_personal_summary = personalSummary
      if (patternExplanation) result.ai_pattern_explanation = patternExplanation
      if (first24h) result.ai_first_24h_coaching = first24h
      if (coaching72h.length) result.ai_seventy_two_hour_coaching = coaching72h
      if (triggerCoaching.length) result.ai_trigger_coaching = triggerCoaching
      if (relapseRecovery) result.ai_relapse_recovery = relapseRecovery
      if (supportPersonMessage) result.ai_support_person_message = supportPersonMessage
      if (microChallenge) result.ai_micro_challenge = microChallenge
      result.ai_used = Boolean(
        personalSummary || patternExplanation || first24h || coaching72h.length || triggerCoaching.length || relapseRecovery || supportPersonMessage || microChallenge,
      )
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

  await track('plan_generated')

  const verifiedEmail = user.email && user.emailVerified ? user.email : undefined

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
    await track('plan_persisted')

    try {
      await updatePersonalTwinFromPlan({ userSub: user.sub, plan, lang })
    } catch (error) {
      console.error('Aqla Personal Twin plan update unavailable', error instanceof Error ? error.message : 'unknown')
    }

    try {
      await upsertParticipantCrmFromPlan({
        userSub: user.sub,
        email: verifiedEmail,
        emailVerified: user.emailVerified,
        plan,
        lang,
      })
    } catch (error) {
      // CRM indexing is operational metadata and must never invalidate a saved
      // participant plan. Staff are shown unavailable data rather than fabricated rows.
      console.error('Aqla CRM indexing unavailable', error instanceof Error ? error.message : 'unknown')
    }

    // Explicit safety hold: do not send a routine plan-ready email or create
    // routine automated follow-up schedules when the deterministic engine has
    // identified an immediate safety pathway. The saved plan remains available.
    if (result.safety_immediate) {
      console.warn('Aqla routine communications held because the saved plan has an immediate safety flag')
    } else if (verifiedEmail) {
      const scheduling = await schedulePlanFollowups({ userSub: user.sub, plan })

      try {
        await sendPlanReadyEmail({
          to: verifiedEmail,
          planId: plan.plan_id,
          lang,
          followupsScheduled: scheduling.status === 'scheduled',
        })
        await track('plan_email_sent')
      } catch (error) {
        await track('plan_email_failed')
        // Email delivery failure must never remove or invalidate a successfully saved plan.
        console.error('Aqla SES plan-ready email unavailable', error instanceof Error ? error.message : 'unknown')
      }
    } else {
      console.warn('Aqla email and automated follow-ups skipped because the authenticated Cognito email is not verified')
    }
  } catch (error) {
    // The plan remains usable in this browser session if staging persistence is
    // temporarily unavailable. No email is sent claiming that it was saved.
    console.error('Aqla DynamoDB persistence unavailable', error instanceof Error ? error.message : 'unknown')
  }

  // Participant-facing responses contain only the plan. Internal model names,
  // SES identifiers and scheduler details stay in server-side logs and storage.
  return json({ plan })
}
