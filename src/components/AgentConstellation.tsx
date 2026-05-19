import { Link } from "@tanstack/react-router";
import {
  Compass,
  ClipboardList,
  Wind,
  HeartHandshake,
  GraduationCap,
  ShieldCheck,
  Trophy,
  Sparkles,
  Sunrise,
} from "lucide-react";

type AgentTone =
  | "emerald-command"
  | "ivory-split"
  | "moment-urgent"
  | "warm-invite"
  | "academic-teal"
  | "clinical-bluegreen"
  | "challenge-celebrate"
  | "vape-modern"
  | "sunrise-reset";

type Agent = {
  id: string;
  ar: string;
  en: string;
  hintAr: string;
  hintEn: string;
  to: string;
  search?: Record<string, string>;
  icon: typeof Compass;
  tone: AgentTone;
};

const AGENTS: Agent[] = [
  {
    id: "navigator",
    ar: "ملاح أقلع",
    en: "Aqla Navigator",
    hintAr: "ابدأ من هنا — نوجهك للمسار المناسب",
    hintEn: "Start here — we route you to the right path",
    to: "/assessment",
    icon: Compass,
    tone: "emerald-command",
  },
  {
    id: "plan",
    ar: "مدرب خطة أقلع",
    en: "Plan Coach",
    hintAr: "نبني خطتك بخطوات بسيطة",
    hintEn: "We build your plan in simple steps",
    to: "/assessment",
    icon: ClipboardList,
    tone: "ivory-split",
  },
  {
    id: "moment",
    ar: "مدرب اللحظة",
    en: "Moment Coach",
    hintAr: "خذ دقيقة — تنفس معي",
    hintEn: "Take a minute — breathe with me",
    to: "/tools",
    icon: Wind,
    tone: "moment-urgent",
  },
  {
    id: "support",
    ar: "ساعد شخصًا تحبه",
    en: "Support Someone",
    hintAr: "صمّم رسالة دفء لشخص يهمك",
    hintEn: "Design a warm message for someone you care for",
    to: "/support-invite",
    icon: HeartHandshake,
    tone: "warm-invite",
  },
  {
    id: "learn",
    ar: "مدرب التعلم",
    en: "Learning Coach",
    hintAr: "تعلّم بإيقاعك — واحصل على شهادتك",
    hintEn: "Learn at your pace — earn your certificate",
    to: "/learn",
    icon: GraduationCap,
    tone: "academic-teal",
  },
  {
    id: "request",
    ar: "مساعد طلب الدعم",
    en: "Support Request",
    hintAr: "اطلب دعمًا متخصصًا بسرية",
    hintEn: "Request specialist support privately",
    to: "/shop",
    icon: ShieldCheck,
    tone: "clinical-bluegreen",
  },
  {
    id: "challenges",
    ar: "مدرب التحديات",
    en: "Challenges Coach",
    hintAr: "تحديات، نقاط، وأوسمة أقلع",
    hintEn: "Challenges, points & Aqla medals",
    to: "/challenges",
    icon: Trophy,
    tone: "challenge-celebrate",
  },
  {
    id: "vape",
    ar: "مدرب الفيب",
    en: "Vape Coach",
    hintAr: "افهم اعتمادك على النيكوتين بصدق",
    hintEn: "Understand your nicotine dependence honestly",
    to: "/learn",
    icon: Sparkles,
    tone: "vape-modern",
  },
  {
    id: "reset",
    ar: "مدرب الرجوع",
    en: "Reset Coach",
    hintAr: "الانتكاسة ليست النهاية — نبدأ من جديد",
    hintEn: "A slip is not the end — we start again",
    to: "/tools",
    icon: Sunrise,
    tone: "sunrise-reset",
  },
];

const TONE_STYLES: Record<AgentTone, { card: string; chip: string; icon: string; anim: string }> = {
  "emerald-command": {
    card: "emerald-gradient text-white border-0 shadow-glow",
    chip: "bg-white/15 text-white",
    icon: "bg-white/15 text-white",
    anim: "animate-float-slow",
  },
  "ivory-split": {
    card: "ivory-gradient text-foreground border border-border/60",
    chip: "bg-primary/10 text-primary",
    icon: "emerald-gradient text-white",
    anim: "animate-float-soft",
  },
  "moment-urgent": {
    card: "bg-card text-foreground border border-primary/20",
    chip: "bg-primary/10 text-primary",
    icon: "bg-primary/10 text-primary animate-breathe",
    anim: "animate-pulse-soft",
  },
  "warm-invite": {
    card: "bg-[oklch(0.97_0.03_85)] text-foreground gold-ring",
    chip: "bg-[oklch(0.93_0.06_88)] text-[oklch(0.42_0.08_80)]",
    icon: "gold-gradient text-white shadow-gold",
    anim: "animate-float-soft",
  },
  "academic-teal": {
    card: "bg-card text-foreground border border-secondary/25",
    chip: "bg-secondary/10 text-secondary",
    icon: "bg-secondary text-secondary-foreground",
    anim: "animate-float-slow",
  },
  "clinical-bluegreen": {
    card: "bg-[oklch(0.97_0.018_200)] text-foreground border border-secondary/20",
    chip: "bg-secondary/10 text-secondary",
    icon: "bg-secondary/15 text-secondary",
    anim: "animate-float-soft",
  },
  "challenge-celebrate": {
    card: "emerald-gradient-soft text-foreground border border-primary/20",
    chip: "gold-gradient text-white",
    icon: "emerald-gradient text-white",
    anim: "animate-float-slow",
  },
  "vape-modern": {
    card: "bg-[oklch(0.97_0.02_220)] text-foreground border border-[oklch(0.6_0.13_260/0.25)]",
    chip: "bg-[oklch(0.6_0.13_260/0.12)] text-[oklch(0.48_0.13_260)]",
    icon: "bg-gradient-to-br from-[oklch(0.48_0.085_195)] to-[oklch(0.48_0.13_260)] text-white",
    anim: "animate-float-soft",
  },
  "sunrise-reset": {
    card: "bg-[oklch(0.98_0.025_75)] text-foreground gold-ring",
    chip: "bg-[oklch(0.93_0.06_88)] text-[oklch(0.42_0.08_80)]",
    icon: "bg-gradient-to-br from-[oklch(0.82_0.11_85)] to-[oklch(0.62_0.115_30)] text-white",
    anim: "animate-float-slow",
  },
};

export function AgentConstellation({ lang }: { lang: "ar" | "en" }) {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-60 geo-pattern rounded-[2rem]"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {AGENTS.map((a, i) => {
          const tone = TONE_STYLES[a.tone];
          const Icon = a.icon;
          const delay = `${(i % 4) * 0.7}s`;
          return (
            <Link
              key={a.id}
              to={a.to}
              search={a.search}
              className="group block"
              style={{ animationDelay: delay }}
            >
              <div
                className={`relative h-full rounded-3xl p-5 sm:p-6 transition-transform duration-300 hover:-translate-y-1 ${tone.card} ${tone.anim}`}
                style={{ animationDelay: delay }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`grid h-12 w-12 place-items-center rounded-2xl ${tone.icon}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <span
                    className={`text-[10px] font-medium tracking-wider uppercase rounded-full px-2.5 py-1 ${tone.chip}`}
                  >
                    {lang === "ar" ? "مساعد ذكي" : "AI agent"}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold leading-tight">
                  {lang === "ar" ? a.ar : a.en}
                </h3>
                <p className="mt-1.5 text-sm opacity-85 leading-6">
                  {lang === "ar" ? a.hintAr : a.hintEn}
                </p>
                <div className="mt-4 inline-flex items-center text-xs font-semibold opacity-90 group-hover:opacity-100">
                  {lang === "ar" ? "افتح المساعد ←" : "Open agent →"}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
