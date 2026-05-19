import { createFileRoute } from "@tanstack/react-router";
import { SimpleContentPage } from "@/components/SimpleContentPage";

export const Route = createFileRoute("/craving-coach")({
  head: () => ({ meta: [{ title: "مدرب اللحظة — Aqla" }] }),
  component: () => (
    <SimpleContentPage
      titleAr="مدرب اللحظة"
      titleEn="Craving Coach"
      introAr="دعم سريع للحظات الرغبة الشديدة، عبر تمارين تنفس قصيرة وتذكيرات هادئة."
      introEn="Fast support for craving moments through short breathing exercises and calm reminders."
      sectionsAr={[
        { heading: "تنفس 4-7-8", body: "استنشق 4 ثوانٍ، احبس النفس 7 ثوانٍ، أخرج الزفير 8 ثوانٍ. كرر 3-4 مرات." },
        { heading: "قاعدة الـ 5 دقائق", body: "الرغبة لا تستمر طويلًا. أجّل القرار 5 دقائق وغيّر مكانك أو نشاطك." },
        { heading: "تواصل مع مختص", body: "إذا تكررت اللحظات الصعبة بشكل يومي، اطلب الدعم من فريق أقلع." },
      ]}
      sectionsEn={[
        { heading: "4-7-8 breathing", body: "Inhale 4s, hold 7s, exhale 8s. Repeat 3–4 times." },
        { heading: "5-minute rule", body: "Cravings don't last long. Delay the decision 5 minutes and change location or activity." },
        { heading: "Contact a specialist", body: "If hard moments recur daily, request support from the Aqla team." },
      ]}
      ctaAr={{ label: "طلب الدعم", to: "/request-support" }}
      ctaEn={{ label: "Request Support", to: "/request-support" }}
    />
  ),
});
