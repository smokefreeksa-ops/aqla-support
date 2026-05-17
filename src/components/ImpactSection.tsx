import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { getPublicImpactStats, type ImpactStats } from "@/lib/impact.functions";
import {
  ClipboardCheck, Compass, Stethoscope, Users, MapPin, CalendarCheck, BookOpen,
  Eye, Sun, UserCheck, PlayCircle, PercentSquare,
} from "lucide-react";

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
    { icon: <Eye className="h-5 w-5" />, label: isAr ? "زيارات الموقع" : "Website visits", value: s.total_visits },
    { icon: <UserCheck className="h-5 w-5" />, label: isAr ? "الزوار الفريدون" : "Unique visitors", value: s.unique_visitors },
    { icon: <Sun className="h-5 w-5" />, label: isAr ? "زيارات اليوم" : "Visits today", value: s.visits_today },
    { icon: <PlayCircle className="h-5 w-5" />, label: isAr ? "من بدأوا التقييم" : "Assessments started", value: s.assessments_started },
    { icon: <ClipboardCheck className="h-5 w-5" />, label: isAr ? "التقييمات المكتملة" : "Assessments completed", value: s.assessments_completed },
    { icon: <PercentSquare className="h-5 w-5" />, label: isAr ? "معدل إكمال التقييم" : "Completion rate", value: Math.round(s.assessment_completion_rate), suffix: "%" },
    { icon: <Compass className="h-5 w-5" />, label: isAr ? "من تم توجيههم لمسارات الدعم" : "Routed to support pathways", value: s.support_pathway_count },
    { icon: <Stethoscope className="h-5 w-5" />, label: isAr ? "الحالات التي تحتاج مراجعة مختص" : "Doctor-review cases identified", value: s.doctor_review_count },
    { icon: <Users className="h-5 w-5" />, label: isAr ? "طلبات الانضمام كمتطوعين" : "Volunteer applications", value: s.volunteer_applicants },
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
            ? "مؤشرات محدثة تعكس الوصول، التفاعل، ومسارات الدعم والتطوع في المنصة دون عرض أي بيانات شخصية."
            : "Live privacy-safe indicators showing platform reach, engagement, support routing, and volunteer activity without displaying personal data."}
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                  <CountUp value={it.value} suffix={it.suffix} />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        {isAr
          ? "يتم تحديث هذه الأرقام تلقائيًا من بيانات المنصة المجمعة فقط."
          : "These numbers are updated automatically using aggregate platform data only."}
      </p>
      <p className="mt-1 text-center text-[11px] text-muted-foreground/80">
        {isAr
          ? "جميع المؤشرات معروضة بشكل إجمالي ودون عرض أي بيانات شخصية."
          : "All indicators are aggregate and privacy-safe."}
      </p>
    </section>
  );
}
