import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { incrementAnalyticsMetric } from '@/lib/analytics.server'
import { buildAdaptiveTriage, validateAdaptiveAssessment, type AdaptiveAssessmentAnswers, type AdaptiveTriageProfile } from '@/lib/adaptive-assessment'
import { FOLLOWUP_DEFINITIONS } from '@/lib/followup-policy'
import { consumeGuestAiQuota } from '@/lib/guest-ai-quota.server'
import { validateMutationRequest } from '@/lib/http-security.server'
import { openAIStructuredResponse } from '@/lib/openai.server'
import { buildPersonalPlanV2Enrichment, deriveCigaretteBand, validatePersonalPlanV2Answers, type PersonalPlanV2Answers, type PersonalPlanV2Enrichment } from '@/lib/personal-plan-v2'
import { buildPlan } from '@/lib/quit-engine/plan-builder'
import type { EngineAnswers, EngineResult, StoredQuitPlan } from '@/lib/quit-engine/types'
import { validateEngineAnswers } from '@/lib/quit-engine/validation'
import { currentPlanProvenance } from '@/lib/quit-engine/versioning'

export const dynamic = 'force-dynamic'

const PRIVATE_HEADERS = { 'Cache-Control': 'no-store, private' }
const VISITOR_COOKIE = 'aqla_vid'
type Body = { lang?: 'ar' | 'en'; answers?: unknown; personal_plan_v2?: unknown; adaptive_assessment?: unknown }
type GuestAnswers = EngineAnswers & { personal_plan_v2: PersonalPlanV2Answers; adaptive_assessment: AdaptiveAssessmentAnswers }
type GuestResult = EngineResult & { personal_plan_v2: PersonalPlanV2Enrichment; adaptive_triage: AdaptiveTriageProfile }
type GuestPlan = Omit<StoredQuitPlan, 'answers' | 'result'> & { answers: GuestAnswers; result: GuestResult }

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

function json(body: unknown, status = 200) { return NextResponse.json(body, { status, headers: PRIVATE_HEADERS }) }
async function track(metric: Parameters<typeof incrementAnalyticsMetric>[0]) { try { await incrementAnalyticsMetric(metric) } catch { /* non-blocking */ } }
function clippedList(values: unknown, maxItems: number, maxLength: number) {
  if (!Array.isArray(values)) return []
  return values.filter((value): value is string => typeof value === 'string').map((value) => value.trim().slice(0, maxLength)).filter(Boolean).slice(0, maxItems)
}

export async function POST(request: NextRequest) {
  const mutationError = validateMutationRequest(request, 64 * 1024)
  if (mutationError) return json({ error: mutationError.error }, mutationError.status)

  let body: Body
  try { body = await request.json() as Body } catch { return json({ error: 'invalid_json' }, 400) }
  const lang = body.lang === 'en' ? 'en' : 'ar'
  const existingVisitorId = request.cookies.get(VISITOR_COOKIE)?.value?.trim()
  const visitorId = existingVisitorId || randomUUID()

  let rawBase = body.answers
  if (rawBase && typeof rawBase === 'object' && body.personal_plan_v2 && typeof body.personal_plan_v2 === 'object') {
    const candidate = body.personal_plan_v2 as Record<string, unknown>
    const quantity = typeof candidate.cigarette_quantity === 'number' ? candidate.cigarette_quantity : Number(candidate.cigarette_quantity)
    const period = candidate.cigarette_quantity_period === 'week' ? 'week' : candidate.cigarette_quantity_period === 'day' ? 'day' : undefined
    const derivedBand = deriveCigaretteBand(Number.isFinite(quantity) ? quantity : undefined, period)
    if (derivedBand) rawBase = { ...(rawBase as Record<string, unknown>), cigarettes_per_day: derivedBand }
  }

  let answers: EngineAnswers
  try { answers = validateEngineAnswers(rawBase) } catch {
    return json({ error: 'invalid_answers' }, 400)
  }

  let validatedV2: PersonalPlanV2Answers
  try { validatedV2 = validatePersonalPlanV2Answers(body.personal_plan_v2, answers) } catch {
    return json({ error: 'invalid_personal_plan_v2' }, 400)
  }

  // Guest mode never stores email consent because there is no verified account/email identity.
  const v2Answers: PersonalPlanV2Answers = {
    ...validatedV2,
    plan_email_opt_in: false,
    followup_email_opt_in: false,
  }

  const adaptive = validateAdaptiveAssessment(body.adaptive_assessment, answers)
  const triage = buildAdaptiveTriage(answers, v2Answers, adaptive)
  const result = buildPlan(answers, lang) as GuestResult
  result.follow_up_schedule = FOLLOWUP_DEFINITIONS.map((item) => ({ ...item }))
  result.personal_plan_v2 = buildPersonalPlanV2Enrichment(v2Answers, lang)
  result.adaptive_triage = triage
  const provenance = currentPlanProvenance()
  result.provenance = provenance

  const aiQuotaAvailable = !result.safety_immediate && await consumeGuestAiQuota(visitorId)
  if (aiQuotaAvailable) {
    try {
      const anonymised = {
        products: answers.product_types,
        primary_product: triage.primary_product,
        mixed_use: answers.mixed_use,
        substitutes_between_products: adaptive.substitutes_between_products ?? null,
        vape_profile: adaptive.vape ? {
          device_type: adaptive.vape.device_type ?? null,
          nicotine_strength_mg_ml: adaptive.vape.nicotine_strength_mg_ml ?? null,
          times_per_day: adaptive.vape.times_per_day ?? null,
          minutes_after_waking: adaptive.vape.minutes_after_waking ?? null,
          night_use: adaptive.vape.awakens_at_night ?? null,
          strong_cravings: adaptive.vape.strong_cravings ?? null,
        } : null,
        pouch_profile: adaptive.pouches ? {
          strength_mg_per_pouch: adaptive.pouches.strength_mg_per_pouch ?? null,
          pouches_per_day: adaptive.pouches.pouches_per_day ?? null,
          multiple_at_once: adaptive.pouches.uses_multiple_at_once ?? null,
          changes_strength: adaptive.pouches.changes_strength ?? null,
          night_use: adaptive.pouches.night_use ?? null,
          strong_cravings: adaptive.pouches.strong_cravings ?? null,
        } : null,
        deterministic_triage: {
          nicotine_exposure: triage.nicotine_exposure,
          behavioural_pattern: triage.behavioural_pattern,
          mixed_product_complexity: triage.mixed_product_complexity,
          readiness: triage.readiness,
          confidence: triage.confidence,
          relapse_vulnerability: triage.relapse_vulnerability,
          support_need: triage.support_need,
          safety_track: triage.safety_track,
          followup_focus: triage.followup_focus,
          product_measures: triage.product_measures.map((measure) => ({ instrument: measure.instrument, product: measure.product, score: measure.score, category: measure.category, validated: measure.validated })),
        },
        triggers: answers.triggers,
        additional_triggers: v2Answers.additional_triggers,
        importance: answers.importance_score,
        confidence_score: answers.confidence_score,
        readiness_score: answers.readiness_score,
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
        deterministic_first_step: result.first_24h_step,
        deterministic_72h: result.seventy_two_hour_plan,
        deterministic_7day: result.seven_day_plan,
        deterministic_trigger_plans: result.trigger_plans.map((section) => ({ title: section.title, steps: section.steps })),
      }

      const ai = await openAIStructuredResponse<Personalisation>({
        schemaName: 'aqla_guest_adaptive_quit_plan_v3',
        schema,
        maxOutputTokens: 1100,
        instructions: `You personalise the coaching layer of Aqla, a Saudi smoking and nicotine cessation support platform. This is a guest session and no account persistence is available. Deterministic Aqla logic is authoritative for safety, referral, triage, scoring and instrument interpretation. Never recalculate or contradict deterministic_triage. PSECDI and HSI results may be described as screening/dependence indicators, not diagnoses. Any Aqla pouch screen is non-validated and must never be described as validated. Do not diagnose, prescribe, choose medication doses, promise outcomes or invent clinical claims. Use ${lang === 'ar' ? 'clear modern Arabic suitable for Saudi users' : 'clear British English'}. Personalise specifically for cigarettes, vaping, nicotine pouches, shisha or mixed use as supplied. Do not mention AI. Return only the requested JSON schema.`,
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
    } catch (error) {
      console.error('Aqla guest adaptive AI personalisation unavailable', error instanceof Error ? error.message : 'unknown')
      result.ai_used = false
    }
  } else {
    result.ai_used = false
  }

  const plan: GuestPlan = {
    plan_id: randomUUID(),
    created_at: new Date().toISOString(),
    version: 1,
    persisted: false,
    provenance,
    answers: { ...answers, personal_plan_v2: v2Answers, adaptive_assessment: adaptive },
    result,
  }

  await track('plan_generated')
  const response = json({ plan, guest: true })
  if (!existingVisitorId) {
    response.cookies.set(VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 400 * 24 * 60 * 60,
    })
  }
  return response
}
