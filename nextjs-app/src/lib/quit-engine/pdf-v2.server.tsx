import { join } from 'node:path'
import React from 'react'
import { Document, Font, Image, Page, StyleSheet, Text, View, renderToBuffer } from '@react-pdf/renderer'
import type { StoredQuitPlan } from '@/lib/quit-engine/types'
import type { PersonalPlanV2Answers, PersonalPlanV2Enrichment } from '@/lib/personal-plan-v2'

type V2Plan = StoredQuitPlan & {
  answers: StoredQuitPlan['answers'] & { personal_plan_v2?: PersonalPlanV2Answers }
  result: StoredQuitPlan['result'] & { personal_plan_v2?: PersonalPlanV2Enrichment }
}

let fontRegistered = false
function ensureFont() {
  if (fontRegistered) return
  Font.register({ family: 'AqlaArabic', src: join(process.cwd(), 'public', 'DejaVuSans.ttf') })
  fontRegistered = true
}

const logoPath = join(process.cwd(), 'public', 'aqla-logo.png')
const styles = StyleSheet.create({
  page: { paddingTop: 28, paddingBottom: 44, paddingHorizontal: 34, fontFamily: 'AqlaArabic', fontSize: 10.2, lineHeight: 1.55, color: '#173b31', textAlign: 'right' },
  header: { borderBottomWidth: 1, borderBottomColor: '#dce9e3', paddingBottom: 10, marginBottom: 12 },
  logo: { width: 116, height: 66, objectFit: 'contain', alignSelf: 'center', marginBottom: 4 },
  title: { fontSize: 17, fontWeight: 700, color: '#0f5a3a', marginBottom: 4 },
  meta: { fontSize: 8.3, color: '#6a7d75' },
  card: { borderWidth: 1, borderColor: '#dce9e3', borderRadius: 6, padding: 10, marginTop: 8 },
  safety: { borderWidth: 1, borderColor: '#d78181', backgroundColor: '#fff5f5', borderRadius: 6, padding: 10, marginBottom: 10 },
  h2: { fontSize: 12.5, color: '#0f5a3a', fontWeight: 700, marginBottom: 5 },
  item: { marginBottom: 3 },
  small: { fontSize: 8.3, color: '#6a7d75', marginTop: 3 },
  moneyRow: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  footer: { position: 'absolute', bottom: 16, right: 34, left: 34, borderTopWidth: 1, borderTopColor: '#e6eee9', paddingTop: 5, fontSize: 7.3, color: '#819089' },
})

function List({ items }: { items: string[] }) {
  return <View>{items.filter(Boolean).map((item, index) => <Text key={`${index}-${item}`} style={styles.item}>• {item}</Text>)}</View>
}
function Money({ label, value }: { label: string; value: number }) {
  return <View style={styles.moneyRow}><Text>{label}</Text><Text>{new Intl.NumberFormat('en-SA', { maximumFractionDigits: 2 }).format(value)} SAR</Text></View>
}

function PlanPdfV2({ plan, lang }: { plan: V2Plan; lang: 'ar' | 'en' }) {
  const ar = lang === 'ar'
  const result = plan.result
  const extra = result.personal_plan_v2
  const answers = plan.answers.personal_plan_v2
  const provenance = plan.provenance ?? result.provenance

  return <Document title={ar ? 'خطة أقلع الشخصية' : 'Aqla Personal Quit Plan'} author="Aqla — أقلع">
    <Page size="A4" style={styles.page} wrap>
      <View style={styles.header} fixed><Image src={logoPath} style={styles.logo} /><Text style={styles.title}>{ar ? 'خطة أقلع الشخصية' : 'Aqla Personal Quit Plan'}</Text><Text style={styles.meta}>{ar ? 'تاريخ الإنشاء' : 'Created'}: {new Date(plan.created_at).toISOString().slice(0, 10)} · ID: {plan.plan_id}</Text>{provenance ? <Text style={styles.meta}>schema {provenance.plan_schema_version} · clinical {provenance.clinical_rule_version} · scoring {provenance.scoring_rule_version} · follow-up v{provenance.followup_policy_version}</Text> : null}</View>

      {result.safety_immediate ? <View style={styles.safety}><Text style={styles.h2}>{ar ? 'سلامتك أولًا' : 'Safety first'}</Text><Text>{result.safety_immediate}</Text></View> : null}
      <View style={styles.card}><Text style={styles.h2}>{result.result_title}</Text><Text>{result.human_explanation}</Text>{result.ai_personal_summary ? <Text style={styles.small}>{result.ai_personal_summary}</Text> : null}</View>

      {extra ? <>
        <View style={styles.card}><Text style={styles.h2}>{ar ? 'هدفك وتاريخ البداية' : 'Your goal and start date'}</Text><Text>{extra.goal_label}</Text>{extra.quit_date_label ? <Text>{ar ? 'التاريخ: ' : 'Date: '}{extra.quit_date_label}</Text> : null}</View>
        {extra.savings ? <View style={styles.card}><Text style={styles.h2}>{ar ? 'التوفير المتوقع' : 'Estimated savings'}</Text><Money label={ar ? 'أسبوع' : '1 week'} value={extra.savings.weekly} /><Money label={ar ? 'شهر' : '1 month'} value={extra.savings.monthly} /><Money label={ar ? '3 أشهر' : '3 months'} value={extra.savings.three_months} /><Money label={ar ? '6 أشهر' : '6 months'} value={extra.savings.six_months} /><Money label={ar ? 'سنة' : '1 year'} value={extra.savings.yearly} /><Text style={styles.small}>{ar ? 'تقدير مبني على إنفاقك المبلغ عنه ونسبة التغيير المختارة، وليس ضمانًا للتوفير.' : 'Estimate based on your self-reported spending and selected change target; it is not a guaranteed saving.'}</Text></View> : null}
        {extra.motivation_labels.length ? <View style={styles.card}><Text style={styles.h2}>{ar ? 'أسباب إضافية تهمك' : 'Additional reasons that matter to you'}</Text><List items={extra.motivation_labels} /></View> : null}
        {extra.previous_attempt_learning.length ? <View style={styles.card}><Text style={styles.h2}>{ar ? 'خبرتك من المحاولات السابقة' : 'Your previous quit experience'}</Text><List items={extra.previous_attempt_learning} /></View> : null}
        {extra.trigger_coaching.length ? <View style={styles.card}><Text style={styles.h2}>{ar ? 'خطط إضافية للمحفزات' : 'Additional trigger strategies'}</Text><List items={extra.trigger_coaching} /></View> : null}
        {extra.treatment_learning.length ? <View style={styles.card}><Text style={styles.h2}>{ar ? 'المعلومات التي طلبت معرفتها' : 'Information you asked to learn about'}</Text><List items={extra.treatment_learning} /><Text style={styles.small}>{ar ? 'اختيارات تعليمية فقط؛ لا تمثل وصف دواء أو جرعة.' : 'Educational preferences only; not a medicine or dosing recommendation.'}</Text></View> : null}
        {extra.support_network.length ? <View style={styles.card}><Text style={styles.h2}>{ar ? 'شبكة الدعم المناسبة لك' : 'Support options that fit you'}</Text><List items={extra.support_network} />{plan.answers.support_person_name ? <Text>{ar ? 'شخص الدعم: ' : 'Support person: '}{plan.answers.support_person_name}{answers?.support_person_relationship ? ` (${answers.support_person_relationship})` : ''}</Text> : null}</View> : null}
      </> : null}

      <View style={styles.card}><Text style={styles.h2}>{ar ? 'أول خطوة خلال 24 ساعة' : 'First step in the next 24 hours'}</Text><Text>{result.first_24h_step}</Text>{result.ai_first_24h_coaching ? <Text style={styles.small}>{result.ai_first_24h_coaching}</Text> : null}</View>
      <View style={styles.card}><Text style={styles.h2}>{ar ? 'خطة أول 72 ساعة' : 'First 72 hours'}</Text><List items={result.seventy_two_hour_plan} />{result.ai_seventy_two_hour_coaching?.length ? <List items={result.ai_seventy_two_hour_coaching} /> : null}</View>
      <View style={styles.card}><Text style={styles.h2}>{ar ? 'خطة 7 أيام' : 'Seven-day plan'}</Text><List items={result.seven_day_plan.map((item) => `${ar ? 'اليوم' : 'Day'} ${item.day}: ${item.task}`)} /></View>
      <View style={styles.card}><Text style={styles.h2}>{ar ? 'المحفزات' : 'Trigger plan'}</Text>{result.trigger_plans.map((section) => <View key={section.title} style={{ marginBottom: 6 }}><Text style={{ fontWeight: 700 }}>{section.title}</Text><List items={section.steps} /></View>)}{result.ai_trigger_coaching?.length ? <List items={result.ai_trigger_coaching} /> : null}</View>
      <View style={styles.card}><Text style={styles.h2}>{ar ? 'بطاقة الرغبة' : 'Craving card'}</Text><Text>{result.craving_card}</Text></View>
      {result.ai_relapse_recovery ? <View style={styles.card}><Text style={styles.h2}>{ar ? 'إذا حدثت زلة' : 'If a slip happens'}</Text><Text>{result.ai_relapse_recovery}</Text></View> : null}
      <View style={styles.card}><Text style={styles.h2}>{ar ? 'الدعم والمتابعة' : 'Support and follow-up'}</Text><Text>{result.referral_message}</Text><List items={result.follow_up_schedule.map((item) => ar ? item.label_ar : item.label_en)} />{extra ? <Text style={styles.small}>{extra.communication.followup_email_opt_in ? (ar ? 'تم اختيار المتابعة عبر البريد.' : 'Email follow-up was selected.') : (ar ? 'لم يتم الاشتراك في المتابعة عبر البريد.' : 'Email follow-up was not selected.')}</Text> : null}</View>
      <Text style={styles.small}>{ar ? 'هذه الخطة أداة دعم سلوكي وتثقيفي وليست تشخيصًا طبيًا أو وصفة دوائية.' : 'This plan provides behavioural and educational support. It is not a medical diagnosis or prescription.'}</Text>
      <Text style={styles.footer} fixed>أقلع — Aqla · Personal Quit Plan v2</Text>
    </Page>
  </Document>
}

export async function renderQuitPlanPdfV2(plan: V2Plan, lang: 'ar' | 'en') {
  ensureFont()
  return renderToBuffer(<PlanPdfV2 plan={plan} lang={lang} />)
}
