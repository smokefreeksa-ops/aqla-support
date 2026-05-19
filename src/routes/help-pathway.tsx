import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLang, useLangState, LangContext } from "@/lib/i18n";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { HeartHandshake, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/help-pathway")({
  head: () => ({
    meta: [
      { title: "مسار المساعدة — Aqla Help Pathway" },
      { name: "description", content: "Support someone you care about with a warm, respectful Aqla message — no pressure, no blame." },
    ],
  }),
  component: HelpPathwayPage,
});

const RELATIONS = [
  { id: "friend", ar: "صديق", en: "Friend" },
  { id: "sibling", ar: "أخ أو أخت", en: "Sibling" },
  { id: "parent", ar: "أحد الوالدين", en: "Parent" },
  { id: "spouse", ar: "زوج أو زوجة", en: "Spouse" },
  { id: "student", ar: "طالب", en: "Student" },
  { id: "colleague", ar: "زميل", en: "Colleague" },
  { id: "relative", ar: "قريب", en: "Relative" },
  { id: "someone", ar: "شخص يهمني", en: "Someone I care about" },
];

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
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-[oklch(0.95_0.06_85)] px-3 py-1.5 text-[11px] font-medium text-[oklch(0.45_0.12_75)]">
            <HeartHandshake className="h-3.5 w-3.5" />
            {isAr ? "مسار المساعدة" : "Help Pathway"}
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {isAr ? "أهلًا بك في أقلع" : "Welcome to Aqla"}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-7 text-foreground/70">
            {isAr ? "من الشخص الذي تريد مساعدته اليوم؟" : "Who would you like to support today?"}
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {RELATIONS.map((r) => (
            <Link key={r.id} to="/support-invite">
              <Card className="rounded-2xl border-border/60 p-4 text-center transition hover:-translate-y-0.5 hover:border-[oklch(0.75_0.12_75)]/40 hover:shadow-md">
                <div className="text-[14px] font-medium">{isAr ? r.ar : r.en}</div>
              </Card>
            </Link>
          ))}
        </div>

        <Card className="mt-8 rounded-2xl border-border/60 bg-card/60 p-5 text-center">
          <p className="text-[13px] leading-6 text-foreground/70">
            {isAr
              ? "صمم رسالة دفء برعاية أقلع — تتضمن شعار أقلع ورابط حقيقي، ولا نحفظ رقم الهاتف ولا نعرضه علنًا."
              : "Design a warm Aqla-branded message — with the Aqla logo and a real link. Phone numbers are never stored or shown publicly."}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Link to="/support-invite"><Button size="sm" className="bg-[oklch(0.55_0.13_75)] text-white hover:opacity-95">{isAr ? "أنشئ رسالة دعم" : "Create support card"}</Button></Link>
            <Link to="/learn"><Button size="sm" variant="outline">{isAr ? "تعلّم كيف تساعد" : "Learn how to help"}</Button></Link>
          </div>
        </Card>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          {isAr ? "بإشراف د. مالك الذبياني وفريق من الأخصائيين المدربين." : "Supervised by Dr. Malik AlThubayani and a trained specialist team."}
        </p>
        <div className="mt-4 text-center">
          <Link to="/" className="text-[12px] text-primary hover:underline">
            <ArrowRight className="me-1 inline h-3.5 w-3.5 rtl:rotate-180" />
            {isAr ? "العودة للرئيسية" : "Back home"}
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
