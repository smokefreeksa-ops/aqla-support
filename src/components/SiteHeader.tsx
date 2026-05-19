import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Languages, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";
import aqlaLogo from "@/assets/aqla-logo.png";

type NavItem = { ar: string; en: string; to: string };

const NAV: NavItem[] = [
  { ar: "الرئيسية", en: "Home", to: "/" },
  { ar: "ابدأ الآن", en: "Start Now", to: "/assessment" },
  { ar: "مسار الإقلاع", en: "Quit Pathway", to: "/quit-pathway" },
  { ar: "مسار المساعدة", en: "Help Someone", to: "/help-pathway" },
  { ar: "التحديات والأوسمة", en: "Challenges & Medals", to: "/challenge-pathway" },
  { ar: "التعلم والتدريب", en: "Learn & Train", to: "/learn" },
  { ar: "طلب الدعم", en: "Request Support", to: "/tools" },
  { ar: "أثر أقلع", en: "Impact", to: "/movement" },
  { ar: "عن أقلع", en: "About", to: "/about" },
];

export function SiteHeader() {
  const { lang, setLang, dir } = useLang();
  const [open, setOpen] = useState(false);

  return (
    <header dir={dir} className="sticky top-0 z-40 border-b border-border/60 bg-card/85 backdrop-blur supports-[backdrop-filter]:bg-card/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <img src={aqlaLogo} alt="Aqla — أقلع" className="h-9 w-auto object-contain sm:h-10" />
          <div className="hidden leading-tight sm:block">
            <div className="text-sm font-semibold tracking-tight">{lang === "ar" ? "أقلع" : "Aqla"}</div>
            <div className="text-[10px] text-muted-foreground">Aqla — أقلع</div>
          </div>
        </Link>

        <nav className="hidden xl:flex items-center gap-0.5">
          {NAV.map((item) => (
            <Link
              key={item.to + item.en}
              to={item.to}
              activeProps={{ className: "text-primary font-semibold" }}
              activeOptions={{ exact: item.to === "/" }}
              className="rounded-md px-2.5 py-1.5 text-[13px] font-medium text-foreground/75 hover:text-primary hover:bg-primary/5"
            >
              {lang === "ar" ? item.ar : item.en}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="gap-1.5 text-xs"
          >
            <Languages className="h-3.5 w-3.5" />
            {lang === "ar" ? "EN" : "ع"}
          </Button>
          <Link to="/login" className="hidden sm:inline-flex">
            <Button variant="outline" size="sm" className="text-xs">
              {lang === "ar" ? "دخول الموظفين" : "Staff"}
            </Button>
          </Link>
          <Link to="/assessment" className="hidden md:inline-flex">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs">
              {lang === "ar" ? "ابدأ الآن" : "Start Now"}
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-md border border-border/60 xl:hidden"
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="xl:hidden border-t border-border/60 bg-card">
          <nav className="mx-auto grid max-w-6xl gap-0.5 px-4 py-3">
            {NAV.map((item) => (
              <Link
                key={"m-" + item.to + item.en}
                to={item.to}
                onClick={() => setOpen(false)}
                activeProps={{ className: "text-primary font-semibold bg-primary/5" }}
                activeOptions={{ exact: item.to === "/" }}
                className="rounded-md px-3 py-2 text-sm text-foreground/85 hover:bg-primary/5"
              >
                {lang === "ar" ? item.ar : item.en}
              </Link>
            ))}
            <Link to="/guidelines" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm text-foreground/85 hover:bg-primary/5">
              {lang === "ar" ? "المكتبة المهنية" : "Library"}
            </Link>
            <Link to="/login" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm text-foreground/85 hover:bg-primary/5 sm:hidden">
              {lang === "ar" ? "دخول الموظفين" : "Staff Login"}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
