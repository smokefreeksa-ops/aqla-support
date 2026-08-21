import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Instagram, MessageCircle, ChevronDown } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { appRoutes } from "@/lib/app-routes";
import aqlaLogo from "@/assets/aqla-logo.png";

type FooterLink = { ar: string; en: string; to?: string; href?: string; hash?: string };
type Col = { title: { ar: string; en: string }; links: FooterLink[] };

const COLUMNS: Col[] = [
  {
    title: { ar: "أقلع", en: "Aqla" },
    links: [
      { ar: "من نحن", en: "About", to: appRoutes.about },
      { ar: "لا تتن أصبحت أقلع", en: "La-Tatten is now Aqla", to: "/la-tatten" },
      { ar: "مقالات", en: "Articles", to: "/articles" },
      { ar: "English", en: "English site", to: "/en" },
      { ar: "أثر أقلع", en: "Impact", to: appRoutes.impact },
      { ar: "الأسئلة الشائعة", en: "FAQ", to: appRoutes.faq },
      { ar: "تواصل معنا", en: "Contact", to: appRoutes.contact },
    ],
  },
  {
    title: { ar: "ابدأ", en: "Start" },
    links: [
      { ar: "ابدأ الآن", en: "Start Now", to: appRoutes.start },
      { ar: "التقييم السريع", en: "Quick Check", to: appRoutes.quitPathway },
      { ar: "خطة أقلع", en: "Aqla Plan", to: appRoutes.quitPlan },
      { ar: "مدرب اللحظة", en: "Craving Coach", to: appRoutes.cravingCoach },
      { ar: "مدرب الرجوع", en: "Relapse Support", to: appRoutes.relapseSupport },
    ],
  },
  {
    title: { ar: "المسارات", en: "Pathways" },
    links: [
      { ar: "مسار الإقلاع", en: "Quit Pathway", to: appRoutes.quitPathway },
      { ar: "مسار المساعدة", en: "Help Pathway", to: appRoutes.helpPathway },
      { ar: "التحديات والأنشطة", en: "Challenges", to: appRoutes.challengePathway },
      { ar: "التعلم والتدريب", en: "Learn & Train", to: appRoutes.learnTrain },
      { ar: "الشهادات", en: "Certificates", to: appRoutes.certificates },
    ],
  },
  {
    title: { ar: "الدعم", en: "Support" },
    links: [
      { ar: "طلب الدعم", en: "Request Support", to: appRoutes.requestSupport },
      { ar: "أرسل رسالة", en: "Send a Message", to: appRoutes.supportInvite },
      { ar: "ادعُ أصدقاءك", en: "Invite Friends", to: appRoutes.inviteFriends },
      { ar: "واتساب", en: "WhatsApp", href: appRoutes.whatsapp },
      { ar: "إرشادات السلامة", en: "Safety Guidance", to: appRoutes.safetyGuidance },
      { ar: "متى أحتاج مراجعة مختص؟", en: "When to Seek Help", to: appRoutes.whenToSeekHelp },
    ],
  },
  {
    title: { ar: "الخصوصية والقانون", en: "Privacy & Legal" },
    links: [
      { ar: "سياسة الخصوصية", en: "Privacy Policy", to: appRoutes.privacy },
      { ar: "شروط الاستخدام", en: "Terms of Use", to: appRoutes.terms },
      { ar: "إخلاء المسؤولية الطبية", en: "Medical Disclaimer", to: appRoutes.medicalDisclaimer },
      { ar: "سياسة المشاركة", en: "Sharing Policy", to: appRoutes.sharingPolicy },
      { ar: "سياسة ملفات الارتباط", en: "Cookie Policy", to: appRoutes.cookies },
    ],
  },
];

const PRIMARY: FooterLink[] = [
  { ar: "عن أقلع", en: "About", to: appRoutes.about },
  { ar: "أثر أقلع", en: "Impact", to: appRoutes.impact },
  { ar: "تواصل معنا", en: "Contact", to: appRoutes.contact },
  { ar: "الأسئلة الشائعة", en: "FAQ", to: appRoutes.faq },
];

export function SiteFooter() {
  const { lang, dir } = useLang();
  const [open, setOpen] = useState(false);
  const isAr = lang === "ar";

  return (
    <footer dir={dir} className="mt-16 border-t border-border/60 bg-card/60">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Compact top row */}
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-3">
            <img src={aqlaLogo} alt="Aqla"className="h-9 w-auto" />
            <div className="text-[12px] leading-5 text-muted-foreground">
              <div className="font-medium text-foreground/80">
                © {new Date().getFullYear()} {isAr ? "أقلع — Aqla": "Aqla — أقلع"}
              </div>
              <div>{isAr ? "منصة مجانية للتوعية والدعم — ليست خدمة طوارئ": "Free awareness & support platform — not emergency service"}</div>
              <div>
                {isAr
                  ? "بالانتساب إلى جامعة الملك عبدالعزيز — جدة، المملكة العربية السعودية": "In affiliation with King Abdulaziz University — Jeddah, Saudi Arabia"}
              </div>
            </div>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px]">
            {PRIMARY.map((l) => (
              <Link key={l.en} to={l.to!} className="text-foreground/75 hover:text-primary transition-colors">
                {isAr ? l.ar : l.en}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex items-center gap-1 rounded-full border border-border/60 px-3 py-1 text-[12px] text-foreground/80 hover:border-primary hover:text-primary transition-colors"
              aria-expanded={open}
            >
              {isAr ? "لمزيد من المعلومات": "More information"}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180": ""}`} />
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <a href={appRoutes.whatsapp} target="_blank"rel="noopener noreferrer"aria-label="WhatsApp"className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary hover:bg-primary/20">
              <MessageCircle className="h-4 w-4" />
            </a>
            <a href={appRoutes.instagram} target="_blank"rel="noopener noreferrer"aria-label="Instagram"className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary hover:bg-primary/20">
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Expandable full sitemap */}
        <div
          className={`grid overflow-hidden transition-[grid-template-rows] duration-500 ease-out ${
            open ? "grid-rows-[1fr] mt-8": "grid-rows-[0fr]"
          }`}
        >
          <div className="min-h-0">
            <div className="grid gap-8 border-t border-border/60 pt-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {COLUMNS.map((col) => (
                <div key={col.title.en}>
                  <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-primary">
                    {isAr ? col.title.ar : col.title.en}
                  </div>
                  <ul className="space-y-1.5">
                    {col.links.map((l) => {
                      const label = isAr ? l.ar : l.en;
                      return (
                        <li key={label}>
                          {l.to ? (
                            <Link to={l.to} hash={l.hash} className="text-[12.5px] text-foreground/70 hover:text-primary">
                              {label}
                            </Link>
                          ) : (
                            <a href={l.href} target="_blank"rel="noopener noreferrer"className="text-[12.5px] text-foreground/70 hover:text-primary">
                              {label}
                            </a>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] leading-5 text-muted-foreground/80">
          {isAr
            ? "لا نعرض بياناتك الصحية في المشاركات العامة. أقلع لا يقدم تشخيصًا أو علاجًا أو وصفة طبية.": "We never expose your private health data in public shares. Aqla does not provide diagnosis, treatment, or prescriptions."}
        </p>
      </div>
    </footer>
  );
}
