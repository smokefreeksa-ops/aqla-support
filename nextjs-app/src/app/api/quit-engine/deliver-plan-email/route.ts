import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAqlaUser } from '@/lib/current-user.server'
import { sendDirectPlanEmail } from '@/lib/direct-plan-email.server'
import { validateMutationRequest } from '@/lib/http-security.server'
import { consumePlanEmailQuota } from '@/lib/plan-email-quota.server'

export const dynamic = 'force-dynamic'

const PRIVATE_HEADERS = { 'Cache-Control': 'no-store, private' }
const VISITOR_COOKIE = 'aqla_vid'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: PRIVATE_HEADERS })
}

function text(value: unknown, max: number) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, max)
}

function stringList(value: unknown, maxItems: number, maxLength: number) {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim().slice(0, maxLength))
    .filter(Boolean)
    .slice(0, maxItems)
}

export async function POST(request: NextRequest) {
  const mutationError = validateMutationRequest(request, 32 * 1024)
  if (mutationError) return json({ error: mutationError.error }, mutationError.status)

  let raw: Record<string, unknown>
  try { raw = await request.json() as Record<string, unknown> } catch { return json({ error: 'invalid_json' }, 400) }

  const email = text(raw.to, 320).toLowerCase()
  const name = text(raw.name, 120)
  const lang = raw.lang === 'en' ? 'en' : 'ar'
  if (!name || !EMAIL_RE.test(email)) return json({ error: 'invalid_recipient' }, 400)

  const rawPlan = raw.plan && typeof raw.plan === 'object' ? raw.plan as Record<string, unknown> : {}
  const title = text(rawPlan.title, 500)
  const summary = text(rawPlan.summary, 1600)
  const personalSummary = text(rawPlan.personal_summary, 1600)
  const firstStep = text(rawPlan.first_step, 1200)
  const seventyTwoHourPlan = stringList(rawPlan.seventy_two_hour_plan, 6, 900)
  const cravingCard = text(rawPlan.craving_card, 1200)
  const rawSevenDay = Array.isArray(rawPlan.seven_day_plan) ? rawPlan.seven_day_plan : []
  const sevenDayPlan = rawSevenDay
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const record = item as Record<string, unknown>
      const day = typeof record.day === 'number' && Number.isFinite(record.day) ? Math.round(record.day) : 0
      const task = text(record.task, 900)
      return day >= 1 && day <= 31 && task ? { day, task } : null
    })
    .filter((item): item is { day: number; task: string } => Boolean(item))
    .slice(0, 7)

  if (!title || !firstStep || !seventyTwoHourPlan.length || !sevenDayPlan.length) return json({ error: 'invalid_plan' }, 400)

  const user = await getCurrentAqlaUser()
  const visitorId = request.cookies.get(VISITOR_COOKIE)?.value?.trim()
  const quotaSubject = user?.sub ? `user:${user.sub}` : visitorId ? `visitor:${visitorId}` : ''
  if (!quotaSubject) return json({ error: 'plan_email_session_required' }, 429)

  const quotaAvailable = await consumePlanEmailQuota(quotaSubject)
  if (!quotaAvailable) return json({ error: 'plan_email_rate_limited' }, 429)

  try {
    const sent = await sendDirectPlanEmail({
      to: email,
      name,
      lang,
      plan: {
        title,
        summary: summary || undefined,
        personal_summary: personalSummary || undefined,
        first_step: firstStep,
        seventy_two_hour_plan: seventyTwoHourPlan,
        seven_day_plan: sevenDayPlan,
        craving_card: cravingCard || undefined,
      },
    })
    return json({ status: 'sent', message_id: sent.messageId })
  } catch (error) {
    console.error('Aqla requested plan email failed', error instanceof Error ? error.message : 'unknown')
    return json({ error: 'plan_email_unavailable' }, 503)
  }
}
