import { createFileRoute } from "@tanstack/react-router";
import { ArticleScaffold } from "@/components/seo/articles";

export const Route = createFileRoute("/articles/withdrawal")({
  head: () => ({
    meta: [
      { title: "أعراض انسحاب النيكوتين وكم تستمر | أقلع" },
      {
        name: "description",
        content:
          "أعراض انسحاب النيكوتين الشائعة، متى تبدأ، وكم تستمر، وكيف يمكن التعامل معها أثناء الإقلاع.",
      },
      { property: "og:title", content: "أعراض انسحاب النيكوتين وكم تستمر" },
      { property: "og:description", content: "ما الذي يحدث بعد التوقف ومتى تخفّ الأعراض." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://aqla1.com/articles/withdrawal" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://aqla1.com/articles/withdrawal" }],
  }),
  component: () => (
    <ArticleScaffold
      titleAr="أعراض انسحاب النيكوتين وكم تستمر"
      titleEn="Nicotine withdrawal symptoms and how long they last"
      intro="هيكل المقال جاهز، والمحتوى العلمي قيد الكتابة من قِبل الفريق."
      sections={[
        "لماذا تحدث أعراض الانسحاب",
        "الأعراض الشائعة",
        "الجدول الزمني: من الساعات الأولى إلى الأسابيع",
        "طرق التعامل المدعومة بالأدلة",
        "علامات تستدعي مراجعة مختص",
      ]}
    />
  ),
});
