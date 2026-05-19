import { createFileRoute, redirect } from "@tanstack/react-router";

// "Start" funnel — primary CTA from the header. Routes everyone to the
// quit pathway, which is the main flow.
export const Route = createFileRoute("/start")({
  beforeLoad: () => {
    throw redirect({ to: "/quit-pathway", replace: true });
  },
});
