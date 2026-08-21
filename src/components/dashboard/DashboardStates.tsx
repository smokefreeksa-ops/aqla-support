import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BackButton } from "@/components/BackButton";
import { Link } from "@tanstack/react-router";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-56 w-full rounded-3xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-56 w-full rounded-2xl" />)}
      </div>
    </div>
  );
}

export function DashboardError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
      <p className="text-[15px] font-semibold">تعذّر تحميل بيانات لوحة المتعلم</p>
      <p className="mt-1 text-[13px] text-muted-foreground">تحقق من اتصالك ثم أعد المحاولة.</p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <Button size="sm" onClick={onRetry}>إعادة المحاولة</Button>
        <BackButton fallback="/"labelAr="الرئيسية"labelEn="Home"textAr="العودة"textEn="Go back" />
        <Link
          to="/"className="inline-flex items-center rounded-full border border-border/60 bg-background/60 px-3.5 py-1.5 text-sm font-medium text-foreground/80 hover:bg-accent"
        >
          الرئيسية
        </Link>
      </div>
    </div>
  );
}
