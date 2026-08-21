import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getQuitEngineAdminStats } from "@/lib/aqla-engine/storage";

export const Route = createFileRoute("/admin/aqla-quit-engine")({
  component: Page,
});

function Page() {
  const fn = useServerFn(getQuitEngineAdminStats);
  const { data, isLoading } = useQuery({
    queryKey: ["aqla-engine-admin-stats"],
    queryFn: () => fn(),
  });

  return (
    <main dir="rtl"className="min-h-screen bg-slate-50 p-6 text-right">
      <h1 className="text-2xl font-extrabold text-blue-900 mb-6">لوحة محرك خطة الإقلاع الشخصية</h1>
      {isLoading && <p>جاري التحميل...</p>}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Stat title="عدد من أكملوا الاختبار" value={data.total_completed} />
          <Stat title="نسبة الاستخدام المختلط" value={`${data.mixed_use_pct}%`} />
          <Stat title="من يحتاجون إحالة" value={`${data.referral_needed_count} (${data.referral_needed_pct}%)`} />
          <Stat title="متوسط الأهمية" value={data.avg_importance} />
          <Stat title="متوسط الثقة" value={data.avg_confidence} />
          <Stat title="متابعة بعد 3 أيام" value={data.followups.day_3} />
          <Stat title="متابعة بعد 7 أيام" value={data.followups.day_7} />
          <Stat title="متابعة بعد 30 يومًا" value={data.followups.day_30} />
          <ListCard title="أكثر المنتجات استخدامًا" map={data.product_counts} />
          <ListCard title="أكثر المحفزات شيوعًا" map={data.trigger_counts} />
          <ListCard title="أنماط النتائج (الاعتماد)" map={data.dependence_counts} />
        </div>
      )}
    </main>
  );
}

function Stat({ title, value }: { title: string; value: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="text-xs text-slate-500">{title}</div>
      <div className="text-2xl font-bold text-blue-900 mt-1">{value}</div>
    </div>
  );
}

function ListCard({ title, map }: { title: string; map: Record<string, number> }) {
  const entries = Object.entries(map ?? {}).sort((a, b) => b[1] - a[1]).slice(0, 10);
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm md:col-span-3">
      <div className="text-sm font-bold text-blue-900 mb-2">{title}</div>
      {entries.length === 0 ? <p className="text-slate-500 text-sm">لا توجد بيانات بعد</p> : (
        <ul className="space-y-1 text-sm">
          {entries.map(([k, v]) => (
            <li key={k} className="flex justify-between border-b border-slate-100 py-1">
              <span>{k}</span><span className="font-semibold">{v}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
