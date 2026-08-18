import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager'

const secrets = new SecretsManagerClient({ region: process.env.AWS_REGION || 'eu-west-2' })
const SECRET_ID = 'aqla/v2/staging/openai'

export const AQla_OPENAI_MODEL = 'gpt-5.6'

let cachedKey: Promise<string> | undefined

export function getOpenAIApiKey(): Promise<string> {
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

export function extractOpenAIOutputText(json: unknown): string {
  if (!json || typeof json !== 'object') return ''
  const object = json as Record<string, unknown>
  if (typeof object.output_text === 'string') return object.output_text

  const output = Array.isArray(object.output) ? object.output : []
  for (const item of output) {
    if (!item || typeof item !== 'object') continue
    const rawContent = (item as Record<string, unknown>).content
    const content = Array.isArray(rawContent) ? rawContent : []
    for (const part of content) {
      if (!part || typeof part !== 'object') continue
      const p = part as Record<string, unknown>
      if (p.type === 'output_text' && typeof p.text === 'string') return p.text
    }
  }
  return ''
}

export async function openAIStructuredResponse<T>({
  instructions,
  input,
  schemaName,
  schema,
  maxOutputTokens = 500,
}: {
  instructions: string
  input: string
  schemaName: string
  schema: Record<string, unknown>
  maxOutputTokens?: number
}): Promise<{ data: T; model: string; requestId?: string }> {
  const apiKey = await getOpenAIApiKey()
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: AQla_OPENAI_MODEL,
      store: false,
      reasoning: { effort: 'low' },
      max_output_tokens: maxOutputTokens,
      instructions,
      input,
      text: {
        verbosity: 'low',
        format: {
          type: 'json_schema',
          name: schemaName,
          strict: true,
          schema,
        },
      },
    }),
  })

  const requestId = response.headers.get('x-request-id') || undefined
  if (!response.ok) {
    console.error('OpenAI Responses API failed', response.status, requestId ?? '')
    throw new Error(`openai_http_${response.status}`)
  }

  const json = await response.json() as unknown
  const raw = extractOpenAIOutputText(json)
  if (!raw) throw new Error('openai_output_empty')

  return {
    data: JSON.parse(raw) as T,
    model: AQla_OPENAI_MODEL,
    requestId,
  }
}
