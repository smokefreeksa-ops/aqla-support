import logo from "@/assets/aqla-logo.png";

interface Props {
  size?: number;
  className?: string;
}

/**
 * Standard Aqla logo badge — a white rounded container with the official
 * Aqla logo inside. Use this everywhere a brand mark appears on cards,
 * share previews, posters, certificates, etc. Never render a blank box.
 */
export function AqlaLogoBadge({ size = 56, className = "" }: Props) {
  return (
    <div
      className={`inline-flex items-center justify-center bg-white rounded-xl shadow-sm ${className}`}
      style={{ width: size, height: size, padding: size * 0.12 }}
    >
      <img
        src={logo}
        alt="Aqla — أقلع"crossOrigin="anonymous"className="w-full h-full object-contain"
        onError={(e) => {
          // Fallback: render text mark instead of broken image
          const el = e.currentTarget;
          el.style.display = "none";
          if (el.parentElement) {
            el.parentElement.innerHTML =
              '<span style="font-weight:700;color:#047857;font-size:0.85em">أقلع</span>';
          }
        }}
      />
    </div>
  );
}
