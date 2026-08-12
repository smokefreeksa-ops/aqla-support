import { useEffect, useRef } from "react";

/**
 * Canvas-based decorative starfield layer.
 * Purely ornamental: transparent, pointer-events disabled, and sits behind content.
 * Does not replace the existing CSS StarField component.
 */
export function StarfieldCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = (canvas.width = canvas.offsetWidth * devicePixelRatio);
    let h = (canvas.height = canvas.offsetHeight * devicePixelRatio);

    const STAR_COUNT = Math.min(280, Math.floor((w * h) / 9000));
    type Star = {
      x: number;
      y: number;
      r: number;
      a: number;
      s: number;
      tw: number;
    };
    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.3 * devicePixelRatio + 0.3,
      a: Math.random(),
      s: 0.02 + Math.random() * 0.08,
      tw: Math.random() * Math.PI * 2,
    }));

    let mouseX = 0;
    let mouseY = 0;
    const onMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 20;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 20;
    };
    window.addEventListener("mousemove", onMove);

    const onResize = () => {
      w = canvas.width = canvas.offsetWidth * devicePixelRatio;
      h = canvas.height = canvas.offsetHeight * devicePixelRatio;
    };
    window.addEventListener("resize", onResize);

    let raf = 0;
    const render = () => {
      ctx.clearRect(0, 0, w, h);
      for (const st of stars) {
        st.tw += 0.03;
        if (!reduce) {
          st.y += st.s * devicePixelRatio;
          if (st.y > h) {
            st.y = 0;
            st.x = Math.random() * w;
          }
        }
        const twinkle = 0.55 + Math.sin(st.tw) * 0.45;
        ctx.beginPath();
        const px = st.x + mouseX * st.r;
        const py = st.y + mouseY * st.r;
        ctx.arc(px, py, st.r, 0, Math.PI * 2);
        ctx.fillStyle = `oklch(0.95 0.02 165 / ${st.a * twinkle})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
      aria-hidden
    />
  );
}
