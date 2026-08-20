import { join } from 'node:path'
import React from 'react'
import { Document, Font, Page, StyleSheet, Text, View, renderToBuffer } from '@react-pdf/renderer'
import type { StoredQuitPlan } from '@/lib/quit-engine/types'

let fontRegistered = false
function ensureFont() {
  if (fontRegistered) return
  Font.register({ family: 'AqlaArabic', src: join(process.cwd(), 'public', 'DejaVuSans.ttf') })
  fontRegistered = true
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 46,
    paddingHorizontal: 34,
    fontFamily: 'AqlaArabic',
    fontSize: 10.5,
    lineHeight: 1.6,
    color: '#173b31',
    textAlign: 'right',
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#dce9e3',
    paddingBottom: 12,
    marginBottom: 14,
  },
  brand: { fontSize: 20, color: '#0f5a3a', fontWeight: 700, marginBottom: 4 },
  title: { fontSize: 16, fontWeight: 700, marginBottom: 5 },
  meta: { fontSize: 8.5, color: '#6a7d75' },
  card: {
    borderWidth: 1,
    borderColor: '#dce9e3',
    borderRadius: 6,
    padding: 10,
    marginTop: 8,
  },
  safety: {
    borderWidth: 1,
    borderColor: '#d78181',
    backgroundColor: '#fff5f5',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  h2: { fontSize: 12.5, color: '#0f5a3a', fontWeight: 700, marginBottom: 5 },
  body: { marginBottom: 4 },
  item: { marginBottom: 3 },
  small: { fontSize: 8.5, color: '#6a7d75' },
  footer: {
    position: 'absolute',
    bottom: 16,
    right: 34,
    left: 34,
    borderTopWidth: 1,
    borderTopColor: '#e6eee9',
    paddingTop: 5,
    fontSize: 7.5,
    color: '#819089',
  },
})

function BulletList({ items }: { items: string[] }) {
  return <View>{items.filter(Boolean).map((item, index) => <Text key={`${index}-${item}`} style={styles.item}>• {item}</Text>)}</View>
}

function PlanPdf({ plan, lang }: { plan: StoredQuitPlan; lang: 'ar' | 'en' }) {
  const ar = lang === 'ar'
  const result = plan.result
  const provenance = plan.provenance

  return (
    <Document title={ar ? 'خطة أقلع الشخصية' : 'Aqla Personal Quit Plan'} author="Aqla — أقلع">
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header} fixed>
          <Text style={styles.brand}>أقلع | Aqla</Text>
          <Text style={styles.title}>{ar ? 'خطة الإقلاع الشخصية' : 'Personal quit plan'}</Text>
          <Text style={styles.meta}>{ar ? 'تاريخ الإنشاء' : 'Created'}: {new Date(plan.created_at).toISOString().slice(0, 10)} · ID: {plan.plan_id}</Text>
          {provenance ? <Text style={styles.meta}>Plan schema {provenance.plan_schema_version} · clinical {provenance.clinical_rule_version} · scoring {provenance.scoring_rule_version} · follow-up v{provenance.followup_policy_version}</Text> : null}
        </View>

        {result.safety_immediate ? (
          <View style={styles.safety}>
            <Text style={styles.h2}>{ar ? 'سلامتك أولًا' : 'Safety first'}</Text>
            <Text>{result.safety_immediate}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.h2}>{result.result_title}</Text>
          <Text style={styles.body}>{result.human_explanation}</Text>
          {result.ai_personal_summary ? <Text style={styles.body}>{result.ai_personal_summary}</Text> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.h2}>{ar ? 'أول خطوة خلال 24 ساعة' : 'First step in the next 24 hours'}</Text>
          <Text>{result.first_24h_step}</Text>
          {result.ai_first_24h_coaching ? <Text style={styles.small}>{result.ai_first_24h_coaching}</Text> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.h2}>{ar ? 'خطة أول 72 ساعة' : 'First 72 hours'}</Text>
          <BulletList items={result.seventy_two_hour_plan} />
          {result.ai_seventy_two_hour_coaching?.length ? <BulletList items={result.ai_seventy_two_hour_coaching} /> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.h2}>{ar ? 'خطة 7 أيام' : 'Seven-day plan'}</Text>
          <BulletList items={result.seven_day_plan.map((item) => `${ar ? 'اليوم' : 'Day'} ${item.day}: ${item.task}`)} />
        </View>

        <View style={styles.card}>
          <Text style={styles.h2}>{ar ? 'خطة التعامل مع المحفزات' : 'Trigger plan'}</Text>
          {result.trigger_plans.map((section) => (
            <View key={section.title} style={{ marginBottom: 7 }} wrap={false}>
              <Text style={{ fontWeight: 700, marginBottom: 3 }}>{section.title}</Text>
              <BulletList items={section.steps} />
            </View>
          ))}
          {result.ai_trigger_coaching?.length ? <BulletList items={result.ai_trigger_coaching} /> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.h2}>{ar ? 'بطاقة الرغبة' : 'Craving card'}</Text>
          <Text>{result.craving_card}</Text>
        </View>

        {result.ai_relapse_recovery ? (
          <View style={styles.card}>
            <Text style={styles.h2}>{ar ? 'إذا حدثت زلة' : 'If a slip happens'}</Text>
            <Text>{result.ai_relapse_recovery}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.h2}>{ar ? 'الدعم والمتابعة' : 'Support and follow-up'}</Text>
          <Text style={styles.body}>{result.referral_message}</Text>
          <BulletList items={result.follow_up_schedule.map((item) => ar ? item.label_ar : item.label_en)} />
        </View>

        <Text style={styles.small}>{ar ? 'هذه الخطة أداة دعم سلوكي وتثقيفي ولا تمثل تشخيصًا طبيًا أو وصفة دوائية. لا تستخدم أقلع بدل خدمات الطوارئ.' : 'This plan provides behavioural and educational support. It is not a medical diagnosis or prescription and must not replace emergency care.'}</Text>

        <Text style={styles.footer} fixed>أقلع — Aqla · {ar ? 'خطة دعم شخصية' : 'Personal support plan'} · {provenance ? `schema ${provenance.plan_schema_version}` : 'legacy schema'}</Text>
      </Page>
    </Document>
  )
}

export async function renderQuitPlanPdf(plan: StoredQuitPlan, lang: 'ar' | 'en') {
  ensureFont()
  return renderToBuffer(<PlanPdf plan={plan} lang={lang} />)
}
