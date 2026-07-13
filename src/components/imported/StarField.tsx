import { useMemo } from "react";

/**
 * Tiny twinkling star field for dark hero backgrounds.
 * Pure CSS animation, no JS on tick — cheap on mobile.
 */
export default function StarField({ count = 140 }: { count?: number }) {
  const seeded = (index: number, salt: number) => {
    const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
    return value - Math.floor(value);
  };

  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const sizeSeed = seeded(i, 1);
        const size = sizeSeed < 0.85 ? 1 : sizeSeed < 0.94 ? 1.5 : 2;
        return {
          id: i,
          top: seeded(i, 2) * 100,
          left: seeded(i, 3) * 100,
          size,
          delay: seeded(i, 4) * 6,
          duration: 2.5 + seeded(i, 5) * 4,
          baseOpacity: 0.35 + seeded(i, 6) * 0.5,
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
