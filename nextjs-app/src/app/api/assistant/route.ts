import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { authCookies, verifyCognitoIdToken } from '@/lib/cognito'
import { openAIStructuredResponse } from '@/lib/openai.server'

export const dynamic = 'force-dynamic'

type Message = { role: 'user' | 'assistant'; content: string }
type AssistantBody = { lang?: 'ar' | 'en'; messages?: Message[] }
type AssistantOutput = { reply: string }

const emergencyPattern = /(chest pain|severe shortness of breath|coughing blood|suicid|kill myself|ألم شديد في الصدر|ضيق شديد في التنفس|نفث الدم|انتحار|أريد أن أموت)/i
const medicationPattern = /(dose|dosage|\bmg\b|prescribe|prescription|nicotine patch dose|varenicline|bupropion|جرعة|ملغ|وصفة طبية|فارينيكلين|بوبروبيون)/i
const PRIVATE_HEADERS = { 'Cache-Control': 'no-store, private' }

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: PRIVATE_HEADERS })
}

async function authenticated() {
  const cookieStore = await cookies()
  const token = cookieStore.get(authCookies.idToken)?.value
  if (!token) return false
  try {
    const payload = await verifyCognitoIdToken(token)
    return typeof payload.sub === 'string'
  } catch {
    return false
  }
}

function safeOverride(text: string, lang: 'ar' | 'en') {
  if (emergencyPattern.test(text)) {
    return lang === 'ar'
      ? 'إذا كانت لديك أعراض طارئة أو أفكار لإيذاء نفسك، اطلب الرعاية الطبية العاجلة فورًا أو تواصل مع خدمات الطوارئ المحلية. أقلع دعم تثقيفي ولا يغني عن الرعاية الطبية.'
      : 'If you have urgent symptoms or thoughts of harming yourself, seek urgent medical care now or contact your local emergency services. Aqla provides educational support and does not replace medical care.'
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
  },
  required: ['reply'],
}

const instructions = `You are "Aqla Assistant" for Aqla (أقلع), a Saudi smoking and nicotine cessation support platform.
Arabic is the primary language. Reply in the language requested by the application.
You provide concise, respectful, evidence-aligned EDUCATIONAL SUPPORT only.
Do not diagnose, prescribe, choose medication doses, or claim access to medical records.
Do not calculate clinical dependence scores. Aqla's application logic handles assessment and scoring.
Support users whether they want to quit now, are thinking about quitting, want to reduce first, or are not ready yet. Never shame or pressure them.
For urgent medical symptoms or self-harm concerns, direct the user to urgent local medical help.
Keep replies short and practical, usually 1-5 sentences.
Return only the structured response requested by the schema.`

export async function POST(request: NextRequest) {
  if (!(await authenticated())) return json({ error: 'not_authenticated' }, 401)

  let body: AssistantBody
  try {
    body = await request.json() as AssistantBody
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  const lang = body.lang === 'en' ? 'en' : 'ar'
  const clean = (Array.isArray(body.messages) ? body.messages.slice(-12) : [])
    .filter((message): message is Message => Boolean(message) && (message.role === 'user' || message.role === 'assistant') && typeof message.content === 'string')
    .map((message) => ({ ...message, content: message.content.trim().slice(0, 2000) }))
    .filter((message) => message.content.length > 0)

  const totalCharacters = clean.reduce((sum, message) => sum + message.content.length, 0)
  if (totalCharacters > 12000) return json({ error: 'conversation_too_large' }, 413)

  const lastUser = [...clean].reverse().find((message) => message.role === 'user')
  if (!lastUser) return json({ error: 'message_required' }, 400)

  const override = safeOverride(lastUser.content, lang)
  if (override) return json({ reply: override })

  try {
    const response = await openAIStructuredResponse<AssistantOutput>({
      instructions: `${instructions}\nApplication reply language: ${lang === 'ar' ? 'Arabic' : 'English'}.`,
      input: JSON.stringify(clean),
      schemaName: 'aqla_assistant_response',
      schema,
      maxOutputTokens: 500,
    })

    const reply = response.data.reply?.trim()
    if (!reply) throw new Error('openai_output_invalid')

    return json({ reply })
  } catch (error) {
    console.error('Aqla assistant error', error instanceof Error ? error.message : 'unknown')
    return json({ error: 'assistant_unavailable' }, 502)
  }
}
