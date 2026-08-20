import { NextRequest, NextResponse } from 'next/server'
import { incrementAnalyticsMetric, type AnalyticsMetric } from '@/lib/analytics.server'
import { validateMutationRequest } from '@/lib/http-security.server'

export const dynamic = 'force-dynamic'

const PRIVATE_HEADERS = { 'Cache-Control': 'no-store, private' }
const PUBLIC_METRICS = new Set<AnalyticsMetric>(['research_clicks', 'support_entry_clicks'])

export async function POST(request: NextRequest) {
  const mutationError = validateMutationRequest(request, 2048)
  if (mutationError) return NextResponse.json({ error: mutationError.error }, { status: mutationError.status, headers: PRIVATE_HEADERS })

  let body: { metric?: string }
  try {
    body = await request.json() as { metric?: string }
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400, headers: PRIVATE_HEADERS })
  }

  const metric = body.metric as AnalyticsMetric
  if (!PUBLIC_METRICS.has(metric)) {
    return NextResponse.json({ error: 'metric_not_allowed' }, { status: 400, headers: PRIVATE_HEADERS })
  }

  try {
    await incrementAnalyticsMetric(metric)
  } catch (error) {
    console.error('Aqla public analytics event unavailable', error instanceof Error ? error.message : 'unknown')
  }

  return NextResponse.json({ ok: true }, { headers: PRIVATE_HEADERS })
}
