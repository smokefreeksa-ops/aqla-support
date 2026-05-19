import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { createShareCard } from "@/lib/share.functions";
import { ShareButtons } from "@/components/ShareButtons";
import { getAnonSessionId } from "@/lib/analytics";

type ShareType =
  | "pledge" | "quick-check" | "breath" | "cost" | "trigger"
  | "readiness" | "knowledge" | "medal" | "poster" | "city"
  | "passport" | "certificate";

interface Props {
  shareType: ShareType;
  isAr: boolean;
  messageAr: string;
  messageEn: string;
  targetPath?: string;
  titleAr?: string;
  titleEn?: string;
  ctaAr?: string;
  ctaEn?: string;
  payload?: Record<string, unknown>;
  /** Optional ref to a DOM node to snapshot as the share image (best-effort). */
  snapshotRef?: React.RefObject<HTMLElement | null>;
  /** Override the visible share URL once created (e.g. for the certificate page itself). */
  fixedShareUrl?: string;
}

function originUrl(path: string): string {
  if (typeof window === "undefined") return path;
  if (path.startsWith("http")) return path;
  return `${window.location.origin}${path.startsWith("/") ? path : `/${path}`}`;
}

async function snapshotDataUrl(el: HTMLElement | null): Promise<string | null> {
  if (!el) return null;
  try {
    const html2canvas = (await import("html2canvas")).default;
    // Wait for inner images
    const imgs = Array.from(el.querySelectorAll("img"));
    await Promise.all(
      imgs.map((img) =>
        img.complete && img.naturalWidth > 0
          ? Promise.resolve()
          : new Promise<void>((res) => {
              img.addEventListener("load", () => res(), { once: true });
              img.addEventListener("error", () => res(), { once: true });
            }),
      ),
    );
    const canvas = await html2canvas(el, { backgroundColor: "#ffffff", scale: 2, useCORS: true });
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

export function ShareResult({
  shareType, isAr, messageAr, messageEn,
  targetPath = "/request-support", titleAr, titleEn, ctaAr, ctaEn,
  payload, snapshotRef, fixedShareUrl,
}: Props) {
  const createFn = useServerFn(createShareCard);
  const [shareUrl, setShareUrl] = useState<string | null>(fixedShareUrl ?? null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (fixedShareUrl) { setShareUrl(fixedShareUrl); return; }
    if (startedRef.current) return;
    startedRef.current = true;
    let cancelled = false;
    (async () => {
      const image_data_url = await snapshotDataUrl(snapshotRef?.current ?? null);
      try {
        const res = await createFn({ data: {
          share_type: shareType,
          anonymous_session_id: getAnonSessionId(),
          title_ar: titleAr ?? null,
          title_en: titleEn ?? null,
          message_ar: messageAr,
          message_en: messageEn,
          cta_ar: ctaAr ?? null,
          cta_en: ctaEn ?? null,
          target_path: targetPath,
          safe_public_payload: payload,
          image_data_url,
        }});
        if (!cancelled && res?.share_path) {
          setShareUrl(originUrl(res.share_path));
        }
      } catch {
        // fall back below
      }
      if (!cancelled && !shareUrl) {
        // graceful fallback: link to the originating tool page
        setShareUrl(originUrl(targetPath));
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const url = shareUrl ?? originUrl(targetPath);
  return (
    <div className="mt-3">
      <ShareButtons
        shareUrl={url}
        textAr={messageAr}
        textEn={messageEn}
        lang={isAr ? "ar" : "en"}
      />
    </div>
  );
}
