import { createFileRoute } from "@tanstack/react-router";
import { ArticleScaffold } from "@/components/seo/articles";

export const Route = createFileRoute("/articles/nicotine-pouches")({
  head: () => ({
    meta: [
      { title: "أكياس النيكوتين: ما يقوله البحث | أقلع" },
      {
        name: "description",
        content: "نظرة على الأدلة البحثية الحالية حول أكياس (أظرف) النيكوتين وأنماط استخدامها.",
      },
      { property: "og:title", content: "أكياس النيكوتين: ما يقوله البحث" },
      { property: "og:description", content: "ما تقوله الدراسات عن أظرف النيكوتين." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://aqla1.com/articles/nicotine-pouches" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://aqla1.com/articles/nicotine-pouches" }],
  }),
  component: () => (
    <ArticleScaffold
      titleAr="أكياس النيكوتين: ما يقوله البحث"
      titleEn="Nicotine pouches: what the research says"
      intro="هيكل المقال جاهز، والمحتوى قيد الكتابة."
      sections={[
        "ما هي أكياس النيكوتين",
        "أنماط الاستخدام محليًا",
        "ما تقوله الأدلة الحالية",
        "الأسئلة التي لا تزال مفتوحة",
        "شارك في دراسة أقلع",
      ]}
    />
  ),
});
