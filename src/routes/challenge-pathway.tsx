import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLang, useLangState, LangContext } from "@/lib/i18n";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Trophy, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/challenge-pathway")({
  head: () => ({
    meta: [
      { title: "مسار التحديات والأوسمة — Aqla Challenge Pathway" },
      { name: "description", content: "Join Aqla challenges, collect points, earn medals, and unlock certificates." },
    ],
  }),
  component: ChallengePathwayPage,
});

const OPTIONS: Array<{ id: string; ar: string; en: string; to: "/challenges" | "/learn" | "/poster-studio" | "/tools" }> = [
  { id: "quick", ar: "تحدي سريع", en: "Quick challenge", to: "/challenges" },
  { id: "knowledge", ar: "تحدي المعرفة", en: "Knowledge challenge", to: "/challenges" },
  { id: "cities", ar: "تحدي المدن", en: "City challenge", to: "/city-challenge" as never },
  { id: "poster", ar: "أصمم بطاقة توعوية", en: "Design a poster", to: "/poster-studio" },
  { id: "points", ar: "أجمع نقاط وأوسمة", en: "Collect points & medals", to: "/challenges" },
  { id: "28day", ar: "أبدأ تحدي 28 يوم", en: "Start 28-day challenge", to: "/challenges" },
  { id: "train", ar: "أتدرب وأحصل على شهادة", en: "Train & earn certificate", to: "/learn" },
];

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
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1.5 text-[11px] font-medium text-secondary">
            <Trophy className="h-3.5 w-3.5" />
            {isAr ? "مسار التحديات والأوسمة" : "Challenges & Medals"}
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {isAr ? "أهلًا بك في تحديات أقلع" : "Welcome to Aqla Challenges"}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-7 text-foreground/70">
            {isAr ? "كيف تحب تبدأ اليوم؟" : "How would you like to begin today?"}
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {OPTIONS.map((o) => (
            <Link key={o.id} to={o.to}>
              <Card className="rounded-2xl border-border/60 p-4 transition hover:-translate-y-0.5 hover:border-secondary/40 hover:shadow-md">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[15px] font-medium">{isAr ? o.ar : o.en}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground rtl:rotate-180" />
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <p className="mt-8 text-center text-[11px] text-muted-foreground">
          {isAr
            ? "كل شهادة أو بطاقة مشاركة تتضمن شعار أقلع، رابط الموقع، ورمز QR للتحقق."
            : "Every certificate and share card includes the Aqla logo, website URL, and a QR verification link."}
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
