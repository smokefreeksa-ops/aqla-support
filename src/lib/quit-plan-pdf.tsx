import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import type { QuitPlanJSON } from "./quit-plan-builder";

const s = StyleSheet.create({
  page: { padding: 32, fontSize: 11, fontFamily: "Helvetica", color: "#222" },
  h1: { fontSize: 18, marginBottom: 8, fontWeight: 700 },
  h2: { fontSize: 13, marginTop: 12, marginBottom: 4, fontWeight: 700 },
  p: { marginBottom: 3, lineHeight: 1.5 },
  small: { fontSize: 9, color: "#666" },
  box: { padding: 8, borderRadius: 4, backgroundColor: "#fff7e6", marginTop: 6 },
  emergency: { padding: 8, borderRadius: 4, backgroundColor: "#fdecea", color: "#8a1a1a", marginTop: 8 },
  qr: { width: 80, height: 80, marginTop: 8 },
});

export function QuitPlanPdf({ plan, qrDataUrl, shareUrl }: { plan: QuitPlanJSON; qrDataUrl: string; shareUrl: string }) {
  const a = plan.assessment;
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={s.h1}>Aqla Personal Quit Plan — {plan.identity.nickname}</Text>
        <Text style={s.small}>{new Date(plan.meta.generated_at).toLocaleString()}</Text>

        <Text style={s.h2}>Summary</Text>
        <Text style={s.p}>Product: {plan.use.product_ar} ({plan.use.product})</Text>
        <Text style={s.p}>Assessment: {a.instrument_label_ar} — band: {a.band_ar} (total {a.total})</Text>
        {!a.validated && <Text style={s.p}>Note: adapted (non-validated) instrument.</Text>}
        <Text style={s.p}>Readiness: {plan.readiness.label_ar}</Text>
        <Text style={s.p}>Goal: {plan.goal.label_ar}</Text>
        <Text style={s.p}>Quit / reduce date: {plan.dates.quit_or_reduce_date ?? "—"}</Text>

        <Text style={s.h2}>Triggers & plan</Text>
        {plan.trigger_plan.map((t, i) => <Text key={i} style={s.p}>• {t}</Text>)}

        <Text style={s.h2}>Craving rescue</Text>
        {plan.craving_rescue.map((t, i) => <Text key={i} style={s.p}>• {t}</Text>)}

        <Text style={s.h2}>First 24h</Text>
        {plan.first_24h.map((t, i) => <Text key={i} style={s.p}>• {t}</Text>)}

        <Text style={s.h2}>First 7d</Text>
        {plan.first_7d.map((t, i) => <Text key={i} style={s.p}>• {t}</Text>)}

        <Text style={s.h2}>28-day follow-up</Text>
        {plan.follow_up_28d.map((t, i) => <Text key={i} style={s.p}>• {t}</Text>)}

        <Text style={s.h2}>Relapse plan</Text>
        {plan.relapse_plan.map((t, i) => <Text key={i} style={s.p}>• {t}</Text>)}

        <Text style={s.h2}>Support person</Text>
        {plan.support_person_plan.map((t, i) => <Text key={i} style={s.p}>• {t}</Text>)}

        <Text style={s.h2}>Pharmacy discussion</Text>
        <Text style={s.p}>{plan.pharmacy_discussion.intro}</Text>
        <Text style={s.p}>NRT: {plan.pharmacy_discussion.nrt_options.join(" / ")}</Text>
        <Text style={s.p}>Rx: {plan.pharmacy_discussion.prescription_options.join(" / ")}</Text>
        <View style={s.box}>
          {plan.pharmacy_discussion.important_notes.map((n, i) => <Text key={i} style={s.p}>• {n}</Text>)}
        </View>

        <Text style={s.h2}>When to seek professional help</Text>
        {plan.when_to_seek_help.map((t, i) => <Text key={i} style={s.p}>• {t}</Text>)}

        <View style={s.emergency}>
          <Text>{plan.emergency_disclaimer}</Text>
        </View>

        <Text style={s.h2}>Contact</Text>
        <Text style={s.p}>WhatsApp: {plan.contact.whatsapp}</Text>
        <Text style={s.p}>Email: {plan.contact.email}</Text>
        <Text style={s.p}>Site: {plan.contact.site}</Text>
        <Text style={s.small}>Plan link: {shareUrl}</Text>
        {qrDataUrl && <Image src={qrDataUrl} style={s.qr} />}
      </Page>
    </Document>
  );
}
