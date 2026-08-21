import { NextRequest, NextResponse } from 'next/server'
import { incrementAnalyticsMetric } from '@/lib/analytics.server'
import { getAdaptiveTriageContext } from '@/lib/adaptive-assessment.server'
import { appendConversationMessage, ensureConversation, type AqlaMode } from '@/lib/conversation-store.server'
import { getCurrentAqlaUser, hasAqlaRole } from '@/lib/current-user.server'
import { sendPlanReadyEmail } from '@/lib/email.server'
import { validateMutationRequest } from '@/lib/http-security.server'
import { openAIStructuredResponse } from '@/lib/openai.server'
import { getPersonalTwin, personalTwinForAI } from '@/lib/personal-twin.server'
import { getLatestQuitPlanId } from '@/lib/quit-engine/store.server'

export const dynamic = 'force-dynamic'

type Message = { role: 'user' | 'assistant'; content: string }
type AssistantAction =
  | 'none'
  | 'start_assessment'
  | 'open_craving_support'
  | 'open_latest_plan'
  | 'open_progress'
  | 'open_academy'
  | 'email_latest_plan'

type AssistantBody = {
  lang?: 'ar' | 'en'
  mode?: AqlaMode
  conversation_id?: string
  messages?: Message[]
}
type AssistantOutput = { reply: string; action: AssistantAction }

const emergencyPattern = /(chest pain|severe shortness of breath|coughing blood|suicid|kill myself|harm myself|ألم شديد في الصدر|ضيق شديد في التنفس|نفث الدم|انتحار|أريد أن أموت|إيذاء نفسي)/i
const medicationPattern = /(dose|dosage|\bmg\b|prescribe|prescription|nicotine patch dose|varenicline|bupropion|جرعة|ملغ|وصفة طبية|فارينيكلين|بوبروبيون)/i
const explicitEmailPattern = /(email|e-mail|send.*plan.*mail|mail.*plan|أرسل.*البريد|ارسل.*البريد|إيميل|ايميل|البريد الإلكتروني|البريد الالكتروني)/i
const PRIVATE_HEADERS = { 'Cache-Control': 'no-store, private' }

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: PRIVATE_HEADERS })
}

async function track(metric: Parameters<typeof incrementAnalyticsMetric>[0]) {
  try {
    await incrementAnalyticsMetric(metric)
  } catch (error) {
    console.error('Aqla analytics metric unavailable', metric, error instanceof Error ? error.message : 'unknown')
  }
}

function modeAllowed(mode: AqlaMode, groups: string[]) {
  const user = { sub: '', emailVerified: false, groups }
  if (mode === 'admin') return hasAqlaRole(user, 'admin')
  if (mode === 'clinician') return hasAqlaRole(user, 'clinician') || hasAqlaRole(user, 'admin')
  return true
}

function safeOverride(text: string, lang: 'ar' | 'en') {
  if (emergencyPattern.test(text)) {
    return lang === 'ar'
      ? 'إذا كانت لديك أعراض طارئة أو أفكار لإيذاء نفسك، اطلب الرعاية الطبية العاجلة فورًا أو تواصل مع خدمات الطوارئ المحلية. أقلع ليس خدمة طوارئ ولا يغني عن الرعاية الطبية.'
      : 'If you have urgent symptoms or thoughts of harming yourself, seek urgent medical care now or contact your local emergency services. Aqla is not an emergency service and does not replace medical care.'
  }
  if (medicationPattern.test(text)) {
    return lang === 'ar'
      ? 'لا أستطيع تحديد جرعات أدوية أو كتابة وصفات. أستطيع شرح الخيارات بشكل عام، لكن اختيار العلاج أو الجرعة يحتاج تقييم طبيب أو صيدلي مؤهل.'
      : 'I cannot provide medication doses or prescriptions. I can explain options generally, but treatment and dosing require assessment by a qualified clinician or pharmacist.'
  }
  return null
}

const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    reply: { type: 'string' },
    action: {
      type: 'string',
      enum: ['none', 'start_assessment', 'open_craving_support', 'open_latest_plan', 'open_progress', 'open_academy', 'email_latest_plan'],
    },
  },
  required: ['reply', 'action'],
}

const baseInstructions = `You are Aqla (أقلع), the conversational operating layer for a Saudi smoking and nicotine cessation platform.
Arabic is primary. Reply in the application language.
Aqla has a deterministic clinical/safety engine, deterministic adaptive triage and a structured Personal Twin. Those supplied deterministic outputs are authoritative. Never recalculate or override safety, referral, HSI, PSECDI, oral-nicotine screening, product triage or follow-up focus.
HSI and PSECDI may be described as product-specific dependence/screening indicators, not diagnoses. The AQla oral nicotine adapted screen is explicitly non-validated and must never be described as a validated clinical measure.
Never diagnose, prescribe or choose medication doses. Do not reinterpret internal categories as diagnoses or promise a clinical outcome.
Use the Personal Twin and adaptive triage only as supplied. Never claim to remember facts that are not present in the supplied context.
Support quitting now, preparing, reducing first and relapse prevention without shame or pressure.
The available action field is a suggestion for a trusted Aqla tool. Choose only one action and only when it directly helps the user's latest request.
Use start_assessment when the user wants a new quit plan or assessment.
Use open_craving_support for a current craving or immediate urge to use nicotine.
Use open_latest_plan when the user asks to view their existing plan.
Use open_progress when the user asks about progress or follow-up.
Use open_academy for an educational/learning request that would benefit from Academy.
Use email_latest_plan only when the user explicitly asks to email/send their existing plan by email. Never choose it proactively.
Do not claim an email, reminder, WhatsApp message or other external action happened unless the server reports that it happened.
Keep normal replies concise and practical, usually 1-6 sentences.
Return only the requested structured response.`

export async function POST(request: NextRequest) {
  const mutationError = validateMutationRequest(request, 40 * 1024)
  if (mutationError) return json({ error: mutationError.error }, mutationError.status)

  const user = await getCurrentAqlaUser()
  if (!user) return json({ error: 'not_authenticated' }, 401)

  let body: AssistantBody
  try {
    body = await request.json() as AssistantBody
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  const lang = body.lang === 'en' ? 'en' : 'ar'
  const mode: AqlaMode = body.mode === 'academy' || body.mode === 'clinician' || body.mode === 'admin' ? body.mode : 'quit'
  if (!modeAllowed(mode, user.groups)) return json({ error: 'mode_not_authorised' }, 403)

  const clean = (Array.isArray(body.messages) ? body.messages.slice(-14) : [])
    .filter((message): message is Message => Boolean(message) && (message.role === 'user' || message.role === 'assistant') && typeof message.content === 'string')
    .map((message) => ({ ...message, content: message.content.trim().slice(0, 2400) }))
    .filter((message) => message.content.length > 0)

  const totalCharacters = clean.reduce((sum, message) => sum + message.content.length, 0)
  if (totalCharacters > 16000) return json({ error: 'conversation_too_large' }, 413)

  const lastUser = [...clean].reverse().find((message) => message.role === 'user')
  if (!lastUser) return json({ error: 'message_required' }, 400)

  let conversationId = body.conversation_id?.trim().slice(0, 100)
  try {
    const ensured = await ensureConversation({
      userSub: user.sub,
      conversationId,
      mode,
      firstUserMessage: lastUser.content,
      fallbackTitle: lang === 'ar' ? 'محادثة أقلع' : 'Aqla conversation',
    })
    conversationId = ensured.conversationId
    if (ensured.created) await track('conversations_created')
    await appendConversationMessage({ userSub: user.sub, conversationId, role: 'user', content: lastUser.content })
  } catch (error) {
    console.error('Aqla conversation persistence unavailable', error instanceof Error ? error.message : 'unknown')
  }

  await track('assistant_messages')

  const override = safeOverride(lastUser.content, lang)
  if (override) {
    await track('safety_escalations')
    if (conversationId) {
      try { await appendConversationMessage({ userSub: user.sub, conversationId, role: 'assistant', content: override }) } catch { /* best effort */ }
    }
    return json({ reply: override, action: 'none', conversation_id: conversationId })
  }

  let twinContext: ReturnType<typeof personalTwinForAI> = null
  try {
    twinContext = personalTwinForAI(await getPersonalTwin(user.sub))
  } catch (error) {
    console.error('Aqla Personal Twin context unavailable', error instanceof Error ? error.message : 'unknown')
  }

  let adaptiveTriage: Record<string, unknown> | null = null
  try {
    const adaptive = await getAdaptiveTriageContext(user.sub)
    if (adaptive?.triage) {
      adaptiveTriage = {
        primary_product: adaptive.triage.primary_product,
        nicotine_exposure: adaptive.triage.nicotine_exposure,
        behavioural_pattern: adaptive.triage.behavioural_pattern,
        mixed_product_complexity: adaptive.triage.mixed_product_complexity,
        readiness: adaptive.triage.readiness,
        confidence: adaptive.triage.confidence,
        relapse_vulnerability: adaptive.triage.relapse_vulnerability,
        support_need: adaptive.triage.support_need,
        safety_track: adaptive.triage.safety_track,
        followup_focus: adaptive.triage.followup_focus,
        product_measures: adaptive.triage.product_measures.map((measure) => ({
          product: measure.product,
          instrument: measure.instrument,
          score: measure.score,
          category: measure.category,
          validated: measure.validated,
        })),
      }
    }
  } catch (error) {
    console.error('Aqla adaptive triage context unavailable', error instanceof Error ? error.message : 'unknown')
  }

  try {
    const response = await openAIStructuredResponse<AssistantOutput>({
      instructions: `${baseInstructions}\nCurrent Aqla mode: ${mode}.\nApplication reply language: ${lang === 'ar' ? 'Arabic' : 'English'}.`,
      input: JSON.stringify({
        personal_twin: twinContext,
        adaptive_triage: adaptiveTriage,
        recent_conversation: clean,
      }),
      schemaName: 'aqla_os_response',
      schema,
      maxOutputTokens: 650,
    })

    let reply = response.data.reply?.trim()
    let action = response.data.action
    if (!reply) throw new Error('openai_output_invalid')

    if (action === 'email_latest_plan') {
      if (!explicitEmailPattern.test(lastUser.content)) {
        action = 'none'
      } else if (!user.email || !user.emailVerified) {
        reply = lang === 'ar'
          ? 'أستطيع إرسال خطتك إلى البريد المرتبط بحسابك بعد التحقق من البريد الإلكتروني.'
          : 'I can email your plan once the email address linked to your account is verified.'
        action = 'none'
      } else {
        const latestPlanId = await getLatestQuitPlanId(user.sub)
        if (!latestPlanId) {
          reply = lang === 'ar'
            ? 'لا توجد خطة محفوظة لإرسالها حتى الآن. يمكنني أن أبدأ معك التقييم لبناء خطة شخصية.'
            : 'There is no saved plan to email yet. I can start the assessment with you to build one.'
          action = 'start_assessment'
        } else {
          try {
            await sendPlanReadyEmail({
              to: user.email,
              planId: latestPlanId,
              lang,
              followupsScheduled: false,
            })
            await track('plan_email_sent')
            reply = lang === 'ar'
              ? 'تم إرسال رابط خطتك المحفوظة إلى البريد الإلكتروني المتحقق في حسابك.'
              : 'I sent the link to your saved plan to the verified email address on your account.'
            action = 'none'
          } catch (error) {
            await track('plan_email_failed')
            console.error('Aqla user-requested plan email unavailable', error instanceof Error ? error.message : 'unknown')
            reply = lang === 'ar'
              ? 'تعذّر إرسال البريد الآن. خطتك ما زالت محفوظة ويمكنك فتحها من أقلع.'
              : 'I could not send the email right now. Your plan is still saved and you can open it in Aqla.'
            action = 'open_latest_plan'
          }
        }
      }
    }

    if (action === 'open_craving_support') await track('craving_support_sessions')

    if (conversationId) {
      try {
        await appendConversationMessage({ userSub: user.sub, conversationId, role: 'assistant', content: reply, action })
      } catch (error) {
        console.error('Aqla assistant response persistence unavailable', error instanceof Error ? error.message : 'unknown')
      }
    }

    return json({ reply, action, conversation_id: conversationId })
  } catch (error) {
    await track('assistant_failures')
    console.error('Aqla assistant error', error instanceof Error ? error.message : 'unknown')
    return json({ error: 'assistant_unavailable', conversation_id: conversationId }, 502)
  }
}