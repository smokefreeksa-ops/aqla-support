import { useEffect, useState } from "react";
import { RESEARCH_REDCAP_URL } from "@/components/ResearchBanner";

const STORAGE_KEY = "aqla_study_overlay_dismissed";

export function StudyInvitationOverlay() {
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) !== "1") setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [visible]);

  function dismiss() {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch { /* ignore */ }
    setVisible(false);
  }

  function participate() {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch { /* ignore */ }
    window.open(RESEARCH_REDCAP_URL, "_blank", "noopener,noreferrer");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      dir="rtl"
      lang="ar"
      role="dialog"
      aria-modal="true"
      aria-labelledby="aqla-study-title"
      className="fixed inset-0 z-[300] flex items-center justify-center px-5 py-8"
      style={{ background: "rgba(8, 30, 20, 0.72)", backdropFilter: "blur(14px) saturate(140%)" }}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-white/[0.06] px-6 py-9 text-center shadow-2xl sm:px-10 sm:py-11"
        style={{ backdropFilter: "blur(18px) saturate(160%)" }}
      >
        <span className="inline-block rounded-full border border-[#c9a84c]/50 bg-[#c9a84c]/15 px-3 py-1 text-[11px] font-semibold tracking-wide text-[#f6e7b8]">
          دراسة علمية · جامعة الملك عبدالعزيز
        </span>
        <h2
          id="aqla-study-title"
          className="mt-4 text-2xl font-bold leading-snug text-white sm:text-[26px]"
        >
          شارك تجربتك مع أضرار النيكوتين وساهم في الدراسة
        </h2>
        <div className="mt-7 flex flex-col-reverse items-stretch justify-center gap-2.5 sm:flex-row-reverse">
          <button
            type="button"
            onClick={participate}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-[#c9a84c] px-6 py-3 text-sm font-bold text-[#0b3a25] shadow-lg transition hover:brightness-110 sm:flex-none sm:px-8"
          >
            شارك في الدراسة
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex flex-1 items-center justify-center rounded-full border border-white/30 bg-transparent px-6 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10 sm:flex-none sm:px-8"
          >
            تخطي
          </button>
        </div>
      </div>
    </div>
  );
}
