import { createFileRoute, redirect } from "@tanstack/react-router";

// Pragmatic /en — switches the app language to English and lands on home.
// The site uses an in-place LangContext toggle; a full /en/* prefix tree
// would duplicate every route, so we treat /en as a soft language switch.
export const Route = createFileRoute("/en")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      try { window.localStorage.setItem("aqla.lang", "en"); } catch { /* ignore */ }
    }
    throw redirect({ to: "/", replace: true });
  },
});
