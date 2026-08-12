import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BackButton } from "@/components/BackButton";
import { ArrowLeft, RefreshCw, Mail, CheckCircle2, XCircle, Clock, ChevronDown, ChevronRight } from "lucide-react";
import { listQuitPlanEmails, type QuitPlanGroup } from "@/lib/quit-plan-emails.functions";

export const Route = createFileRoute("/admin/quit-plan-emails")({
  head: () => ({ meta: [{ title: "Quit Plan Email Delivery — Aqla Admin" }] }),
  component: QuitPlanEmailsPage,
});

function statusBadge(status: string) {
  const s = status.toLowerCase();
  if (s === "sent") return <Badge className="bg-digital hover:bg-digital">{status}</Badge>;
  if (["failed", "error", "bounced"].includes(s)) return <Badge variant="destructive">{status}</Badge>;
  return <Badge variant="secondary">{status}</Badge>;
}

function QuitPlanEmailsPage() {
  const nav = useNavigate();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) nav({ to: "/auth" });
      else setReady(true);
    });
  }, [nav]);

  const listFn = useServerFn(listQuitPlanEmails);
  const { data, refetch, isFetching, error } = useQuery({
    queryKey: ["admin-quit-plan-emails"],
    queryFn: () => listFn(),
    enabled: ready,
    staleTime: 15_000,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (!ready) return null;

  const groups = data?.groups ?? [];
  const totals = data?.totals;

  const filtered = groups.filter((g) => {
    if (statusFilter === "failed" && g.failed === 0) return false;
    if (statusFilter === "sent" && g.sent === 0) return false;
    if (statusFilter === "queued" && g.queued === 0) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !g.quit_plan_id.toLowerCase().includes(q) &&
        !(g.plan_user_email ?? "").toLowerCase().includes(q) &&
        !g.emails.some((e) => e.email.toLowerCase().includes(q))
      )
        return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin"><ArrowLeft className="h-4 w-4 mr-1" /> Admin</Link>
            </Button>
            <div className="flex items-center gap-2 font-semibold">
              <Mail className="h-4 w-4 text-primary" />
              Quit Plan Email Delivery
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isFetching ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 space-y-4">
        {error && (
          <Card className="p-4 border-destructive text-sm text-destructive">
            {(error as Error).message}
          </Card>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Stat label="Plans" value={totals?.plans ?? 0} icon={<Mail className="h-4 w-4" />} />
          <Stat label="Total emails" value={totals?.emails ?? 0} icon={<Mail className="h-4 w-4" />} />
          <Stat label="Sent" value={totals?.sent ?? 0} icon={<CheckCircle2 className="h-4 w-4 text-digital" />} />
          <Stat label="Failed" value={totals?.failed ?? 0} icon={<XCircle className="h-4 w-4 text-destructive" />} />
          <Stat label="Queued/other" value={totals?.queued ?? 0} icon={<Clock className="h-4 w-4 text-muted-foreground" />} />
        </div>

        <Card className="p-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            placeholder="Search by plan id, user email, or recipient…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:max-w-sm"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="sm:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All plans</SelectItem>
              <SelectItem value="failed">Has failures</SelectItem>
              <SelectItem value="sent">Has sent</SelectItem>
              <SelectItem value="queued">Has queued/other</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-xs text-muted-foreground sm:ml-auto">
            {filtered.length} of {groups.length} plans
          </div>
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 w-8"></th>
                  <th className="px-3 py-2">Plan</th>
                  <th className="px-3 py-2">User</th>
                  <th className="px-3 py-2">Last attempt</th>
                  <th className="px-3 py-2 text-center">Sent</th>
                  <th className="px-3 py-2 text-center">Failed</th>
                  <th className="px-3 py-2 text-center">Queued</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="px-3 py-6 text-center text-muted-foreground">No email records.</td></tr>
                )}
                {filtered.map((g) => (
                  <GroupRow
                    key={g.quit_plan_id}
                    group={g}
                    expanded={!!expanded[g.quit_plan_id]}
                    onToggle={() =>
                      setExpanded((p) => ({ ...p, [g.quit_plan_id]: !p[g.quit_plan_id] }))
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <Card className="p-3">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">{icon}<span>{label}</span></div>
      <div className="mt-1 text-2xl font-bold text-foreground">{value.toLocaleString()}</div>
    </Card>
  );
}

function GroupRow({ group, expanded, onToggle }: { group: QuitPlanGroup; expanded: boolean; onToggle: () => void }) {
  const overall =
    group.failed > 0 && group.sent === 0
      ? "Failed"
      : group.failed > 0
        ? "Partial"
        : group.queued > 0 && group.sent === 0
          ? "Queued"
          : "Sent";
  return (
    <>
      <tr className="border-t hover:bg-muted/30 cursor-pointer" onClick={onToggle}>
        <td className="px-3 py-2">
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </td>
        <td className="px-3 py-2 font-mono text-xs">
          <Link to="/quit-plan/$planToken" params={{ planToken: group.quit_plan_id }} className="hover:underline" onClick={(e) => e.stopPropagation()}>
            {group.quit_plan_id.slice(0, 8)}…
          </Link>
          {group.plan_created_at && (
            <div className="text-[10px] text-muted-foreground">created {new Date(group.plan_created_at).toLocaleString()}</div>
          )}
        </td>
        <td className="px-3 py-2">{group.plan_user_email ?? "—"}</td>
        <td className="px-3 py-2 whitespace-nowrap">{new Date(group.last_attempt_at).toLocaleString()}</td>
        <td className="px-3 py-2 text-center">{group.sent}</td>
        <td className={`px-3 py-2 text-center ${group.failed > 0 ? "text-destructive font-semibold" : ""}`}>{group.failed}</td>
        <td className="px-3 py-2 text-center">{group.queued}</td>
        <td className="px-3 py-2">
          {overall === "Sent" && <Badge className="bg-digital hover:bg-digital">Sent</Badge>}
          {overall === "Partial" && <Badge className="bg-amber-500 hover:bg-amber-500">Partial</Badge>}
          {overall === "Failed" && <Badge variant="destructive">Failed</Badge>}
          {overall === "Queued" && <Badge variant="secondary">Queued</Badge>}
        </td>
      </tr>
      {expanded && (
        <tr className="bg-muted/20 border-t">
          <td></td>
          <td colSpan={7} className="px-3 py-3">
            <table className="w-full text-xs">
              <thead className="text-left text-muted-foreground">
                <tr>
                  <th className="py-1 pr-3">Timestamp</th>
                  <th className="py-1 pr-3">Recipient type</th>
                  <th className="py-1 pr-3">Email</th>
                  <th className="py-1 pr-3">Subject</th>
                  <th className="py-1 pr-3">Status</th>
                  <th className="py-1 pr-3">Error</th>
                </tr>
              </thead>
              <tbody>
                {group.emails.map((e) => (
                  <tr key={e.id} className="border-t border-border/50 align-top">
                    <td className="py-1.5 pr-3 whitespace-nowrap">{new Date(e.created_at).toLocaleString()}</td>
                    <td className="py-1.5 pr-3">
                      <Badge variant="outline">{e.recipient_type}</Badge>
                    </td>
                    <td className="py-1.5 pr-3">{e.email}</td>
                    <td className="py-1.5 pr-3 max-w-[280px] truncate" title={e.subject}>{e.subject}</td>
                    <td className="py-1.5 pr-3">{statusBadge(e.status)}</td>
                    <td className="py-1.5 pr-3 max-w-[320px] text-destructive whitespace-pre-wrap break-words">{e.error_message ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </td>
        </tr>
      )}
    </>
  );
}
