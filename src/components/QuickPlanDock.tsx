import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { HeartPulse, ClipboardList, X } from "lucide-react";
import { appRoutes } from "@/lib/app-routes";
import { track } from "@/lib/events";

const DISMISS_KEY = "aqla_quick_plan_dock_dismissed_v1";

/** Routes where the dock would duplicate the page's own primary action. */
function isHiddenPath(pathname: string) {
  return (
    pathname === appRoutes.quitChat ||
    pathname === "/sos" ||
    pathname.startsWith("/sos/") ||
    pathname.startsWith("/dashboard")
  );
}

export function QuickPlanDock() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  if (dismissed || isHiddenPath(pathname)) return null;

  return (
    <div
      dir="rtl"
      className="fixed inset-x-0 bottom-0 z-[70] border-t border-white/15 bg-primary/95 text-primary-foreground backdrop-blur supports-[backdrop-filter]:bg-primary/85"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-1.5 sm:gap-3 sm:px-4">
        <Link
          to={appRoutes.quitChat}
          onClick={() => track("quick_action", "quit_plan_dock")}
          className="inline-flex min-h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-background px-3 text-[13px] font-bold text-primary shadow-sm transition-colors hover:bg-background/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background sm:px-4 sm:text-sm"
        >
          <span>ابدأ خطة الإقلاع السريعة مع د. مالك</span>

        </Link>

        <div className="flex min-w-0 flex-1 items-center justify-start gap-1.5 sm:gap-3">
          <Link
            to={appRoutes.cravingCoach}
            onClick={() => track("quick_action", "craving_coach_dock")}
            aria-label="دعم فوري للرغبة"
            className="inline-flex min-h-9 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-[13px] font-medium text-primary-foreground/90 transition-colors hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background sm:px-3"
          >
            <HeartPulse className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">دعم فوري للرغبة</span>
          </Link>
          <Link
            to={appRoutes.assessment}
            onClick={() => track("quick_action", "assessment_dock")}
            aria-label="تقييم سريع"
            className="inline-flex min-h-9 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-[13px] font-medium text-primary-foreground/90 transition-colors hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background sm:px-3"
          >
            <ClipboardList className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">تقييم سريع</span>
          </Link>
        </div>

        <button
          type="button"
          aria-label="إخفاء شريط الوصول السريع"
          onClick={() => {
            sessionStorage.setItem(DISMISS_KEY, "1");
            setDismissed(true);
          }}
          className="inline-grid h-8 w-8 shrink-0 place-items-center rounded-full text-primary-foreground/80 transition-colors hover:bg-white/15 hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
