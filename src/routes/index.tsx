import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLang, useLangState, LangContext } from "@/lib/i18n";
import {
  ShieldCheck,
  Lock,
  BookOpenCheck,
  HeartHandshake,
  Sparkles,
  Trophy,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ImpactSection } from "@/components/ImpactSection";
import { VisitTracker } from "@/components/VisitTracker";
import { trackEvent } from "@/lib/track-event";
import aqlaLogo from "@/assets/aqla-logo.png";

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

  return (
    <div dir={dir} className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.06] via-background to-background" />
          <div aria-hidden className="pointer-events-none absolute -top-24 end-[-10%] h-[420px] w-[420px] rounded-full bg-primary/10 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-32 start-[-10%] h-[420px] w-[420px] rounded-full bg-secondary/10 blur-3xl" />

          <div className="relative mx-auto max-w-6xl px-4 pt-14 pb-12 sm:pt-20 sm:pb-16">
            <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="text-center lg:text-start">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-3 py-1.5 text-[11px] font-medium text-primary shadow-sm backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  {isAr ? "منصة سعودية مجانية للتوعية والدعم" : "A free Saudi awareness & support platform"}
                </span>
                <h1 className="mt-5 text-3xl font-bold leading-[1.18] tracking-tight text-foreground sm:text-[44px] lg:text-5xl">
                  {isAr ? "اختر المسار الأقرب لك اليوم" : "Choose the pathway closest to you today"}
                </h1>
                <p className="mx-auto lg:mx-0 mt-5 max-w-xl text-[15px] leading-7 text-foreground/70 sm:text-base">
                  {isAr
                    ? "سواء كنت تريد الإقلاع عن التدخين أو النيكوتين، أو مساعدة شخص يهمك، أو المشاركة في التحديات وجمع الأوسمة — يبدأ أقلع معك بخطوة واضحة تناسب حالتك."
                    : "Whether you want to quit smoking or nicotine, support someone you care about, or join challenges and earn medals — Aqla starts with one clear step that fits your situation."}
                </p>
                <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-start lg:items-start">
                  <Link to="/assessment" onClick={() => trackEvent("hero_start_now_clicked")}>
                    <Button size="lg" className="h-12 gap-2 bg-primary px-7 text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                      {isAr ? "ابدأ الآن" : "Start Now"}
                      <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                    </Button>
                  </Link>
                  <a href="#pathways" onClick={() => trackEvent("hero_explore_pathways_clicked")}>
                    <Button size="lg" variant="outline" className="h-12 border-primary/25 bg-card/70 px-6 backdrop-blur hover:bg-card">
                      {isAr ? "استكشف المسارات" : "Explore pathways"}
                    </Button>
                  </a>
                </div>

                <ul className="mt-8 grid grid-cols-1 gap-2 text-[12px] text-foreground/65 sm:grid-cols-2">
                  <li className="inline-flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary" />{isAr ? "مجاني للجميع، وسيبقى مجانيًا" : "Free for everyone — always"}</li>
                  <li className="inline-flex items-center gap-2"><Lock className="h-3.5 w-3.5 shrink-0 text-primary" />{isAr ? "لا نعرض بياناتك الصحية في المشاركات" : "No private health data in public shares"}</li>
                  <li className="inline-flex items-center gap-2"><BookOpenCheck className="h-3.5 w-3.5 shrink-0 text-primary" />{isAr ? "لا نقدم وصفات أو جرعات دوائية" : "We never prescribe doses or medications"}</li>
                  <li className="inline-flex items-center gap-2"><ShieldAlert className="h-3.5 w-3.5 shrink-0 text-primary" />{isAr ? "نوجهك للمراجعة عند الحاجة" : "We refer you for clinical review when needed"}</li>
                </ul>
              </div>

              {/* Visual */}
              <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                <div aria-hidden className="absolute -top-6 end-6 h-32 w-32 rounded-full bg-primary/15 blur-2xl" />
                <div aria-hidden className="absolute -bottom-8 start-2 h-36 w-36 rounded-full bg-secondary/15 blur-2xl" />
                <div className="relative rounded-[28px] border border-border/60 bg-card/90 p-6 shadow-xl shadow-primary/5 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={aqlaLogo} alt="Aqla" className="h-10 w-10 rounded-xl bg-white object-contain p-1" />
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{isAr ? "أقلع" : "Aqla"}</div>
                        <div className="text-sm font-semibold">{isAr ? "خطوتك الأولى" : "Your first step"}</div>
                      </div>
                    </div>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary">{isAr ? "بإشراف طبي" : "Physician-led"}</span>
                  </div>
                  <div className="mt-5 grid gap-2.5">
                    {[
                      { ar: "أبغى أترك التدخين أو النيكوتين", en: "I want to quit", icon: Sparkles, tone: "bg-primary/10 text-primary" },
                      { ar: "أبغى أساعد شخص يهمني", en: "I want to help someone", icon: HeartHandshake, tone: "bg-[oklch(0.95_0.06_85)] text-[oklch(0.45_0.12_75)]" },
                      { ar: "أبغى أشارك في التحديات", en: "Join challenges", icon: Trophy, tone: "bg-secondary/10 text-secondary" },
                    ].map((p) => (
                      <div key={p.en} className="flex items-center gap-3 rounded-2xl border border-border/50 bg-background/60 px-4 py-3">
                        <div className={`grid h-9 w-9 place-items-center rounded-xl ${p.tone}`}>
                          <p.icon className="h-4 w-4" />
                        </div>
                        <div className="text-sm font-medium">{isAr ? p.ar : p.en}</div>
                        <ArrowRight className="ms-auto h-4 w-4 text-muted-foreground rtl:rotate-180" />
                      </div>
                    ))}
                  </div>
                  <p className="mt-5 text-[11px] leading-5 text-muted-foreground">
                    {isAr
                      ? "بإشراف د. مالك الذبياني وفريق من الأخصائيين المدربين."
                      : "Supervised by Dr. Malik AlThubayani and a trained specialist team."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* THREE PATHWAYS */}
        <section id="pathways" className="scroll-mt-20 border-t border-border/40 bg-card/40">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
            <div className="text-center">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {isAr ? "ثلاث مسارات. اختر الأقرب لك." : "Three pathways. Pick the one closest to you."}
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
                {isAr
                  ? "كل مسار يفتح تجربة محادثة ذكية متخصصة تأخذك خطوة بخطوة."
                  : "Each pathway opens one specialized AI-guided conversation that takes you step by step."}
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              <PathwayCard
                to="/quit-pathway"
                title={isAr ? "أبغى أترك التدخين أو النيكوتين" : "I want to quit"}
                subtitle={
                  isAr
                    ? "لمن يستخدم السجائر، الفيب، أكياس النيكوتين، الشيشة، أو أكثر من منتج — يبدأ معك من فهم وضعك."
                    : "For users of cigarettes, vape, nicotine pouches, shisha, or multiple products. Start by understanding where you stand."
                }
                cta={isAr ? "ابدأ مسار الإقلاع" : "Start Quit Pathway"}
                icon={<Sparkles className="h-5 w-5" />}
                tone="quit"
                tag={isAr ? "مسار الإقلاع" : "Quit"}
              />
              <PathwayCard
                to="/help-pathway"
                title={isAr ? "أبغى أساعد شخص يهمني" : "I want to help someone"}
                subtitle={
                  isAr
                    ? "ادعم صديق، أخ، والد، زوج، طالب، أو زميل بطريقة محترمة وآمنة — بدون ضغط أو لوم."
                    : "Support a friend, sibling, parent, partner, student, or colleague with care — never with pressure or blame."
                }
                cta={isAr ? "ابدأ مسار المساعدة" : "Start Help Pathway"}
                icon={<HeartHandshake className="h-5 w-5" />}
                tone="help"
                tag={isAr ? "مسار المساعدة" : "Help"}
              />
              <PathwayCard
                to="/challenge-pathway"
                title={isAr ? "أبغى أشارك في التحديات وأجمع الأوسمة" : "Join challenges & earn medals"}
                subtitle={
                  isAr
                    ? "اختبر معرفتك، ادخل تحديات أقلع، اجمع النقاط، صمم بطاقات، واحصل على شهادات."
                    : "Test your knowledge, join Aqla challenges, collect points, design posters, and earn certificates."
                }
                cta={isAr ? "ابدأ التحديات" : "Start Challenges"}
                icon={<Trophy className="h-5 w-5" />}
                tone="challenge"
                tag={isAr ? "التحديات والأوسمة" : "Challenges"}
              />
            </div>
          </div>
        </section>

        {/* TRUST / SUPERVISION STRIP */}
        <section className="border-y border-border/40">
          <div className="mx-auto max-w-6xl px-4 py-6 text-center">
            <p className="text-[12px] leading-6 text-muted-foreground sm:text-[13px]">
              {isAr
                ? "بإشراف سعادة الدكتور مالك عبدالملك الذبياني وفريق من الأخصائيين المدربين — أقلع للتوعية والدعم، ولا يغني عن مراجعة المختص عند الحاجة."
                : "Supervised by Dr. Malik AlThubayani and a trained specialist team — Aqla provides awareness and support, and does not replace consultation when needed."}
            </p>
          </div>
        </section>

        {/* IMPACT */}
        <section className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{isAr ? "أثر أقلع حتى الآن" : "Aqla's impact so far"}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
              {isAr
                ? "مؤشرات مجمعة تعكس التفاعل والمسارات والتحديات والتدريب، دون عرض أي بيانات شخصية."
                : "Aggregate indicators of engagement, pathways, challenges, and training — without exposing any personal data."}
            </p>
          </div>
          <div className="mt-8">
            <ImpactSection isAr={isAr} />
          </div>
          <p className="mt-4 text-center text-[11px] text-muted-foreground/80">
            {isAr
              ? "هذه الأرقام مجمعة فقط، وقد تتغير مع تحديث نظام التحليلات."
              : "These figures are aggregated and may shift as the analytics system updates."}
          </p>
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
  tag,
}: {
  to: string;
  title: string;
  subtitle: string;
  cta: string;
  icon: React.ReactNode;
  tone: "quit" | "help" | "challenge";
  tag: string;
}) {
  const tones = {
    quit: {
      ring: "hover:ring-primary/30",
      iconBg: "bg-primary/10 text-primary",
      cta: "bg-primary text-primary-foreground hover:bg-primary/90",
      glow: "from-primary/15 to-secondary/10",
      tag: "bg-primary/10 text-primary",
    },
    help: {
      ring: "hover:ring-[oklch(0.75_0.12_75)]/40",
      iconBg: "bg-[oklch(0.95_0.06_85)] text-[oklch(0.45_0.12_75)]",
      cta: "bg-[oklch(0.55_0.13_75)] text-white hover:opacity-95",
      glow: "from-[oklch(0.85_0.08_75)]/30 to-secondary/10",
      tag: "bg-[oklch(0.95_0.06_85)] text-[oklch(0.45_0.12_75)]",
    },
    challenge: {
      ring: "hover:ring-secondary/40",
      iconBg: "bg-secondary/10 text-secondary",
      cta: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
      glow: "from-secondary/15 to-primary/10",
      tag: "bg-secondary/10 text-secondary",
    },
  }[tone];

  return (
    <Card className={`group relative overflow-hidden rounded-3xl border-border/60 bg-card p-0 shadow-sm transition-all ring-1 ring-transparent ${tones.ring} hover:-translate-y-1 hover:shadow-xl`}>
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${tones.glow} opacity-60`} aria-hidden />
      <div className="relative flex h-full flex-col p-6 sm:p-7">
        <div className="flex items-center justify-between">
          <div className={`grid h-12 w-12 place-items-center rounded-2xl ${tones.iconBg}`}>{icon}</div>
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${tones.tag}`}>{tag}</span>
        </div>
        <h3 className="mt-5 text-xl font-semibold leading-snug tracking-tight">{title}</h3>
        <p className="mt-3 text-[13.5px] leading-7 text-foreground/70">{subtitle}</p>
        <div className="mt-6">
          <Link to={to as "/quit-pathway" | "/help-pathway" | "/challenge-pathway"}>
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
