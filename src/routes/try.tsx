import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import KnowYourSmokingSection from "@/components/KnowYourSmokingSection";
import aqlaLogo from "@/assets/aqla-logo.png";

export const Route = createFileRoute("/try")({
  head: () => ({
    meta: [
      { title: "جرّب أدوات أقلع مجاناً — بدون تسجيل | Aqla" },
      {
        name: "description",
        content:
          "جرّب أدوات أقلع التفاعلية مجاناً وبدون تسجيل: اختبار الإدمان، عدّاد المال، وصوّب على السجائر.",
      },
      { property: "og:title", content: "جرّب أدوات أقلع — مجاناً وبدون تسجيل" },
      {
        property: "og:description",
        content: "اختبار الإدمان • عدّاد المال • صوّب على السجائر — شارك نتيجتك وساعد غيرك.",
      },
    ],
  }),
  scrollRestoration: false,
  component: TryPage,
});

function TryPage() {
  return (
    <div dir="rtl" lang="ar" className="min-h-screen bg-[#EAF3F0]">
      <header className="sticky top-0 z-30 border-b border-[#D5E3DD] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <img src={aqlaLogo} alt="أقلع — Aqla" className="h-9 w-9 rounded-full bg-white object-contain p-1 shadow" />
            <span className="text-sm font-semibold text-[#0b3a25]">أقلع | Aqla</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#0b3a25] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0e4a30] sm:text-sm"
          >
            <span>الدخول للمنصة الكاملة</span>
            <ArrowRight className="h-4 w-4 rotate-180" />
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-4xl px-4 pb-2 pt-8 text-center">
          <p className="mx-auto inline-block rounded-full border border-[#1B6E5F]/25 bg-white px-3 py-1 text-[11px] font-semibold text-[#1B6E5F]">
            مجاناً • بدون تسجيل • خصوصية كاملة
          </p>
          <h1 className="mt-3 text-2xl font-bold text-[#10352F] sm:text-3xl">
            جرّب أدوات أقلع الآن
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[#10352F]/75 sm:text-base">
            ثلاث أدوات تفاعلية تكشف علاقتك بالتدخين خلال دقائق — شارك نتيجتك وساعد غيرك يبدأ رحلته.
          </p>
        </section>

        <KnowYourSmokingSection />

        <section className="mx-auto max-w-3xl px-4 py-10 text-center">
          <div className="rounded-3xl border border-[#1B6E5F]/25 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#10352F] sm:text-xl">جاهز للخطوة الفعلية؟</h2>
            <p className="mt-2 text-sm text-[#10352F]/70">
              ادخل منصة أقلع الكاملة: خطة إقلاع شخصية، دعم فوري، ومجتمع يساندك.
            </p>
            <Link
              to="/"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#1B6E5F] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0e4a30]"
            >
              <span>ابدأ رحلتك مع أقلع</span>
              <ArrowRight className="h-4 w-4 rotate-180" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
