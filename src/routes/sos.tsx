import { createFileRoute } from "@tanstack/react-router";
import { SOSScreen } from "@/features/sos/components/SOSScreen";

export const Route = createFileRoute("/sos")({
  head: () => ({
    meta: [
      { title: "نجدة أقلع — SOS Craving Rescue | Aqla" },
      {
        name: "description",
        content:
          "تدخل فوري لمدة ٤٥–٦٠ ثانية عند الرغبة بالتدخين — نجدة أقلع. Immediate personality-adaptive craving rescue.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "نجدة أقلع — Aqla SOS" },
      {
        property: "og:description",
        content: "تدخل فوري عند الرغبة بالتدخين.",
      },
    ],
  }),
  component: SOSPage,
});

function SOSPage() {
  return <SOSScreen />;
}
