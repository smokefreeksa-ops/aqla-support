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
import { buildPersonalPlanV2Enrichment, deriveCigaretteBand, validatePersonalPlanV2Answers, type PersonalPlanV2Answers, type PersonalPlanV2Enrichment } from '@/lib/personal-plan-v2'
import { savePersonalPlanV2TwinContext } from '@/lib/personal-plan-v2.server'
import { buildPlan } from '@/lib/quit-engine/plan-builder'
import { persistQuitPlan } from '@/lib/quit-engine/store.server'
import type { EngineAnswers, EngineResult, StoredQuitPlan } from '@/lib/quit-engine/types'
import { validateEngineAnswers } from '@/lib/quit-engine/validation'
import { currentPlanProvenance } from '@/lib/quit-engine/versioning'

export const dynamic = 'force-dynamic'

const PRIVATE_HEADERS = { 'Cache-Control': 'no-store, private' }
type Body = { lang?: 'ar' | 'en'; answers?: unknown; personal_plan_v2?: unknown }
type V2Answers = EngineAnswers & { personal_plan_v2: PersonalPlanV2Answers }
type V2Result = EngineResult & { personal_plan_v2: PersonalPlanV2Enrichment }
type V2Plan = Omit<StoredQuitPlan, 'answers' | 'result'> & { answers: V2Answers; result: V2Result }

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
  required: ['personal_summary', 'pattern_explanation', 'first_24h_coaching', 'seventy_two_hour_coaching', 'trigger_coaching', 'relapse_recovery', 'support_person_message', 'micro_challenge'],
}

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: PRIVATE_HEADERS })
}

async function track(metric: Parameters<typeof incrementAnalyticsMetric>[0]) {
  try { await incrementAnalyticsMetric(metric) } catch { /* analytics must not block care */ }
}

function clippedList(values: unknown, maxItems: number, maxLength: number) {
  if (!Array.isArray(values)) return []
  return values.filter((value): value is string => typeof value === 'string').map((value) => value.trim().slice(0, maxLength)).filter(Boolean).slice(0, maxItems)
}

export async function POST(request: NextRequest) {
  const mutationError = validateMutationRequest(request, 48 * 1024)
  if (mutationError) return json({ error: mutationError.error }, mutationError.status)

  const user = await getCurrentAqlaUser()
  if (!user) return json({ error: 'not_authenticated' }, 401)

  let body: Body
  try { body = await request.json() as Body } catch { return json({ error: 'invalid_json' }, 400) }
  const lang = body.lang === 'en' ? 'en' : 'ar'

  let rawBase = body.answers
  if (rawBase && typeof rawBase === 'object' && body.personal_plan_v2 && typeof body.personal_plan_v2 === 'object') {
    const candidate = body.personal_plan_v2 as Record<string, unknown>
    const quantity = typeof candidate.cigarette_quantity === 'number' ? candidate.cigarette_quantity : Number(candidate.cigarette_quantity)
    const period = candidate.cigarette_quantity_period === 'week' ? 'week' : candidate.cigarette_quantity_period === 'day' ? 'day' : undefined
    const derivedBand = deriveCigaretteBand(Number.isFinite(quantity) ? quantity : undefined, period)
    if (derivedBand) rawBase = { ...(rawBase as Record<string, unknown>), cigarettes_per_day: derivedBand }
  }

  let answers: EngineAnswers
  try { answers = validateEngineAnswers(rawBase) } catch (error) {
    console.warn('Aqla Personal Plan v2 base validation failed', error instanceof Error ? error.message : 'unknown')
    return json({ error: 'invalid_answers' }, 400)
  }

  let v2Answers: PersonalPlanV2Answers
  try { v2Answers = validatePersonalPlanV2Answers(body.personal_plan_v2, answers) } catch (error) {
    console.warn('Aqla Personal Plan v2 enrichment validation failed', error instanceof Error ? error.message : 'unknown')
    return json({ error: 'invalid_personal_plan_v2' }, 400)
  }

  const result = buildPlan(answers, lang) as V2Result
  result.follow_up_schedule = FOLLOWUP_DEFINITIONS.map((item) => ({ ...item }))
  result.personal_plan_v2 = buildPersonalPlanV2Enrichment(v2Answers, lang)
  const provenance = currentPlanProvenance()
  result.provenance = provenance

  let model: string | undefined
  let aiRequestId: string | undefined

  if (!result.safety_immediate) {
    try {
      const anonymised = {
        products: answers.product_types,
        primary_product: answers.primary_product ?? null,
        mixed_use: answers.mixed_use,
        triggers: answers.triggers,
        additional_triggers: v2Answers.additional_triggers,
        importance: answers.importance_score,
        confidence: answers.confidence_score,
        readiness: answers.readiness_score,
        previous_attempt: answers.previous_quit_attempts ?? null,
        previous_support_methods: v2Answers.previous_quit_support_methods,
        relapse_causes: answers.relapse_causes,
        personal_reasons: answers.personal_reasons,
        additional_motivations: v2Answers.additional_motivations,
        support_knowledge: v2Answers.cessation_support_knowledge,
        treatment_interests: v2Answers.treatment_info_interests,
        preferred_support: v2Answers.preferred_support_channels,
        change_goal: v2Answers.change_goal_type,
        quit_date_choice: v2Answers.quit_date_choice,
        target_quit_date: v2Answers.target_quit_date ?? null,
        reduction_target_percent: v2Answers.reduction_target_percent ?? null,
        dependence_category: result.dependence_category,
        readiness_category: result.readiness_category,
        support_intensity: result.aqla_support_intensity,
        referral_needed: result.referral_needed,
        deterministic_first_step: result.first_24h_step,
        deterministic_72h: result.seventy_two_hour_plan,
        deterministic_7day: result.seven_day_plan,
        deterministic_trigger_plans: result.trigger_plans.map((section) => ({ title: section.title, steps: section.steps })),
      }

      const ai = await openAIStructuredResponse<Personalisation>({
        schemaName: 'aqla_personal_quit_plan_v2',
        schema,
        maxOutputTokens: 1000,
        instructions: `You personalise the coaching layer of Aqla, a Saudi smoking and nicotine cessation support platform. The deterministic engine is authoritative for scoring, safety, referral and pathway constraints. Never contradict it. Do not diagnose, prescribe, select medication doses, promise outcomes or invent facts. Use ${lang === 'ar' ? 'clear modern Arabic suitable for Saudi users' : 'clear British English'}. Use the supplied goal, quit-date preference, previous support experience, treatment-information interests, support preferences, triggers and motivations to make coaching more specific. Do not mention AI. Do not use financial spending values because they are deliberately withheld from the model. Return only the requested JSON schema.`,
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
      result.ai_used = Boolean(personalSummary || patternExplanation || first24h || coaching72h.length || triggerCoaching.length || relapseRecovery || supportPersonMessage || microChallenge)
      model = ai.model
      aiRequestId = ai.requestId
    } catch (error) {
      console.error('Aqla Personal Plan v2 AI personalisation unavailable', error instanceof Error ? error.message : 'unknown')
      result.ai_used = false
    }
  } else {
    result.ai_used = false
  }

  const plan: V2Plan = {
    plan_id: randomUUID(),
    created_at: new Date().toISOString(),
    version: 1,
    persisted: false,
    provenance,
    answers: { ...answers, personal_plan_v2: v2Answers },
    result,
  }

  await track('plan_generated')
  const verifiedEmail = user.email && user.emailVerified ? user.email : undefined

  try {
    await persistQuitPlan({ userSub: user.sub, plan, model, aiRequestId, recipientEmail: verifiedEmail, lang })
    plan.persisted = true
    await track('plan_persisted')

    try { await updatePersonalTwinFromPlan({ userSub: user.sub, plan, lang }) } catch (error) {
      console.error('Aqla Personal Twin base update unavailable', error instanceof Error ? error.message : 'unknown')
    }
    try { await savePersonalPlanV2TwinContext({ userSub: user.sub, planId: plan.plan_id, answers: v2Answers, enrichment: result.personal_plan_v2 }) } catch (error) {
      console.error('Aqla Personal Plan v2 Twin context unavailable', error instanceof Error ? error.message : 'unknown')
    }
    try { await upsertParticipantCrmFromPlan({ userSub: user.sub, email: verifiedEmail, emailVerified: user.emailVerified, plan, lang }) } catch (error) {
      console.error('Aqla CRM indexing unavailable', error instanceof Error ? error.message : 'unknown')
    }

    if (result.safety_immediate) {
      console.warn('Aqla routine communications held because the saved plan has an immediate safety flag')
    } else if (verifiedEmail) {
      let followupsScheduled = false
      if (v2Answers.followup_email_opt_in) {
        const scheduling = await schedulePlanFollowups({ userSub: user.sub, plan })
        followupsScheduled = scheduling.status === 'scheduled'
      }
      if (v2Answers.plan_email_opt_in) {
        try {
          await sendPlanReadyEmail({ to: verifiedEmail, planId: plan.plan_id, lang, followupsScheduled })
          await track('plan_email_sent')
        } catch (error) {
          await track('plan_email_failed')
          console.error('Aqla SES plan-ready email unavailable', error instanceof Error ? error.message : 'unknown')
        }
      }
    }
  } catch (error) {
    console.error('Aqla DynamoDB persistence unavailable', error instanceof Error ? error.message : 'unknown')
  }

  return json({ plan })
}
