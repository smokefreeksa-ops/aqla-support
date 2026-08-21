import { createFileRoute } from "@tanstack/react-router";
import { SimpleContentPage } from "@/components/SimpleContentPage";

export const Route = createFileRoute("/cookies")({
  head: () => ({ meta: [{ title: "سياسة ملفات الارتباط — Aqla" }] }),
  component: () => (
    <SimpleContentPage
      titleAr="سياسة ملفات الارتباط"titleEn="Cookie Policy"introAr="نستخدم ملفات ارتباط ضرورية فقط لعمل المنصة وتحليلات مجهولة."introEn="We use only essential cookies and anonymous analytics."
      sectionsAr={[
        { heading: "ملفات ضرورية", body: "تحفظ تفضيلاتك مثل اللغة وحالة الجلسة. لا يمكن تعطيلها دون التأثير على عمل الموقع." },
        { heading: "تحليلات مجهولة", body: "نقيس عدد الزيارات والصفحات الأكثر استخدامًا دون ربطها بأشخاص محددين." },
        { heading: "لا إعلانات", body: "لا نستخدم ملفات تتبع إعلانية ولا نشاركها مع أي طرف ثالث." },
      ]}
      sectionsEn={[
        { heading: "Essential", body: "Save preferences like language and session state. Required for the site to function." },
        { heading: "Anonymous analytics", body: "We measure visits and popular pages without linking them to individuals." },
        { heading: "No ads", body: "We use no ad-tracking cookies and share no data with third parties for advertising." },
      ]}
    />
  ),
});
