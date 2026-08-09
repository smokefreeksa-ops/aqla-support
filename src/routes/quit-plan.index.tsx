import { createFileRoute } from "@tanstack/react-router";
import { SimpleContentPage } from "@/components/SimpleContentPage";

export const Route = createFileRoute("/quit-plan/")({
  head: () => ({
    meta: [
      { title: "خطة أقلع — خطة إقلاع شخصية مبسطة" },
      {
        name: "description",
        content: "خطة أقلع الشخصية: خطوات يومية، تاريخ بدء مقترح، وتذكيرات للمواقف المحفزة بعد إكمال تقييم الاعتمادية.",
      },
      { property: "og:title", content: "خطة أقلع — خطة إقلاع شخصية مبسطة" },
      { property: "og:description", content: "ابنِ خطتك الشخصية للإقلاع عن النيكوتين مع منصة أقلع." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <SimpleContentPage
      titleAr="خطة أقلع"
      titleEn="Aqla Plan"
      introAr="خطة شخصية مبسطة للإقلاع تُبنى بعد إكمال تقييم الاعتمادية في مسار الإقلاع."
      introEn="A simplified personal cessation plan built after completing the dependence assessment in the Quit Pathway."
      sectionsAr={[
        { heading: "كيف أبدأ؟", body: "ابدأ بمسار الإقلاع لتحديد المنتج وإكمال أداة التقييم المناسبة، ثم تظهر خطتك المبدئية." },
        { heading: "ماذا تتضمن الخطة؟", body: "تاريخ بدء مقترح، خطوات يومية، تذكيرات بمواقف الإغراء، وخيارات للتواصل مع مختص عند الحاجة." },
      ]}
      sectionsEn={[
        { heading: "How to start", body: "Begin with the Quit Pathway to select your product and complete the appropriate assessment tool; your initial plan will then appear." },
        { heading: "What's included", body: "A proposed start date, daily steps, reminders for trigger situations, and options to contact a specialist when needed." },
      ]}
      ctaAr={{ label: "ابدأ مسار الإقلاع", to: "/quit-pathway" }}
      ctaEn={{ label: "Start Quit Pathway", to: "/quit-pathway" }}
    />
  ),
});
