import { createFileRoute, Link } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLearnerDashboard } from "@/hooks/useLearnerDashboard";
import {
  WelcomeHeader,
  CourseCard,
  FinalAssessmentCard,
  SessionRow,
  EmptyState,
  formatDate,
} from "@/components/dashboard/DashboardParts";
import { DashboardSkeleton, DashboardError } from "@/components/dashboard/DashboardStates";
import { MyQuitPlansCard } from "@/components/dashboard/MyQuitPlansCard";


export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
  const { model, isPending, isError, refetch } = useLearnerDashboard();
  if (isPending) return <DashboardSkeleton />;
  if (isError || !model) return <DashboardError onRetry={() => refetch()} />;

  const inProgress = model.courses.filter((c) => c.status !== "completed").slice(0, 3);
  const upcoming = model.sessions.slice(0, 3);

  return (
    <div className="space-y-8">
      <WelcomeHeader model={model} />

      <MyQuitPlansCard />
      <section>

        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">تعلّمي</h2>
          <Button asChild variant="ghost"size="sm"><Link to="/dashboard/learning">عرض الكل</Link></Button>
        </div>
        <Tabs defaultValue="courses">
          <TabsList>
            <TabsTrigger value="courses">الدورات</TabsTrigger>
            <TabsTrigger value="paths">المسارات</TabsTrigger>
            <TabsTrigger value="journeys">الرحلات</TabsTrigger>
          </TabsList>
          <TabsContent value="courses"className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(inProgress.length ? inProgress : model.courses.slice(0, 3)).map((c) => (
                <CourseCard key={c.slug} course={c} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="paths"className="mt-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-[15px]">مسار دعم الإقلاع الأساسي</CardTitle></CardHeader>
              <CardContent>
                <p className="text-[13px] text-muted-foreground">
                  {model.totalModules} وحدات متسلسلة تنتهي بالتقييم النهائي والشهادة المعتمدة.
                </p>
                <Progress value={model.percent} className="mt-3 h-2" />
                <p className="mt-2 text-[12px] text-muted-foreground">{model.percent}% مكتمل</p>
                <Button asChild size="sm"className="mt-4"><Link to="/dashboard/paths">فتح المسار</Link></Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="journeys"className="mt-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-[15px]">رحلة المتعلم</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-[13px]">
                <JourneyStep done={model.completedModules > 0} label="بدء أول وحدة" />
                <JourneyStep done={model.completedModules >= Math.ceil(model.totalModules / 2)} label="إكمال نصف البرنامج" />
                <JourneyStep done={model.remaining === 0} label="إكمال جميع الوحدات" />
                <JourneyStep done={model.examStatus === "passed"} label="اجتياز التقييم النهائي" />
                <JourneyStep done={model.certificates.length > 0} label="استلام الشهادة" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <FinalAssessmentCard model={model} />
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-[15px]">الجلسات المباشرة القادمة</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {upcoming.length === 0 ? (
              <EmptyState title="لا توجد جلسات مجدولة حالياً"hint="سنعلمك فور جدولة جلسة جديدة." />
            ) : (
              upcoming.map((s) => <SessionRow key={s.id} session={s} />)
            )}
            <Button asChild variant="ghost"size="sm"><Link to="/dashboard/sessions">التقويم الكامل</Link></Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-[15px]">آخر الشهادات</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-[13px]">
            {model.certificates.length === 0 ? (
              <EmptyState title="لا توجد شهادات بعد"hint="أكمل وحدة تدريبية للحصول على أول شهادة." />
            ) : (
              model.certificates.slice(0, 3).map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
                  <span className="truncate">{c.module_slug ?? "شهادة البرنامج"}</span>
                  <span className="text-[12px] text-muted-foreground">{formatDate(c.issued_at)}</span>
                </div>
              ))
            )}
            <Button asChild variant="ghost"size="sm"><Link to="/dashboard/certificates">مركز الشهادات</Link></Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-[15px]">سجل التدريب</CardTitle></CardHeader>
          <CardContent className="text-[13px] text-muted-foreground">
            سجل زمني كامل لكل وحدة ومحاولة تقييم وشهادة، مع إمكانية تنزيل كشف التدريب.
            <div className="mt-3">
              <Button asChild size="sm"variant="outline"><Link to="/dashboard/history">فتح السجل</Link></Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function JourneyStep({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${done ? "bg-[#006C35]": "bg-muted-foreground/30"}`} />
      <span className={done ? "font-medium": "text-muted-foreground"}>{label}</span>
    </div>
  );
}
