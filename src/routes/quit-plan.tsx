import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout route: renders the static /quit-plan page (index) or the tokenised
// plan view at /quit-plan/$planToken. Without <Outlet /> the token child never
// renders and shared plan links fall back to the static page.
export const Route = createFileRoute("/quit-plan")({
  component: () => <Outlet />,
});
