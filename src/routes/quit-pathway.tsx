import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLang, useLangState, LangContext } from "@/lib/i18n";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/quit-pathway")({
  head: () => ({
    meta: [
      { title: "مسار الإقلاع — Aqla Quit Pathway" },
      {
        name: "description",
        content:
          "Aqla quit pathway — choose your product and answer a short validated screening (FTND, PSECDI, HONC, LWDS-11) to guide your next step.",
      },
    ],
  }),
  component: QuitPathwayPage,
});

// Each product routes to a different validated screening instrument.
// We deliberately do NOT use FTND for vape, pouches, or shisha.
const PRODUCTS: Array<{
  id: string;
  ar: string;
  en: string;
  toolAr: string;
  toolEn: string;
  toolKey: string;
}> = [
  {
    id: "cigarettes",
    ar: "السجائر",
    en: "Cigarettes",
    toolAr: "اختبار فاجرستروم للاعتماد على النيكوتين",
    toolEn: "Fagerström Test for Nicotine Dependence (FTND)",
    toolKey: "ftnd_cigarettes",
  },
  {
    id: "vape",
    ar: "الفيب أو السجائر الإلكترونية",
    en: "Vape / e-cigarettes",
    toolAr: "مؤشر بنسلفانيا للاعتماد على السجائر الإلكترونية",
    toolEn: "Penn State Electronic Cigarette Dependence Index (PSECDI)",
    toolKey: "ps_ecdi_vape",
  },
  {
    id: "pouches",
    ar: "أكياس النيكوتين",
    en: "Nicotine pouches",
    toolAr: "مؤشر بنسلفانيا للاعتماد على منتجات النيكوتين (مكيّف)",
    toolEn: "Penn State Nicotine Dependence Index (oral/pouch adapted)",
    toolKey: "ps_ndi_all_nicotine",
  },
  {
    id: "shisha",
    ar: "الشيشة أو المعسل",
    en: "Shisha / waterpipe",
    toolAr: "مقياس الاعتماد على الشيشة والمعسل",
    toolEn: "Lebanon Waterpipe Dependence Scale (LWDS-11)",
    toolKey: "lwds11_waterpipe",
  },
  {
    id: "multi",
    ar: "أكثر من منتج",
    en: "More than one product",
    toolAr: "فحص متعدد المنتجات + توجيه للمراجعة عند الحاجة",
    toolEn: "Multi-product screening with clinician review flag",
    toolKey: "ftnd_cigarettes",
  },
  {
    id: "unsure",
    ar: "لست متأكدًا",
    en: "Not sure",
    toolAr: "توضيح سريع للمنتج ثم توجيه للأداة المناسبة",
    toolEn: "Short clarification, then route to the right tool",
    toolKey: "ftnd_cigarettes",
  },
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
        <div className={isAr ? "text-right" : "text-left"}>
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-[11px] font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {isAr ? "مسار الإقلاع" : "Quit Pathway"}
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {isAr ? "أهلًا بك في أقلع" : "Welcome to Aqla"}
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-7 text-foreground/70">
            {isAr
              ? "نبدأ بسؤال واحد: ما المنتج الذي تستخدمه غالبًا؟ نوجّهك بعدها إلى أداة فحص معتمدة مناسبة لمنتجك."
              : "We start with one question: which product do you mostly use? We then route you to a validated screening tool matched to that product."}
          </p>
          <p className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-foreground/60">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            {isAr
              ? "أدوات تقييم معتمدة — ليست تشخيصًا طبيًا."
              : "Validated screening tools — not a medical diagnosis."}
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {PRODUCTS.map((p) => (
            <Card
              key={p.id}
              className="rounded-2xl border-border/60 p-4 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className={`flex items-start justify-between gap-3 ${isAr ? "text-right" : "text-left"}`}>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold leading-6">
                    {isAr ? p.ar : p.en}
                  </p>
                  <p className="mt-1 text-[12px] leading-5 text-foreground/65">
                    {isAr ? p.toolAr : p.toolEn}
                  </p>
                </div>
                <Link to="/assessment" search={{ tool: p.toolKey, product: p.id } as never}>
                  <Button size="sm" variant="ghost" className="shrink-0 gap-1 text-primary">
                    {isAr ? "ابدأ" : "Start"}
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        <Card className={`mt-8 rounded-2xl border-border/60 bg-card/60 p-5 ${isAr ? "text-right" : "text-left"}`}>
          <p className="text-[13px] leading-6 text-foreground/70">
            {isAr
              ? "للمراهقين أو في حالات صعوبة التوقف رغم الاستخدام المنخفض، نستخدم قائمة فقدان التحكم مع النيكوتين (HONC). جميع النتائج تقديرية وليست تشخيصًا."
              : "For adolescents or anyone reporting difficulty stopping despite low use, we use the Hooked on Nicotine Checklist (HONC). All results are screening estimates, not diagnoses."}
          </p>
          <div className={`mt-4 flex flex-wrap gap-2 ${isAr ? "justify-end" : "justify-start"}`}>
            <Link to="/assessment">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                {isAr ? "ابدأ التقييم الآن" : "Start assessment"}
              </Button>
            </Link>
            <Link to="/request-support">
              <Button size="sm" variant="outline">
                {isAr ? "أدوات الدعم" : "Support tools"}
              </Button>
            </Link>
          </div>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
