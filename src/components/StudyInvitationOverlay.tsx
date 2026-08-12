import { useEffect, useRef, useState } from "react";

import SaudiFlagWave from "@/components/SaudiFlagWave";
import { ResearchBanner } from "@/components/ResearchBanner";
import { trackEvent } from "@/lib/track-event";
import aqlaLogo from "@/assets/aqla-logo-transparent.png";





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
  ethicsApproval: string;
  ethicsNumber: string;
  contactInfo: string;
  contactLabel: string;
  voluntary: string;
  confidential: string;
  anonymous: string;
  prize: string;
  langSwitchOther: string;
  confirmMessage: string;
  confirmJoin: string;
  confirmContinue: string;
  confirmBack: string;
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
    detailsTitle: "تفاصيل الدراسة",
    p1: "هذه دراسة بحثية من جامعة الملك عبدالعزيز تهدف إلى فهم آراء وتجارب البالغين حول استخدام منتجات النيكوتين الخالية من التبغ ودورها المحتمل في الحد من أضرار التدخين.",
    p2: "المشاركة طوعية، وستُعامل إجاباتك بسرية وتُستخدم لأغراض البحث العلمي فقط.",
    ethicsApproval: "تمت الموافقة على الدراسة من لجنة أخلاقيات البحث بجامعة الملك عبدالعزيز",
    ethicsNumber: "رقم الموافقة: 26-162",
    contactInfo: "للمزيد من المعلومات أو الاستفسارات حول الدراسة:",
    contactLabel: "البريد الإلكتروني:",
    voluntary: "المشاركة تطوعية",
    confidential: "إجابات سرية",
    anonymous: "مجهولة الهوية",
    prize: "سحب على ٥٠٠ ريال سعودي",
    langSwitchOther: "English",
    confirmMessage: "قبل أن تتابع، نأمل أن تفكر في المشاركة في الدراسة — مشاركتك تهمنا.",
    confirmJoin: "شارك في الدراسة",
    confirmContinue: "متابعة إلى الموقع",
    confirmBack: "العودة للصفحة السابقة",
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
    detailsTitle: "Study details",
    p1: "This is a research study by King Abdulaziz University aimed at understanding the opinions and experiences of adults regarding the use of tobacco-free nicotine products and their potential role in reducing the harms of smoking.",
    p2: "Participation is voluntary, your answers will be treated confidentially, and will be used for research purposes only.",
    ethicsApproval: "The study was approved by the Research Ethics Committee of King Abdulaziz University",
    ethicsNumber: "Approval number: 26-162",
    contactInfo: "For more information or inquiries about the study:",
    contactLabel: "Email:",
    voluntary: "Voluntary participation",
    confidential: "Confidential answers",
    anonymous: "Anonymous responses",
    prize: "SAR 500 prize draw",
    langSwitchOther: "العربية",
    confirmMessage: "Before you continue, please consider taking part in the study — your participation matters.",
    confirmJoin: "Join the study",
    confirmContinue: "Continue to website",
    confirmBack: "Go back",
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
      className="h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
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
  const [step, setStep] = useState<"invite" | "confirm">("invite");
  const [launching, setLaunching] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const detailsRef = useRef<HTMLDivElement | null>(null);
  const pushedRef = useRef(false);
  const visibleRef = useRef(false);
  const initializedRef = useRef(false);
  const dismissingRef = useRef(false);
  const historyEntryIdRef = useRef<string | null>(null);
  const t = COPY[lang];

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Never cover the personal plan page — it blocks the PDF download button.
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/quit-plan/")) return;
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {
      // Storage can be unavailable in privacy-restricted browsers. The
      // invitation still gets one history-aware entry for this mount.
    }

    const entryId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `study-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    try {
      window.history.pushState(
        {
          ...(window.history.state ?? {}),
          studyInvitationOpen: true,
          aqlaStudyOverlayId: entryId,
        },
        "",
        window.location.href,
      );
      historyEntryIdRef.current = entryId;
      pushedRef.current = true;
    } catch {
      // If History API access fails, retain normal state-only dismissal.
    }

    visibleRef.current = true;
    setVisible(true);
  }, []);

  useEffect(() => {
    const onPop = (event: PopStateEvent) => {
      const state = event.state as
        | { studyInvitationOpen?: boolean; aqlaStudyOverlayId?: string }
        | null;
      const isOwnedOverlayEntry =
        state?.studyInvitationOpen === true &&
        state.aqlaStudyOverlayId === historyEntryIdRef.current;

      dismissingRef.current = false;

      if (isOwnedOverlayEntry) {
        // An explicit Forward navigation returned to this modal entry.
        // Reopen it without adding another entry or starting a loop.
        pushedRef.current = true;
        visibleRef.current = true;
        setVisible(true);
        return;
      }

      if (pushedRef.current || visibleRef.current) {
        // Back left the temporary modal entry. The browser has already
        // restored the exact underlying URL and history state.
        pushedRef.current = false;
        visibleRef.current = false;
        persist();
        setVisible(false);
      }
    };

    // This listener intentionally remains mounted while the app is mounted.
    // Skip calls history.back() asynchronously, and Forward must also be able
    // to restore the existing modal entry without creating a new one.
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
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
    if (dismissingRef.current) return;
    persist();

    const state = window.history.state as
      | { studyInvitationOpen?: boolean; aqlaStudyOverlayId?: string }
      | null;
    const ownsCurrentEntry =
      pushedRef.current &&
      state?.studyInvitationOpen === true &&
      state.aqlaStudyOverlayId === historyEntryIdRef.current;

    if (ownsCurrentEntry) {
      // Keep the overlay mounted until popstate confirms that the browser has
      // restored the underlying entry. This makes Skip, Escape and backdrop
      // dismissal identical to the browser/system Back action.
      dismissingRef.current = true;
      try {
        window.history.back();
        return;
      } catch {
        dismissingRef.current = false;
      }
    }

    pushedRef.current = false;
    visibleRef.current = false;
    setVisible(false);
  }
  function participate() {
    window.open(REDCAP_URL, "_blank", "noopener,noreferrer");
    close();
  }

  function prefersReducedMotion() {
    try {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      return false;
    }
  }

  function openSkipConfirm() {
    trackEvent("study_skip_clicked");
    setStep("confirm");
  }

  function continueToSite() {
    trackEvent("study_skip_continue_site");
    if (launching) return;
    persist();
    setLaunching(true);
    window.setTimeout(close, prefersReducedMotion() ? 200 : 820);
  }

  function goBackToPreviousPage() {
    trackEvent("study_skip_go_back");
    persist();
    dismissingRef.current = true;
    try {
      // Step past our temporary overlay entry to the real previous page.
      window.history.go(pushedRef.current ? -2 : -1);
      return;
    } catch {
      dismissingRef.current = false;
    }
    close();
  }


  if (!visible) return null;

  const isRTL = t.dir === "rtl";

  return (
    <>
      <div
        className={`fixed inset-0 z-[300] flex flex-col${launching ? " aqla-launching" : ""}`}
        style={{
          opacity: mounted ? 1 : 0,
          transition: "opacity 500ms ease-out",
        }}
        role="presentation"
      >
        {/* Deep Saudi-green environment */}
        <div aria-hidden className="study-environment aqla-launch-fade pointer-events-none absolute inset-0 z-0" />
        {/* Flag kept only as a subtle texture underneath the green field */}
        <div className="pointer-events-none absolute inset-0 z-[1] opacity-[0.14] mix-blend-soft-light">
          <SaudiFlagWave />
        </div>
        {/* Launch light streaks */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
          {launching &&
            [18, 34, 50, 66, 82].map((left, i) => (
              <span
                key={left}
                className="aqla-launch-streak"
                style={{ left: `${left}%`, animationDelay: `${i * 55}ms` }}
              />
            ))}
        </div>

        {/* Backdrop click closes */}
        <button
          type="button"
          aria-label={isRTL ? "إغلاق" : "Close"}
          onClick={close}
          className="absolute inset-0 z-[2] cursor-default"
        />



          <div className="relative z-10 flex h-full flex-col">
            <div className="relative z-20">
              <ResearchBanner />
            </div>
            <div className="flex flex-1 items-center justify-center overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">



          {/* Modal */}
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="aqla-study-title"
            tabIndex={-1}
            dir={t.dir}
            lang={lang}
            className="crystal-shell aqla-launch-panel relative flex max-h-[92%] w-full flex-col outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c]/40"
            style={{
              width: "min(95%, clamp(500px, 61vw, 860px))",


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
        <div className={`absolute top-3 ${isRTL ? "left-3" : "right-3"} z-30`}>
          <button
            type="button"
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="inline-flex h-8 min-w-[40px] items-center justify-center rounded-full border border-[#0b3a25]/15 bg-[#0b3a25]/[0.04] px-3 text-[11px] font-medium tracking-wide text-[#2d5a45] transition-colors duration-300 hover:bg-[#0b3a25]/[0.09] hover:text-[#0b3a25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c]/50"
            aria-label={lang === "ar" ? "Switch to English" : "التبديل إلى العربية"}
          >

            {t.langSwitchOther}
          </button>
        </div>

        <div className="relative z-20 flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-7 pb-6 pt-11 sm:gap-4 sm:px-10 sm:pt-12">

          {/* Logo */}
          <div className="flex justify-center">
            <img
              src={aqlaLogo}
              alt="شعار أقلع — Aqla Logo"
              className="h-[68px] w-auto object-contain drop-shadow-[0_1px_6px_rgba(11,58,37,0.14)] sm:h-24"
            />
          </div>


          {/* Eyebrow */}
          <div className="flex flex-col items-center gap-1.5 text-center">
            <div className="flex items-center gap-2">
              <span aria-hidden className="h-px w-6 bg-[#c9a84c]/60" />
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.3em] text-[#a8862f]">
                {t.eyebrow}
              </span>
              <span aria-hidden className="h-px w-6 bg-[#c9a84c]/60" />
            </div>
            <span className="text-[12px] font-normal tracking-wide text-[#3f6555]">
              {t.university}
            </span>
          </div>

          {step === "invite" ? (
          <div key="invite" className="flex flex-col gap-3.5 sm:gap-4 animate-fade-in">
          {/* Title */}
          <h2
            id="aqla-study-title"
            className={`mx-auto max-w-[36ch] text-balance text-center font-bold tracking-tight text-[#08301e] ${
              isRTL
                ? "text-[23px] leading-[1.75] sm:text-[27px] sm:leading-[1.72]"
                : "text-[22px] leading-[1.55] sm:text-[26px]"
            }`}
          >
            {t.title}
          </h2>

          {/* Prize subtitle */}
          <p className="text-center text-[12.5px] font-semibold tracking-wide text-[#9a7a26] sm:text-[13.5px]">
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
                  "inset 0 0 0 1px rgba(201,168,76,0.9), inset 0 1px 0 rgba(255,244,214,0.28), inset 0 12px 20px -14px rgba(255,255,255,0.35), 0 12px 26px -14px rgba(6,56,31,0.55), 0 2px 6px -2px rgba(6,56,31,0.35)",
              }}
              className="group relative inline-flex min-h-[50px] w-full items-center justify-center overflow-hidden rounded-2xl px-6 text-[15px] font-bold text-[#faf1d8] transition-all duration-300 hover:-translate-y-px hover:brightness-[1.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-[1400ms] ease-out group-hover:translate-x-full"
              />
              <span className="relative">{t.participate}</span>
            </button>

            <button
              type="button"
              onClick={openSkipConfirm}
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-2xl border border-[#0b3a25]/15 bg-transparent px-6 text-[13.5px] font-medium text-[#5a7a6a] transition-colors duration-300 hover:border-[#0b3a25]/28 hover:bg-[#0b3a25]/[0.04] hover:text-[#0b3a25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b3a25]/25 motion-reduce:transition-none"
            >
              {t.skip}
            </button>
          </div>

          {/* Details toggle */}
          <div ref={detailsRef} className="mt-1.5 border-t border-[#0b3a25]/10 pt-3">
            <button
              type="button"
              onClick={() => {
                const next = !open;
                setOpen(next);
                if (next) {
                  window.setTimeout(
                    () => detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
                    260,
                  );
                }
              }}
              aria-expanded={open}
              aria-controls="aqla-study-details"
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-[13.5px] font-medium tracking-[0.02em] text-[#2d5a45] transition-colors duration-300 hover:bg-[#0b3a25]/[0.04] hover:text-[#0b3a25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c]/45"
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
                    {t.ethicsApproval} <span className="font-semibold text-[#0b3a25]">{t.ethicsNumber}</span>
                  </p>
                  <p className="mt-2 text-[13.5px] leading-[1.85] text-[#2d5a45]">{t.contactInfo}</p>

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
          ) : (
          <div key="confirm" dir={t.dir} className="flex flex-col gap-4 animate-fade-in">
            <p className={`mx-auto max-w-[34ch] text-balance text-center font-semibold text-[#08301e] ${
              isRTL ? "text-[17px] leading-[1.9] sm:text-[19px]" : "text-[16.5px] leading-[1.6] sm:text-[18px]"
            }`}>
              {t.confirmMessage}
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  trackEvent("study_skip_join_study");
                  participate();
                }}
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #0d4a2e 0%, #06381f 52%, #0f5636 100%)",
                  boxShadow:
                    "inset 0 0 0 1px rgba(201,168,76,0.9), inset 0 1px 0 rgba(255,244,214,0.28), 0 12px 26px -14px rgba(6,56,31,0.55)",
                }}
                className="group relative inline-flex min-h-[52px] w-full items-center justify-center overflow-hidden rounded-2xl px-6 text-[15px] font-bold text-[#faf1d8] transition-all duration-300 hover:-translate-y-px hover:brightness-[1.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c]/60 motion-reduce:transition-none"
              >
                {t.confirmJoin}
              </button>

              <button
                type="button"
                onClick={continueToSite}
                className="inline-flex min-h-[48px] w-full items-center justify-center rounded-2xl border border-[#0b3a25]/25 bg-[#0b3a25]/[0.04] px-6 text-[14px] font-semibold text-[#0b3a25] transition-colors duration-300 hover:bg-[#0b3a25]/[0.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b3a25]/25 motion-reduce:transition-none"
              >
                {t.confirmContinue}
              </button>

              <button
                type="button"
                onClick={goBackToPreviousPage}
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full px-6 text-[13px] font-medium text-[#5a7a6a] underline-offset-4 transition-colors duration-300 hover:text-[#0b3a25] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b3a25]/20 motion-reduce:transition-none"
              >
                {t.confirmBack}
              </button>
            </div>
          </div>
          )}
        </div>

        </div>

      </div>
      </div>
    </div>
  </div>
</>
  );
}
