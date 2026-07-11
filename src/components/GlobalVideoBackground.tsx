import { useEffect, useRef } from "react";
import videoAsset from "@/assets/aqla-bg.mp4.asset.json";

/**
 * Fixed, muted, looping video that sits behind every page as a global backdrop.
 * A subtle overlay preserves text legibility.
 */
export function GlobalVideoBackground() {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    // Some browsers block autoplay until we explicitly kick it after mount.
    const tryPlay = () => {
      v.play().catch(() => {
        // On failure, retry once the user interacts.
        const resume = () => {
          v.play().catch(() => {});
          window.removeEventListener("pointerdown", resume);
          window.removeEventListener("keydown", resume);
        };
        window.addEventListener("pointerdown", resume, { once: true });
        window.addEventListener("keydown", resume, { once: true });
      });
    };
    tryPlay();
    // If the tab is backgrounded and the video pauses, resume when visible.
    const onVis = () => {
      if (!document.hidden) tryPlay();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <video
        ref={ref}
        src={videoAsset.url}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Soft overlay to keep foreground content readable */}
      <div className="absolute inset-0 bg-background/55 backdrop-blur-[2px]" />
    </div>
  );
}
