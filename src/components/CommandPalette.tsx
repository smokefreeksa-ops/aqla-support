import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { appRoutes } from "@/lib/app-routes";
import { MODULES } from "@/data/modules";
import { track } from "@/lib/events";

type Entry = { ar: string; en: string; to: string; group: string };

const QUICK: Entry[] = [
  { ar: "متابعة التعلم", en: "Continue learning", to: "/dashboard/learning", group: "quick" },
  { ar: "ابدأ التقييم النهائي", en: "Start final assessment", to: appRoutes.assessment, group: "quick" },
  { ar: "شهاداتي", en: "My certificates", to: "/dashboard/certificates", group: "quick" },
  { ar: "أنشئ بطاقة إنجازك", en: "Create your poster", to: "/poster-studio", group: "quick" },
  { ar: "دعم فوري للرغبة", en: "Craving SOS", to: appRoutes.cravingCoach, group: "quick" },
  { ar: "شارك في الدراسة", en: "Join the study", to: "https://redcap.kau.edu.sa/surveys/?s=FLJKYNNLYEA7HXAM", group: "quick" },
];

const PAGES: Entry[] = [
  { ar: "الرئيسية", en: "Home", to: appRoutes.home, group: "pages" },
  { ar: "لوحة المتعلم", en: "Learner dashboard", to: "/dashboard", group: "pages" },
  { ar: "مسار الإقلاع", en: "Quit pathway", to: appRoutes.quitPathway, group: "pages" },
  { ar: "مسار المساعدة", en: "Help someone", to: appRoutes.helpPathway, group: "pages" },
  { ar: "التحديات والأنشطة", en: "Challenges", to: appRoutes.challengePathway, group: "pages" },
  { ar: "التعلم والتدريب", en: "Learn & train", to: appRoutes.learnTrain, group: "pages" },
  { ar: "الشهادات", en: "Certificates", to: appRoutes.certificates, group: "pages" },
  { ar: "طلب الدعم", en: "Request support", to: appRoutes.requestSupport, group: "pages" },
  { ar: "المساعد الصوتي", en: "Voice assistant", to: appRoutes.aqlaVoiceChat, group: "pages" },
  { ar: "أقلع الشخصي", en: "Aqla quit engine", to: appRoutes.aqlaQuitEngine, group: "pages" },
  { ar: "الأسئلة الشائعة", en: "FAQ", to: appRoutes.faq, group: "pages" },
  { ar: "عن أقلع", en: "About Aqla", to: appRoutes.about, group: "pages" },
  { ar: "تواصل معنا", en: "Contact", to: appRoutes.contact, group: "pages" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("aqla:open-search", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("aqla:open-search", onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) track("search_opened");
  }, [open]);

  const modules = useMemo<Entry[]>(
    () =>
      MODULES.map((m) => ({
        ar: `${m.num}. ${m.title.ar}`,
        en: m.title.en,
        to: `${appRoutes.learnTrain}#${m.slug}`,
        group: "modules",
      })),
    [],
  );

  function go(entry: Entry) {
    setOpen(false);
    if (entry.group === "quick") track("quick_action", entry.en);
    if (entry.to.startsWith("http")) {
      window.open(entry.to, "_blank", "noopener,noreferrer");
      return;
    }
    if (entry.to.includes("#")) {
      window.location.href = entry.to;
      return;
    }
    void navigate({ to: entry.to });
  }

  const render = (list: Entry[]) =>
    list.map((e) => (
      <CommandItem key={`${e.group}-${e.to}-${e.en}`} value={`${e.ar} ${e.en}`} onSelect={() => go(e)}>
        <span dir="rtl">{e.ar}</span>
        <span className="ms-auto text-xs text-muted-foreground">{e.en}</span>
      </CommandItem>
    ));

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="البحث السريع" description="ابحث في الوحدات والأدوات والصفحات">
      <CommandInput placeholder="ابحث… / Search modules, tools, pages" />
      <CommandList>
        <CommandEmpty>لا توجد نتائج · No results</CommandEmpty>
        <CommandGroup heading="إجراءات سريعة · Quick actions">{render(QUICK)}</CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="الوحدات التدريبية · Modules">{render(modules)}</CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="الصفحات · Pages">{render(PAGES)}</CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export function SearchTrigger({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      aria-label="بحث سريع · Quick search"
      onClick={() => window.dispatchEvent(new CustomEvent("aqla:open-search"))}
      className={`inline-flex min-h-11 items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 text-xs text-muted-foreground transition-colors hover:text-foreground ${className}`}
    >
      <Search className="h-4 w-4" aria-hidden="true" />
      <span className="hidden sm:inline">بحث</span>
      <kbd className="hidden rounded border border-border/60 px-1 text-[10px] md:inline">⌘K</kbd>
    </button>
  );
}
