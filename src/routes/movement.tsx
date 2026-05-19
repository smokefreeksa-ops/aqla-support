import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/movement")({
  beforeLoad: () => {
    throw redirect({ to: "/impact", replace: true });
  },
});
