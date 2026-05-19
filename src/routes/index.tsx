import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLang, useLangState, LangContext } from "@/lib/i18n";
import { HeartHandshake, Sparkles, Trophy, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ImpactSection } from "@/components/ImpactSection";
import { VisitTracker } from "@/components/VisitTracker";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aqla — أقلع | Smoking & Nicotine Cessation Support" },
      {
        name: "description",
        content:
          "Aqla is a free Saudi platform for smoking and nicotine cessation awareness and support. Choose your pathway: quit, help someone, or join challenges.",
      },
      { property: "og:title", content: "Aqla — أقلع" },
      { property: "og:description", content: "Free Saudi cessation awareness and support platform." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const ctx = useLangState();
  return (
    <LangContext.Provider value={ctx}>
      <Inner />
    </LangContext.Provider>
  );
}

function Inner() {
  const { lang, dir } = useLang();
  const isAr = lang === "ar";

  const pathways = [
    {
      to: "/quit-pathway" as const,
      title: isAr ? "أرغب في الإقلاع عن التدخين أو النيكوتين" : "I want to quit smoking or nicotine",
      subtitle: isAr
        ? "لمن يستخدم السجائر، أو الفيب، أو أكياس النيكوتين، أو الشيشة، ويرغب في فهم حالته والبدء في المسار المناسب."
        : "For users of cigarettes, vape, nicotine pouches, or shisha who want to understand their situation and start the right pathway.",
      cta: isAr ? "ابدأ مسار الإقلاع" : "Start Quit Pathway",
      icon: <Sparkles className="h-5 w-5" />,
      tone: "quit" as const,
    },
    {
      to: "/help-pathway" as const,
      title: isAr ? "أرغب في مساعدة شخص يهمني" : "I want to help someone I care about",
      subtitle: isAr
        ? "ادعم صديقًا، أو أحد أفراد الأسرة، أو طالبًا، أو زميلًا بطريقة محترمة وآمنة، دون ضغط أو لوم."
        : "Support a friend, family member, student, or colleague with respect and safety — without pressure or blame.",
      cta: isAr ? "ابدأ مسار المساعدة" : "Start Help Pathway",
      icon: <HeartHandshake className="h-5 w-5" />,
      tone: "help" as const,
    },
    {
      to: "/challenge-pathway" as const,
      title: isAr ? "أرغب في المشاركة في التحديات والأنشطة" : "I want to join challenges and activities",
      subtitle: isAr
        ? "اختبر معرفتك، وشارك في تحديات أقلع، واجمع النقاط والأوسمة، وصمّم بطاقات توعوية قابلة للمشاركة."
        : "Test your knowledge, join Aqla challenges, collect points and medals, and design shareable awareness cards.",
      cta: isAr ? "ابدأ التحديات" : "Start Challenges",
      icon: <Trophy className="h-5 w-5" />,
      tone: "challenge" as const,
    },
  ];

  return (
    <div dir={dir} className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        {/* HERO — text only */}
        <section className="relative overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.05] via-background to-background" />
          <div className="relative mx-auto max-w-3xl px-4 pt-20 pb-16 text-center sm:pt-28 sm:pb-20">
            <div className="flex flex-col items-center gap-1">
              <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">Aqla</h1>
              <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">أقلع</h1>
            </div>

            <p className="mx-auto mt-8 max-w-2xl text-[15px] leading-7 text-foreground/80 sm:text-base">
              {isAr
                ? "بإشراف سعادة الدكتور مالك عبدالملك الذبياني وفريق من الأخصائيين المدربين."
                : "Supervised by Dr. Malik Abdulmalik AlThubayani and a team of trained specialists."}
            </p>

            <p className="mx-auto mt-4 max-w-2xl text-[12.5px] leading-7 text-foreground/55 sm:text-[13px]">
              {isAr
                ? "في أقلع، نضع صحة الإنسان وجودة الحياة في قلب رسالتنا، ونسعى لجعل أول خطوة للإقلاع أسهل، وأقرب، وأكثر إنسانية — بما يتماشى مع مستهدفات رؤية المملكة 2030 بقيادة صاحب السمو الملكي الأمير محمد بن سلمان بن عبدالعزيز آل سعود."
                : "At Aqla, we place human health and quality of life at the heart of our mission, striving to make the first step toward cessation easier, closer, and more humane — in alignment with the targets of the Kingdom's Vision 2030 under the leadership of His Royal Highness Crown Prince Mohammed bin Salman bin Abdulaziz Al Saud."}
            </p>
          </div>
        </section>

        {/* THREE PATHWAYS — only once */}
        <section id="pathways" className="scroll-mt-20 border-t border-border/40 bg-card/40">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
            <div className="grid gap-5 md:grid-cols-3">
              {pathways.map((p) => (
                <PathwayCard key={p.to} {...p} />
              ))}
            </div>
          </div>
        </section>

        {/* SAFETY STRIP — one disclaimer */}
        <section className="border-t border-border/40">
          <div className="mx-auto max-w-4xl px-4 py-6 text-center">
            <p className="text-[12px] leading-6 text-muted-foreground sm:text-[13px]">
              {isAr
                ? "أقلع يقدم التوعية والدعم، ولا يقدم تشخيصًا أو علاجًا أو وصفة طبية. اختيار بدائل النيكوتين أو أدوية الإقلاع أو جرعاتها يحتاج مراجعة مختص أو صيدلي."
                : "Aqla provides awareness and support. It does not provide diagnosis, treatment, or prescriptions. Choice of nicotine replacement, cessation medications, or dosages requires consultation with a specialist or pharmacist."}
            </p>
          </div>
        </section>

        {/* IMPACT — compact, near bottom */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <ImpactSection isAr={isAr} />
        </section>

        <VisitTracker path="/" />
      </main>

      <SiteFooter />
    </div>
  );
}

function PathwayCard({
  to,
  title,
  subtitle,
  cta,
  icon,
  tone,
}: {
  to: "/quit-pathway" | "/help-pathway" | "/challenge-pathway";
  title: string;
  subtitle: string;
  cta: string;
  icon: React.ReactNode;
  tone: "quit" | "help" | "challenge";
}) {
  const tones = {
    quit: {
      ring: "hover:ring-primary/30",
      iconBg: "bg-primary/10 text-primary",
      cta: "bg-primary text-primary-foreground hover:bg-primary/90",
      glow: "from-primary/15 to-secondary/10",
    },
    help: {
      ring: "hover:ring-[oklch(0.75_0.12_75)]/40",
      iconBg: "bg-[oklch(0.95_0.06_85)] text-[oklch(0.45_0.12_75)]",
      cta: "bg-[oklch(0.55_0.13_75)] text-white hover:opacity-95",
      glow: "from-[oklch(0.85_0.08_75)]/30 to-secondary/10",
    },
    challenge: {
      ring: "hover:ring-secondary/40",
      iconBg: "bg-secondary/10 text-secondary",
      cta: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
      glow: "from-secondary/15 to-primary/10",
    },
  }[tone];

  return (
    <Card className={`group relative overflow-hidden rounded-3xl border-border/60 bg-card p-0 shadow-sm transition-all ring-1 ring-transparent ${tones.ring} hover:-translate-y-1 hover:shadow-xl`}>
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${tones.glow} opacity-60`} aria-hidden />
      <div className="relative flex h-full flex-col p-6 sm:p-7">
        <div className={`grid h-12 w-12 place-items-center rounded-2xl ${tones.iconBg}`}>{icon}</div>
        <h3 className="mt-5 text-xl font-semibold leading-snug tracking-tight">{title}</h3>
        <p className="mt-3 text-[13.5px] leading-7 text-foreground/70">{subtitle}</p>
        <div className="mt-6">
          <Link to={to}>
            <Button className={`h-11 w-full gap-2 ${tones.cta}`}>
              {cta}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
