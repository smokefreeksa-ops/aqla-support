import { useEffect, useState } from "react";
import QRCode from "qrcode";

/** Generates a QR code PNG data URL locally (no external QR service). */
export function useQrDataUrl(text: string, size: number): string {
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (!text) {
      setUrl("");
      return;
    }
    let cancelled = false;
    QRCode.toDataURL(text, { width: size, margin: 1 })
      .then((u) => !cancelled && setUrl(u))
      .catch(() => !cancelled && setUrl(""));
    return () => {
      cancelled = true;
    };
  }, [text, size]);
  return url;
}
