import { createFileRoute } from "@tanstack/react-router";
import { useLearnerDashboard } from "@/hooks/useLearnerDashboard";
import { CertificateCard, EmptyState } from "@/components/dashboard/DashboardParts";
import { DashboardSkeleton, DashboardError } from "@/components/dashboard/DashboardStates";

export const Route = createFileRoute("/dashboard/certificates")({
  component: CertificatesPage,
});

function CertificatesPage() {
  const { model, isPending, isError, refetch } = useLearnerDashboard();
  if (isPending) return <DashboardSkeleton />;
  if (isError || !model) return <DashboardError onRetry={() => refetch()} />;

  const valid = model.certificates.filter((c) => c.is_valid);
  const revoked = model.certificates.filter((c) => !c.is_valid);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">مركز الشهادات</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          سجل دائم لجميع شهاداتك، قابل للتحميل والطباعة والتحقق عبر رقم الشهادة.
        </p>
      </div>

      {valid.length === 0 ? (
        <EmptyState title="لم تحصل على شهادات بعد"hint="أكمل وحدة تدريبية واجتز اختبارها للحصول على شهادة." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {valid.map((c) => <CertificateCard key={c.id} cert={c} />)}
        </div>
      )}

      {revoked.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-[15px] font-semibold text-muted-foreground">شهادات غير سارية</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {revoked.map((c) => <CertificateCard key={c.id} cert={c} />)}
          </div>
        </section>
      )}
    </div>
  );
}
