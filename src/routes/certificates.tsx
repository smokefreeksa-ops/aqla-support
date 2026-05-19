import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LangContext, useLang, useLangState } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Award, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/certificates")({
  head: () => ({ meta: [{ title: "الشهادات — Aqla" }] }),
  component: CertificatesPage,
});

function CertificatesPage() {
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
  const [code, setCode] = useState("");
  const [list, setList] = useState<Array<{ id: string; code: string; recipient_name: string | null; issued_at: string }>>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from("certificates")
          .select("id, code, recipient_name, issued_at")
          .order("issued_at", { ascending: false })
          .limit(20);
        if (data) setList(data as never);
      } catch {
        /* ignore — public read may be denied; lookup-by-code still works */
      }
      setLoaded(true);
    })();
  }, []);

  return (
    <div dir={dir} className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <div className={isAr ? "text-right" : ""}>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {isAr ? "الشهادات" : "Certificates"}
          </h1>
          <p className="mt-3 text-[14.5px] leading-7 text-foreground/75">
            {isAr
              ? "أصدر أقلع شهادات توعوية ورمزية لمن أكمل التدريب التطوعي أو شارك في التحديات. الشهادات للتوعية فقط ولا تمنح صلاحية مهنية."
              : "Aqla issues awareness and symbolic certificates for those who complete volunteer training or join challenges. Certificates are for awareness only and confer no professional authority."}
          </p>
        </div>

        <Card className={`mt-6 rounded-2xl p-5 ${isAr ? "text-right" : ""}`}>
          <h2 className="text-lg font-semibold">{isAr ? "التحقق برمز الشهادة" : "Verify by certificate code"}</h2>
          <p className="mt-1 text-[13px] text-foreground/70">
            {isAr ? "أدخل رمز الشهادة لعرض صفحة التحقق الرسمية." : "Enter the certificate code to open the official verification page."}
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const c = code.trim();
              if (c) window.location.href = `/certificate/${encodeURIComponent(c)}`;
            }}
            className="mt-3 flex gap-2"
          >
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={isAr ? "مثال: AQ-XXXX-XXXX" : "e.g. AQ-XXXX-XXXX"}
              className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm"
            />
            <Button type="submit">{isAr ? "تحقق" : "Verify"}</Button>
          </form>
        </Card>

        <Card className={`mt-6 rounded-2xl p-5 ${isAr ? "text-right" : ""}`}>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            {isAr ? "كيف أحصل على شهادة؟" : "How to earn a certificate"}
          </h2>
          <ul className={`mt-3 space-y-2 text-[13.5px] leading-7 text-foreground/75 ${isAr ? "pr-4 list-disc list-inside" : "pl-4 list-disc"}`}>
            <li>{isAr ? "أكمل وحدات التدريب التطوعي السبع في «التعلم والتدريب»." : "Complete the seven volunteer training modules under Learn & Train."}</li>
            <li>{isAr ? "اجتز الاختبار النهائي بنسبة النجاح المطلوبة." : "Pass the final exam with the required score."}</li>
            <li>{isAr ? "تُصدر الشهادة تلقائيًا مع رمز تحقق فريد." : "The certificate is issued automatically with a unique verification code."}</li>
          </ul>
          <div className="mt-4">
            <Link to="/learn-train">
              <Button variant="outline" className="gap-2">
                {isAr ? "ابدأ التدريب" : "Start Training"}
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </Card>

        {loaded && list.length > 0 && (
          <Card className={`mt-6 rounded-2xl p-5 ${isAr ? "text-right" : ""}`}>
            <h2 className="text-lg font-semibold">{isAr ? "أحدث الشهادات الصادرة" : "Recently issued"}</h2>
            <ul className="mt-3 divide-y divide-border/60">
              {list.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 py-2">
                  <span className="truncate text-sm">{c.recipient_name || (isAr ? "متطوع" : "Volunteer")}</span>
                  <Link to="/certificate/$code" params={{ code: c.code }} className="text-xs text-primary underline">
                    {c.code}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
