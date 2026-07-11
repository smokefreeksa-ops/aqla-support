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

  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);

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

  // Keyboard nav: ← / → to move between cards once dissolved
  useEffect(() => {
    if (stage !== 3) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setPathIdx((i) => (i + 1) % PATHS.length);
      else if (e.key === "ArrowLeft") setPathIdx((i) => (i - 1 + PATHS.length) % PATHS.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stage, PATHS.length]);

  // Autoplay + smooth progress bar (pauses on hover/focus)
  useEffect(() => {
    if (stage !== 3 || paused) return;
    const duration = 5000;
    const startedAt = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - startedAt) / duration);
      setProgress(p);
      if (p >= 1) {
        setPathIdx((i) => (i + 1) % PATHS.length);
        setProgress(0);
      } else {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [stage, paused, pathIdx, PATHS.length]);


  const dissolved = stage === 3;

  return (
    <section className="aqla-hero-dark relative overflow-hidden min-h-[640px] text-white">
      <style>{css}</style>

      {/* Apple-style dark backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 aqla-cine-bg" />
      <div aria-hidden className="pointer-events-none absolute inset-0 aqla-cine-vignette" />

      {/* Cinematic hexagon backdrop with pure-white sparkles */}
      <CubeBackdrop />

      {/* Skip intro — appears while the intro is still playing */}
      {!dissolved && (
        <button
          type="button"
          onClick={() => setStage(3)}
          className="absolute right-4 top-4 z-20 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-white/80 backdrop-blur-md transition hover:bg-white/10 hover:text-white"
        >
          {isAr ? "تخطي المقدمة" : "Skip intro"}
        </button>
      )}

      {/* Clickable cycling pathway card — appears inside the square after dissolve */}
      {dissolved && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-[300px] sm:w-[340px]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div className="relative aqla-text-drift">
            {/* Slide counter */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[11px] font-medium tracking-wider text-white/60">
              {String(pathIdx + 1).padStart(2, "0")}
              <span className="mx-1 text-white/30">/</span>
              {String(PATHS.length).padStart(2, "0")}
            </div>

            {PATHS.map((p, i) => (
              <Link
                key={p.to}
                to={p.to}
                aria-hidden={i !== pathIdx}
                tabIndex={i === pathIdx ? 0 : -1}
                className={`group absolute inset-0 block rounded-3xl border border-white/10 bg-white/[0.06] p-5 text-center backdrop-blur-2xl shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] transition-all duration-[900ms] ease-out ${
                  i === pathIdx
                    ? "opacity-100 scale-100 blur-0 pointer-events-auto"
                    : "opacity-0 scale-95 blur-sm pointer-events-none"
                }`}
                style={{ direction: isAr ? "rtl" : "ltr" }}
              >
                <div className="mx-auto mb-3 grid h-8 w-8 place-items-center rounded-full bg-white/10">
                  <span className="aqla-emblem-dot" />
                </div>
                <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-white">
                  {p.title}
                </h3>
                <p className="mt-2 text-[12px] leading-6 text-white/70 line-clamp-3">
                  {p.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[12.5px] font-semibold text-black transition-transform group-hover:scale-[1.03]">
                  {p.cta}
                  <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                </span>
              </Link>
            ))}

            {/* Autoplay progress bar */}
            <div
              className="absolute left-1/2 -translate-x-1/2 h-[2px] w-24 overflow-hidden rounded-full bg-white/10"
              style={{ top: "calc(100% + 14px)" }}
            >
              <div
                className="h-full bg-white/80 transition-[width] duration-100 ease-linear"
                style={{ width: `${progress * 100}%` }}
              />
            </div>

            {/* Pager dots */}
            <div
              className="absolute left-1/2 -translate-x-1/2 flex gap-1.5"
              style={{ top: "calc(100% + 26px)" }}
            >
              {PATHS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setPathIdx(i);
                    setProgress(0);
                  }}
                  aria-label={`Slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === pathIdx ? "w-6 bg-white" : "w-1.5 bg-white/30 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div
        className={`relative mx-auto max-w-3xl px-4 pt-20 pb-12 sm:pt-28 sm:pb-16 aqla-text-drift ${
          isAr ? "text-right" : "text-left"
        } md:text-center`}
      >

        {/* Title */}

        <h1
          className={`text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl transition-all duration-[1200ms] ease-out ${
            stage >= 1 && !dissolved
              ? "opacity-100 translate-y-0 blur-0"
              : stage === 0
              ? "opacity-0 translate-y-4 blur-md"
              : "opacity-0 -translate-y-2 blur-md scale-105"
          }`}
          style={{
            textShadow: "0 0 60px rgba(255,255,255,0.25)",
          }}
        >
          {isAr ? "أقلع" : "Aqla"}
        </h1>

        {/* Supervisor line */}
        <p
          className={`mx-auto mt-8 max-w-2xl text-[15px] leading-7 text-white/80 sm:text-base transition-all duration-[1000ms] ease-out ${
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
          className={`mx-auto mt-4 max-w-2xl text-[12.5px] leading-7 text-white/55 sm:text-[13px] transition-all duration-[1200ms] ease-out ${
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

    // Single centered hexagon — 6 vertices, each with fully independent jitter phases
    const VERTEX_COUNT = 6;
    const vertexJitter = Array.from({ length: VERTEX_COUNT }, () => ({
      rPhase: Math.random() * Math.PI * 2,
      rSpeed: 0.25 + Math.random() * 0.55,
      rAmp: 0.04 + Math.random() * 0.09, // fraction of radius (breathing)
      tPhase: Math.random() * Math.PI * 2,
      tSpeed: 0.18 + Math.random() * 0.5,
      tAmp: 0.05 + Math.random() * 0.12, // radians (tangential wobble)
      xPhase: Math.random() * Math.PI * 2,
      xSpeed: 0.7 + Math.random() * 1.3,
      yPhase: Math.random() * Math.PI * 2,
      ySpeed: 0.7 + Math.random() * 1.3,
      jAmp: 3 + Math.random() * 6, // px (micro-jitter)
      sPhase: Math.random() * Math.PI * 2,
      sSpeed: 0.4 + Math.random() * 1.0,
    }));




    // (Colors are hardcoded to pure white in the render loop for the Apple-dark theme.)

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
      const baseRadius = Math.min(width * 0.44, height * 0.46);

      // Pure white for Apple-dark theme
      const r = 255, g = 255, b = 255;

      // Compute each vertex position with fully independent jitter
      const vertices = vertexJitter.map((j, i) => {
        const baseAngle = (i / VERTEX_COUNT) * Math.PI * 2 - Math.PI / 2; // flat-top-ish
        const tWobble = Math.sin(j.tPhase + t * j.tSpeed) * j.tAmp;
        const angle = baseAngle + tWobble;
        const rBreath = 1 + Math.sin(j.rPhase + t * j.rSpeed) * j.rAmp;
        const radius = baseRadius * rBreath;
        const jx = Math.sin(j.xPhase + t * j.xSpeed) * j.jAmp;
        const jy = Math.cos(j.yPhase + t * j.ySpeed) * j.jAmp;
        return {
          x: cx + Math.cos(angle) * radius + jx,
          y: cy + Math.sin(angle) * radius + jy,
        };
      });

      // Hexagon outline
      ctx.lineWidth = 1;
      ctx.lineCap = "round";
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.18)`;
      ctx.beginPath();
      vertices.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.stroke();

      const drawStar = (px: number, py: number, sparkle: number) => {
        if (sparkle < 0.05) return;
        const starSize = 1.5 + sparkle * 5.5;
        const alpha = sparkle * 0.95;

        // Outer soft glow
        const grad = ctx.createRadialGradient(px, py, 0, px, py, starSize * 5);
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * 0.35})`);
        grad.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${alpha * 0.12})`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, starSize * 5, 0, Math.PI * 2);
        ctx.fill();

        // 4-point shining star
        const outer = starSize * 2.4;
        const inner = starSize * 0.35;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = (i * Math.PI) / 4 - Math.PI / 2;
          const rad = i % 2 === 0 ? outer : inner;
          const x = px + Math.cos(a) * rad;
          const y = py + Math.sin(a) * rad;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fill();

        // Bright white core
        const coreGrad = ctx.createRadialGradient(px, py, 0, px, py, starSize * 1.3);
        coreGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        coreGrad.addColorStop(0.5, `rgba(255, 255, 255, ${alpha * 0.5})`);
        coreGrad.addColorStop(1, `rgba(255, 255, 255, 0)`);
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(px, py, starSize * 1.3, 0, Math.PI * 2);
        ctx.fill();

        // Tiny bright center dot
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, 0.8 + sparkle * 1.4, 0, Math.PI * 2);
        ctx.fill();
      };

      // Vertex sparkles — each vertex twinkles on its own random phase
      vertices.forEach((p, i) => {
        const j = vertexJitter[i];
        const sparkle = Math.max(0, Math.sin(j.sPhase + t * j.sSpeed));
        drawStar(p.x, p.y, 0.35 + sparkle * 0.65);
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
.aqla-hero-dark {
  /* Apple-style deep space */
  background:
    radial-gradient(120% 80% at 50% 0%, #10131a 0%, #06070a 55%, #000 100%);
}
.aqla-cine-bg {
  background:
    radial-gradient(50% 40% at 50% 30%, rgba(120, 170, 255, 0.10), transparent 70%),
    radial-gradient(45% 55% at 85% 85%, rgba(180, 130, 255, 0.08), transparent 70%),
    radial-gradient(40% 50% at 15% 80%, rgba(100, 200, 255, 0.06), transparent 70%);
  background-size: 220% 220%, 220% 220%, 220% 220%;
  animation: aqla-bg-shift 22s ease-in-out infinite;
}
.aqla-cine-vignette {
  background:
    radial-gradient(90% 80% at 50% 50%, transparent 45%, rgba(0,0,0,0.75) 100%);
}
.aqla-emblem-dot {
  width: 10px; height: 10px; border-radius: 9999px;
  background: linear-gradient(135deg, oklch(0.8 0.16 220), oklch(0.65 0.2 300));
  animation: aqla-emblem 2.4s ease-in-out infinite;
}
@keyframes aqla-emblem { 0%,100% { box-shadow: 0 0 0 0 color-mix(in oklab, var(--primary) 40%, transparent);} 50% { box-shadow: 0 0 0 10px transparent;} }

@keyframes aqla-text-drift {
  0%   { transform: translate3d(0, 0, 0); }
  25%  { transform: translate3d(6px, -4px, 0); }
  50%  { transform: translate3d(-4px, 5px, 0); }
  75%  { transform: translate3d(3px, 3px, 0); }
  100% { transform: translate3d(0, 0, 0); }
}
.aqla-text-drift { animation: aqla-text-drift 24s ease-in-out infinite; }
.aqla-text-drift.absolute { animation: aqla-text-drift 24s ease-in-out infinite; }

/* --- Cube backdrop is now drawn on a canvas for true 3D projection --- */

`;

