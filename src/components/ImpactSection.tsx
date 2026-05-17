import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { getPublicImpactStats, type ImpactStats } from "@/lib/impact.functions";
import {
  ClipboardCheck,
  Compass,
  Stethoscope,
  Users,
  MapPin,
  CalendarCheck,
  BookOpen,
  Eye,
  Sun,
} from "lucide-react";

function CountUp({ value }: { value: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (value <= 0) {
      setN(0);
      return;
    }
    const duration = 900;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setN(Math.floor(p * value));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setN(value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{n.toLocaleString()}</>;
}

export function ImpactSection({ isAr }: { isAr: boolean }) {
  const statsFn = useServerFn(getPublicImpactStats);
  const { data } = useQuery<ImpactStats>({
    queryKey: ["public-impact-stats"],
    queryFn: () => statsFn(),
    staleTime: 60_000,
  });

  const s: ImpactStats =
    data ?? {
      total_visits: 0,
      visits_today: 0,
      total_assessments: 0,
      support_pathway_count: 0,
      doctor_review_count: 0,
      volunteer_applicants: 0,
      cities_represented: 0,
      follow_up_visits_logged: 0,
      research_consent_count: 0,
    };

  const items: { icon: React.ReactNode; label: string; value: number }[] = [
    { icon: <ClipboardCheck className="h-5 w-5" />, label: isAr ? "عدد التقييمات المكتملة" : "Assessments completed", value: s.total_assessments },
    { icon: <Compass className="h-5 w-5" />, label: isAr ? "من تم توجيههم لمسارات الدعم" : "Routed to support pathways", value: s.support_pathway_count },
    { icon: <Stethoscope className="h-5 w-5" />, label: isAr ? "الحالات التي تحتاج مراجعة مختص" : "Doctor-review cases identified", value: s.doctor_review_count },
    { icon: <Users className="h-5 w-5" />, label: isAr ? "طلبات الانضمام كمتطوعين" : "Volunteer applicants", value: s.volunteer_applicants },
    { icon: <MapPin className="h-5 w-5" />, label: isAr ? "المدن المشاركة" : "Cities represented", value: s.cities_represented },
    { icon: <CalendarCheck className="h-5 w-5" />, label: isAr ? "زيارات المتابعة المسجلة" : "Follow-up visits logged", value: s.follow_up_visits_logged },
    { icon: <BookOpen className="h-5 w-5" />, label: isAr ? "سجلات وافقت على الاستخدام البحثي" : "Research-consented records", value: s.research_consent_count },
  ];

  return (
    <section className="mt-14">
      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
          {isAr ? "أثر أقلع حتى الآن" : "Aqla Impact So Far"}
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
          {isAr
            ? "أرقام محدثة تعكس استخدام المنصة ومسارات الدعم والتطوع. لا يتم عرض أي بيانات شخصية."
            : "Live platform indicators showing assessment, support, and volunteer activity. No personal data is displayed."}
        </p>
      </div>

      {/* Visitor counter */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card className="rounded-3xl border-0 bg-[hsl(var(--background))] p-5 shadow-elegant ring-1 ring-primary/10">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary-soft text-primary">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                {isAr ? "إجمالي الزيارات" : "Total visits"}
              </div>
              <div className="mt-0.5 text-3xl font-bold text-primary">
                <CountUp value={s.total_visits} />
              </div>
            </div>
          </div>
        </Card>
        <Card className="rounded-3xl border-0 bg-[hsl(var(--background))] p-5 shadow-elegant ring-1 ring-primary/10">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary-soft text-primary">
              <Sun className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                {isAr ? "زيارات اليوم" : "Visits today"}
              </div>
              <div className="mt-0.5 text-3xl font-bold text-primary">
                <CountUp value={s.visits_today} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* KPI cards */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <Card
            key={i}
            className="rounded-3xl border-0 bg-white p-5 shadow-elegant ring-1 ring-primary/10 transition-transform hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary-soft text-primary">
                {it.icon}
              </div>
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">{it.label}</div>
                <div className="mt-0.5 text-2xl font-bold text-foreground">
                  <CountUp value={it.value} />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <p className="mt-3 text-center text-[11px] text-muted-foreground/80">
        {isAr
          ? "لا يتم تخزين عنوان IP أو معرّفات شخصية. عدّاد الزيارات يعتمد جلسة مجهولة."
          : "No IP addresses or personal identifiers are stored. The visit counter uses an anonymous session."}
      </p>
    </section>
  );
}
