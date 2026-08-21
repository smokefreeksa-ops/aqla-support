import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { BackButton } from "@/components/BackButton";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { useLearnerDashboard } from "@/hooks/useLearnerDashboard";

export const Route = createFileRoute("/dashboard")({
  // Supabase keeps the session in localStorage, so the server has no bearer
  // token for these protected server functions. Render this subtree client-side.
  ssr: false,
  head: () => ({
    meta: [
      { title: "لوحة المتعلم — أكاديمية أقلع" },
      { name: "description", content: "تابع وحداتك التدريبية، تقدمك، شهاداتك، والجلسات المباشرة في أكاديمية أقلع." },
      { property: "og:title", content: "لوحة المتعلم — أكاديمية أقلع" },
      { property: "og:description", content: "تابع وحداتك التدريبية، تقدمك، شهاداتك، والجلسات المباشرة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardLayout,
});

function DashboardLayout() {
  const { model } = useLearnerDashboard();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isSubPage = pathname !== "/dashboard"&& pathname !== "/dashboard/";
  return (
    <div dir="rtl"className="min-h-screen bg-background text-foreground">
      <DashboardNav displayName={model?.displayName ?? "المتعلم"} />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        {isSubPage && (
          <div className="mb-5">
            <BackButton fallback="/dashboard"labelAr="لوحة المتعلم"labelEn="Dashboard" />
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}
