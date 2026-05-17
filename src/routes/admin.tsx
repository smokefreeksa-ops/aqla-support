import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  listParticipants, getDashboardStats, getParticipant,
  updateParticipantReception, addClinicalNote, updateOutcome, exportCsv,
} from "@/lib/admin.functions";
import { LogOut, Download, ShieldAlert, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard — La-tatten" }] }),
  component: AdminPage,
});

type Row = Awaited<ReturnType<typeof listParticipants>>["rows"][number];

function AdminPage() {
  const nav = useNavigate();
  const list = useServerFn(listParticipants);
  const stats = useServerFn(getDashboardStats);
  const exportFn = useServerFn(exportCsv);
  const [ready, setReady] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [statsData, setStatsData] = useState<Awaited<ReturnType<typeof getDashboardStats>>["stats"] | null>(null);
  const [search, setSearch] = useState("");
  const [cohort, setCohort] = useState<string>("");
  const [drOnly, setDrOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) nav({ to: "/login" });
      else setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => {
      if (!sess) nav({ to: "/login" });
    });
    return () => sub.subscription.unsubscribe();
  }, [nav]);

  async function refresh() {
    try {
      const [l, st] = await Promise.all([
        list({ data: { search: search || undefined, cohort: cohort || undefined, doctorReview: drOnly || undefined } }),
        stats({}),
      ]);
      setRows(l.rows); setRoles(l.roles); setStatsData(st.stats);
    } catch (e) { toast.error((e as Error).message); }
  }
  useEffect(() => { if (ready) refresh(); /* eslint-disable-next-line */ }, [ready]);

  async function doExport(type: "full" | "anonymized" | "cohort" | "follow_up_due" | "research") {
    try {
      const r = await exportFn({ data: { type, cohort: cohort || undefined } });
      const blob = new Blob([r.csv], { type: "text/csv" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = r.filename; a.click();
    } catch (e) { toast.error((e as Error).message); }
  }

  if (!ready) return null;
  const isPhysician = roles.includes("physician");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="font-semibold">La-tatten</Link>
            <Badge variant="outline">{roles.join(", ") || "no role"}</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={async () => { await supabase.auth.signOut(); nav({ to: "/login" }); }}>
            <LogOut className="h-4 w-4 mr-1" /> Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        {roles.length === 0 && (
          <Card className="p-4 border-warning bg-warning/10 text-sm">
            <ShieldAlert className="inline h-4 w-4 mr-1" />
            Your account has no role assigned. A physician must add your role in the user_roles table.
          </Card>
        )}

        {statsData && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <Stat label="Total" value={statsData.total} />
            <Stat label="Today" value={statsData.today} />
            <Stat label="Need Doctor" value={statsData.doctorReview} tone="warning" />
            <Stat label="Pending Contact" value={statsData.pending} />
            <Stat label="Contacted" value={statsData.contacted} />
            <Stat label="Appointments" value={statsData.appointments} />
            {Object.entries(statsData.byCohort).map(([k, v]) => (
              <Stat key={k} label={`Cohort ${k}`} value={v} tone="primary" />
            ))}
          </div>
        )}

        <Card className="p-4">
          <div className="flex flex-wrap items-end gap-2">
            <div className="grow min-w-48">
              <label className="text-xs text-muted-foreground">Search (name / phone / ID / city)</label>
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" />
            </div>
            <div className="w-32">
              <label className="text-xs text-muted-foreground">Cohort</label>
              <Select value={cohort || "all"} onValueChange={(v) => setCohort(v === "all" ? "" : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {["A","B","C","D","E","F","G","H"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={drOnly} onChange={(e) => setDrOnly(e.target.checked)} />
              Doctor review only
            </label>
            <Button onClick={refresh} variant="outline" size="sm"><RefreshCw className="h-4 w-4 mr-1" /> Apply</Button>
            {isPhysician && (
              <div className="ml-auto flex flex-wrap gap-1">
                <Button size="sm" variant="outline" onClick={() => doExport("full")}><Download className="h-4 w-4 mr-1" />Full</Button>
                <Button size="sm" variant="outline" onClick={() => doExport("anonymized")}><Download className="h-4 w-4 mr-1" />Anonymized</Button>
                <Button size="sm" variant="outline" onClick={() => doExport("cohort")} disabled={!cohort}><Download className="h-4 w-4 mr-1" />Cohort</Button>
                <Button size="sm" variant="outline" onClick={() => doExport("follow_up_due")}><Download className="h-4 w-4 mr-1" />Follow-up due</Button>
                <Button size="sm" variant="outline" onClick={() => doExport("research")}><Download className="h-4 w-4 mr-1" />Research</Button>
              </div>
            )}
          </div>
        </Card>

        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="p-2">ID</th><th className="p-2">Name</th><th className="p-2">Mobile</th>
                <th className="p-2">Age</th><th className="p-2">City</th><th className="p-2">Cohort</th>
                <th className="p-2">Dr</th><th className="p-2">Contacted</th><th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t hover:bg-muted/30">
                  <td className="p-2 font-mono text-xs">{r.participant_code}</td>
                  <td className="p-2">{r.full_name}</td>
                  <td className="p-2">{r.mobile}</td>
                  <td className="p-2">{r.age ?? "—"}</td>
                  <td className="p-2">{r.city ?? "—"}</td>
                  <td className="p-2"><Badge>{r.cohort}</Badge></td>
                  <td className="p-2">{r.doctor_review_needed ? <Badge variant="destructive">Yes</Badge> : "—"}</td>
                  <td className="p-2">{r.contacted ? "✓" : "—"}</td>
                  <td className="p-2"><Button size="sm" variant="outline" onClick={() => setSelectedId(r.id)}>Open</Button></td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">No participants yet.</td></tr>}
            </tbody>
          </table>
        </Card>
      </main>

      {selectedId && <DetailDrawer id={selectedId} onClose={() => { setSelectedId(null); refresh(); }} isPhysician={isPhysician} />}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "warning" | "primary" }) {
  return (
    <Card className="p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-2xl font-bold ${tone === "warning" ? "text-warning" : tone === "primary" ? "text-primary" : ""}`}>{value}</div>
    </Card>
  );
}

function DetailDrawer({ id, onClose, isPhysician }: { id: string; onClose: () => void; isPhysician: boolean }) {
  const get = useServerFn(getParticipant);
  const upd = useServerFn(updateParticipantReception);
  const addNote = useServerFn(addClinicalNote);
  const updOut = useServerFn(updateOutcome);
  const [data, setData] = useState<Awaited<ReturnType<typeof getParticipant>> | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => { get({ data: { id } }).then(setData).catch((e) => toast.error((e as Error).message)); }, [id, get]);

  if (!data) return null;
  const p = data.participant!;

  return (
    <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose}>
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl overflow-y-auto bg-background p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-muted-foreground">{p.participant_code}</div>
            <h2 className="text-xl font-semibold">{p.full_name}</h2>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <Info label="Mobile">{p.mobile}</Info>
          <Info label="Email">{p.email ?? "—"}</Info>
          <Info label="Age">{p.age ?? "—"}</Info>
          <Info label="City">{p.city ?? "—"}</Info>
          <Info label="Cohort"><Badge>{p.cohort}</Badge></Info>
          <Info label="Doctor review">{p.doctor_review_needed ? "Yes" : "No"}</Info>
          <Info label="Preferred contact">{p.preferred_contact}</Info>
          <Info label="Language">{p.preferred_language}</Info>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {data.cigScore && (
            <Card className="p-3">
              <div className="text-xs text-muted-foreground">Cigarette dependence</div>
              <div className="text-3xl font-bold text-primary">{data.cigScore.total_score}/10</div>
              <div className="text-xs">{data.cigScore.category}</div>
            </Card>
          )}
          {data.nicScore && (
            <Card className="p-3">
              <div className="text-xs text-muted-foreground">Nicotine control</div>
              <div className="text-3xl font-bold text-secondary">{data.nicScore.yes_count}/10</div>
              <div className="text-xs">{data.nicScore.category}</div>
            </Card>
          )}
        </div>

        <Card className="mt-4 p-3 space-y-2">
          <h3 className="font-semibold">Reception update</h3>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" defaultChecked={p.contacted}
              onChange={async (e) => { await upd({ data: { id, contacted: e.target.checked, contact_date: new Date().toISOString() } }); toast.success("Saved"); }}
            /> Contacted
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" defaultChecked={p.appointment_requested}
              onChange={async (e) => { await upd({ data: { id, appointment_requested: e.target.checked } }); toast.success("Saved"); }}
            /> Appointment requested
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" defaultChecked={p.doctor_review_needed}
              onChange={async (e) => { await upd({ data: { id, doctor_review_needed: e.target.checked } }); toast.success("Saved"); }}
            /> Escalate to doctor
          </label>
          <textarea className="w-full rounded border bg-background p-2 text-sm" rows={2}
            placeholder="Receptionist notes" defaultValue={p.receptionist_notes ?? ""}
            onBlur={async (e) => { await upd({ data: { id, receptionist_notes: e.target.value } }); toast.success("Notes saved"); }} />
        </Card>

        {isPhysician && (
          <>
            <Card className="mt-4 p-3 space-y-2">
              <h3 className="font-semibold">Clinical notes</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {data.notes.map((n) => (
                  <div key={n.id} className="rounded border p-2 text-sm">
                    <div className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</div>
                    {n.note}
                  </div>
                ))}
                {data.notes.length === 0 && <p className="text-xs text-muted-foreground">No notes yet.</p>}
              </div>
              <textarea className="w-full rounded border bg-background p-2 text-sm" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add clinical note…" />
              <Button size="sm" onClick={async () => {
                if (!note.trim()) return;
                await addNote({ data: { participant_id: id, note } });
                setNote("");
                const fresh = await get({ data: { id } }); setData(fresh);
                toast.success("Note added");
              }}>Add note</Button>
            </Card>

            <Card className="mt-4 p-3 space-y-2">
              <h3 className="font-semibold">Outcome tracking</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {(["status_1w", "status_4w", "status_12w", "status_6m", "status_12m"] as const).map((k) => (
                  <label key={k} className="space-y-1">
                    <span className="text-xs text-muted-foreground">{k}</span>
                    <Input defaultValue={(data.outcome as Record<string, string | null> | null)?.[k] ?? ""}
                      onBlur={async (e) => { await updOut({ data: { participant_id: id, [k]: e.target.value || null } as never }); toast.success("Saved"); }} />
                  </label>
                ))}
                <label className="space-y-1">
                  <span className="text-xs text-muted-foreground">Quit date</span>
                  <Input type="date" defaultValue={data.outcome?.quit_date ?? ""}
                    onBlur={async (e) => { await updOut({ data: { participant_id: id, quit_date: e.target.value || null } }); toast.success("Saved"); }} />
                </label>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div>{children}</div>
    </div>
  );
}
