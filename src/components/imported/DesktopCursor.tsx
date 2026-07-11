import { useEffect, useState } from "react";
import CursorTrail from "./CursorTrail";
import CustomCursor from "./CustomCursor";

/**
 * Renders custom cursor + trail on desktop pointers only.
 * Skips mount on touch devices or when the user prefers reduced motion.
 * Client-only to avoid hydration mismatches.
 */
export default function DesktopCursor() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const isFine =
      window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(isFine);
  }, []);

  if (!enabled) return null;
  return (
    <>
      <CursorTrail />
      <CustomCursor />
    </>
  );
}
