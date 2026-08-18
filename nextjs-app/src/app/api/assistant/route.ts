import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const secrets = new SecretsManagerClient({ region: 'eu-west-2' })
const SECRET_ID = 'aqla/v2/staging/openai'
const MODEL = 'gpt-5.6-terra'

let cachedKey: Promise<string> | undefined

function getApiKey() {
  if (!cachedKey) {
    cachedKey = secrets.send(new GetSecretValueCommand({ SecretId: SECRET_ID })).then((result) => {
      const raw = result.SecretString?.trim()
      if (!raw) throw new Error('openai_secret_empty')
      try {
        const parsed = JSON.parse(raw) as Record<string, unknown>
        if (typeof parsed.apiKey === 'string' && parsed.apiKey.trim()) return parsed.apiKey.trim()
      } catch {
        if (raw.startsWith('sk-')) return raw
      }
      throw new Error('openai_secret_format')
    })
  }
  return cachedKey.catch((error) => {
    cachedKey = undefined
    throw error
  })
}

type Message = { role: 'user' | 'assistant'; content: string }

type AssistantBody = {
  lang?: 'ar' | 'en'
  messages?: Message[]
}

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

function extractOutputText(json: unknown): string {
  if (!json || typeof json !== 'object') return ''
  const object = json as Record<string, unknown>
  if (typeof object.output_text === 'string') return object.output_text
  const output = Array.isArray(object.output) ? object.output : []
  for (const item of output) {
    if (!item || typeof item !== 'object') continue
    const content = Array.isArray((item as Record<string, unknown>).content)
      ? (item as Record<string, unknown>).content as unknown[]
      : []
    for (const part of content) {
      if (!part || typeof part !== 'object') continue
      const p = part as Record<string, unknown>
      if (p.type === 'output_text' && typeof p.text === 'string') return p.text
    }
  }
  return ''
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
  const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : []
  const clean = messages
    .filter((m): m is Message => Boolean(m) && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ ...m, content: m.content.trim().slice(0, 4000) }))
    .filter((m) => m.content.length > 0)

  const lastUser = [...clean].reverse().find((m) => m.role === 'user')
  if (!lastUser) return NextResponse.json({ error: 'message_required' }, { status: 400 })

  const override = safeOverride(lastUser.content, lang)
  if (override) return NextResponse.json({ reply: override, safety: true, model: 'deterministic' })

  try {
    const apiKey = await getApiKey()
    const res = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        reasoning: { effort: 'low' },
        max_output_tokens: 500,
        instructions: `${instructions}\nApplication reply language: ${lang === 'ar' ? 'Arabic' : 'English'}.`,
        input: clean.map((m) => ({
          role: m.role,
          content: [{ type: 'input_text', text: m.content }],
        })),
        text: {
          verbosity: 'low',
          format: {
            type: 'json_schema',
            name: 'aqla_assistant_response',
            strict: true,
            schema: {
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
            },
          },
        },
      }),
    })

    if (!res.ok) {
      const requestId = res.headers.get('x-request-id')
      console.error('OpenAI Responses API failed', res.status, requestId ?? '')
      return NextResponse.json({ error: 'assistant_unavailable' }, { status: 502 })
    }

    const json = await res.json() as unknown
    const raw = extractOutputText(json)
    const parsed = JSON.parse(raw) as { reply?: unknown; suggested_pathway?: unknown }
    if (typeof parsed.reply !== 'string' || !parsed.reply.trim()) throw new Error('openai_output_invalid')

    return NextResponse.json({
      reply: parsed.reply.trim(),
      suggested_pathway: typeof parsed.suggested_pathway === 'string' ? parsed.suggested_pathway : null,
      model: MODEL,
    })
  } catch (error) {
    console.error('AQla assistant error', error instanceof Error ? error.message : 'unknown')
    return NextResponse.json({ error: 'assistant_unavailable' }, { status: 502 })
  }
}
