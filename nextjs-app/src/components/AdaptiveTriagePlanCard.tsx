'use client'

import { useEffect, useState } from 'react'
import type { AdaptiveAssessmentAnswers, AdaptiveTriageProfile } from '@/lib/adaptive-assessment'
import type { StoredQuitPlan } from '@/lib/quit-engine/types'

type Lang = 'ar' | 'en'
type V3Plan = StoredQuitPlan & {
  answers: StoredQuitPlan['answers'] & { adaptive_assessment?: AdaptiveAssessmentAnswers }
  result: StoredQuitPlan['result'] & { adaptive_triage?: AdaptiveTriageProfile }
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

export default function AdaptiveTriagePlanCard({ planId, lang }: { planId: string; lang: Lang }) {
  const [plan, setPlan] = useState<V3Plan | null>(null)
  const ar = lang === 'ar'
  useEffect(() => {
    let cancelled = false
    fetch(`/api/quit-engine/plan/${encodeURIComponent(planId)}`, { cache: 'no-store' })
      .then(async (response) => response.ok ? await response.json() as { plan: V3Plan } : null)
      .then((payload) => { if (!cancelled && payload?.plan) setPlan(payload.plan) })
      .catch(() => undefined)
    return () => { cancelled = true }
  }, [planId])

  const triage = plan?.result.adaptive_triage
  if (!triage) return null
  const levels = levelLabel[lang]
  const labels = ar ? triage.profile_labels_ar : triage.profile_labels_en

  return <section className="qp-page" dir={ar ? 'rtl' : 'ltr'} lang={lang} style={{ paddingTop: 0 }}>
    <div className="qp-shell">
      <Card title={ar ? 'ملف أقلع الذكي' : 'Your Aqla adaptive profile'}>
        <p className="qp-muted">{ar ? 'هذا الملف يحدد نوع الدعم والمتابعة داخل أقلع. لا يمثل تشخيصًا طبيًا، ولا يتيح للذكاء الاصطناعي تجاوز قواعد السلامة أو المقاييس المحددة مسبقًا.' : 'This profile guides support and secure follow-up inside Aqla. It is not a medical diagnosis, and AI cannot override deterministic safety rules or instrument scoring.'}</p>
        <div className="qp-metrics">
          <div><small>{ar ? 'المنتج ذو الأولوية' : 'Priority product'}</small><strong>{productLabel[lang][triage.primary_product]}</strong></div>
          <div><small>{ar ? 'التعرض/الاعتماد العملي' : 'Exposure/dependence pattern'}</small><strong>{levels[triage.nicotine_exposure]}</strong></div>
          <div><small>{ar ? 'المحفزات السلوكية' : 'Behavioural pattern'}</small><strong>{levels[triage.behavioural_pattern]}</strong></div>
          <div><small>{ar ? 'تعقيد تعدد المنتجات' : 'Mixed-product complexity'}</small><strong>{levels[triage.mixed_product_complexity]}</strong></div>
          <div><small>{ar ? 'الثقة' : 'Confidence'}</small><strong>{levels[triage.confidence]}</strong></div>
          <div><small>{ar ? 'الحاجة للدعم' : 'Support need'}</small><strong>{levels[triage.support_need]}</strong></div>
        </div>
        <div className="qp-tags">{labels.map((item) => <span key={item}>{item}</span>)}</div>
      </Card>

      {triage.product_measures.length ? <Card title={ar ? 'المقاييس الخاصة بالمنتج' : 'Product-specific measures'}>
        {triage.product_measures.map((measure) => <div key={`${measure.product}-${measure.instrument}`} style={{ marginBottom: 14 }}><strong>{measure.instrument}: {measure.score}</strong><p>{ar ? `التصنيف: ${measure.category}` : `Category: ${measure.category}`}</p><p className="qp-muted">{measure.validated ? (ar ? 'مقياس/مؤشر معتمد حسب المنتج، لكنه ليس تشخيصًا.' : 'Validated product-specific measure/indicator, but not a diagnosis.') : (ar ? 'أداة داخلية مكيفة وغير معتمدة كمقياس سريري.' : 'Adapted internal screen; not a validated clinical measure.')}</p></div>)}
      </Card> : null}
    </div>
  </section>
}
