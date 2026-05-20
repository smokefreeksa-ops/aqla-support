import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/academy")({
  beforeLoad: () => {
    throw redirect({ to: "/learn-train", replace: true });
  },
});
