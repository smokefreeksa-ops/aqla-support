import { useMemo } from "react";

/**
 * Tiny twinkling star field for dark hero backgrounds.
 * Pure CSS animation, no JS on tick — cheap on mobile.
 */
export default function StarField({ count = 140 }: { count?: number }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const size = Math.random() < 0.85 ? 1 : Math.random() < 0.6 ? 1.5 : 2;
        return {
          id: i,
          top: Math.random() * 100,
          left: Math.random() * 100,
          size,
          delay: Math.random() * 6,
          duration: 2.5 + Math.random() * 4,
          baseOpacity: 0.35 + Math.random() * 0.5,
        };
      }),
    [count],
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 40%, #0a1218 0%, #04070a 55%, #000 100%)" }}
    >
      {stars.map((s) => (
        <span
          key={s.id}
          className="absolute rounded-full bg-white star-twinkle"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            opacity: s.baseOpacity,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            boxShadow: s.size >= 2 ? "0 0 4px rgba(255,255,255,0.85)" : undefined,
          }}
        />
      ))}
    </div>
  );
}
