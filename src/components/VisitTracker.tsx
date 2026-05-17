import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { trackPageView } from "@/lib/impact.functions";

const PUBLIC_PATHS = new Set(["/", "/about", "/assessment", "/volunteer"]);
const SESSION_KEY = "aqla_anon_session";

function getOrCreateSession(): string {
  try {
    let s = localStorage.getItem(SESSION_KEY);
    if (!s) {
      s = (crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36));
      localStorage.setItem(SESSION_KEY, s);
    }
    return s;
  } catch {
    return "anon";
  }
}

export function VisitTracker({ path }: { path: string }) {
  const track = useServerFn(trackPageView);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!PUBLIC_PATHS.has(path)) return;
    const dayKey = `aqla_visited:${path}:${new Date().toISOString().slice(0, 10)}`;
    if (sessionStorage.getItem(dayKey)) return;
    sessionStorage.setItem(dayKey, "1");
    const hash = getOrCreateSession();
    track({ data: { page_path: path, anonymous_session_hash: hash } }).catch(() => {});
  }, [path, track]);
  return null;
}
