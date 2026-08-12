import { createFileRoute, Link } from "@tanstack/react-router";
import { SeoPageShell } from "@/components/seo/SeoPageShell";
import { ARTICLES } from "@/components/seo/articles";

export const Route = createFileRoute("/articles/")({
  head: () => ({
    meta: [
      { title: "مقالات أقلع — دلائل الإقلاع عن التدخين | Aqla Articles" },
      {
        name: "description",
        content:
          "مقالات أقلع حول الإقلاع عن التدخين: خطة الأسبوع الأول، أعراض انسحاب النيكوتين، الإقلاع عن المعسل والشيشة، وأكياس النيكوتين.",
      },
      { property: "og:title", content: "مقالات أقلع — Aqla Articles" },
      { property: "og:description", content: "أدلة عملية حول الإقلاع عن التدخين والنيكوتين." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://aqla1.com/articles" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://aqla1.com/articles" },
      { rel: "alternate", hreflang: "ar", href: "https://aqla1.com/articles" },
      { rel: "alternate", hreflang: "en", href: "https://aqla1.com/en/articles" },
      { rel: "alternate", hreflang: "x-default", href: "https://aqla1.com/articles" },
    ],
  }),
  component: ArticlesIndex,
});

function ArticlesIndex() {
  return (
    <SeoPageShell lang="ar">
      <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">مقالات أقلع</h1>
      <p className="mt-4 text-[15px] leading-8 text-foreground/85">
        مقالات عملية عن الإقلاع عن التدخين والنيكوتين، يكتبها فريق أقلع بإشراف د. مالك الذبياني.
      </p>
      <ul className="mt-8 space-y-4">
        {ARTICLES.map((a) => (
          <li key={a.to} className="rounded-2xl border border-border/60 bg-card/50 p-5">
            <h2 className="text-lg font-semibold">
              <Link to={a.to} className="text-primary underline">
                {a.titleAr}
              </Link>
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{a.descAr}</p>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-[15px]">
        <Link to="/" className="text-primary underline">
          العودة إلى منصة أقلع
        </Link>
      </p>
    </SeoPageShell>
  );
}
