import { createFileRoute, Link } from "@tanstack/react-router";
import { SimpleContentPage } from "@/components/SimpleContentPage";

export const Route = createFileRoute("/updates")({
  head: () => ({ meta: [{ title: "تحديثات أقلع — Aqla" }] }),
  component: UpdatesPage,
});

function UpdatesPage() {
  return (
    <SimpleContentPage
      titleAr="تحديثات أقلع"
      titleEn="Aqla Updates"
      introAr="تابع مستجدات أقلع، التحديات، المبادرات المجتمعية، والمواد التوعوية الجديدة."
      introEn="Follow Aqla updates, challenges, community initiatives, and new awareness materials."
      sectionsAr={[
        { heading: "مجتمع وتحديات أقلع", body: <Link to="/challenge-pathway" className="text-primary underline">افتح مركز المجتمع والتحديات</Link> },
      ]}
      sectionsEn={[
        { heading: "Aqla Community & Challenges", body: <Link to="/challenge-pathway" className="text-primary underline">Open the Community & Challenges center</Link> },
      ]}
    />
  );
}