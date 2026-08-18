import QuitPlanResult from '@/components/QuitPlanResult'

export const dynamic = 'force-dynamic'

export default async function PlanPage({ params, searchParams }: { params: Promise<{ planId: string }>; searchParams: Promise<{ lang?: string }> }) {
  const { planId } = await params
  const query = await searchParams
  const lang = query.lang === 'en' ? 'en' : 'ar'
  return <QuitPlanResult planId={planId} initialLang={lang} />
}
