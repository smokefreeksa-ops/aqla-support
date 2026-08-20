import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AqlaOS from '@/components/AqlaOS'
import { listConversations } from '@/lib/conversation-store.server'
import { getCurrentAqlaUser, hasAqlaRole } from '@/lib/current-user.server'
import { getPersonalTwin } from '@/lib/personal-twin.server'
import { authCookies } from '@/lib/cognito'
import { getLatestQuitPlanId } from '@/lib/quit-engine/store.server'

export const dynamic = 'force-dynamic'

export default async function AqlaOSPage() {
  const user = await getCurrentAqlaUser()
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get(authCookies.refreshToken)?.value

  if (!user && refreshToken) {
    redirect(`/auth/refresh?returnTo=${encodeURIComponent('/aqla/os')}`)
  }

  if (!user) {
    return (
      <AqlaOS
        signedIn={false}
        canClinician={false}
        canAdmin={false}
        initialConversations={[]}
      />
    )
  }

  let latestPlanId: string | undefined
  let initialConversations: Awaited<ReturnType<typeof listConversations>> = []
  let twinSummary: {
    products?: string[]
    triggers?: string[]
    confidence?: number
    readiness?: number
    current_plan_created_at?: string
    followup_count?: number
  } | undefined

  try {
    const [planId, conversations, twin] = await Promise.all([
      getLatestQuitPlanId(user.sub),
      listConversations(user.sub, 40),
      getPersonalTwin(user.sub),
    ])
    latestPlanId = planId ?? undefined
    initialConversations = conversations
    if (twin) {
      twinSummary = {
        products: twin.product_types,
        triggers: twin.triggers,
        confidence: twin.confidence_score,
        readiness: twin.readiness_score,
        current_plan_created_at: twin.current_plan_created_at,
        followup_count: twin.followups ? Object.keys(twin.followups).length : 0,
      }
    }
  } catch (error) {
    console.error('Aqla OS initial state unavailable', error instanceof Error ? error.message : 'unknown')
  }

  return (
    <AqlaOS
      signedIn
      canClinician={hasAqlaRole(user, 'clinician') || hasAqlaRole(user, 'admin')}
      canAdmin={hasAqlaRole(user, 'admin')}
      latestPlanId={latestPlanId}
      initialConversations={initialConversations}
      twinSummary={twinSummary}
    />
  )
}
