import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/quit-center")({
  beforeLoad: () => {
    throw redirect({ to: "/quit-pathway", replace: true });
  },
});
