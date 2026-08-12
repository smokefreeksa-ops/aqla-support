import { useEffect, useRef, useState } from "react";
import { ResearchBanner } from "@/components/ResearchBanner";
import SaudiFlagWave from "@/components/SaudiFlagWave";
import aqlaLogo from "@/assets/aqla-logo.png";




// Background now rendered by SaudiFlagWave.

const REDCAP_URL = "https://redcap.kau.edu.sa/surveys/?s=FLJKYNNLYEA7HXAM";
const STORAGE_KEY = "aqla_study_overlay_dismissed";

type Lang = "ar" | "en";

const COPY: Record<Lang, {
  dir: "rtl" | "ltr";
  eyebrow: string;
  university: string;
  title: string;
  prizeSubtitle: string;
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
    prizeSubtitle: "شارك في الاستبيان وادخل السحب للفوز بـ ٥٠٠ ريال سعودي",
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
    prizeSubtitle: "Take the survey and enter the draw to win SAR 500",
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

// Background now rendered by SaudiFlagWave.

export function StudyInvitationOverlay() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState<Lang>("ar");
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const t = COPY[lang];

  useEffect(() => {
    // Never cover the personal plan page — it blocks the PDF download button.
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/quit-plan/")) return;
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
    const onDismiss = () => close();
    window.addEventListener("keydown", onKey);
    window.addEventListener("aqla:dismiss-study-overlay", onDismiss);
    return () => {
      cancelAnimationFrame(r);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("aqla:dismiss-study-overlay", onDismiss);
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
        {/* Deep Saudi-green environment */}
        <div aria-hidden className="study-environment pointer-events-none absolute inset-0 z-0" />
        {/* Flag kept only as a subtle texture underneath the green field */}
        <div className="pointer-events-none absolute inset-0 z-[1] opacity-[0.14] mix-blend-soft-light">
          <SaudiFlagWave />
        </div>


          <div className="relative z-10 flex h-full flex-col">
           <ResearchBanner />
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
            className="crystal-shell relative flex max-h-[78%] w-full flex-col outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c]/40"
            style={{
              width: "min(94%, clamp(520px, 68vw, 940px))",

              transform: mounted ? "translateY(0) scale(1)" : "translateY(8px) scale(0.98)",
              transition: "transform 600ms cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            <div className="crystal-panel flex max-h-full min-h-0 flex-col">
              <div aria-hidden className="crystal-facets-outer" />
              <div aria-hidden className="crystal-facets-perimeter" />
              <div aria-hidden className="crystal-inner-highlight" />
              <div aria-hidden className="crystal-planes" />
              <div aria-hidden className="crystal-bevel-3" />
              <div aria-hidden className="crystal-specular" />
              <div aria-hidden className="crystal-corner-brilliance" />
              <div aria-hidden className="crystal-dispersion" />
              <div aria-hidden className="crystal-flares" />
              <div aria-hidden className="crystal-edge-light" />
              <div aria-hidden className="glass-frost" />
              <div aria-hidden className="glass-noise" />



        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/50 to-transparent"
        />

        {/* Language switch */}
        <div className={`absolute top-3 ${isRTL ? "left-3" : "right-3"} z-10`}>
          <button
            type="button"
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="inline-flex h-8 min-w-[40px] items-center justify-center rounded-full border border-[#0b3a25]/15 bg-[#0b3a25]/[0.04] px-3 text-[11px] font-medium tracking-wide text-[#2d5a45] transition-colors duration-300 hover:bg-[#0b3a25]/[0.09] hover:text-[#0b3a25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c]/50"
            aria-label={lang === "ar" ? "Switch to English" : "التبديل إلى العربية"}
          >
            {t.langSwitchOther}
          </button>
        </div>

        <div className="relative z-10 flex flex-col gap-6 px-7 pb-8 pt-12 sm:px-10 sm:pt-14">
          {/* Logo */}
          <div className="flex justify-center">
            <img
              src={aqlaLogo}
              alt="شعار أقلع — Aqla Logo"
              className="h-12 w-auto object-contain drop-shadow-[0_3px_14px_rgba(11,58,37,0.28)] sm:h-14"
            />
          </div>

          {/* Eyebrow */}
          <div className="flex flex-col items-center gap-1.5 text-center">
            <div className="flex items-center gap-2">
              <span aria-hidden className="h-px w-6 bg-[#c9a84c]/60" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#96751c]">
                {t.eyebrow}
              </span>
              <span aria-hidden className="h-px w-6 bg-[#c9a84c]/60" />
            </div>
            <span className="text-[13px] font-medium text-[#2d5a45]">
              {t.university}
            </span>
          </div>

          {/* Title */}
          <h2
            id="aqla-study-title"
            className={`text-center font-bold tracking-tight text-[#0b3a25] ${
              isRTL
                ? "text-[22px] leading-[1.55] sm:text-[25px]"
                : "text-[21px] leading-[1.45] sm:text-[24px]"
            }`}
          >
            {t.title}
          </h2>

          {/* Prize subtitle */}
          <p className="text-center text-[13.5px] font-bold text-[#8a6a1c] sm:text-[15px]">
            {t.prizeSubtitle}
          </p>


          {/* Actions */}
          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={participate}
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #0d4a2e 0%, #06381f 52%, #0f5636 100%)",
                boxShadow:
                  "inset 0 0 0 1px rgba(201,168,76,0.75), 0 14px 30px -16px rgba(6,56,31,0.65)",
              }}
              className="group relative inline-flex min-h-[50px] w-full items-center justify-center overflow-hidden rounded-2xl px-6 text-[15px] font-bold text-[#f3e6c0] transition-all duration-300 hover:brightness-[1.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none"
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
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-2xl border border-[#0b3a25]/15 bg-transparent px-6 text-[13.5px] font-medium text-[#5a7a6a] transition-colors duration-300 hover:border-[#0b3a25]/28 hover:bg-[#0b3a25]/[0.04] hover:text-[#0b3a25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b3a25]/25 motion-reduce:transition-none"
            >
              {t.skip}
            </button>
          </div>

          {/* Details toggle */}
          <div className="border-t border-[#0b3a25]/12 pt-2">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="aqla-study-details"
              className="mx-auto inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-full px-3 text-[12.5px] font-medium tracking-wide text-[#5a7a6a] transition-colors duration-300 hover:text-[#0b3a25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b3a25]/25"
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
                <div className="mt-3 max-h-[42vh] overflow-y-auto rounded-2xl border border-[#0b3a25]/12 bg-[#0b3a25]/[0.03] p-5">
                  <h3 className="text-[14px] font-bold text-[#0b3a25]">
                    {t.detailsTitle}
                  </h3>
                  <p className="mt-3 text-[13.5px] leading-[1.85] text-[#2d5a45]">{t.p1}</p>
                  <p className="mt-2 text-[13.5px] leading-[1.85] text-[#2d5a45]">{t.p2}</p>
                  <p className="mt-2 text-[13.5px] leading-[1.85] text-[#2d5a45]">
                    {t.p3Prefix} <span className="font-bold text-[#a8862f]">{t.p3Amount}</span>.
                  </p>

                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {[t.voluntary, t.confidential, t.anonymous, t.prize].map((label, i) => (
                      <li
                        key={i}
                        className="rounded-full border border-[#0b3a25]/12 bg-[#0b3a25]/[0.03] px-2.5 py-1 text-[11.5px] text-[#2d5a45]"
                      >
                        {label}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex items-center gap-2 text-[12.5px] text-[#2d5a45]">
                    <span className="text-[#5a7a6a]">{t.contactLabel}</span>
                    <a
                      href="mailto:smokefreeksa@gmail.com"
                      className="min-w-0 truncate font-semibold text-[#a8862f] underline decoration-[#c9a84c]/50 underline-offset-2 transition-colors hover:decoration-[#c9a84c]"
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
  </div>
</>
  );
}
