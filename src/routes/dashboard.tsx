import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { useLearnerDashboard } from "@/hooks/useLearnerDashboard";

export const Route = createFileRoute("/dashboard")({
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
  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground">
      <DashboardNav displayName={model?.displayName ?? "المتعلم"} />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
