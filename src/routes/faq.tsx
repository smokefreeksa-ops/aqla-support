import { createFileRoute } from "@tanstack/react-router";
import { SimpleContentPage } from "@/components/SimpleContentPage";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{ title: "الأسئلة الشائعة — Aqla" }] }),
  component: FaqPage,
});

function FaqPage() {
  const sections = [
    { q: "هل أقلع مجاني؟", a: "نعم، أقلع منصة مجانية بالكامل للتوعية والدعم." },
    { q: "هل أقلع يقدم وصفة طبية؟", a: "لا. أقلع لا يقدم تشخيصًا أو علاجًا أو وصفة طبية. اختيار بدائل النيكوتين أو أدوية الإقلاع يحتاج مراجعة مختص أو صيدلي." },
    { q: "هل بياناتي خاصة؟", a: "نعم. لا نعرض أي بيانات صحية شخصية في المشاركات العامة، ولا نبيع البيانات." },
    { q: "هل أقلع خدمة طوارئ؟", a: "لا. في حالات الطوارئ الطبية اتصل بـ 937 أو 911." },
    { q: "كيف أبدأ؟", a: "ابدأ من زر «ابدأ الآن» أو اختر أحد المسارات الثلاثة في الصفحة الرئيسية." },
  ];

  const sectionsEn = [
    { q: "Is Aqla free?", a: "Yes. Aqla is a fully free awareness and support platform." },
    { q: "Does Aqla prescribe medication?", a: "No. Aqla does not provide diagnosis, treatment, or prescriptions. Choice of NRT or cessation medication requires a specialist or pharmacist." },
    { q: "Is my data private?", a: "Yes. We never expose personal health data in public shares, and we do not sell data." },
    { q: "Is Aqla an emergency service?", a: "No. For medical emergencies call 937 or 911." },
    { q: "How do I start?", a: "Use the Start Now button or choose one of the three pathways on the homepage." },
  ];

  return (
    <SimpleContentPage
      titleAr="الأسئلة الشائعة"
      titleEn="Frequently Asked Questions"
      introAr="إجابات سريعة على أكثر الأسئلة شيوعًا حول منصة أقلع."
      introEn="Quick answers to the most common questions about the Aqla platform."
      sectionsAr={sections.map((s) => ({ heading: s.q, body: s.a }))}
      sectionsEn={sectionsEn.map((s) => ({ heading: s.q, body: s.a }))}
    />
  );
}
