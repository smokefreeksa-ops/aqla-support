import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useLearnerDashboard } from "@/hooks/useLearnerDashboard";
import { CourseCard, EmptyState } from "@/components/dashboard/DashboardParts";
import { DashboardSkeleton, DashboardError } from "@/components/dashboard/DashboardStates";

export const Route = createFileRoute("/dashboard/learning")({
  component: LearningPage,
});

function LearningPage() {
  const { model, isPending, isError, refetch } = useLearnerDashboard();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim();
    if (!model) return [];
    if (!term) return model.courses;
    return model.courses.filter(
      (c) => c.titleAr.includes(term) || c.titleEn.toLowerCase().includes(term.toLowerCase()),
    );
  }, [model, q]);

  if (isPending) return <DashboardSkeleton />;
  if (isError || !model) return <DashboardError onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">تعلّمي</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">كل دوراتك ومساراتك ورحلاتك التدريبية في مكان واحد.</p>
      </div>

      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث في دوراتك…"className="max-w-sm" />

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">الكل ({filtered.length})</TabsTrigger>
          <TabsTrigger value="in_progress">قيد التقدم</TabsTrigger>
          <TabsTrigger value="completed">مكتملة</TabsTrigger>
        </TabsList>
        {(["all", "in_progress", "completed"] as const).map((key) => {
          const list = key === "all" ? filtered : filtered.filter((c) => c.status === key);
          return (
            <TabsContent key={key} value={key} className="mt-4">
              {list.length === 0 ? (
                <EmptyState title="لا توجد دورات في هذا القسم" />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((c) => <CourseCard key={c.slug} course={c} />)}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
