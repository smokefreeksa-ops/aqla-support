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
  dashboardUrl?: string;
}

const WelcomeEmail = ({
  fullName = "صديقنا",
  dashboardUrl = "https://aqla1.com/dashboard",
}: Props) => (
  <Html lang="ar" dir="rtl">
    <Head />
    <Preview>أهلاً بك في أقلع — رحلتك نحو حياة بلا تدخين تبدأ الآن</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>أقلع · Aqla</Text>
        <Heading style={h1}>أهلاً بك يا {fullName} 👋</Heading>
        <Text style={p}>
          سعداء بانضمامك إلى منصة أقلع. من لوحتك الشخصية يمكنك متابعة الوحدات التدريبية،
          إجراء التقييم النهائي، والحصول على شهادتك المعتمدة.
        </Text>
        <Text style={pEn}>
          Welcome to Aqla. From your dashboard you can follow the training modules,
          take the final assessment, and earn your certificate.
        </Text>
        <Section style={{ textAlign: "center", margin: "28px 0" }}>
          <Button href={dashboardUrl} style={button}>
            افتح لوحة المتعلم · Open dashboard
          </Button>
        </Section>
        <Hr style={hr} />
        <Text style={small}>
          أقلع — مركز دعم الإقلاع عن التدخين · Aqla Smoking Cessation Support
        </Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: WelcomeEmail,
  subject: "أهلاً بك في أقلع · Welcome to Aqla",
  displayName: "Welcome / ترحيب",
  previewData: { fullName: "محمد", dashboardUrl: "https://aqla1.com/dashboard" },
} satisfies TemplateEntry;

const main = { backgroundColor: "#ffffff", fontFamily: "Tahoma, Arial, sans-serif" };
const container = { padding: "28px 26px", maxWidth: "560px" };
const brand = { color: "#006C35", fontSize: "13px", fontWeight: 700, letterSpacing: "0.5px" };
const h1 = { fontSize: "22px", color: "#0b3a25", margin: "8px 0 12px" };
const p = { fontSize: "15px", lineHeight: "26px", color: "#233" };
const pEn = { fontSize: "13px", lineHeight: "22px", color: "#556", direction: "ltr" as const, textAlign: "left" as const };
const button = {
  backgroundColor: "#006C35",
  color: "#ffffff",
  borderRadius: "999px",
  padding: "12px 26px",
  fontSize: "14px",
  fontWeight: 700,
  textDecoration: "none",
};
const hr = { borderColor: "#e6ece8", margin: "26px 0 14px" };
const small = { fontSize: "11px", color: "#7a8a82", textAlign: "center" as const };
