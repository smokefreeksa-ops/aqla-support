'use client'

import { useEffect, useState } from 'react'
import type { StoredQuitPlan } from '@/lib/quit-engine/types'
import type { PersonalPlanV2Answers, PersonalPlanV2Enrichment } from '@/lib/personal-plan-v2'

type Lang = 'ar' | 'en'
type V2Plan = StoredQuitPlan & {
  answers: StoredQuitPlan['answers'] & { personal_plan_v2?: PersonalPlanV2Answers }
  result: StoredQuitPlan['result'] & { personal_plan_v2?: PersonalPlanV2Enrichment }
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="qp-card"><h2>{title}</h2>{children}</section>
}

function Money({ value }: { value: number }) {
  return <strong>{new Intl.NumberFormat('en-SA', { maximumFractionDigits: 2 }).format(value)} SAR</strong>
}

export default function PersonalPlanV2Extras({ planId, lang }: { planId: string; lang: Lang }) {
  const [plan, setPlan] = useState<V2Plan | null>(null)
  const ar = lang === 'ar'

  useEffect(() => {
    let cancelled = false
    fetch(`/api/quit-engine/plan/${encodeURIComponent(planId)}`, { cache: 'no-store' })
      .then(async (response) => response.ok ? await response.json() as { plan: V2Plan } : null)
      .then((payload) => { if (!cancelled && payload?.plan) setPlan(payload.plan) })
      .catch(() => undefined)
    return () => { cancelled = true }
  }, [planId])

  const extra = plan?.result.personal_plan_v2
  const answers = plan?.answers.personal_plan_v2
  if (!extra || !answers) return null

  return <section className="qp-page" dir={ar ? 'rtl' : 'ltr'} lang={lang} style={{ paddingTop: 0 }}>
    <div className="qp-shell">
      <Card title={ar ? 'هدفك وتاريخ البداية' : 'Your goal and start date'}>
        <p><strong>{extra.goal_label}</strong></p>
        {extra.quit_date_label ? <p>{ar ? 'تاريخ الإقلاع/التغيير: ' : 'Quit/change date: '}<strong>{extra.quit_date_label}</strong></p> : null}
      </Card>

      {extra.savings ? <Card title={ar ? 'التوفير المتوقع' : 'Estimated savings'}>
        <div className="qp-metrics">
          <div><small>{ar ? 'أسبوع' : '1 week'}</small><Money value={extra.savings.weekly} /></div>
          <div><small>{ar ? 'شهر' : '1 month'}</small><Money value={extra.savings.monthly} /></div>
          <div><small>{ar ? '3 أشهر' : '3 months'}</small><Money value={extra.savings.three_months} /></div>
          <div><small>{ar ? '6 أشهر' : '6 months'}</small><Money value={extra.savings.six_months} /></div>
          <div><small>{ar ? 'سنة' : '1 year'}</small><Money value={extra.savings.yearly} /></div>
        </div>
        <p className="qp-muted">{ar ? 'تقدير مبني فقط على المبلغ الذي أدخلته ونسبة التغيير التي اخترتها؛ ليس ضمانًا للتوفير.' : 'Estimate based only on the spending amount and change target you entered; it is not a guaranteed saving.'}</p>
      </Card> : null}

      {extra.motivation_labels.length ? <Card title={ar ? 'أسباب إضافية تهمك' : 'Additional reasons that matter to you'}><ul>{extra.motivation_labels.map((item) => <li key={item}>{item}</li>)}</ul></Card> : null}
      {extra.trigger_coaching.length ? <Card title={ar ? 'خطط إضافية للمحفزات' : 'Additional trigger strategies'}><ul>{extra.trigger_coaching.map((item) => <li key={item}>{item}</li>)}</ul></Card> : null}
      {extra.previous_attempt_learning.length ? <Card title={ar ? 'ما تعلمناه من محاولاتك السابقة' : 'What we learned from previous attempts'}><p>{ar ? 'سبق أن استخدمت:' : 'You previously used:'}</p><ul>{extra.previous_attempt_learning.map((item) => <li key={item}>{item}</li>)}</ul><p>{ar ? 'لن تعتبر أقلع هذه المحاولة فشلًا؛ ستستخدم هذه المعلومات لتجنب تكرار خطة لم تناسبك.' : 'Aqla does not treat that attempt as failure; this information helps avoid simply repeating an approach that did not suit you.'}</p></Card> : null}
      {extra.treatment_learning.length ? <Card title={ar ? 'المعلومات التي طلبت معرفتها' : 'Information you asked to learn about'}><ul>{extra.treatment_learning.map((item) => <li key={item}>{item}</li>)}</ul><p className="qp-muted">{ar ? 'هذه اختيارات تعليمية فقط ولا تمثل وصف دواء أو جرعة.' : 'These are educational preferences only and do not prescribe a medicine or dose.'}</p></Card> : null}
      {extra.support_network.length ? <Card title={ar ? 'شبكة الدعم التي تناسبك' : 'Support options that fit you'}><ul>{extra.support_network.map((item) => <li key={item}>{item}</li>)}</ul>{plan?.answers.support_person_name ? <p>{ar ? `شخص الدعم الذي اخترته: ${plan.answers.support_person_name}${answers.support_person_relationship ? ` (${answers.support_person_relationship})` : ''}` : `Your chosen support person: ${plan.answers.support_person_name}${answers.support_person_relationship ? ` (${answers.support_person_relationship})` : ''}`}</p> : null}</Card> : null}
      <Card title={ar ? 'الحفظ والتواصل' : 'Saving and communication'}><p>{ar ? 'خطتك محفوظة في حساب أقلع.' : 'Your plan is saved in your Aqla account.'}</p><p>{extra.communication.plan_email_opt_in ? (ar ? 'اخترت استلام رابط الخطة عبر البريد.' : 'You chose to receive the plan link by email.') : (ar ? 'لم تطلب إرسال رابط الخطة عبر البريد.' : 'You did not request the plan link by email.')}</p><p>{extra.communication.followup_email_opt_in ? (ar ? 'اخترت رسائل المتابعة الداعمة عبر البريد.' : 'You chose supportive follow-up emails.') : (ar ? 'لم تشترك في رسائل المتابعة عبر البريد.' : 'You did not opt into follow-up emails.')}</p></Card>
    </div>
  </section>
}
