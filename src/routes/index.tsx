import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLang, useLangState, LangContext } from "@/lib/i18n";
import { ShieldAlert, HeartPulse, Languages, ArrowRight, Sparkles, Users } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aqla — Smoking & Nicotine Cessation Support" },
      {
        name: "description",
        content:
          "Free physician-led bilingual nicotine cessation support and volunteer training program in Saudi Arabia.",
      },
      { property: "og:title", content: "Aqla — Cessation Support & Volunteer Program" },
      { property: "og:description", content: "Free physician-led cessation support and volunteer training." },
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
      <header className="border-b bg-card/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-2xl hero-gradient text-primary-foreground shadow-elegant">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="font-semibold tracking-tight">{t.brandShort}</div>
              <div className="text-[11px] text-muted-foreground">Aqla — أقلع</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="gap-1.5">
              <Languages className="h-4 w-4" />
              {lang === "ar" ? "English" : "العربية"}
            </Button>
            <Link to="/about">
              <Button variant="ghost" size="sm">{lang === "ar" ? "عن أقلع" : "About"}</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="sm">{t.adminLogin}</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <section className="text-center">
          <span className="inline-block rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
            {lang === "ar" ? "خدمة مجانية بإشراف طبيب" : "Free physician-led service"}
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{t.appName}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground sm:text-lg">{t.tagline}</p>
        </section>

        {/* Track selection */}
        <section className="mt-12">
          <h2 className="text-center text-lg font-semibold text-foreground/80">{t.chooseTrackHeader}</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {/* Quit Track */}
            <Card className="group relative overflow-hidden rounded-3xl border-0 p-0 shadow-elegant transition-transform hover:-translate-y-0.5">
              <div className="quit-gradient-soft p-6 sm:p-7">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl quit-gradient text-white shadow-md">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold">{t.quitTrackTitle}</h3>
                </div>
                <p className="mt-4 text-sm leading-6 text-foreground/75">{t.quitTrackDesc}</p>
                <Link to="/assessment" className="mt-6 block">
                  <Button className="w-full quit-gradient border-0 text-white hover:opacity-95">
                    {t.quitTrackBtn}
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Volunteer Track */}
            <Card className="group relative overflow-hidden rounded-3xl border-0 p-0 shadow-elegant transition-transform hover:-translate-y-0.5">
              <div className="volunteer-gradient-soft p-6 sm:p-7">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl volunteer-gradient text-white shadow-md">
                    <Users className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold">{t.volunteerTrackTitle}</h3>
                </div>
                <p className="mt-4 text-sm leading-6 text-foreground/75">{t.volunteerTrackDesc}</p>
                <Link to="/volunteer" className="mt-6 block">
                  <Button className="w-full volunteer-gradient border-0 text-white hover:opacity-95">
                    {t.volunteerTrackBtn}
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </section>

        {/* Why Aqla? */}
        <section className="mt-12">
          <Card className="rounded-3xl border-0 p-6 sm:p-8 shadow-elegant card-gradient">
            <h2 className="text-2xl font-semibold tracking-tight text-primary">
              {lang === "ar" ? "لماذا أقلع؟" : "Why Aqla?"}
            </h2>
            <p className="mt-3 text-[15px] leading-8 text-foreground/80">
              {lang === "ar"
                ? "أقلع مبادرة مجتمعية مجانية صُممت لتقديم مسار واضح وسهل الوصول للراغبين في فهم مستوى اعتمادهم على التدخين أو النيكوتين، واختيار الخطوة المناسبة لهم. تجمع المنصة بين التقييم الرقمي، التوجيه حسب مستوى الاحتياج، والمتابعة المنظمة، مع مسار تدريبي للمتطوعين لدعم التوعية والمساندة المجتمعية."
                : "Aqla is a free community initiative designed to give people a clear, accessible pathway to understand their smoking or nicotine dependence and choose the right next step. The platform combines digital assessment, support routing, structured follow-up, and a volunteer training pathway to strengthen community awareness and support."}
            </p>
            <div className="mt-4">
              <Link to="/about">
                <Button variant="outline" size="sm" className="gap-1.5">
                  {lang === "ar" ? "اعرف المزيد عن أقلع" : "Learn more about Aqla"}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Button>
              </Link>
            </div>
          </Card>
        </section>

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          <Card className="rounded-2xl border-l-4 border-l-secondary p-4 card-gradient">
            <p className="text-sm text-muted-foreground">{t.disclaimer}</p>
          </Card>
          <Card className="rounded-2xl border-l-4 border-l-destructive p-4">
            <div className="flex gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              <p className="text-sm">{t.emergency}</p>
            </div>
          </Card>
        </div>
      </main>

      <footer className="mx-auto max-w-6xl px-4 py-8 text-center text-xs text-muted-foreground">
        © {t.brandShort} — {new Date().getFullYear()}
      </footer>
    </div>
  );
}
