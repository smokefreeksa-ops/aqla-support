import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { TemplateEntry } from "./registry";

interface Props {
  fullName?: string;
  moduleTitleEn?: string;
  moduleTitleAr?: string;
  score?: number;
  certificateCode?: string;
  certificateUrl?: string;
}

const AcademyCertificateEmail = ({
  fullName = "Learner",
  moduleTitleEn = "Aqla Academy Module",
  moduleTitleAr = "وحدة أكاديمية أقلع",
  score = 100,
  certificateCode = "AQLA-AC-XXXXXXXX",
  certificateUrl = "https://aqla1.com",
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>
      Your Aqla Academy certificate is ready · شهادتك من أكاديمية أقلع جاهزة
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={brand}>أقلع · Aqla</Text>
          <Text style={brandSub}>Academy Certificate · شهادة الأكاديمية</Text>
        </Section>

        <Section style={card}>
          <Heading as="h1" style={h1}>
            Congratulations, {fullName}!
          </Heading>
          <Text style={arHeading}>مبروك، {fullName}!</Text>

          <Text style={p}>
            You've successfully completed <strong>{moduleTitleEn}</strong> with
            a score of <strong>{score}%</strong>.
          </Text>
          <Text style={pAr}>
            لقد أكملت بنجاح <strong>{moduleTitleAr}</strong> بنتيجة{" "}
            <strong>{score}%</strong>.
          </Text>

          <Section style={codeBox}>
            <Text style={codeLabel}>Certificate code · رمز الشهادة</Text>
            <Text style={codeValue}>{certificateCode}</Text>
          </Section>

          <Section style={{ textAlign: "center", marginTop: "24px" }}>
            <Button href={certificateUrl} style={btn}>
              View & Download Certificate
            </Button>
            <Text style={btnAr}>عرض الشهادة وتحميلها</Text>
          </Section>

          <Hr style={hr} />

          <Text style={small}>
            This certificate can be verified any time using the code above at
            aqla1.com.
          </Text>
          <Text style={smallAr}>
            يمكن التحقق من هذه الشهادة في أي وقت باستخدام الرمز أعلاه عبر
            aqla1.com.
          </Text>
        </Section>

        <Text style={footer}>
          أقلع · Aqla — نحو حياة بلا تدخين
        </Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: AcademyCertificateEmail,
  subject: (data: Record<string, any>) =>
    ` Your Aqla Academy Certificate · شهادتك من أكاديمية أقلع`,
  displayName: "Academy Certificate",
  previewData: {
    fullName: "Ahmed Al-Otaibi",
    moduleTitleEn: "Foundations of Tobacco Cessation",
    moduleTitleAr: "أساسيات الإقلاع عن التبغ",
    score: 92,
    certificateCode: "AQLA-AC-A3F9K2QP",
    certificateUrl: "https://aqla1.com/academy-certificate/AQLA-AC-A3F9K2QP",
  },
} satisfies TemplateEntry;

const main = { backgroundColor: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif" };
const container = { maxWidth: "560px", margin: "0 auto", padding: "24px 20px" };
const header = { textAlign: "center" as const, padding: "8px 0 20px" };
const brand = { fontSize: "22px", fontWeight: 700, color: "#006C35", margin: "0" };
const brandSub = { fontSize: "12px", color: "#6b7280", margin: "4px 0 0", letterSpacing: "0.5px" };
const card = { backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "16px", padding: "28px 24px" };
const h1 = { fontSize: "22px", color: "#111827", margin: "0 0 4px", textAlign: "center" as const };
const arHeading = { fontSize: "18px", color: "#006C35", margin: "0 0 16px", textAlign: "center" as const, direction: "rtl" as const };
const p = { fontSize: "15px", color: "#374151", lineHeight: "1.6", margin: "8px 0" };
const pAr = { fontSize: "14px", color: "#374151", lineHeight: "1.7", margin: "8px 0", direction: "rtl" as const, textAlign: "right" as const };
const codeBox = { backgroundColor: "#ecfdf5", border: "1px dashed #10b981", borderRadius: "10px", padding: "14px", margin: "20px 0", textAlign: "center" as const };
const codeLabel = { fontSize: "11px", color: "#065f46", margin: "0 0 4px", letterSpacing: "0.5px", textTransform: "uppercase" as const };
const codeValue = { fontSize: "16px", fontWeight: 700, color: "#064e3b", margin: "0", fontFamily: "ui-monospace, SFMono-Regular, monospace" };
const btn = { backgroundColor: "#006C35", color: "#ffffff", padding: "12px 28px", borderRadius: "999px", fontSize: "14px", fontWeight: 600, textDecoration: "none", display: "inline-block" };
const btnAr = { fontSize: "12px", color: "#6b7280", margin: "8px 0 0", direction: "rtl" as const };
const hr = { borderColor: "#e5e7eb", margin: "24px 0" };
const small = { fontSize: "12px", color: "#6b7280", lineHeight: "1.5", margin: "4px 0" };
const smallAr = { fontSize: "12px", color: "#6b7280", lineHeight: "1.6", margin: "4px 0", direction: "rtl" as const };
const footer = { fontSize: "11px", color: "#9ca3af", textAlign: "center" as const, margin: "20px 0 0" };
