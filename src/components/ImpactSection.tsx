import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { getPublicImpactStats, type ImpactStats } from "@/lib/impact.functions";
import { ClipboardCheck, Compass, Stethoscope, Users, MapPin, Eye } from "lucide-react";

const EMPTY: ImpactStats = {
  total_visits: 0, unique_visitors: 0, visits_today: 0,
  assessments_started: 0, assessments_completed: 0, total_assessments: 0,
  assessment_completion_rate: 0, quit_track_clicks: 0, volunteer_track_clicks: 0,
  support_pathway_count: 0, doctor_review_count: 0, volunteer_applicants: 0,
  cities_represented: 0, follow_up_visits_logged: 0, research_consent_count: 0,
  whatsapp_clicks: 0, chatbot_opens: 0, average_session_duration_seconds: 0,
};

function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (value <= 0) { setN(0); return; }
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
  return <>{n.toLocaleString()}{suffix}</>;
}

export function ImpactSection({ isAr }: { isAr: boolean }) {
  const statsFn = useServerFn(getPublicImpactStats);
  const { data } = useQuery<ImpactStats>({
    queryKey: ["public-impact-stats"],
    queryFn: () => statsFn(),
    staleTime: 60_000,
  });
  const s: ImpactStats = data ?? EMPTY;

  const items: { icon: React.ReactNode; label: string; value: number; suffix?: string }[] = [
    { icon: <Eye className="h-4 w-4" />, label: isAr ? "زيارات الموقع" : "Website visits", value: s.total_visits },
    { icon: <ClipboardCheck className="h-4 w-4" />, label: isAr ? "التقييمات المكتملة" : "Assessments completed", value: s.assessments_completed },
    { icon: <Stethoscope className="h-4 w-4" />, label: isAr ? "الحالات التي تحتاج مراجعة مختص" : "Doctor-review cases", value: s.doctor_review_count },
    { icon: <Users className="h-4 w-4" />, label: isAr ? "طلبات المتطوعين" : "Volunteer applications", value: s.volunteer_applicants },
    { icon: <MapPin className="h-4 w-4" />, label: isAr ? "المدن المشاركة" : "Cities represented", value: s.cities_represented },
    { icon: <Compass className="h-4 w-4" />, label: isAr ? "المشاركات الاجتماعية" : "Social shares", value: s.whatsapp_clicks },
  ];

  return (
    <section>
      <div className="text-center">
        <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {isAr ? "أثر أقلع حتى الآن" : "Aqla Impact So Far"}
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-[13px] text-muted-foreground">
          {isAr
            ? "مؤشرات مجمعة دون عرض أي بيانات شخصية."
            : "Aggregate indicators — no personal data shown."}
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <Card
            key={i}
            className="rounded-2xl border border-border/50 bg-card/60 p-4 shadow-none"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-muted-foreground">
                {it.icon}
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-muted-foreground">{it.label}</div>
                <div className="mt-0.5 text-lg font-semibold text-foreground">
                  <CountUp value={it.value} suffix={it.suffix} />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <p className="mt-4 text-center text-[11px] text-muted-foreground/80">
        {isAr
          ? "تعرض هذه الأرقام بشكل إجمالي فقط، وقد تتغير مع تحديث نظام التحليلات."
          : "Figures are aggregate only and may shift as the analytics system updates."}
      </p>
    </section>
  );
}
