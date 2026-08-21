import { createFileRoute } from "@tanstack/react-router";
import { SimpleContentPage } from "@/components/SimpleContentPage";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "شروط الاستخدام — Aqla" }] }),
  component: () => (
    <SimpleContentPage
      titleAr="شروط الاستخدام"
      titleEn="Terms of Use"
      introAr="باستخدامك منصة أقلع فإنك توافق على الشروط التالية."
      introEn="By using Aqla you agree to the following terms."
      sectionsAr={[
        { heading: "غرض المنصة", body: "أقلع منصة توعية ودعم للإقلاع عن التدخين والنيكوتين، وليست بديلًا عن الرعاية الطبية." },
        { heading: "الاستخدام المسؤول", body: "تعهد بعدم استخدام المنصة لأغراض غير قانونية أو لإيذاء الآخرين." },
        { heading: "المحتوى", body: "جميع الشهادات والشارات والمواد التعليمية مخصصة للأغراض التوعوية ولا تمنح صلاحية مهنية." },
        { heading: "المسؤولية", body: "لا يتحمل فريق أقلع أي مسؤولية عن قرارات طبية تُتخذ دون مراجعة مختص." },
      ]}
      sectionsEn={[
        { heading: "Purpose", body: "Aqla is an awareness and support platform for smoking and nicotine cessation, and is not a substitute for medical care." },
        { heading: "Responsible use", body: "You agree not to use the platform for unlawful purposes or to harm others." },
        { heading: "Content", body: "All certificates, medals, and educational materials are for awareness only and confer no professional authority." },
        { heading: "Liability", body: "The Aqla team is not responsible for medical decisions made without consulting a specialist." },
      ]}
    />
  ),
});
