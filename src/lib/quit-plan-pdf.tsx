import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import type { QuitPlanJSON } from "./quit-plan-builder";

const s = StyleSheet.create({
  page: { padding: 32, fontSize: 11, fontFamily: "Helvetica", color: "#222" },
  title: { fontSize: 18, marginBottom: 4, fontWeight: 700 },
  subtitle: { fontSize: 11, color: "#555", marginBottom: 10 },
  h2: { fontSize: 13, marginTop: 14, marginBottom: 4, fontWeight: 700, color: "#0b6e4f" },
  h3: { fontSize: 11, marginTop: 8, marginBottom: 2, fontWeight: 700 },
  p: { marginBottom: 3, lineHeight: 1.5 },
  small: { fontSize: 9, color: "#666" },
  cite: { fontSize: 9, color: "#0b6e4f", marginTop: 2 },
  box: { padding: 8, borderRadius: 4, backgroundColor: "#fff7e6", marginTop: 6 },
  emergency: { padding: 8, borderRadius: 4, backgroundColor: "#fdecea", color: "#8a1a1a", marginTop: 8 },
  refsBox: { padding: 8, borderRadius: 4, backgroundColor: "#f3f4f6", marginTop: 8 },
  qr: { width: 80, height: 80, marginTop: 8 },
});

function List({ items }: { items: string[] }) {
  return (
    <View>
      {items.map((t, i) => (
        <Text key={i} style={s.p}>• {t}</Text>
      ))}
    </View>
  );
}

export function QuitPlanPdf({
  plan,
  qrDataUrl,
  shareUrl,
}: {
  plan: QuitPlanJSON;
  qrDataUrl: string;
  shareUrl: string;
}) {
  const a = plan.assessment;
  const ph = plan.pharmacy_discussion;
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={s.title}>{plan.title}</Text>
        <Text style={s.subtitle}>{plan.subtitle}</Text>
        <Text style={s.small}>
          Plan ID: {plan.identity.nickname} — {new Date(plan.meta.generated_at).toLocaleString()}
        </Text>

        <Text style={s.h2}>A. ملخص خطتك</Text>
        <Text style={s.p}>الاسم: {plan.identity.nickname}</Text>
        <Text style={s.p}>المدينة: {plan.identity.city}</Text>
        <Text style={s.p}>نوع المنتج: {plan.use.product_ar}</Text>
        <Text style={s.p}>أداة التقييم: {a.instrument_label_ar}</Text>
        <Text style={s.p}>نطاق النتيجة: {a.band_ar} (مجموع {a.total})</Text>
        {!a.validated && <Text style={s.p}>ملاحظة: تقييم مكيّف (غير معتمد).</Text>}
        <Text style={s.p}>الهدف الحالي: {plan.goal.label_ar}</Text>
        <Text style={s.p}>الاستعداد: {plan.readiness.label_ar}</Text>
        <Text style={s.p}>تاريخ البداية: {plan.dates.quit_or_reduce_date ?? "—"}</Text>
        <Text style={s.cite}>{plan.summary_citation}</Text>

        <Text style={s.h2}>B. ماذا تعني نتيجتك؟</Text>
        <Text style={s.p}>{plan.score_meaning}</Text>

        <Text style={s.h2}>C. هدفك الحالي</Text>
        <Text style={s.p}>{plan.goal.text}</Text>

        <Text style={s.h2}>D. محفزاتك الأساسية</Text>
        <List items={plan.triggers} />

        <Text style={s.h2}>E. خطة التعامل مع المحفزات</Text>
        <List items={plan.trigger_plan} />
        <Text style={s.cite}>{plan.trigger_plan_citation}</Text>

        <Text style={s.h2}>F. خطة أول 24 ساعة</Text>
        <List items={plan.first_24h} />

        <Text style={s.h2}>G. خطة أول 7 أيام</Text>
        <List items={plan.first_7d} />

        <Text style={s.h2}>H. خطة 28 يوم</Text>
        <List items={plan.follow_up_28d} />
        <Text style={s.cite}>{plan.follow_up_28d_citation}</Text>

        <Text style={s.h2}>I. خطة الرغبة الشديدة</Text>
        <List items={plan.craving_rescue} />
        <Text style={s.cite}>{plan.craving_rescue_citation}</Text>

        <Text style={s.h2}>J. إذا رجعت للاستخدام</Text>
        <List items={plan.relapse_plan} />
        <Text style={s.cite}>{plan.relapse_plan_citation}</Text>

        <Text style={s.h2}>شخص الدعم</Text>
        <List items={plan.support_person_plan} />
      </Page>

      <Page size="A4" style={s.page}>
        <Text style={s.h2}>K. خيارات يمكن مناقشتها مع الصيدلي أو الطبيب</Text>
        <Text style={s.p}>{ph.intro}</Text>

        <Text style={s.h3}>1. بدائل النيكوتين (NRT)</Text>
        <Text style={s.p}>{ph.nrt_intro}</Text>
        {ph.nrt_details.map((o, i) => (
          <View key={i} style={{ marginTop: 6 }}>
            <Text style={s.h3}>• {o.name}</Text>
            <Text style={s.p}>الفائدة: {o.purpose}</Text>
            <Text style={s.p}>أعراض محتملة: {o.common_issues}</Text>
            <Text style={s.p}>ملاحظة سلامة: {o.safety}</Text>
          </View>
        ))}

        <Text style={s.h3}>2. أدوية وصفية غير نيكوتينية</Text>
        {ph.prescription_details.map((o, i) => (
          <View key={i} style={{ marginTop: 6 }}>
            <Text style={s.h3}>• {o.name}</Text>
            <Text style={s.p}>الفائدة: {o.purpose}</Text>
            <Text style={s.p}>أعراض محتملة: {o.common_issues}</Text>
            <Text style={s.p}>ملاحظة سلامة: {o.safety}</Text>
          </View>
        ))}

        <View style={s.box}>
          {ph.important_notes.map((n, i) => (
            <Text key={i} style={s.p}>• {n}</Text>
          ))}
        </View>
        <Text style={s.p}>{ph.closing}</Text>
        <Text style={s.cite}>{ph.citations}</Text>

        <Text style={s.h2}>L. متى أحتاج مراجعة مختص؟</Text>
        <List items={plan.when_to_seek_help} />
        <Text style={s.cite}>{plan.when_to_seek_help_citation}</Text>

        <Text style={s.h2}>M. الحالات الطارئة</Text>
        <View style={s.emergency}>
          <Text>{plan.emergency_disclaimer}</Text>
        </View>

        <Text style={s.h2}>N. المتابعة</Text>
        <List items={plan.followup_schedule} />

        <Text style={s.h2}>O. روابط أقلع</Text>
        <Text style={s.p}>واتساب: {plan.contact.whatsapp}</Text>
        <Text style={s.p}>البريد: {plan.contact.email}</Text>
        <Text style={s.p}>الموقع: {plan.contact.site}</Text>
        <Text style={s.small}>رابط الخطة: {shareUrl}</Text>
        {qrDataUrl ? <Image src={qrDataUrl} style={s.qr} /> : null}

        <Text style={s.h2}>P. المراجع</Text>
        <View style={s.refsBox}>
          {plan.references.map((r, i) => (
            <Text key={r.id} style={s.p}>
              {i + 1}. {r.full}
            </Text>
          ))}
        </View>
      </Page>
    </Document>
  );
}
