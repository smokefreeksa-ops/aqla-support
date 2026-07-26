import { useEffect, useMemo, useRef, useState } from "react";



// Professional rotating galaxy — subtle spiral of particles on canvas.
function GalaxyCanvas() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0, height = 0;

    // Precompute particles in polar coords along a 3-arm logarithmic spiral.
    const ARMS = 3;
    const COUNT = 1400;
    const particles: {
      r: number; // normalized radius 0..1
      a: number; // base angle
      size: number;
      alpha: number;
      hue: number; // 0=gold, 1=white, 2=green tint
      speed: number;
    }[] = [];
    const rand = (i: number, s: number) => {
      const v = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
      return v - Math.floor(v);
    };
    for (let i = 0; i < COUNT; i++) {
      const arm = i % ARMS;
      const t = Math.pow(rand(i, 1), 0.7); // bias inward
      const armAngle = (arm / ARMS) * Math.PI * 2;
      const twist = t * 3.2; // spiral tightness
      const jitter = (rand(i, 2) - 0.5) * 0.55 * (1 - t * 0.4);
      const a = armAngle + twist + jitter;
      const size = rand(i, 3) < 0.9 ? 0.6 + rand(i, 4) * 0.6 : 1.2 + rand(i, 5) * 0.8;
      const alpha = 0.15 + (1 - t) * 0.55 + rand(i, 6) * 0.15;
      const h = rand(i, 7);
      const hue = h < 0.55 ? 1 : h < 0.9 ? 0 : 2;
      const speed = 0.9 + (1 - t) * 0.9; // inner rotates faster
      particles.push({ r: t, a, size, alpha, hue, speed });
    }

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
    }
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    let start = performance.now();

    const colorFor = (hue: number, alpha: number) => {
      if (hue === 0) return `rgba(201,168,76,${alpha})`; // gold
      if (hue === 2) return `rgba(120,190,150,${alpha})`; // green
      return `rgba(255,255,255,${alpha})`;
    };

    function frame(now: number) {
      if (!ctx) return;
      const elapsed = (now - start) / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const cx = width * 0.5;
      const cy = height * 0.5;
      const R = Math.hypot(width, height) * 1.6;

      // Soft core glow
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.5);
      core.addColorStop(0, "rgba(201,168,76,0.16)");
      core.addColorStop(0.35, "rgba(201,168,76,0.05)");
      core.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = core;
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = "lighter";
      const baseRot = reduce ? 0 : elapsed * 0.02; // slow overall rotation

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const angle = p.a + baseRot * p.speed;
        const rad = p.r * R * 0.75;
        const x = cx + Math.cos(angle) * rad;
        const y = cy + Math.sin(angle) * rad * 0.8; // gentle disc flatten
        ctx.fillStyle = colorFor(p.hue, p.alpha);
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ mixBlendMode: "screen" }}
    />
  );
}

const REDCAP_URL = "https://redcap.kau.edu.sa/surveys/?s=FLJKYNNLYEA7HXAM";
const STORAGE_KEY = "aqla_study_overlay_dismissed";

type Lang = "ar" | "en";

const COPY: Record<Lang, {
  dir: "rtl" | "ltr";
  eyebrow: string;
  university: string;
  title: string;
  participate: string;
  skip: string;
  detailsToggle: string;
  detailsTitle: string;
  p1: string;
  p2: string;
  p3Prefix: string;
  p3Amount: string;
  contactLabel: string;
  voluntary: string;
  confidential: string;
  anonymous: string;
  prize: string;
  langSwitchOther: string;
}> = {
  ar: {
    dir: "rtl",
    eyebrow: "دراسة علمية",
    university: "جامعة الملك عبدالعزيز",
    title: "شارك برأيك حول دور منتجات النيكوتين الخالية من التبغ في الحد من أضرار التدخين",
    participate: "شارك في الدراسة",
    skip: "تخطي",
    detailsToggle: "تفاصيل الدراسة",
    detailsTitle: "دور منتجات النيكوتين الخالية من التبغ في الحد من أضرار التدخين",
    p1: "ندعوك للمشاركة في استبيان قصير حول منتجات النيكوتين الخالية من التبغ، وبخاصة أظرف النيكوتين الفموية.",
    p2: "رأيك مهم سواء كنت تستخدم هذه المنتجات أم لا. المشاركة تطوعية، وجميع الإجابات سرية ومجهولة الهوية.",
    p3Prefix: "بعد إكمال الاستبيان، يمكنك الدخول في سحب للفوز بجائزة نقدية قيمتها",
    p3Amount: "٥٠٠ ريال سعودي",
    contactLabel: "للاستفسارات:",
    voluntary: "المشاركة تطوعية",
    confidential: "إجابات سرية",
    anonymous: "مجهولة الهوية",
    prize: "سحب على ٥٠٠ ريال سعودي",
    langSwitchOther: "English",
  },
  en: {
    dir: "ltr",
    eyebrow: "Scientific study",
    university: "King Abdulaziz University",
    title: "Share your view on the role of tobacco-free nicotine products in reducing smoking harm",
    participate: "Take part in the study",
    skip: "Skip",
    detailsToggle: "Study details",
    detailsTitle: "The role of tobacco-free nicotine products in reducing smoking harm",
    p1: "You are invited to take part in a short survey about tobacco-free nicotine products, particularly oral nicotine pouches.",
    p2: "Your view matters whether you use these products or not. Participation is voluntary, and all answers are confidential and anonymous.",
    p3Prefix: "After completing the survey, you can enter a draw to win a cash prize of",
    p3Amount: "SAR 500",
    contactLabel: "For questions:",
    voluntary: "Voluntary participation",
    confidential: "Confidential answers",
    anonymous: "Anonymous responses",
    prize: "SAR 500 prize draw",
    langSwitchOther: "العربية",
  },
};

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

// Luxurious, calm starfield — small bright pinpoints on deep night sky.
function LuxuryStarfield() {
  const stars = useMemo(() => {
    const seed = (i: number, s: number) => {
      const v = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
      return v - Math.floor(v);
    };
    const count = 110;
    return Array.from({ length: count }, (_, i) => {
      const r = seed(i, 1);
      const size = r < 0.78 ? 1 : r < 0.94 ? 1.4 : 2;
      return {
        id: i,
        top: seed(i, 2) * 100,
        left: seed(i, 3) * 100,
        size,
        delay: seed(i, 4) * 8,
        duration: 4 + seed(i, 5) * 6,
        opacity: 0.25 + seed(i, 6) * 0.55,
        glow: size >= 2,
      };
    });
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* deep sky gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 40%, #0a1a14 0%, #05100b 55%, #020806 100%)",
        }}
      />
      {/* subtle aurora wash */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 20% 20%, rgba(201,168,76,0.06), transparent 60%), radial-gradient(ellipse 50% 40% at 80% 80%, rgba(11,58,37,0.35), transparent 60%)",
        }}
      />
      {stars.map((s) => (
        <span
          key={s.id}
          className="absolute rounded-full bg-white star-twinkle motion-reduce:animate-none"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            opacity: s.opacity,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            boxShadow: s.glow ? "0 0 6px rgba(255,255,255,0.7)" : undefined,
          }}
        />
      ))}
    </div>
  );
}

export function StudyInvitationOverlay() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState<Lang>("ar");
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const t = COPY[lang];

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) !== "1") setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    // trigger fade-in next frame
    const r = requestAnimationFrame(() => setMounted(true));
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const id = window.setTimeout(() => dialogRef.current?.focus(), 40);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(r);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  function persist() {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch { /* ignore */ }
  }
  function close() {
    persist();
    setVisible(false);
  }
  function participate() {
    persist();
    window.open(REDCAP_URL, "_blank", "noopener,noreferrer");
    setVisible(false);
  }

  if (!visible) return null;

  const isRTL = t.dir === "rtl";

  return (
    <>
      <div
        className="fixed inset-0 z-[300] flex flex-col"
        style={{
          opacity: mounted ? 1 : 0,
          transition: "opacity 500ms ease-out",
        }}
        role="presentation"
      >
        <LuxuryStarfield />
        <GalaxyCanvas />

        <div className="relative z-10 flex h-full flex-col">
          <div className="flex flex-1 items-center justify-center overflow-hidden px-4 py-4 sm:px-6 sm:py-6">

          {/* Modal */}
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="aqla-study-title"
            tabIndex={-1}
            dir={t.dir}
            lang={lang}
            className="relative flex max-h-[92%] w-full max-w-[520px] flex-col overflow-hidden rounded-[28px] outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c]/40"
            style={{
              background:
                "linear-gradient(160deg, rgba(11,58,37,0.02) 0%, rgba(8,38,24,0.04) 100%)",
              backdropFilter: "blur(2px) saturate(115%)",
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow:
                "0 40px 100px -40px rgba(0,0,0,0.75), 0 0 0 1px rgba(201,168,76,0.06) inset",
              transform: mounted ? "translateY(0) scale(1)" : "translateY(8px) scale(0.98)",
              transition: "transform 600ms cubic-bezier(0.22,1,0.36,1)",
            }}
          >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/40 to-transparent"
        />

        {/* Language switch */}
        <div className={`absolute top-3 ${isRTL ? "left-3" : "right-3"} z-10`}>
          <button
            type="button"
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="inline-flex h-8 min-w-[40px] items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-3 text-[11px] font-medium tracking-wide text-white/75 backdrop-blur transition-colors duration-300 hover:bg-white/[0.09] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c]/40"
            aria-label={lang === "ar" ? "Switch to English" : "التبديل إلى العربية"}
          >
            {t.langSwitchOther}
          </button>
        </div>

        <div className="flex flex-col gap-6 px-7 pb-8 pt-12 sm:px-10 sm:pt-14">
          <ResearchBanner variant="hero" />

          {/* Eyebrow */}
          <div className="flex flex-col items-center gap-1.5 text-center">
            <div className="flex items-center gap-2">
              <span aria-hidden className="h-px w-6 bg-[#c9a84c]/50" />
              <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#c9a84c]">
                {t.eyebrow}
              </span>
              <span aria-hidden className="h-px w-6 bg-[#c9a84c]/50" />
            </div>
            <span className="text-[13px] font-medium text-white/70">
              {t.university}
            </span>
          </div>

          {/* Title */}
          <h2
            id="aqla-study-title"
            className={`text-center font-semibold tracking-tight text-white ${
              isRTL
                ? "text-[22px] leading-[1.55] sm:text-[25px]"
                : "text-[21px] leading-[1.45] sm:text-[24px]"
            }`}
          >
            {t.title}
          </h2>

          {/* Actions */}
          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={participate}
              className="group relative inline-flex min-h-[50px] w-full items-center justify-center overflow-hidden rounded-2xl bg-[#c9a84c] px-6 text-[15px] font-semibold text-[#0b3a25] shadow-[0_14px_30px_-14px_rgba(201,168,76,0.6)] transition-all duration-300 hover:brightness-[1.05] hover:shadow-[0_18px_40px_-14px_rgba(201,168,76,0.75)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b3a25] motion-reduce:transition-none"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-[1400ms] ease-out group-hover:translate-x-full"
              />
              <span className="relative">{t.participate}</span>
            </button>
            <button
              type="button"
              onClick={close}
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-2xl border border-white/12 bg-transparent px-6 text-[13.5px] font-medium text-white/70 transition-colors duration-300 hover:border-white/25 hover:bg-white/[0.04] hover:text-white/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 motion-reduce:transition-none"
            >
              {t.skip}
            </button>
          </div>

          {/* Details toggle */}
          <div className="border-t border-white/8 pt-2">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="aqla-study-details"
              className="mx-auto inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-full px-3 text-[12.5px] font-medium tracking-wide text-white/60 transition-colors duration-300 hover:text-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25"
            >
              <span>{t.detailsToggle}</span>
              <IconChevron open={open} />
            </button>

            <div
              id="aqla-study-details"
              role="region"
              aria-hidden={!open}
              className="grid overflow-hidden transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
              style={{
                gridTemplateRows: open ? "1fr" : "0fr",
                opacity: open ? 1 : 0,
              }}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="mt-3 max-h-[42vh] overflow-y-auto rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                  <h3 className="text-[14px] font-semibold text-white/95">
                    {t.detailsTitle}
                  </h3>
                  <p className="mt-3 text-[13.5px] leading-[1.85] text-white/75">{t.p1}</p>
                  <p className="mt-2 text-[13.5px] leading-[1.85] text-white/75">{t.p2}</p>
                  <p className="mt-2 text-[13.5px] leading-[1.85] text-white/75">
                    {t.p3Prefix} <span className="font-semibold text-[#f0d78c]">{t.p3Amount}</span>.
                  </p>

                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {[t.voluntary, t.confidential, t.anonymous, t.prize].map((label, i) => (
                      <li
                        key={i}
                        className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11.5px] text-white/70"
                      >
                        {label}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex items-center gap-2 text-[12.5px] text-white/70">
                    <span className="text-white/50">{t.contactLabel}</span>
                    <a
                      href="mailto:smokefreeksa@gmail.com"
                      className="min-w-0 truncate font-medium text-[#f0d78c] underline decoration-[#c9a84c]/30 underline-offset-2 transition-colors hover:decoration-[#c9a84c]"
                    >
                      smokefreeksa@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  </div>
</>
  );
}
