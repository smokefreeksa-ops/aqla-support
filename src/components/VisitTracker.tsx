import { useEffect, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { recordPageEntry, recordPageDuration, recordEngagementEvent } from "@/lib/impact.functions";
import { getAnonSessionId, getReferrerType, getLang } from "@/lib/analytics";

const PUBLIC_PATHS = new Set(["/", "/about", "/assessment", "/volunteer"]);

const PATH_EVENT: Record<string, string> = {
  "/": "homepage_viewed", "/about": "about_viewed", "/assessment": "assessment_viewed", "/volunteer": "volunteer_viewed",
};

const MAX_DURATION = 30 * 60; // cap at 30 minutes

export function VisitTracker({ path }: { path: string }) {
  const enterFn = useServerFn(recordPageEntry);
  const durFn = useServerFn(recordPageDuration);
  const eventFn = useServerFn(recordEngagementEvent);
  const idRef = useRef<string | null>(null);
  const startRef = useRef<number>(0);
  const sentRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!PUBLIC_PATHS.has(path)) return;

    const sid = getAnonSessionId();
    const lang = getLang() as "ar"| "en";
    const referrer_type = getReferrerType();
    const page_title = document.title?.slice(0, 255) ?? null;
    startRef.current = Date.now();
    sentRef.current = false;

    // Page entry
    enterFn({ data: {
      page_path: path, page_title, language: lang, referrer_type,
      anonymous_session_id: sid,
    }}).then((r) => { idRef.current = r?.id ?? null; }).catch(() => {});

    // *_viewed engagement event (deduplicated per session per day)
    const ev = PATH_EVENT[path];
    if (ev) {
      const k = `aqla_event:${ev}:${new Date().toISOString().slice(0, 10)}`;
      try {
        if (!sessionStorage.getItem(k)) {
          sessionStorage.setItem(k, "1");
          eventFn({ data: {
            event_type: ev, page_path: path, anonymous_session_id: sid,
          }}).catch(() => {});
        }
      } catch { /* ignore */ }
    }

    const flush = () => {
      if (sentRef.current || !idRef.current) return;
      const dur = Math.min(MAX_DURATION, Math.max(1, Math.round((Date.now() - startRef.current) / 1000)));
      sentRef.current = true;
      // Best-effort; keepalive via fetch is handled by tanstack rpc fetch
      durFn({ data: { id: idRef.current, duration_seconds: dur } }).catch(() => {});
    };

    // Heartbeat: update duration every 30s while page active
    const beat = setInterval(() => {
      if (!idRef.current) return;
      const dur = Math.min(MAX_DURATION, Math.round((Date.now() - startRef.current) / 1000));
      durFn({ data: { id: idRef.current, duration_seconds: dur } }).catch(() => {});
    }, 30_000);

    const onHide = () => { if (document.visibilityState === "hidden") flush(); };
    window.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", flush);

    return () => {
      clearInterval(beat);
      window.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", flush);
      flush();
    };
  }, [path, enterFn, durFn, eventFn]);

  return null;
}
