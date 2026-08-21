import { Link } from "@tanstack/react-router";
import aqlaLogo from "@/assets/aqla-logo.png";

type Props = {
  lang: "ar"| "en";
  children: React.ReactNode;
};

const NAV = {
  ar: [
    { to: "/", label: "الرئيسية" },
    { to: "/about", label: "من نحن" },
    { to: "/la-tatten", label: "لا تتن" },
    { to: "/articles", label: "مقالات" },
    { to: "/en", label: "English" },
  ],
  en: [
    { to: "/en", label: "Home" },
    { to: "/en/about", label: "About" },
    { to: "/en/la-tatten", label: "La-Tatten" },
    { to: "/en/articles", label: "Articles" },
    { to: "/", label: "العربية" },
  ],
} as const;

const FOOT = {
  ar: [
    { to: "/privacy", label: "سياسة الخصوصية" },
    { to: "/terms", label: "شروط الاستخدام" },
    { to: "/contact", label: "تواصل معنا" },
    { to: "/medical-disclaimer", label: "إخلاء المسؤولية الطبية" },
  ],
  en: [
    { to: "/privacy", label: "Privacy Policy" },
    { to: "/terms", label: "Terms of Use" },
    { to: "/contact", label: "Contact" },
    { to: "/medical-disclaimer", label: "Medical Disclaimer" },
  ],
} as const;

/** Lightweight, always server-rendered shell for crawlable content pages. */
export function SeoPageShell({ lang, children }: Props) {
  const dir = lang === "ar"? "rtl": "ltr";
  const isAr = lang === "ar";

  return (
    <div dir={dir} lang={lang} className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-card/60">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link to={isAr ? "/": "/en"} className="flex items-center gap-3">
            <img src={aqlaLogo} alt={isAr ? "شعار أقلع": "Aqla logo"} className="h-10 w-auto" />
            <span className="font-semibold tracking-tight">أقلع — Aqla</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
            {NAV[lang].map((l) => (
              <Link key={l.to + l.label} to={l.to} className="text-foreground/75 hover:text-primary">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">{children}</main>

      <footer className="border-t border-border/60 bg-card/60">
        <div className="mx-auto max-w-4xl px-4 py-8 text-[13px] text-muted-foreground">
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            {FOOT[lang].map((l) => (
              <Link key={l.to} to={l.to} className="hover:text-primary">
                {l.label}
              </Link>
            ))}
          </nav>
          <p className="mt-4">
            {isAr
              ? "بالانتساب إلى جامعة الملك عبدالعزيز — كلية العلوم الطبية التطبيقية، جدة، المملكة العربية السعودية.": "In affiliation with King Abdulaziz University — Faculty of Applied Medical Sciences, Jeddah, Saudi Arabia."}
          </p>
          <p className="mt-2">© {new Date().getFullYear()} أقلع — Aqla</p>
        </div>
      </footer>
    </div>
  );
}
