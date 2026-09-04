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
  panelHeadline: string;
  panelBody1: string;
  panelBody2: string;
  panelIncentive: string;
  panelQuestion: string;
  panelCta: string;
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
    panelHeadline: "شارك في الدراسة",
    panelBody1: "رأيك يهمنا في فهم دور منتجات النيكوتين الخالية من التبغ",
    panelBody2: "في الحد من أضرار التدخين",
    panelIncentive: "أكمل الاستبيان وادخل السحب للفوز بـ ٥٠٠ ريال سعودي",
    panelQuestion: "هل ستشارك في دراستنا؟",
    panelCta: "نعم، سأشارك الآن",
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
    panelHeadline: "Take part in the study",
    panelBody1: "Your view matters in understanding the role of tobacco-free nicotine products",
    panelBody2: "in reducing the harms of smoking",
    panelIncentive: "Complete the survey and enter the draw to win SAR 500",
    panelQuestion: "Will you take part in our study?",
    panelCta: "Yes, I will take part now",
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

        {/* Backdrop click opens the skip confirmation */}
        <button
          type="button"
          aria-label={isRTL ? "إغلاق" : "Close"}
          onClick={openSkipConfirm}
          className="absolute inset-0 z-[2] cursor-default"
        />



          <div className="pointer-events-none relative z-10 flex h-full flex-col">
            <div className="pointer-events-auto relative z-20">
              <ResearchBanner
                onNavigate={() => {
                  persist();
                  close();
                }}
              />
            </div>
            {/* External pink close — visible touch dismissal on all devices */}
            <button
              type="button"
              onClick={openSkipConfirm}
              aria-label={isRTL ? "إغلاق الدعوة" : "Close invitation"}
              className="pointer-events-auto absolute right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-[#FC0C61] text-white shadow-[0_8px_20px_rgba(252,12,97,0.35)] transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FC0C61]/50"
              style={{ top: "calc(3.5rem + env(safe-area-inset-top, 0px))" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="h-5 w-5" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
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
            className="relative mx-auto w-full max-w-[920px] overflow-hidden rounded-[32px] bg-white outline-none focus:outline-none focus-visible:outline-none md:h-[770px]"
            style={{
              fontFamily: '"IBM Plex Sans Arabic", system-ui, sans-serif',
              transform: mounted ? "translateY(0) scale(1)" : "translateY(8px) scale(0.98)",
              transition: "transform 600ms cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            {/* Logo — upper left */}
            <img
              src={aqlaLogo}
              alt="شعار أقلع — Aqla Logo"
              className="absolute left-5 top-5 h-[46px] w-auto object-contain md:left-10 md:top-7 md:h-[62px]"
            />

            {/* Language switch — upper right */}
            <button
              type="button"
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              aria-label={lang === "ar" ? "Switch to English" : "التبديل إلى العربية"}
              dir="ltr"
              className="absolute right-5 top-5 z-30 inline-flex items-center gap-[10px] text-[16px] font-semibold leading-none md:right-[43px] md:top-[40px] md:text-[20px]"
            >
              <span style={{ color: lang === "ar" ? "#FC0C61" : "#7F8399" }}>A</span>
              <span aria-hidden className="block h-[20px] w-px bg-[#DADFEC] md:h-[25px]" />
              <span style={{ color: lang === "en" ? "#FC0C61" : "#7F8399" }}>E</span>
            </button>

            {step === "invite" ? (
              <div key="invite" className="px-6 pb-24 pt-24 text-center md:px-10 md:pb-0 md:pt-[104px]">
                <h2
                  id="aqla-study-title"
                  className="m-0 text-[34px] font-semibold leading-[1.18] md:text-[56px]"
                  style={{ color: "#FC0C61" }}
                >
                  {t.panelHeadline}
                </h2>

                <p
                  className="mx-auto mt-6 max-w-[525px] text-[16px] font-normal leading-[1.45] md:mt-[29px] md:text-[23.5px]"
                  style={{ color: "#1757D9" }}
                >
                  {t.panelBody1}
                  <br className="hidden md:inline" />{" "}
                  {t.panelBody2}
                </p>

                <p
                  className="mt-4 text-[15px] font-semibold leading-[1.4] md:mt-[21px] md:text-[22.5px]"
                  style={{ color: "#1757D9" }}
                >
                  {t.panelIncentive}
                </p>

                <p
                  className="mt-5 text-[20px] font-semibold leading-[1.25] md:mt-[23px] md:text-[29.5px]"
                  style={{ color: "#1757D9" }}
                >
                  {t.panelQuestion}
                </p>

                <button
                  type="button"
                  onClick={participate}
                  className="mx-auto mt-6 flex h-[60px] w-full max-w-[582px] items-center justify-center rounded-[18px] border-0 text-[20px] font-semibold text-white transition-opacity duration-300 hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FC0C61]/40 md:mt-[24px] md:h-[83px] md:w-[582px] md:rounded-[22px] md:text-[31px]"
                  style={{
                    backgroundColor: "#FC0C61",
                    boxShadow: "0 14px 24px rgba(252, 12, 97, 0.18)",
                  }}
                >
                  {t.panelCta}
                </button>

                {/* Study details — bottom right */}
                <div
                  ref={detailsRef}
                  id="aqla-study-details"
                  role="region"
                  aria-hidden={!open}
                  className="absolute inset-x-6 bottom-[62px] top-auto max-h-[240px] overflow-y-auto text-start transition-opacity duration-300 md:inset-x-[35px] md:top-[500px] md:max-h-[210px]"
                  style={{
                    opacity: open ? 1 : 0,
                    pointerEvents: open ? "auto" : "none",
                    display: open ? "block" : "none",
                  }}
                >
                  <h3 className="text-[15px] font-semibold" style={{ color: "#1757D9" }}>{t.detailsTitle}</h3>
                  <p className="mt-2 text-[13.5px] leading-[1.8]" style={{ color: "#5268A6" }}>{t.p1}</p>
                  <p className="mt-2 text-[13.5px] leading-[1.8]" style={{ color: "#5268A6" }}>{t.p2}</p>
                  <p className="mt-2 text-[13.5px] leading-[1.8]" style={{ color: "#5268A6" }}>
                    {t.ethicsApproval} <span className="font-semibold">{t.ethicsNumber}</span>
                  </p>
                  <p className="mt-2 text-[13.5px] leading-[1.8]" style={{ color: "#5268A6" }}>
                    {t.contactInfo}{" "}
                    <a href="mailto:smokefreeksa@gmail.com" className="font-semibold underline underline-offset-2" style={{ color: "#1757D9" }}>
                      smokefreeksa@gmail.com
                    </a>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(!open)}
                  aria-expanded={open}
                  aria-controls="aqla-study-details"
                  className="absolute bottom-5 right-5 inline-flex items-center gap-2 border-b border-[#DADFEC] pb-[3px] text-[16px] font-semibold leading-none md:bottom-[27px] md:right-[35px] md:text-[17.5px]"
                  style={{ color: "#5268A6" }}
                >
                  <span>{t.detailsToggle}</span>
                  <IconChevron open={open} />
                </button>
              </div>
            ) : (
              <div key="confirm" dir={t.dir} className="px-6 pb-16 pt-24 text-center md:px-10 md:pt-[140px]">
                <p className="mx-auto max-w-[560px] text-[19px] font-semibold leading-[1.6] md:text-[26px]" style={{ color: "#1757D9" }}>
                  {t.confirmMessage}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    trackEvent("study_skip_join_study");
                    participate();
                  }}
                  className="mx-auto mt-8 flex h-[60px] w-full max-w-[582px] items-center justify-center rounded-[18px] text-[20px] font-semibold text-white transition-opacity duration-300 hover:opacity-95 md:h-[83px] md:w-[582px] md:rounded-[22px] md:text-[31px]"
                  style={{ backgroundColor: "#FC0C61", boxShadow: "0 14px 24px rgba(252, 12, 97, 0.18)" }}
                >
                  {t.confirmJoin}
                </button>

                <div className="mt-5 flex flex-col items-center gap-3">
                  <button type="button" onClick={continueToSite} className="text-[16px] font-semibold" style={{ color: "#5268A6" }}>
                    {t.confirmContinue}
                  </button>
                  <button type="button" onClick={goBackToPreviousPage} className="text-[15px] font-normal" style={{ color: "#7F8399" }}>
                    {t.confirmBack}
                  </button>
                </div>
              </div>
            )}
          </div>

      </div>
    </div>
  </div>
</>
  );
}
