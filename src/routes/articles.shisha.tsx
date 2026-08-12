import { createFileRoute } from "@tanstack/react-router";
import { ArticleScaffold } from "@/components/seo/articles";

export const Route = createFileRoute("/articles/shisha")({
  head: () => ({
    meta: [
      { title: "الإقلاع عن المعسل والشيشة | أقلع" },
      {
        name: "description",
        content: "دليل الإقلاع عن المعسل والشيشة: الفروق عن السجائر، المحفزات الاجتماعية، وخطوات التوقف.",
      },
      { property: "og:title", content: "الإقلاع عن المعسل والشيشة" },
      { property: "og:description", content: "خصوصية الإقلاع عن الشيشة في السياق السعودي." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://aqla1.com/articles/shisha" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://aqla1.com/articles/shisha" }],
  }),
  component: () => (
    <ArticleScaffold
      titleAr="الإقلاع عن المعسل والشيشة"
      titleEn="Quitting shisha and waterpipe"
      intro="هيكل المقال جاهز، والمحتوى قيد الكتابة."
      sections={[
        "كيف يختلف المعسل عن السجائر",
        "المحفزات الاجتماعية والجلسات",
        "خطوات التوقف التدريجي أو الفوري",
        "بدائل التعامل مع الرغبة",
        "الدعم المتاح عبر أقلع",
      ]}
    />
  ),
});
