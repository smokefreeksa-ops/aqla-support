import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import FollowupCheckIn from '@/components/FollowupCheckIn'
import { getAdaptiveTriageContext } from '@/lib/adaptive-assessment.server'
import type { FollowupFocus } from '@/lib/adaptive-assessment'
import { authCookies, verifyCognitoIdToken } from '@/lib/cognito'
import { isFollowupType } from '@/lib/followup-policy'

export const dynamic = 'force-dynamic'

function focusCopy(focus: FollowupFocus, lang: 'ar' | 'en') {
  const copy = {
    ar: {
      maintain: ['الحفاظ على ما نجح', 'سنراجع ما يحميك من الرجوع ونركز على المواقف عالية الخطورة.'],
      mixed_use: ['ترتيب الأولويات بين المنتجات', 'سنراجع ما إذا كان منتج نيكوتين يستبدل منتجًا آخر ونختار خطوة واحدة واضحة بدل تغيير كل شيء دفعة واحدة.'],
      cravings: ['الرغبة والاعتماد على النيكوتين', 'سنركز على شدة الرغبة وما حدث عندما لم يكن النيكوتين متاحًا.'],
      triggers: ['المحفزات والروتين', 'سنراجع أكثر المواقف التي أعادت الاستخدام ونعدل الخطة حولها.'],
      confidence: ['الثقة وخطوة أصغر', 'سنركز على خطوة قابلة للتنفيذ بدل الضغط نحو قرار أكبر من استعدادك الحالي.'],
      reduction: ['البناء على التقليل', 'سنراجع ما الذي انخفض فعلًا ونحوّل التقليل إلى خطة منظمة.'],
      general: ['مراجعة خطوتك التالية', 'سنستخدم ما حدث منذ آخر متابعة لتحديث الدعم داخل أقلع.'],
    },
    en: {
      maintain: ['Protecting what worked', 'We will review what is helping prevent return to use and focus on higher-risk situations.'],
      mixed_use: ['Prioritising mixed-product use', 'We will review whether one nicotine product is replacing another and choose one clear next step rather than changing everything at once.'],
      cravings: ['Cravings and nicotine pattern', 'We will focus on craving intensity and what happened when nicotine was not available.'],
      triggers: ['Triggers and routines', 'We will review the situations most linked to return to use and adjust the plan around them.'],
      confidence: ['Confidence and a smaller step', 'We will focus on an achievable next step rather than pushing a commitment beyond your current readiness.'],
      reduction: ['Building on reduction', 'We will review what has actually reduced and turn that progress into a deliberate plan.'],
      general: ['Reviewing your next step', 'We will use what happened since the last check-in to update your support inside Aqla.'],
    },
  } as const
  return copy[lang][focus]
}

export default async function FollowupPage({
  params,
  searchParams,
}: {
  params: Promise<{ planId: string; followupType: string }>
  searchParams: Promise<{ lang?: string }>
}) {
  const raw = await params
  const query = await searchParams
  const lang = query.lang === 'en' ? 'en' : 'ar'

  if (!/^[0-9a-f-]{36}$/i.test(raw.planId) || !isFollowupType(raw.followupType)) {
    redirect('/aqla')
  }

  const returnTo = `/aqla/followup/${encodeURIComponent(raw.planId)}/${raw.followupType}?lang=${lang}`
  const cookieStore = await cookies()
  const token = cookieStore.get(authCookies.idToken)?.value
  let userSub: string | null = null

  if (token) {
    try {
      const payload = await verifyCognitoIdToken(token)
      userSub = typeof payload.sub === 'string' ? payload.sub : null
    } catch {
      userSub = null
    }
  }

  if (!userSub) {
    const refreshToken = cookieStore.get(authCookies.refreshToken)?.value
    redirect(refreshToken
      ? `/auth/refresh?returnTo=${encodeURIComponent(returnTo)}`
      : `/auth/login?returnTo=${encodeURIComponent(returnTo)}`)
  }

  let adaptiveFocus: FollowupFocus | null = null
  try {
    const context = await getAdaptiveTriageContext(userSub)
    if (context?.plan_id === raw.planId) adaptiveFocus = context.triage.followup_focus
  } catch {
    adaptiveFocus = null
  }

  const focus = adaptiveFocus ? focusCopy(adaptiveFocus, lang) : null

  return (
    <>
      {focus ? (
        <section className="fu-page" dir={lang === 'ar' ? 'rtl' : 'ltr'} lang={lang} style={{ paddingBottom: 0 }}>
          <div className="fu-shell">
            <div className="qe-note success">
              <strong>{lang === 'ar' ? 'محور هذه المتابعة: ' : 'Focus for this check-in: '}{focus[0]}</strong>
              <div style={{ marginTop: 6 }}>{focus[1]}</div>
              <div style={{ marginTop: 6, opacity: 0.8 }}>{lang === 'ar' ? 'تظهر هذه التفاصيل فقط بعد تسجيل الدخول؛ رسالة البريد نفسها تبقى عامة حفاظًا على الخصوصية.' : 'This detail appears only after sign-in; the email itself remains generic for privacy.'}</div>
            </div>
          </div>
        </section>
      ) : null}
      <FollowupCheckIn planId={raw.planId} followupType={raw.followupType} initialLang={lang} />
    </>
  )
}
