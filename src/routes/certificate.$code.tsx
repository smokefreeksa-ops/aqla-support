import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { verifyCertificate } from "@/lib/training.functions";
import { ShieldCheck, Download, Share2, Link as LinkIcon, BadgeCheck, XCircle } from "lucide-react";
import { SITE_URL } from "@/lib/site";
import { BackButton } from "@/components/BackButton";

export const Route = createFileRoute("/certificate/$code")({
  head: ({ params }) => ({
    meta: [
      { title: `Aqla Certificate ${params.code}` },
      { name: "description", content: "Verify an Aqla Volunteer Training certificate." },
    ],
  }),
  component: CertificatePage,
});

function CertificatePage() {
  const { code } = useParams({ from: "/certificate/$code" });
  const verifyFn = useServerFn(verifyCertificate);
  const { data, isLoading } = useQuery({
    queryKey: ["cert", code],
    queryFn: () => verifyFn({ data: { code } }),
  });

  const verifyUrl = typeof window !== "undefined"? `${window.location.origin}/certificate/${code}` : "";
  const shareText = `I completed the Aqla Volunteer Smoking and Nicotine Cessation Support Training. Verify: ${verifyUrl}`;

  async function copyLink() {
    try { await navigator.clipboard.writeText(verifyUrl); toast.success("Link copied"); } catch { /* noop */ }
  }
  function shareOut() {
    if (navigator.share) navigator.share({ title: "Aqla Training Certificate", text: shareText, url: verifyUrl }).catch(() => {});
    else copyLink();
  }

  if (isLoading) return <div className="p-10 text-center text-muted-foreground">Loading…</div>;

  const found = data?.found;
  const valid = data?.is_valid;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-emerald-50/30 print:bg-white">
      <header className="border-b bg-card/70 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/"className="font-semibold text-primary">Aqla — أقلع</Link>
          <Link to="/training"><Button variant="outline"size="sm">Training</Button></Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-5">
          <BackButton fallback="/certificates"labelAr="الشهادات"labelEn="Certificates" />
        </div>
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
                <div className="text-2xl font-bold tracking-tight">Aqla — أقلع</div>
                <div className="text-xs opacity-80">Smoking & Nicotine Cessation Support Program · برنامج دعم الإقلاع</div>
              </div>
              <div className="p-8 sm:p-12 text-center space-y-5">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-emerald-900">شهادة إتمام تدريب</h1>
                  <h2 className="text-2xl font-semibold text-emerald-800">Certificate of Training Completion</h2>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">تُمنح هذه الشهادة إلى · This certificate is awarded to</div>
                  <div className="text-3xl sm:text-4xl font-bold text-stone-900 py-2 border-y border-amber-400/50 mx-auto max-w-xl">
                    {data?.full_name}
                  </div>
                </div>

                <div className="text-sm sm:text-base text-stone-700 max-w-2xl mx-auto leading-relaxed">
                  <p>لإتمامه/إتمامها بنجاح برنامج تدريب متطوعي أقلع لدعم الإقلاع عن التدخين والنيكوتين</p>
                  <p className="mt-1">For successfully completing the Aqla Volunteer Smoking and Nicotine Cessation Support Training</p>
                </div>

                <div className="text-xs sm:text-sm text-stone-600">
                  <div>٧ وحدات تدريبية • ٤٩ سؤالًا معرفيًا • سيناريوهات تطبيقية</div>
                  <div>7 Training Modules • 49 Knowledge Questions • Applied Case Scenarios</div>
                </div>

                <div className="flex flex-wrap justify-around gap-4 pt-3 text-sm">
                  <div><div className="text-muted-foreground">Score · النتيجة</div><div className="text-lg font-bold">{data?.overall_score}%</div></div>
                  <div><div className="text-muted-foreground">Issued · التاريخ</div><div className="text-lg font-bold">{data?.issued_at ? new Date(data.issued_at).toLocaleDateString() : "—"}</div></div>
                  <div><div className="text-muted-foreground">ID · الرقم</div><div className="text-lg font-bold font-mono">{data?.certificate_code}</div></div>
                </div>

                <div className="pt-4 text-xs text-stone-600 max-w-2xl mx-auto leading-relaxed">
                  <p>بإشراف سعادة الدكتور مالك عبدالملك الذبياني وفريق من الأخصائيين المدربين</p>
                  <p>Supervised by Dr. Malik Abdulmalik Althobiani and a team of trained specialists</p>
                </div>

                <div className="flex items-center justify-center gap-2 pt-2">
                  {valid ? (
                    <span className="inline-flex items-center gap-1 text-xs rounded-full bg-green-100 text-green-800 px-2 py-1"><BadgeCheck className="h-3.5 w-3.5" /> Valid · سارية</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs rounded-full bg-red-100 text-red-800 px-2 py-1"><XCircle className="h-3.5 w-3.5" /> Revoked · ملغاة</span>
                  )}
                </div>

                <div className="border-t pt-4 text-[11px] text-stone-500 max-w-2xl mx-auto leading-snug">
                  <p>تؤكد هذه الشهادة إتمام تدريب تعليمي للتوعية والمساندة المجتمعية، ولا تخوّل حاملها تقديم تشخيص أو علاج أو وصف أدوية أو بدائل نيكوتين.</p>
                  <p className="mt-1">This certificate confirms completion of educational training for awareness and community support. It does not authorize diagnosis, treatment, prescribing, or recommending nicotine replacement products.</p>
                </div>

                <div className="flex items-center justify-between pt-4 text-xs text-stone-500 border-t">
                  <div>Verify: {SITE_URL.replace(/^https?:\/\//, "")}/certificate/{code}</div>
                  <div className="text-right">
                    <img
                      alt="QR"
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(verifyUrl)}`}
                      className="h-20 w-20"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <div className="mt-4 flex flex-wrap gap-2 justify-center print:hidden">
              <Button onClick={() => window.print()}><Download className="me-2 h-4 w-4" />Download / Print</Button>
              <Button variant="outline"onClick={shareOut}><Share2 className="me-2 h-4 w-4" />Share</Button>
              <Button variant="outline"onClick={copyLink}><LinkIcon className="me-2 h-4 w-4" />Copy verification link</Button>
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
