'use client'

import { useEffect, useMemo, useState } from 'react'

type Lang = 'ar' | 'en'
type FollowupType = 'day_3' | 'day_7' | 'day_30'
type FollowupOutcome = 'quit' | 'reduced' | 'continued' | 'slipped' | 'relapsed' | 'needs_support'
type AdaptationKey = 'maintain_quit' | 'build_on_reduction' | 'small_step' | 'recover_from_slip' | 'restart_without_shame' | 'professional_support'

type StoredResponse = {
  plan_id: string
  followup_type: FollowupType
  outcome: FollowupOutcome
  craving_score: number
  confidence_score: number
  adaptation_key: AdaptationKey
  responded_at: string
}

type FollowupState = {
  plan_id: string
  followup_type: FollowupType
  scheduled_at: string
  available: boolean
  response?: StoredResponse
  previous_response?: StoredResponse
}

const LOGO_URL = '/aqla-logo.png'

const followupLabels = {
  ar: {
    day_3: { eyebrow: 'متابعة اليوم الثالث', title: 'كيف تسير الأمور منذ خطتك؟', subtitle: 'هذه المتابعة تساعد أقلع على فهم ما تغيّر وتقديم الخطوة التالية بشكل أنسب لك.' },
    day_7: { eyebrow: 'متابعة الأسبوع الأول', title: 'أكملت أسبوعك الأول مع أقلع', subtitle: 'سجّل وضعك الحالي حتى تكون الخطوة التالية مبنية على ما حدث فعليًا خلال الأسبوع.' },
    day_30: { eyebrow: 'متابعة الشهر الأول', title: 'مرّ شهر على بداية خطتك', subtitle: 'هذه نقطة مراجعة مهمة لفهم التقدم، التعثرات، ونوع الدعم الذي يفيدك الآن.' },
  },
  en: {
    day_3: { eyebrow: 'Day 3 check-in', title: 'How are things going since your plan?', subtitle: 'This check-in helps Aqla understand what has changed and make the next step more useful for you.' },
    day_7: { eyebrow: 'Week 1 check-in', title: 'You have reached your first week with Aqla', subtitle: 'Record where things stand now so your next step reflects what actually happened this week.' },
    day_30: { eyebrow: 'Month 1 check-in', title: 'It has been one month since your plan began', subtitle: 'This is a useful point to review progress, setbacks and what kind of support may help now.' },
  },
} as const

const outcomeOptions: Record<Lang, { value: FollowupOutcome; title: string; description: string }[]> = {
  ar: [
    { value: 'quit', title: 'مستمر بدون نيكوتين', description: 'لم أستخدم النيكوتين منذ خطتي أو منذ بدء المحاولة.' },
    { value: 'reduced', title: 'قلّلت الاستخدام', description: 'أستخدم أقل من السابق وأريد البناء على هذا التقدم.' },
    { value: 'continued', title: 'ما زلت على نفس النمط', description: 'لم يحدث تغيير واضح حتى الآن.' },
    { value: 'slipped', title: 'حصلت زلّة', description: 'استخدمت مرة أو مرات قليلة بعد محاولة التغيير.' },
    { value: 'relapsed', title: 'عدت للاستخدام المنتظم', description: 'رجعت إلى نمط قريب من استخدامي السابق.' },
    { value: 'needs_support', title: 'أحتاج دعمًا الآن', description: 'أريد مساعدة إضافية لاتخاذ الخطوة التالية.' },
  ],
  en: [
    { value: 'quit', title: 'Still nicotine-free', description: 'I have not used nicotine since my plan or since starting my quit attempt.' },
    { value: 'reduced', title: 'I have reduced', description: 'I am using less than before and want to build on that progress.' },
    { value: 'continued', title: 'About the same', description: 'There has not been a clear change yet.' },
    { value: 'slipped', title: 'I had a slip', description: 'I used once or a few times after trying to change.' },
    { value: 'relapsed', title: 'I returned to regular use', description: 'I am back to a pattern close to my previous use.' },
    { value: 'needs_support', title: 'I need support now', description: 'I want more help deciding or taking the next step.' },
  ],
}

function supportMessage(outcome: FollowupOutcome, craving: number, confidence: number, lang: Lang) {
  const ar = lang === 'ar'
  const base: Record<FollowupOutcome, { ar: [string, string]; en: [string, string] }> = {
    quit: {
      ar: ['استمر في حماية ما نجح', 'ركّز الآن على المواقف عالية الخطورة، ولا تختبر نفسك عمدًا أمام المحفزات. حافظ على البدائل التي ساعدتك وارجع إلى بطاقة الرغبة عند الحاجة.'],
      en: ['Protect what is already working', 'Focus on higher-risk situations and do not deliberately test yourself around triggers. Keep using the alternatives that helped and return to your craving card when needed.'],
    },
    reduced: {
      ar: ['ابنِ على التقدم بدل البدء من الصفر', 'اختر استخدامًا واحدًا متكررًا يمكنك تأخيره أو إلغاؤه خلال الأيام القادمة. الهدف أن يتحول التقليل إلى تغيير منظم وليس مجرد يوم جيد.'],
      en: ['Build on the progress rather than starting again', 'Choose one repeated use that you can delay or remove over the next few days. The aim is to turn reduction into a deliberate pattern of change.'],
    },
    continued: {
      ar: ['صغّر الخطوة بدل أن تتوقف', 'لا تحتاج إلى قرار ضخم اليوم. اختر محفزًا واحدًا فقط وغيّر ما تفعله بعده لمدة 24 ساعة، ثم راقب ما يحدث.'],
      en: ['Make the step smaller rather than stopping the process', 'You do not need a huge decision today. Choose one trigger and change what you do immediately afterwards for the next 24 hours, then observe what happens.'],
    },
    slipped: {
      ar: ['الزلّة لا تلغي الخطة', 'تعامل معها كمعلومة: ما الموقف الذي سبقها؟ عد مباشرة إلى خطتك في الاستخدام التالي بدل انتظار يوم أو أسبوع جديد للبدء.'],
      en: ['A slip does not cancel your plan', 'Use it as information: what happened immediately beforehand? Return to your plan at the next opportunity rather than waiting for a new day or week to restart.'],
    },
    relapsed: {
      ar: ['ابدأ من السبب الذي أعادك، لا من الشعور بالذنب', 'راجع أقوى محفز أعاد الاستخدام واجعل خطوتك التالية أصغر وأكثر حماية. العودة للاستخدام تعني أن الخطة تحتاج تعديلًا، لا أن المحاولة انتهت.'],
      en: ['Restart from what brought you back, not from guilt', 'Review the strongest trigger that brought regular use back and make the next step smaller and better protected. Returning to use means the plan needs adjustment, not that the attempt is over.'],
    },
    needs_support: {
      ar: ['اجعل الدعم جزءًا من الخطة', 'ارجع إلى خطتك وحدد أكثر نقطة تحتاج فيها مساعدة. يمكنك أيضًا مناقشة خيارات الإقلاع والدعم مع طبيب أو صيدلي أو عيادة إقلاع مؤهلة.'],
      en: ['Make support part of the plan', 'Return to your plan and identify the point where help would be most useful. You can also discuss cessation and support options with a qualified clinician, pharmacist or stop-smoking service.'],
    },
  }

  const [title, body] = base[outcome][lang]
  const extra = craving >= 8 || confidence <= 3
    ? (ar
      ? ' وبما أن الرغبة مرتفعة أو الثقة منخفضة حاليًا، قد يكون من المفيد إضافة دعم مهني بدل الاعتماد على الإرادة وحدها.'
      : ' Because cravings are high or confidence is currently low, adding professional support may be more useful than relying on willpower alone.')
    : ''

  return { title, body: `${body}${extra}` }
}

export default function FollowupCheckIn({
  planId,
  followupType,
  initialLang,
}: {
  planId: string
  followupType: FollowupType
  initialLang: Lang
}) {
  const [lang, setLang] = useState<Lang>(initialLang)
  const [state, setState] = useState<FollowupState | null>(null)
  const [outcome, setOutcome] = useState<FollowupOutcome | ''>('')
  const [craving, setCraving] = useState(5)
  const [confidence, setConfidence] = useState(5)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')
  const ar = lang === 'ar'
  const copy = followupLabels[lang][followupType]

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    fetch(`/api/quit-engine/followup/${encodeURIComponent(planId)}/${followupType}`, { cache: 'no-store' })
      .then(async (response) => {
        if (response.status === 401) {
          window.location.href = `/auth/login?returnTo=${encodeURIComponent(`/aqla/followup/${planId}/${followupType}?lang=${lang}`)}`
          return null
        }
        if (!response.ok) throw new Error(`followup_${response.status}`)
        return response.json() as Promise<{ followup: FollowupState }>
      })
      .then((data) => {
        if (!data || cancelled) return
        setState(data.followup)
        if (data.followup.response) {
          setOutcome(data.followup.response.outcome)
          setCraving(data.followup.response.craving_score)
          setConfidence(data.followup.response.confidence_score)
        }
      })
      .catch(() => { if (!cancelled) setError(ar ? 'تعذر تحميل المتابعة الآن. حاول مرة أخرى.' : 'We could not load this check-in. Please try again.') })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [ar, followupType, lang, planId])

  const completed = Boolean(state?.response) && !editing
  const nextSupport = useMemo(() => outcome ? supportMessage(outcome, craving, confidence, lang) : null, [confidence, craving, lang, outcome])
  const availableAt = useMemo(() => {
    if (!state?.scheduled_at) return ''
    const date = new Date(state.scheduled_at)
    if (Number.isNaN(date.getTime())) return ''
    try {
      return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA' : 'en-GB', { dateStyle: 'long', timeStyle: 'short' }).format(date)
    } catch {
      return date.toLocaleString()
    }
  }, [lang, state?.scheduled_at])

  function prepareSignOut() {
    try {
      for (let index = sessionStorage.length - 1; index >= 0; index -= 1) {
        const key = sessionStorage.key(index)
        if (key?.startsWith('aqla_quit_plan:')) sessionStorage.removeItem(key)
      }
      sessionStorage.removeItem('aqla_quit_engine_draft_v1')

      // Remove any legacy staging data left by earlier builds.
      for (let index = localStorage.length - 1; index >= 0; index -= 1) {
        const key = localStorage.key(index)
        if (key?.startsWith('aqla_quit_plan:')) localStorage.removeItem(key)
      }
      localStorage.removeItem('aqla_quit_engine_draft_v1')
    } catch {
      // Cookie/session sign-out still proceeds if browser storage is unavailable.
    }
  }

  function cancelEditing() {
    if (state?.response) {
      setOutcome(state.response.outcome)
      setCraving(state.response.craving_score)
      setConfidence(state.response.confidence_score)
    }
    setError('')
    setEditing(false)
  }

  async function submit() {
    if (!outcome || saving || !state?.available) return
    setSaving(true)
    setError('')
    try {
      const response = await fetch(`/api/quit-engine/followup/${encodeURIComponent(planId)}/${followupType}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ outcome, craving_score: craving, confidence_score: confidence }),
      })
      if (response.status === 401) {
        window.location.href = `/auth/login?returnTo=${encodeURIComponent(`/aqla/followup/${planId}/${followupType}?lang=${lang}`)}`
        return
      }
      if (response.status === 409) {
        setState((previous) => previous ? { ...previous, available: false } : previous)
        setError(ar ? 'هذه المتابعة لم يحن موعدها بعد. ستفتح تلقائيًا عند موعدها.' : 'This check-in is not due yet. It will become available at the scheduled time.')
        return
      }
      if (!response.ok) throw new Error(`save_${response.status}`)
      const data = await response.json() as { response: StoredResponse }
      setState((previous) => previous ? { ...previous, response: data.response } : previous)
      setOutcome(data.response.outcome)
      setCraving(data.response.craving_score)
      setConfidence(data.response.confidence_score)
      setEditing(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setError(ar ? 'لم نتمكن من حفظ متابعتك الآن. إجابتك لم تُفقد من الشاشة؛ حاول مرة أخرى.' : 'We could not save your check-in. Your answers are still on this screen; please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <main className="fu-page" dir={ar ? 'rtl' : 'ltr'} lang={lang}><div className="fu-loading" role="status">{ar ? 'جاري فتح متابعتك بأمان…' : 'Opening your secure check-in…'}</div></main>
  }

  if (!state) {
    return (
      <main className="fu-page" dir={ar ? 'rtl' : 'ltr'} lang={lang}>
        <div className="fu-empty">
          <img src={LOGO_URL} alt="Aqla — أقلع" />
          <h1>{ar ? 'هذه المتابعة غير متاحة لهذا الحساب' : 'This check-in is not available to this account'}</h1>
          <p>{error || (ar ? 'ارجع إلى حساب أقلع وافتح خطتك المحفوظة.' : 'Return to Aqla and open your saved plan.')}</p>
          <a href="/aqla">{ar ? 'العودة إلى أقلع' : 'Back to Aqla'}</a>
        </div>
      </main>
    )
  }

  return (
    <main className="fu-page" dir={ar ? 'rtl' : 'ltr'} lang={lang}>
      <header className="fu-topbar">
        <a href="/aqla" className="fu-brand"><img src={LOGO_URL} alt="Aqla — أقلع" /><span>{ar ? 'أقلع' : 'Aqla'}</span></a>
        <div className="fu-top-actions">
          <button type="button" className="fu-utility" onClick={() => setLang(ar ? 'en' : 'ar')} aria-label={ar ? 'Switch to English' : 'التبديل إلى العربية'}>{ar ? 'EN' : 'ع'}</button>
          <a href="/auth/logout" className="fu-utility wide" onClick={prepareSignOut}>{ar ? 'تسجيل الخروج' : 'Sign out'}</a>
        </div>
      </header>

      <div className="fu-shell">
        <section className="fu-hero">
          <span className="fu-eyebrow">{copy.eyebrow}</span>
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
          {state.previous_response ? <div className="fu-continuity">{ar ? 'سنأخذ آخر متابعة لك في الاعتبار عند تقديم الخطوة التالية.' : 'Your previous check-in will be taken into account when we present the next step.'}</div> : null}
        </section>

        {!state.available && !state.response ? (
          <section className="fu-success" aria-live="polite">
            <div className="fu-success-mark" aria-hidden="true">◷</div>
            <div>
              <span>{ar ? 'المتابعة محفوظة لوقتها المناسب' : 'Your check-in is scheduled'}</span>
              <h2>{ar ? 'لم يحن موعد هذه المتابعة بعد' : 'This check-in is not due yet'}</h2>
              <p>{availableAt
                ? (ar ? `ستصبح هذه المتابعة متاحة في ${availableAt}.` : `This check-in will become available on ${availableAt}.`)
                : (ar ? 'ارجع في الموعد المحدد في رسالة أقلع.' : 'Return at the time shown in your Aqla message.')}</p>
            </div>
            <div className="fu-success-actions">
              <a href={`/aqla/plan/${encodeURIComponent(planId)}?lang=${lang}`} className="fu-primary">{ar ? 'العودة إلى خطتي' : 'Back to my plan'}</a>
            </div>
          </section>
        ) : completed && state.response ? (
          <section className="fu-success" aria-live="polite">
            <div className="fu-success-mark">✓</div>
            <div>
              <span>{ar ? 'تم حفظ متابعتك بأمان' : 'Your check-in is securely saved'}</span>
              <h2>{nextSupport?.title}</h2>
              <p>{nextSupport?.body}</p>
            </div>
            <div className="fu-success-actions">
              <a href={`/aqla/plan/${encodeURIComponent(planId)}?lang=${lang}`} className="fu-primary">{ar ? 'افتح خطتي' : 'Open my plan'}</a>
              <button type="button" className="fu-secondary" onClick={() => setEditing(true)}>{ar ? 'تحديث إجابتي' : 'Update my check-in'}</button>
            </div>
          </section>
        ) : (
          <section className="fu-form-card">
            <fieldset className="fu-fieldset">
              <legend>{ar ? 'أين أنت الآن؟' : 'Where are you now?'}</legend>
              <p className="fu-help">{ar ? 'اختر الوصف الأقرب لوضعك الحالي. لا توجد إجابة مثالية.' : 'Choose the option closest to your current situation. There is no perfect answer.'}</p>
              <div className="fu-outcome-grid">
                {outcomeOptions[lang].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`fu-outcome ${outcome === option.value ? 'active' : ''}`}
                    aria-pressed={outcome === option.value}
                    onClick={() => setOutcome(option.value)}
                  >
                    <strong>{option.title}</strong>
                    <span>{option.description}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="fu-score-grid">
              <label className="fu-score-card">
                <span className="fu-score-heading"><strong>{ar ? 'أقوى رغبة خلال آخر 24 ساعة' : 'Strongest craving in the last 24 hours'}</strong><b>{craving}/10</b></span>
                <input aria-label={ar ? 'درجة أقوى رغبة خلال آخر 24 ساعة' : 'Strongest craving score in the last 24 hours'} type="range" min="0" max="10" step="1" value={craving} onChange={(event) => setCraving(Number(event.target.value))} />
                <span className="fu-range-ends"><span>{ar ? 'لا توجد' : 'None'}</span><span>{ar ? 'شديدة جدًا' : 'Very strong'}</span></span>
              </label>

              <label className="fu-score-card">
                <span className="fu-score-heading"><strong>{ar ? 'ثقتك في خطوتك القادمة' : 'Confidence in your next step'}</strong><b>{confidence}/10</b></span>
                <input aria-label={ar ? 'درجة الثقة في الخطوة القادمة' : 'Confidence score for your next step'} type="range" min="0" max="10" step="1" value={confidence} onChange={(event) => setConfidence(Number(event.target.value))} />
                <span className="fu-range-ends"><span>{ar ? 'منخفضة' : 'Low'}</span><span>{ar ? 'مرتفعة' : 'High'}</span></span>
              </label>
            </div>

            {outcome && nextSupport ? <div className="fu-preview"><span>{ar ? 'بعد الحفظ' : 'After saving'}</span><strong>{nextSupport.title}</strong><p>{ar ? 'سيظهر لك توجيه قصير مبني على إجابتك، ثم يمكنك الرجوع مباشرة إلى خطتك.' : 'You will see a short next step based on your response, then you can return directly to your plan.'}</p></div> : null}
            {error ? <div className="fu-error" role="alert">{error}</div> : null}

            <div className="fu-submit-row">
              <button type="button" className="fu-primary" disabled={!outcome || saving || !state.available} onClick={() => void submit()}>{saving ? (ar ? 'جاري الحفظ…' : 'Saving…') : (ar ? 'احفظ متابعتي' : 'Save my check-in')}</button>
              {editing ? <button type="button" className="fu-secondary" onClick={cancelEditing}>{ar ? 'إلغاء' : 'Cancel'}</button> : null}
            </div>
            <p className="fu-privacy">{ar ? 'تفاصيل هذه المتابعة محفوظة داخل حسابك ولا نضعها في عنوان البريد الإلكتروني أو معاينته.' : 'Your check-in details stay inside your account and are not placed in the email subject or preview.'}</p>
          </section>
        )}
      </div>
    </main>
  )
}
