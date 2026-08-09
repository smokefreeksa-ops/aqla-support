import { createFileRoute } from "@tanstack/react-router";
import { useLearnerDashboard } from "@/hooks/useLearnerDashboard";
import { SessionRow, EmptyState } from "@/components/dashboard/DashboardParts";
import { DashboardSkeleton, DashboardError } from "@/components/dashboard/DashboardStates";

export const Route = createFileRoute("/dashboard/sessions")({
  component: SessionsPage,
});

function SessionsPage() {
  const { model, isPending, isError, refetch } = useLearnerDashboard();
  if (isPending) return <DashboardSkeleton />;
  if (isError || !model) return <DashboardError onRetry={() => refetch()} />;

  const now = Date.now();
  const upcoming = model.sessions.filter((s) => new Date(s.starts_at).getTime() >= now);
  const past = model.sessions.filter((s) => new Date(s.starts_at).getTime() < now).reverse();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">الجلسات المباشرة</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">ورش وجلسات تدريب مباشرة مع فريق أقلع.</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-[15px] font-semibold">القادمة</h2>
        {upcoming.length === 0
          ? <EmptyState title="لا توجد جلسات قادمة" hint="سيتم عرض الجلسات هنا فور جدولتها." />
          : upcoming.map((s) => <SessionRow key={s.id} session={s} />)}
      </section>

      {past.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-[15px] font-semibold">السابقة</h2>
          {past.map((s) => <SessionRow key={s.id} session={s} />)}
        </section>
      )}
    </div>
  );
}
