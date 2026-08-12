import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLangState, LangContext, useLang } from "@/lib/i18n";
import { Languages, ShieldAlert, ArrowLeft } from "lucide-react";
import aqlaLogo from "@/assets/aqla-logo.png";
import founderPhoto from "@/assets/founder.png";
import { SocialLinks } from "@/components/SocialLinks";
import { VisitTracker } from "@/components/VisitTracker";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "من نحن — أقلع ود. مالك الذبياني | About Aqla" },
      {
        name: "description",
        content:
          "قصة أقلع ومؤسسها د. مالك الذبياني — Dr. Malik A. Althobiani، أستاذ مساعد في جامعة الملك عبدالعزيز، دكتوراه من University College London.",
      },
      { property: "og:title", content: "من نحن — أقلع | About Aqla" },
      {
        property: "og:description",
        content:
          "أقلع مبادرة مجتمعية مجانية تجمع التقييم الرقمي وتوجيه الدعم والمتابعة المنظمة — بقيادة د. مالك الذبياني.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://aqla1.com/about" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://aqla1.com/about" },
      { rel: "alternate", hrefLang: "ar", href: "https://aqla1.com/about" },
      { rel: "alternate", hrefLang: "en", href: "https://aqla1.com/en/about" },
      { rel: "alternate", hrefLang: "x-default", href: "https://aqla1.com/about" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Malik A. Althobiani",
          alternateName: ["د. مالك الذبياني", "مالك الذبياني"],
          jobTitle: "Assistant Professor",
          affiliation: { "@type": "CollegeOrUniversity", name: "King Abdulaziz University" },
          alumniOf: [
            { "@type": "CollegeOrUniversity", name: "University College London" },
            { "@type": "CollegeOrUniversity", name: "Georgia State University" },
            { "@type": "CollegeOrUniversity", name: "University of Toledo" },
          ],
          url: "https://althobiani.com",
          sameAs: [
            "https://orcid.org/0000-0002-2760-6929",
            "https://scholar.google.com/citations?user=Malik-Althobiani",
            "https://www.linkedin.com/in/malik-althobiani",
            "https://althobiani.com",
          ],
          worksFor: { "@type": "Organization", name: "أقلع", url: "https://aqla1.com" },
        }),
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const ctx = useLangState();
  return (
    <LangContext.Provider value={ctx}>
      <Inner />
    </LangContext.Provider>
  );
}

function Inner() {
  const { lang, setLang, dir } = useLang();
  const isAr = lang === "ar";

  return (
    <div dir={dir} className="min-h-screen bg-background">
      <VisitTracker path="/about" />
      <header className="border-b bg-card/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={aqlaLogo}
              alt="Aqla — أقلع logo"
              className="h-[38px] w-auto object-contain sm:h-12"
            />
            <div className="leading-tight">
              <div className="font-semibold tracking-tight">{isAr ? "أقلع" : "Aqla"}</div>
              <div className="text-[11px] text-muted-foreground">Aqla — أقلع</div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLang(isAr ? "en" : "ar")}
              className="gap-1.5"
            >
              <Languages className="h-4 w-4" />
              {isAr ? "English" : "العربية"}
            </Button>
            <Link to="/">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                {isAr ? "الرئيسية" : "Home"}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        {/* Page header with logo */}
        <section className="text-center">
          <img
            src={aqlaLogo}
            alt="Aqla — أقلع logo"
            className="mx-auto h-28 w-auto sm:h-36"
          />
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl text-primary">
            {isAr ? "عن أقلع" : "About Aqla"}
          </h1>
        </section>

        {/* About text */}
        <Card className="mt-8 rounded-3xl border-0 bg-white p-6 shadow-elegant sm:p-8">
          {isAr ? (
            <div className="space-y-4 text-[15px] leading-8 text-foreground/85">
              <p>
                أقلع هي منصة دعم رقمية مجانية تهدف إلى مساعدة مستخدمي التدخين أو النيكوتين على فهم
                مستوى الاعتماد لديهم، وتوجيههم إلى المسار الأنسب: الإقلاع، التقليل، الاستعداد، أو طلب
                مراجعة مختص عند الحاجة.
              </p>
              <p>
                الهدف من أقلع ليس جمع البيانات فقط، بل بناء مسار عملي يساعد الأفراد، ويدعم المجتمع،
                وينتج بيانات منظمة يمكن أن تسهم في فهم أنماط استخدام التبغ والنيكوتين محليًا وتحسين
                برامج الدعم مستقبلًا.
              </p>
              <p>
                تأتي المبادرة تماشيًا مع مستهدفات رؤية السعودية 2030 في تعزيز جودة الحياة والصحة
                العامة، ودعمًا للجهود الوطنية للحد من التدخين واستخدام منتجات التبغ والنيكوتين.
              </p>
            </div>
          ) : (
            <div className="space-y-4 text-[15px] leading-7 text-foreground/85">
              <p>
                Aqla is a free digital support platform designed to help people who smoke or use
                nicotine products understand their dependence level and choose the most appropriate
                next step: quitting, reducing, preparing, or requesting specialist review when
                needed.
              </p>
              <p>
                The purpose of Aqla is not only to collect data. It is to create a practical support
                pathway for individuals, strengthen community awareness, and generate structured
                local data that can help improve future tobacco and nicotine cessation services.
              </p>
              <p>
                The initiative is aligned with Saudi Vision 2030 goals to improve quality of life
                and public health, and supports national efforts to reduce tobacco and nicotine
                use.
              </p>
            </div>
          )}
        </Card>

        {/* Founder section */}
        <section className="mt-12">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-primary">
            {isAr ? "المؤسس" : "Founder"}
          </h2>

          <Card className="mt-6 overflow-hidden rounded-3xl border-0 bg-white p-6 shadow-elegant sm:p-8">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-8">
              <img
                src={founderPhoto}
                alt="Dr. Malik Abdulmalik Althobiani, founder of Aqla"
                className="h-36 w-36 shrink-0 rounded-full object-cover ring-4 ring-primary/15 shadow-md sm:h-40 sm:w-40"
              />
              <div className="flex-1">
                <h3 className="text-center text-lg font-semibold sm:text-start">
                  {isAr
                    ? "د. مالك عبدالملك الذبياني"
                    : "Dr. Malik Abdulmalik Althobiani"}
                </h3>
                <p className="mt-1 text-center text-sm text-muted-foreground sm:text-start">
                  د. مالك الذبياني — Dr. Malik A. Althobiani, Assistant Professor at King Abdulaziz
                  University, PhD UCL
                </p>
                <p className="mt-1 text-center text-sm text-muted-foreground sm:text-start">
                  {isAr
                    ? "باحث وممارس في الرعاية التنفسية والصحة الرقمية"
                    : "Respiratory-care & digital-health researcher"}
                </p>

                {isAr ? (
                  <div className="mt-4 space-y-3 text-[14.5px] leading-8 text-foreground/85">
                    <p>
                      أسس مبادرة أقلع د. مالك عبدالملك الذبياني، وهو باحث وممارس في مجال الرعاية
                      التنفسية والصحة الرقمية، حصل على الدكتوراه في طب الجهاز التنفسي من University
                      College London في المملكة المتحدة، وأكمل درجة الماجستير في العلاج التنفسي من
                      Georgia State University في الولايات المتحدة، ودرجة البكالوريوس في الرعاية
                      التنفسية من University of Toledo مع مرتبة الشرف العليا.
                    </p>
                    <p>
                      يمتلك د. مالك خبرة دولية في البحث السريري والصحة الرقمية، منها العمل كباحث
                      سريري في Royal Free Hospital NHS Trust في لندن، إضافة إلى خبرته في أبحاث
                      أمراض الجهاز التنفسي والمراقبة الصحية الرقمية. كما يحمل اعتماد Certified
                      Tobacco Treatment Specialist من الولايات المتحدة.
                    </p>
                    <p>
                      جاءت فكرة أقلع من الحاجة إلى مسار مجاني ومنظم يساعد الأفراد على فهم اعتمادهم
                      على النيكوتين، ويجعل الدعم أسهل وصولًا، ويتيح بناء معرفة محلية موثوقة عن
                      التدخين والنيكوتين لخدمة المجتمع.
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3 text-[14.5px] leading-7 text-foreground/85">
                    <p>
                      Aqla was founded by Dr. Malik Abdulmalik Althobiani, a respiratory-care and
                      digital-health researcher. He completed his PhD in Respiratory Medicine at
                      University College London in the United Kingdom, his MSc in Respiratory
                      Therapy at Georgia State University in the United States, and his BSc in
                      Respiratory Care at the University of Toledo, graduating with highest
                      distinction.
                    </p>
                    <p>
                      Dr. Malik has international experience in clinical research and digital
                      health, including work as a Clinical Research Fellow at Royal Free Hospital
                      NHS Trust in London. His work focuses on respiratory disease, digital health,
                      and structured patient support. He is also a Certified Tobacco Treatment
                      Specialist in the United States.
                    </p>
                    <p>
                      Aqla was created in response to a clear community need: a free, structured,
                      and accessible pathway that helps people understand their nicotine
                      dependence, receive appropriate support, and contribute to reliable local
                      knowledge about tobacco and nicotine use.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </section>

        {/* Safety note */}
        <Card className="mt-8 rounded-2xl border-l-4 border-l-secondary bg-white p-4 sm:p-5">
          <div className="flex gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
            <p className="text-sm leading-7 text-foreground/80">
              {isAr
                ? "لا تقدم المنصة تشخيصًا طبيًا أو وصفات علاجية تلقائية. الحالات التي تحتاج إلى مراجعة مختص يتم توجيهها للمراجعة المناسبة."
                : "The platform does not provide medical diagnosis or automatic treatment prescriptions. Cases requiring specialist input are routed for appropriate review."}
            </p>
          </div>
        </Card>
      </main>

      <footer className="mx-auto max-w-6xl px-4 py-8 text-center text-xs text-muted-foreground">
        <SocialLinks />
        <p className="mt-3">© {isAr ? "أقلع" : "Aqla"} — {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
