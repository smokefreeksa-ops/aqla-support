import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLang, useLangState, LangContext } from "@/lib/i18n";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Sparkles, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/quit-pathway")({
  head: () => ({
    meta: [
      { title: "مسار الإقلاع — Aqla Quit Pathway" },
      { name: "description", content: "Start your Aqla quit pathway — a guided AI conversation that helps you understand your dependence and choose the right next step." },
    ],
  }),
  component: QuitPathwayPage,
});

const PRODUCTS = [
  { id: "cigarettes", ar: "السجائر", en: "Cigarettes" },
  { id: "vape", ar: "الفيب", en: "Vape" },
  { id: "pouches", ar: "أكياس النيكوتين", en: "Nicotine pouches" },
  { id: "shisha", ar: "الشيشة أو المعسل", en: "Shisha / mu'assel" },
  { id: "multi", ar: "أكثر من منتج", en: "More than one product" },
  { id: "unsure", ar: "لست متأكدًا", en: "Not sure" },
];

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
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-[11px] font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {isAr ? "مسار الإقلاع" : "Quit Pathway"}
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {isAr ? "أهلًا بك في أقلع" : "Welcome to Aqla"}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-7 text-foreground/70">
            {isAr
              ? "خلينا نبدأ بسؤال بسيط: أي منتج تستخدم غالبًا؟"
              : "Let's start with one simple question: which product do you mostly use?"}
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {PRODUCTS.map((p) => (
            <Card key={p.id} className="rounded-2xl border-border/60 p-4 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[15px] font-medium">{isAr ? p.ar : p.en}</span>
                <Link to="/assessment">
                  <Button size="sm" variant="ghost" className="gap-1 text-primary">
                    {isAr ? "ابدأ" : "Start"}
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-8 rounded-2xl border-border/60 bg-card/60 p-5 text-center">
          <p className="text-[13px] leading-6 text-foreground/70">
            {isAr
              ? "قريبًا: محادثة ذكية تأخذك خطوة بخطوة، تبني خطتك، وتفعّل مدرب اللحظة عند الحاجة."
              : "Coming soon: an AI-guided conversation that builds your plan and activates the Moment Coach when needed."}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Link to="/assessment"><Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">{isAr ? "ابدأ التقييم الآن" : "Start assessment"}</Button></Link>
            <Link to="/tools"><Button size="sm" variant="outline">{isAr ? "أدوات الدعم" : "Support tools"}</Button></Link>
          </div>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
