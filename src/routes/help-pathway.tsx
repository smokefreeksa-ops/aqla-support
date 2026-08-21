import { createFileRoute } from "@tanstack/react-router";
import { useLang, useLangState, LangContext } from "@/lib/i18n";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { AqlaCenterChat } from "@/components/AqlaCenterChat";
import { HeartHandshake } from "lucide-react";

export const Route = createFileRoute("/help-pathway")({
  head: () => ({
    meta: [
      { title: "مسار أقلع لمساعدة شخص يهمك — Aqla Help Pathway" },
      {
        name: "description",
        content:
          "مسار أقلع لمساعدة شخص يهمك: ادعم صديقًا أو قريبًا أو زميلًا برسالة محترمة وآمنة، دون ضغط أو لوم.",
      },
    ],
  }),
  component: HelpPathwayPage,
});

function HelpPathwayPage() {
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
          <span className="inline-flex items-center gap-2 rounded-full bg-[oklch(0.95_0.06_85)] px-3 py-1.5 text-[11px] font-medium text-[oklch(0.45_0.12_75)]">
            <HeartHandshake className="h-3.5 w-3.5" />
            {isAr ? "مسار المساعدة": "Help Pathway"}
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {isAr ? "مسار أقلع لمساعدة شخص يهمك": "Aqla Help Pathway"}
          </h1>
          <p className="mt-3 max-w-xl text-[14px] leading-7 text-foreground/70">
            {isAr
              ? "لمن يريد دعم صديق، قريب، طالب، زميل، أو شخص يهتم لأمره برسالة أو بطاقة دعم محترمة وآمنة.": "Support a friend, relative, student, colleague — with a respectful, safe message of support."}
          </p>
        </div>

        <div className="mt-6">
          <AqlaCenterChat centerType="help_pathway" />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
