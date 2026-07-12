import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";
import { FloatingWhatsAppButton } from "@/components/FloatingWhatsAppButton";
import { AqlaAssistant } from "@/components/AqlaAssistant";
import { AqlaAuthGate } from "@/components/AqlaAuthGate";
import { ChallengeBanner } from "@/components/ChallengeBanner";
import { GlobalVideoBackground } from "@/components/GlobalVideoBackground";
import { SOSButton } from "@/features/sos/components/SOSButton";

function NotFoundComponent() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_60%)]" />
      <div className="relative z-10 w-full max-w-md text-center">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          <span dir="rtl">قريبًا</span>
          <span className="text-muted-foreground/50">·</span>
          <span>Coming soon</span>
        </div>
        <h1 className="text-6xl font-bold tracking-tight text-foreground sm:text-7xl">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground" dir="rtl">
          هذه الصفحة قيد الإعداد
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This page isn't ready yet. We're working on it — check back soon.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
          >
            <span dir="rtl">العودة للرئيسية</span>
            <span className="mx-2 opacity-50">·</span>
            <span>Go home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--destructive)/0.12),transparent_60%)]" />
      <div className="relative z-10 w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-border/60 bg-background/60 backdrop-blur-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-foreground/70"
            aria-hidden="true"
          >
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground" dir="rtl">
          حدث خطأ غير متوقع
        </h1>
        <p className="mt-1 text-lg font-medium text-foreground">Something went wrong</p>
        <p className="mt-3 text-sm text-muted-foreground">
          We couldn't load this page. Please try again in a moment.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
          >
            <span dir="rtl">حاول مرة أخرى</span>
            <span className="mx-2 opacity-50">·</span>
            <span>Try again</span>
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-input bg-background/60 px-6 py-2.5 text-sm font-medium text-foreground backdrop-blur-sm transition-colors hover:bg-accent"
          >
            <span dir="rtl">الرئيسية</span>
            <span className="mx-2 opacity-50">·</span>
            <span>Home</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Aqla — أقلع" },
      { name: "description", content: "A free physician-led digital pathway for smoking and nicotine cessation support, dependence assessment, volunteer training, and community awareness." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Aqla — أقلع" },
      { property: "og:description", content: "A free physician-led digital pathway for smoking and nicotine cessation support, dependence assessment, volunteer training, and community awareness." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Aqla — أقلع" },
      { name: "twitter:description", content: "A free physician-led digital pathway for smoking and nicotine cessation support, dependence assessment, volunteer training, and community awareness." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/wTHuJ10feueI7NPDEBXQcZYwzBx1/social-images/social-1779039803939-aqla.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/wTHuJ10feueI7NPDEBXQcZYwzBx1/social-images/social-1779039803939-aqla.webp" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", type: "image/png", href: "/aqla-logo.png" },
      { rel: "apple-touch-icon", href: "/aqla-logo.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onSosRoute = pathname === "/sos" || pathname.startsWith("/sos/");

  return (
    <QueryClientProvider client={queryClient}>
      
      <AqlaAuthGate>
        <ChallengeBanner />
        <Outlet />
        <FloatingWhatsAppButton />
        <AqlaAssistant />
        <SOSButton hidden={onSosRoute} />
      </AqlaAuthGate>
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  );
}
