import { createFileRoute, Link } from "@tanstack/react-router";
import { SeoPageShell } from "@/components/seo/SeoPageShell";

export const Route = createFileRoute("/en/la-tatten")({
  head: () => ({
    meta: [
      { title: "La-Tatten is now Aqla | لا تتن أصبحت أقلع" },
      {
        name: "description",
        content:
          "La-Tatten (لا تتن), the Saudi anti-smoking programme launched in 2020, is now Aqla — the same team with a full digital cessation pathway.",
      },
      { property: "og:title", content: "La-Tatten is now Aqla" },
      { property: "og:description", content: "The 2020 La-Tatten programme is now the Aqla platform." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://aqla1.com/en/la-tatten" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://aqla1.com/en/la-tatten" },
      { rel: "alternate", hrefLang: "ar", href: "https://aqla1.com/la-tatten" },
      { rel: "alternate", hrefLang: "en", href: "https://aqla1.com/en/la-tatten" },
      { rel: "alternate", hrefLang: "x-default", href: "https://aqla1.com/la-tatten" },
    ],
  }),
  component: EnLaTatten,
});

function EnLaTatten() {
  return (
    <SeoPageShell lang="en">
      <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
        La-Tatten is now Aqla
      </h1>
      <p className="mt-4 text-[15px] leading-7 text-foreground/85">
        The programme started in 2020 under the name La-Tatten (لا تتن) as a community awareness
        initiative against smoking and nicotine use. As it grew into a structured digital pathway
        for assessment, planning and follow-up, it was renamed Aqla (أقلع).
      </p>

      <h2 className="mt-10 text-xl font-semibold text-primary">Timeline</h2>
      <ul className="mt-3 space-y-2 text-[15px] leading-7 text-foreground/85">
        <li>2020 — La-Tatten launches as a community awareness initiative.</li>
        <li>2022 — Nicotine dependence assessment and guided support added.</li>
        <li>2024 — Full digital pathway: quit plan, follow-up, training.</li>
        <li>Today — Aqla: a free platform combining assessment, support, learning and community.</li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold text-primary">Continue</h2>
      <ul className="mt-3 space-y-2 text-[15px] leading-7">
        <li><Link to="/en" className="text-primary underline">Aqla in English</Link></li>
        <li><Link to="/en/about" className="text-primary underline">About and founder</Link></li>
        <li><Link to="/la-tatten" className="text-primary underline">الصفحة بالعربية</Link></li>
      </ul>
    </SeoPageShell>
  );
}
