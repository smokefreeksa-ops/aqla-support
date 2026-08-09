import React from "react";
import { Document, Font, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ClinicalPlanJSON } from "@/lib/clinical/types";
import aqlaLogo from "@/assets/aqla-logo.png";
import arabicFont from "@/assets/DejaVuSans.ttf";

Font.register({ family: "AqlaArabic", src: arabicFont });

const s = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 42,
    paddingHorizontal: 32,
    fontSize: 10.5,
    fontFamily: "AqlaArabic",
    color: "#12241b",
    textAlign: "right",
    lineHeight: 1.6,
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#cfe3d7",
    paddingBottom: 10,
    marginBottom: 12,
  },
  logo: { width: 54, height: 54, objectFit: "contain" },
  titleWrap: { flex: 1, paddingRight: 12 },
  title: { fontSize: 17, color: "#006C35", fontWeight: 700, marginBottom: 3 },
  meta: { fontSize: 8.5, color: "#5b6b62" },
  h2: { fontSize: 12, marginTop: 10, marginBottom: 4, fontWeight: 700, color: "#006C35" },
  item: { marginBottom: 2.5 },
  card: { padding: 8, borderRadius: 4, borderWidth: 1, borderColor: "#cfe3d7", marginTop: 5 },
  safety: { padding: 9, borderRadius: 4, backgroundColor: "#f2f8f4", marginBottom: 8 },
  disclaimer: { padding: 9, borderRadius: 4, backgroundColor: "#fdecea", color: "#8a1a1a", fontSize: 9, marginTop: 12 },
  footer: {
    position: "absolute",
    bottom: 16,
    right: 32,
    left: 32,
    fontSize: 8,
    color: "#8b978f",
    borderTopWidth: 1,
    borderTopColor: "#e6efe9",
    paddingTop: 4,
    textAlign: "right",
  },
});

function List({ items }: { items: string[] }) {
  return (
    <View>
      {items.map((t, i) => (
        <Text key={i} style={s.item}>
          • {t}
        </Text>
      ))}
    </View>
  );
}

/**
 * PDF renderer for the immutable Release 1 ClinicalPlanJSON.
 * It renders ONLY what is stored in plan_json — it never generates clinical content.
 */
export function ClinicalPlanPdf({ plan }: { plan: ClinicalPlanJSON }) {
  return (
    <Document title={`Aqla plan v${plan.plan_version}`}>
      <Page size="A4" style={s.page} wrap>
        <View style={s.header} fixed>
          <Image src={aqlaLogo} style={s.logo} />
          <View style={s.titleWrap}>
            <Text style={s.title}>خطة أقلع السلوكية الشخصية</Text>
            <Text style={s.meta}>
              {plan.identity.nickname}
              {plan.identity.city ? ` — ${plan.identity.city}` : ""}
            </Text>
            <Text style={s.meta}>
              الإصدار {plan.plan_version} • {plan.clinical_rule_version} •{" "}
              {new Date(plan.generated_at).toISOString().slice(0, 10)}
            </Text>
          </View>
        </View>

        <View style={s.safety}>
          <Text style={s.item}>{plan.safety.message_ar}</Text>
          <List items={plan.safety.actions_ar} />
        </View>

        <Text style={s.h2}>{plan.craving_management.title_ar}</Text>
        <List items={plan.craving_management.items} />

        <Text style={s.h2}>{plan.trigger_plan.title_ar}</Text>
        <List items={plan.trigger_plan.items} />

        <Text style={s.h2}>الجدول الزمني للإقلاع</Text>
        {plan.timeline.map((sec) => (
          <View key={sec.id} style={s.card} wrap={false}>
            <Text style={{ fontWeight: 700, marginBottom: 3 }}>{sec.title_ar}</Text>
            <List items={sec.items} />
          </View>
        ))}

        <Text style={s.h2}>إذا حدثت زلّة أو انتكاسة</Text>
        {plan.lapse_pathways.map((p) => (
          <View key={p.id} style={s.card} wrap={false}>
            <Text style={{ fontWeight: 700, marginBottom: 2 }}>{p.title_ar}</Text>
            <Text style={{ ...s.item, color: "#5b6b62" }}>{p.trigger_ar}</Text>
            <List items={p.steps} />
          </View>
        ))}

        <Text style={s.h2}>{plan.support.title_ar}</Text>
        <List items={plan.support.items} />

        {plan.money ? (
          <>
            <Text style={s.h2}>{plan.money.title_ar}</Text>
            <List items={plan.money.items} />
          </>
        ) : null}

        <Text style={s.h2}>{plan.services.title_ar}</Text>
        <List items={plan.services.items} />

        <Text style={s.h2}>المراجع</Text>
        <List items={plan.references} />

        <Text style={s.disclaimer}>{plan.disclaimer_ar}</Text>

        <Text style={s.footer} fixed>
          أقلع — Aqla | خطة دعم سلوكي تعليمية | الإصدار {plan.plan_version}
        </Text>
      </Page>
    </Document>
  );
}
