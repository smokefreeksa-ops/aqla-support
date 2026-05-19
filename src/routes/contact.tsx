import { createFileRoute } from "@tanstack/react-router";
import { SimpleContentPage } from "@/components/SimpleContentPage";
import { SocialLinks } from "@/components/SocialLinks";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "تواصل معنا — Aqla" }] }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <SimpleContentPage
      titleAr="تواصل معنا"
      titleEn="Contact Us"
      introAr="نرحب بتواصلك عبر القنوات الرسمية لمنصة أقلع. أقلع ليست خدمة طوارئ."
      introEn="Reach Aqla through our official channels. Aqla is not an emergency service."
      sectionsAr={[
        { heading: "واتساب", body: <a className="text-primary underline" href="https://wa.me/966555096412" target="_blank" rel="noopener noreferrer">+966 55 509 6412</a> },
        { heading: "حسابات التواصل الرسمية", body: <SocialLinks /> },
        { heading: "حالات الطوارئ", body: "في حالات الطوارئ الطبية اتصل بـ 937 (الإسعاف) أو 911 (الطوارئ الموحدة)." },
      ]}
      sectionsEn={[
        { heading: "WhatsApp", body: <a className="text-primary underline" href="https://wa.me/966555096412" target="_blank" rel="noopener noreferrer">+966 55 509 6412</a> },
        { heading: "Official social channels", body: <SocialLinks /> },
        { heading: "Emergencies", body: "For medical emergencies, call 937 (ambulance) or 911 (unified emergency)." },
      ]}
    />
  );
}
