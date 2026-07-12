import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getPublicImpactStats, type ImpactStats } from "@/lib/impact.functions";
import { ClipboardCheck, Stethoscope, Users, MapPin, Eye, Share2 } from "lucide-react";

const EMPTY: ImpactStats = {
  total_visits: 0, unique_visitors: 0, visits_today: 0,
  assessments_started: 0, assessments_completed: 0, total_assessments: 0,
  assessment_completion_rate: 0, quit_track_clicks: 0, volunteer_track_clicks: 0,
  support_pathway_count: 0, doctor_review_count: 0, volunteer_applicants: 0,
  cities_represented: 0, follow_up_visits_logged: 0, research_consent_count: 0,
  whatsapp_clicks: 0, chatbot_opens: 0, average_session_duration_seconds: 0,
};

type Slide = {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  hue: [string, string]; // gradient stops
};

function CountFlash({ value, suffix }: { value: number; suffix?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    if (value <= 0) return;
    const duration = 1100;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.floor(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setN(value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{n.toLocaleString("en-US")}{suffix}</>;
}

export function ImpactSection({ isAr }: { isAr: boolean }) {
  const statsFn = useServerFn(getPublicImpactStats);
  const { data } = useQuery<ImpactStats>({
    queryKey: ["public-impact-stats"],
    queryFn: () => statsFn(),
    staleTime: 60_000,
  });
  const s: ImpactStats = data ?? EMPTY;

  const slides: Slide[] = [
    { icon: <Users className="h-5 w-5" />, label: isAr ? "طالب مسجل" : "Registered students", value: 8000, suffix: "+", hue: ["#00A65A", "#006C35"] },
    { icon: <ClipboardCheck className="h-5 w-5" />, label: isAr ? "التقييمات المكتملة" : "Assessments", value: s.assessments_completed, hue: ["#34d399", "#065f46"] },
    { icon: <Stethoscope className="h-5 w-5" />, label: isAr ? "حالات مراجعة مختص" : "Doctor-review", value: s.doctor_review_count, hue: ["#f472b6", "#831843"] },
    { icon: <Eye className="h-5 w-5" />, label: isAr ? "زيارات الموقع" : "Visits", value: s.total_visits, hue: ["#60a5fa", "#1e3a8a"] },
    { icon: <MapPin className="h-5 w-5" />, label: isAr ? "المدن المشاركة" : "Cities", value: s.cities_represented, hue: ["#a78bfa", "#3b0764"] },
    { icon: <Share2 className="h-5 w-5" />, label: isAr ? "المشاركات الاجتماعية" : "Shares", value: s.whatsapp_clicks, hue: ["#22d3ee", "#0e7490"] },
  ];

  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setIdx((i) => (i + 1) % slides.length), 2600);
    return () => window.clearInterval(t);
  }, [slides.length]);

  const active = slides[idx];

  // Hexagon points (flat-top), centered at 100,100 of a 200 viewBox
  const hexPoints = "100,8 180,52 180,148 100,192 20,148 20,52";

  return (
    <section className="relative">
      <div className="text-center">
        <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {isAr ? "أثر أقلع حتى الآن" : "Aqla Impact So Far"}
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-[13px] text-muted-foreground">
          {isAr ? "مؤشرات مجمعة دون عرض أي بيانات شخصية." : "Aggregate indicators — no personal data shown."}
        </p>
      </div>

      <style>{`
        @keyframes aqlaHexSpin { to { transform: rotate(360deg); } }
        @keyframes aqlaHexSpinRev { to { transform: rotate(-360deg); } }
        @keyframes aqlaFlashIn {
          0% { opacity: 0; transform: translateY(8px) scale(.92); filter: blur(8px); }
          40% { opacity: 1; filter: blur(0); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes aqlaNumPulse {
          0%, 100% { text-shadow: 0 0 18px currentColor; }
          50% { text-shadow: 0 0 36px currentColor, 0 0 60px currentColor; }
        }
        @keyframes aqlaDotOrbit { to { transform: rotate(360deg); } }
        @keyframes aqlaBgGlow { 0%,100%{opacity:.55} 50%{opacity:.95} }
      `}</style>

      <div className="relative mx-auto mt-8 grid place-items-center" style={{ height: 360 }}>
        {/* cinematic background glow */}
        <div
          className="absolute inset-0 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${active.hue[0]}55, transparent 60%)`,
            animation: "aqlaBgGlow 3s ease-in-out infinite",
            transition: "background 1.2s ease",
          }}
        />

        {/* outer rotating hexagon ring */}
        <svg
          viewBox="0 0 200 200"
          className="absolute"
          style={{ width: 340, height: 340, animation: "aqlaHexSpin 28s linear infinite" }}
        >
          <defs>
            <linearGradient id="hexOuter" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={active.hue[0]} stopOpacity="0.9" />
              <stop offset="100%" stopColor={active.hue[1]} stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <polygon
            points={hexPoints}
            fill="none"
            stroke="url(#hexOuter)"
            strokeWidth="0.8"
            strokeDasharray="3 4"
            style={{ transition: "stroke 1s ease" }}
          />
        </svg>

        {/* middle rotating hex (reverse) */}
        <svg
          viewBox="0 0 200 200"
          className="absolute"
          style={{ width: 280, height: 280, animation: "aqlaHexSpinRev 18s linear infinite" }}
        >
          <polygon points={hexPoints} fill="none" stroke={active.hue[0]} strokeOpacity="0.45" strokeWidth="0.6" />
        </svg>

        {/* inner solid hex */}
        <svg
          viewBox="0 0 200 200"
          className="absolute"
          style={{ width: 230, height: 230, animation: "aqlaHexSpin 12s linear infinite" }}
        >
          <defs>
            <linearGradient id="hexInner" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={active.hue[0]} stopOpacity="0.18" />
              <stop offset="100%" stopColor={active.hue[1]} stopOpacity="0.32" />
            </linearGradient>
            <linearGradient id="hexInnerStroke" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={active.hue[0]} />
              <stop offset="100%" stopColor={active.hue[1]} />
            </linearGradient>
          </defs>
          <polygon
            points={hexPoints}
            fill="url(#hexInner)"
            stroke="url(#hexInnerStroke)"
            strokeWidth="1.4"
            style={{ transition: "fill 1s, stroke 1s" }}
          />
        </svg>

        {/* orbiting dots */}
        <div
          className="absolute"
          style={{ width: 340, height: 340, animation: "aqlaDotOrbit 14s linear infinite" }}
        >
          {slides.map((sl, i) => {
            const angle = (i / slides.length) * Math.PI * 2 - Math.PI / 2;
            const r = 170;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            const isActive = i === idx;
            return (
              <span
                key={i}
                className="absolute top-1/2 left-1/2 rounded-full transition-all duration-500"
                style={{
                  transform: `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${isActive ? 1.6 : 1})`,
                  width: 10, height: 10,
                  background: isActive ? sl.hue[0] : "rgba(255,255,255,.35)",
                  boxShadow: isActive ? `0 0 18px ${sl.hue[0]}` : "none",
                }}
              />
            );
          })}
        </div>

        {/* center content (flashes per slide) */}
        <div
          key={idx}
          dir={isAr ? "rtl" : "ltr"}
          className="relative z-10 flex flex-col items-center justify-center text-center"
          style={{ animation: "aqlaFlashIn .9s ease-out both" }}
        >
          <div
            className="grid h-11 w-11 place-items-center rounded-xl backdrop-blur-sm mb-2"
            style={{
              background: `linear-gradient(135deg, ${active.hue[0]}33, ${active.hue[1]}33)`,
              color: active.hue[0],
              border: `1px solid ${active.hue[0]}55`,
            }}
          >
            {active.icon}
          </div>
          <div
            className="font-bold tabular-nums"
            style={{
              color: active.hue[0],
              fontSize: 56,
              lineHeight: 1,
              animation: "aqlaNumPulse 2s ease-in-out infinite",
            }}
          >
            <CountFlash value={active.value} suffix={active.suffix} />
          </div>
          <div className="mt-2 text-[13px] font-medium text-foreground/85">{active.label}</div>
        </div>
      </div>

      {/* slide indicators */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {slides.map((sl, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={sl.label}
            className="h-1.5 rounded-full transition-all duration-500"
            style={{
              width: i === idx ? 28 : 8,
              background: i === idx ? sl.hue[0] : "hsl(var(--muted-foreground) / 0.3)",
            }}
          />
        ))}
      </div>

      <p className="mt-4 text-center text-[11px] text-muted-foreground/80">
        {isAr
          ? "تعرض هذه الأرقام بشكل إجمالي فقط، وقد تتغير مع تحديث نظام التحليلات."
          : "Figures are aggregate only and may shift as analytics update."}
      </p>
    </section>
  );
}
