import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LangContext, useLang, useLangState } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { trackEvent } from "@/lib/track-event";
import { SITE_URL as SITE } from "@/lib/site";

export const Route = createFileRoute("/share/invite/$code")({
  head: ({ params }) => {
    const url = `${SITE}/share/invite/${params.code}`;
    return {
      meta: [
        { title: "دعوة من صديق — Aqla" },
        { name: "description", content: "تلقيت دعوة شخصية للانضمام إلى منصة أقلع." },
        { property: "og:title", content: "أقلع — دعوة من صديق" },
        { property: "og:description", content: "ابدأ خطوتك الأولى مع أقلع." },
        { property: "og:url", content: url },
      ],
    };
  },
  component: ShareInvitePage,
});

function ShareInvitePage() {
  const ctx = useLangState();
  return (
    <LangContext.Provider value={ctx}>
      <Inner />
    </LangContext.Provider>
  );
}

function Inner() {
  const { code } = Route.useParams();
  const { lang, dir } = useLang();
  const isAr = lang === "ar";

  useEffect(() => {
    trackEvent("invite_landing_open", code);
    try { localStorage.setItem("aqla.ref", code); } catch { /* ignore */ }
  }, [code]);

  return (
    <div dir={dir} className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
        <Card className={`rounded-3xl p-8 text-center ${isAr ? "" : ""}`}>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            {isAr ? "دعوة شخصية" : "Personal invitation"}
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
            {isAr ? "أهلاً بك في أقلع" : "Welcome to Aqla"}
          </h1>
          <p className="mt-4 text-[14.5px] leading-7 text-foreground/75">
            {isAr
              ? "أحد أصدقائك دعاك للاطلاع على منصة أقلع — مساحة آمنة ومجانية لدعم الإقلاع عن التدخين والنيكوتين."
              : "A friend invited you to Aqla — a free and safe space for smoking and nicotine cessation support."}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            {isAr ? "رمز الدعوة: " : "Invite code: "}
            <span className="font-mono">{code}</span>
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/start">
              <Button className="gap-2">
                {isAr ? "ابدأ الآن" : "Start Now"}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="outline">{isAr ? "تعرّف على أقلع" : "Learn about Aqla"}</Button>
            </Link>
          </div>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
