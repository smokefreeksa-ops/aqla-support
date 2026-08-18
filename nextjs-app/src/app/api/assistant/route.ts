import { NextRequest, NextResponse } from 'next/server'
import { AQla_OPENAI_MODEL, openAIStructuredResponse } from '@/lib/openai.server'

export const dynamic = 'force-dynamic'

type Message = { role: 'user' | 'assistant'; content: string }
type AssistantBody = { lang?: 'ar' | 'en'; messages?: Message[] }
type AssistantOutput = { reply: string; suggested_pathway: 'quit_now' | 'prepare' | 'reduce' | 'not_ready' | 'training' | 'help_someone' | null }

const emergencyPattern = /(chest pain|severe shortness of breath|coughing blood|suicid|kill myself|ألم شديد في الصدر|ضيق شديد في التنفس|نفث الدم|انتحار|أريد أن أموت)/i
const medicationPattern = /(dose|dosage|\bmg\b|prescribe|prescription|nicotine patch dose|varenicline|bupropion|جرعة|ملغ|وصفة طبية|فارينيكلين|بوبروبيون)/i

function safeOverride(text: string, lang: 'ar' | 'en') {
  if (emergencyPattern.test(text)) {
    return lang === 'ar'
      ? 'إذا كانت لديك أعراض طارئة أو أفكار لإيذاء نفسك، اطلب الرعاية الطبية العاجلة فورًا أو تواصل مع خدمات الطوارئ المحلية. أقلع أداة تثقيفية ولا يغني عن الرعاية الطبية.'
      : 'If you have urgent symptoms or thoughts of harming yourself, seek urgent medical care now or contact your local emergency services. AQla is educational support and does not replace medical care.'
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
    suggested_pathway: {
      type: ['string', 'null'],
      enum: ['quit_now', 'prepare', 'reduce', 'not_ready', 'training', 'help_someone', null],
    },
  },
  required: ['reply', 'suggested_pathway'],
}

const instructions = `You are "Aqla Assistant" for AQla (أقلع), a Saudi smoking and nicotine cessation support platform.
Arabic is the primary language. Reply in the language requested by the application.
You provide concise, respectful, evidence-aligned EDUCATIONAL SUPPORT only.
Do not diagnose, prescribe, choose medication doses, or claim access to medical records.
Do not calculate clinical dependence scores. AQla's application logic handles assessment and scoring.
Support users whether they want to quit now, are thinking about quitting, want to reduce first, or are not ready yet. Never shame or pressure them.
For urgent medical symptoms or self-harm concerns, direct the user to urgent local medical help.
Keep replies short and practical, usually 1-5 sentences.
Return only the structured response requested by the schema.`

export async function POST(request: NextRequest) {
  let body: AssistantBody
  try {
    body = await request.json() as AssistantBody
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const lang = body.lang === 'en' ? 'en' : 'ar'
  const clean = (Array.isArray(body.messages) ? body.messages.slice(-12) : [])
    .filter((message): message is Message => Boolean(message) && (message.role === 'user' || message.role === 'assistant') && typeof message.content === 'string')
    .map((message) => ({ ...message, content: message.content.trim().slice(0, 4000) }))
    .filter((message) => message.content.length > 0)

  const lastUser = [...clean].reverse().find((message) => message.role === 'user')
  if (!lastUser) return NextResponse.json({ error: 'message_required' }, { status: 400 })

  const override = safeOverride(lastUser.content, lang)
  if (override) return NextResponse.json({ reply: override, safety: true, model: 'deterministic' })

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

    return NextResponse.json({
      reply,
      suggested_pathway: response.data.suggested_pathway ?? null,
      model: AQla_OPENAI_MODEL,
    })
  } catch (error) {
    console.error('AQla assistant error', error instanceof Error ? error.message : 'unknown')
    return NextResponse.json({ error: 'assistant_unavailable' }, { status: 502 })
  }
}
