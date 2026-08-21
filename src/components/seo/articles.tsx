import { Link } from "@tanstack/react-router";
import { SeoPageShell } from "@/components/seo/SeoPageShell";

export const ARTICLES = [
  {
    to: "/articles/first-week" as const,
    titleAr: "كيف تقلع عن التدخين: خطة الأسبوع الأول",
    titleEn: "How to quit smoking: the first-week plan",
    descAr: "خطة عملية لأول سبعة أيام بعد قرار الإقلاع عن التدخين.",
  },
  {
    to: "/articles/withdrawal" as const,
    titleAr: "أعراض انسحاب النيكوتين وكم تستمر",
    titleEn: "Nicotine withdrawal symptoms and how long they last",
    descAr: "ما الذي يحدث للجسم بعد التوقف، ومتى تخفّ الأعراض.",
  },
  {
    to: "/articles/shisha" as const,
    titleAr: "الإقلاع عن المعسل والشيشة",
    titleEn: "Quitting shisha and waterpipe",
    descAr: "خصوصية الإقلاع عن المعسل والشيشة في السياق السعودي.",
  },
  {
    to: "/articles/nicotine-pouches" as const,
    titleAr: "أكياس النيكوتين: ما يقوله البحث",
    titleEn: "Nicotine pouches: what the research says",
    descAr: "نظرة على الأدلة الحالية حول أكياس (أظرف) النيكوتين.",
  },
];

export function ArticleScaffold({
  titleAr,
  titleEn,
  intro,
  sections,
}: {
  titleAr: string;
  titleEn: string;
  intro: string;
  sections: string[];
}) {
  return (
    <SeoPageShell lang="ar">
      <article>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          <Link to="/articles">مقالات أقلع</Link>
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">{titleAr}</h1>
        <p className="mt-2 text-sm text-muted-foreground"dir="ltr"lang="en">
          {titleEn}
        </p>

        <p className="mt-6 text-[15px] leading-8 text-foreground/85">{intro}</p>

        <div className="mt-6 rounded-2xl border border-dashed border-border/70 bg-card/50 p-4 text-sm text-muted-foreground">
          [MALIK TO WRITE] — نص هذا المقال قيد الإعداد من قِبل د. مالك الذبياني. الهيكل والعناوين
          جاهزة، ولم يُضف أي محتوى طبي مولّد.
        </div>

        {sections.map((s) => (
          <section key={s} className="mt-8">
            <h2 className="text-xl font-semibold text-primary">{s}</h2>
            <p className="mt-2 text-[15px] leading-8 text-foreground/70">[MALIK TO WRITE]</p>
          </section>
        ))}

        <nav className="mt-12 border-t border-border/60 pt-6 text-[15px]">
          <p className="font-semibold text-primary">اقرأ أيضًا</p>
          <ul className="mt-3 space-y-2">
            {ARTICLES.filter((a) => a.titleAr !== titleAr).map((a) => (
              <li key={a.to}>
                <Link to={a.to} className="text-primary underline">
                  {a.titleAr}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/quit-pathway"className="text-primary underline">
                مسار الإقلاع عن التدخين
              </Link>
            </li>
          </ul>
        </nav>
      </article>
    </SeoPageShell>
  );
}
