import { createFileRoute } from "@tanstack/react-router";
import { SimpleContentPage } from "@/components/SimpleContentPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "سياسة الخصوصية — Aqla" }] }),
  component: () => (
    <SimpleContentPage
      titleAr="سياسة الخصوصية"
      titleEn="Privacy Policy"
      introAr="نحترم خصوصيتك. تشرح هذه الصفحة كيف تجمع منصة أقلع البيانات وتستخدمها."
      introEn="We respect your privacy. This page explains how Aqla collects and uses data."
      sectionsAr={[
        { heading: "البيانات التي نجمعها", body: "بيانات تحليلية مجهولة عن زيارات الموقع، وإجابات اختيارية للتقييمات، ومعلومات اتصال فقط إذا اخترت تقديمها." },
        { heading: "البيانات الصحية", body: "لا نعرض أي بيانات صحية شخصية في المشاركات العامة. تُستخدم إجابات التقييمات لتقديم نتائج موجهة فقط." },
        { heading: "حقوقك", body: "يمكنك طلب حذف بياناتك في أي وقت عبر صفحة «تواصل معنا»." },
        { heading: "ملفات الارتباط", body: "نستخدم ملفات ارتباط ضرورية فقط لعمل الموقع وتحليلات مجهولة. لا نستخدم ملفات تتبع إعلانية." },
      ]}
      sectionsEn={[
        { heading: "What we collect", body: "Anonymous analytics about site visits, optional assessment answers, and contact details only if you choose to provide them." },
        { heading: "Health data", body: "We never expose personal health data in public shares. Assessment answers are used only to provide tailored results." },
        { heading: "Your rights", body: "You can request deletion of your data at any time via the Contact page." },
        { heading: "Cookies", body: "We use only essential cookies and anonymous analytics. We do not use ad-tracking cookies." },
      ]}
    />
  ),
});
