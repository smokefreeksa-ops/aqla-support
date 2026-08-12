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
  sessionTitle?: string;
  sessionTime?: string;
  joinUrl?: string;
}

const SessionReminderEmail = ({
  fullName = "صديقنا",
  sessionTitle = "جلسة أقلع المباشرة",
  sessionTime = "قريبًا",
  joinUrl = "https://aqla1.com/dashboard/sessions",
}: Props) => (
  <Html lang="ar" dir="rtl">
    <Head />
    <Preview>تذكير بجلستك المباشرة في أقلع</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>أقلع · Aqla</Text>
        <Heading style={h1}>تذكير بجلسة مباشرة</Heading>
        <Text style={p}>
          مرحبًا {fullName}، هذا تذكير بجلسة <strong>{sessionTitle}</strong> في {sessionTime}.
        </Text>
        <Text style={pEn}>
          Reminder: your live session “{sessionTitle}” is scheduled for {sessionTime}.
        </Text>
        <Section style={{ textAlign: "center", margin: "28px 0" }}>
          <Button href={joinUrl} style={button}>
            انضم للجلسة · Join session
          </Button>
        </Section>
        <Hr style={hr} />
        <Text style={small}>أقلع — مركز دعم الإقلاع عن التدخين</Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: SessionReminderEmail,
  subject: "تذكير بجلستك المباشرة · Live session reminder",
  displayName: "Live session reminder / تذكير بجلسة",
  previewData: { fullName: "سارة", sessionTitle: "دعم الإقلاع", sessionTime: "الأحد ٧ مساءً" },
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
