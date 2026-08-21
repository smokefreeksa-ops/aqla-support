import { createFileRoute, Link } from "@tanstack/react-router";
import { SeoPageShell } from "@/components/seo/SeoPageShell";

export const Route = createFileRoute("/en/about")({
  head: () => ({
    meta: [
      { title: "About Aqla & Dr. Malik A. Althobiani | Aqla" },
      {
        name: "description",
        content:
          "The Aqla story and its founder, Dr. Malik A. Althobiani — Assistant Professor at King Abdulaziz University, PhD University College London.",
      },
      { property: "og:title", content: "About Aqla & Dr. Malik A. Althobiani" },
      { property: "og:description", content: "The Aqla story and its founder." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://aqla1.com/en/about" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://aqla1.com/en/about" },
      { rel: "alternate", hreflang: "ar", href: "https://aqla1.com/about" },
      { rel: "alternate", hreflang: "en", href: "https://aqla1.com/en/about" },
      { rel: "alternate", hreflang: "x-default", href: "https://aqla1.com/about" },
    ],
  }),
  component: EnAbout,
});

function EnAbout() {
  return (
    <SeoPageShell lang="en">
      <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">About Aqla</h1>
      <p className="mt-4 text-[15px] leading-7 text-foreground/85">
        Aqla (أقلع) is a free digital support platform that helps people who smoke or use nicotine
        products understand their dependence level and choose an appropriate next step: quitting,
        reducing, preparing, or requesting specialist review. The programme began in 2020 as
        La-Tatten (لا تتن) and grew into today's Aqla platform.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-primary">Founder</h2>
      <p className="mt-3 text-[15px] leading-7 text-foreground/85">
        <strong>Dr. Malik A. Althobiani</strong> (د. مالك الذبياني) is an Assistant Professor at
        King Abdulaziz University, Jeddah, Saudi Arabia. He completed his PhD in respiratory
        medicine at University College London (UCL), his MSc in respiratory therapy at Georgia State
        University, and his BSc in respiratory care at the University of Toledo. He is a Certified
        Tobacco Treatment Specialist and has worked as a clinical research fellow at Royal Free
        Hospital NHS Trust in London.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-primary">Affiliation</h2>
      <p className="mt-3 text-[15px] leading-7 text-foreground/85">
        King Abdulaziz University — Faculty of Applied Medical Sciences, Jeddah, Saudi Arabia.
      </p>

      <p className="mt-8 text-[15px]">
        <Link to="/about" className="text-primary underline">اقرأ الصفحة بالعربية — Arabic version</Link>
      </p>
    </SeoPageShell>
  );
}
