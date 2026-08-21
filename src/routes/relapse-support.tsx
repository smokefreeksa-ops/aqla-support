import { createFileRoute } from "@tanstack/react-router";
import { SimpleContentPage } from "@/components/SimpleContentPage";

export const Route = createFileRoute("/relapse-support")({
  head: () => ({ meta: [{ title: "مدرب الرجوع — Aqla" }] }),
  component: () => (
    <SimpleContentPage
      titleAr="مدرب الرجوع"titleEn="Relapse Support"introAr="الرجوع جزء من الرحلة لكثير من الناس. لست وحدك، ويمكنك البدء من جديد اليوم."introEn="Relapse is part of the journey for many people. You are not alone — you can start again today."
      sectionsAr={[
        { heading: "تطبيع التجربة", body: "أغلب من نجح في الإقلاع مرّ بمحاولات سابقة. كل محاولة تعلّمك المزيد عن نفسك." },
        { heading: "خطوات اليوم الأول من جديد", body: "اكتب ما الذي حصل، حدد المحفّز، واختر خطوة صغيرة واحدة لتبدأ بها اليوم." },
        { heading: "اطلب دعمًا", body: "تحدث مع مختص من خلال أقلع لتعديل خطتك بما يناسبك." },
      ]}
      sectionsEn={[
        { heading: "Normalize", body: "Most successful quitters had earlier attempts. Each one teaches you more about yourself." },
        { heading: "Day-one steps, again", body: "Write what happened, identify the trigger, and pick one small step to start with today." },
        { heading: "Ask for support", body: "Talk to a specialist through Aqla to adjust your plan." },
      ]}
      ctaAr={{ label: "طلب الدعم", to: "/request-support" }}
      ctaEn={{ label: "Request Support", to: "/request-support" }}
    />
  ),
});
