import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

// Short, shareable address for the KAU "Smoke-free Campus" awareness-card maker.
// The page itself is the static file public/qarari.html (no sign-in needed).
export const Route = createFileRoute("/qarari")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const target = new URL("/qarari.html", request.url);
        target.search = new URL(request.url).search;
        return new Response(null, {
          status: 302,
          headers: { Location: target.toString(), "Cache-Control": "public, max-age=300" },
        });
      },
    },
  },
});
