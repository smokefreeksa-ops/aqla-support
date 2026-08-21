import { createFileRoute } from "@tanstack/react-router";
import { useLang, useLangState, LangContext } from "@/lib/i18n";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { AqlaCenterChat } from "@/components/AqlaCenterChat";
import { Trophy } from "lucide-react";

export const Route = createFileRoute("/challenge-pathway")({
  head: () => ({
    meta: [
      { title: "مجتمع وتحديات أقلع — Aqla Community & Challenges" },
      {
        name: "description",
        content:
          "مجتمع وتحديات أقلع: للتحديات، الألعاب التوعوية، الهاشتاقات، دعوة الأصدقاء، النقاط، الأوسمة، وبطاقات التوعية.",
      },
    ],
  }),
  component: ChallengePathwayPage,
});

function ChallengePathwayPage() {
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
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1.5 text-[11px] font-medium text-secondary">
            <Trophy className="h-3.5 w-3.5" />
            {isAr ? "المجتمع والتحديات" : "Community & Challenges"}
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {isAr ? "مجتمع وتحديات أقلع" : "Aqla Community & Challenges"}
          </h1>
          <p className="mt-3 max-w-xl text-[14px] leading-7 text-foreground/70">
            {isAr
              ? "للتحديات، الألعاب التوعوية، الهاشتاقات، دعوة الأصدقاء، النقاط، الأوسمة، بطاقات التوعية، وأثر أقلع المجتمعي."
              : "Challenges, awareness games, hashtags, invites, points, medals, awareness cards, and community impact."}
          </p>
        </div>

        <div className="mt-6">
          <AqlaCenterChat centerType="challenge_pathway" />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
