import { ArrowLeft } from "lucide-react";
import { useCanGoBack, useNavigate, useRouterState } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export interface BackButtonProps {
  /** Fallback route used when there is no in-app history to go back to. */
  fallback: string;
  /** Parent label shown in the button, Arabic. */
  labelAr: string;
  /** Parent label shown in the button, English. */
  labelEn: string;
  className?: string;
  /** Override the full button text (e.g. plain "Go back"). */
  textAr?: string;
  textEn?: string;
}

/**
 * Shared "← Back to {parent}" control.
 * Uses in-app history when available, otherwise navigates to the fallback route.
 * Never exits the site.
 */
export function BackButton({ fallback, labelAr, labelEn, className, textAr, textEn }: BackButtonProps) {
  const navigate = useNavigate();
  const canGoBack = useCanGoBack();
  const locationKey = useRouterState({ select: (s) => s.location.state?.key });
  const { lang } = useLang();
  const isAr = lang === "ar";
  const label = isAr ? labelAr : labelEn;
  const hasHistory = canGoBack && locationKey !== "default";

  return (
    <button
      type="button"
      onClick={() => {
        if (hasHistory) {
          window.history.back();
        } else {
          navigate({ to: fallback });
        }
      }}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3.5 py-1.5 text-sm font-medium text-foreground/80 backdrop-blur-sm transition-colors hover:bg-accent hover:text-foreground",
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
      <span>
        {textAr || textEn
          ? isAr
            ? textAr ?? textEn
            : textEn ?? textAr
          : `${isAr ? "العودة إلى " : "Back to "}${label}`}
      </span>
    </button>
  );
}
