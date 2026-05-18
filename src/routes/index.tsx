import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLang, useLangState, LangContext } from "@/lib/i18n";
import { ShieldAlert, Languages, ArrowRight, Sparkles, Users, Calculator, Gauge, HeartHandshake } from "lucide-react";
import { SocialLinks } from "@/components/SocialLinks";
import { ImpactSection } from "@/components/ImpactSection";
import { VisitTracker } from "@/components/VisitTracker";
import { trackEvent } from "@/lib/track-event";
import aqlaLogo from "@/assets/aqla-logo.png";

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
          <Link to="/" className="flex items-center gap-3">
            <img
              src={aqlaLogo}
              alt="Aqla — أقلع logo"
              className="h-[38px] w-auto object-contain sm:h-12"
            />
            <div className="leading-tight">
              <div className="font-semibold tracking-tight">{t.brandShort}</div>
              <div className="text-[11px] text-muted-foreground">Aqla — أقلع</div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="gap-1.5">
              <Languages className="h-4 w-4" />
              {lang === "ar" ? "English" : "العربية"}
            </Button>
            <Link to="/tools">
              <Button variant="ghost" size="sm">{lang === "ar" ? "أدوات أقلع" : "Tools"}</Button>
            </Link>
            <Link to="/city-challenge">
              <Button variant="ghost" size="sm">{lang === "ar" ? "تحدي المدن" : "City Challenge"}</Button>
            </Link>
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
            {lang === "ar"
              ? <><span>منصة مجانية للجميع، وستبقى مجانية</span><br /><span>بإشراف سعادة الدكتور مالك عبدالملك الذبياني وفريق من الأخصائيين المدربين</span></>
              : "Free physician- and specialist-supervised service"}
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{t.appName}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground sm:text-lg">{t.tagline}</p>
          <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-7 text-muted-foreground/80">
            {lang === "ar"
              ? "في أقلع، نؤمن أن الإقلاع لا يبدأ وحده. نوفر مسارًا مجانيًا لمن يريد فهم اعتماده على التدخين أو النيكوتين، ومسارًا آخر لمن يريد أن يساند غيره في رحلة الإقلاع."
              : "Aqla offers a free pathway for those who want to understand their nicotine or smoking dependence, and another pathway for those who want to support others in their quit journey."}
          </p>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground/70">
            {lang === "ar"
              ? "نسعى من خلال أقلع للمساهمة في تعزيز جودة الحياة والصحة العامة، بما يتماشى مع مستهدفات رؤية المملكة 2030 بقيادة صاحب السمو الملكي الأمير محمد بن سلمان بن عبدالعزيز."
              : "Aligned with Saudi Vision 2030 goals to improve quality of life and public health, and supportive of national efforts to reduce tobacco and nicotine use."}
          </p>
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
                <Link to="/assessment" className="mt-6 block" onClick={() => trackEvent("quit_track_clicked")}>
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
                <Link to="/volunteer" className="mt-6 block" onClick={() => trackEvent("volunteer_track_clicked")}>
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

        {/* Featured interactive tools teaser */}
        <section className="mt-12">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
              {lang === "ar" ? "جرّب أدوات أقلع التفاعلية" : "Try Aqla Interactive Tools"}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              {lang === "ar"
                ? "أدوات بسيطة وممتعة تساعدك على فهم التدخين والنيكوتين بطريقة عملية، وتشجعك على بدء الخطوة الأولى أو مساعدة غيرك."
                : "Simple, engaging tools to help you understand smoking and nicotine, take your first step, or help someone else begin."}
            </p>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Calculator,    ar: "حاسبة تكلفة التدخين",         en: "Smoking Cost Calculator" },
              { icon: Gauge,         ar: "اعرف مستوى اعتمادك خلال دقيقة", en: "1-Minute Dependence Check" },
              { icon: HeartHandshake,ar: "وعد الإقلاع",                 en: "Quit Pledge" },
            ].map((it, i) => (
              <Link key={i} to="/tools" className="block">
                <Card className="group h-full rounded-2xl border-0 p-5 shadow-elegant card-gradient transition-transform hover:-translate-y-0.5">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl quit-gradient text-white shadow-md">
                      <it.icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-semibold">{lang === "ar" ? it.ar : it.en}</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
          <div className="mt-5 text-center">
            <Link to="/tools">
              <Button className="quit-gradient border-0 text-white">
                {lang === "ar" ? "استكشف الأدوات" : "Explore Tools"}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </Link>
          </div>
        </section>

        {/* City Challenge teaser */}
        <section className="mt-12">
          <Card className="overflow-hidden rounded-3xl border-0 p-0 shadow-elegant">
            <div className="quit-gradient p-6 text-white sm:p-8">
              <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium">
                {lang === "ar" ? "خريطة تفاعلية" : "Interactive map"}
              </span>
              <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
                {lang === "ar" ? "تحدي مدن أقلع" : "Aqla City Challenge"}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 opacity-95">
                {lang === "ar"
                  ? "شارك مدينتك في رحلة التغيير. خريطة تفاعلية تعرض التفاعل المجتمعي مع أقلع بشكل إجمالي ودون عرض أي بيانات شخصية."
                  : "Help your city lead the change. An interactive map showing community engagement with Aqla using aggregate, privacy-safe indicators only."}
              </p>
              <div className="mt-5">
                <Link to="/city-challenge">
                  <Button variant="secondary" className="gap-1.5">
                    {lang === "ar" ? "شاهد خريطة التحدي" : "View the challenge map"}
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </section>
        <ImpactSection isAr={lang === "ar"} />
        <VisitTracker path="/" />
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
        <SocialLinks />
        <p className="mt-3">© {t.brandShort} — {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
