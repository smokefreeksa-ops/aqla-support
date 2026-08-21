import type { ReactNode } from "react";
import { Loader2, RefreshCw, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/** Branded skeleton block. */
export function AqlaSkeleton({ className = "h-24 w-full rounded-2xl" }: { className?: string }) {
  return <Skeleton className={className} />;
}

/** Generic branded loading block for a section or page. */
export function LoadingState({
  label = "جاري التحميل…",
  rows = 3,
}: {
  label?: string;
  rows?: number;
}) {
  return (
    <div className="space-y-4" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}</span>
      <AqlaSkeleton className="h-32 w-full rounded-3xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: rows }).map((_, i) => (
          <AqlaSkeleton key={i} className="h-40 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

/** Small spinner for inline/button usage. */
export function InlineSpinner({ className = "h-4 w-4" }: { className?: string }) {
  return <Loader2 className={`${className} animate-spin`} aria-hidden="true" />;
}

/** Friendly empty state with an optional primary action. */
export function EmptyState({
  title,
  titleEn,
  description,
  icon,
  action,
}: {
  title: string;
  titleEn?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 p-8 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-border/60 bg-background/60">
        {icon ?? <Inbox className="h-5 w-5 text-muted-foreground" aria-hidden="true" />}
      </div>
      <p className="text-[15px] font-semibold text-foreground" dir="rtl">{title}</p>
      {titleEn ? <p className="mt-0.5 text-[13px] text-muted-foreground">{titleEn}</p> : null}
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-[13px] text-muted-foreground" dir="rtl">{description}</p>
      ) : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

/** Friendly error state with a retry action. */
export function ErrorState({
  title = "تعذّر تحميل هذا القسم",
  description = "تحقق من اتصالك بالإنترنت ثم أعد المحاولة.",
  onRetry,
  retryLabel = "إعادة المحاولة",
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center"
    >
      <p className="text-[15px] font-semibold text-foreground" dir="rtl">{title}</p>
      <p className="mt-1 text-[13px] text-muted-foreground" dir="rtl">{description}</p>
      {onRetry ? (
        <Button className="mt-4" size="sm" onClick={onRetry}>
          <RefreshCw className="me-1.5 h-4 w-4" aria-hidden="true" />
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
