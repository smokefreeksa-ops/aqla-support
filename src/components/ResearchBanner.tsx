export const RESEARCH_REDCAP_URL = "https://redcap.kau.edu.sa/surveys/?s=FLJKYNNLYEA7HXAM";

export function ResearchBanner() {
  return (
    <>
      <style>{`
        @keyframes aqlaResearchFlash {
          0%, 100% { opacity: 0; transform: translateY(-6px); pointer-events: none; }
          6%, 74% { opacity: 1; transform: translateY(0); pointer-events: auto; }
          80% { opacity: 0; transform: translateY(-6px); pointer-events: none; }
        }
        @keyframes aqlaResearchShine {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .aqla-research-banner {
          animation: aqlaResearchFlash 5s ease-in-out infinite;
        }
        .aqla-research-shine {
          background-image: linear-gradient(
            110deg,
            rgba(255,255,255,0) 20%,
            rgba(255,255,255,0.35) 45%,
            rgba(255,255,255,0) 70%
          );
          background-size: 200% 100%;
          animation: aqlaResearchShine 3s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .aqla-research-banner { animation: none; opacity: 1; transform: none; }
          .aqla-research-shine { animation: none; background: none; }
        }
      `}</style>
      <a
        href={RESEARCH_REDCAP_URL}
        target="_blank"
        rel="noopener noreferrer"
        dir="rtl"
        className="aqla-research-banner group relative block w-full overflow-hidden border-b border-red-900/40 px-4 py-2.5 text-center shadow-[0_2px_18px_-6px_rgba(220,38,38,0.6)]"
        style={{
          backgroundImage:
            "linear-gradient(90deg, #7f1d1d 0%, #b91c1c 25%, #ef4444 50%, #b91c1c 75%, #7f1d1d 100%)",
        }}
      >
        <span
          aria-hidden
          className="aqla-research-shine pointer-events-none absolute inset-0"
        />
        <div className="relative mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <p className="text-[13px] font-semibold leading-5 text-white drop-shadow-sm sm:text-sm">
            شارك تجربتك مع أظرف النيكوتين وساهم في البحث العلمي
          </p>
          <span className="text-[12px] font-semibold text-white underline decoration-white/60 underline-offset-2 group-hover:decoration-white">
            شارك في الاستبيان ←
          </span>
        </div>
      </a>
    </>
  );
}
