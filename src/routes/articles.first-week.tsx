import { createFileRoute } from "@tanstack/react-router";
import { ArticleScaffold } from "@/components/seo/articles";

export const Route = createFileRoute("/articles/first-week")({
  head: () => ({
    meta: [
      { title: "كيف تقلع عن التدخين: خطة الأسبوع الأول | أقلع" },
      {
        name: "description",
        content:
          "خطة الأسبوع الأول للإقلاع عن التدخين: التحضير، يوم التوقف، إدارة الرغبة، والمتابعة اليومية.",
      },
      { property: "og:title", content: "كيف تقلع عن التدخين: خطة الأسبوع الأول" },
      { property: "og:description", content: "خطة عملية لأول سبعة أيام بعد قرار الإقلاع." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://aqla1.com/articles/first-week" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://aqla1.com/articles/first-week" }],
  }),
  component: () => (
    <ArticleScaffold
      titleAr="كيف تقلع عن التدخين: خطة الأسبوع الأول"titleEn="How to quit smoking: the first-week plan"intro="دليل مُنظّم لأول سبعة أيام بعد قرار الإقلاع — الهيكل جاهز والمحتوى قيد الكتابة."
      sections={[
        "قبل يوم التوقف: التحضير", "اليوم الأول: ما الذي تتوقعه", "الأيام 2–3: ذروة الرغبة", "الأيام 4–7: بناء الروتين الجديد", "متى تطلب دعمًا مختصًا",
      ]}
    />
  ),
});
