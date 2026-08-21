import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getQuitEngineResult } from "@/lib/aqla-engine/storage";
import { AqlaEngineResult } from "@/components/aqla-engine/AqlaEngineResult";
import { AqlaEnginePdf } from "@/components/aqla-engine/AqlaEnginePdf";
import type { EngineResult } from "@/lib/aqla-engine/types";
import { BackButton } from "@/components/BackButton";

export const Route = createFileRoute("/aqla-quit-engine/result/$resultId")({
  component: Page,
  head: () => ({
    meta: [
      { title: "خطتي الشخصية للإقلاع — أقلع" },
      { name: "description", content: "نتيجتك ليست حكمًا عليك — خطة إقلاع شخصية عملية من أقلع." },
    ],
  }),
});

function Page() {
  const { resultId } = useParams({ from: "/aqla-quit-engine/result/$resultId" });
  const fetchResult = useServerFn(getQuitEngineResult);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["aqla-engine-result", resultId],
    queryFn: () => fetchResult({ data: { id: resultId } }),
  });

  if (isLoading) {
    return (
      <main dir="rtl" className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="mb-5">
          <BackButton fallback="/aqla-quit-engine" labelAr="أداة أقلع" labelEn="Quit Engine" />
        </div>
        <p className="text-slate-700">جاري تحميل خطتك...</p>
      </main>
    );
  }
  if (isError || !data) {
    return (
      <main dir="rtl" className="min-h-screen bg-blue-50 flex items-center justify-center text-center px-4">
        <div>
          <p className="text-slate-800 mb-3">تعذر العثور على هذه الخطة.</p>
          <Link to="/aqla-quit-engine" className="text-blue-900 underline">العودة وإعادة المحاولة</Link>
        </div>
      </main>
    );
  }

  const row = data as unknown as {
    id: string;
    user_name: string | null;
    support_person_name: string | null;
    result_json: EngineResult;
  };
  const result = row.result_json;

  return (
    <main dir="rtl" className="min-h-screen bg-gradient-to-b from-blue-50 to-white print:bg-white">
      <AqlaEngineResult
        result={result}
        resultId={row.id}
        userName={row.user_name ?? undefined}
        supportPersonName={row.support_person_name ?? undefined}
      />
      <AqlaEnginePdf
        result={result}
        resultId={row.id}
        userName={row.user_name ?? undefined}
        supportPersonName={row.support_person_name ?? undefined}
      />
      <style>{`@media print { @page { size: A4; margin: 14mm; } body { background: #fff !important; } }`}</style>
    </main>
  );
}
