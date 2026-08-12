import { createFileRoute, Link } from "@tanstack/react-router";
import { SeoPageShell } from "@/components/seo/SeoPageShell";

export const Route = createFileRoute("/la-tatten")({
  head: () => ({
    meta: [
      { title: "لا تتن أصبحت أقلع — La-Tatten is now Aqla" },
      {
        name: "description",
        content:
          "لا تتن (La-Tatten) هي البداية التي تطوّرت إلى منصة أقلع للإقلاع عن التدخين منذ 2020. تعرّف على قصة التحوّل والمسارات الحالية.",
      },
      { property: "og:title", content: "لا تتن أصبحت أقلع — La-Tatten is now Aqla" },
      {
        property: "og:description",
        content: "قصة تطوّر برنامج لا تتن إلى منصة أقلع للإقلاع عن التدخين منذ 2020.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://aqla1.com/la-tatten" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://aqla1.com/la-tatten" },
      { rel: "alternate", hrefLang: "ar", href: "https://aqla1.com/la-tatten" },
      { rel: "alternate", hrefLang: "en", href: "https://aqla1.com/en/la-tatten" },
      { rel: "alternate", hrefLang: "x-default", href: "https://aqla1.com/la-tatten" },
    ],
  }),
  component: LaTattenPage,
});

function LaTattenPage() {
  return (
    <SeoPageShell lang="ar">
      <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
        لا تتن أصبحت أقلع — La-Tatten is now Aqla
      </h1>
      <p className="mt-4 text-[15px] leading-8 text-foreground/85">
        بدأ العمل باسم «لا تتن» (La-Tatten) عام 2020 كمبادرة توعوية للحد من التدخين واستخدام منتجات
        التبغ والنيكوتين. ومع اتساع المبادرة وتحوّلها إلى مسار رقمي متكامل للتقييم والدعم والمتابعة،
        أصبح الاسم الحالي «أقلع» (Aqla).
      </p>
      <p className="mt-4 text-[15px] leading-8 text-foreground/85">
        إن كنت تبحث عن «لا تتن» أو «La-Tatten»، فأنت في المكان الصحيح: البرنامج نفسه، والفريق نفسه،
        بمسارات أوضح وأدوات أحدث.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-primary">من لا تتن إلى أقلع</h2>
      <ul className="mt-3 space-y-2 text-[15px] leading-8 text-foreground/85">
        <li>2020 — انطلاق «لا تتن» كمبادرة توعوية مجتمعية.</li>
        <li>2022 — إضافة أدوات تقييم الاعتماد على النيكوتين والدعم الموجّه.</li>
        <li>2024 — بناء المسار الرقمي المتكامل: خطة الإقلاع، المتابعة، والتدريب.</li>
        <li>اليوم — «أقلع» منصة مجانية تجمع التقييم والدعم والتعلّم والمجتمع.</li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold text-primary">ابدأ من هنا</h2>
      <ul className="mt-3 space-y-2 text-[15px] leading-8">
        <li><Link to="/" className="text-primary underline">الصفحة الرئيسية لمنصة أقلع</Link></li>
        <li><Link to="/about" className="text-primary underline">من نحن وقصة المؤسس</Link></li>
        <li><Link to="/quit-pathway" className="text-primary underline">مسار الإقلاع عن التدخين</Link></li>
        <li><Link to="/help-pathway" className="text-primary underline">مساعدة شخص يهمك</Link></li>
        <li><Link to="/articles" className="text-primary underline">مقالات أقلع</Link></li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold text-primary">In English</h2>
      <p className="mt-3 text-[15px] leading-7 text-foreground/85" dir="ltr" lang="en">
        La-Tatten, the awareness programme launched in 2020, is now Aqla — a free Saudi smoking and
        nicotine cessation platform. Same programme, new name.{" "}
        <Link to="/en/la-tatten" className="text-primary underline">Read the English page</Link>.
      </p>
    </SeoPageShell>
  );
}
