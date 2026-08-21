import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { QuitChatConversation } from "@/components/clinical/QuitChatConversation";

/**
 * In-page chat panel. Opens over the current page (no navigation, no new tab)
 * so a first-time visitor can start the plan immediately.
 */
export function QuitChatDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  // Tracks whether this drawer currently owns the top history entry.
  const ownsHistory = useRef(false);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  // History-aware modal: opening pushes exactly one temporary entry so the
  // browser/system Back button closes the drawer instead of leaving the site.
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (open && !ownsHistory.current) {
      ownsHistory.current = true;
      window.history.pushState(
        { ...(window.history.state ?? {}), aqlaQuitChatDrawer: true },
        "",
        window.location.href,
      );
    }

    if (!open && ownsHistory.current) {
      // Closed by UI (button / Escape / backdrop): pop our own entry back off.
      ownsHistory.current = false;
      if (window.history.state?.aqlaQuitChatDrawer) window.history.back();
    }
  }, [open]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onPop = () => {
      if (ownsHistory.current) {
        ownsHistory.current = false;
        onClose();
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return (
    <div
      dir="rtl"
      aria-hidden={!open}
      className={`fixed inset-0 z-[500] ${open ? "" : "pointer-events-none opacity-0"} transition-opacity`}
    >
      <button
        type="button"
        aria-label="إغلاق المحادثة"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="مساعد أقلع الذكي"
        className={`absolute inset-x-0 bottom-0 mx-auto flex h-[88vh] max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-background shadow-2xl transition-transform duration-300 sm:h-[85vh] ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="text-right">
            <h2 className="text-base font-bold text-foreground">مساعد أقلع الذكي</h2>
            <p className="text-xs text-foreground/70">خطة إقلاع سلوكية شخصية — بدون محتوى دوائي</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="grid h-9 w-9 place-items-center rounded-full text-foreground/70 transition-colors hover:bg-muted"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <QuitChatConversation
            onPlan={() => {}}
            onBeforeNavigate={() => {
              // Release the drawer's history entry so closing does not undo the
              // navigation, then close so the destination page is visible.
              ownsHistory.current = false;
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}
