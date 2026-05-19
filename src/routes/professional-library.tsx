import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LangContext, useLang, useLangState } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export const Route = createFileRoute("/professional-library")({
  head: () => ({ meta: [{ title: "المكتبة المهنية — Aqla" }] }),
  component: ProfessionalLibrary,
});

function ProfessionalLibrary() {
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
      <main className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <div className={isAr ? "text-right" : ""}>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {isAr ? "المكتبة المهنية" : "Professional Library"}
          </h1>
          <p className="mt-3 text-[14.5px] leading-7 text-foreground/75">
            {isAr
              ? "مكتبة موجّهة للمختصين الصحيين والمتطوعين المعتمدين، تتضمن مراجع الأدوات السريرية المعتمدة (FTND, PSECDI, PS-NDI, HONC, LWDS-11) وإرشادات الاستخدام."
              : "A library for health specialists and certified volunteers — references for validated clinical tools (FTND, PSECDI, PS-NDI, HONC, LWDS-11) and usage guidance."}
          </p>
        </div>

        <Card className={`mt-6 rounded-2xl p-6 ${isAr ? "text-right" : ""}`}>
          <div className="flex items-center gap-2 text-primary">
            <Lock className="h-4 w-4" />
            <span className="text-sm font-semibold">
              {isAr ? "الوصول المهني" : "Professional access"}
            </span>
          </div>
          <p className="mt-3 text-[13.5px] leading-7 text-foreground/75">
            {isAr
              ? "هذه المكتبة متاحة للمختصين الصحيين والمتطوعين الذين أكملوا التدريب. سجّل دخولك من بوابة الموظفين، أو ابدأ التدريب التطوعي للحصول على صلاحية الوصول."
              : "This library is available to health specialists and volunteers who completed training. Sign in via the staff portal, or start volunteer training to gain access."}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/auth">
              <Button>{isAr ? "دخول الموظفين" : "Staff Login"}</Button>
            </Link>
            <Link to="/learn-train">
              <Button variant="outline">{isAr ? "ابدأ التدريب التطوعي" : "Start Volunteer Training"}</Button>
            </Link>
          </div>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
