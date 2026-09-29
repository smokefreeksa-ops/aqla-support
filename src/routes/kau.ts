import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

// Short, shareable address for KAU's "Smoke-Free University" campaign page (no sign-in).
// The page itself is the static file public/kau.html.
export const Route = createFileRoute("/kau")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const target = new URL("/kau.html", request.url);
        target.search = new URL(request.url).search;
        return new Response(null, {
          status: 302,
          headers: { Location: target.toString(), "Cache-Control": "public, max-age=300" },
        });
      },
    },
  },
});
