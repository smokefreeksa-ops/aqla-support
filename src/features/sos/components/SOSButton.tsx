import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { track } from "@/lib/events";

/**
 * Global SOS button. Persistent, thumb-friendly, subtle idle pulse.
 * Not police-red styled: warm red with soft glow, not siren.
 */
export function SOSButton({
  hidden = false,
}: {
  hidden?: boolean;
}) {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce), (hover: none), (pointer: coarse)");
    setReduce(mq.matches);
    const h = () => setReduce(mq.matches);
    mq.addEventListener?.("change", h);
    return () => mq.removeEventListener?.("change", h);
  }, []);

  if (hidden) return null;

  return (
    <>
      <style>{`
        @keyframes aqlaSosIdlePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(220,38,38,0.55), 0 10px 30px -10px rgba(153,27,27,0.6); }
          50% { box-shadow: 0 0 0 14px rgba(220,38,38,0), 0 12px 34px -8px rgba(153,27,27,0.7); }
        }
        .aqla-sos-fab { animation: aqlaSosIdlePulse 2.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .aqla-sos-fab { animation: none; }
        }
        @media (hover: none), (pointer: coarse) {
          .aqla-sos-fab { animation: none; }
        }
      `}</style>
      <Link
        to="/sos"onClick={() => track("sos_opened", "fab")}
        aria-label="نجدة — أريد التدخين الآن"className="aqla-sos-fab fixed z-[60] grid place-items-center h-14 w-14 sm:h-[72px] sm:w-[72px] rounded-full text-white select-none active:scale-95 transition-transform focus:outline-none focus-visible:ring-4 focus-visible:ring-red-300"
        style={{
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 64px)",
          insetInlineEnd: "16px",
          backgroundImage:
            "radial-gradient(circle at 30% 25%, #fca5a5 0%, #ef4444 45%, #991b1b 100%)",
          border: "2px solid rgba(255,255,255,0.7)",
          animation: reduce ? "none" : undefined,
        }}
      >
        <span className="flex flex-col items-center leading-none">
          <span className="text-[14px] font-extrabold tracking-tight">نجدة</span>
          <span className="text-[9px] mt-0.5 opacity-90">SOS</span>
        </span>
      </Link>
    </>
  );
}
