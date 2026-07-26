import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

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

export function ResearchBanner({ variant = "site" }: { variant?: "site" | "hero" }) {
  const visible = useCycle(5000, 3000);
  const isHero = variant === "hero";

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
        className={`aqla-research-banner group relative block w-full overflow-hidden text-center backdrop-blur-sm ${
          isHero
            ? "rounded-2xl border border-red-300/25 px-3 py-3 shadow-[0_18px_45px_-28px_rgba(248,113,113,0.75)]"
            : "border-b border-red-500/30 px-4 py-2.5"
        }`}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : isHero ? "translateY(-4px)" : "translateY(-8px)",
          pointerEvents: visible ? "auto" : "none",
          backgroundImage:
            isHero
              ? "linear-gradient(90deg, rgba(127,29,29,0.42) 0%, rgba(185,28,28,0.48) 25%, rgba(248,113,113,0.46) 50%, rgba(185,28,28,0.48) 75%, rgba(127,29,29,0.42) 100%)"
              : "linear-gradient(90deg, rgba(127,29,29,0.55) 0%, rgba(185,28,28,0.6) 25%, rgba(239,68,68,0.6) 50%, rgba(185,28,28,0.6) 75%, rgba(127,29,29,0.55) 100%)",
        }}
      >
        <span aria-hidden className="aqla-research-shine pointer-events-none absolute inset-0" />
        <div className={`relative mx-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-1 ${isHero ? "max-w-md" : "max-w-6xl"}`}>
          <p className={`${isHero ? "text-[12.5px] sm:text-[13px]" : "text-[13px] sm:text-sm"} font-semibold leading-5 text-white drop-shadow-sm`}>
            شارك تجربتك مع أضرار النيكوتين وساهم في الدراسة
          </p>
          <Link
            to="/poster-studio"
            className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white ring-1 ring-white/25 transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            أنشئ بطاقة إنجازك وشاركها مع زملائك
          </Link>
          <a
            href={RESEARCH_REDCAP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] font-semibold text-white underline decoration-white/60 underline-offset-2 transition-colors hover:decoration-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            شارك في الدراسة
          </a>
        </div>
      </div>
    </>
  );
}
