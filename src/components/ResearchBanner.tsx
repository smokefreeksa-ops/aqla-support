import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getPublicImpactStats } from "@/lib/impact.functions";

export const RESEARCH_REDCAP_URL = "https://redcap.kau.edu.sa/surveys/?s=FLJKYNNLYEA7HXAM";

function formatCount(n: number): string {
  return new Intl.NumberFormat("ar-EG").format(n);
}


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

export function ResearchBanner() {
  const visible = useCycle(5000, 3000);
  const { data } = useQuery({
    queryKey: ["public-impact-stats-banner"],
    queryFn: () => getPublicImpactStats(),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
  const visits = data?.unique_visitors ?? 0;

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
      <div
        dir="rtl"
        aria-hidden={!visible}
        className="aqla-research-banner group relative block w-full overflow-hidden border-b border-red-500/30 px-4 py-1 backdrop-blur-sm"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-8px)",
          pointerEvents: visible ? "auto" : "none",
          backgroundImage:
            "linear-gradient(90deg, rgba(127,29,29,0.55) 0%, rgba(185,28,28,0.6) 25%, rgba(239,68,68,0.6) 50%, rgba(185,28,28,0.6) 75%, rgba(127,29,29,0.55) 100%)",
        }}
      >
        <span aria-hidden className="aqla-research-shine pointer-events-none absolute inset-0" />
        <div className="relative mx-auto flex max-w-6xl flex-wrap sm:flex-nowrap items-center justify-center gap-2 px-4">
          <p className="whitespace-nowrap text-[11px] font-semibold leading-tight text-white drop-shadow-sm sm:text-xs">
            تجربتك تهمنا وتساهم في البحث العلمي
          </p>
          <a
            href={RESEARCH_REDCAP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-white/25 px-2.5 py-0.5 text-[10px] font-bold text-white ring-1 ring-white/40 transition-colors hover:bg-white/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:text-[11px]"
          >
            شارك الآن في الدراسة
          </a>
          <Link
            to="/poster-studio"
            className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white ring-1 ring-white/25 transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:text-[11px]"
          >
            أنشئ بطاقة إنجازك
          </Link>
          <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white ring-1 ring-white/20 sm:text-[11px]">
            <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            {formatCount(visits)} زيارة
          </span>
        </div>
      </div>
    </>
  );
}

