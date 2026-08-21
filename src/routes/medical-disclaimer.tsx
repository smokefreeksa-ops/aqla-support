import { createFileRoute } from "@tanstack/react-router";
import { SimpleContentPage } from "@/components/SimpleContentPage";

export const Route = createFileRoute("/medical-disclaimer")({
  head: () => ({ meta: [{ title: "إخلاء المسؤولية الطبية — Aqla" }] }),
  component: () => (
    <SimpleContentPage
      titleAr="إخلاء المسؤولية الطبية"titleEn="Medical Disclaimer"introAr="أقلع يقدم التوعية والدعم، ولا يقدم تشخيصًا أو علاجًا أو وصفة طبية."introEn="Aqla provides awareness and support; it does not provide diagnosis, treatment, or prescriptions."
      sectionsAr={[
        { heading: "ليس بديلًا عن الطبيب", body: "المعلومات في الموقع للتثقيف فقط، ولا تغني عن استشارة طبيب أو صيدلي مرخّص." },
        { heading: "الأدوية وبدائل النيكوتين", body: "اختيار أي علاج دوائي أو بديل نيكوتين أو جرعاته يحتاج تقييمًا فرديًا من مختص." },
        { heading: "الطوارئ", body: "إذا كانت لديك أعراض طارئة اتصل بـ 937 أو 911 فورًا." },
      ]}
      sectionsEn={[
        { heading: "Not a substitute for a doctor", body: "Information on this site is for education only and does not replace a licensed physician or pharmacist." },
        { heading: "Medications and NRT", body: "Selection of cessation medication, NRT, or doses requires individual evaluation by a specialist." },
        { heading: "Emergencies", body: "For urgent symptoms, call 937 or 911 immediately." },
      ]}
    />
  ),
});
