'use client'

import { useEffect, useMemo, useState } from 'react'
import AdaptiveProductAssessment, { adaptiveProductQuestionsComplete } from '@/components/AdaptiveProductAssessment'
import type { AdaptiveAssessmentAnswers } from '@/lib/adaptive-assessment'
import {
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
} from '@/lib/quit-engine/questions'
import type { EngineAnswers, FirstUseAfterWaking, ProductType, SafetyFlag, StoredQuitPlan, TriggerKey } from '@/lib/quit-engine/types'
import {
  ADDITIONAL_MOTIVATION_OPTIONS,
  ADDITIONAL_TRIGGER_OPTIONS,
  PREVIOUS_SUPPORT_OPTIONS,
  SUPPORT_CHANNEL_OPTIONS,
  SUPPORT_KNOWLEDGE_OPTIONS,
  TREATMENT_INTEREST_OPTIONS,
  type AdditionalMotivation,
  type AdditionalTrigger,
  type ChangeGoalType,
  type CigaretteForm,
  type CigaretteQuantityPeriod,
  type PersonalPlanV2Answers,
  type PreviousQuitSupportMethod,
  type QuitDateChoice,
  type SpendPeriod,
  type SupportChannel,
  type SupportKnowledge,
  type TreatmentInterest,
} from '@/lib/personal-plan-v2'

const LOGO_URL = '/aqla-logo.png'
const DRAFT_KEY = 'aqla_adaptive_plan_v3_draft'
const ASSESSMENT_PATH = '/aqla/assessment'
const LOGIN_URL = `/auth/login?returnTo=${encodeURIComponent(ASSESSMENT_PATH)}`
const REFRESH_URL = `/auth/refresh?returnTo=${encodeURIComponent(ASSESSMENT_PATH)}`

type Lang = 'ar' | 'en'
type Draft = { answers: EngineAnswers; v2: PersonalPlanV2Answers; adaptive: AdaptiveAssessmentAnswers }

const EMPTY_ANSWERS: EngineAnswers = {
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

const EMPTY_V2: PersonalPlanV2Answers = {
  previous_quit_support_methods: [],
  cessation_support_knowledge: 'little',
  treatment_info_interests: [],
  preferred_support_channels: [],
  additional_triggers: [],
  additional_motivations: [],
  change_goal_type: 'explore',
  quit_date_choice: 'not_ready',
  plan_email_opt_in: false,
  followup_email_opt_in: false,
}

const EMPTY_ADAPTIVE: AdaptiveAssessmentAnswers = { schema_version: 1 }

const stages = {
  ar: ['المنتج', 'النمط الذكي', 'المحفزات', 'الاستعداد', 'المحاولات السابقة', 'السلامة', 'الدعم والعلاج', 'الهدف والمتابعة'],
  en: ['Product', 'Smart pattern', 'Triggers', 'Readiness', 'Past attempts', 'Safety', 'Support and treatment', 'Goal and follow-up'],
}

function Chip({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return <button type="button" className={`qe-chip ${active ? 'active' : ''}`} onClick={onClick}>{children}</button>
}
function SinglePick<T extends string>({ options, value, lang, onChange }: { options: readonly { value: T; ar: string; en: string }[]; value?: string; lang: Lang; onChange: (value: T) => void }) {
  return <div className="qe-option-grid">{options.map((option) => <Chip key={option.value} active={value === option.value} onClick={() => onChange(option.value)}>{option[lang]}</Chip>)}</div>
}
function MultiPick<T extends string>({ options, values, lang, onToggle }: { options: readonly { value: T; ar: string; en: string }[]; values: string[]; lang: Lang; onToggle: (value: T) => void }) {
  return <div className="qe-option-grid">{options.map((option) => <Chip key={option.value} active={values.includes(option.value)} onClick={() => onToggle(option.value)}>{option[lang]}</Chip>)}</div>
}
function Question({ title, children }: { title: string; children: React.ReactNode }) { return <div className="qe-question-block"><h3>{title}</h3>{children}</div> }
function RangeQuestion({ title, value, lang, onChange }: { title: string; value: number; lang: Lang; onChange: (value: number) => void }) {
  return <div className="qe-range-card"><div className="qe-range-label"><strong>{title}</strong><span>{value}/10</span></div><input aria-label={title} type="range" min="0" max="10" step="1" value={value} onChange={(event) => onChange(Number(event.target.value))} /><div className="qe-range-ends"><span>{lang === 'ar' ? 'منخفض' : 'Low'}</span><span>{lang === 'ar' ? 'مرتفع' : 'High'}</span></div></div>
}

const cigaretteForms = [
  { value: 'manufactured', ar: 'سجائر جاهزة', en: 'Manufactured cigarettes' },
  { value: 'roll_your_own', ar: 'لف يدوي', en: 'Roll-your-own' },
  { value: 'both', ar: 'كلاهما', en: 'Both' },
  { value: 'other', ar: 'نوع آخر', en: 'Other' },
] as const
const quantityPeriods = [{ value: 'day', ar: 'في اليوم', en: 'per day' }, { value: 'week', ar: 'في الأسبوع', en: 'per week' }] as const
const spendPeriods = [{ value: 'day', ar: 'يوميًا', en: 'per day' }, { value: 'week', ar: 'أسبوعيًا', en: 'per week' }, { value: 'month', ar: 'شهريًا', en: 'per month' }] as const
const goalOptions = [
  { value: 'quit', ar: 'الإقلاع الكامل', en: 'Quit completely' },
  { value: 'reduce', ar: 'تقليل الاستخدام أولًا', en: 'Reduce first' },
  { value: 'explore', ar: 'أفهم خطوتي التالية أولًا', en: 'Explore my next step first' },
] as const
const dateOptions = [
  { value: 'today', ar: 'اليوم', en: 'Today' },
  { value: 'within_7', ar: 'خلال 7 أيام', en: 'Within 7 days' },
  { value: 'specific', ar: 'تاريخ محدد', en: 'Specific date' },
  { value: 'not_ready', ar: 'لم أحدد تاريخًا', en: 'No date chosen yet' },
] as const

export default function QuitEngineAssessmentV3({ signedIn }: { signedIn: boolean }) {
  const [lang, setLang] = useState<Lang>('ar')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<EngineAnswers>(EMPTY_ANSWERS)
  const [v2, setV2] = useState<PersonalPlanV2Answers>(EMPTY_V2)
  const [adaptive, setAdaptive] = useState<AdaptiveAssessmentAnswers>(EMPTY_ADAPTIVE)
  const [showRequired, setShowRequired] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const ar = lang === 'ar'
  const relapseOnly = answers.product_types.length === 1 && answers.product_types[0] === 'relapse_prevention'

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY)
      if (raw) {
        const draft = JSON.parse(raw) as Draft
        setAnswers({ ...EMPTY_ANSWERS, ...draft.answers })
        setV2({ ...EMPTY_V2, ...draft.v2 })
        setAdaptive({ ...EMPTY_ADAPTIVE, ...draft.adaptive })
      }
    } catch { /* ignore invalid draft */ }
  }, [])
  useEffect(() => {
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ answers, v2, adaptive } satisfies Draft)) } catch { /* no-op */ }
  }, [adaptive, answers, v2])

  const update = (patch: Partial<EngineAnswers>) => setAnswers((previous) => ({ ...previous, ...patch }))
  const updateV2 = (patch: Partial<PersonalPlanV2Answers>) => setV2((previous) => ({ ...previous, ...patch }))
  const toggle = <T extends string>(values: T[], value: T) => values.includes(value) ? values.filter((item) => item !== value) : [...values, value]

  const toggleProduct = (value: ProductType) => {
    if (value === 'relapse_prevention') {
      update({ product_types: answers.product_types.includes(value) ? [] : ['relapse_prevention'], primary_product: 'relapse_prevention', mixed_use: false, relapse_prevention_mode: true, first_use_after_waking: 'not_daily' })
      updateV2({ change_goal_type: 'maintain_abstinence', quit_date_choice: 'not_ready' })
      setAdaptive(EMPTY_ADAPTIVE)
      return
    }
    const current = answers.product_types.filter((item) => item !== 'relapse_prevention')
    const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    update({ product_types: next, primary_product: next[0], mixed_use: next.length > 1, relapse_prevention_mode: false, first_use_after_waking: answers.first_use_after_waking === 'not_daily' ? undefined : answers.first_use_after_waking })
    if (adaptive.dominant_product && !next.includes(adaptive.dominant_product)) setAdaptive((previous) => ({ ...previous, dominant_product: undefined }))
    if (v2.change_goal_type === 'maintain_abstinence') updateV2({ change_goal_type: 'explore' })
  }

  const toggleReason = (value: string) => {
    if (answers.personal_reasons.includes(value)) update({ personal_reasons: answers.personal_reasons.filter((item) => item !== value) })
    else if (answers.personal_reasons.length < 3) update({ personal_reasons: [...answers.personal_reasons, value] })
  }
  const toggleSafety = (value: SafetyFlag) => {
    if (value === 'none') { update({ safety_flags: answers.safety_flags.includes('none') ? [] : ['none'] }); return }
    update({ safety_flags: toggle(answers.safety_flags.filter((item) => item !== 'none'), value) })
  }

  const canNext = useMemo(() => {
    if (step === 0) return answers.product_types.length > 0
    if (step === 1) {
      if (relapseOnly) return true
      if (!answers.first_use_after_waking) return false
      if (answers.product_types.includes('cigarettes') && (!v2.cigarette_quantity || !v2.cigarette_quantity_period)) return false
      if (answers.product_types.includes('shisha') && (!answers.shisha_sessions_per_week || !answers.shisha_session_duration)) return false
      if (answers.product_types.includes('vape') && !answers.vape_pattern) return false
      if (answers.product_types.includes('pouches') && !answers.nicotine_pouch_frequency) return false
      return adaptiveProductQuestionsComplete(answers, adaptive)
    }
    if (step === 2) return answers.triggers.length > 0
    if (step === 3) return true
    if (step === 4) return Boolean(answers.previous_quit_attempts)
    if (step === 5) return answers.safety_flags.length > 0
    if (step === 6) return v2.treatment_info_interests.length > 0 && v2.preferred_support_channels.length > 0
    if (step === 7) {
      if (!answers.personal_reasons.length) return false
      if (!relapseOnly && v2.change_goal_type === 'reduce' && !v2.reduction_target_percent) return false
      if (!relapseOnly && v2.change_goal_type !== 'explore' && v2.quit_date_choice === 'specific' && !v2.target_quit_date) return false
      return true
    }
    return true
  }, [adaptive, answers, relapseOnly, step, v2])

  function next() {
    if (!canNext) { setShowRequired(true); return }
    setShowRequired(false)
    setStep((value) => Math.min(7, value + 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function submit() {
    if (!canNext || submitting) { setShowRequired(true); return }
    if (!signedIn) { window.location.href = LOGIN_URL; return }
    setSubmitting(true)
    setError('')
    try {
      const response = await fetch('/api/quit-engine/plan-v3', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ lang, answers, personal_plan_v2: v2, adaptive_assessment: adaptive }),
      })
      if (response.status === 401) { window.location.href = REFRESH_URL; return }
      if (!response.ok) throw new Error(`plan_v3_${response.status}`)
      const { plan } = await response.json() as { plan: StoredQuitPlan }
      sessionStorage.setItem(`aqla_quit_plan:${plan.plan_id}`, JSON.stringify(plan))
      sessionStorage.removeItem(DRAFT_KEY)
      window.location.href = `/aqla/plan/${plan.plan_id}?lang=${lang}`
    } catch (cause) {
      console.error(cause)
      setError(ar ? 'تعذر إنشاء الخطة الذكية الآن. راجع الإجابات وحاول مرة أخرى.' : 'We could not build the adaptive plan. Check your answers and try again.')
    } finally { setSubmitting(false) }
  }

  const progress = ((step + 1) / 8) * 100
  return <main className="qe-page" dir={ar ? 'rtl' : 'ltr'} lang={lang}>
    <header className="qe-topbar"><a href="/aqla" className="qe-brand"><img src={LOGO_URL} alt="Aqla — أقلع" /><span>{ar ? 'العودة لأقلع' : 'Back to Aqla'}</span></a><div style={{ display: 'flex', gap: 8 }}><button type="button" className="qe-lang" onClick={() => setLang(ar ? 'en' : 'ar')}>{ar ? 'EN' : 'ع'}</button>{!signedIn ? <a className="qe-lang" style={{ width: 'auto', paddingInline: 14 }} href={LOGIN_URL}>{ar ? 'تسجيل الدخول' : 'Sign in'}</a> : null}</div></header>
    <div className="qe-shell">
      <section className="qe-intro"><span className="qe-kicker">{ar ? 'أقلع — التقييم التكيفي الذكي' : 'Aqla — adaptive intelligent assessment'}</span><h1>{ar ? 'خطة تفهم نوع النيكوتين الذي تستخدمه' : 'A plan that understands the nicotine products you use'}</h1><p>{ar ? 'يبقى المسار 8 خطوات، لكن الأسئلة داخلها تتغير حسب السجائر أو الفيب أو أكياس النيكوتين أو الاستخدام المختلط.' : 'The journey stays at eight stages, while questions branch for cigarettes, vaping, nicotine pouches and mixed use.'}</p></section>
      <div className="qe-progress-meta"><span>{ar ? 'الخطوة' : 'Step'} {step + 1} {ar ? 'من' : 'of'} 8</span><strong>{stages[lang][step]}</strong></div><div className="qe-progress"><span style={{ width: `${progress}%` }} /></div>
      <section className="qe-card">
        {step === 0 && <><h2>{ar ? 'ما الذي تستخدمه حاليًا؟' : 'What do you currently use?'}</h2><p>{ar ? 'اختر كل ما ينطبق. سيبني أقلع الأسئلة التالية بناءً على اختيارك.' : 'Select everything that applies. Aqla will build the next questions around your selection.'}</p><MultiPick options={PRODUCT_OPTIONS} values={answers.product_types} lang={lang} onToggle={toggleProduct} /></>}

        {step === 1 && <div className="qe-stack"><h2>{ar ? 'نمط الاستخدام الخاص بك' : 'Your product-specific pattern'}</h2>{!relapseOnly ? <Question title={ar ? 'بعد الاستيقاظ، متى تستخدم أول نيكوتين؟' : 'After waking, when do you first use nicotine?'}><SinglePick options={FIRST_USE_OPTIONS} value={answers.first_use_after_waking} lang={lang} onChange={(value: FirstUseAfterWaking) => update({ first_use_after_waking: value })} /></Question> : <div className="qe-note success">{ar ? 'أنت في مسار الحفاظ على الامتناع؛ لا نحتاج أسئلة كمية الآن.' : 'You are on the abstinence-maintenance pathway; quantity questions are not needed.'}</div>}
          {answers.product_types.includes('cigarettes') ? <><Question title={ar ? 'ما نوع السجائر؟' : 'What type of cigarettes?'}><SinglePick options={cigaretteForms} value={v2.cigarette_form} lang={lang} onChange={(value: CigaretteForm) => updateV2({ cigarette_form: value })} /></Question><Question title={ar ? 'كم سيجارة تستخدم في المتوسط؟' : 'How many cigarettes do you use on average?'}><div className="qe-input-grid"><label><span>{ar ? 'العدد' : 'Number'}</span><input type="number" min="0.1" max="500" step="1" value={v2.cigarette_quantity ?? ''} onChange={(event) => updateV2({ cigarette_quantity: event.target.value ? Number(event.target.value) : undefined })} /></label><label><span>{ar ? 'الفترة' : 'Period'}</span><select value={v2.cigarette_quantity_period ?? ''} onChange={(event) => updateV2({ cigarette_quantity_period: (event.target.value || undefined) as CigaretteQuantityPeriod | undefined })}><option value="">—</option>{quantityPeriods.map((item) => <option key={item.value} value={item.value}>{item[lang]}</option>)}</select></label></div></Question></> : null}
          {answers.product_types.includes('shisha') ? <><Question title={ar ? 'كم جلسة شيشة في الأسبوع؟' : 'How many shisha sessions per week?'}><SinglePick options={SHISHA_SESSIONS} value={answers.shisha_sessions_per_week} lang={lang} onChange={(value) => update({ shisha_sessions_per_week: value })} /></Question><Question title={ar ? 'كم تستمر الجلسة؟' : 'How long is a usual session?'}><SinglePick options={SHISHA_DURATION} value={answers.shisha_session_duration} lang={lang} onChange={(value) => update({ shisha_session_duration: value })} /></Question></> : null}
          {answers.product_types.includes('vape') ? <Question title={ar ? 'كيف تصف نمط استخدام الفيب عمومًا؟' : 'How would you describe your overall vaping pattern?'}><SinglePick options={VAPE_PATTERNS} value={answers.vape_pattern} lang={lang} onChange={(value) => update({ vape_pattern: value })} /></Question> : null}
          {answers.product_types.includes('pouches') ? <Question title={ar ? 'كيف تصف تكرار استخدام أكياس النيكوتين؟' : 'How would you describe your pouch-use frequency?'}><SinglePick options={POUCH_FREQ} value={answers.nicotine_pouch_frequency} lang={lang} onChange={(value) => update({ nicotine_pouch_frequency: value })} /></Question> : null}
          {!relapseOnly ? <AdaptiveProductAssessment lang={lang} base={answers} value={adaptive} onChange={setAdaptive} /> : null}
          {!relapseOnly ? <Question title={ar ? 'اختياري: كم تنفق على جميع منتجات النيكوتين؟' : 'Optional: how much do you spend on all nicotine products?'}><div className="qe-input-grid"><label><span>{ar ? 'المبلغ بالريال' : 'Amount in SAR'}</span><input type="number" min="0" max="100000" step="0.01" value={v2.nicotine_spend_amount ?? ''} onChange={(event) => updateV2({ nicotine_spend_amount: event.target.value ? Number(event.target.value) : undefined })} /></label><label><span>{ar ? 'الفترة' : 'Period'}</span><select value={v2.nicotine_spend_period ?? ''} onChange={(event) => updateV2({ nicotine_spend_period: (event.target.value || undefined) as SpendPeriod | undefined })}><option value="">—</option>{spendPeriods.map((item) => <option key={item.value} value={item.value}>{item[lang]}</option>)}</select></label></div></Question> : null}
        </div>}

        {step === 2 && <div className="qe-stack"><h2>{ar ? 'المحفزات والروتين' : 'Triggers and routines'}</h2><Question title={ar ? 'اختر المحفزات التي تنطبق عليك' : 'Select triggers that apply to you'}><MultiPick options={TRIGGER_OPTIONS} values={answers.triggers} lang={lang} onToggle={(value: TriggerKey) => update({ triggers: toggle(answers.triggers, value) })} /></Question><Question title={ar ? 'هل يوجد شيء إضافي؟' : 'Anything else?'}><MultiPick options={ADDITIONAL_TRIGGER_OPTIONS} values={v2.additional_triggers} lang={lang} onToggle={(value: AdditionalTrigger) => updateV2({ additional_triggers: toggle(v2.additional_triggers, value) })} /></Question>{v2.additional_triggers.includes('other') ? <label><span>{ar ? 'المحفز الآخر' : 'Other trigger'}</span><input maxLength={160} value={v2.other_trigger_text ?? ''} onChange={(event) => updateV2({ other_trigger_text: event.target.value })} /></label> : null}</div>}

        {step === 3 && <div className="qe-stack"><h2>{ar ? 'الاستعداد والثقة' : 'Readiness and confidence'}</h2><RangeQuestion lang={lang} title={ar ? 'ما مدى أهمية التغيير بالنسبة لك؟' : 'How important is change to you?'} value={answers.importance_score} onChange={(value) => update({ importance_score: value })} /><RangeQuestion lang={lang} title={ar ? 'ما مدى ثقتك أنك تستطيع البدء؟' : 'How confident are you that you can start?'} value={answers.confidence_score} onChange={(value) => update({ confidence_score: value })} /><RangeQuestion lang={lang} title={ar ? 'ما مدى استعدادك لخطوة واضحة خلال 14 يومًا؟' : 'How ready are you for a clear action within 14 days?'} value={answers.readiness_score} onChange={(value) => update({ readiness_score: value })} /></div>}

        {step === 4 && <div className="qe-stack"><Question title={ar ? 'هل حاولت الإقلاع من قبل؟' : 'Have you tried to quit before?'}><SinglePick options={PREV_ATTEMPTS} value={answers.previous_quit_attempts} lang={lang} onChange={(value) => update({ previous_quit_attempts: value, longest_abstinence: value })} /></Question>{answers.previous_quit_attempts && answers.previous_quit_attempts !== 'none' ? <><Question title={ar ? 'ماذا استخدمت في المحاولات السابقة؟' : 'What did you use in previous attempts?'}><MultiPick options={PREVIOUS_SUPPORT_OPTIONS} values={v2.previous_quit_support_methods} lang={lang} onToggle={(value: PreviousQuitSupportMethod) => updateV2({ previous_quit_support_methods: toggle(v2.previous_quit_support_methods, value) })} /></Question><Question title={ar ? 'ما الذي أعادك غالبًا؟' : 'What most often brought you back?'}><MultiPick options={RELAPSE_CAUSES} values={answers.relapse_causes} lang={lang} onToggle={(value) => update({ relapse_causes: toggle(answers.relapse_causes, value) })} /></Question></> : null}<div className="qe-note success">{ar ? 'المحاولة السابقة بيانات تساعد أقلع على تحسين الخطة، وليست فشلًا.' : 'A previous attempt gives Aqla useful data for improving the plan; it is not a failure.'}</div></div>}

        {step === 5 && <><h2>{ar ? 'فحص السلامة' : 'Safety check'}</h2><p>{ar ? 'قواعد السلامة ثابتة وتسبق الذكاء الاصطناعي والتخصيص.' : 'Deterministic safety rules always take priority over AI and personalisation.'}</p><MultiPick options={SAFETY_OPTIONS} values={answers.safety_flags} lang={lang} onToggle={toggleSafety} />{answers.safety_flags.includes('suicidal_ideation') ? <div className="qe-note danger"><strong>{ar ? 'سلامتك أولًا.' : 'Safety first.'}</strong> {ar ? 'إذا كنت في خطر أو قد تؤذي نفسك، اطلب مساعدة طبية عاجلة الآن أو تواصل فورًا مع شخص موثوق قريب منك.' : 'If you are in danger or may harm yourself, seek urgent medical help now or contact a trusted person near you immediately.'}</div> : null}</>}

        {step === 6 && <div className="qe-stack"><h2>{ar ? 'الدعم والعلاج الذي يناسبك' : 'Support and treatment that fit you'}</h2><Question title={ar ? 'ما مدى معرفتك بخيارات الإقلاع؟' : 'How familiar are you with cessation options?'}><SinglePick options={SUPPORT_KNOWLEDGE_OPTIONS} value={v2.cessation_support_knowledge} lang={lang} onChange={(value: SupportKnowledge) => updateV2({ cessation_support_knowledge: value })} /></Question><Question title={ar ? 'ماذا تريد أن تعرف عنه أكثر؟' : 'What would you like to learn more about?'}><MultiPick options={TREATMENT_INTEREST_OPTIONS} values={v2.treatment_info_interests} lang={lang} onToggle={(value: TreatmentInterest) => updateV2({ treatment_info_interests: toggle(v2.treatment_info_interests, value) })} /></Question><Question title={ar ? 'ما نوع الدعم الذي ترتاح له؟' : 'What support would you be comfortable using?'}><MultiPick options={SUPPORT_CHANNEL_OPTIONS} values={v2.preferred_support_channels} lang={lang} onToggle={(value: SupportChannel) => updateV2({ preferred_support_channels: toggle(v2.preferred_support_channels, value) })} /></Question><div className="qe-note">{ar ? 'هذه الخيارات لتخصيص التثقيف والدعم، وليست وصفًا لدواء أو جرعة.' : 'These choices tailor education and support; they do not prescribe a medicine or dose.'}</div></div>}

        {step === 7 && <div className="qe-stack"><h2>{ar ? 'هدفك والمتابعة الذكية' : 'Your goal and smart follow-up'}</h2><Question title={ar ? 'ما أهم أسبابك؟ اختر حتى 3.' : 'What are your strongest reasons? Choose up to 3.'}><MultiPick options={PERSONAL_REASONS} values={answers.personal_reasons} lang={lang} onToggle={toggleReason} /></Question><Question title={ar ? 'أسباب إضافية' : 'Additional reasons'}><MultiPick options={ADDITIONAL_MOTIVATION_OPTIONS} values={v2.additional_motivations} lang={lang} onToggle={(value: AdditionalMotivation) => updateV2({ additional_motivations: toggle(v2.additional_motivations, value) })} /></Question>{v2.additional_motivations.includes('other') ? <label><span>{ar ? 'سبب آخر' : 'Another reason'}</span><input maxLength={160} value={v2.other_motivation_text ?? ''} onChange={(event) => updateV2({ other_motivation_text: event.target.value })} /></label> : null}
          {!relapseOnly ? <><Question title={ar ? 'ما هدفك الآن؟' : 'What is your goal now?'}><SinglePick options={goalOptions} value={v2.change_goal_type} lang={lang} onChange={(value: ChangeGoalType) => updateV2({ change_goal_type: value, quit_date_choice: value === 'explore' ? 'not_ready' : v2.quit_date_choice })} /></Question>{v2.change_goal_type === 'reduce' ? <Question title={ar ? 'ما مقدار التقليل الذي تريد البدء به؟' : 'What reduction target would you like to start with?'}><div className="qe-option-grid">{([25, 50, 75] as const).map((value) => <Chip key={value} active={v2.reduction_target_percent === value} onClick={() => updateV2({ reduction_target_percent: value })}>{value}%</Chip>)}</div></Question> : null}{v2.change_goal_type !== 'explore' ? <Question title={ar ? 'متى تريد بدء الإقلاع أو التغيير؟' : 'When would you like to start quitting or changing?'}><SinglePick options={dateOptions} value={v2.quit_date_choice} lang={lang} onChange={(value: QuitDateChoice) => updateV2({ quit_date_choice: value, target_quit_date: value === 'specific' ? v2.target_quit_date : undefined })} /></Question> : null}{v2.quit_date_choice === 'specific' ? <label><span>{ar ? 'التاريخ' : 'Date'}</span><input type="date" value={v2.target_quit_date ?? ''} onChange={(event) => updateV2({ target_quit_date: event.target.value || undefined })} /></label> : null}</> : null}
          <div className="qe-input-grid"><label><span>{ar ? 'الاسم الذي تريد أن يخاطبك به أقلع (اختياري)' : 'Preferred name for Aqla to use (optional)'}</span><input maxLength={120} value={answers.user_name ?? ''} onChange={(event) => update({ user_name: event.target.value })} /></label><label><span>{ar ? 'شخص دعم واحد (اختياري)' : 'One support person (optional)'}</span><input maxLength={120} value={answers.support_person_name ?? ''} onChange={(event) => update({ support_person_name: event.target.value })} /></label><label><span>{ar ? 'صلة شخص الدعم (اختياري)' : 'Support-person relationship (optional)'}</span><input maxLength={80} value={v2.support_person_relationship ?? ''} onChange={(event) => updateV2({ support_person_relationship: event.target.value })} /></label></div>
          <div className="qe-question-block"><h3>{ar ? 'البريد والمتابعة' : 'Email and follow-up'}</h3><label style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}><input type="checkbox" checked={v2.plan_email_opt_in} onChange={(event) => updateV2({ plan_email_opt_in: event.target.checked })} /><span>{ar ? 'أرسل لي رابط خطتي عبر البريد الإلكتروني.' : 'Email me a link to my saved plan.'}</span></label><label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 12 }}><input type="checkbox" checked={v2.followup_email_opt_in} onChange={(event) => updateV2({ followup_email_opt_in: event.target.checked })} /><span>{ar ? 'أوافق على رسائل المتابعة الداعمة عبر البريد. كل رسالة تقود إلى متابعة آمنة داخل حسابي ويمكنني إيقافها لاحقًا.' : 'I opt in to supportive follow-up emails. Each email links to a secure check-in inside my account and I can stop them later.'}</span></label></div>
          <div className="qe-note success">{ar ? 'سيستخدم أقلع ملف التقييم لتحديد محور المتابعة داخل حسابك. لن نضع تفاصيل صحية حساسة في نص البريد نفسه.' : 'Aqla will use your assessment profile to focus the secure check-in. Sensitive health details will not be placed in the email itself.'}</div>
        </div>}

        {showRequired && !canNext ? <div className="qe-note danger">{ar ? 'أكمل الأسئلة المطلوبة في هذه الخطوة قبل المتابعة.' : 'Complete the required questions in this stage before continuing.'}</div> : null}
        {error ? <div className="qe-note danger">{error}</div> : null}
        <div className="qe-actions">{step > 0 ? <button type="button" className="qe-button secondary" onClick={() => { setShowRequired(false); setStep((value) => Math.max(0, value - 1)) }}>{ar ? 'السابق' : 'Previous'}</button> : <span />}{step < 7 ? <button type="button" className="qe-button primary" onClick={next}>{ar ? 'متابعة' : 'Continue'}</button> : <button type="button" className="qe-button primary" disabled={submitting} onClick={submit}>{submitting ? (ar ? 'جاري بناء خطتك…' : 'Building your plan…') : signedIn ? (ar ? 'أنشئ خطتي الذكية' : 'Build my adaptive plan') : (ar ? 'سجّل الدخول واحفظ خطتي' : 'Sign in and save my plan')}</button>}</div>
      </section>
    </div>
  </main>
}
