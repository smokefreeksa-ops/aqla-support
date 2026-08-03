import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Gift } from "lucide-react";
import { getPublicImpactStats } from "@/lib/impact.functions";

export const RESEARCH_REDCAP_URL = "https://redcap.kau.edu.sa/surveys/?s=FLJKYNNLYEA7HXAM";

function formatCount(n: number): string {
  return new Intl.NumberFormat("ar-EG").format(n);
}

export function ResearchBanner() {
  const { data } = useQuery({
    queryKey: ["public-impact-stats-banner"],
    queryFn: () => getPublicImpactStats(),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
  const visits = data?.total_visits ?? 0;

  return (
    <div
      dir="rtl"
      className="relative block w-full overflow-hidden border-b border-red-500/30 px-4 py-2.5 backdrop-blur-sm"
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgba(127,29,29,0.55) 0%, rgba(185,28,28,0.6) 25%, rgba(239,68,68,0.6) 50%, rgba(185,28,28,0.6) 75%, rgba(127,29,29,0.55) 100%)",
      }}
    >
      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-2 text-center">
        {/* Heading */}
        <p className="text-xs font-semibold leading-tight text-white drop-shadow-sm sm:text-sm">
          تجربتك تهمنا وتساهم في البحث العلمي
        </p>

        {/* Prize badge */}
        <div
          className="inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-1.5 shadow-sm"
          style={{
            backgroundColor: "oklch(0.93 0.06 88)",
            color: "oklch(0.35 0.08 85)",
          }}
        >
          <Gift className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="whitespace-normal text-[11px] font-bold leading-snug sm:text-xs">
            شارك في الاستبيان وادخل السحب للفوز بـ ٥٠٠ ريال سعودي
          </span>
        </div>

        {/* Main CTA */}
        <a
          href={RESEARCH_REDCAP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-red-700 ring-1 ring-white/60 transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:text-xs"
        >
          شارك الآن في الدراسة
        </a>

        {/* Bottom row */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <Link
            to="/poster-studio"
            onClick={() => {
              try { sessionStorage.setItem("aqla_study_overlay_dismissed", "1"); } catch { /* ignore */ }
              window.dispatchEvent(new CustomEvent("aqla:dismiss-study-overlay"));
            }}
            className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold text-white ring-1 ring-white/25 transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:text-[11px]"
          >
            أنشئ بطاقة إنجازك
          </Link>
          <span
            title="إجمالي الزيارات"
            className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-white/10 px-2 py-1 text-[10px] font-semibold text-white ring-1 ring-white/20 sm:text-[11px]"
          >
            <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            {formatCount(visits)} زيارة
          </span>
        </div>
      </div>
    </div>
  );
}
