import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/try")({
  head: () => ({
    meta: [
      { title: "جرّب أدوات أقلع مجاناً — بدون تسجيل | Aqla" },
      {
        name: "description",
        content:
          "جرّب أدوات أقلع التفاعلية مجاناً وبدون تسجيل: اختبار الإدمان، عدّاد المال، وصوّب على السجائر.",
      },
      { property: "og:title", content: "جرّب أدوات أقلع — مجاناً وبدون تسجيل" },
      {
        property: "og:description",
        content: "اختبار الإدمان • عدّاد المال • صوّب على السجائر — شارك نتيجتك وساعد غيرك.",
      },
    ],
  }),
  component: TryLayout,
});

function TryLayout() {
  return <Outlet />;
}
