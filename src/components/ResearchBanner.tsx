import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPublicImpactStats } from "@/lib/impact.functions";

export const RESEARCH_REDCAP_URL = "https://redcap.kau.edu.sa/surveys/?s=FLJKYNNLYEA7HXAM";

function useCycle(onMs: number, offMs: number) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const tick = (show: boolean) => {
      setVisible(show);
      t = setTimeout(() => tick(!show), show ? onMs : offMs);
    };
    t = setTimeout(() => tick(false), onMs);
    return () => clearTimeout(t);
  }, [onMs, offMs]);
  return visible;
}

function formatCount(n: number) {
  if (n >= 1000) {
    const k = n / 1000;
    return `${k.toFixed(k >= 10 ? 0 : 1)}K+`;
  }
  return `${n}`;
}

export function ResearchBanner() {
  const visible = useCycle(5000, 3000);
  const { data } = useQuery({
    queryKey: ["public-impact-stats-banner"],
    queryFn: () => getPublicImpactStats(),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  const visits = data?.total_visits ?? 0;
  const uniques = data?.unique_visitors ?? 0;

  return (
    <>
      <style>{`
        @keyframes aqlaResearchShine {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .aqla-research-banner {
          transition: opacity 700ms ease, transform 700ms ease;
        }
        .aqla-research-shine {
          background-image: linear-gradient(
            110deg,
            rgba(255,255,255,0) 20%,
            rgba(255,255,255,0.25) 45%,
            rgba(255,255,255,0) 70%
          );
          background-size: 200% 100%;
          animation: aqlaResearchShine 3s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .aqla-research-banner { opacity: 1 !important; transform: none !important; }
          .aqla-research-shine { animation: none; background: none; }
        }
      `}</style>
      <a
        href={RESEARCH_REDCAP_URL}
        target="_blank"
        rel="noopener noreferrer"
        dir="rtl"
        aria-hidden={!visible}
        className="aqla-research-banner group relative block w-full overflow-hidden border-b border-red-500/30 px-4 py-2.5 text-center backdrop-blur-sm"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-8px)",
          pointerEvents: visible ? "auto" : "none",
          backgroundImage:
            "linear-gradient(90deg, rgba(127,29,29,0.55) 0%, rgba(185,28,28,0.6) 25%, rgba(239,68,68,0.6) 50%, rgba(185,28,28,0.6) 75%, rgba(127,29,29,0.55) 100%)",
        }}
      >
        <span aria-hidden className="aqla-research-shine pointer-events-none absolute inset-0" />
        <div className="relative mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <p className="text-[13px] font-semibold leading-5 text-white drop-shadow-sm sm:text-sm">
            شارك تجربتك مع أضرار النيكوتين وساهم في الدراسة
          </p>
          <span className="hidden items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-semibold text-white ring-1 ring-white/25 sm:inline-flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
            <span>{formatCount(visits)} زيارة</span>
            <span className="opacity-60">·</span>
            <span>{formatCount(uniques)} زائر</span>
          </span>
          <span className="text-[12px] font-semibold text-white underline decoration-white/60 underline-offset-2 group-hover:decoration-white">
            شارك في الدراسة ←
          </span>
        </div>
      </a>
    </>
  );
}
