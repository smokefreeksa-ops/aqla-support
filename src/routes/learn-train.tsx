import { createFileRoute } from "@tanstack/react-router";
import { useLang, useLangState, LangContext } from "@/lib/i18n";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { AqlaCenterChat } from "@/components/AqlaCenterChat";
import { GraduationCap } from "lucide-react";

export const Route = createFileRoute("/learn-train")({
  head: () => ({
    meta: [
      { title: "أكاديمية أقلع للتدريب والشهادات — Aqla Academy" },
      {
        name: "description",
        content:
          "أكاديمية أقلع للتدريب والشهادات: مركز تعليمي تفاعلي للتدريب، السيناريوهات، الاختبارات، والشهادات القابلة للتحميل والمشاركة والتحقق.",
      },
    ],
  }),
  component: AcademyPage,
});

function AcademyPage() {
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
        <div className={isAr ? "text-right": "text-left"}>
          <span className="inline-flex items-center gap-2 rounded-full bg-[oklch(0.95_0.04_260)] px-3 py-1.5 text-[11px] font-medium text-[oklch(0.45_0.15_260)]">
            <GraduationCap className="h-3.5 w-3.5" />
            {isAr ? "الأكاديمية": "Academy"}
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {isAr ? "أكاديمية أقلع للتدريب والشهادات": "Aqla Academy for Training & Certification"}
          </h1>
          <p className="mt-3 max-w-xl text-[14px] leading-7 text-foreground/70">
            {isAr
              ? "مركز تعليمي تفاعلي للتدريب على دعم الإقلاع عن التدخين والنيكوتين، مع سيناريوهات، تدريب عملي، اختبار نهائي، وشهادة قابلة للتحميل والمشاركة والتحقق.": "Interactive academy for training in cessation support, with scenarios, hands-on practice, a final exam, and a shareable verifiable certificate."}
          </p>
        </div>

        <div className="mt-6">
          <AqlaCenterChat centerType="learn_train" />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
