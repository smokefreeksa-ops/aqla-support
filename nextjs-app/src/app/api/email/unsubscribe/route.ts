import { NextRequest, NextResponse } from 'next/server'
import { unsubscribeByToken, type UnsubscribeScope } from '@/lib/communication-preferences.server'

export const dynamic = 'force-dynamic'

const PRIVATE_HEADERS = { 'Cache-Control': 'no-store, private' }

function scopeValue(value: unknown): UnsubscribeScope | null {
  if (value === 'followup' || value === 'research' || value === 'all_non_transactional') return value
  return null
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get('content-length') || '0')
  if (Number.isFinite(contentLength) && contentLength > 4096) {
    return NextResponse.json({ error: 'request_too_large' }, { status: 413, headers: PRIVATE_HEADERS })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json() as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400, headers: PRIVATE_HEADERS })
  }

  const token = typeof body.token === 'string' ? body.token.trim().slice(0, 100) : ''
  const scope = scopeValue(body.scope)
  if (!token || !scope) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400, headers: PRIVATE_HEADERS })
  }

  try {
    const state = await unsubscribeByToken(token, scope)
    return NextResponse.json({
      updated: true,
      followup_enabled: state?.followup_enabled ?? false,
      research_enabled: state?.research_enabled ?? false,
    }, { headers: PRIVATE_HEADERS })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unsubscribe_failed'
    if (message === 'invalid_unsubscribe_token') {
      return NextResponse.json({ error: message }, { status: 404, headers: PRIVATE_HEADERS })
    }
    console.error('Aqla unsubscribe failed', message)
    return NextResponse.json({ error: 'unsubscribe_failed' }, { status: 500, headers: PRIVATE_HEADERS })
  }
}
