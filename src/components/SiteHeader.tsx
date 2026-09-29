import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronDown, Languages, Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";
import { appRoutes } from "@/lib/app-routes";
import { supabase } from "@/integrations/supabase/client";
import { ResearchBanner } from "@/components/ResearchBanner";
import { SearchTrigger } from "@/components/CommandPalette";
import aqlaLogo from "@/assets/aqla-logo.png";
type NavItem = { ar: string; en: string; to: string };

const NAV: { ar: string; en: string; items: NavItem[] }[] = [
  { ar: "الإقلاع", en: "Quit", items: [
    { ar: "مسار الإقلاع", en: "Quit Pathway", to: appRoutes.quitPathway },
    { ar: "أقلع الشخصي", en: "Aqla Quit Engine", to: appRoutes.aqlaQuitEngine },
    { ar: "المساعد الصوتي", en: "Voice Assistant", to: appRoutes.aqlaVoiceChat },
    { ar: "فحص الرغبة الصوتي", en: "Voice Craving Scan", to: appRoutes.voiceCravingScan },
  ] },
  { ar: "الدعم", en: "Support", items: [
    { ar: "مسار المساعدة", en: "Help Someone", to: appRoutes.helpPathway },
    { ar: "طلب الدعم", en: "Request Support", to: appRoutes.requestSupport },
  ] },
  { ar: "التعلم والتدريب", en: "Learn & Train", items: [
    { ar: "التعلم والتدريب", en: "Learn & Train", to: appRoutes.learnTrain },
    { ar: "الشهادات", en: "Certificates", to: appRoutes.certificates },
  ] },
  { ar: "المجتمع", en: "Community", items: [
    { ar: "التحديات والأنشطة", en: "Challenges & Activities", to: appRoutes.challengePathway },
    { ar: "أثر أقلع", en: "Impact", to: appRoutes.impact },
  ] },
  { ar: "المزيد", en: "More", items: [
    { ar: "عن أقلع", en: "About", to: appRoutes.about },
    { ar: "الأسئلة الشائعة", en: "FAQ", to: appRoutes.faq },
  ] },
];

export function SiteHeader() {
  const { lang, setLang, dir } = useLang();
  const pathname = useLocation({ select: (location) => location.pathname });
  const [open, setOpen] = useState(false);
  const [mobileGroup, setMobileGroup] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const isActive = (to: string) => pathname === to || (to !== "/" && pathname.startsWith(`${to}/`));

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

        <nav aria-label={lang === "ar" ? "التنقل الرئيسي" : "Main navigation"} className="hidden xl:flex items-center gap-0.5">
          <Link to={appRoutes.home} activeOptions={{ exact: true }} activeProps={{ className: "text-primary font-semibold" }} className="rounded-md px-2.5 py-1.5 text-[13px] font-medium text-foreground/75 hover:text-primary hover:bg-primary/5">
            {lang === "ar" ? "الرئيسية" : "Home"}
          </Link>
          {NAV.map((group) => {
            const active = group.items.some((item) => isActive(item.to));
            return (
              <details key={group.en} className="group relative" onKeyDown={(event) => { if (event.key === "Escape") { event.currentTarget.open = false; event.currentTarget.querySelector("summary")?.focus(); } }} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false; }}>
                <summary aria-current={active ? "page" : undefined} className={`flex cursor-pointer list-none items-center gap-1 rounded-md px-2.5 py-1.5 text-[13px] font-medium hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring group-open:bg-primary/5 group-open:text-primary [&::-webkit-details-marker]:hidden ${active ? "text-primary font-semibold" : "text-foreground/75"}`}>
                    {lang === "ar" ? group.ar : group.en}
                    <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                </summary>
                <div dir={dir} className="absolute start-0 top-full z-50 mt-1 min-w-48 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md">
                  {group.items.map((item) => (
                      <Link key={item.to} to={item.to} aria-current={isActive(item.to) ? "page" : undefined} className={`block rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent focus-visible:bg-accent ${isActive(item.to) ? "bg-primary/5 font-semibold text-primary" : ""}`}>
                        {lang === "ar" ? item.ar : item.en}
                      </Link>
                  ))}
                </div>
              </details>
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-md border border-border/60 xl:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="xl:hidden border-t border-border/60 bg-card">
          <nav aria-label={lang === "ar" ? "التنقل الرئيسي" : "Main navigation"} className="mx-auto grid max-h-[calc(100dvh-8rem)] max-w-6xl gap-0.5 overflow-y-auto px-4 py-3">
            <Link to={appRoutes.home} onClick={() => setOpen(false)} activeOptions={{ exact: true }} activeProps={{ className: "text-primary font-semibold bg-primary/5" }} className="rounded-md px-3 py-2 text-sm text-foreground/85 hover:bg-primary/5">
              {lang === "ar" ? "الرئيسية" : "Home"}
            </Link>
            {NAV.map((group) => {
              const expanded = mobileGroup === group.en;
              const active = group.items.some((item) => isActive(item.to));
              return (
                <div key={group.en}>
                  <Button variant="ghost" aria-expanded={expanded} onClick={() => setMobileGroup(expanded ? null : group.en)} className={`flex h-9 w-full justify-between rounded-md px-3 text-sm hover:bg-primary/5 ${active ? "bg-primary/5 font-semibold text-primary" : "text-foreground/85"}`}>
                    {lang === "ar" ? group.ar : group.en}
                    <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} aria-hidden="true" />
                  </Button>
                  {expanded && (
                    <div className="grid gap-0.5 border-s border-border/60 ms-4 ps-2">
                      {group.items.map((item) => (
                        <Link key={item.to} to={item.to} onClick={() => setOpen(false)} activeProps={{ className: "text-primary font-semibold bg-primary/5" }} className="rounded-md px-3 py-2 text-sm text-foreground/85 hover:bg-primary/5">
                          {lang === "ar" ? item.ar : item.en}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <Link to={appRoutes.staffLogin} onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm text-foreground/85 hover:bg-primary/5 sm:hidden">
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