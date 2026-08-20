'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  CIGS_PER_DAY,
  FIRST_USE_OPTIONS,
  PERSONAL_REASONS,
  POUCH_FREQ,
  PREV_ATTEMPTS,
  PRODUCT_OPTIONS,
  RELAPSE_CAUSES,
  SAFETY_OPTIONS,
  SHISHA_DURATION,
  SHISHA_SESSIONS,
  TRIGGER_OPTIONS,
  VAPE_PATTERNS,
  type BiOption,
} from '@/lib/quit-engine/questions'
import type { EngineAnswers, FirstUseAfterWaking, ProductType, SafetyFlag, StoredQuitPlan, TriggerKey } from '@/lib/quit-engine/types'

const LOGO_URL = '/aqla-logo.png'
const DRAFT_KEY = 'aqla_quit_engine_draft_v1'
const ASSESSMENT_LOGIN_URL = `/auth/login?returnTo=${encodeURIComponent('/aqla/assessment')}`

const EMPTY: EngineAnswers = {
  product_types: [],
  mixed_use: false,
  relapse_prevention_mode: false,
  triggers: [],
  importance_score: 5,
  confidence_score: 5,
  readiness_score: 5,
  relapse_causes: [],
  safety_flags: [],
  personal_reasons: [],
}

type Lang = 'ar' | 'en'

const text = {
  ar: {
    title: 'اختبار أقلع وبناء خطتك الشخصية',
    subtitle: 'ثماني خطوات قصيرة لفهم نمط استخدامك، محفزاتك، واستعدادك الحالي. النتيجة ليست تشخيصًا طبيًا.',
    backHome: 'العودة لأقلع',
    signIn: 'تسجيل الدخول',
    signOut: 'تسجيل الخروج',
    step: 'الخطوة',
    of: 'من',
    previous: 'السابق',
    next: 'متابعة',
    submit: 'أنشئ خطتي الشخصية',
    submitting: 'جاري بناء خطتك…',
    loginSubmit: 'سجّل الدخول واحفظ خطتك',
    savedDraft: 'سنحفظ إجاباتك على هذا الجهاز أثناء تسجيل الدخول.',
    error: 'تعذر إنشاء الخطة الآن. حاول مرة أخرى.',
    required: 'أكمل هذا الجزء قبل المتابعة.',
    stages: ['المنتج', 'أول استخدام', 'الكمية', 'المحفزات', 'الاستعداد', 'المحاولات السابقة', 'السلامة', 'أسبابك'],
  },
  en: {
    title: 'Aqla assessment and personal plan',
    subtitle: 'Eight short steps to understand your nicotine pattern, triggers and current readiness. The result is not a medical diagnosis.',
    backHome: 'Back to Aqla',
    signIn: 'Sign in',
    signOut: 'Sign out',
    step: 'Step',
    of: 'of',
    previous: 'Previous',
    next: 'Continue',
    submit: 'Build my personal plan',
    submitting: 'Building your plan…',
    loginSubmit: 'Sign in and save my plan',
    savedDraft: 'Your answers will stay saved on this device while you sign in.',
    error: 'We could not build your plan right now. Please try again.',
    required: 'Complete this section before continuing.',
    stages: ['Product', 'First use', 'Amount', 'Triggers', 'Readiness', 'Past attempts', 'Safety', 'Your reasons'],
  },
} as const

function label<T extends string>(option: BiOption<T>, lang: Lang) {
  return option[lang]
}

function Chip({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`qe-chip ${active ? 'active' : ''}`}>{children}</button>
}

function SinglePick<T extends string>({ options, value, lang, onChange }: { options: BiOption<T>[]; value?: string; lang: Lang; onChange: (value: T) => void }) {
  return <div className="qe-option-grid">{options.map((option) => <Chip key={option.value} active={value === option.value} onClick={() => onChange(option.value)}>{label(option, lang)}</Chip>)}</div>
}

function MultiPick<T extends string>({ options, values, lang, onToggle }: { options: BiOption<T>[]; values: string[]; lang: Lang; onToggle: (value: T) => void }) {
  return <div className="qe-option-grid">{options.map((option) => <Chip key={option.value} active={values.includes(option.value)} onClick={() => onToggle(option.value)}>{label(option, lang)}</Chip>)}</div>
}

function RangeQuestion({ label: qLabel, value, lang, onChange }: { label: string; value: number; lang: Lang; onChange: (value: number) => void }) {
  return (
    <div className="qe-range-card">
      <div className="qe-range-label"><strong>{qLabel}</strong><span>{value}/10</span></div>
      <input aria-label={qLabel} type="range" min="0" max="10" step="1" value={value} onChange={(event) => onChange(Number(event.target.value))} />
      <div className="qe-range-ends"><span>{lang === 'ar' ? 'منخفض' : 'Low'}</span><span>{lang === 'ar' ? 'مرتفع' : 'High'}</span></div>
    </div>
  )
}

export default function QuitEngineAssessment({ signedIn }: { signedIn: boolean }) {
  const [lang, setLang] = useState<Lang>('ar')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<EngineAnswers>(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [showRequired, setShowRequired] = useState(false)
  const [error, setError] = useState('')
  const t = text[lang]
  const ar = lang === 'ar'

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (raw) setAnswers({ ...EMPTY, ...JSON.parse(raw) as EngineAnswers })
    } catch {
      // Ignore an invalid local draft.
    }
  }, [])

  useEffect(() => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(answers)) } catch { /* no-op */ }
  }, [answers])

  const update = (patch: Partial<EngineAnswers>) => setAnswers((previous) => ({ ...previous, ...patch }))

  const relapseOnly = answers.product_types.length === 1 && answers.product_types[0] === 'relapse_prevention'

  const toggleProduct = (value: ProductType) => {
    if (value === 'relapse_prevention') {
      update({
        product_types: answers.product_types.includes(value) ? [] : ['relapse_prevention'],
        primary_product: 'relapse_prevention',
        mixed_use: false,
        relapse_prevention_mode: true,
        first_use_after_waking: 'not_daily',
      })
      return
    }

    const withoutRelapse = answers.product_types.filter((p) => p !== 'relapse_prevention')
    const next = withoutRelapse.includes(value) ? withoutRelapse.filter((p) => p !== value) : [...withoutRelapse, value]
    update({
      product_types: next,
      primary_product: next[0],
      mixed_use: next.length > 1,
      relapse_prevention_mode: false,
      first_use_after_waking: answers.first_use_after_waking === 'not_daily' && answers.product_types.includes('relapse_prevention') ? undefined : answers.first_use_after_waking,
    })
  }

  const toggleTrigger = (value: TriggerKey) => update({ triggers: answers.triggers.includes(value) ? answers.triggers.filter((v) => v !== value) : [...answers.triggers, value] })
  const toggleRelapseCause = (value: string) => update({ relapse_causes: answers.relapse_causes.includes(value) ? answers.relapse_causes.filter((v) => v !== value) : [...answers.relapse_causes, value] })
  const toggleReason = (value: string) => {
    if (answers.personal_reasons.includes(value)) update({ personal_reasons: answers.personal_reasons.filter((v) => v !== value) })
    else if (answers.personal_reasons.length < 3) update({ personal_reasons: [...answers.personal_reasons, value] })
  }
  const toggleSafety = (value: SafetyFlag) => {
    if (value === 'none') {
      update({ safety_flags: answers.safety_flags.includes('none') ? [] : ['none'] })
      return
    }
    const withoutNone = answers.safety_flags.filter((v) => v !== 'none')
    update({ safety_flags: withoutNone.includes(value) ? withoutNone.filter((v) => v !== value) : [...withoutNone, value] })
  }

  const canNext = useMemo(() => {
    if (step === 0) return answers.product_types.length > 0
    if (step === 1) return relapseOnly || Boolean(answers.first_use_after_waking)
    if (step === 2) {
      if (relapseOnly) return true
      if (answers.product_types.includes('cigarettes') && !answers.cigarettes_per_day) return false
      if (answers.product_types.includes('shisha') && (!answers.shisha_sessions_per_week || !answers.shisha_session_duration)) return false
      if (answers.product_types.includes('vape') && !answers.vape_pattern) return false
      if (answers.product_types.includes('pouches') && !answers.nicotine_pouch_frequency) return false
      return true
    }
    if (step === 3) return answers.triggers.length > 0
    if (step === 4) return true
    if (step === 5) return Boolean(answers.previous_quit_attempts)
    if (step === 6) return answers.safety_flags.length > 0
    if (step === 7) return answers.personal_reasons.length > 0
    return true
  }, [answers, relapseOnly, step])

  function goNext() {
    if (!canNext) { setShowRequired(true); return }
    setShowRequired(false)
    setStep((value) => Math.min(7, value + 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function prepareSignOut() {
    try {
      for (let index = localStorage.length - 1; index >= 0; index -= 1) {
        const key = localStorage.key(index)
        if (key?.startsWith('aqla_quit_plan:')) localStorage.removeItem(key)
      }
      localStorage.removeItem(DRAFT_KEY)
    } catch {
      // Cookie/session sign-out still proceeds if browser storage is unavailable.
    }
  }

  async function submit() {
    if (!canNext || submitting) { setShowRequired(true); return }
    setError('')

    if (!signedIn) {
      window.location.href = ASSESSMENT_LOGIN_URL
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/quit-engine/plan', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ lang, answers }),
      })

      if (response.status === 401) {
        window.location.href = ASSESSMENT_LOGIN_URL
        return
      }
      if (!response.ok) throw new Error(`plan_${response.status}`)

      const json = await response.json() as { plan: StoredQuitPlan }
      const plan = json.plan
      localStorage.setItem(`aqla_quit_plan:${plan.plan_id}`, JSON.stringify(plan))
      localStorage.removeItem(DRAFT_KEY)
      window.location.href = `/aqla/plan/${plan.plan_id}?lang=${lang}`
    } catch (cause) {
      console.error(cause)
      setError(t.error)
    } finally {
      setSubmitting(false)
    }
  }

  const progress = ((step + 1) / 8) * 100

  return (
    <main className="qe-page" dir={ar ? 'rtl' : 'ltr'} lang={lang}>
      <header className="qe-topbar">
        <a href="/aqla" className="qe-brand"><img src={LOGO_URL} alt="Aqla — أقلع" /><span>{t.backHome}</span></a>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="qe-lang" aria-label={ar ? 'Switch to English' : 'التبديل إلى العربية'} onClick={() => setLang(ar ? 'en' : 'ar')}>{ar ? 'EN' : 'ع'}</button>
          {signedIn ? (
            <a
              href="/auth/logout"
              className="qe-lang"
              onClick={prepareSignOut}
              style={{ width: 'auto', minWidth: 0, paddingInline: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap' }}
              aria-label={ar ? 'تسجيل الخروج من حساب أقلع' : 'Sign out of your Aqla account'}
            >
              {t.signOut}
            </a>
          ) : (
            <a
              href={ASSESSMENT_LOGIN_URL}
              className="qe-lang"
              style={{ width: 'auto', minWidth: 0, paddingInline: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap' }}
              aria-label={ar ? 'تسجيل الدخول إلى أقلع' : 'Sign in to Aqla'}
            >
              {t.signIn}
            </a>
          )}
        </div>
      </header>

      <div className="qe-shell">
        <section className="qe-intro">
          <span className="qe-kicker">Aqla Personal Quit Engine</span>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </section>

        <div className="qe-progress-meta"><span>{t.step} {step + 1} {t.of} 8</span><strong>{t.stages[step]}</strong></div>
        <div className="qe-progress"><span style={{ width: `${progress}%` }} /></div>

        <section className="qe-card">
          {step === 0 && <>
            <h2>{ar ? 'أي من هذه تستخدم حاليًا؟' : 'Which of these do you currently use?'}</h2>
            <p>{ar ? 'اختر كل ما ينطبق عليك. إذا كنت لا تستخدم حاليًا وتريد منع الانتكاسة، اختر الخيار الأخير وحده.' : 'Select everything that applies. If you currently use no nicotine and want relapse prevention, choose the final option by itself.'}</p>
            <MultiPick options={PRODUCT_OPTIONS} values={answers.product_types} lang={lang} onToggle={toggleProduct} />
          </>}

          {step === 1 && <>
            <h2>{ar ? 'بعد الاستيقاظ، متى تستخدم أول نيكوتين؟' : 'After waking, when do you first use nicotine?'}</h2>
            {relapseOnly ? <div className="qe-note success">{ar ? 'أنت في وضع منع الانتكاسة، لذلك لا نحتاج هذا السؤال الآن. اضغط متابعة.' : 'You are in relapse-prevention mode, so this question is not needed. Continue to the next step.'}</div> : <SinglePick options={FIRST_USE_OPTIONS} value={answers.first_use_after_waking} lang={lang} onChange={(value: FirstUseAfterWaking) => update({ first_use_after_waking: value })} />}
            {!relapseOnly && (answers.first_use_after_waking === 'lt_5' || answers.first_use_after_waking === '6_30') ? <div className="qe-note">{ar ? 'الاستخدام المبكر بعد الاستيقاظ قد يعني أنك تحتاج دعمًا أقوى في الصباح. سنأخذ ذلك في الاعتبار داخل الخطة.' : 'Early use after waking can mean mornings need stronger support. Aqla will account for that in your plan.'}</div> : null}
          </>}

          {step === 2 && <div className="qe-stack">
            <h2>{ar ? 'كمية ونمط الاستخدام' : 'Amount and pattern of use'}</h2>
            {relapseOnly ? <div className="qe-note success">{ar ? 'لا توجد أسئلة كمية لأنك لا تستخدم النيكوتين حاليًا.' : 'There are no quantity questions because you do not currently use nicotine.'}</div> : null}
            {answers.product_types.includes('cigarettes') && <QuestionBlock title={ar ? 'كم سيجارة في اليوم عادة؟' : 'How many cigarettes do you usually smoke a day?'}><SinglePick options={CIGS_PER_DAY} value={answers.cigarettes_per_day} lang={lang} onChange={(value) => update({ cigarettes_per_day: value })} /></QuestionBlock>}
            {answers.product_types.includes('shisha') && <><QuestionBlock title={ar ? 'كم جلسة شيشة في الأسبوع؟' : 'How many shisha sessions a week?'}><SinglePick options={SHISHA_SESSIONS} value={answers.shisha_sessions_per_week} lang={lang} onChange={(value) => update({ shisha_sessions_per_week: value })} /></QuestionBlock><QuestionBlock title={ar ? 'كم تستمر الجلسة غالبًا؟' : 'How long does a session usually last?'}><SinglePick options={SHISHA_DURATION} value={answers.shisha_session_duration} lang={lang} onChange={(value) => update({ shisha_session_duration: value })} /></QuestionBlock></>}
            {answers.product_types.includes('vape') && <QuestionBlock title={ar ? 'كيف تصف استخدامك للفيب؟' : 'How would you describe your vaping?'}><SinglePick options={VAPE_PATTERNS} value={answers.vape_pattern} lang={lang} onChange={(value) => update({ vape_pattern: value })} /></QuestionBlock>}
            {answers.product_types.includes('pouches') && <QuestionBlock title={ar ? 'كم مرة تستخدم أكياس النيكوتين يوميًا؟' : 'How often do you use nicotine pouches each day?'}><SinglePick options={POUCH_FREQ} value={answers.nicotine_pouch_frequency} lang={lang} onChange={(value) => update({ nicotine_pouch_frequency: value })} /></QuestionBlock>}
            {!relapseOnly && !answers.product_types.some((p) => ['cigarettes', 'shisha', 'vape', 'pouches'].includes(p)) ? <div className="qe-note success">{ar ? 'لا توجد أسئلة كمية إضافية لهذا المنتج في النسخة الحالية. سنعتمد على نمط الاستخدام والمحفزات.' : 'There are no additional quantity questions for this product in the current version. Aqla will use your pattern and triggers.'}</div> : null}
          </div>}

          {step === 3 && <>
            <h2>{ar ? 'متى تكون الرغبة أو احتمالية الرجوع أقوى؟' : 'When are cravings or relapse risk strongest?'}</h2>
            <p>{ar ? 'اختر كل ما ينطبق. هذا الجزء يبني خطط المحفزات.' : 'Select everything that applies. Aqla uses this to build trigger-specific actions.'}</p>
            <MultiPick options={TRIGGER_OPTIONS} values={answers.triggers} lang={lang} onToggle={toggleTrigger} />
          </>}

          {step === 4 && <div className="qe-stack">
            <h2>{ar ? 'أين أنت الآن من قرار التغيير؟' : 'Where are you right now in your decision to change?'}</h2>
            <RangeQuestion lang={lang} label={ar ? 'ما مدى أهمية الإقلاع أو التغيير بالنسبة لك الآن؟' : 'How important is quitting or changing your nicotine use to you now?'} value={answers.importance_score} onChange={(value) => update({ importance_score: value })} />
            <RangeQuestion lang={lang} label={ar ? 'ما مدى ثقتك أنك تستطيع البدء بخطوة عملية؟' : 'How confident are you that you can begin one practical step?'} value={answers.confidence_score} onChange={(value) => update({ confidence_score: value })} />
            <RangeQuestion lang={lang} label={ar ? 'ما مدى استعدادك لتحديد خطوة واضحة خلال 14 يومًا؟' : 'How ready are you to set a clear action within the next 14 days?'} value={answers.readiness_score} onChange={(value) => update({ readiness_score: value })} />
          </div>}

          {step === 5 && <div className="qe-stack">
            <QuestionBlock title={ar ? 'هل حاولت الإقلاع من قبل؟' : 'Have you tried to quit before?'}><SinglePick options={PREV_ATTEMPTS} value={answers.previous_quit_attempts} lang={lang} onChange={(value) => update({ previous_quit_attempts: value, longest_abstinence: value })} /></QuestionBlock>
            {answers.previous_quit_attempts && answers.previous_quit_attempts !== 'none' ? <QuestionBlock title={ar ? 'ما الذي أعادك غالبًا؟' : 'What most often brought you back?'}><MultiPick options={RELAPSE_CAUSES} values={answers.relapse_causes} lang={lang} onToggle={toggleRelapseCause} /></QuestionBlock> : null}
            <div className="qe-note success">{ar ? 'المحاولة السابقة ليست فشلًا. هي معلومات تساعد أقلع على ألا يكرر نفس الخطة.' : 'A previous attempt is not a failure. It gives Aqla information so the next plan does not simply repeat the same approach.'}</div>
          </div>}

          {step === 6 && <>
            <h2>{ar ? 'فحص السلامة' : 'Safety check'}</h2>
            <p>{ar ? 'اختر كل ما ينطبق. هذه المعلومات تستخدم لتحديد متى يجب أن يكون الدعم المهني جزءًا من الخطة.' : 'Select everything that applies. Aqla uses this to decide when professional support should be part of the plan.'}</p>
            <MultiPick options={SAFETY_OPTIONS} values={answers.safety_flags} lang={lang} onToggle={toggleSafety} />
            {answers.safety_flags.includes('suicidal_ideation') ? <div className="qe-note danger"><strong>{ar ? 'سلامتك أولًا.' : 'Your safety comes first.'}</strong> {ar ? 'إذا كنت تشعر أنك قد تؤذي نفسك أو أنك في خطر، اطلب مساعدة طبية عاجلة الآن أو تواصل فورًا مع شخص موثوق قريب منك. خطة الإقلاع يمكن أن تنتظر حتى تكون بأمان.' : 'If you feel you may harm yourself or are in danger, seek urgent medical help now or immediately contact a trusted person near you. The quit plan can wait until you are safe.'}</div> : null}
          </>}

          {step === 7 && <div className="qe-stack">
            <QuestionBlock title={ar ? 'ما أهم أسبابك للتغيير؟ اختر حتى 3.' : 'What are your strongest reasons for change? Choose up to 3.'}><MultiPick options={PERSONAL_REASONS} values={answers.personal_reasons} lang={lang} onToggle={toggleReason} /></QuestionBlock>
            <div className="qe-input-grid">
              <label><span>{ar ? 'الاسم الذي تريد أن تخاطبك به أقلع (اختياري)' : 'Name you want Aqla to use (optional)'}</span><input maxLength={120} value={answers.user_name ?? ''} onChange={(event) => update({ user_name: event.target.value })} placeholder={ar ? 'مثال: أبو خالد' : 'Example: Khalid'} /></label>
              <label><span>{ar ? 'شخص دعم واحد (اختياري)' : 'One support person (optional)'}</span><input maxLength={120} value={answers.support_person_name ?? ''} onChange={(event) => update({ support_person_name: event.target.value })} placeholder={ar ? 'اسم صديق أو قريب' : 'Friend or family member'} /></label>
            </div>
            <div className="qe-note success">{ar ? 'أقلع يحسب النتيجة وقواعد السلامة داخل النظام. OpenAI يُستخدم فقط لتخصيص لغة الدعم ولا يقرر التشخيص أو الجرعات.' : 'Aqla calculates the result and safety rules inside the application. OpenAI is used only to personalise supportive wording; it does not decide diagnoses or medication doses.'}</div>
          </div>}
        </section>

        {showRequired ? <div className="qe-validation">{t.required}</div> : null}
        {error ? <div className="qe-validation danger">{error}</div> : null}

        <div className="qe-nav-buttons">
          <button type="button" className="qe-button secondary" disabled={step === 0 || submitting} onClick={() => { setShowRequired(false); setStep((value) => Math.max(0, value - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>{t.previous}</button>
          {step < 7 ? <button type="button" className="qe-button primary" disabled={submitting} onClick={goNext}>{t.next}</button> : <button type="button" className="qe-button primary" disabled={submitting} onClick={() => void submit()}>{submitting ? t.submitting : signedIn ? t.submit : t.loginSubmit}</button>}
        </div>
        {!signedIn && step === 7 ? <p className="qe-login-note">{t.savedDraft}</p> : null}
      </div>
    </main>
  )
}

function QuestionBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="qe-question-block"><h3>{title}</h3>{children}</div>
}
