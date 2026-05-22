import { createFileRoute } from "@tanstack/react-router";
import { useLang, useLangState, LangContext } from "@/lib/i18n";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { QuitPlanChat } from "@/components/QuitPlanChat";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/quit-pathway")({
  head: () => ({
    meta: [
      { title: "مركز أقلع الافتراضي لدعم الإقلاع — Aqla Virtual Quit Center" },
      {
        name: "description",
        content:
          "مركز أقلع الافتراضي لدعم الإقلاع: تجربة تفاعلية لفهم الاستخدام، التقييم، بناء الخطة، المتابعة، وطلب الدعم.",
      },
    ],
  }),
  component: QuitPathwayPage,
});

function QuitPathwayPage() {
  const ctx = useLangState();
  return (
    <LangContext.Provider value={ctx}>
      <Inner />
    </LangContext.Provider>
  );
}

function Inner() {
  const { lang, dir } = useLang();
  const isAr = lang === "ar";
  return (
    <div dir={dir} className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <div className={isAr ? "text-right" : "text-left"}>
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-[11px] font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {isAr ? "مركز الإقلاع" : "Quit Center"}
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {isAr ? "مركز أقلع الافتراضي لدعم الإقلاع" : "Aqla Virtual Quit Center"}
          </h1>
          <p className="mt-3 max-w-xl text-[14px] leading-7 text-foreground/70">
            {isAr
              ? "تجربة تفاعلية تقودك من فهم استخدامك للتدخين أو النيكوتين، إلى التقييم، وبناء الخطة، والمتابعة، وطلب الدعم عند الحاجة."
              : "An interactive experience: understand your use, take the assessment, build your plan, follow up, and request support."}
          </p>
        </div>

        <div className="mt-6">
          <QuitPlanChat />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
