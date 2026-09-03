import { NextResponse } from 'next/server'
import { getCurrentAqlaUser } from '@/lib/current-user.server'
import { renderQuitPlanPdfV2 } from '@/lib/quit-engine/pdf-v2.server'
import { getQuitPlan } from '@/lib/quit-engine/store.server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const PRIVATE_HEADERS = { 'Cache-Control': 'no-store, private' }

export async function GET(
  request: Request,
  context: { params: Promise<{ planId: string }> },
) {
  const user = await getCurrentAqlaUser()
  if (!user) return NextResponse.json({ error: 'not_authenticated' }, { status: 401, headers: PRIVATE_HEADERS })

  const { planId } = await context.params
  if (!/^[0-9a-f-]{36}$/i.test(planId)) {
    return NextResponse.json({ error: 'invalid_plan_id' }, { status: 400, headers: PRIVATE_HEADERS })
  }

  const plan = await getQuitPlan(user.sub, planId)
  if (!plan) return NextResponse.json({ error: 'plan_not_found' }, { status: 404, headers: PRIVATE_HEADERS })

  const url = new URL(request.url)
  const lang: 'ar' | 'en' = url.searchParams.get('lang') === 'en' ? 'en' : 'ar'

  try {
    const pdf = await renderQuitPlanPdfV2(plan, lang)
    const filename = lang === 'ar' ? `aqla-personal-plan-${planId}-ar.pdf` : `aqla-personal-plan-${planId}.pdf`
    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        ...PRIVATE_HEADERS,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('Aqla Personal Plan PDF generation failed', error instanceof Error ? error.message : 'unknown')
    return NextResponse.json({ error: 'pdf_unavailable' }, { status: 500, headers: PRIVATE_HEADERS })
  }
}