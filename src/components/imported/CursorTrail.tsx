import { useEffect, useRef } from "react";

interface TrailPoint {
  x: number;
  y: number;
  alpha: number;
  width: number;
}

const MAX_POINTS = 26;
const FADE_RATE = 0.06;

/**
 * Elegant, subtle cursor tail — a soft white ribbon that stays visually
 * connected to the pointer. No color cycling, no flashy blending.
 */
export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const points: TrailPoint[] = [];
    let mouse = { x: -999, y: -999 };
    let prev = { x: -999, y: -999 };
    let rafId = 0;

    const onMove = (e: MouseEvent) => {
      prev = mouse;
      mouse = { x: e.clientX, y: e.clientY };
      const dx = mouse.x - prev.x;
      const dy = mouse.y - prev.y;
      const speed = Math.min(Math.sqrt(dx * dx + dy * dy), 40);
      const width = 1.2 + speed * 0.06;
      points.push({ x: mouse.x, y: mouse.y, alpha: 0.55, width });
      if (points.length > MAX_POINTS) points.splice(0, points.length - MAX_POINTS);
    };

    window.addEventListener("mousemove", onMove);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = points.length - 1; i >= 0; i--) {
        points[i].alpha -= FADE_RATE;
        if (points[i].alpha <= 0) points.splice(i, 1);
      }

      if (points.length >= 2) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        for (let i = 1; i < points.length - 1; i++) {
          const p0 = points[i - 1];
          const p1 = points[i];
          const p2 = points[i + 1];
          const mx1 = (p0.x + p1.x) / 2;
          const my1 = (p0.y + p1.y) / 2;
          const mx2 = (p1.x + p2.x) / 2;
          const my2 = (p1.y + p2.y) / 2;
          ctx.beginPath();
          ctx.moveTo(mx1, my1);
          ctx.quadraticCurveTo(p1.x, p1.y, mx2, my2);
          ctx.strokeStyle = `rgba(255, 255, 255, ${p1.alpha * 0.5})`;
          ctx.lineWidth = p1.width;
          ctx.stroke();
        }
      }

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 99997,
      }}
    />
  );
}
