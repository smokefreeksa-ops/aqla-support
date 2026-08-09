import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ClinicalPlanView } from "@/components/clinical/ClinicalPlanView";
import { QuitChatConversation } from "@/components/clinical/QuitChatConversation";
import type { ClinicalPlanJSON } from "@/lib/clinical/types";


export const Route = createFileRoute("/quit-chat")({
  head: () => ({
    meta: [
      { title: "مساعد أقلع الذكي — خطة إقلاع سلوكية شخصية" },
      {
        name: "description",
        content:
          "محادثة سريرية منظمة تبني لك خطة إقلاع سلوكية شخصية عن النيكوتين، مع تقييم اختياري لمستوى الاعتماد وخطة تعامل مع الانتكاسة.",
      },
      { property: "og:title", content: "مساعد أقلع الذكي — خطة إقلاع سلوكية شخصية" },
      {
        property: "og:description",
        content: "ابنِ خطتك الشخصية للتحرر من النيكوتين خطوة بخطوة مع مساعد أقلع الذكي.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QuitChatPage,
});

type Msg = {
  from: "bot" | "user";
  text: string;
  quickReplies?: QuickReply[];
  multi?: QuickReply[];
  actions?: { label: string; onClick: () => void; variant?: "primary" | "secondary"; icon?: "print" | "dashboard" }[];
  input?: "text" | "email" | "number-row" | "number";
  plan?: ClinicalPlanJSON;
};
type QuickReply = { label: string; value: string };

function QuitChatPage() {
  const [plan, setPlan] = useState<ClinicalPlanJSON | null>(null);
  return (
    <>
      <div
        dir="rtl"
        className="min-h-screen bg-background font-[IBM_Plex_Sans_Arabic,Tajawal,Cairo,system-ui,sans-serif] text-right print:hidden"
      >
        <SiteHeader />
        <main className="mx-auto max-w-2xl px-3 py-6 sm:py-10">
          <header className="mb-4 text-right">
            <h1 className="text-2xl font-bold tracking-tight">مساعد أقلع الذكي</h1>
            <p className="mt-1 text-sm text-foreground/70">
              محادثة تفاعلية لبناء خطتك الشخصية للتحرر من النيكوتين. دعم سلوكي فقط — بدون محتوى دوائي.
            </p>
          </header>
          <QuitChatConversation onPlan={setPlan} />
        </main>
        <SiteFooter />
      </div>
      {plan ? (
        <div className="hidden print:block bg-white p-6" dir="rtl">
          <ClinicalPlanView plan={plan} />
        </div>
      ) : null}
      <style>{`@page { size: A4; margin: 14mm; } @media print { html, body { background: white !important; } }`}</style>
    </>
  );
}
