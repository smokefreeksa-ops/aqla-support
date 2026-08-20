import { redirect } from 'next/navigation'
import AdminCommandCentre from '@/components/AdminCommandCentre'
import { aggregateAnalytics, getDailyAnalytics } from '@/lib/analytics.server'
import { getCurrentAqlaUser, hasAqlaRole } from '@/lib/current-user.server'

export const dynamic = 'force-dynamic'

export default async function AqlaAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>
}) {
  const user = await getCurrentAqlaUser()
  if (!user || !hasAqlaRole(user, 'admin')) redirect('/aqla/os')

  const params = await searchParams
  const requested = Number(params.days)
  const days = requested === 7 || requested === 90 ? requested : 30

  try {
    const rows = await getDailyAnalytics(days)
    const totals = aggregateAnalytics(rows)
    return <AdminCommandCentre days={days} totals={totals} rows={rows} />
  } catch (error) {
    console.error('Aqla admin analytics unavailable', error instanceof Error ? error.message : 'unknown')
    return <AdminCommandCentre days={days} totals={{}} rows={[]} />
  }
}
