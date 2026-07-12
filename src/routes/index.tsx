import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLang, useLangState, LangContext } from "@/lib/i18n";
import { Sparkles, GraduationCap, HeartHandshake, Trophy, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ImpactSection } from "@/components/ImpactSection";
import { VisitTracker } from "@/components/VisitTracker";
import HeroSection from "@/components/imported/HeroSection";
import AboutSection from "@/components/imported/AboutSection";
import DrMalikCard from "@/components/imported/DrMalikCard";
import FeaturesSection from "@/components/imported/FeaturesSection";
import ModulesSection from "@/components/imported/ModulesSection";
import InteractiveToolsSection from "@/components/imported/InteractiveToolsSection";
import CTASection from "@/components/imported/CTASection";
import DesktopCursor from "@/components/imported/DesktopCursor";
import { VoiceScanBanner } from "@/components/VoiceScanBanner";



export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aqla — أقلع | Smoking & Nicotine Cessation Support" },
      {
        name: "description",
        content:
          "أقلع: مركز الإقلاع الافتراضي، أكاديمية التدريب والشهادات، مسار مساعدة شخص يهمك، ومجتمع التحديات.",
      },
      { property: "og:title", content: "Aqla — أقلع" },
      { property: "og:description", content: "أقلع — أربعة مسارات: الإقلاع، الأكاديمية، المساعدة، التحديات." },
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

type Tone = "quit" | "academy" | "help" | "challenge";
type Path = {
  to: "/quit-pathway" | "/learn-train" | "/help-pathway" | "/challenge-pathway";
  title: string;
  description: string;
  cta: string;
  icon: React.ReactNode;
  tone: Tone;
};

function Inner() {
  const { lang, dir } = useLang();
  const isAr = lang === "ar";

  const paths: Path[] = [
    {
      to: "/quit-pathway",
      title: isAr ? "مركز أقلع الافتراضي لدعم الإقلاع" : "Aqla Virtual Quit Center",
      description: isAr
        ? "تجربة تفاعلية تقودك من فهم استخدامك للتدخين أو النيكوتين، إلى التقييم، وبناء الخطة، والمتابعة، وطلب الدعم عند الحاجة."
        : "An interactive experience: understand your use, take the assessment, build your plan, follow up, and request support when needed.",
      cta: isAr ? "ادخل مركز الإقلاع" : "Enter Quit Center",
      icon: <Sparkles className="h-5 w-5" />,
      tone: "quit",
    },
    {
      to: "/learn-train",
      title: isAr ? "أكاديمية أقلع للتدريب والشهادات" : "Aqla Academy for Training & Certification",
      description: isAr
        ? "مركز تعليمي تفاعلي للتدريب، السيناريوهات، الاختبارات، والشهادات القابلة للتحميل والمشاركة والتحقق."
        : "An interactive academy for training, scenarios, exams, and shareable verifiable certificates.",
      cta: isAr ? "ادخل الأكاديمية" : "Enter Academy",
      icon: <GraduationCap className="h-5 w-5" />,
      tone: "academy",
    },
    {
      to: "/help-pathway",
      title: isAr ? "مسار أقلع لمساعدة شخص يهمك" : "Aqla Help Pathway",
      description: isAr
        ? "لمن يريد دعم صديق، قريب، طالب، زميل، أو شخص يهتم لأمره برسالة أو بطاقة دعم محترمة وآمنة."
        : "Support a friend, relative, student, colleague — with a respectful, safe message or support card.",
      cta: isAr ? "ابدأ مسار المساعدة" : "Start Help Pathway",
      icon: <HeartHandshake className="h-5 w-5" />,
      tone: "help",
    },
    {
      to: "/challenge-pathway",
      title: isAr ? "مجتمع وتحديات أقلع" : "Aqla Community & Challenges",
      description: isAr
        ? "للتحديات، الألعاب التوعوية، الهاشتاقات، دعوة الأصدقاء، النقاط، الأوسمة، بطاقات التوعية، وأثر أقلع المجتمعي."
        : "Challenges, awareness games, hashtags, invites, points, medals, awareness cards, and Aqla's community impact.",
      cta: isAr ? "ادخل التحديات والمجتمع" : "Enter Community & Challenges",
      icon: <Trophy className="h-5 w-5" />,
      tone: "challenge",
    },
  ];

  return (
    <div dir={dir} className="min-h-screen bg-background">
      <DesktopCursor />
      <SiteHeader />

      <main>
        {/* HERO — new imported design */}
        <HeroSection />

        {/* VOICE SCAN PROMO */}
        <VoiceScanBanner />


        <section id="pathways" className="scroll-mt-20 border-t border-border/40 bg-card/40">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {paths.map((p) => (
                <PathwayCard key={p.to} {...p} />
              ))}
            </div>
          </div>
        </section>

        {/* DR MALIK AI card */}
        <DrMalikCard />

        {/* ABOUT the founder */}
        <AboutSection />

        {/* PROGRAM FEATURES */}
        <FeaturesSection />

        {/* LEARNING MODULES */}
        <ModulesSection />

        {/* INTERACTIVE TOOLS */}
        <InteractiveToolsSection />

        {/* SAFETY STRIP */}
        <section className="border-t border-border/40 bg-background">
          <div className="mx-auto max-w-4xl px-4 py-6 text-center">
            <p className="text-[12px] leading-6 text-muted-foreground sm:text-[13px]">
              {isAr
                ? "أقلع يقدم التوعية والدعم، ولا يقدم تشخيصًا أو علاجًا أو وصفة طبية. اختيار بدائل النيكوتين أو أدوية الإقلاع أو جرعاتها يحتاج مراجعة مختص أو صيدلي."
                : "Aqla provides awareness and support. It does not provide diagnosis, treatment, or prescriptions."}
            </p>
          </div>
        </section>

        <section className="bg-background mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <ImpactSection isAr={isAr} />
        </section>

        {/* FINAL CTA */}
        <CTASection />

        <VisitTracker path="/" />

      </main>

      <SiteFooter />
    </div>
  );
}

function PathwayCard({ to, title, description, cta, icon, tone }: Path) {
  const tones: Record<Tone, { ring: string; iconBg: string; cta: string; glow: string }> = {
    quit: {
      ring: "hover:ring-primary/30",
      iconBg: "bg-primary/10 text-primary",
      cta: "bg-primary text-primary-foreground hover:bg-primary/90",
      glow: "from-primary/15 to-secondary/10",
    },
    academy: {
      ring: "hover:ring-[oklch(0.7_0.15_260)]/40",
      iconBg: "bg-[oklch(0.95_0.04_260)] text-[oklch(0.45_0.15_260)]",
      cta: "bg-[oklch(0.5_0.15_260)] text-white hover:opacity-95",
      glow: "from-[oklch(0.85_0.08_260)]/30 to-primary/10",
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
  };
  const t = tones[tone];

  return (
    <Card className={`group relative overflow-hidden rounded-3xl border-border/60 bg-card p-0 shadow-sm transition-all ring-1 ring-transparent ${t.ring} hover:-translate-y-1 hover:shadow-xl`}>
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${t.glow} opacity-60`} aria-hidden />
      <div className="relative flex h-full flex-col p-6">
        <h3 className="text-[17px] font-semibold leading-snug tracking-tight">{title}</h3>
        <p className="mt-3 text-[13px] leading-6 text-foreground/70">{description}</p>
        <div className="mt-6">
          <Link to={to}>
            <Button className={`h-11 w-full gap-2 ${t.cta}`}>
              {cta}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
