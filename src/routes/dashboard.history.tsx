import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useLearnerDashboard } from "@/hooks/useLearnerDashboard";
import { EmptyState, formatDate } from "@/components/dashboard/DashboardParts";
import { DashboardSkeleton, DashboardError } from "@/components/dashboard/DashboardStates";
import { CERTIFICATE_TYPE_LABELS } from "@/lib/dashboard-model";

export const Route = createFileRoute("/dashboard/history")({
  component: HistoryPage,
});

type Entry = { date: string; title: string; detail: string; kind: string };

function HistoryPage() {
  const { model, isPending, isError, refetch } = useLearnerDashboard();
  if (isPending) return <DashboardSkeleton />;
  if (isError || !model) return <DashboardError onRetry={() => refetch()} />;

  const entries: Entry[] = [
    ...model.certificates.map((c) => ({
      date: c.issued_at,
      title: CERTIFICATE_TYPE_LABELS[c.certificate_type] ?? "شهادة",
      detail: `${c.module_slug ?? "البرنامج"} · رقم ${c.certificate_code}${c.overall_score != null ? ` · ${c.overall_score}%` : ""}`,
      kind: "شهادة",
    })),
    ...model.courses
      .filter((c) => c.status === "completed")
      .map((c) => ({ date: "", title: c.titleAr, detail: `الوحدة ${c.num}`, kind: "وحدة مكتملة" })),
  ].sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">سجل التدريب</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">سجل زمني كامل لتدريبك وشهاداتك.</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => window.print()}>
          <Download className="me-2 h-4 w-4" /> تنزيل كشف التدريب
        </Button>
      </div>

      {entries.length === 0 ? (
        <EmptyState title="لا يوجد نشاط تدريبي بعد" hint="ابدأ أول وحدة لتظهر هنا." />
      ) : (
        <ol className="space-y-2">
          {entries.map((e, i) => (
            <li key={i} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
              <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#006C35]" />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium">{e.title}</p>
                <p className="mt-0.5 text-[12.5px] text-muted-foreground">{e.detail}</p>
              </div>
              <div className="text-end text-[12px] text-muted-foreground">
                <p>{e.kind}</p>
                {e.date && <p>{formatDate(e.date)}</p>}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
