import { useEffect, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Play,
  ChevronDown,
  FlaskConical,
  BookOpen,
  ExternalLink,
  Users,
  MousePointerClick,
  Eye,
} from "lucide-react";
import { useTypewriter } from "@/hooks/useTypewriter";
import { getPublicImpactStats } from "@/lib/impact.functions";
import { trackEvent } from "@/lib/track-event";
import SaudiFlagWave from "@/components/SaudiFlagWave";

const PUBLICATIONS = [
  {
    titleAr: "انتشار استخدام التبغ وأنماطه بين البالغين السعوديين",
    journal: "Frontiers in Public Health · 2025",
    url: "https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1641308/full",
  },
  {
    titleAr: "استخدام أضرار النيكوتين ونتائج الإقلاع: مسح وطني",
    journal: "Frontiers in Public Health · 2026",
    url: "https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2026.1806892/full",
  },
];

function PublicationCarousel({ onPublicationClick }: { onPublicationClick: () => void }) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const cycle = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % PUBLICATIONS.length);
        setVisible(true);
      }, 450);
    }, 4500);
    return () => clearInterval(cycle);
  }, []);

  const pub = PUBLICATIONS[idx];

  return (
    <div className="w-full max-w-lg mx-auto mt-8">
      <div className="flex items-center justify-center gap-2 mb-3">
        <div className="h-px flex-1" style={{ background: "rgba(0,166,90,0.2)" }} />
        <span
          className="text-xs font-semibold tracking-widest px-3"
          style={{ color: "#34d399" }}
        >
          أحدث أبحاثنا المنشورة
        </span>
        <div className="h-px flex-1" style={{ background: "rgba(0,166,90,0.2)" }} />
      </div>
      <a
        href={pub.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onPublicationClick}
        className="group flex items-start gap-3 w-full rounded-xl px-5 py-4 hover:scale-[1.02] transition"
        style={{
          background: "rgba(0,166,90, 0.07)",
          border: "1px solid rgba(0,166,90, 0.18)",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.4s ease, transform 0.3s ease",
        }}
      >
        <BookOpen className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00A65A" }} />
        <div className="flex-1 text-right">
          <p
            className="text-sm font-semibold leading-snug mb-0.5 group-hover:underline"
            style={{ color: "rgba(255,255,255,0.88)" }}
          >
            {pub.titleAr}
          </p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.70)" }}>
            {pub.journal}
          </p>
        </div>
        <ExternalLink
          className="w-4 h-4 flex-shrink-0 opacity-40 group-hover:opacity-80 transition-opacity mt-0.5"
          style={{ color: "#00A65A" }}
        />
      </a>
    </div>
  );
}

export function LiveStatsBar({ compact = false }: { compact?: boolean }) {
  const { data: stats } = useQuery({
    queryKey: ["impact-stats-hero"],
    queryFn: () => getPublicImpactStats(),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  const items = [
    { icon: Users, label: "زيارة", value: stats?.total_visits ?? 0, color: "#0ea5e9" },
    {
      icon: FlaskConical,
      label: "مشارك في الدراسة",
      value: stats?.research_consent_count ?? 0,
      color: "#ef4444",
    },
    {
      icon: MousePointerClick,
      label: "يريد الإقلاع",
      value: stats?.quit_track_clicks ?? 0,
      color: "#8b5cf6",
    },
    {
      icon: Eye,
      label: "تفاعل مع المساعد",
      value: stats?.chatbot_opens ?? 0,
      color: "#f59e0b",
    },
  ];

  if (compact) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 py-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center gap-1.5">
              <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: item.color }} />
              <span
                className="font-extrabold tabular-nums text-sm"
                style={{ color: item.color }}
              >
                {item.value.toLocaleString("ar-SA")}
              </span>
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className="w-full flex flex-wrap items-center justify-center gap-0 rounded-2xl overflow-hidden mb-6"
      style={{
        background: "rgba(5,9,10,0.70)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(12px)",
      }}
    >
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className={`flex items-center gap-2.5 px-5 py-3 flex-1 min-w-[110px] ${
              i < items.length - 1 ? "border-l border-white/[0.07]" : ""
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" style={{ color: item.color }} />
            <div className="text-right">
              <div
                className="text-base font-extrabold tabular-nums leading-none"
                style={{ color: item.color }}
              >
                {item.value.toLocaleString("ar-SA")}
              </div>
              <div
                className="text-[10px] mt-0.5 leading-none"
                style={{ color: "rgba(255,255,255,0.40)" }}
              >
                {item.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TypewriterHeadline() {
  const suffix = "عن التدخين";
  const { displayed, done } = useTypewriter(suffix, 55, 600);
  return (
    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-white mb-5">
      <span
        style={{
          background: "linear-gradient(135deg, #00A65A 0%, #006C35 50%, #a78bfa 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        أقلع
      </span>{" "}
      <span>
        {displayed}
        {!done && <span className="typewriter-cursor" />}
      </span>
    </h1>
  );
}

function useSpotlight(count: number, interval = 5000) {
  const [active, setActive] = useState<number | null>(null);
  useEffect(() => {
    const start = setTimeout(() => {
      setActive(0);
      const id = setInterval(() => {
        setActive((prev) => ((prev ?? -1) + 1) % count);
      }, interval);
      return () => clearInterval(id);
    }, 3000);
    return () => clearTimeout(start);
  }, [count, interval]);
  return active;
}

function spotlightStyle(idx: number, active: number | null): React.CSSProperties {
  const isActive = active === idx;
  const isIdle = active === null;
  return {
    transition:
      "transform 0.6s cubic-bezier(0.23,1,0.32,1), opacity 0.6s ease, filter 0.6s ease, box-shadow 0.6s ease",
    transform: isActive
      ? "scale(1.20) translateY(-6px) translateZ(0)"
      : isIdle
        ? "scale(1) translateZ(0)"
        : "scale(0.92) translateZ(0)",
    opacity: isActive ? 1 : isIdle ? 1 : 0.5,
    filter: isActive ? "none" : isIdle ? "none" : "blur(0.6px)",
    zIndex: isActive ? 50 : 1,
    position: "relative",
    boxShadow: isActive
      ? "0 0 0 3px rgba(255,255,255,0.20), 0 20px 60px rgba(0,0,0,0.5)"
      : "none",
    borderRadius: isActive ? "1rem" : undefined,
  };
}

export default function HeroSection() {
  const track = useCallback(
    (
      eventType:
        | "page_visit"
        | "survey_click"
        | "quit_intent"
        | "training_click"
        | "video_view"
        | "publication_click",
    ) => {
      try {
        trackEvent("hero_" + eventType);
      } catch {
        /* noop */
      }
    },
    [],
  );

  useEffect(() => {
    track("page_visit");
  }, [track]);

  const spotlight = useSpotlight(3, 5000);

  return (
    <section
      id="home"
      className="relative flex flex-col min-h-[92vh] items-center justify-center pt-24 pb-28 overflow-hidden"
      style={{ background: "#020806" }}
    >
      <SaudiFlagWave />
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.10] blur-3xl"
          style={{ background: "#c9a84c" }}
        />
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: "linear-gradient(to right, transparent, rgba(201,168,76,0.4), transparent)" }}
        />
      </div>
      {/* Seamless bottom fade into the green page background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 z-[2]"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, #0e4a30 100%)",
        }}
      />

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 my-6">
        <div
          className="aqla-hero-panel relative px-8 py-12 sm:px-12 sm:py-16 md:px-16 md:py-20 w-full text-center rounded-2xl overflow-visible"
          style={{
            background: "rgba(5, 9, 10, 0.55)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            border: "1px solid rgba(180,255,210, 0.12)",
            boxShadow:
              "0 8px 48px rgba(0,166,90, 0.08), 0 1px 0 rgba(180,255,210,0.08) inset",
          }}
        >
          {[
            "top-0 left-0 border-t-2 border-l-2",
            "top-0 right-0 border-t-2 border-r-2",
            "bottom-0 left-0 border-b-2 border-l-2",
            "bottom-0 right-0 border-b-2 border-r-2",
          ].map((cls, i) => (
            <div
              key={i}
              className={`absolute w-8 h-8 md:w-10 md:h-10 ${cls}`}
              style={{ borderColor: "rgba(0,166,90, 0.4)" }}
            />
          ))}

          <div className="mb-6 flex justify-center" style={spotlightStyle(0, spotlight)}>
            <a
              href="/quit-pathway"
              onClick={() => track("survey_click")}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full study-banner-flash cursor-pointer select-none"
            >
              <FlaskConical className="w-4 h-4 flex-shrink-0 text-white" />
              <span
                className="font-bold text-white tracking-wide"
                style={{
                  fontSize: spotlight === 0 ? "1.1rem" : "0.875rem",
                  transition: "font-size 0.5s ease",
                }}
              >
                ابدأ رحلتك في مركز الإقلاع الافتراضي
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-white/70 flex-shrink-0" />
            </a>
          </div>

          <TypewriterHeadline />

          <p
            className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-8"
            style={{ color: "rgba(255,255,255,0.72)" }}
          >
            منصة علمية متكاملة لدعم الإقلاع عن التدخين — مبنية على أحدث الأدلة السريرية
            وتجمع بين التقنية والرعاية الشخصية لتحقيق نتائج مستدامة.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-5">
            <div style={spotlightStyle(1, spotlight)}>
              <a
                href="/quit-pathway"
                onClick={() => track("quit_intent")}
                className="flex items-center justify-center font-bold rounded-xl text-white transition-colors duration-200 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #00A65A 0%, #006C35 100%)",
                  boxShadow:
                    spotlight === 1
                      ? "0 6px 36px rgba(0,166,90, 0.60)"
                      : "0 4px 24px rgba(0,166,90, 0.40)",
                  fontSize: spotlight === 1 ? "1.25rem" : "1rem",
                  padding: spotlight === 1 ? "1rem 2.5rem" : "0.875rem 2rem",
                  transition:
                    "font-size 0.5s ease, padding 0.5s ease, box-shadow 0.5s ease",
                  whiteSpace: "nowrap",
                }}
              >
                أريد أن أتوقف عن التدخين
              </a>
            </div>

            <div style={spotlightStyle(2, spotlight)}>
              <a
                href="/learn-train"
                onClick={() => track("training_click")}
                className="flex items-center justify-center font-bold rounded-xl transition-colors duration-200 active:scale-95"
                style={{
                  border:
                    spotlight === 2
                      ? "2px solid rgba(167, 139, 250, 0.9)"
                      : "2px solid rgba(167, 139, 250, 0.55)",
                  color: "#a78bfa",
                  background:
                    spotlight === 2
                      ? "rgba(167, 139, 250, 0.18)"
                      : "rgba(167, 139, 250, 0.08)",
                  fontSize: spotlight === 2 ? "1.15rem" : "1rem",
                  padding: spotlight === 2 ? "1rem 2rem" : "0.875rem 2rem",
                  transition:
                    "font-size 0.5s ease, padding 0.5s ease, border-color 0.5s ease, background 0.5s ease",
                  whiteSpace: "nowrap",
                }}
              >
                شهادات ودورات الأخصائي المعتمد
              </a>
            </div>
          </div>

          <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.75)" }}>
            مجاناً تماماً • مدعوم بالأدلة العلمية • ابدأ الآن
          </p>

          <a
            href="https://www.youtube.com/@aqla_program"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("video_view")}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95"
            style={{
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.07)",
              color: "rgba(255,255,255,0.75)",
            }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #00A65A, #006C35)" }}
            >
              <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
            </div>
            شاهد الفيديو التعريفي
          </a>

          <PublicationCarousel onPublicationClick={() => track("publication_click")} />
        </div>
      </div>

      <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 px-4">
        {[
          { emoji: "🧲", label: "اختبار الإدمان", hash: "#kys-1" },
          { emoji: "💸", label: "عدّاد المال", hash: "#kys-0" },
          { emoji: "🎯", label: "تحدي كسر عادة التدخين", hash: "#kys-4" },
        ].map((item) => (
          <button
            key={item.hash}
            type="button"
            onClick={() => {
              const el = document.getElementById("know-your-smoking");
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              if (window.location.hash === item.hash) {
                window.dispatchEvent(new HashChangeEvent("hashchange"));
              } else {
                window.location.hash = item.hash;
              }
              track("quit_intent");
            }}
            className="group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-95"
            style={{
              border: "1px solid rgba(0,166,90,0.35)",
              background: "rgba(0,166,90,0.12)",
              color: "rgba(255,255,255,0.92)",
            }}
          >
            <span className="text-base" aria-hidden>{item.emoji}</span>
            <span>{item.label}</span>
            <span className="text-[11px] opacity-70">جرّبها الآن ←</span>
          </button>
        ))}
      </div>


      <button
        type="button"
        onClick={() => {
          const el = document.getElementById("pathways");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          else window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
        }}
        aria-label="مرر لأسفل"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce z-10 cursor-pointer hover:text-white/70 transition-colors"
        style={{ color: "rgba(255,255,255,0.35)", background: "transparent", border: "none" }}
      >
        <span className="text-xs">مرر لأسفل</span>
        <ChevronDown className="w-4 h-4" />
      </button>
    </section>
  );
}
