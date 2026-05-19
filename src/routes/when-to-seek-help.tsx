import { createFileRoute } from "@tanstack/react-router";
import { SimpleContentPage } from "@/components/SimpleContentPage";

export const Route = createFileRoute("/when-to-seek-help")({
  head: () => ({ meta: [{ title: "متى أحتاج مراجعة مختص؟ — Aqla" }] }),
  component: () => (
    <SimpleContentPage
      titleAr="متى أحتاج مراجعة مختص؟"
      titleEn="When to Seek Specialist Help"
      introAr="بعض المواقف تستدعي مراجعة مختص بدل الاكتفاء بالدعم الإلكتروني."
      introEn="Some situations call for a specialist rather than online support alone."
      sectionsAr={[
        { heading: "اعتمادية مرتفعة", body: "إذا أظهر تقييم الاعتمادية درجة مرتفعة، أو فشلت محاولات سابقة متعددة." },
        { heading: "حالات صحية مصاحبة", body: "أمراض القلب، الربو، السكري، الحمل، أو اضطرابات نفسية معروفة." },
        { heading: "أعراض انسحاب شديدة", body: "صعوبة شديدة في النوم، أو قلق، أو اكتئاب يتداخل مع حياتك اليومية." },
        { heading: "كيف أبدأ؟", body: "اطلب دعمًا من فريق أقلع لتوجيهك للجهة المناسبة." },
      ]}
      sectionsEn={[
        { heading: "High dependence", body: "If your dependence assessment shows a high score, or multiple previous attempts failed." },
        { heading: "Co-existing conditions", body: "Heart disease, asthma, diabetes, pregnancy, or known mental health conditions." },
        { heading: "Severe withdrawal", body: "Severe insomnia, anxiety, or depression interfering with daily life." },
        { heading: "How to start", body: "Request support from the Aqla team for referral to the right place." },
      ]}
      ctaAr={{ label: "طلب الدعم", to: "/request-support" }}
      ctaEn={{ label: "Request Support", to: "/request-support" }}
    />
  ),
});
