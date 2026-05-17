import { useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { trackEvent } from "@/lib/track-event";

export function FloatingWhatsAppButton() {
  const location = useLocation();
  const [lang, setLang] = useState<"en" | "ar">("ar");

  useEffect(() => {
    if (typeof document === "undefined") return;
    const saved = (localStorage.getItem("lang") as "en" | "ar") || "ar";
    setLang(saved);
    const observer = new MutationObserver(() => {
      setLang((document.documentElement.lang as "en" | "ar") || "ar");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    return () => observer.disconnect();
  }, []);

  const pathname = location.pathname;
  const isPublic = ["/", "/about", "/assessment", "/volunteer"].includes(pathname);
  if (!isPublic) return null;

  const isAr = lang === "ar";
  const message = isAr
    ? "السلام عليكم، أرغب في التواصل مع فريق أقلع بخصوص دعم الإقلاع عن التدخين أو النيكوتين."
    : "Hello, I would like to contact the Aqla team about smoking or nicotine cessation support.";
  const url = `https://wa.me/966555096412?text=${encodeURIComponent(message)}`;
  const label = isAr ? "تواصل عبر واتساب" : "WhatsApp us";
  const shortLabel = isAr ? "واتساب" : "Chat";
  const ariaLabel = isAr ? "تواصل مع أقلع عبر واتساب" : "Contact Aqla via WhatsApp";

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className={[
        "fixed bottom-5 z-50 flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:shadow-xl",
        isAr ? "left-5" : "right-5",
        "bg-[#25D366]",
      ].join(" ")}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-5 w-5 shrink-0"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-.806-.86-1.104-.224-.296-.448-.198-.644-.198-.172 0-.372.025-.571.025-.198 0-.52-.075-.806.372-.298.446-1.155 1.418-1.155 3.459 0 2.042 1.488 4.018 1.696 4.292.198.273 2.928 4.464 7.094 6.264.99.422 1.762.673 2.366.86.993.298 1.896.198 2.615.173.796-.025 2.458-.988 2.806-1.94.347-.952.347-1.766.248-1.94-.099-.174-.347-.273-.644-.422zM12.005 2C6.477 2 2 6.477 2 12.005c0 2.227.62 4.316 1.69 6.1L2 22l4.025-1.035A9.934 9.934 0 0012.005 22c5.528 0 10.005-4.477 10.005-10.005C22.01 6.477 17.533 2 12.005 2z" />
      </svg>
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{shortLabel}</span>
    </a>
  );
}
