import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

type PathItem = {
  to: "/quit-pathway" | "/learn-train" | "/help-pathway" | "/challenge-pathway";
  title: string;
  description: string;
  cta: string;
};

type Props = { isAr: boolean };

const PATHS_AR: PathItem[] = [
  {
    to: "/quit-pathway",
    title: "مركز أقلع الافتراضي لدعم الإقلاع",
    description:
      "تجربة تفاعلية تقودك من فهم استخدامك للتدخين أو النيكوتين، إلى التقييم، وبناء الخطة، والمتابعة، وطلب الدعم عند الحاجة.",
    cta: "ادخل مركز الإقلاع",
  },
  {
    to: "/learn-train",
    title: "أكاديمية أقلع للتدريب والشهادات",
    description:
      "مركز تعليمي تفاعلي للتدريب، السيناريوهات، الاختبارات، والشهادات القابلة للتحميل والمشاركة والتحقق.",
    cta: "ادخل الأكاديمية",
  },
  {
    to: "/help-pathway",
    title: "مسار أقلع لمساعدة شخص يهمك",
    description:
      "لمن يريد دعم صديق، قريب، طالب، زميل، أو شخص يهتم لأمره برسالة أو بطاقة دعم محترمة وآمنة.",
    cta: "ابدأ مسار المساعدة",
  },
  {
    to: "/challenge-pathway",
    title: "مجتمع وتحديات أقلع",
    description:
      "للتحديات، الألعاب التوعوية، الهاشتاقات، دعوة الأصدقاء، النقاط، الأوسمة، بطاقات التوعية، وأثر أقلع المجتمعي.",
    cta: "ادخل التحديات والمجتمع",
  },
];

const PATHS_EN: PathItem[] = [
  {
    to: "/quit-pathway",
    title: "Aqla Virtual Quit Center",
    description:
      "An interactive experience: understand your use, take the assessment, build your plan, follow up, and request support.",
    cta: "Enter Quit Center",
  },
  {
    to: "/learn-train",
    title: "Aqla Academy for Training & Certification",
    description:
      "An interactive academy for training, scenarios, exams, and shareable verifiable certificates.",
    cta: "Enter Academy",
  },
  {
    to: "/help-pathway",
    title: "Aqla Help Pathway",
    description:
      "Support a friend, relative, student, or colleague with a respectful, safe message or support card.",
    cta: "Start Help Pathway",
  },
  {
    to: "/challenge-pathway",
    title: "Aqla Community & Challenges",
    description:
      "Challenges, awareness games, hashtags, invites, points, medals, awareness cards, and community impact.",
    cta: "Enter Community & Challenges",
  },
];


/**
 * Cinematic hero: headline + supporting copy fade in, then dissolve into a
 * clean square frame that houses a rotating set of pathway cards.
 */
export function CinematicHero({ isAr }: Props) {
  const [stage, setStage] = useState<0 | 1 | 2 | 3>(0);
  // 0: initial / 1: title in / 2: subtext in / 3: dissolve
  const [pathIdx, setPathIdx] = useState(0);

  const PATHS = isAr ? PATHS_AR : PATHS_EN;

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 250);
    const t2 = setTimeout(() => setStage(2), 1400);
    const t3 = setTimeout(() => setStage(3), 6200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // After dissolve, cycle path cards every 5s
  useEffect(() => {
    if (stage !== 3) return;
    const id = setInterval(() => {
      setPathIdx((i) => (i + 1) % PATHS.length);
    }, 5000);
    return () => clearInterval(id);
  }, [stage, PATHS.length]);


  const dissolved = stage === 3;

  return (
    <section className="relative overflow-hidden min-h-[640px]">
      <style>{css}</style>

      {/* soft cinematic backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 aqla-cine-bg" />
      <div aria-hidden className="pointer-events-none absolute inset-0 aqla-cine-vignette" />

      {/* Cinematic 3D cube background — drifts on all axes with sparkling vertices */}
      <CubeBackdrop />

      {/* Clickable cycling pathway card — appears inside the square after dissolve */}
      {dissolved && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-[300px] sm:w-[340px]">
          {PATHS.map((p, i) => (
            <Link
              key={p.to}
              to={p.to}
              aria-hidden={i !== pathIdx}
              tabIndex={i === pathIdx ? 0 : -1}
              className={`group absolute inset-0 block rounded-3xl border border-white/10 bg-background/55 p-5 text-center backdrop-blur-xl shadow-[0_20px_60px_-20px_color-mix(in_oklab,var(--primary)_45%,transparent)] transition-all duration-[900ms] ease-out ${
                i === pathIdx
                  ? "opacity-100 scale-100 blur-0 pointer-events-auto"
                  : "opacity-0 scale-95 blur-sm pointer-events-none"
              }`}
              style={{ direction: isAr ? "rtl" : "ltr" }}
            >
              <div className="mx-auto mb-3 grid h-8 w-8 place-items-center rounded-full bg-primary/15">
                <span className="aqla-emblem-dot" />
              </div>
              <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-foreground">
                {p.title}
              </h3>
              <p className="mt-2 text-[12px] leading-6 text-foreground/70 line-clamp-3">
                {p.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[12.5px] font-medium text-primary-foreground transition-transform group-hover:scale-[1.03]">
                {p.cta}
                <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
              </span>
            </Link>
          ))}

          {/* Pager dots */}
          <div
            className="absolute left-1/2 -translate-x-1/2 flex gap-1.5"
            style={{ top: "calc(100% + 18px)" }}
          >
            {PATHS.map((_, i) => (
              <button
                key={i}
                onClick={() => setPathIdx(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === pathIdx ? "w-6 bg-primary" : "w-1.5 bg-foreground/25 hover:bg-foreground/45"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      <div
        className={`relative mx-auto max-w-3xl px-4 pt-20 pb-12 sm:pt-28 sm:pb-16 ${
          isAr ? "text-right" : "text-left"
        } md:text-center`}
      >
        {/* Title */}

        <h1
          className={`text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl transition-all duration-[1200ms] ease-out ${
            stage >= 1 && !dissolved
              ? "opacity-100 translate-y-0 blur-0"
              : stage === 0
              ? "opacity-0 translate-y-4 blur-md"
              : "opacity-0 -translate-y-2 blur-md scale-105"
          }`}
          style={{
            textShadow: "0 0 40px color-mix(in oklab, var(--primary) 25%, transparent)",
          }}
        >
          {isAr ? "أقلع" : "Aqla"}
        </h1>

        {/* Supervisor line */}
        <p
          className={`mx-auto mt-8 max-w-2xl text-[15px] leading-7 text-foreground/80 sm:text-base transition-all duration-[1000ms] ease-out ${
            stage >= 2 && !dissolved
              ? "opacity-100 translate-y-0 blur-0"
              : stage < 2
              ? "opacity-0 translate-y-3 blur-sm"
              : "opacity-0 -translate-y-1 blur-sm"
          }`}
          style={{ transitionDelay: stage >= 2 && !dissolved ? "0ms" : "0ms" }}
        >
          {isAr
            ? "بإشراف سعادة الدكتور مالك عبدالملك الذبياني وفريق من الأخصائيين المدربين."
            : "Supervised by Dr. Malik Abdulmalik AlThubayani and a team of trained specialists."}
        </p>

        {/* Mission paragraph */}
        <p
          className={`mx-auto mt-4 max-w-2xl text-[12.5px] leading-7 text-foreground/55 sm:text-[13px] transition-all duration-[1200ms] ease-out ${
            stage >= 2 && !dissolved
              ? "opacity-100 translate-y-0 blur-0"
              : stage < 2
              ? "opacity-0 translate-y-3 blur-sm"
              : "opacity-0 -translate-y-1 blur-sm"
          }`}
          style={{ transitionDelay: stage >= 2 && !dissolved ? "250ms" : "0ms" }}
        >
          {isAr
            ? "في أقلع، نضع صحة الإنسان وجودة الحياة في قلب رسالتنا، ونسعى لجعل أول خطوة للإقلاع أسهل، وأقرب، وأكثر إنسانية — بما يتماشى مع مستهدفات رؤية المملكة 2030 بقيادة صاحب السمو الملكي الأمير محمد بن سلمان بن عبدالعزيز آل سعود."
            : "At Aqla, we place human health and quality of life at the heart of our mission, striving to make the first step toward cessation easier, closer, and more humane — in alignment with Vision 2030 under HRH Crown Prince Mohammed bin Salman."}
        </p>

      </div>
    </section>
  );
}

function CubeBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;
    let raf = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    // 8 cube vertices
    const vertices: Array<[number, number, number]> = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
    ];
    // 12 edges
    const edges: Array<[number, number]> = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
    ];

    // Get current theme foreground color
    const getColor = () => {
      const raw = getComputedStyle(document.documentElement).getPropertyValue("--foreground").trim() || "#000";
      // If it's a CSS color in oklch/lab format, canvas may not parse it well.
      // Fallback to a safe rgba based on theme.
      return raw;
    };

    const parseColor = (raw: string) => {
      const temp = document.createElement("div");
      temp.style.color = raw;
      temp.style.position = "absolute";
      temp.style.opacity = "0";
      document.body.appendChild(temp);
      const computed = getComputedStyle(temp).color;
      document.body.removeChild(temp);
      return computed;
    };

    const rgbToValues = (rgb: string) => {
      const m = rgb.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/);
      if (!m) return [0, 0, 0];
      return [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])];
    };

    const project = (x: number, y: number, z: number, focal: number, cx: number, cy: number) => {
      const scale = focal / (focal + z);
      return { x: cx + x * scale, y: cy + y * scale, scale };
    };

    const rotate = (x: number, y: number, z: number, rx: number, ry: number, rz: number) => {
      // rotate around X
      let y1 = y * Math.cos(rx) - z * Math.sin(rx);
      let z1 = y * Math.sin(rx) + z * Math.cos(rx);
      // rotate around Y
      let x2 = x * Math.cos(ry) + z1 * Math.sin(ry);
      let z2 = -x * Math.sin(ry) + z1 * Math.cos(ry);
      // rotate around Z
      let x3 = x2 * Math.cos(rz) - y1 * Math.sin(rz);
      let y3 = x2 * Math.sin(rz) + y1 * Math.cos(rz);
      return [x3, y3, z2];
    };

    const start = performance.now();

    const render = (now: number) => {
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const baseSize = Math.min(width, height) * 0.16;
      const focal = Math.min(width, height) * 1.6;

      // Complex drift: forward/backward (z), side (x), up/down (y)
      const driftX = Math.sin(t * 0.17) * width * 0.04 + Math.cos(t * 0.31) * width * 0.02;
      const driftY = Math.cos(t * 0.23) * height * 0.035 + Math.sin(t * 0.41) * height * 0.015;
      const driftZ = Math.sin(t * 0.13) * focal * 0.12 + Math.cos(t * 0.19) * focal * 0.05;

      // Rotation speeds on all axes
      const rx = t * 0.25 + Math.sin(t * 0.1) * 0.3;
      const ry = t * 0.35 + Math.cos(t * 0.15) * 0.4;
      const rz = t * 0.18 + Math.sin(t * 0.08) * 0.2;

      const rawColor = getColor();
      const parsed = parseColor(rawColor);
      const [r, g, b] = rgbToValues(parsed);

      const projected = vertices.map(([vx, vy, vz]) => {
        const [rxv, ryv, rzv] = rotate(vx * baseSize, vy * baseSize, vz * baseSize, rx, ry, rz);
        return project(rxv + driftX, ryv + driftY, rzv + driftZ, focal, cx, cy);
      });

      // Draw edges with depth fade — very subtle background-only feel
      ctx.lineWidth = 1.2;
      ctx.lineCap = "round";
      edges.forEach(([a, b]) => {
        const pa = projected[a];
        const pb = projected[b];
        const avgZ = (vertices[a][2] + vertices[b][2]) / 2;
        const depthAlpha = 0.1 + 0.15 * Math.max(0, (avgZ + 1) / 2);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${depthAlpha})`;
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();
      });

      // Sparkling stars at vertices — fade completely in and out
      projected.forEach((p, i) => {
        const phase = (t * 0.8 + i * 1.3) % (Math.PI * 2);
        const sparkle = Math.max(0, Math.sin(phase));
        if (sparkle < 0.05) return;
        const starSize = 1.5 + sparkle * 3.5;
        const alpha = sparkle * 0.55;

        // soft glow
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, starSize * 3);
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * 0.5})`);
        grad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${alpha * 0.15})`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, starSize * 3, 0, Math.PI * 2);
        ctx.fill();

        // 4-point star cross
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(p.x - starSize, p.y);
        ctx.lineTo(p.x + starSize, p.y);
        ctx.moveTo(p.x, p.y - starSize);
        ctx.lineTo(p.x, p.y + starSize);
        ctx.stroke();

        // center dot
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1, 0, Math.PI * 2);
        ctx.fill();
      });

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}

const css = `
@keyframes aqla-bg-shift {
  0% { background-position: 0% 50%, 100% 0%; }
  50% { background-position: 100% 50%, 0% 100%; }
  100% { background-position: 0% 50%, 100% 0%; }
}
.aqla-cine-bg {
  background:
    radial-gradient(60% 50% at 50% 40%, color-mix(in oklab, var(--primary) 10%, transparent), transparent 70%),
    radial-gradient(50% 60% at 80% 80%, color-mix(in oklab, var(--primary) 8%, transparent), transparent 70%);
  background-size: 200% 200%, 200% 200%;
  animation: aqla-bg-shift 18s ease-in-out infinite;
}
.aqla-cine-vignette {
  background: radial-gradient(80% 70% at 50% 45%, transparent 55%, color-mix(in oklab, var(--background) 90%, transparent) 100%);
}
.aqla-emblem-dot {
  width: 10px; height: 10px; border-radius: 9999px;
  background: linear-gradient(135deg, oklch(0.8 0.16 220), oklch(0.65 0.2 300));
  animation: aqla-emblem 2.4s ease-in-out infinite;
}
@keyframes aqla-emblem { 0%,100% { box-shadow: 0 0 0 0 color-mix(in oklab, var(--primary) 40%, transparent);} 50% { box-shadow: 0 0 0 10px transparent;} }

/* --- Cube backdrop is now drawn on a canvas for true 3D projection --- */
`;

