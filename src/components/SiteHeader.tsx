import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronDown, Languages, Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLang } from "@/lib/i18n";
import { appRoutes } from "@/lib/app-routes";
import { supabase } from "@/integrations/supabase/client";
import { ResearchBanner } from "@/components/ResearchBanner";
import { SearchTrigger } from "@/components/CommandPalette";
import aqlaLogo from "@/assets/aqla-logo.png";

type NavItem = { ar: string; en: string; to: string };
type NavGroup = { ar: string; en: string; items: NavItem[] };

const HOME: NavItem = { ar: "الرئيسية", en: "Home", to: appRoutes.home };

const NAV_GROUPS: NavGroup[] = [
  {
    ar: "الإقلاع",
    en: "Quit",
    items: [
      { ar: "مسار الإقلاع", en: "Quit Pathway", to: appRoutes.quitPathway },
      { ar: "أقلع الشخصي", en: "Aqla Quit Engine", to: appRoutes.aqlaQuitEngine },
      { ar: "المساعد الصوتي", en: "Voice Assistant", to: appRoutes.aqlaVoiceChat },
      { ar: "فحص الرغبة الصوتي", en: "Voice Craving Scan", to: appRoutes.voiceCravingScan },
    ],
  },
  {
    ar: "الدعم",
    en: "Support",
    items: [
      { ar: "مسار المساعدة", en: "Help Someone", to: appRoutes.helpPathway },
      { ar: "طلب الدعم", en: "Request Support", to: appRoutes.requestSupport },
    ],
  },
  {
    ar: "التعلم والتدريب",
    en: "Learn & Train",
    items: [
      { ar: "التعلم والتدريب", en: "Learn & Train", to: appRoutes.learnTrain },
      { ar: "الشهادات", en: "Certificates", to: appRoutes.certificates },
    ],
  },
  {
    ar: "المجتمع",
    en: "Community",
    items: [
      { ar: "التحديات والأنشطة", en: "Challenges & Activities", to: appRoutes.challengePathway },
      { ar: "أثر أقلع", en: "Impact", to: appRoutes.impact },
    ],
  },
  {
    ar: "المزيد",
    en: "More",
    items: [
      { ar: "عن أقلع", en: "About", to: appRoutes.about },
      { ar: "الأسئلة الشائعة", en: "FAQ", to: appRoutes.faq },
    ],
  },
];

function isRouteActive(pathname: string, to: string): boolean {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function SiteHeader() {
  const { lang, setLang, dir } = useLang();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let mounted = true;
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (mounted) setSignedIn(!!s);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSignedIn(!!data.session);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    if (typeof window !== "undefined") window.location.href = "/";
  }

  return (
    <div className="sticky top-0 z-40">
      <header dir={dir} className="border-b border-border/60 bg-card/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
          <Link to={appRoutes.home} className="flex shrink-0 items-center gap-2.5">
            <img src={aqlaLogo} alt="Aqla — أقلع" className="h-9 w-auto object-contain sm:h-10" />
            <div className="hidden leading-tight sm:block">
              <div className="text-sm font-semibold tracking-tight">{lang === "ar" ? "أقلع" : "Aqla"}</div>
              <div className="text-[10px] text-muted-foreground">Aqla — أقلع</div>
            </div>
          </Link>

          <nav className="hidden xl:flex items-center gap-0.5" aria-label={lang === "ar" ? "التنقل الرئيسي" : "Main navigation"}>
            <Link
              to={HOME.to}
              activeProps={{ className: "text-primary font-semibold bg-primary/5" }}
              activeOptions={{ exact: true }}
              className="rounded-md px-2.5 py-1.5 text-[13px] font-medium text-foreground/75 hover:text-primary hover:bg-primary/5"
            >
              {lang === "ar" ? HOME.ar : HOME.en}
            </Link>

            {NAV_GROUPS.map((group) => {
              const groupActive = group.items.some((item) => isRouteActive(pathname, item.to));
              return (
                <DropdownMenu key={group.en} dir={dir}>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
                        groupActive ? "bg-primary/5 text-primary font-semibold" : "text-foreground/75"
                      }`}
                    >
                      <span>{lang === "ar" ? group.ar : group.en}</span>
                      <ChevronDown className="h-3.5 w-3.5 opacity-60" aria-hidden />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align={lang === "ar" ? "end" : "start"}
                    className="min-w-[210px]"
                  >
                    {group.items.map((item) => (
                      <DropdownMenuItem key={item.to + item.en} asChild>
                        <Link
                          to={item.to}
                          className={`w-full cursor-pointer ${
                            isRouteActive(pathname, item.to) ? "bg-primary/5 font-semibold text-primary" : ""
                          }`}
                        >
                          {lang === "ar" ? item.ar : item.en}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5">
            <SearchTrigger />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="gap-1.5 text-xs"
              aria-label={lang === "ar" ? "Switch to English" : "التحويل إلى العربية"}
            >
              <Languages className="h-3.5 w-3.5" />
              {lang === "ar" ? "EN" : "ع"}
            </Button>
            {!signedIn ? (
              <>
                <Link to={appRoutes.staffLogin} className="hidden sm:inline-flex">
                  <Button variant="outline" size="sm" className="text-xs">
                    {lang === "ar" ? "دخول الموظفين" : "Staff"}
                  </Button>
                </Link>
                <Link to={appRoutes.start} className="hidden md:inline-flex">
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs">
                    {lang === "ar" ? "ابدأ الآن" : "Start Now"}
                  </Button>
                </Link>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void signOut()}
                className="gap-1 text-xs"
                aria-label={lang === "ar" ? "تسجيل الخروج" : "Sign out"}
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{lang === "ar" ? "تسجيل الخروج" : "Sign out"}</span>
              </Button>
            )}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-md border border-border/60 xl:hidden"
              aria-label={open ? (lang === "ar" ? "إغلاق القائمة" : "Close menu") : (lang === "ar" ? "فتح القائمة" : "Open menu")}
              aria-expanded={open}
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="xl:hidden border-t border-border/60 bg-card">
            <nav
              className="mx-auto max-w-6xl px-4 py-3"
              aria-label={lang === "ar" ? "التنقل الرئيسي" : "Main navigation"}
            >
              <Link
                to={HOME.to}
                onClick={() => setOpen(false)}
                activeProps={{ className: "text-primary font-semibold bg-primary/5" }}
                activeOptions={{ exact: true }}
                className="block rounded-md px-3 py-2 text-sm text-foreground/85 hover:bg-primary/5"
              >
                {lang === "ar" ? HOME.ar : HOME.en}
              </Link>

              {NAV_GROUPS.map((group) => (
                <div key={"m-" + group.en} className="mt-2 border-t border-border/40 pt-2 first:border-t-0">
                  <div className="px-3 pb-1 text-[11px] font-semibold text-muted-foreground">
                    {lang === "ar" ? group.ar : group.en}
                  </div>
                  <div className="grid gap-0.5">
                    {group.items.map((item) => (
                      <Link
                        key={"m-" + item.to + item.en}
                        to={item.to}
                        onClick={() => setOpen(false)}
                        activeProps={{ className: "text-primary font-semibold bg-primary/5" }}
                        className="rounded-md px-3 py-2 text-sm text-foreground/85 hover:bg-primary/5"
                      >
                        {lang === "ar" ? item.ar : item.en}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}

              <Link
                to={appRoutes.staffLogin}
                onClick={() => setOpen(false)}
                className="mt-2 block rounded-md border-t border-border/40 px-3 py-2 pt-4 text-sm text-foreground/85 hover:bg-primary/5 sm:hidden"
              >
                {lang === "ar" ? "دخول الموظفين" : "Staff Login"}
              </Link>
            </nav>
          </div>
        )}
      </header>
      <ResearchBanner />
    </div>
  );
}
