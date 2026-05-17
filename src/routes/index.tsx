import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLang, useLangState, LangContext } from "@/lib/i18n";
import { ShieldAlert, HeartPulse, Languages, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "La-tatten — Smoking & Nicotine Cessation Support" },
      {
        name: "description",
        content:
          "Free physician-led bilingual nicotine cessation triage and support pathway in Saudi Arabia.",
      },
      { property: "og:title", content: "La-tatten — Cessation Support" },
      { property: "og:description", content: "Free physician-led cessation support." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const ctx = useLangState();
  return (
    <LangContext.Provider value={ctx}>
      <Inner />
    </LangContext.Provider>
  );
}

function Inner() {
  const { t, lang, setLang, dir } = useLang();
  return (
    <div dir={dir} className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl hero-gradient text-primary-foreground">
              <HeartPulse className="h-5 w-5" />
            </div>
            <span className="font-semibold tracking-tight">La-tatten</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="gap-1.5"
            >
              <Languages className="h-4 w-4" />
              {lang === "ar" ? "English" : "العربية"}
            </Button>
            <Link to="/login">
              <Button variant="outline" size="sm">{t.adminLogin}</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <section className="text-center">
          <span className="inline-block rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
            {lang === "ar" ? "خدمة مجانية بإشراف طبيب" : "Free physician-led service"}
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{t.appName}</h1>
          <p className="mt-4 text-muted-foreground sm:text-lg">{t.tagline}</p>

          <div className="mt-8">
            <Link to="/assessment">
              <Button size="lg" className="gap-2 text-base">
                {t.startBtn}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">{t.takesMinutes}</p>
          </div>
        </section>

        <Card className="mt-10 border-l-4 border-l-secondary p-4 card-gradient">
          <p className="text-sm text-muted-foreground">{t.disclaimer}</p>
        </Card>

        <Card className="mt-4 border-l-4 border-l-destructive p-4">
          <div className="flex gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <p className="text-sm">{t.emergency}</p>
          </div>
        </Card>
      </main>

      <footer className="mx-auto max-w-5xl px-4 py-8 text-center text-xs text-muted-foreground">
        © La-tatten — {new Date().getFullYear()}
      </footer>
    </div>
  );
}
