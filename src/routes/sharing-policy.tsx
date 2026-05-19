import { createFileRoute } from "@tanstack/react-router";
import { SimpleContentPage } from "@/components/SimpleContentPage";

export const Route = createFileRoute("/sharing-policy")({
  head: () => ({ meta: [{ title: "سياسة المشاركة — Aqla" }] }),
  component: () => (
    <SimpleContentPage
      titleAr="سياسة المشاركة"
      titleEn="Sharing Policy"
      introAr="القواعد التي تحكم البطاقات والشهادات القابلة للمشاركة العامة."
      introEn="Rules governing publicly shareable cards and certificates."
      sectionsAr={[
        { heading: "لا بيانات صحية شخصية", body: "البطاقات العامة لا تتضمن أي تفاصيل تقييم فردية، أو نتائج، أو معلومات تحدد الهوية." },
        { heading: "موافقة المستخدم", body: "تتم المشاركة فقط بناءً على طلب صريح من المستخدم. لا توجد مشاركة تلقائية." },
        { heading: "العلامة التجارية", body: "تحمل البطاقات شعار أقلع ورابط الموقع، ولا تستخدم شعارات جهات لم تمنح إذنًا رسميًا." },
      ]}
      sectionsEn={[
        { heading: "No personal health data", body: "Public cards never include individual assessment details, results, or identifying information." },
        { heading: "User consent", body: "Sharing only happens at the explicit request of the user. No automatic sharing." },
        { heading: "Branding", body: "Cards carry the Aqla logo and website URL, and do not use logos of organizations without formal permission." },
      ]}
    />
  ),
});
