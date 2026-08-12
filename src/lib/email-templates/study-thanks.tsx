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
  surveyUrl?: string;
}

const StudyThanksEmail = ({
  fullName = "صديقنا",
  surveyUrl = "https://redcap.kau.edu.sa/surveys/?s=FLJKYNNLYEA7HXAM",
}: Props) => (
  <Html lang="ar" dir="rtl">
    <Head />
    <Preview>شكرًا لمشاركتك في دراسة أقلع البحثية</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>أقلع · Aqla</Text>
        <Heading style={h1}>شكرًا لمشاركتك</Heading>
        <Text style={p}>
          مرحبًا {fullName}، شكرًا لمساهمتك في البحث العلمي حول أضرار النيكوتين.
          رأيك يساعدنا على تطوير خدمات دعم الإقلاع في المملكة.
        </Text>
        <Text style={pEn}>
          Thank you for contributing to our research on nicotine harm. Your input
          helps improve cessation support services.
        </Text>
        <Section style={{ textAlign: "center", margin: "28px 0" }}>
          <Button href={surveyUrl} style={button}>
            صفحة الدراسة · Study page
          </Button>
        </Section>
        <Hr style={hr} />
        <Text style={small}>أقلع — مركز دعم الإقلاع عن التدخين</Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: StudyThanksEmail,
  subject: "شكرًا لمشاركتك في الدراسة · Thank you for taking part",
  displayName: "Study thank-you / شكر على المشاركة",
  previewData: { fullName: "نورة" },
} satisfies TemplateEntry;

const main = { backgroundColor: "#ffffff", fontFamily: "Tahoma, Arial, sans-serif" };
const container = { padding: "28px 26px", maxWidth: "560px" };
const brand = { color: "#006C35", fontSize: "13px", fontWeight: 700 };
const h1 = { fontSize: "21px", color: "#0b3a25", margin: "8px 0 12px" };
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
const small = { fontSize: "11px", color: "#5A7A6A", textAlign: "center" as const };
