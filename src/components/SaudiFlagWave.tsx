import { useEffect, useId, useState } from "react";

/**
 * Full-viewport animated Saudi flag background.
 *
 * Uses an inline SVG with an SMIL-animated feTurbulence displacement map
 * to create a gentle, continuous waving effect. A dark gradient scrim is
 * layered on top so hero text remains readable.
 *
 * Respects prefers-reduced-motion: the wave animation is paused and the
 * flag is shown as a static image for users who request reduced motion.
 */
export default function SaudiFlagWave() {
  const id = useId().replace(/:/g, "");
  const filterId = `saudi-wave-${id}`;
  const turbulenceId = `saudi-turb-${id}`;

  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Flag SVG: covers viewport, preserves 2:3 ratio by slicing */}
      <svg
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 900 600"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              id={turbulenceId}
              type="fractalNoise"
              baseFrequency="0.008 0.045"
              numOctaves="2"
              result="noise"
              seed="3"
            >
              {!reducedMotion && (
                <animate
                  attributeName="baseFrequency"
                  values="0.008 0.045;0.008 0.065;0.008 0.045"
                  dur="10s"
                  repeatCount="indefinite"
                />
              )}
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={reducedMotion ? "0" : "14"}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>

        <g filter={`url(#${filterId})`}>
          {/* Green field only */}
          <rect width="900" height="600" fill="#006C35" />
        </g>
      </svg>

      {/* Dark scrim for text readability */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, rgba(0,30,15,0.35) 0%, rgba(0,20,10,0.65) 55%, rgba(0,10,5,0.85) 100%)",
        }}
      />

      {/* Top/bottom edge vignettes for seamless blending */}
      <div
        className="absolute inset-x-0 top-0 h-32"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,30,15,0.55), transparent)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-40"
        style={{
          background:
            "linear-gradient(to top, rgba(0,30,15,0.75), transparent)",
        }}
      />
    </div>
  );
}
