import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { authCookies, verifyCognitoIdToken } from '@/lib/cognito'
import {
  getFollowupState,
  getLatestQuitPlanId,
  getQuitPlan,
  type FollowupState,
  type FollowupType,
} from '@/lib/quit-engine/store.server'
import type { StoredQuitPlan } from '@/lib/quit-engine/types'

export const dynamic = 'force-dynamic'

const followupOrder: FollowupType[] = ['day_3', 'day_7', 'day_30']

function formatDate(value: string | undefined, lang: 'ar' | 'en') {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  try {
    return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA' : 'en-GB', { dateStyle: 'medium' }).format(date)
  } catch {
    return date.toLocaleDateString()
  }
}

function followupName(type: FollowupType, ar: boolean) {
  if (type === 'day_3') return ar ? 'متابعة اليوم الثالث' : 'Day 3 check-in'
  if (type === 'day_7') return ar ? 'متابعة الأسبوع الأول' : 'Week 1 check-in'
  return ar ? 'متابعة الشهر الأول' : 'Month 1 check-in'
}

function outcomeLabel(outcome: string | undefined, ar: boolean) {
  const map: Record<string, { ar: string; en: string }> = {
    quit: { ar: 'متوقف عن الاستخدام', en: 'Quit' },
    reduced: { ar: 'خفض الاستخدام', en: 'Reduced' },
    continued: { ar: 'استمر على نفس النمط', en: 'Continued' },
    slipped: { ar: 'حدثت زلة', en: 'Slip' },
    relapsed: { ar: 'عاد للاستخدام', en: 'Relapse' },
    needs_support: { ar: 'يحتاج دعمًا إضافيًا', en: 'Needs more support' },
  }
  const item = outcome ? map[outcome] : undefined
  return item ? (ar ? item.ar : item.en) : ''
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const query = await searchParams
  const lang: 'ar' | 'en' = query.lang === 'en' ? 'en' : 'ar'
  const ar = lang === 'ar'
  const returnTo = `/aqla/dashboard?lang=${lang}`
  const cookieStore = await cookies()
  const token = cookieStore.get(authCookies.idToken)?.value
  const refreshToken = cookieStore.get(authCookies.refreshToken)?.value

  let userSub: string | null = null
  if (token) {
    try {
      const payload = await verifyCognitoIdToken(token)
      if (typeof payload.sub === 'string') userSub = payload.sub
    } catch {
      userSub = null
    }
  }

  if (!userSub) {
    redirect(refreshToken
      ? `/auth/refresh?returnTo=${encodeURIComponent(returnTo)}`
      : `/auth/login?returnTo=${encodeURIComponent(returnTo)}`)
  }

  let latestPlanId: string | null = null
  let plan: StoredQuitPlan | null = null
  let followups: Array<{ type: FollowupType; state: FollowupState | null }> = []
  let dataUnavailable = false

  try {
    latestPlanId = await getLatestQuitPlanId(userSub)
    if (latestPlanId) {
      const [storedPlan, ...states] = await Promise.all([
        getQuitPlan(userSub, latestPlanId),
        ...followupOrder.map((type) => getFollowupState(userSub, latestPlanId as string, type)),
      ])
      plan = storedPlan
      followups = followupOrder.map((type, index) => ({ type, state: states[index] as FollowupState | null }))
    }
  } catch {
    dataUnavailable = true
  }

  const completed = followups.filter((item) => item.state?.response).length
  const next = followups.find((item) => !item.state?.response)
  const planUrl = latestPlanId ? `/aqla/plan/${encodeURIComponent(latestPlanId)}?lang=${lang}` : null

  return (
    <main className="ax-page" dir={ar ? 'rtl' : 'ltr'} lang={lang}>
      <header className="ax-topbar">
        <a className="ax-brand" href="/aqla"><img src="/aqla-logo.png" alt="Aqla — أقلع" /><span>{ar ? 'أقلع' : 'Aqla'}</span></a>
        <nav className="ax-nav" aria-label={ar ? 'التنقل' : 'Navigation'}>
          <a href="/aqla">{ar ? 'الرئيسية' : 'Home'}</a>
          <a href={`/aqla/sos?lang=${lang}`}>{ar ? 'مساعدة سريعة' : 'Quick help'}</a>
          <a href={`/aqla/academy?lang=${lang}`}>{ar ? 'الأكاديمية' : 'Academy'}</a>
          <a href={`/aqla/dashboard?lang=${ar ? 'en' : 'ar'}`}>{ar ? 'EN' : 'ع'}</a>
        </nav>
      </header>

      <div className="ax-shell">
        <section className="ax-hero ax-dashboard-hero">
          <div>
            <span className="ax-eyebrow">{ar ? 'لوحتي' : 'My Aqla'}</span>
            <h1>{ar ? 'رحلتك مع أقلع في مكان واحد' : 'Your Aqla journey in one place'}</h1>
            <p>{ar ? 'افتح خطتك، راجع نقاط المتابعة، واطلب مساعدة سريعة عند الحاجة.' : 'Open your plan, review check-ins and get quick support when you need it.'}</p>
          </div>
          <div className="ax-hero-actions">
            {planUrl ? <a className="ax-button primary" href={planUrl}>{ar ? 'افتح خطتي' : 'Open my plan'}</a> : <a className="ax-button primary" href="/aqla/assessment">{ar ? 'ابدأ خطة جديدة' : 'Start a plan'}</a>}
            <a className="ax-button secondary" href={`/aqla/sos?lang=${lang}`}>{ar ? 'أحتاج مساعدة الآن' : 'I need help now'}</a>
          </div>
        </section>

        {dataUnavailable ? (
          <section className="ax-alert neutral" role="status">
            <strong>{ar ? 'تعذر تحميل بيانات اللوحة الآن' : 'Dashboard data is temporarily unavailable'}</strong>
            <p>{ar ? 'يمكنك العودة لاحقًا أو بدء تقييم جديد. لم نفقد خطتك بسبب هذه الرسالة.' : 'You can return later or start a new assessment. This message does not mean your plan was lost.'}</p>
          </section>
        ) : null}

        {plan ? (
          <>
            <div className="ax-grid ax-grid-three">
              <section className="ax-card ax-stat-card">
                <span>{ar ? 'الخطة الحالية' : 'Current plan'}</span>
                <strong>{formatDate(plan.created_at, lang)}</strong>
                <a href={planUrl ?? '/aqla/assessment'}>{ar ? 'عرض الخطة' : 'View plan'}</a>
              </section>
              <section className="ax-card ax-stat-card">
                <span>{ar ? 'الاستعداد الحالي' : 'Current readiness'}</span>
                <strong>{plan.result.readiness_text}</strong>
              </section>
              <section className="ax-card ax-stat-card">
                <span>{ar ? 'المتابعات المكتملة' : 'Completed check-ins'}</span>
                <strong>{completed} / 3</strong>
                <small>{next?.state ? (next.state.available ? (ar ? 'لديك متابعة جاهزة الآن' : 'A check-in is ready now') : (ar ? `المتابعة التالية ${formatDate(next.state.scheduled_at, lang)}` : `Next check-in ${formatDate(next.state.scheduled_at, lang)}`)) : (ar ? 'لا توجد متابعة معلقة' : 'No pending check-in')}</small>
              </section>
            </div>

            <section className="ax-card">
              <div className="ax-card-heading">
                <div><span className="ax-eyebrow">{ar ? 'التقدم' : 'Progress'}</span><h2>{ar ? 'متابعة اليوم 3 و7 و30' : 'Day 3, 7 and 30 check-ins'}</h2></div>
                <span className="ax-progress-label">{completed}/3</span>
              </div>
              <div className="ax-progress-track" aria-label={ar ? 'تقدم المتابعة' : 'Follow-up progress'}><span style={{ width: `${(completed / 3) * 100}%` }} /></div>
              <div className="ax-followup-list">
                {followups.map(({ type, state }) => {
                  const responded = Boolean(state?.response)
                  const ready = Boolean(state?.available && !responded)
                  const status = responded ? (ar ? 'مكتملة' : 'Completed') : ready ? (ar ? 'جاهزة الآن' : 'Ready now') : (ar ? 'مخططة' : 'Planned')
                  return (
                    <article className="ax-followup-row" key={type}>
                      <div><strong>{followupName(type, ar)}</strong><small>{state ? formatDate(state.scheduled_at, lang) : (ar ? 'ستظهر مع الخطة' : 'Appears with your plan')}</small>{state?.response ? <em>{outcomeLabel(state.response.outcome, ar)}</em> : null}</div>
                      <span className={`ax-status ${responded ? 'done' : ready ? 'ready' : ''}`}>{status}</span>
                      {ready && latestPlanId ? <a className="ax-button compact" href={`/aqla/followup/${encodeURIComponent(latestPlanId)}/${type}?lang=${lang}`}>{ar ? 'افتح المتابعة' : 'Open check-in'}</a> : null}
                    </article>
                  )
                })}
              </div>
            </section>

            <div className="ax-grid ax-grid-two">
              <section className="ax-card ax-support-card">
                <span className="ax-eyebrow">{ar ? 'بطاقة الرغبة' : 'Craving card'}</span>
                <h2>{ar ? 'خطوتك السريعة عند اشتداد الرغبة' : 'Your quick step during a strong craving'}</h2>
                <p>{plan.result.craving_card}</p>
                <a className="ax-button secondary" href={`/aqla/sos?lang=${lang}`}>{ar ? 'افتح المساعدة السريعة' : 'Open quick help'}</a>
              </section>
              <section className="ax-card ax-support-card">
                <span className="ax-eyebrow">{ar ? 'الدعم المناسب' : 'Right level of support'}</span>
                <h2>{ar ? 'مؤشر دعم أقلع' : 'Aqla support indicator'}</h2>
                <div className="ax-score"><strong>{plan.result.aqla_support_intensity}</strong><span>/10</span></div>
                <p>{plan.result.referral_message}</p>
              </section>
            </div>
          </>
        ) : !dataUnavailable ? (
          <section className="ax-empty">
            <img src="/aqla-logo.png" alt="" />
            <h2>{ar ? 'لا توجد خطة محفوظة بعد' : 'No saved plan yet'}</h2>
            <p>{ar ? 'ابدأ التقييم لبناء أول خطة شخصية وحفظها في حسابك.' : 'Start the assessment to build and save your first personal plan.'}</p>
            <a className="ax-button primary" href="/aqla/assessment">{ar ? 'ابدأ التقييم' : 'Start assessment'}</a>
          </section>
        ) : null}

        <section className="ax-quick-grid">
          <a className="ax-quick-card" href={`/aqla/academy?lang=${lang}`}><strong>{ar ? 'أكاديمية أقلع' : 'Aqla Academy'}</strong><span>{ar ? 'تعلم عن المحفزات والرغبة والانسحاب ومنع الانتكاس.' : 'Learn about triggers, cravings, withdrawal and staying quit.'}</span></a>
          <a className="ax-quick-card" href={`/info/faq?lang=${lang}`}><strong>{ar ? 'الأسئلة الشائعة' : 'FAQ'}</strong><span>{ar ? 'إجابات سريعة عن الخطط والمتابعة والخصوصية.' : 'Quick answers about plans, follow-up and privacy.'}</span></a>
          <a className="ax-quick-card" href="/auth/logout"><strong>{ar ? 'تسجيل الخروج' : 'Sign out'}</strong><span>{ar ? 'إنهاء الجلسة على هذا الجهاز.' : 'End your session on this device.'}</span></a>
        </section>
      </div>
    </main>
  )
}
