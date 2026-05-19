import { createFileRoute } from "@tanstack/react-router";
import { SimpleContentPage } from "@/components/SimpleContentPage";

export const Route = createFileRoute("/safety-guidance")({
  head: () => ({ meta: [{ title: "إرشادات السلامة — Aqla" }] }),
  component: () => (
    <SimpleContentPage
      titleAr="إرشادات السلامة"
      titleEn="Safety Guidance"
      introAr="إرشادات أساسية لاستخدام منصة أقلع بأمان."
      introEn="Essential guidance for using Aqla safely."
      sectionsAr={[
        { heading: "ليست خدمة طوارئ", body: "في حالات الطوارئ الطبية اتصل بـ 937 أو 911 فورًا." },
        { heading: "خصوصية بياناتك", body: "لا تشارك بياناتك الصحية مع أشخاص لا تثق بهم. لا نطلب منك أرقام بطاقات أو معلومات مالية." },
        { heading: "علامات تستدعي مراجعة طبيب", body: "ألم في الصدر، ضيق نفس شديد، خفقان غير معتاد، أو أعراض انسحاب شديدة تمنعك من العمل اليومي." },
      ]}
      sectionsEn={[
        { heading: "Not an emergency service", body: "For medical emergencies call 937 or 911 immediately." },
        { heading: "Protect your data", body: "Do not share health information with people you don't trust. We never ask for card numbers or financial info." },
        { heading: "When to see a doctor", body: "Chest pain, severe shortness of breath, unusual heart rhythms, or withdrawal symptoms preventing daily function." },
      ]}
      ctaAr={{ label: "متى أحتاج مراجعة مختص؟", to: "/when-to-seek-help" }}
      ctaEn={{ label: "When to seek help", to: "/when-to-seek-help" }}
    />
  ),
});
