import { createFileRoute, Link } from "@tanstack/react-router";
import { SimpleContentPage } from "@/components/SimpleContentPage";

export const Route = createFileRoute("/points-medals")({
  head: () => ({ meta: [{ title: "النقاط والأوسمة — Aqla" }] }),
  component: PointsMedalsPage,
});

function PointsMedalsPage() {
  return (
    <SimpleContentPage
      titleAr="النقاط والأوسمة"
      titleEn="Points & Medals"
      introAr="تُمنح النقاط والأوسمة للمشاركة التوعوية الآمنة مثل دعوة الأصدقاء، تصميم البطاقات، وتحديات المعرفة والمدن. لا تعتمد على بيانات صحية خاصة."
      introEn="Points and medals reward safe awareness participation such as inviting friends, designing cards, and joining knowledge or city challenges. They are not based on private health data."
      sectionsAr={[
        { heading: "ابدأ من مجتمع وتحديات أقلع", body: <Link to="/challenge-pathway" className="text-primary underline">العودة إلى مركز المجتمع والتحديات</Link> },
      ]}
      sectionsEn={[
        { heading: "Start from Community & Challenges", body: <Link to="/challenge-pathway" className="text-primary underline">Back to the Community & Challenges center</Link> },
      ]}
    />
  );
}