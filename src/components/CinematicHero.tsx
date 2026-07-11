import { useEffect, useState } from "react";
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
  // 8 cube vertices in local space (unit cube, centered)
  const V: Array<[number, number, number]> = [
    [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
    [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
  ];
  // 12 cube edges
  const E: Array<[number, number]> = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ];

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ perspective: "1200px", perspectiveOrigin: "50% 50%" }}
    >
      <div className="aqla-cube-drift absolute left-1/2 top-1/2" style={{ transformStyle: "preserve-3d" }}>
        <div className="aqla-cube-rot" style={{ transformStyle: "preserve-3d" }}>
          <svg
            width="520"
            height="520"
            viewBox="-1.6 -1.6 3.2 3.2"
            style={{
              position: "absolute",
              left: -260,
              top: -260,
              overflow: "visible",
              transformStyle: "preserve-3d",
            }}
          >
            <defs>
              <radialGradient id="aqla-star" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
                <stop offset="40%" stopColor="currentColor" stopOpacity="0.6" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </radialGradient>
            </defs>
            <g style={{ color: "var(--foreground)" }}>
              {E.map(([a, b], i) => {
                const [x1, y1] = V[a];
                const [x2, y2] = V[b];
                return (
                <line
                    key={i}
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="currentColor"
                    strokeOpacity="0.45"
                    strokeWidth="0.012"
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}
              {V.map(([x, y], i) => (
                <g key={i} className="aqla-spark" style={{ transformOrigin: `${x}px ${y}px`, animationDelay: `${(i * 0.55) % 4}s` }}>
                  <circle cx={x} cy={y} r="0.14" fill="url(#aqla-star)" />
                  <circle cx={x} cy={y} r="0.02" fill="currentColor" />
                  {/* 4-point star cross */}
                  <line x1={x - 0.18} y1={y} x2={x + 0.18} y2={y} stroke="currentColor" strokeWidth="0.006" strokeOpacity="0.9" vectorEffect="non-scaling-stroke" />
                  <line x1={x} y1={y - 0.18} x2={x} y2={y + 0.18} stroke="currentColor" strokeWidth="0.006" strokeOpacity="0.9" vectorEffect="non-scaling-stroke" />
                </g>
              ))}
            </g>
          </svg>
        </div>
      </div>
    </div>
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

/* --- Cube backdrop (background only, monochrome) --- */
@keyframes aqla-cube-drift {
  0%   { transform: translate3d(-8%, -4%, -60px); }
  20%  { transform: translate3d( 6%, -8%,  40px); }
  40%  { transform: translate3d(10%,  6%, -30px); }
  60%  { transform: translate3d(-4%, 10%,  80px); }
  80%  { transform: translate3d(-10%, 2%, -50px); }
  100% { transform: translate3d(-8%, -4%, -60px); }
}
@keyframes aqla-cube-rot {
  0%   { transform: rotateX(0deg)   rotateY(0deg)   rotateZ(0deg); }
  25%  { transform: rotateX(45deg)  rotateY(90deg)  rotateZ(15deg); }
  50%  { transform: rotateX(90deg)  rotateY(180deg) rotateZ(-10deg); }
  75%  { transform: rotateX(135deg) rotateY(270deg) rotateZ(20deg); }
  100% { transform: rotateX(180deg) rotateY(360deg) rotateZ(0deg); }
}
.aqla-cube-drift {
  animation: aqla-cube-drift 22s ease-in-out infinite;
  will-change: transform;
}
.aqla-cube-rot {
  animation: aqla-cube-rot 28s linear infinite;
  will-change: transform;
}
@keyframes aqla-spark {
  0%, 100% { opacity: 0; transform: scale(0.4); filter: drop-shadow(0 0 0 currentColor); }
  35%      { opacity: 1; transform: scale(1.35); filter: drop-shadow(0 0 6px currentColor); }
  55%      { opacity: 0.95; transform: scale(1.05); filter: drop-shadow(0 0 3px currentColor); }
  80%      { opacity: 0.3; transform: scale(0.8); filter: drop-shadow(0 0 0 currentColor); }
}
.aqla-spark {
  transform-box: fill-box;
  animation: aqla-spark 4s ease-in-out infinite;
  opacity: 0;
}
`;

