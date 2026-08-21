import { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LangContext, useLang, useLangState } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { BackButton } from "@/components/BackButton";

type Section = { heading: string; body: ReactNode };

export interface SimpleContentPageProps {
  titleAr: string;
  titleEn: string;
  introAr?: string;
  introEn?: string;
  sectionsAr?: Section[];
  sectionsEn?: Section[];
  ctaAr?: { label: string; to: string };
  ctaEn?: { label: string; to: string };
  /** Parent route used when there is no in-app history. */
  backTo?: string;
  backLabelAr?: string;
  backLabelEn?: string;
}

export function SimpleContentPage(props: SimpleContentPageProps) {
  const ctx = useLangState();
  return (
    <LangContext.Provider value={ctx}>
      <SimplePageInner {...props} />
    </LangContext.Provider>
  );
}

function SimplePageInner({
  titleAr,
  titleEn,
  introAr,
  introEn,
  sectionsAr,
  sectionsEn,
  ctaAr,
  ctaEn,
  backTo = "/",
  backLabelAr = "الرئيسية",
  backLabelEn = "Home",
}: SimpleContentPageProps) {
  const { lang, dir } = useLang();
  const isAr = lang === "ar";
  const title = isAr ? titleAr : titleEn;
  const intro = isAr ? introAr : introEn;
  const sections = isAr ? sectionsAr : sectionsEn;
  const cta = isAr ? ctaAr : ctaEn;

  return (
    <div dir={dir} className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <div className={`mb-6 flex ${isAr ? "justify-end": "justify-start"}`}>
          <BackButton fallback={backTo} labelAr={backLabelAr} labelEn={backLabelEn} />
        </div>
        <h1 className={`text-3xl font-bold tracking-tight sm:text-4xl ${isAr ? "text-right": ""}`}>{title}</h1>
        {intro && (
          <p className={`mt-4 text-[14.5px] leading-7 text-foreground/75 ${isAr ? "text-right": ""}`}>{intro}</p>
        )}

        {sections && sections.length > 0 && (
          <div className="mt-8 space-y-5">
            {sections.map((s, i) => (
              <Card key={i} className={`rounded-2xl border-border/60 p-5 sm:p-6 ${isAr ? "text-right": ""}`}>
                <h2 className="text-lg font-semibold tracking-tight">{s.heading}</h2>
                <div className="mt-3 text-[13.5px] leading-7 text-foreground/75">{s.body}</div>
              </Card>
            ))}
          </div>
        )}

        {cta && (
          <div className={`mt-10 flex ${isAr ? "justify-end": "justify-start"}`}>
            <Link
              to={cta.to}
              className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {cta.label}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
