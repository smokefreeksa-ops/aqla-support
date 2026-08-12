import { QueryClient } from "@tanstack/react-query";
import { createRouter, ErrorComponent as DefaultErrorFallback } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Instant back/forward + revisit: serve cached data, refresh quietly.
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Warm the next route as soon as the user hovers / touches a link.
    defaultPreload: "intent",
    defaultPreloadDelay: 40,
    defaultPreloadStaleTime: 30_000,
    // Avoid spinner flashes on fast navigations.
    defaultPendingMs: 220,
    defaultPendingMinMs: 320,
    defaultErrorComponent: DefaultErrorFallback,
  });


  return router;
};
