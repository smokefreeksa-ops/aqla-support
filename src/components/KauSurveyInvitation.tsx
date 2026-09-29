import { useEffect, useRef, useState } from "react";

import SaudiFlagWave from "@/components/SaudiFlagWave";

// KAU Health Promotion Center needs assessment (anonymous; saves to its own Google Sheet).
export const KAU_SURVEY_URL = "https://smokesfreeksa.com/kau-tobacco-survey.html";
const STORAGE_KEY = "aqla_kau_survey_dismissed";

type Lang = "ar" | "en";

const COPY: Record<Lang, {
  dir: "rtl" | "ltr";
  center: string;
  unit: string;
  audience: string;
  title: string;
  body: string;
  meta: string;
  cta: string;
  skip: string;
  close: string;
}> = {
  ar: {
    dir: "rtl",
    center: "مركز تعزيز الصحة — جامعة الملك عبدالعزيز",
    unit: "وحدة مكافحة التدخين والوقاية من المخدرات",
    audience: "لطلاب ومنسوبي جامعة الملك عبدالعزيز",
    title: "تقييم احتياجات التبغ والنيكوتين وخدمات الإقلاع",
    body: "يهدف هذا التقييم إلى التعرف على أنماط استخدام التبغ والنيكوتين، ومدى المعرفة بالخدمات واللوائح ذات العلاقة، واحتياجات الإقلاع؛ بما يسهم في تطوير خدمات وبرامج الجامعة.",
    meta: "المدة المتوقعة: 5–7 دقائق · لن يُطلب منك إدخال اسمك أو بريدك الإلكتروني",
    cta: "ابدأ التقييم",
    skip: "لست من طلاب أو منسوبي الجامعة — تخطي",
    close: "إغلاق",
  },
  en: {
    dir: "ltr",
    center: "Health Promotion Center — King Abdulaziz University",
    unit: "Tobacco Control and Drug Prevention Unit",
    audience: "For KAU students and staff",
    title: "Tobacco, nicotine and cessation services needs assessment",
    body: "This assessment examines tobacco and nicotine use, awareness of relevant services and regulations, and cessation needs to inform the development of University services and programmes.",
    meta: "Estimated time: 5–7 minutes · You will not be asked to enter your name or email address",
    cta: "Start the assessment",
    skip: "Not a KAU student or staff member — skip",
    close: "Close",
  },
};

/**
 * Sits "behind" the study invitation: it appears only after that panel has been
 * closed (skip, join, Escape, back) — or straight away if it was already
 * dismissed earlier in this visit. Shown once per browser session.
 */
export function KauSurveyInvitation() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState<Lang>("ar");
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const t = COPY[lang];

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.pathname.startsWith("/quit-plan/")) return;
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {
      /* storage unavailable: show once for this page load */
    }
    const w = window as unknown as { __aqlaStudyOverlayOpen?: boolean; __aqlaStudyLeaving?: boolean };
    let shown = false;
    const show = () => {
      if (shown || w.__aqlaStudyLeaving) return;
      shown = true;
      setVisible(true);
    };
    const onStudyClosed = () => window.setTimeout(show, 450);
    window.addEventListener("aqla:study-overlay-closed", onStudyClosed);
    // If the study panel is not on screen (already dismissed this visit), appear on our own.
    const timer = window.setTimeout(() => {
      if (!w.__aqlaStudyOverlayOpen) show();
    }, 700);
    return () => {
      window.removeEventListener("aqla:study-overlay-closed", onStudyClosed);
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!visible) return;
    const r = requestAnimationFrame(() => setMounted(true));
    document.body.style.overflow = "hidden";
    const focusId = window.setTimeout(() => dialogRef.current?.focus(), 40);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(r);
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(focusId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  function persist() {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  }
  function dismiss() {
    persist();
    setMounted(false);
    window.setTimeout(() => setVisible(false), 300);
  }
  function start() {
    window.open(KAU_SURVEY_URL, "_blank", "noopener,noreferrer");
    dismiss();
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[290] flex flex-col"
      style={{ opacity: mounted ? 1 : 0, transition: "opacity 400ms ease-out" }}
      role="presentation"
    >
      <div aria-hidden className="study-environment pointer-events-none absolute inset-0 z-0" />
      <div className="pointer-events-none absolute inset-0 z-[1] opacity-[0.14] mix-blend-soft-light">
        <SaudiFlagWave />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[3] bg-black/20" />

      {/* Backdrop click = skip */}
      <button
        type="button"
        aria-label={t.close}
        onClick={dismiss}
        className="absolute inset-0 z-[2] cursor-default"
      />

      <div className="pointer-events-none relative z-10 flex h-full flex-col">
        <div className="flex flex-1 items-center justify-center overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
          <div className="relative w-full max-w-[690px]">
            <button
              type="button"
              onClick={dismiss}
              aria-label={t.close}
              className="pointer-events-auto absolute -right-2 -top-3 z-40 flex h-9 w-9 items-center justify-center text-[#006C35] transition-transform duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006C35]/40 md:-right-11 md:-top-4"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" className="h-6 w-6" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="kau-survey-title"
              tabIndex={-1}
              dir={t.dir}
              lang={lang}
              className="pointer-events-auto relative mx-auto w-full overflow-hidden rounded-[32px] bg-white outline-none focus:outline-none focus-visible:outline-none"
              style={{
                fontFamily: '"IBM Plex Sans Arabic", system-ui, sans-serif',
                transform: mounted ? "translateY(0) scale(1)" : "translateY(8px) scale(0.98)",
                transition: "transform 600ms cubic-bezier(0.22,1,0.36,1)",
              }}
            >
              {/* thin gold line, as on the survey page */}
              <div aria-hidden className="h-[4px] w-full" style={{ background: "linear-gradient(90deg,#004D26,#006C35 40%,#C8A24A)" }} />

              <button
                type="button"
                onClick={() => setLang(lang === "ar" ? "en" : "ar")}
                aria-label={lang === "ar" ? "Switch to English" : "التبديل إلى العربية"}
                dir="ltr"
                className="absolute right-5 top-6 z-30 inline-flex items-center gap-[10px] text-[16px] font-semibold leading-none md:right-6 md:text-[15px]"
              >
                <span style={{ color: lang === "ar" ? "#006C35" : "#7F8399" }}>A</span>
                <span aria-hidden className="block h-[20px] w-px bg-[#D5E3DA] md:h-[18px]" />
                <span style={{ color: lang === "en" ? "#006C35" : "#7F8399" }}>E</span>
              </button>

              <div className="px-6 pb-8 pt-16 text-center md:px-10 md:pb-9 md:pt-14">
                <p className="m-0 text-[13px] font-semibold leading-[1.6] md:text-[14px]" style={{ color: "#1B8A4F" }}>
                  {t.center}
                  <br />
                  {t.unit}
                </p>

                <span
                  className="mx-auto mt-4 inline-flex items-center rounded-full px-4 py-1.5 text-[14px] font-semibold md:text-[15px]"
                  style={{ background: "#E8F3EC", color: "#004D26" }}
                >
                  {t.audience}
                </span>

                <h2
                  id="kau-survey-title"
                  className="m-0 mt-4 text-[26px] font-semibold leading-[1.3] md:text-[32px]"
                  style={{ color: "#004D26" }}
                >
                  {t.title}
                </h2>

                <p className="mx-auto mt-4 max-w-[540px] text-[15px] leading-[1.7] md:text-[16.5px]" style={{ color: "#4F6358" }}>
                  {t.body}
                </p>

                <p className="mx-auto mt-3 max-w-[540px] text-[13.5px] font-medium leading-[1.6] md:text-[14px]" style={{ color: "#1B8A4F" }}>
                  {t.meta}
                </p>

                <button
                  type="button"
                  onClick={start}
                  className="mx-auto mt-6 flex h-[58px] w-full max-w-[440px] items-center justify-center rounded-[18px] border-0 text-[19px] font-semibold text-white transition-opacity duration-300 hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006C35]/40 md:h-[62px] md:text-[21px]"
                  style={{ backgroundColor: "#006C35", boxShadow: "0 14px 24px rgba(0, 108, 53, 0.22)" }}
                >
                  {t.cta}
                </button>

                <button
                  type="button"
                  onClick={dismiss}
                  className="mx-auto mt-4 block text-[15px] font-medium"
                  style={{ color: "#7F8399" }}
                >
                  {t.skip}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
