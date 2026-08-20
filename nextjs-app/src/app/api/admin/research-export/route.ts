import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAqlaUser, hasAqlaRole } from '@/lib/current-user.server'
import { buildResearchExportBatch, RESEARCH_EXPORT_SCHEMA_VERSION } from '@/lib/research/export.server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const user = await getCurrentAqlaUser()
  if (!user) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })
  if (!hasAqlaRole(user, 'admin')) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const cursor = searchParams.get('cursor') || undefined
  const requested = Number(searchParams.get('limit') || '200')
  const limit = Number.isFinite(requested) ? Math.max(1, Math.min(500, Math.floor(requested))) : 200

  try {
    const batch = await buildResearchExportBatch({ cursor, limit })
    const headers = new Headers({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="aqla-research-export-v${RESEARCH_EXPORT_SCHEMA_VERSION}.csv"`,
      'Cache-Control': 'no-store, private',
      'X-Aqla-Export-Schema': String(RESEARCH_EXPORT_SCHEMA_VERSION),
      'X-Aqla-Export-Rows': String(batch.rows),
    })
    if (batch.nextCursor) headers.set('X-Aqla-Next-Cursor', batch.nextCursor)
    return new NextResponse(`\uFEFF${batch.csv}`, { status: 200, headers })
  } catch (error) {
    console.error('Aqla research export failed', error instanceof Error ? error.message : 'unknown')
    return NextResponse.json({ error: 'export_unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store, private' } })
  }
}
