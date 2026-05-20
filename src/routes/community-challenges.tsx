import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/community-challenges")({
  beforeLoad: () => {
    throw redirect({ to: "/challenge-pathway", replace: true });
  },
});
