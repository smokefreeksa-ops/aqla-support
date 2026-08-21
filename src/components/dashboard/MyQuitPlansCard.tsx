import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { listMyClinicalPlans } from "@/lib/clinical/clinical-plan.functions";

/**
 * Dashboard card: reopens the signed-in user's stored Release 1 clinical plans
 * through the real /quit-plan/$planToken route (exact stored version).
 */
export function MyQuitPlansCard() {
  const listFn = useServerFn(listMyClinicalPlans);
  const { data, isPending } = useQuery({
    queryKey: ["my-clinical-plans"],
    queryFn: () => listFn({ data: undefined as never }),
    retry: false,
  });

  const plans = data?.plans ?? [];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-[15px]">خطط الإقلاع الخاصة بي</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isPending ? (
          <p className="text-[13px] text-muted-foreground">جارٍ التحميل…</p>
        ) : plans.length === 0 ? (
          <div className="space-y-3">
            <p className="text-[13px] text-muted-foreground">لا توجد خطة محفوظة بعد.</p>
            <Button asChild size="sm"><Link to="/quit-chat">ابدأ خطة الإقلاع</Link></Button>
          </div>
        ) : (
          plans.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
              <div className="flex items-center gap-2 text-[13px]">
                <FileText className="h-4 w-4 text-[#006C35]" />
                <span>
                  خطة {p.nickname ?? ""} — الإصدار {p.plan_version ?? 1}
                </span>
              </div>
              <Button asChild size="sm"variant="secondary">
                <Link to="/quit-plan/$planToken" params={{ planToken: p.plan_token as string }}>
                  فتح الخطة
                </Link>
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
