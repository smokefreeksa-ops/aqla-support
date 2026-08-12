import { createFileRoute, Link } from "@tanstack/react-router";
import { SeoPageShell } from "@/components/seo/SeoPageShell";
import { ARTICLES } from "@/components/seo/articles";

export const Route = createFileRoute("/en/articles")({
  head: () => ({
    meta: [
      { title: "Aqla Articles — quitting smoking & nicotine | Aqla" },
      {
        name: "description",
        content:
          "Aqla articles on quitting smoking and nicotine: the first-week plan, withdrawal symptoms, quitting shisha, and nicotine pouches research.",
      },
      { property: "og:title", content: "Aqla Articles" },
      { property: "og:description", content: "Practical guides on quitting smoking and nicotine." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://aqla1.com/en/articles" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://aqla1.com/en/articles" },
      { rel: "alternate", hrefLang: "ar", href: "https://aqla1.com/articles" },
      { rel: "alternate", hrefLang: "en", href: "https://aqla1.com/en/articles" },
      { rel: "alternate", hrefLang: "x-default", href: "https://aqla1.com/articles" },
    ],
  }),
  component: EnArticles,
});

function EnArticles() {
  return (
    <SeoPageShell lang="en">
      <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">Aqla Articles</h1>
      <p className="mt-4 text-[15px] leading-7 text-foreground/85">
        Articles are published in Arabic first. English translations follow.
      </p>
      <ul className="mt-8 space-y-4">
        {ARTICLES.map((a) => (
          <li key={a.to} className="rounded-2xl border border-border/60 bg-card/50 p-5">
            <h2 className="text-lg font-semibold">
              <Link to={a.to} className="text-primary underline">
                {a.titleEn}
              </Link>
            </h2>
            <p className="mt-1 text-sm text-muted-foreground" dir="rtl" lang="ar">
              {a.titleAr}
            </p>
          </li>
        ))}
      </ul>
    </SeoPageShell>
  );
}
