import { createFileRoute, Link } from "@tanstack/react-router";
import { useLang, useLangState, LangContext } from "@/lib/i18n";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { QuitPlanChat } from "@/components/QuitPlanChat";
import { Sparkles, Wind, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/quit-pathway")({
  head: () => ({
    meta: [
      { title: "مركز أقلع الافتراضي لدعم الإقلاع — Aqla Virtual Quit Center" },
      {
        name: "description",
        content:
          "مركز أقلع الافتراضي لدعم الإقلاع: تجربة تفاعلية لفهم الاستخدام، التقييم، بناء الخطة، المتابعة، وطلب الدعم.",
      },
    ],
  }),
  component: QuitPathwayPage,
});

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
        <div className={isAr ? "text-right": "text-left"}>
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-[11px] font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {isAr ? "مركز الإقلاع": "Quit Center"}
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {isAr ? "مركز أقلع الافتراضي لدعم الإقلاع": "Aqla Virtual Quit Center"}
          </h1>
          <p className="mt-3 max-w-xl text-[14px] leading-7 text-foreground/70">
            {isAr
              ? "تجربة تفاعلية تقودك من فهم استخدامك للتدخين أو النيكوتين، إلى التقييم، وبناء الخطة، والمتابعة، وطلب الدعم عند الحاجة.": "An interactive experience: understand your use, take the assessment, build your plan, follow up, and request support."}
          </p>
        </div>

        <div className="mt-6">
          <QuitPlanChat />
        </div>

        <Link
          to="/quit-chat"className="mt-6 block rounded-2xl border border-teal-500/40 bg-gradient-to-br from-teal-950 via-slate-900 to-slate-950 p-5 hover:border-teal-400/80 transition group"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-400 to-digital grid place-content-center shrink-0">
              <MessageCircle className="h-5 w-5 text-slate-950" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold tracking-widest text-teal-300">جديد · NEW</div>
              <div className="font-bold text-white">
                {isAr ? "مساعد أقلع الذكي — محادثة تفاعلية لبناء الخطة": "Aqla Smart Assistant — Interactive Plan Chat"}
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-6">
                {isAr
                  ? "تجربة محادثة سريرية: تقييم Fagerström، قياس الاستعداد، وبناء خطة START خطوة بخطوة.": "Clinical chat: Fagerström test, readiness scale, and step-by-step START plan."}
              </p>
            </div>
            {isAr ? (
              <ChevronLeft className="h-5 w-5 text-teal-300 group-hover:-translate-x-1 transition" />
            ) : (
              <ChevronRight className="h-5 w-5 text-teal-300 group-hover:translate-x-1 transition" />
            )}
          </div>
        </Link>

        <Link
          to="/dtx"className="mt-6 block rounded-2xl border border-cyan-500/40 bg-gradient-to-br from-cyan-950 via-slate-900 to-slate-950 p-5 hover:border-cyan-400/80 transition group"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-600 grid place-content-center shrink-0">
              <Wind className="h-5 w-5 text-slate-950" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold tracking-widest text-cyan-300">جديد · NEW</div>
              <div className="font-bold text-white">
                {isAr ? "وحدة DTx السريرية — رحلة الإقلاع العلاجية الرقمية": "DTx Clinical Module — Digital Therapeutics Journey"}
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-6">
                {isAr
                  ? "الميثاق السيادي، تقييم Fagerström، لوحة القيادة الحية، أدوات HALT، تحدي التنفس، ومجدول NRT.": "Sovereign Pact, Fagerström assessment, live ROI dashboard, HALT tools, breathing challenge, NRT tracker."}
              </p>
            </div>
            {isAr ? (
              <ChevronLeft className="h-5 w-5 text-cyan-300 group-hover:-translate-x-1 transition" />
            ) : (
              <ChevronRight className="h-5 w-5 text-cyan-300 group-hover:translate-x-1 transition" />
            )}
          </div>
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
