import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useCanGoBack, useNavigate, useRouterState } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";

/** Routes that should never show the shared back control. */
const HIDDEN_EXACT = new Set(["/", "/en", "/sos", "/auth", "/login"]);

function normalise(pathname: string): string {
  return pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

/** Resolve the section root for a path: /dashboard/history -> /dashboard, /about -> / */
export function resolveParentPath(pathname: string): string {
  const clean = normalise(pathname);
  const segments = clean.split("/").filter(Boolean);
  if (segments.length <= 1) return clean.startsWith("/en") ? "/en" : "/";
  segments.pop();
  const parent = "/" + segments.join("/");
  return parent || "/";
}

/**
 * Shared, always-in-the-same-place "back" control.
 * Rendered once from the root layout; hides itself on the homepage and on any
 * page that already renders its own BackButton.
 */
export function GlobalBackBar() {
  const pathname = useRouterState({ select: (s) => normalise(s.location.pathname) });
  const locationKey = useRouterState({ select: (s) => s.location.state?.key });
  const canGoBack = useCanGoBack();
  const navigate = useNavigate();
  const { lang } = useLang();
  const isAr = lang === "ar" && !(pathname === "/en" || pathname.startsWith("/en/"));

  const [top, setTop] = useState(76);
  const [duplicate, setDuplicate] = useState(false);

  const hidden = HIDDEN_EXACT.has(pathname);

  // Detect a page-level BackButton so we never show two.
  useEffect(() => {
    if (hidden) return;
    let frame = 0;
    const check = () => {
      const own = document.querySelector("[data-aqla-back]:not([data-aqla-back-global])");
      setDuplicate(Boolean(own));
    };
    check();
    frame = window.setTimeout(check, 250);
    return () => window.clearTimeout(frame);
  }, [pathname, hidden]);

  // Sit just below whatever header the page renders.
  useEffect(() => {
    if (hidden || duplicate) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const header = document.querySelector("header");
      const bottom = header ? header.getBoundingClientRect().bottom : 0;
      const next = Math.max(12, Math.min(bottom + 12, 160));
      setTop((prev) => (Math.abs(prev - next) < 1 ? prev : next));
    };
    // Throttle to one measurement per frame so scrolling stays smooth.
    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const t = window.setTimeout(measure, 300);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.clearTimeout(t);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [pathname, hidden, duplicate]);


  if (hidden || duplicate) return null;

  const hasHistory = canGoBack && locationKey !== "default";
  const fallback = resolveParentPath(pathname);

  return (
    <button
      type="button"
      data-aqla-back=""
      data-aqla-back-global=""
      aria-label={isAr ? "العودة" : "Back"}
      onClick={() => {
        if (hasHistory) window.history.back();
        else navigate({ to: fallback });
      }}
      className="fixed z-30 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/35 px-3 py-1.5 text-[13px] font-medium text-white shadow-sm backdrop-blur-md transition-colors hover:bg-black/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      style={{ top, insetInlineStart: 12 }}
    >
      <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
      <span>{isAr ? "العودة" : "Back"}</span>
    </button>
  );
}
