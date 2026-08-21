import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle } from "lucide-react";
import { useLearnerDashboard } from "@/hooks/useLearnerDashboard";
import { DashboardSkeleton, DashboardError } from "@/components/dashboard/DashboardStates";

export const Route = createFileRoute("/dashboard/paths")({
  component: PathsPage,
});

function PathsPage() {
  const { model, isPending, isError, refetch } = useLearnerDashboard();
  if (isPending) return <DashboardSkeleton />;
  if (isError || !model) return <DashboardError onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">مسارات التعلم</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">مسار متسلسل يقودك من الأساسيات حتى الشهادة المعتمدة.</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-[16px]">مسار دعم الإقلاع الأساسي</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={model.percent} className="h-2" />
          <p className="mt-2 text-[12.5px] text-muted-foreground">
            {model.completedModules} من {model.totalModules} وحدات · {model.percent}% مكتمل
          </p>

          <ol className="mt-5 space-y-2">
            {model.courses.map((c) => (
              <li key={c.slug} className="flex items-center gap-3 rounded-2xl border border-border p-3">
                {c.status === "completed"
                  ? <CheckCircle2 className="h-5 w-5 shrink-0 text-[#006C35]" />
                  : <Circle className="h-5 w-5 shrink-0 text-muted-foreground/50" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium">{c.num}. {c.titleAr}</p>
                  <p className="text-[12px] text-muted-foreground">{c.durationAr}</p>
                </div>
                <Button asChild size="sm" variant={c.status === "completed" ? "outline" : "default"}>
                  <Link to="/modules/$slug" params={{ slug: c.slug }}>
                    {c.status === "completed" ? "مراجعة" : "ابدأ"}
                  </Link>
                </Button>
              </li>
            ))}
            <li className="flex items-center gap-3 rounded-2xl border border-dashed border-border p-3">
              {model.examStatus === "passed"
                ? <CheckCircle2 className="h-5 w-5 text-[#006C35]" />
                : <Circle className="h-5 w-5 text-muted-foreground/50" />}
              <div className="flex-1">
                <p className="text-[14px] font-medium">التقييم النهائي والشهادة</p>
                <p className="text-[12px] text-muted-foreground">درجة النجاح {model.passThreshold}%</p>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
