import { useEffect, useRef } from "react";

interface TrailPoint {
  x: number;
  y: number;
  hue: number;
  width: number;
  alpha: number;
  age: number;
}

const MAX_POINTS = 120;
const FADE_RATE = 0.018;
const BASE_HUE = 220;
const HUE_RANGE = 100;

export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const points: TrailPoint[] = [];
    let mouse = { x: -999, y: -999 };
    let prevMouse = { x: -999, y: -999 };
    let hue = BASE_HUE;
    let rafId = 0;

    const onMove = (e: MouseEvent) => {
      prevMouse = { ...mouse };
      mouse = { x: e.clientX, y: e.clientY };

      const dx = mouse.x - prevMouse.x;
      const dy = mouse.y - prevMouse.y;
      const speed = Math.sqrt(dx * dx + dy * dy);

      const targetHue = BASE_HUE + Math.min(speed * 1.8, HUE_RANGE);
      hue += (targetHue - hue) * 0.08;

      const width = 4 + Math.min(speed * 0.7, 14);

      points.push({ x: mouse.x, y: mouse.y, hue, width, alpha: 0.55, age: 0 });
      if (points.length > MAX_POINTS) points.splice(0, points.length - MAX_POINTS);
    };

    window.addEventListener("mousemove", onMove);

    const drawCurve = (
      pts: TrailPoint[],
      widthMul: number,
      alphaMul: number,
      blur: number,
      composite: GlobalCompositeOperation,
    ) => {
      if (pts.length < 3) return;
      ctx.save();
      ctx.globalCompositeOperation = composite;
      ctx.filter = blur > 0 ? `blur(${blur}px)` : "none";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (let i = 1; i < pts.length - 1; i++) {
        const p0 = pts[i - 1];
        const p1 = pts[i];
        const p2 = pts[i + 1];

        const alpha = p1.alpha * alphaMul;
        if (alpha < 0.005) continue;

        const mx1 = (p0.x + p1.x) / 2;
        const my1 = (p0.y + p1.y) / 2;
        const mx2 = (p1.x + p2.x) / 2;
        const my2 = (p1.y + p2.y) / 2;

        ctx.beginPath();
        ctx.moveTo(mx1, my1);
        ctx.quadraticCurveTo(p1.x, p1.y, mx2, my2);
        ctx.strokeStyle = `hsla(${p1.hue}, 100%, 65%, ${alpha})`;
        ctx.lineWidth = p1.width * widthMul;
        ctx.stroke();
      }

      ctx.restore();
    };

    const draw = () => {
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,0.06)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      for (let i = points.length - 1; i >= 0; i--) {
        points[i].alpha -= FADE_RATE;
        points[i].age++;
        if (points[i].alpha <= 0) points.splice(i, 1);
      }

      if (points.length > 2) {
        drawCurve(points, 5.5, 0.12, 18, "lighter");
        drawCurve(points, 2.8, 0.22, 8, "lighter");
        drawCurve(points, 1.0, 0.9, 0, "lighter");
        drawCurve(points, 0.3, 0.55, 0, "lighter");
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
        zIndex: 40,
        mixBlendMode: "screen",
      }}
    />
  );
}
