import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import KnowYourSmokingSection from "@/components/KnowYourSmokingSection";
import aqlaLogo from "@/assets/aqla-logo.png";
import { BackButton } from "@/components/BackButton";

export const Route = createFileRoute("/try/shoot")({
  head: () => ({
    meta: [
      { title: "تحدي كسر عادة التدخين — لعبة أقلع | Aqla" },
      {
        name: "description",
        content:
          "٣٠ ثانية لتحدي كسر عادة التدخين — صوّب على السجائر المولّعة وحطّمها. جرّب لعبة أقلع التفاعلية بدون تسجيل.",
      },
      { property: "og:title", content: "تحدي كسر عادة التدخين — لعبة أقلع" },
      {
        property: "og:description",
        content: "٣٠ ثانية. صوّب. اكسر أكثر من الزجاج. جرّبها الآن بدون تسجيل.",
      },
    ],
  }),
  component: ShootPage,
});

function ShootPage() {
  return (
    <div dir="rtl"lang="ar"className="min-h-screen bg-[#EAF3F0]">
      <header className="sticky top-0 z-30 border-b border-[#D5E3DD] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/"className="flex items-center gap-2">
            <img
              src={aqlaLogo}
              alt="أقلع — Aqla"className="h-9 w-9 rounded-full bg-white object-contain p-1 shadow"
            />
            <span className="text-sm font-semibold text-[#0b3a25]">أقلع | Aqla</span>
          </Link>
          <Link
            to="/try"className="inline-flex items-center gap-1.5 rounded-full bg-[#0b3a25] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0e4a30] sm:text-sm"
          >
            <span>كل أدوات أقلع</span>
            <ArrowRight className="h-4 w-4 rotate-180" />
          </Link>
        </div>
      </header>

      <main>
        <div className="mb-5">
          <BackButton fallback="/try"labelAr="التجربة"labelEn="Try Aqla" />
        </div>
        <KnowYourSmokingSection standaloneTool={4} />
      </main>
    </div>
  );
}
