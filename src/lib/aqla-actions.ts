// ============================================================
// AQLA — BUTTON ACTION ROUTING (TanStack Router edition)
// Every button does exactly one real thing:
//   (a) dials a phone number (tel:),                       OR
//   (b) navigates to a route that ACTUALLY EXISTS,         OR
//   (c) continues the chat workflow via the assistant.
// A button never navigates to a 404 and never does nothing.
// ============================================================
import { useNavigate } from "@tanstack/react-router";

export type AqlaButton = { label: string; action: string };

// action key -> EXISTING live route only. Keep in sync with src/routes/*.
export const ROUTE_ACTIONS: Record<string, string> = {
  generate_invite_link: "/invite-friends",
  view_certificate: "/certificates",
  verify_certificate: "/certificates",
  create_support_request: "/request-support",
  open_quit_pathway: "/quit-pathway",
  open_help_pathway: "/help-pathway",
  open_learn_train: "/learn-train",
  open_challenge_pathway: "/challenge-pathway",
  open_craving_coach: "/craving-coach",
  open_relapse_support: "/relapse-support",
  open_safety_guidance: "/safety-guidance",
  open_when_to_seek_help: "/when-to-seek-help",
  open_quit_plan: "/quit-plan",
  open_assessment: "/assessment",
  open_city_challenge: "/city-challenge",
  open_professional_library: "/professional-library",
};

// Map a raw route path returned by the assistant to a labelled button.
export function routeToButton(route: string, lang: "ar" | "en"): AqlaButton | null {
  const entry = Object.entries(ROUTE_ACTIONS).find(([, r]) => r === route);
  if (!entry) return null;
  const [action] = entry;
  const labels: Record<string, { ar: string; en: string }> = {
    generate_invite_link: { ar: "دعوة صديق", en: "Invite a friend" },
    view_certificate: { ar: "عرض الشهادات", en: "View certificates" },
    verify_certificate: { ar: "التحقق من شهادة", en: "Verify certificate" },
    create_support_request: { ar: "طلب دعم", en: "Request support" },
    open_quit_pathway: { ar: "مسار الإقلاع", en: "Open Quit Pathway" },
    open_help_pathway: { ar: "مسار الدعم", en: "Open Help Pathway" },
    open_learn_train: { ar: "التعلّم والتدريب", en: "Open Learn & Train" },
    open_challenge_pathway: { ar: "مسار التحديات", en: "Open Challenge Pathway" },
    open_craving_coach: { ar: "مدرّب الرغبة", en: "Open Craving Coach" },
    open_relapse_support: { ar: "دعم الانتكاسة", en: "Relapse support" },
    open_safety_guidance: { ar: "إرشادات السلامة", en: "Safety guidance" },
    open_when_to_seek_help: { ar: "متى تطلب المساعدة", en: "When to seek help" },
    open_quit_plan: { ar: "خطة الإقلاع", en: "Open Quit Plan" },
    open_assessment: { ar: "بدء التقييم", en: "Start assessment" },
    open_city_challenge: { ar: "تحدي المدن", en: "City Challenge" },
    open_professional_library: { ar: "المكتبة المهنية", en: "Professional library" },
  };
  const label = labels[action]?.[lang] ?? route;
  return { label, action };
}

export function useAqlaButtonHandler(opts: { sendMessage: (text: string) => void }) {
  const navigate = useNavigate();
  const { sendMessage } = opts;

  return (b: AqlaButton) => {
    // (a) phone links
    if (b.action?.startsWith("tel:")) {
      window.location.href = b.action;
      return;
    }
    // (b) known navigation -> real route
    const route = ROUTE_ACTIONS[b.action];
    if (route) {
      void navigate({ to: route });
      return;
    }
    // (c) conversational fallback — drive the assistant, never a dead button.
    sendMessage(b.label);
  };
}
