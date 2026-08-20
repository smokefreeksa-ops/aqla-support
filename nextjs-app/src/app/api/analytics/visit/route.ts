import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { recordVisit } from '@/lib/analytics.server'
import { validateMutationRequest } from '@/lib/http-security.server'

export const dynamic = 'force-dynamic'

const PRIVATE_HEADERS = { 'Cache-Control': 'no-store, private' }
const COOKIE = 'aqla_vid'

export async function POST(request: NextRequest) {
  const mutationError = validateMutationRequest(request, 1024)
  if (mutationError) return NextResponse.json({ error: mutationError.error }, { status: mutationError.status, headers: PRIVATE_HEADERS })

  const existing = request.cookies.get(COOKIE)?.value?.trim()
  const visitorId = existing || randomUUID()

  try {
    await recordVisit(visitorId)
  } catch (error) {
    console.error('Aqla visit analytics unavailable', error instanceof Error ? error.message : 'unknown')
  }

  const response = NextResponse.json({ ok: true }, { headers: PRIVATE_HEADERS })
  if (!existing) {
    response.cookies.set(COOKIE, visitorId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 400 * 24 * 60 * 60,
    })
  }
  return response
}
