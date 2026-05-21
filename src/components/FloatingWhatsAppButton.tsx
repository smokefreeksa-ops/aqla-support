import { useEffect, useRef, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { Phone, MessageCircle, X } from "lucide-react";
import { trackEvent } from "@/lib/track-event";
import { useDraggableWidget } from "@/hooks/use-draggable-widget";

const MAIN_LINE = "طوّلناها عليك؟ خذ العلم على الجوال \u{1F604}";
const FINE_LINE = "واتساب أو اتصال… بس لا تعلّم أحد، البطارية على قدّها. وإذا أنت مدخن، أبشر… بنداريك شوي \u{1F47B}";

export function FloatingWhatsAppButton({ forceVisible = false }: { forceVisible?: boolean } = {}) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const movedRef = useRef(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { ref, style, onPointerDown, dragging, reset } = useDraggableWidget({
    storageKey: "aqla_whatsapp_position",
    defaultSide: "right",
    defaultBottom: 24,
    defaultSideOffset: 24,
  });

  useEffect(() => {
    const handler = () => reset();
    window.addEventListener("aqla:reset-widgets", handler);
    return () => window.removeEventListener("aqla:reset-widgets", handler);
  }, [reset]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const pathname = location.pathname;
  const isPublic = ["/", "/about", "/assessment", "/volunteer", "/request-support", "/city-challenge", "/challenges", "/learn-train", "/poster-studio", "/impact"].includes(pathname);
  if (!forceVisible && !isPublic) return null;

  const handlePointerDown = (e: React.PointerEvent) => {
    movedRef.current = false;
    const startX = e.clientX;
    const startY = e.clientY;
    const moveHandler = (ev: PointerEvent) => {
      if (Math.hypot(ev.clientX - startX, ev.clientY - startY) > 4) {
        movedRef.current = true;
      }
    };
    window.addEventListener("pointermove", moveHandler);
    window.addEventListener(
      "pointerup",
      () => window.removeEventListener("pointermove", moveHandler),
      { once: true },
    );
    onPointerDown(e);
  };

  const handleButtonClick = () => {
    if (movedRef.current || dragging) return;
    setMenuOpen((prev) => !prev);
  };

  const handleWhatsApp = () => {
    trackEvent("whatsapp_clicked");
    const message = "السلام عليكم، أرغب في التواصل مع فريق أقلع بخصوص دعم الإقلاع عن التدخين أو النيكوتين.";
    window.open(
      `https://wa.me/966555096412?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
    setMenuOpen(false);
  };

  const handleCall = () => {
    trackEvent("phone_call_clicked");
    window.location.href = "tel:+966555096412";
    setMenuOpen(false);
  };

  return (
    <div
      ref={ref}
      style={{ ...style, zIndex: 40 }}
      onPointerDown={handlePointerDown}
      className="group"
      dir="rtl"
    >
      <div className="flex flex-col items-end gap-1.5">
        {/* Contact options popup */}
        {menuOpen && (
          <div
            ref={menuRef}
            className="mb-2 flex w-[min(16rem,80vw)] flex-col gap-2 rounded-2xl border border-[#c9a84c]/40 bg-white/95 p-3 shadow-2xl backdrop-blur-sm"
          >
            <div className="flex items-center justify-between gap-2 border-b border-[#0b3a25]/10 pb-2">
              <span
                className="text-sm font-semibold text-[#0b3a25]"
                style={{ unicodeBidi: "plaintext" }}
              >
                تواصل معنا
              </span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="rounded p-1 hover:bg-[#0b3a25]/10"
                aria-label="إغلاق"
              >
                <X className="h-4 w-4 text-[#0b3a25]" />
              </button>
            </div>
            <button
              type="button"
              onClick={handleWhatsApp}
              className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#1ebd59] focus:outline-none focus:ring-2 focus:ring-[#25D366]/40"
            >
              <MessageCircle className="h-4 w-4" />
              <span style={{ unicodeBidi: "plaintext" }}>راسلنا واتساب</span>
            </button>
            <button
              type="button"
              onClick={handleCall}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0b3a25] px-4 py-2.5 text-sm font-semibold text-[#f4f0e1] shadow transition hover:bg-[#0e4a30] focus:outline-none focus:ring-2 focus:ring-[#0b3a25]/40"
            >
              <Phone className="h-4 w-4" />
              <span style={{ unicodeBidi: "plaintext" }}>اتصل مباشرة</span>
            </button>
          </div>
        )}

        {/* Main contact button */}
        <button
          type="button"
          onClick={handleButtonClick}
          dir="rtl"
          className="inline-flex max-w-[min(18rem,70vw)] items-center gap-2 rounded-full bg-[#0b3a25] px-4 py-2.5 text-sm font-semibold text-[#f4f0e1] shadow-lg transition hover:bg-[#0e4a30] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50"
          style={{ unicodeBidi: "plaintext" }}
        >
          <Phone className="h-4 w-4 shrink-0" />
          <span className="text-right leading-snug">{MAIN_LINE}</span>
        </button>

        {/* Fine line teaser */}
        {!menuOpen && (
          <p
            dir="rtl"
            onClick={handleButtonClick}
            className="max-w-[min(18rem,70vw)] cursor-pointer rounded-xl bg-black/40 px-3 py-1.5 text-[11px] leading-relaxed text-[#f4f0e1] backdrop-blur-sm sm:text-xs"
            style={{ unicodeBidi: "plaintext", textAlign: "right" }}
          >
            {FINE_LINE}
          </p>
        )}
      </div>
    </div>
  );
}
