import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DATA_DICTIONARY } from "@/lib/data-dictionary";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/admin/data-dictionary")({
  head: () => ({ meta: [{ title: "Data Dictionary — Aqla" }] }),
  component: DataDictionaryPage,
});

function DataDictionaryPage() {
  const nav = useNavigate();
  const [ready, setReady] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) nav({ to: "/login" });
      else setReady(true);
    });
  }, [nav]);

  if (!ready) return null;

  const filtered = DATA_DICTIONARY.filter((d) => {
    const s = q.trim().toLowerCase();
    if (!s) return true;
    return [d.variable, d.question, d.section, d.source].some((v) => v.toLowerCase().includes(s));
  });

  const sections = Array.from(new Set(filtered.map((d) => d.section)));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" /> Admin
            </Link>
            <span className="font-semibold">Data Dictionary</span>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 space-y-4">
        <Card className="p-4">
          <h1 className="text-xl font-semibold">Aqla Quit Support — Data Dictionary</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every variable collected, with its purpose, source framework, and whether it appears in anonymized research exports.
            Frameworks referenced: GATS, GYTS/NYTS, FTND, HSI, HONC-style, NCSCT/Russell Standard, internal.
          </p>
          <div className="mt-4 max-w-md">
            <Input placeholder="Search variable, question, section…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="outline" onClick={() => {
              const headers = ["section","variable","question","options","coding","required","source","triagePurpose","researchPurpose","inAnonymizedExport"] as const;
              const esc = (v: unknown) => {
                const s = String(v ?? "").replace(/"/g, '""');
                return /[",\n]/.test(s) ? `"${s}"` : s;
              };
              const csv = [headers.join(","), ...DATA_DICTIONARY.map((r) => headers.map((h) => esc((r as unknown as Record<string, unknown>)[h])).join(","))].join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url; a.download = "aqla_data_dictionary.csv"; a.click();
              URL.revokeObjectURL(url);
            }}>Download CSV</Button>
          </div>
        </Card>

        {sections.map((sec) => (
          <Card key={sec} className="p-4">
            <h2 className="font-semibold text-lg">{sec}</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="text-left text-muted-foreground">
                  <tr>
                    <th className="p-2">Variable</th>
                    <th className="p-2">Question</th>
                    <th className="p-2">Options</th>
                    <th className="p-2">Coding</th>
                    <th className="p-2">Req</th>
                    <th className="p-2">Source</th>
                    <th className="p-2">Triage purpose</th>
                    <th className="p-2">Research purpose</th>
                    <th className="p-2">Anon export</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.filter((d) => d.section === sec).map((d) => (
                    <tr key={d.variable} className="border-t align-top">
                      <td className="p-2 font-mono">{d.variable}</td>
                      <td className="p-2">{d.question}</td>
                      <td className="p-2">{d.options}</td>
                      <td className="p-2">{d.coding}</td>
                      <td className="p-2">{d.required ? <Badge variant="default">req</Badge> : <Badge variant="outline">opt</Badge>}</td>
                      <td className="p-2">{d.source}</td>
                      <td className="p-2">{d.triagePurpose}</td>
                      <td className="p-2">{d.researchPurpose}</td>
                      <td className="p-2">{d.inAnonymizedExport ? "Yes" : "No"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ))}

        <Card className="p-4 border-warning bg-warning/10">
          <p className="text-sm">
            <strong>Research export notice:</strong> The anonymized research dataset should only be used in accordance with applicable ethics
            approval, participant consent permissions (<code>research_consent_status = 'given'</code>), and data-governance requirements.
          </p>
        </Card>
      </main>
    </div>
  );
}
