import React from "react";
import { Document, Font, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { QuitPlanJSON } from "./quit-plan-builder";
import aqlaLogo from "@/assets/aqla-logo.png";
import arabicFont from "@/assets/DejaVuSans.ttf";

Font.register({ family: "AqlaArabic", src: arabicFont });

const s = StyleSheet.create({
  page: { padding: 28, fontSize: 10.5, fontFamily: "AqlaArabic", color: "#1f2933", textAlign: "right", lineHeight: 1.55 },
  header: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#d8e7df", paddingBottom: 10, marginBottom: 10 },
  logo: { width: 58, height: 58, objectFit: "contain" },
  titleWrap: { flex: 1, paddingRight: 12 },
  title: { fontSize: 17, color: "#0b6e4f", fontWeight: 700, marginBottom: 3 },
  subtitle: { fontSize: 9.5, color: "#52616b" },
  meta: { fontSize: 8.5, color: "#667085", marginTop: 2 },
  h2: { fontSize: 12.5, marginTop: 9, marginBottom: 4, fontWeight: 700, color: "#0b6e4f" },
  h3: { fontSize: 10.5, marginTop: 6, marginBottom: 2, fontWeight: 700, color: "#243b35" },
  p: { marginBottom: 2.5 },
  small: { fontSize: 8.5, color: "#667085" },
  cite: { fontSize: 8.5, color: "#0b6e4f", marginTop: 1.5 },
  box: { padding: 7, borderRadius: 4, backgroundColor: "#fff7e6", marginTop: 5 },
  card: { padding: 7, borderRadius: 4, borderWidth: 1, borderColor: "#d8e7df", marginTop: 4 },
  emergency: { padding: 8, borderRadius: 4, backgroundColor: "#fdecea", color: "#8a1a1a", marginTop: 6 },
  refsBox: { padding: 8, borderRadius: 4, backgroundColor: "#f3f4f6", marginTop: 6 },
  row: { flexDirection: "row-reverse", borderBottomWidth: 1, borderBottomColor: "#edf2f7", paddingVertical: 2.5 },
  rowKey: { width: "34%", color: "#52616b" },
  rowValue: { width: "66%", color: "#1f2933" },
  qr: { width: 72, height: 72, marginTop: 6, alignSelf: "flex-end" },
  footer: { position: "absolute", bottom: 14, right: 28, left: 28, fontSize: 8, color: "#98a2b3", borderTopWidth: 1, borderTopColor: "#eef2f6", paddingTop: 4 },
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

function Row({ k, v }: { k: string; v: string | number | null | undefined }) {
  return (
    <View style={s.row}>
      <Text style={s.rowKey}>{k}</Text>
      <Text style={s.rowValue}>{v ?? "—"}</Text>
    </View>
  );
}

function PageFooter({ planId }: { planId: string }) {
  return <Text style={s.footer}>Aqla — أقلع | خطة توعوية لا تستبدل الطبيب أو الصيدلي | Plan ID: {planId}</Text>;
}

export function QuitPlanPdf({
  plan,
  qrDataUrl,
  shareUrl,
  planId,
}: {
  plan: QuitPlanJSON;
  qrDataUrl: string;
  shareUrl: string;
  planId: string;
}) {
  const a = plan.assessment;
  const ph = plan.pharmacy_discussion;
  const generated = new Date(plan.meta.generated_at).toLocaleString("ar-SA");

  return (
    <Document title={`aqla-quit-plan-${planId}`} author="Aqla">
      <Page size="A4" style={s.page} wrap>
        <View style={s.header} fixed>
          <Image src={aqlaLogo} style={s.logo} />
          <View style={s.titleWrap}>
            <Text style={s.title}>{plan.title}</Text>
            <Text style={s.subtitle}>{plan.subtitle}</Text>
            <Text style={s.meta}>Plan ID: {planId} — تاريخ الإنشاء: {generated}</Text>
          </View>
        </View>

        <Text style={s.h2}>1. ملخص خطتك</Text>
        <Row k="الاسم" v={plan.identity.nickname} />
        <Row k="المدينة" v={plan.identity.city} />
        <Row k="تاريخ إنشاء الخطة" v={generated} />
        <Row k="نوع المنتج" v={plan.use.product_ar} />
        <Row k="أداة التقييم المستخدمة" v={a.instrument_label_ar} />
        <Row k="نطاق النتيجة" v={`${a.band_ar} (مجموع ${a.total})`} />
        <Row k="الهدف" v={plan.goal.label_ar} />
        <Row k="تاريخ البداية" v={plan.dates.quit_or_reduce_date ?? "—"} />
        <Row k="طريقة المتابعة" v={plan.followup_preference_ar} />
        {!a.validated && <Text style={s.small}>ملاحظة: تقييم مكيّف (غير معتمد).</Text>}
        <Text style={s.cite}>{plan.summary_citation}</Text>

        <Text style={s.h2}>2. ماذا تعني نتيجتك؟</Text>
        <Text style={s.p}>{plan.score_meaning}</Text>

        <Text style={s.h2}>3. هدفك الحالي</Text>
        <Text style={s.p}>{plan.goal.text}</Text>

        <Text style={s.h2}>4. محفزاتك الأساسية</Text>
        <List items={plan.triggers} />

        <Text style={s.h2}>5. خطة التعامل مع المحفزات</Text>
        <List items={plan.trigger_plan} />
        <Text style={s.cite}>{plan.trigger_plan_citation}</Text>

        <Text style={s.h2}>6. خطة أول 24 ساعة</Text>
        <List items={plan.first_24h} />

        <Text style={s.h2}>7. خطة أول 7 أيام</Text>
        <List items={plan.first_7d} />

        <Text style={s.h2}>8. خطة 28 يوم</Text>
        <List items={plan.follow_up_28d} />
        <Text style={s.cite}>{plan.follow_up_28d_citation}</Text>
        <PageFooter planId={planId} />
      </Page>

      <Page size="A4" style={s.page} wrap>
        <Text style={s.h2}>9. خطة الرغبة الشديدة</Text>
        <List items={plan.craving_rescue} />
        <Text style={s.cite}>{plan.craving_rescue_citation}</Text>

        <Text style={s.h2}>10. إذا رجعت للاستخدام</Text>
        <List items={plan.relapse_plan} />
        <Text style={s.cite}>{plan.relapse_plan_citation}</Text>

        <Text style={s.h2}>11. خيارات يمكن مناقشتها مع الصيدلي أو الطبيب</Text>
        <Text style={s.p}>{ph.intro}</Text>
        <Text style={s.h3}>بدائل النيكوتين</Text>
        <Text style={s.p}>{ph.nrt_intro}</Text>
        {ph.nrt_details.map((o, i) => (
          <View key={i} style={s.card} wrap={false}>
            <Text style={s.h3}>• {o.name}</Text>
            <Text style={s.p}>ما هو؟ {o.what_is}</Text>
            <Text style={s.p}>كيف يساعد؟ {o.purpose}</Text>
            <Text style={s.p}>أمور يجب الانتباه لها: {o.common_issues}</Text>
            <Text style={s.p}>اسأل الصيدلي أو الطبيب قبل الاستخدام: {o.safety}</Text>
          </View>
        ))}

        <Text style={s.h3}>أدوية وصفية يمكن سؤال الطبيب أو الصيدلي عنها</Text>
        {ph.prescription_details.map((o, i) => (
          <View key={i} style={s.card} wrap={false}>
            <Text style={s.h3}>• {o.name}</Text>
            <Text style={s.p}>ما هو؟ {o.what_is}</Text>
            <Text style={s.p}>كيف يساعد؟ {o.purpose}</Text>
            <Text style={s.p}>أمور يجب الانتباه لها: {o.common_issues}</Text>
            <Text style={s.p}>السلامة: {o.safety}</Text>
          </View>
        ))}
        <View style={s.box}>
          {ph.important_notes.map((n, i) => <Text key={i} style={s.p}>• {n}</Text>)}
        </View>
        <Text style={s.p}>{ph.closing}</Text>
        <Text style={s.cite}>{ph.citations}</Text>
        <PageFooter planId={planId} />
      </Page>

      <Page size="A4" style={s.page} wrap>
        <Text style={s.h2}>12. متى أحتاج مراجعة مختص؟</Text>
        <List items={plan.when_to_seek_help} />
        <Text style={s.cite}>{plan.when_to_seek_help_citation}</Text>

        <Text style={s.h2}>13. الحالات الطارئة</Text>
        <View style={s.emergency}>
          <Text>{plan.emergency_disclaimer}</Text>
        </View>

        <Text style={s.h2}>14. المتابعة</Text>
        <Row k="طريقة المتابعة المختارة" v={plan.followup_preference_ar} />
        <Row k="المتابعة القادمة" v={plan.dates.followup_next} />
        <List items={plan.followup_schedule} />

        <Text style={s.h2}>15. روابط أقلع</Text>
        <List items={plan.aqla_links.map((l) => `${l.label}: ${l.href}`)} />
        <Text style={s.p}>واتساب: {plan.contact.whatsapp}</Text>
        <Text style={s.p}>البريد: {plan.contact.email}</Text>
        <Text style={s.p}>الموقع: {plan.contact.site}</Text>
        <Text style={s.small}>رابط الخطة: {shareUrl}</Text>
        {qrDataUrl ? <Image src={qrDataUrl} style={s.qr} /> : null}

        <Text style={s.h2}>16. المراجع</Text>
        <View style={s.refsBox}>
          {plan.references.map((r, i) => (
            <Text key={r.id} style={s.p}>{i + 1}. {r.full}</Text>
          ))}
        </View>
        <PageFooter planId={planId} />
      </Page>
    </Document>
  );
}
