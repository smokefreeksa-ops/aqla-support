import { createFileRoute, Link } from "@tanstack/react-router";
import { SeoPageShell } from "@/components/seo/SeoPageShell";

export const Route = createFileRoute("/en/")({
  head: () => ({
    meta: [
      { title: "Aqla — Saudi Smoking & Nicotine Cessation Platform | أقلع" },
      {
        name: "description",
        content:
          "Aqla (أقلع) is a free, physician-led Saudi platform for quitting smoking and nicotine: dependence assessment, a personalised quit plan, follow-up and volunteer training.",
      },
      { property: "og:title", content: "Aqla — Saudi Smoking & Nicotine Cessation Platform" },
      {
        property: "og:description",
        content: "Free dependence assessment, personalised quit plan, follow-up and training.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://aqla1.com/en" },
      { property: "og:image", content: "https://aqla1.com/og-aqla-v8.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://aqla1.com/og-aqla-v8.jpg" },
    ],
    links: [
      { rel: "canonical", href: "https://aqla1.com/en" },
      { rel: "alternate", hreflang: "ar", href: "https://aqla1.com/" },
      { rel: "alternate", hreflang: "en", href: "https://aqla1.com/en" },
      { rel: "alternate", hreflang: "x-default", href: "https://aqla1.com/" },
    ],
  }),
  component: EnHome,
});

function EnHome() {
  return (
    <SeoPageShell lang="en">
      <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
        Aqla — Saudi smoking &amp; nicotine cessation platform
      </h1>
      <p className="mt-4 text-[15px] leading-7 text-foreground/85">
        Aqla (أقلع), formerly known as La-Tatten (لا تتن), is a free, physician-led digital platform
        that helps people in Saudi Arabia understand their nicotine dependence, build a structured
        quit plan, and stay supported through follow-up. It is founded by Dr. Malik A. Althobiani,
        Assistant Professor at King Abdulaziz University.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-primary">Four pathways</h2>
      <ul className="mt-3 space-y-2 text-[15px] leading-7">
        <li>
          <Link to="/quit-pathway"className="text-primary underline">Quit Pathway</Link> — assessment, plan, follow-up.
        </li>
        <li>
          <Link to="/help-pathway"className="text-primary underline">Help Pathway</Link> — support someone you care about.
        </li>
        <li>
          <Link to="/learn-train"className="text-primary underline">Learn &amp; Train</Link> — academy modules and certificates.
        </li>
        <li>
          <Link to="/challenge-pathway"className="text-primary underline">Challenges</Link> — community activities.
        </li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold text-primary">Learn more</h2>
      <ul className="mt-3 space-y-2 text-[15px] leading-7">
        <li><Link to="/en/about"className="text-primary underline">About Aqla and its founder</Link></li>
        <li><Link to="/en/la-tatten"className="text-primary underline">La-Tatten is now Aqla</Link></li>
        <li><Link to="/en/articles"className="text-primary underline">Articles</Link></li>
        <li><Link to="/"className="text-primary underline">النسخة العربية — Arabic homepage</Link></li>
      </ul>
    </SeoPageShell>
  );
}
