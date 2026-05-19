import { Link } from "@tanstack/react-router";
import { Instagram, MessageCircle } from "lucide-react";
import { useLang } from "@/lib/i18n";
import aqlaLogo from "@/assets/aqla-logo.png";

type Col = { title: { ar: string; en: string }; links: Array<{ ar: string; en: string; to?: string; href?: string }> };

const COLUMNS: Col[] = [
  {
    title: { ar: "أقلع", en: "Aqla" },
    links: [
      { ar: "عن أقلع", en: "About", to: "/about" },
      { ar: "أثر أقلع", en: "Impact", to: "/movement" },
    ],
  },
  {
    title: { ar: "ابدأ", en: "Start" },
    links: [
      { ar: "ابدأ الآن", en: "Start Now", to: "/assessment" },
      { ar: "التقييم السريع", en: "Quick Check", to: "/assessment" },
      { ar: "خطة أقلع", en: "Aqla Plan", to: "/tools" },
    ],
  },
  {
    title: { ar: "المسارات", en: "Pathways" },
    links: [
      { ar: "مسار الإقلاع", en: "Quit Pathway", to: "/quit-pathway" },
      { ar: "مسار المساعدة", en: "Help Pathway", to: "/help-pathway" },
      { ar: "التحديات والأوسمة", en: "Challenges & Medals", to: "/challenge-pathway" },
      { ar: "التعلم والتدريب", en: "Learn & Train", to: "/learn" },
    ],
  },
  {
    title: { ar: "الدعم", en: "Support" },
    links: [
      { ar: "طلب الدعم", en: "Request Support", to: "/tools" },
      { ar: "أرسل رسالة لشخص يهمك", en: "Send a Message", to: "/support-invite" },
      { ar: "تواصل عبر واتساب", en: "WhatsApp", href: "https://wa.me/966555096412" },
    ],
  },
  {
    title: { ar: "الخصوصية والقانون", en: "Privacy & Legal" },
    links: [
      { ar: "سياسة الخصوصية", en: "Privacy Policy", to: "/about" },
      { ar: "إخلاء المسؤولية الطبية", en: "Medical Disclaimer", to: "/about" },
    ],
  },
  {
    title: { ar: "حسابات أقلع", en: "Aqla Social" },
    links: [
      { ar: "Instagram", en: "Instagram", href: "https://www.instagram.com/smokeOffKSA" },
      { ar: "X", en: "X", href: "https://x.com/SmokeOffKSA" },
      { ar: "TikTok", en: "TikTok", href: "https://www.tiktok.com/@SmokeOffKSA" },
      { ar: "قناة اليوتيوب", en: "قناة اليوتيوب", href: "https://www.youtube.com/@La-tatten" },
      { ar: "WhatsApp", en: "WhatsApp", href: "https://wa.me/966555096412" },
    ],
  },
];

export function SiteFooter() {
  const { lang, dir } = useLang();
  return (
    <footer dir={dir} className="mt-16 border-t border-border/60 bg-card/60">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {COLUMNS.map((col) => (
            <div key={col.title.en}>
              <div className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-primary">
                {lang === "ar" ? col.title.ar : col.title.en}
              </div>
              <ul className="space-y-1.5">
                {col.links.map((l) => {
                  const label = lang === "ar" ? l.ar : l.en;
                  return (
                    <li key={label}>
                      {l.to ? (
                        <Link to={l.to} className="text-[13px] text-foreground/70 hover:text-primary">
                          {label}
                        </Link>
                      ) : (
                        <a
                          href={l.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[13px] text-foreground/70 hover:text-primary"
                        >
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

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <img src={aqlaLogo} alt="Aqla" className="h-9 w-auto" />
            <div className="text-[12px] leading-5 text-muted-foreground">
              <div className="font-medium text-foreground/80">© {new Date().getFullYear()} {lang === "ar" ? "أقلع — Aqla" : "Aqla — أقلع"}</div>
              <div>{lang === "ar" ? "منصة مجانية للتوعية والدعم — ليست خدمة طوارئ" : "A free awareness & support platform — not an emergency service"}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="https://wa.me/966555096412" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
               className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary hover:bg-primary/20">
              <MessageCircle className="h-4 w-4" />
            </a>
            <a href="https://www.instagram.com/smokeOffKSA" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
               className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary hover:bg-primary/20">
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </div>
        <p className="mt-4 text-center text-[11px] leading-5 text-muted-foreground/80">
          {lang === "ar"
            ? "لا نعرض بياناتك الصحية في المشاركات العامة. أقلع لا يقدم تشخيصًا أو علاجًا أو وصفة طبية."
            : "We never expose your private health data in public shares. Aqla does not provide diagnosis, treatment, or prescriptions."}
        </p>
      </div>
    </footer>
  );
}
