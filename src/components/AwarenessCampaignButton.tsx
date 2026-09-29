import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

import { track } from "@/lib/events";

// KAU "Smoke-free Campus" awareness-card maker (static page, no sign-in).
export const AWARENESS_CARD_URL = "/qarari";
const STORAGE_KEY = "aqla_awareness_fab_dismissed";

/**
 * Small pill at the bottom of the screen, shown once the study invitation has been
 * skipped or closed (or straight away if it was already dismissed this visit).
 * Visitors can hide it for the rest of the visit.
 */
export function AwarenessCampaignButton() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [ready, setReady] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") setHidden(true);
    } catch {
      /* storage unavailable */
    }
    const w = window as unknown as { __aqlaStudyOverlayOpen?: boolean };
    const timers: number[] = [];
    const onStudyClosed = () => timers.push(window.setTimeout(() => setReady(true), 1200));
    window.addEventListener("aqla:study-overlay-closed", onStudyClosed);
    timers.push(
      window.setTimeout(() => {
        if (!w.__aqlaStudyOverlayOpen) setReady(true);
      }, 900),
    );
    return () => {
      window.removeEventListener("aqla:study-overlay-closed", onStudyClosed);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  if (!ready || hidden) return null;
  if (
    pathname.startsWith("/quit-plan/") ||
    pathname === "/sos" ||
    pathname.startsWith("/sos/") ||
    pathname.startsWith("/admin")
  )
    return null;

  function hide() {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setHidden(true);
  }

  return (
    <div
      dir="rtl"
      className="pointer-events-none fixed inset-x-0 z-[45] flex justify-center px-3"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
    >
      <div
        className="pointer-events-auto flex max-w-full items-center gap-1 rounded-full border border-[#52DBA8]/50 bg-[#062520]/95 py-1 pe-1 ps-1 shadow-[0_14px_30px_rgba(0,0,0,0.35)] backdrop-blur-md"
        style={{ animation: "aqlaFabIn 500ms cubic-bezier(0.22,1,0.36,1)" }}
      >
        <style>{`@keyframes aqlaFabIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}@media (prefers-reduced-motion: reduce){[style*="aqlaFabIn"]{animation:none!important}}`}</style>
        <a
          href={AWARENESS_CARD_URL}
          onClick={() => track("quick_action", "awareness_card_fab")}
          className="flex min-w-0 items-center gap-2.5 rounded-full py-1.5 pe-2 ps-1.5 text-[13px] font-semibold text-[#F6F0E4] transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#52DBA8]/60 sm:text-[14px]"
        >
          <span
            aria-hidden
            className="shrink-0 rounded-md border-2 border-dotted border-[#52DBA8] px-2 py-0.5 text-[13px] font-extrabold leading-tight text-[#F6F0E4]"
          >
            قراري
          </span>
          <span className="min-w-0 truncate">
            <span className="text-[#52DBA8]">جامعة بلا تدخين</span>
            <span className="mx-1.5 text-white/40">·</span>
            صمّم بطاقتك<span className="hidden sm:inline"> التوعوية</span>
          </span>
        </a>
        <button
          type="button"
          onClick={hide}
          aria-label="إخفاء"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#52DBA8]/60"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            className="h-4 w-4"
            aria-hidden
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
