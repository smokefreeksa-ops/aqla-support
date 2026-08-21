import { trackEvent } from "@/lib/track-event";

/**
 * Typed conversion + journey events for Aqla.
 * Keep this list small and stable so the funnel stays comparable over time.
 */
export type AqlaEvent =
  | "page_visit"
  | "study_banner_click"
  | "signup_start"
  | "signup_complete"
  | "module_start"
  | "module_complete"
  | "assessment_start"
  | "assessment_complete"
  | "certificate_download"
  | "poster_created"
  | "sos_opened"
  | "session_registered"
  | "search_opened"
  | "quick_action";

export function track(event: AqlaEvent, label?: string) {
  trackEvent(event, label);
}

export const FUNNEL_STEPS: { key: AqlaEvent; ar: string; en: string }[] = [
  { key: "page_visit", ar: "زيارة", en: "Visit" },
  { key: "study_banner_click", ar: "نقر على الدراسة", en: "Study click" },
  { key: "signup_complete", ar: "تسجيل مكتمل", en: "Sign-up" },
  { key: "module_start", ar: "بدء وحدة", en: "Module start" },
  { key: "module_complete", ar: "إكمال وحدة", en: "Module complete" },
  { key: "assessment_complete", ar: "إكمال التقييم", en: "Assessment" },
  { key: "certificate_download", ar: "تنزيل الشهادة", en: "Certificate" },
];
