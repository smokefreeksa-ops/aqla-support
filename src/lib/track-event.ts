import { recordEngagementEvent } from "@/lib/impact.functions";
import { getAnonSessionId } from "@/lib/analytics";

export function trackEvent(event_type: string, event_label?: string) {
  if (typeof window === "undefined") return;
  try {
    const sid = getAnonSessionId();
    const page_path = window.location.pathname;
    void recordEngagementEvent({ data: {
      event_type, page_path, event_label: event_label ?? null,
      anonymous_session_id: sid,
    }});
  } catch { /* ignore */ }
}
