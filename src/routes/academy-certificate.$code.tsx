import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { verifyAcademyCertificate } from "@/lib/academy-certificate.functions";
import { BadgeCheck, Download, Share2, Link as LinkIcon, ShieldCheck, XCircle } from "lucide-react";

export const Route = createFileRoute("/academy-certificate/$code")({
  head: ({ params }) => ({
    meta: [
      { title: `Aqla Academy Certificate ${params.code}` },
      { name: "description", content: "Verify an Aqla Academy module certificate." },
      { property: "og:title", content: `Aqla Academy Certificate ${params.code}` },
      { property: "og:description", content: "Verify an Aqla Academy module certificate." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AcademyCertPage,
});

function AcademyCertPage() {
  const { code } = useParams({ from: "/academy-certificate/$code" });
  const verifyFn = useServerFn(verifyAcademyCertificate);
  const { data, isLoading } = useQuery({
    queryKey: ["academy-cert", code],
    queryFn: () => verifyFn({ data: { code } }),
  });

  const verifyUrl = typeof window !== "undefined" ? `${window.location.origin}/academy-certificate/${code}` : "";
  const shareText = `أتممت وحدة من أكاديمية أقلع بنجاح — I completed an Aqla Academy module. Verify: ${verifyUrl}`;
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(verifyUrl); toast.success("Link copied"); } catch { /* noop */ }
  };
  const shareOut = () => {
    if (typeof navigator !== "undefined" && (navigator as Navigator).share) {
      (navigator as Navigator).share!({ title: "Aqla Academy Certificate", text: shareText, url: verifyUrl }).catch(() => {});
    } else copyLink();
  };

  if (isLoading) return <div className="p-10 text-center text-muted-foreground">Loading…</div>;

  const d = data as Record<string, unknown> | undefined;
  const found = d?.found as boolean | undefined;
  const valid = d?.is_valid as boolean | undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-emerald-50/30 print:bg-white">
      <header className="border-b bg-card/70 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="font-semibold text-primary">Aqla — أقلع</Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">
        {!found ? (
          <Card className="p-8 text-center">
            <XCircle className="mx-auto h-10 w-10 text-red-500" />
            <h1 className="mt-3 text-2xl font-bold">Certificate not found</h1>
            <p className="text-muted-foreground mt-1">Code: <span className="font-mono">{code}</span></p>
          </Card>
        ) : (
          <>
            <Card className="overflow-hidden border-4 border-emerald-700 bg-[#fffdf6] print:border-2">
              <div className="border-b-4 border-amber-600/60 bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800 text-amber-50 px-8 py-4 text-center">
                <div className="text-2xl font-bold tracking-tight">Aqla Academy — أكاديمية أقلع</div>
                <div className="text-xs opacity-80">Evidence-based education · WHO · CDC</div>
              </div>
              <div className="p-8 sm:p-12 text-center space-y-5">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-emerald-900">شهادة أكاديمية أقلع</h1>
                  <h2 className="text-2xl font-semibold text-emerald-800">Aqla Academy Certificate</h2>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">تُمنح هذه الشهادة إلى · This certificate is awarded to</div>
                  <div className="text-3xl sm:text-4xl font-bold text-stone-900 py-2 border-y border-amber-400/50 mx-auto max-w-xl">
                    {String(d?.full_name ?? "")}
                  </div>
                </div>
                <div className="text-sm sm:text-base text-stone-700 max-w-2xl mx-auto leading-relaxed">
                  <p>لإتمامه/إتمامها بنجاح وحدة تعليمية معتمدة على مصادر منظمة الصحة العالمية ومراكز مكافحة الأمراض الأمريكية</p>
                  <p className="mt-1">For successfully completing an evidence-based module sourced from WHO and U.S. CDC guidance</p>
                </div>
                <div className="text-xs sm:text-sm text-stone-600">
                  <div>الوحدة · Module: <span className="font-mono">{String(d?.module_slug ?? "")}</span></div>
                </div>
                <div className="flex flex-wrap justify-around gap-4 pt-3 text-sm">
                  <div><div className="text-muted-foreground">Score · النتيجة</div><div className="text-lg font-bold">{String(d?.overall_score ?? "")}%</div></div>
                  <div><div className="text-muted-foreground">Issued · التاريخ</div><div className="text-lg font-bold">{d?.issued_at ? new Date(String(d.issued_at)).toLocaleDateString() : "—"}</div></div>
                  <div><div className="text-muted-foreground">ID · الرقم</div><div className="text-lg font-bold font-mono">{String(d?.certificate_code ?? "")}</div></div>
                </div>
                <div className="flex items-center justify-center gap-2 pt-2">
                  {valid ? (
                    <span className="inline-flex items-center gap-1 text-xs rounded-full bg-green-100 text-green-800 px-2 py-1"><BadgeCheck className="h-3.5 w-3.5" /> Valid · سارية</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs rounded-full bg-red-100 text-red-800 px-2 py-1"><XCircle className="h-3.5 w-3.5" /> Revoked · ملغاة</span>
                  )}
                </div>
                <div className="border-t pt-4 text-[11px] text-stone-500 max-w-2xl mx-auto leading-snug">
                  <p>تؤكد هذه الشهادة إتمام محتوى تعليمي للتوعية، ولا تخوّل حاملها تقديم تشخيص أو علاج أو وصف أدوية.</p>
                  <p className="mt-1">This certificate confirms completion of educational awareness content. It does not authorize diagnosis, treatment, or prescribing.</p>
                </div>
                <div className="flex items-center justify-between pt-4 text-xs text-stone-500 border-t">
                  <div>Verify: aqla-support.lovable.app/academy-certificate/{code}</div>
                  <div className="text-right">
                    <img alt="QR" src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(verifyUrl)}`} className="h-20 w-20" />
                  </div>
                </div>
              </div>
            </Card>
            <div className="mt-4 flex flex-wrap gap-2 justify-center print:hidden">
              <Button onClick={() => window.print()}><Download className="me-2 h-4 w-4" />Download / Print</Button>
              <Button variant="outline" onClick={shareOut}><Share2 className="me-2 h-4 w-4" />Share</Button>
              <Button variant="outline" onClick={copyLink}><LinkIcon className="me-2 h-4 w-4" />Copy verification link</Button>
            </div>
            <div className="mt-3 text-center text-xs text-muted-foreground print:hidden flex items-center justify-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Verified via Aqla certificate registry
            </div>
          </>
        )}
      </main>
    </div>
  );
}
