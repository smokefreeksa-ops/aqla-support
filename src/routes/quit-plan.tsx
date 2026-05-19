import { createFileRoute } from "@tanstack/react-router";
import { SimpleContentPage } from "@/components/SimpleContentPage";

export const Route = createFileRoute("/quit-plan")({
  head: () => ({ meta: [{ title: "خطة أقلع — Aqla" }] }),
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
