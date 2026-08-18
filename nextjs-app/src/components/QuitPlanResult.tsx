'use client'

import { useEffect, useMemo, useState } from 'react'
import type { StoredQuitPlan } from '@/lib/quit-engine/types'

const LOGO_URL = 'https://aqla1.com/aqla-logo.png'

type Lang = 'ar' | 'en'

const dependenceLabel = {
  ar: { low_ritual: 'ارتباط بالمواقف والروتين', moderate: 'دعم متوسط مطلوب', high: 'دعم أقوى مطلوب', complex_mixed: 'استخدام متعدد يحتاج ترتيب الأولويات' },
  en: { low_ritual: 'Situation/routine-linked pattern', moderate: 'Moderate support need', high: 'Higher support need', complex_mixed: 'Multiple-product pattern needing prioritisation' },
} as const

const readinessLabel = {
  ar: { ready_now: 'جاهز للبدء', wants_but_low_confidence: 'التغيير مهم لكن الثقة أو الاستعداد يحتاج دعمًا', low_importance_high_confidence: 'الثقة جيدة والسبب يحتاج وضوحًا', not_ready: 'غير جاهز لقرار كبير الآن' },
  en: { ready_now: 'Ready to begin', wants_but_low_confidence: 'Change matters, but confidence/readiness needs support', low_importance_high_confidence: 'Good confidence; motivation needs clarity', not_ready: 'Not ready for a major commitment yet' },
} as const

export default function QuitPlanResult({ planId, initialLang }: { planId: string; initialLang: Lang }) {
  const [lang, setLang] = useState<Lang>(initialLang)
  const [plan, setPlan] = useState<StoredQuitPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState('')
  const ar = lang === 'ar'

  useEffect(() => {
    let cancelled = false
    const localKey = `aqla_quit_plan:${planId}`
    let local: StoredQuitPlan | null = null
    try {
      const raw = localStorage.getItem(localKey)
      if (raw) local = JSON.parse(raw) as StoredQuitPlan
    } catch {
      local = null
    }
    if (!cancelled && local) setPlan(local)

    fetch(`/api/quit-engine/plan/${encodeURIComponent(planId)}`, { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error(`load_${response.status}`)
        return response.json() as Promise<{ plan: StoredQuitPlan }>
      })
      .then(({ plan: remote }) => {
        if (cancelled) return
        setPlan(remote)
        try { localStorage.setItem(localKey, JSON.stringify(remote)) } catch { /* no-op */ }
      })
      .catch(() => {
        // A local plan remains usable if staging persistence is not provisioned yet.
      })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [planId])

  const result = plan?.result
  const followupLabels = useMemo(() => result?.follow_up_schedule.map((item) => lang === 'ar' ? item.label_ar : item.label_en) ?? [], [lang, result])

  async function copyText(value: string, kind: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(kind)
      window.setTimeout(() => setCopied(''), 1800)
    } catch {
      setCopied('')
    }
  }

  async function shareAchievement() {
    if (!result) return
    const text = result.share_text
    try {
      if (navigator.share) await navigator.share({ title: ar ? 'خطتي مع أقلع' : 'My AQla plan', text, url: 'https://staging.smokefreeksa.com/aqla' })
      else await copyText(`${text}\nhttps://staging.smokefreeksa.com/aqla`, 'share')
    } catch {
      // User cancelled sharing.
    }
  }

  if (loading && !plan) {
    return <main className="qp-page" dir={ar ? 'rtl' : 'ltr'}><div className="qp-loading">{ar ? 'جاري تحميل خطتك…' : 'Loading your plan…'}</div></main>
  }

  if (!plan || !result) {
    return (
      <main className="qp-page" dir={ar ? 'rtl' : 'ltr'}>
        <div className="qp-empty">
          <img src={LOGO_URL} alt="Aqla — أقلع" />
          <h1>{ar ? 'لم نتمكن من العثور على هذه الخطة' : 'We could not find this plan'}</h1>
          <p>{ar ? 'إذا أنشأت الخطة على جهاز آخر ولم تُفعّل مزامنة AWS بعد، أنشئ خطة جديدة هنا.' : 'If you created it on another device before AWS syncing was enabled, create a new plan here.'}</p>
          <a href="/aqla/assessment">{ar ? 'ابدأ تقييمًا جديدًا' : 'Start a new assessment'}</a>
        </div>
      </main>
    )
  }

  return (
    <main className="qp-page" dir={ar ? 'rtl' : 'ltr'} lang={lang}>
      <header className="qp-topbar">
        <a href="/aqla" className="qp-brand"><img src={LOGO_URL} alt="Aqla — أقلع" /><span>{ar ? 'أقلع' : 'AQla'}</span></a>
        <button type="button" className="qe-lang" onClick={() => setLang(ar ? 'en' : 'ar')}>{ar ? 'EN' : 'ع'}</button>
      </header>

      <div className="qp-shell">
        {!plan.persisted ? <div className="qp-sync-warning">{ar ? 'الخطة محفوظة على هذا الجهاز الآن. مزامنة الحساب عبر AWS ستصبح تلقائية بمجرد تفعيل قاعدة بيانات staging.' : 'This plan is currently saved on this device. Account sync through AWS will become automatic once the staging database is enabled.'}</div> : <div className="qp-sync-ok">{ar ? '✓ محفوظة في حسابك على AWS' : '✓ Saved to your AWS account'}</div>}

        {result.safety_immediate ? <section className="qp-safety"><strong>{ar ? 'سلامتك أولًا' : 'Safety first'}</strong><p>{result.safety_immediate}</p></section> : null}

        <section className="qp-hero-card">
          <span className="qp-kicker">AQla Personal Quit Engine</span>
          <h1>{result.result_title}</h1>
          <p>{result.human_explanation}</p>
          {result.ai_personal_summary ? <div className="qp-ai-summary"><span>{ar ? 'رسالة أقلع لك' : 'AQla message for you'}</span><p>{result.ai_personal_summary}</p></div> : null}
          {result.ai_micro_challenge ? <div className="qp-challenge"><span>{ar ? 'تحدي الـ 24 ساعة' : '24-hour micro-challenge'}</span><strong>{result.ai_micro_challenge}</strong></div> : null}
        </section>

        <div className="qp-grid-two">
          <PlanCard title={ar ? 'نمطك مع النيكوتين' : 'Your nicotine pattern'}>
            <div className="qp-tags">{result.pattern_labels.length ? result.pattern_labels.map((item) => <span key={item}>{item}</span>) : <span>{ar ? 'لم تُحدد محفزات واضحة' : 'No clear triggers selected'}</span>}</div>
          </PlanCard>
          <PlanCard title={ar ? 'استعدادك الحالي' : 'Your current readiness'}>
            <strong className="qp-highlight">{readinessLabel[lang][result.readiness_category]}</strong>
            <p>{result.readiness_text}</p>
          </PlanCard>
        </div>

        <PlanCard title={ar ? 'مستوى الدعم الذي يناسب خطتك' : 'Support level for your plan'}>
          <div className="qp-metrics">
            <div><small>{ar ? 'النمط العملي' : 'Practical pattern'}</small><strong>{dependenceLabel[lang][result.dependence_category]}</strong></div>
            {typeof result.hsi_score === 'number' ? <div><small>HSI</small><strong>{result.hsi_score} / 6</strong><em>{ar ? 'للسجائر فقط — مؤشر فحص وليس تشخيصًا' : 'Cigarettes only — screening indicator, not a diagnosis'}</em></div> : null}
            <div><small>{ar ? 'مؤشر دعم أقلع' : 'AQla support indicator'}</small><strong>{result.aqla_support_intensity} / 10</strong><em>{ar ? 'مؤشر داخلي غير معتمد كمقياس سريري' : 'Internal heuristic, not a validated clinical scale'}</em></div>
          </div>
        </PlanCard>

        <PlanCard title={ar ? 'أول خطوة خلال 24 ساعة' : 'Your first step in the next 24 hours'}>
          <div className="qp-first-step">{result.first_24h_step}</div>
        </PlanCard>

        <PlanCard title={ar ? 'خطة 7 أيام' : 'Your 7-day plan'}>
          <ol className="qp-day-list">{result.seven_day_plan.map((item) => <li key={item.day}><span>{item.day}</span><p>{item.task}</p></li>)}</ol>
        </PlanCard>

        <PlanCard title={ar ? 'أول 72 ساعة بعد الإقلاع أو التغيير' : 'The first 72 hours after quitting or changing'}>
          <ul className="qp-bullets">{result.seventy_two_hour_plan.map((item) => <li key={item}>{item}</li>)}</ul>
        </PlanCard>

        {result.trigger_plans.map((triggerPlan) => <PlanCard key={triggerPlan.title} title={triggerPlan.title}><ul className="qp-bullets">{triggerPlan.steps.map((step) => <li key={step}>{step}</li>)}</ul>{triggerPlan.craving_card ? <div className="qp-craving-card">{triggerPlan.craving_card}</div> : null}</PlanCard>)}

        <PlanCard title={ar ? 'بطاقة الرغبة السريعة' : 'Quick craving card'}>
          <div className="qp-craving-card strong">{result.craving_card}</div>
          <button type="button" className="qp-small-button" onClick={() => void copyText(result.craving_card, 'craving')}>{copied === 'craving' ? (ar ? 'تم النسخ ✓' : 'Copied ✓') : (ar ? 'نسخ البطاقة' : 'Copy card')}</button>
        </PlanCard>

        <PlanCard title={ar ? 'السلامة والدعم المهني' : 'Safety and professional support'}>
          <p>{result.referral_message}</p>
        </PlanCard>

        {result.support_message_template ? <PlanCard title={ar ? 'رسالة جاهزة لشخص الدعم' : 'Message for your support person'}><div className="qp-support-message">{result.support_message_template}</div><button type="button" className="qp-small-button" onClick={() => void copyText(result.support_message_template ?? '', 'support')}>{copied === 'support' ? (ar ? 'تم النسخ ✓' : 'Copied ✓') : (ar ? 'نسخ الرسالة' : 'Copy message')}</button></PlanCard> : null}

        <PlanCard title={ar ? 'المتابعة المخططة' : 'Planned follow-up'}>
          <div className="qp-followups">{followupLabels.map((label) => <span key={label}>{label}</span>)}</div>
          <p className="qp-muted">{ar ? 'سيتم ربط هذه المواعيد بالتنبيهات الآلية بعد تفعيل خدمة المتابعة في AWS.' : 'These checkpoints will connect to automated notifications when the AWS follow-up service is enabled.'}</p>
        </PlanCard>

        <section className="qp-actions">
          <button type="button" className="qe-button primary" onClick={() => void shareAchievement()}>{ar ? 'شارك أنني بدأت مع أقلع' : 'Share that I started with AQla'}</button>
          <a className="qe-button secondary" href="/aqla/assessment">{ar ? 'أعد التقييم' : 'Repeat assessment'}</a>
          <button type="button" className="qe-button secondary" onClick={() => window.print()}>{ar ? 'طباعة / حفظ PDF' : 'Print / save as PDF'}</button>
        </section>
      </div>
    </main>
  )
}

function PlanCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="qp-card"><h2>{title}</h2><div>{children}</div></section>
}
