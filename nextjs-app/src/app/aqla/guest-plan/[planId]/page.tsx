import { redirect } from 'next/navigation'
import GuestQuitPlanResult from '@/components/GuestQuitPlanResult'

export const dynamic = 'force-dynamic'

export default async function GuestPlanPage({ params, searchParams }: { params: Promise<{ planId: string }>; searchParams: Promise<{ lang?: string }> }) {
  const { planId } = await params
  const query = await searchParams
  const lang = query.lang === 'en' ? 'en' : 'ar'

  if (!/^[0-9a-f-]{36}$/i.test(planId)) redirect('/')

  return <GuestQuitPlanResult planId={planId} initialLang={lang} />
}
