import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLearnerDashboard } from "@/hooks/useLearnerDashboard";
import { CourseCard, EmptyState } from "@/components/dashboard/DashboardParts";
import { DashboardSkeleton, DashboardError } from "@/components/dashboard/DashboardStates";

export const Route = createFileRoute("/dashboard/catalogue")({
  component: CataloguePage,
});

function CataloguePage() {
  const { model, isPending, isError, refetch } = useLearnerDashboard();
  const [q, setQ] = useState("");
  const [level, setLevel] = useState<string>("all");

  const levels = useMemo(
    () => ["all", ...Array.from(new Set((model?.courses ?? []).map((c) => c.level)))],
    [model],
  );

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (model?.courses ?? []).filter((c) => {
      const matchTerm = !term || c.titleAr.includes(q.trim()) || c.titleEn.toLowerCase().includes(term);
      const matchLevel = level === "all" || c.level === level;
      return matchTerm && matchLevel;
    });
  }, [model, q, level]);

  if (isPending) return <DashboardSkeleton />;
  if (isError || !model) return <DashboardError onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">الفهرس</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">تصفح جميع الدورات المتاحة في {model.orgNameAr}.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث…" className="max-w-xs" />
        {levels.map((l) => (
          <Button key={l} size="sm" variant={level === l ? "default" : "outline"} onClick={() => setLevel(l)}>
            {l === "all" ? "الكل" : l}
          </Button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState title="لا توجد نتائج مطابقة" hint="جرّب كلمة بحث أخرى." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => <CourseCard key={c.slug} course={c} />)}
        </div>
      )}
    </div>
  );
}
