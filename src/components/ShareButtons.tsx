import { Button } from "@/components/ui/button";
import { Linkedin, Twitter, MessageCircle, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

interface Props {
  shareUrl: string;
  textAr?: string;
  textEn?: string;
  lang?: "ar" | "en";
  hashtags?: string[];
}

const DEFAULT_HASHTAGS = ["أقلع", "Aqla", "ابدأ_بخطوة", "رحلة_الإقلاع"];
const HANDLE = "@SmokeOffKSA";

export function ShareButtons({
  shareUrl,
  textAr,
  textEn,
  lang = "ar",
  hashtags = DEFAULT_HASHTAGS,
}: Props) {
  const text = (lang === "ar" ? textAr : textEn) ?? textAr ?? textEn ?? "";
  const hashtagLine = hashtags.map((h) => `#${h}`).join(" ");

  const xText = `${text}\n\n${shareUrl}\n\n${HANDLE}\n${hashtagLine}`.trim();
  const waText = `${text}\n\n${shareUrl}`.trim();
  const copyText = `${text}\n\n${shareUrl}\n${HANDLE}\n${hashtagLine}`.trim();

  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(xText)}`;
  const waUrl = `https://wa.me/?text=${encodeURIComponent(waText)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(copyText);
      toast.success(lang === "ar" ? "تم النسخ" : "Copied");
    } catch {
      toast.error(lang === "ar" ? "تعذر النسخ" : "Could not copy");
    }
  }

  const open = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <Button size="sm" variant="outline" onClick={() => open(linkedInUrl)} className="gap-2">
        <Linkedin className="h-4 w-4" />
        {lang === "ar" ? "شارك في LinkedIn" : "Share on LinkedIn"}
      </Button>
      <Button size="sm" variant="outline" onClick={() => open(xUrl)} className="gap-2">
        <Twitter className="h-4 w-4" />
        {lang === "ar" ? "شارك على X" : "Share on X"}
      </Button>
      <Button size="sm" variant="outline" onClick={() => open(waUrl)} className="gap-2 text-brand">
        <MessageCircle className="h-4 w-4" />
        WhatsApp
      </Button>
      <Button size="sm" variant="outline" onClick={copy} className="gap-2">
        <LinkIcon className="h-4 w-4" />
        {lang === "ar" ? "نسخ الرابط" : "Copy link"}
      </Button>
    </div>
  );
}
