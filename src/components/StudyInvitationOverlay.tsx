import { useEffect, useRef, useState } from "react";

const REDCAP_URL = "https://redcap.kau.edu.sa/surveys/?s=FLJKYNNLYEA7HXAM";
const STORAGE_KEY = "aqla_study_overlay_dismissed";

type Lang = "ar" | "en";

const COPY: Record<Lang, {
  dir: "rtl" | "ltr";
  badge: string;
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
  contact: string;
  langSwitchOther: string;
  close: string;
}> = {
  ar: {
    dir: "rtl",
    badge: "دراسة من جامعة الملك عبدالعزيز",
    title: "ساهم برأيك في دعم خيارات أكثر صحة",
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
    contact: "التواصل للاستفسارات",
    langSwitchOther: "English",
    close: "إغلاق",
  },
  en: {
    dir: "ltr",
    badge: "A study from King Abdulaziz University",
    title: "Share your view to support healthier choices",
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
    contact: "Contact for questions",
    langSwitchOther: "العربية",
    close: "Close",
  },
};

// Minimal inline icons (stroke-based, calm)
function IconUniversity({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 3l10 5-10 5L2 8l10-5z" />
      <path d="M6 10v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />
      <path d="M22 8v6" />
    </svg>
  );
}
function IconCheck({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
function IconLock({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 118 0v3" />
    </svg>
  );
}
function IconMask({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 14c1.2 1 2.5 1.5 4 1.5s2.8-.5 4-1.5" />
      <circle cx="9" cy="10" r="0.8" fill="currentColor" />
      <circle cx="15" cy="10" r="0.8" fill="currentColor" />
    </svg>
  );
}
function IconGift({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M5 12v8h14v-8M12 8v12" />
      <path d="M12 8s-3-4-5-2 2 2 5 2zM12 8s3-4 5-2-2 2-5 2z" />
    </svg>
  );
}
function IconMail({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}
function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 transition-transform duration-300 ease-out motion-reduce:transition-none"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function StudyInvitationOverlay() {
  const [visible, setVisible] = useState(false);
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
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // focus dialog for keyboard users
    const id = window.setTimeout(() => dialogRef.current?.focus(), 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
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
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center px-4 py-6 sm:px-6"
      style={{
        background: "rgba(15, 23, 30, 0.55)",
        backdropFilter: "blur(22px) saturate(140%)",
        paddingTop: "max(env(safe-area-inset-top), 1rem)",
        paddingBottom: "max(env(safe-area-inset-bottom), 1rem)",
      }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="aqla-study-title"
        tabIndex={-1}
        dir={t.dir}
        lang={lang}
        className="relative flex max-h-[92vh] w-full max-w-[520px] flex-col overflow-hidden rounded-[28px] border border-white/60 bg-white/85 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)] outline-none focus-visible:ring-2 focus-visible:ring-[#0b6b3a]/50"
        style={{ backdropFilter: "blur(24px) saturate(160%)" }}
      >
        {/* Language switch */}
        <div className={`absolute top-3 ${isRTL ? "left-3" : "right-3"} z-10`}>
          <button
            type="button"
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="inline-flex h-9 min-w-[44px] items-center justify-center rounded-full border border-black/10 bg-white/70 px-3 text-[12px] font-medium text-neutral-700 backdrop-blur transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b6b3a]/40"
            aria-label={lang === "ar" ? "Switch to English" : "التبديل إلى العربية"}
          >
            {t.langSwitchOther}
          </button>
        </div>

        <div className="flex flex-col gap-6 px-6 pb-6 pt-10 sm:px-9 sm:pt-11">
          {/* Badge */}
          <div className="flex items-center justify-center gap-2 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/70 px-3 py-1.5 text-[12px] font-medium text-neutral-700">
              <IconUniversity className="h-4 w-4 text-[#0b6b3a]" />
              {t.badge}
            </span>
          </div>

          {/* Title */}
          <h2
            id="aqla-study-title"
            className={`text-center font-semibold tracking-tight text-neutral-900 ${
              isRTL ? "text-[26px] leading-[1.35] sm:text-[30px]" : "text-[24px] leading-[1.25] sm:text-[28px]"
            }`}
          >
            {t.title}
          </h2>

          {/* Actions */}
          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={participate}
              className="inline-flex min-h-[48px] w-full items-center justify-center rounded-2xl bg-[#0b6b3a] px-6 text-[15px] font-semibold text-white shadow-[0_10px_24px_-12px_rgba(11,107,58,0.6)] transition duration-200 hover:bg-[#0a5f34] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b6b3a]/50 focus-visible:ring-offset-2 motion-reduce:transition-none"
            >
              {t.participate}
            </button>
            <button
              type="button"
              onClick={close}
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-2xl bg-transparent px-6 text-[14px] font-medium text-neutral-600 transition duration-200 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 motion-reduce:transition-none"
            >
              {t.skip}
            </button>
          </div>

          {/* Details toggle */}
          <div className="border-t border-black/[0.06] pt-3">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="aqla-study-details"
              className="mx-auto inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-neutral-600 transition hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300"
            >
              <span>{t.detailsToggle}</span>
              <IconChevron open={open} />
            </button>

            <div
              id="aqla-study-details"
              role="region"
              aria-hidden={!open}
              className="grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none"
              style={{
                gridTemplateRows: open ? "1fr" : "0fr",
                opacity: open ? 1 : 0,
              }}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="mt-3 max-h-[46vh] overflow-y-auto rounded-2xl bg-black/[0.02] p-4 sm:p-5">
                  <h3 className="text-[15px] font-semibold text-neutral-900">
                    {t.detailsTitle}
                  </h3>
                  <p className="mt-3 text-[14px] leading-[1.75] text-neutral-700">{t.p1}</p>
                  <p className="mt-2.5 text-[14px] leading-[1.75] text-neutral-700">{t.p2}</p>
                  <p className="mt-2.5 text-[14px] leading-[1.75] text-neutral-700">
                    {t.p3Prefix} <span className="font-semibold text-neutral-900">{t.p3Amount}</span>.
                  </p>

                  <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {[
                      { icon: <IconCheck className="h-4 w-4 text-[#0b6b3a]" />, label: t.voluntary },
                      { icon: <IconLock className="h-4 w-4 text-[#0b6b3a]" />, label: t.confidential },
                      { icon: <IconMask className="h-4 w-4 text-[#0b6b3a]" />, label: t.anonymous },
                      { icon: <IconGift className="h-4 w-4 text-[#0b6b3a]" />, label: t.prize },
                    ].map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 rounded-xl border border-black/[0.06] bg-white/70 px-3 py-2 text-[12.5px] text-neutral-700"
                      >
                        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0b6b3a]/[0.08]">
                          {item.icon}
                        </span>
                        <span className="min-w-0 truncate">{item.label}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex items-center gap-2 text-[13px] text-neutral-700">
                    <IconMail className="h-4 w-4 shrink-0 text-[#0b6b3a]" />
                    <span className="text-neutral-500">{t.contactLabel}</span>
                    <a
                      href="mailto:smokefreeksa@gmail.com"
                      className="min-w-0 truncate font-medium text-[#0b6b3a] underline decoration-[#0b6b3a]/30 underline-offset-2 hover:decoration-[#0b6b3a]"
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
  );
}
