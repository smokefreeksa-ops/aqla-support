'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { AdaptiveAssessmentAnswers, AdaptiveTriageProfile } from '@/lib/adaptive-assessment'
import type { PersonalPlanV2Answers, PersonalPlanV2Enrichment } from '@/lib/personal-plan-v2'
import type { StoredQuitPlan } from '@/lib/quit-engine/types'

const LOGO_URL = '/aqla-logo.png'
type Lang = 'ar' | 'en'
type GuestPlan = StoredQuitPlan & {
  answers: StoredQuitPlan['answers'] & {
    personal_plan_v2?: PersonalPlanV2Answers
    adaptive_assessment?: AdaptiveAssessmentAnswers
  }
  result: StoredQuitPlan['result'] & {
    personal_plan_v2?: PersonalPlanV2Enrichment
    adaptive_triage?: AdaptiveTriageProfile
  }
}

const productLabel = {
  ar: { cigarettes: 'السجائر', shisha: 'الشيشة', vape: 'الفيب', heated_tobacco: 'التبغ المسخن', pouches: 'أكياس النيكوتين', smokeless: 'التبغ غير المدخن', relapse_prevention: 'منع الانتكاسة' },
  en: { cigarettes: 'Cigarettes', shisha: 'Shisha', vape: 'Vape', heated_tobacco: 'Heated tobacco', pouches: 'Nicotine pouches', smokeless: 'Smokeless tobacco', relapse_prevention: 'Relapse prevention' },
} as const

const levelLabel = {
  ar: { low: 'منخفض', moderate: 'متوسط', high: 'مرتفع', complex: 'معقد/متعدد', single: 'منتج واحد', mixed: 'استخدام مختلط', mixed_with_substitution: 'استخدام مختلط مع الاستبدال', standard: 'دعم اعتيادي', enhanced: 'دعم معزز', professional: 'دعم مهني', routine: 'مسار اعتيادي', professional_review: 'مراجعة مهنية', immediate_safety: 'سلامة فورية' },
  en: { low: 'Low', moderate: 'Moderate', high: 'High', complex: 'Complex/multiple', single: 'Single product', mixed: 'Mixed use', mixed_with_substitution: 'Mixed use with substitution', standard: 'Standard support', enhanced: 'Enhanced support', professional: 'Professional support', routine: 'Routine pathway', professional_review: 'Professional review', immediate_safety: 'Immediate safety' },
} as const

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="qp-card"><h2>{title}</h2>{children}</section>
}

function Money({ value }: { value: number }) {
  return <strong>{new Intl.NumberFormat('en-SA', { maximumFractionDigits: 2 }).format(value)} SAR</strong>
}

export default function GuestQuitPlanResult({ planId, initialLang }: { planId: string; initialLang: Lang }) {
  const [lang, setLang] = useState<Lang>(initialLang)
  const [plan, setPlan] = useState<GuestPlan | null>(null)
  const [loaded, setLoaded] = useState(false)
  const ar = lang === 'ar'

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`aqla_quit_plan:${planId}`)
      if (raw) setPlan(JSON.parse(raw) as GuestPlan)
    } catch { /* local-only guest plan unavailable */ }
    setLoaded(true)
  }, [planId])

  async function share() {
    if (!plan) return
    const text = plan.result.share_text
    const url = `${window.location.origin}/`
    try {
      if (navigator.share) await navigator.share({ title: ar ? 'بدأت مع أقلع' : 'I started with Aqla', text, url })
      else await navigator.clipboard.writeText(`${text}\n${url}`)
    } catch { /* sharing is optional */ }
  }

  if (!loaded) return <main className="qp-page" dir={ar ? 'rtl' : 'ltr'}><div className="qp-loading">{ar ? 'جاري تجهيز خطتك…' : 'Preparing your plan…'}</div></main>

  if (!plan) return <main className="qp-page" dir={ar ? 'rtl' : 'ltr'} lang={lang}><div className="qp-empty"><img src={LOGO_URL} alt="Aqla — أقلع" /><h1>{ar ? 'انتهت جلسة خطة الضيف' : 'This guest-plan session has ended'}</h1><p>{ar ? 'خطط الضيف لا تُحفظ على خوادم أقلع. ابدأ تقييمًا جديدًا، أو سجّل الدخول قبل إنشاء الخطة إذا أردت الحفظ والمتابعة.' : 'Guest plans are not stored on Aqla servers. Start a new assessment, or sign in before generating a plan if you want saving and follow-up.'}</p><div className="eng-actions"><Link className="eng-btn primary" href="/aqla/assessment">{ar ? 'ابدأ تقييمًا جديدًا' : 'Start a new assessment'}</Link><Link className="eng-btn" href="/auth/login?returnTo=%2Faqla%2Fassessment">{ar ? 'تسجيل الدخول' : 'Sign in'}</Link></div></div></main>

  const result = plan.result
  const extra = result.personal_plan_v2
  const triage = result.adaptive_triage
  const levels = levelLabel[lang]

  return <main className="qp-page" dir={ar ? 'rtl' : 'ltr'} lang={lang}>
    <header className="qp-topbar">
      <Link href="/" className="qp-brand"><img src={LOGO_URL} alt="Aqla — أقلع" /><span>{ar ? 'أقلع' : 'Aqla'}</span></Link>
      <div className="screen-only" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Link className="qe-lang" style={{ width: 'auto', paddingInline: 14 }} href="/auth/login?returnTo=%2Faqla%2Fassessment">{ar ? 'دخول / إنشاء حساب' : 'Sign in / Create account'}</Link>
        <button type="button" className="qe-lang" onClick={() => setLang(ar ? 'en' : 'ar')}>{ar ? 'EN' : 'ع'}</button>
      </div>
    </header>

    <div className="qp-shell">
      <div className="qp-sync-warning">
        {ar ? 'وضع الضيف: خطتك موجودة في جلسة هذا المتصفح فقط. لا تُحفظ في DynamoDB، ولا تُنشئ ملفًا شخصيًا أو رسائل متابعة. يمكنك استخدام الخطة الآن بالكامل دون تسجيل.' : 'Guest mode: this plan exists only in this browser session. It is not saved to DynamoDB and does not create a profile or follow-up emails. You can use the full plan now without registering.'}
      </div>

      {result.safety_immediate ? <section className="qp-safety"><strong>{ar ? 'سلامتك أولًا' : 'Safety first'}</strong><p>{result.safety_immediate}</p></section> : null}

      <section className="qp-hero-card">
        <span className="qp-kicker">{ar ? 'خطة أقلع السريعة — وضع الضيف' : 'Aqla quick plan — guest mode'}</span>
        <h1>{result.result_title}</h1>
        <p>{result.human_explanation}</p>
        {result.ai_personal_summary ? <div className="qp-ai-summary"><span>{ar ? 'رسالة أقلع لك' : 'Aqla message for you'}</span><p>{result.ai_personal_summary}</p></div> : null}
        {result.ai_micro_challenge ? <div className="qp-challenge"><span>{ar ? 'تحدي الـ 24 ساعة' : '24-hour challenge'}</span><strong>{result.ai_micro_challenge}</strong></div> : null}
      </section>

      {triage ? <Card title={ar ? 'ملف أقلع الذكي' : 'Your Aqla adaptive profile'}>
        <div className="qp-metrics">
          <div><small>{ar ? 'المنتج ذو الأولوية' : 'Priority product'}</small><strong>{productLabel[lang][triage.primary_product]}</strong></div>
          <div><small>{ar ? 'التعرض/الاعتماد العملي' : 'Exposure/dependence pattern'}</small><strong>{levels[triage.nicotine_exposure]}</strong></div>
          <div><small>{ar ? 'المحفزات السلوكية' : 'Behavioural pattern'}</small><strong>{levels[triage.behavioural_pattern]}</strong></div>
          <div><small>{ar ? 'تعقيد تعدد المنتجات' : 'Mixed-product complexity'}</small><strong>{levels[triage.mixed_product_complexity]}</strong></div>
          <div><small>{ar ? 'الثقة' : 'Confidence'}</small><strong>{levels[triage.confidence]}</strong></div>
          <div><small>{ar ? 'الحاجة للدعم' : 'Support need'}</small><strong>{levels[triage.support_need]}</strong></div>
        </div>
        <div className="qp-tags">{(ar ? triage.profile_labels_ar : triage.profile_labels_en).map((item) => <span key={item}>{item}</span>)}</div>
        {triage.product_measures.map((measure) => <div key={`${measure.product}-${measure.instrument}`} style={{ marginTop: 12 }}><strong>{measure.instrument}: {measure.score}</strong><p className="qp-muted">{measure.validated ? (ar ? `التصنيف: ${measure.category} — مؤشر خاص بالمنتج وليس تشخيصًا.` : `Category: ${measure.category} — product-specific indicator, not a diagnosis.`) : (ar ? `التصنيف: ${measure.category} — أداة أقلع مكيفة وغير معتمدة كمقياس سريري.` : `Category: ${measure.category} — adapted Aqla screen, not a validated clinical measure.`)}</p></div>)}
      </Card> : null}

      <Card title={ar ? 'أول خطوة خلال 24 ساعة' : 'Your first step in the next 24 hours'}><div className="qp-first-step">{result.first_24h_step}</div>{result.ai_first_24h_coaching ? <p>{result.ai_first_24h_coaching}</p> : null}</Card>

      <Card title={ar ? 'خطة الـ 72 ساعة' : 'Your 72-hour plan'}><ul>{result.seventy_two_hour_plan.map((item) => <li key={item}>{item}</li>)}</ul>{result.ai_seventy_two_hour_coaching?.length ? <ul>{result.ai_seventy_two_hour_coaching.map((item) => <li key={item}>{item}</li>)}</ul> : null}</Card>

      <Card title={ar ? 'خطة 7 أيام' : 'Your 7-day plan'}><ol>{result.seven_day_plan.map((item) => <li key={`${item.day}-${item.task}`}><strong>{ar ? `اليوم ${item.day}: ` : `Day ${item.day}: `}</strong>{item.task}</li>)}</ol></Card>

      {result.trigger_plans.length ? <Card title={ar ? 'خطط المحفزات' : 'Trigger plans'}>{result.trigger_plans.map((section) => <div key={section.title} style={{ marginBottom: 14 }}><strong>{section.title}</strong><ul>{section.steps.map((step) => <li key={step}>{step}</li>)}</ul></div>)}{result.ai_trigger_coaching?.length ? <ul>{result.ai_trigger_coaching.map((item) => <li key={item}>{item}</li>)}</ul> : null}</Card> : null}

      <Card title={ar ? 'بطاقة الرغبة' : 'Craving card'}><p>{result.craving_card}</p></Card>

      {result.referral_needed ? <Card title={ar ? 'متى تحتاج دعمًا مهنيًا' : 'When professional support is appropriate'}><p>{result.referral_message}</p></Card> : null}

      {extra ? <>
        <Card title={ar ? 'هدفك وتاريخ البداية' : 'Your goal and start date'}><p><strong>{extra.goal_label}</strong></p>{extra.quit_date_label ? <p>{ar ? 'تاريخ الإقلاع/التغيير: ' : 'Quit/change date: '}<strong>{extra.quit_date_label}</strong></p> : null}</Card>
        {extra.savings ? <Card title={ar ? 'التوفير المتوقع' : 'Estimated savings'}><div className="qp-metrics"><div><small>{ar ? 'أسبوع' : '1 week'}</small><Money value={extra.savings.weekly} /></div><div><small>{ar ? 'شهر' : '1 month'}</small><Money value={extra.savings.monthly} /></div><div><small>{ar ? '3 أشهر' : '3 months'}</small><Money value={extra.savings.three_months} /></div><div><small>{ar ? 'سنة' : '1 year'}</small><Money value={extra.savings.yearly} /></div></div></Card> : null}
        {extra.treatment_learning.length ? <Card title={ar ? 'المعلومات التي طلبت معرفتها' : 'Information you asked to learn about'}><ul>{extra.treatment_learning.map((item) => <li key={item}>{item}</li>)}</ul></Card> : null}
        {extra.support_network.length ? <Card title={ar ? 'الدعم الذي يناسبك' : 'Support options that fit you'}><ul>{extra.support_network.map((item) => <li key={item}>{item}</li>)}</ul></Card> : null}
      </> : null}

      <Card title={ar ? 'المتابعة كضيف' : 'Follow-up as a guest'}><p>{ar ? 'يمكنك استخدام نقاط المتابعة المقترحة بنفسك، لكن البريد الإلكتروني والمتابعة المحفوظة تحتاج حسابًا موثقًا.' : 'You can use the suggested check-in points yourself, but saved and email follow-up requires a verified account.'}</p><div className="qp-tags">{result.follow_up_schedule.map((item) => <span key={item.type}>{ar ? item.label_ar : item.label_en}</span>)}</div></Card>

      <div className="screen-only" style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', paddingBottom: 30 }}>
        <button type="button" className="qe-button primary" onClick={() => window.print()}>{ar ? 'طباعة / حفظ PDF' : 'Print / Save PDF'}</button>
        <button type="button" className="qe-button secondary" onClick={() => void share()}>{ar ? 'مشاركة التقدم' : 'Share progress'}</button>
        <Link className="qe-button secondary" href="/aqla/share">{ar ? 'أنشئ بطاقة إنجاز' : 'Create achievement card'}</Link>
        <Link className="qe-button secondary" href="/aqla/challenges">{ar ? 'الألعاب والتحديات' : 'Games & challenges'}</Link>
        <Link className="qe-button secondary" href="/aqla/assessment">{ar ? 'تقييم جديد' : 'New assessment'}</Link>
      </div>
    </div>
  </main>
}
