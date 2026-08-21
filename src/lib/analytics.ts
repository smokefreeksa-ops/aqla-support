// Browser-side analytics helpers (privacy-safe).
// No PII, no IP, no user-agent. Just an anonymous session id in localStorage.

const SESSION_KEY = "aqla_anon_session";

export function getAnonSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    let s = localStorage.getItem(SESSION_KEY);
    if (!s) {
      s = crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(SESSION_KEY, s);
    }
    return s;
  } catch {
    return "anon";
  }
}

export function getReferrerType(): string {
  if (typeof document === "undefined") return "direct";
  const ref = document.referrer;
  if (!ref) return "direct";
  try {
    const host = new URL(ref).hostname.toLowerCase();
    if (host.includes("google")) return "search";
    if (host.includes("bing") || host.includes("duckduckgo")) return "search";
    if (host.includes("instagram") || host.includes("facebook") || host.includes("tiktok")
      || host.includes("x.com") || host.includes("twitter") || host.includes("youtube")
      || host.includes("snapchat") || host.includes("linkedin")) return "social";
    if (host.includes("wa.me") || host.includes("whatsapp")) return "messaging";
    if (host === window.location.hostname) return "internal";
    return "referral";
  } catch {
    return "direct";
  }
}

export function getLang(): string {
  if (typeof document === "undefined") return "ar";
  const l = document.documentElement.lang || localStorage.getItem("lang") || "ar";
  return l === "en"? "en": "ar";
}
