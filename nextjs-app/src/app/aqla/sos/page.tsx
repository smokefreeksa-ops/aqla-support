import { cookies } from 'next/headers'
import AqlaSos from '@/components/AqlaSos'
import { authCookies, verifyCognitoIdToken } from '@/lib/cognito'
import { getLatestQuitPlanId, getQuitPlan } from '@/lib/quit-engine/store.server'

export const dynamic = 'force-dynamic'

export default async function SosPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const query = await searchParams
  const lang = query.lang === 'en' ? 'en' : 'ar'
  const cookieStore = await cookies()
  const token = cookieStore.get(authCookies.idToken)?.value

  let signedIn = false
  let personalCravingCard: string | undefined
  let referralMessage: string | undefined
  let safetyImmediate: string | undefined

  if (token) {
    try {
      const payload = await verifyCognitoIdToken(token)
      if (typeof payload.sub === 'string') {
        signedIn = true
        try {
          const latestPlanId = await getLatestQuitPlanId(payload.sub)
          if (latestPlanId) {
            const plan = await getQuitPlan(payload.sub, latestPlanId)
            personalCravingCard = plan?.result.craving_card
            referralMessage = plan?.result.referral_message
            safetyImmediate = plan?.result.safety_immediate
          }
        } catch {
          // Quick support stays available even when saved-plan data cannot be loaded.
        }
      }
    } catch {
      signedIn = false
    }
  }

  return <AqlaSos initialLang={lang} signedIn={signedIn} personalCravingCard={personalCravingCard} referralMessage={referralMessage} safetyImmediate={safetyImmediate} />
}
