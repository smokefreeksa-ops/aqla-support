import { useState } from "react";
import { Download, Loader2, Copy } from "lucide-react";
import { ClinicalPlanView } from "@/components/clinical/ClinicalPlanView";
import type { ClinicalPlanJSON } from "@/lib/clinical/types";

/**
 * Release 1 plan page body. Renders the EXACT stored immutable plan_json and
 * generates the PDF from that same object — no clinical content is produced here.
 */
export function ClinicalPlanPage({ plan, planToken }: { plan: ClinicalPlanJSON; planToken: string }) {
  const [downloading, setDownloading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function downloadPdf() {
    setDownloading(true);
    try {
      const { ensurePdfRuntime } = await import("@/lib/pdf-runtime");
      await ensurePdfRuntime();
      const [{ pdf }, { ClinicalPlanPdf }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/lib/clinical/clinical-plan-pdf"),
      ]);

      const blob = await pdf(<ClinicalPlanPdf plan={plan} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `aqla-plan-v${plan.plan_version}-${planToken.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch (e) {
      console.error(e);
      setMsg("تعذّر إنشاء ملف PDF حاليًا. حاول مرة أخرى.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div dir="rtl" className="mx-auto max-w-3xl space-y-4 px-4 py-8 text-right">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-[#0b3a25]">خطة أقلع السلوكية — {plan.identity.nickname}</h1>
        <p className="text-xs text-[#4b5a52]">
          الإصدار {plan.plan_version} • أُنشئت {new Date(plan.generated_at).toLocaleDateString("ar-SA")}
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            onClick={downloadPdf}
            disabled={downloading}
            className="inline-flex items-center gap-2 rounded-md bg-[#006C35] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            تحميل خطتي PDF
          </button>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              setMsg("تم نسخ الرابط.");
            }}
            className="inline-flex items-center gap-2 rounded-md border border-[#cfe3d7] bg-white px-4 py-2 text-sm"
          >
            <Copy className="h-4 w-4" /> نسخ الرابط
          </button>
        </div>
        {msg && <p className="pt-1 text-xs text-[#0b3a25]">{msg}</p>}
      </header>

      <ClinicalPlanView plan={plan} />
    </div>
  );
}
