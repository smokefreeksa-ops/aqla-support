import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  listParticipants, getDashboardStats, getParticipant,
  updateParticipantReception, addClinicalNote, updateOutcome, exportCsv, addFollowUpVisit,
} from "@/lib/admin.functions";
import {
  listVolunteers, getVolunteerStats, getVolunteer, updateVolunteer, addVolunteerNote,
} from "@/lib/volunteer.functions";
import { LogOut, ShieldAlert, RefreshCw, Users, HeartPulse, AlertTriangle, BarChart3, Eye, Sun, ClipboardCheck, Stethoscope, CalendarCheck, Download } from "lucide-react";
import { getAssistantStatus } from "@/lib/assistant.functions";
import { getPublicImpactStats } from "@/lib/impact.functions";
import { useQuery } from "@tanstack/react-query";
import aqlaLogo from "@/assets/aqla-logo.png";

function AssistantStatusBanner() {
  const statusFn = useServerFn(getAssistantStatus);
  const { data } = useQuery({
    queryKey: ["assistant-status", "admin"],
    queryFn: () => statusFn(),
    staleTime: 30_000,
  });
  if (!data || data.enabled) return null;
  return (
    <div className="flex items-start gap-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-900">
      <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
      <div className="text-sm">
        <div className="font-semibold">Aqla Education Assistant is disabled</div>
        <p className="mt-0.5">
          The <code className="rounded bg-amber-100 px-1">OPENAI_API_KEY</code> secret is missing.
          Add it in your project's backend secrets to enable the public chatbot. The chatbot is currently hidden from visitors.
        </p>
      </div>
    </div>
  );
}

function AdminAnalyticsCard() {
  const statsFn = useServerFn(getPublicImpactStats);
  const assistFn = useServerFn(getAssistantStatus);
  const { data: stats } = useQuery({ queryKey: ["admin-impact-stats"], queryFn: () => statsFn(), staleTime: 30_000 });
  const { data: assist } = useQuery({ queryKey: ["assistant-status", "admin-card"], queryFn: () => assistFn(), staleTime: 60_000 });

  const items: { icon: React.ReactNode; label: string; value: number | string }[] = [
    { icon: <Eye className="h-4 w-4" />, label: "Total visits", value: stats?.total_visits ?? 0 },
    { icon: <Sun className="h-4 w-4" />, label: "Visits today", value: stats?.visits_today ?? 0 },
    { icon: <ClipboardCheck className="h-4 w-4" />, label: "Assessments", value: stats?.total_assessments ?? 0 },
    { icon: <Users className="h-4 w-4" />, label: "Volunteer applicants", value: stats?.volunteer_applicants ?? 0 },
    { icon: <Stethoscope className="h-4 w-4" />, label: "Doctor-review cases", value: stats?.doctor_review_count ?? 0 },
    { icon: <CalendarCheck className="h-4 w-4" />, label: "Follow-up visits", value: stats?.follow_up_visits_logged ?? 0 },
  ];

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <BarChart3 className="h-4 w-4 text-primary" />
        Platform analytics
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          Chatbot: {assist?.enabled ? "enabled" : "disabled"}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((it, i) => (
          <div key={i} className="rounded-lg border bg-card p-3">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              {it.icon}<span>{it.label}</span>
            </div>
            <div className="mt-1 text-xl font-bold text-foreground">{Number(it.value).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard — Aqla" }] }),
  component: AdminPage,
});

type Row = Awaited<ReturnType<typeof listParticipants>>["rows"][number];
type VRow = Awaited<ReturnType<typeof listVolunteers>>["rows"][number];

const VOL_STATUSES = [
  "new_applicant","awaiting_review","accepted_for_training","in_training",
  "active_volunteer","needs_follow_up","not_accepted",
] as const;

function AdminPage() {
  const nav = useNavigate();
  const [ready, setReady] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);

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

  if (!ready) return null;
  const isPhysician = roles.includes("physician");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <img src={aqlaLogo} alt="Aqla — أقلع logo" className="h-[38px] w-auto object-contain sm:h-11" />
              <span className="font-semibold">Aqla — أقلع</span>
            </Link>
            <Badge variant="outline">{roles.join(", ") || "no role"}</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={async () => { await supabase.auth.signOut(); nav({ to: "/login" }); }}>
            <LogOut className="h-4 w-4 mr-1" /> Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 space-y-4">
        <AssistantStatusBanner />
        <AdminAnalyticsCard />
        <Tabs defaultValue="participants">
          <TabsList>
            <TabsTrigger value="participants" className="gap-1.5"><HeartPulse className="h-4 w-4" />Quit Support</TabsTrigger>
            <TabsTrigger value="volunteers" className="gap-1.5"><Users className="h-4 w-4" />Volunteers</TabsTrigger>
          </TabsList>
          <TabsContent value="participants">
            <ParticipantsPanel onRoles={setRoles} isPhysician={isPhysician} />
          </TabsContent>
          <TabsContent value="volunteers">
            <VolunteersPanel />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

/* ---------------- Participants (smoker) ---------------- */
const PRODUCTS = ["cigarettes","vape","shisha","pouches","smokeless","multiple","former","non_user"];
const READINESS_VALUES = ["quit_now","quit_prepare","reduce_first","not_ready_score","discuss_alternatives","score_only","helping_someone"];
const DEP_CATS = [
  "Very low cigarette dependence","Low cigarette dependence","Moderate cigarette dependence",
  "High cigarette dependence","Very high cigarette dependence",
];

function ParticipantsPanel({ onRoles, isPhysician }: { onRoles: (r: string[]) => void; isPhysician: boolean }) {
  const list = useServerFn(listParticipants);
  const stats = useServerFn(getDashboardStats);
  const exportFn = useServerFn(exportCsv);
  const [rows, setRows] = useState<Row[]>([]);
  const [enrich, setEnrich] = useState<Awaited<ReturnType<typeof listParticipants>>["enrich"]>({});
  const [statsData, setStatsData] = useState<Awaited<ReturnType<typeof getDashboardStats>>["stats"] | null>(null);
  const [search, setSearch] = useState("");
  const [cohort, setCohort] = useState<string>("");
  const [product, setProduct] = useState<string>("");
  const [readiness, setReadiness] = useState<string>("");
  const [depCategory, setDepCategory] = useState<string>("");
  const [city, setCity] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [drOnly, setDrOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  async function refresh() {
    try {
      const [l, st] = await Promise.all([
        list({ data: {
          search: search || undefined, cohort: cohort || undefined,
          doctorReview: drOnly || undefined,
          product: product || undefined, readiness: readiness || undefined,
          depCategory: depCategory || undefined,
          city: city || undefined, affiliation: affiliation || undefined,
        } }),
        stats({}),
      ]);
      setRows(l.rows); setEnrich(l.enrich); onRoles(l.roles); setStatsData(st.stats);
    } catch (e) { toast.error((e as Error).message); }
  }
  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, []);

  const [researchOnly, setResearchOnly] = useState(false);
  async function doExport(
    type: "full" | "anonymized" | "cohort" | "follow_up_due" | "research"
      | "baseline" | "follow_up_outcomes" | "product_use" | "youth_nicotine" | "city_summary"
      | "dependence_items" | "readiness_quit_history" | "research_consent_only"
      | "community_exposure",
  ) {
    try {
      const r = await exportFn({ data: { type, cohort: cohort || undefined, researchConsentOnly: researchOnly || undefined } });
      const blob = new Blob([r.csv], { type: "text/csv" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = r.filename; a.click();
    } catch (e) { toast.error((e as Error).message); }
  }

  return (
    <div className="space-y-6 mt-4">
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
          <div className="w-40">
            <label className="text-xs text-muted-foreground">Product</label>
            <Select value={product || "all"} onValueChange={(v) => setProduct(v === "all" ? "" : v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {PRODUCTS.map((p) => <SelectItem key={p} value={p}>{p.replace(/_/g, " ")}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="w-44">
            <label className="text-xs text-muted-foreground">Readiness</label>
            <Select value={readiness || "all"} onValueChange={(v) => setReadiness(v === "all" ? "" : v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {READINESS_VALUES.map((r) => <SelectItem key={r} value={r}>{r.replace(/_/g, " ")}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="w-56">
            <label className="text-xs text-muted-foreground">Dependence category</label>
            <Select value={depCategory || "all"} onValueChange={(v) => setDepCategory(v === "all" ? "" : v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {DEP_CATS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="w-36">
            <label className="text-xs text-muted-foreground">City</label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City…" />
          </div>
          <div className="w-48">
            <label className="text-xs text-muted-foreground">School / University / Workplace</label>
            <Input value={affiliation} onChange={(e) => setAffiliation(e.target.value)} placeholder="Affiliation…" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={drOnly} onChange={(e) => setDrOnly(e.target.checked)} />
            Doctor review only
          </label>
          <Button onClick={refresh} variant="outline" size="sm"><RefreshCw className="h-4 w-4 mr-1" /> Apply</Button>
          {isPhysician && (
            <div className="ml-auto flex flex-wrap items-center gap-1">
              <label className="flex items-center gap-1 text-xs mr-2">
                <input type="checkbox" checked={researchOnly} onChange={(e) => setResearchOnly(e.target.checked)} />
                Research consent only
              </label>
              <Button size="sm" variant="outline" onClick={() => doExport("full")}><Download className="h-4 w-4 mr-1" />Full</Button>
              <Button size="sm" variant="outline" onClick={() => doExport("anonymized")}><Download className="h-4 w-4 mr-1" />Anonymized</Button>
              <Button size="sm" variant="outline" onClick={() => doExport("cohort")} disabled={!cohort}><Download className="h-4 w-4 mr-1" />Cohort</Button>
              <Button size="sm" variant="outline" onClick={() => doExport("follow_up_due")}><Download className="h-4 w-4 mr-1" />Follow-up due</Button>
              <Button size="sm" variant="outline" onClick={() => doExport("baseline")}><Download className="h-4 w-4 mr-1" />Baseline</Button>
              <Button size="sm" variant="outline" onClick={() => doExport("follow_up_outcomes")}><Download className="h-4 w-4 mr-1" />Outcomes</Button>
              <Button size="sm" variant="outline" onClick={() => doExport("product_use")}><Download className="h-4 w-4 mr-1" />Product use</Button>
              <Button size="sm" variant="outline" onClick={() => doExport("youth_nicotine")}><Download className="h-4 w-4 mr-1" />Youth</Button>
              <Button size="sm" variant="outline" onClick={() => doExport("city_summary")}><Download className="h-4 w-4 mr-1" />City summary</Button>
              <Button size="sm" variant="outline" onClick={() => doExport("dependence_items")}><Download className="h-4 w-4 mr-1" />Dependence items</Button>
              <Button size="sm" variant="outline" onClick={() => doExport("readiness_quit_history")}><Download className="h-4 w-4 mr-1" />Readiness &amp; quit history</Button>
              <Button size="sm" variant="outline" onClick={() => doExport("community_exposure")}><Download className="h-4 w-4 mr-1" />Community exposure</Button>
              <Button size="sm" variant="outline" onClick={() => doExport("research_consent_only")}><Download className="h-4 w-4 mr-1" />Research consent only</Button>
            </div>
          )}
        </div>
        {isPhysician && (
          <p className="mt-2 text-xs text-muted-foreground">
            <ShieldAlert className="inline h-3 w-3 mr-1" />
            Anonymized / research / baseline / outcomes / youth / city exports strip name, mobile, email, and free-text notes. Tick "Research consent only" to limit rows to participants who consented to research publication.
          </p>
        )}
      </Card>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left">
            <tr>
              <th className="p-2">ID</th><th className="p-2">Name</th><th className="p-2">Mobile</th>
              <th className="p-2">City</th><th className="p-2">Product</th>
              <th className="p-2">Score</th><th className="p-2">Readiness</th>
              <th className="p-2">Cohort</th><th className="p-2">Dr</th>
              <th className="p-2">Follow-up</th><th className="p-2">Status</th><th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const e = enrich[r.id] ?? {};
              const scoreLabel = e.ftnd
                ? `${e.ftnd.total}/10 cig`
                : e.nic
                  ? `${e.nic.yes_count}/10 nic`
                  : "—";
              return (
                <tr key={r.id} className="border-t hover:bg-muted/30">
                  <td className="p-2 font-mono text-xs">{r.participant_code}</td>
                  <td className="p-2">{r.full_name}</td>
                  <td className="p-2">{r.mobile}</td>
                  <td className="p-2">{r.city ?? "—"}</td>
                  <td className="p-2 text-xs">{(e.products ?? []).map((p) => p.replace(/_/g, " ")).join(", ") || "—"}</td>
                  <td className="p-2 font-medium">{scoreLabel}</td>
                  <td className="p-2 text-xs">{e.readiness ? e.readiness.replace(/_/g, " ") : "—"}</td>
                  <td className="p-2"><Badge>{r.cohort}</Badge></td>
                  <td className="p-2">{r.doctor_review_needed ? <Badge variant="destructive">Yes</Badge> : "—"}</td>
                  <td className="p-2 text-xs">{e.followUp ? e.followUp.replace(/_/g, " ") : "—"}</td>
                  <td className="p-2 text-xs">{r.contacted ? "contacted" : (r.follow_up_status ?? "new")}</td>
                  <td className="p-2"><Button size="sm" variant="outline" onClick={() => setSelectedId(r.id)}>Open</Button></td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={12} className="p-8 text-center text-muted-foreground">No participants yet.</td></tr>}
          </tbody>
        </table>
      </Card>

      {selectedId && <DetailDrawer id={selectedId} onClose={() => { setSelectedId(null); refresh(); }} isPhysician={isPhysician} />}
    </div>
  );
}

/* ---------------- Volunteers ---------------- */
function VolunteersPanel() {
  const list = useServerFn(listVolunteers);
  const stats = useServerFn(getVolunteerStats);
  const [rows, setRows] = useState<VRow[]>([]);
  const [interests, setInterests] = useState<Record<string, string[]>>({});
  const [statsData, setStatsData] = useState<Awaited<ReturnType<typeof getVolunteerStats>>["stats"] | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [city, setCity] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  async function refresh() {
    try {
      const [l, st] = await Promise.all([
        list({ data: { search: search || undefined, status: status || undefined, city: city || undefined } }),
        stats({}),
      ]);
      setRows(l.rows); setInterests(l.interests); setStatsData(st.stats);
    } catch (e) { toast.error((e as Error).message); }
  }
  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, []);

  return (
    <div className="space-y-6 mt-4">
      {statsData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <Stat label="Total Applicants" value={statsData.total} />
          <Stat label="Today" value={statsData.today} />
          <Stat label="Pending Contact" value={statsData.pending} />
          <Stat label="Contacted" value={statsData.contacted} />
          {Object.entries(statsData.byStatus).map(([k, v]) => (
            <Stat key={k} label={k.replace(/_/g, " ")} value={v} tone="primary" />
          ))}
        </div>
      )}

      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-2">
          <div className="grow min-w-48">
            <label className="text-xs text-muted-foreground">Search (name / phone / code / city / affiliation)</label>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" />
          </div>
          <div className="w-48">
            <label className="text-xs text-muted-foreground">Status</label>
            <Select value={status || "all"} onValueChange={(v) => setStatus(v === "all" ? "" : v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {VOL_STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="w-40">
            <label className="text-xs text-muted-foreground">City</label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City…" />
          </div>
          <Button onClick={refresh} variant="outline" size="sm"><RefreshCw className="h-4 w-4 mr-1" /> Apply</Button>
        </div>
      </Card>

      {statsData && (Object.keys(statsData.byCity).length || Object.keys(statsData.byInterest).length) ? (
        <div className="grid gap-3 md:grid-cols-3">
          <BreakdownCard title="By City" data={statsData.byCity} />
          <BreakdownCard title="By Affiliation" data={statsData.byAffiliation} />
          <BreakdownCard title="By Interest" data={statsData.byInterest} />
        </div>
      ) : null}

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left">
            <tr>
              <th className="p-2">Code</th><th className="p-2">Name</th><th className="p-2">Mobile</th>
              <th className="p-2">City</th><th className="p-2">Affiliation</th>
              <th className="p-2">Interests</th><th className="p-2">Status</th>
              <th className="p-2">Contacted</th><th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t hover:bg-muted/30">
                <td className="p-2 font-mono text-xs">{r.application_code}</td>
                <td className="p-2">{r.full_name}</td>
                <td className="p-2">{r.mobile}</td>
                <td className="p-2">{r.city ?? "—"}</td>
                <td className="p-2">{r.affiliation ?? "—"}</td>
                <td className="p-2 text-xs">{(interests[r.id] ?? []).join(", ") || "—"}</td>
                <td className="p-2"><Badge variant="outline">{(r.status as string).replace(/_/g, " ")}</Badge></td>
                <td className="p-2">{r.contacted ? "✓" : "—"}</td>
                <td className="p-2"><Button size="sm" variant="outline" onClick={() => setSelectedId(r.id)}>Open</Button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">No volunteer applications yet.</td></tr>}
          </tbody>
        </table>
      </Card>

      {selectedId && <VolunteerDrawer id={selectedId} onClose={() => { setSelectedId(null); refresh(); }} />}
    </div>
  );
}

function BreakdownCard({ title, data }: { title: string; data: Record<string, number> }) {
  const items = Object.entries(data).filter(([k]) => k !== "?").sort((a, b) => b[1] - a[1]).slice(0, 8);
  return (
    <Card className="p-3">
      <h3 className="text-sm font-semibold mb-2">{title}</h3>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">No data.</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {items.map(([k, v]) => (
            <li key={k} className="flex justify-between"><span className="truncate">{k.replace(/_/g, " ")}</span><span className="font-semibold">{v}</span></li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function VolunteerDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const get = useServerFn(getVolunteer);
  const upd = useServerFn(updateVolunteer);
  const addNote = useServerFn(addVolunteerNote);
  const [data, setData] = useState<Awaited<ReturnType<typeof getVolunteer>> | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => { get({ data: { id } }).then(setData).catch((e) => toast.error((e as Error).message)); }, [id, get]);
  if (!data?.application) return null;
  const a = data.application;

  async function reload() { setData(await get({ data: { id } })); }

  return (
    <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose}>
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl overflow-y-auto bg-background p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-muted-foreground">{a.application_code}</div>
            <h2 className="text-xl font-semibold">{a.full_name}</h2>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <Info label="Mobile">{a.mobile}</Info>
          <Info label="Email">{a.email ?? "—"}</Info>
          <Info label="Age">{a.age ?? "—"}</Info>
          <Info label="City">{a.city ?? "—"}</Info>
          <Info label="Affiliation">{a.affiliation ?? "—"}</Info>
          <Info label="Academic level">{a.academic_level ?? "—"}</Info>
          <Info label="Smoking status">{a.smoking_status ?? "—"}</Info>
          <Info label="Preferred contact">{a.preferred_contact}</Info>
          <Info label="Interests">{(data.interests as string[]).map((i) => i.replace(/_/g, " ")).join(", ") || "—"}</Info>
          <Info label="Availability">{a.availability ?? "—"}</Info>
        </div>

        {a.motivation && (
          <Card className="mt-3 p-3 text-sm">
            <div className="text-xs text-muted-foreground mb-1">Motivation</div>
            {a.motivation}
          </Card>
        )}

        <Card className="mt-4 p-3 space-y-2">
          <h3 className="font-semibold">Status</h3>
          <div className="flex flex-wrap gap-2 items-end">
            <Select value={a.status as string} onValueChange={async (v) => { await upd({ data: { id, status: v as never } }); toast.success("Status updated"); await reload(); }}>
              <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
              <SelectContent>
                {VOL_STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
              </SelectContent>
            </Select>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" defaultChecked={a.contacted}
                onChange={async (e) => { await upd({ data: { id, contacted: e.target.checked, contact_date: new Date().toISOString() } }); toast.success("Saved"); }}
              /> Contacted
            </label>
          </div>
        </Card>

        <Card className="mt-4 p-3 space-y-2">
          <h3 className="font-semibold">Notes</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {data.notes.map((n) => (
              <div key={n.id} className="rounded border p-2 text-sm">
                <div className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</div>
                {n.note}
              </div>
            ))}
            {data.notes.length === 0 && <p className="text-xs text-muted-foreground">No notes yet.</p>}
          </div>
          <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note…" />
          <Button size="sm" onClick={async () => {
            if (!note.trim()) return;
            await addNote({ data: { application_id: id, note } });
            setNote(""); await reload(); toast.success("Note added");
          }}>Add note</Button>
        </Card>

        <Card className="mt-4 p-3 space-y-2">
          <h3 className="font-semibold">Status history</h3>
          <ul className="space-y-1 text-sm">
            {data.history.map((h) => (
              <li key={h.id} className="flex justify-between border-b py-1 last:border-0">
                <span>{(h.status as string).replace(/_/g, " ")}</span>
                <span className="text-xs text-muted-foreground">{new Date(h.created_at).toLocaleString()}</span>
              </li>
            ))}
            {data.history.length === 0 && <p className="text-xs text-muted-foreground">No history.</p>}
          </ul>
        </Card>
      </div>
    </div>
  );
}

/* ---------------- Shared ---------------- */
function Stat({ label, value, tone }: { label: string; value: number; tone?: "warning" | "primary" }) {
  return (
    <Card className="p-3">
      <div className="text-xs text-muted-foreground capitalize">{label}</div>
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

            <FollowUpVisitsCard
              participantId={id}
              visits={data.followups ?? []}
              onChange={async () => { const fresh = await get({ data: { id } }); setData(fresh); }}
            />
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

const VISIT_POINTS = ["1w", "4w", "12w", "6m", "12m"] as const;
type VisitPoint = (typeof VISIT_POINTS)[number];

function FollowUpVisitsCard({
  participantId, visits, onChange,
}: {
  participantId: string;
  visits: Array<Record<string, unknown>>;
  onChange: () => void | Promise<void>;
}) {
  const add = useServerFn(addFollowUpVisit);
  const [visitPoint, setVisitPoint] = useState<VisitPoint>("1w");
  const [contacted, setContacted] = useState(true);
  const [abstinent, setAbstinent] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [relapsed, setRelapsed] = useState(false);
  const [lost, setLost] = useState(false);
  const [craving, setCraving] = useState("");
  const [confidence, setConfidence] = useState("");
  const [cpd, setCpd] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await add({
        data: {
          participant_id: participantId,
          visit_point: visitPoint,
          contacted, abstinent, reduced_use: reduced, relapsed, lost_to_follow_up: lost,
          craving_0_10: craving ? Number(craving) : undefined,
          confidence_0_10: confidence ? Number(confidence) : undefined,
          cigarettes_per_day: cpd ? Number(cpd) : undefined,
          notes: notes || undefined,
        },
      });
      setNotes(""); setCraving(""); setConfidence(""); setCpd("");
      toast.success("Follow-up visit logged");
      await onChange();
    } catch (e) { toast.error((e as Error).message); }
    finally { setSaving(false); }
  }

  return (
    <Card className="mt-4 p-3 space-y-3">
      <h3 className="font-semibold">Follow-up visits</h3>
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {visits.length === 0 && <p className="text-xs text-muted-foreground">No follow-up visits yet.</p>}
        {visits.map((v) => (
          <div key={v.id as string} className="rounded border p-2 text-xs">
            <div className="flex justify-between">
              <Badge variant="outline">{v.visit_point as string}</Badge>
              <span className="text-muted-foreground">{new Date(v.created_at as string).toLocaleDateString()}</span>
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {v.abstinent ? <Badge>abstinent</Badge> : null}
              {v.reduced_use ? <Badge variant="secondary">reduced</Badge> : null}
              {v.relapsed ? <Badge variant="destructive">relapsed</Badge> : null}
              {v.lost_to_follow_up ? <Badge variant="outline">lost</Badge> : null}
            </div>
            {v.notes ? <div className="mt-1">{v.notes as string}</div> : null}
          </div>
        ))}
      </div>
      <div className="border-t pt-3 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <label className="space-y-1 text-xs">
            <span className="text-muted-foreground">Visit point</span>
            <Select value={visitPoint} onValueChange={(v) => setVisitPoint(v as VisitPoint)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {VISIT_POINTS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </label>
          <label className="space-y-1 text-xs">
            <span className="text-muted-foreground">Cigarettes / day</span>
            <Input type="number" min={0} max={200} value={cpd} onChange={(e) => setCpd(e.target.value)} />
          </label>
          <label className="space-y-1 text-xs">
            <span className="text-muted-foreground">Craving (0–10)</span>
            <Input type="number" min={0} max={10} value={craving} onChange={(e) => setCraving(e.target.value)} />
          </label>
          <label className="space-y-1 text-xs">
            <span className="text-muted-foreground">Confidence (0–10)</span>
            <Input type="number" min={0} max={10} value={confidence} onChange={(e) => setConfidence(e.target.value)} />
          </label>
        </div>
        <div className="flex flex-wrap gap-3 text-xs">
          <label className="flex items-center gap-1"><input type="checkbox" checked={contacted} onChange={(e) => setContacted(e.target.checked)} /> Contacted</label>
          <label className="flex items-center gap-1"><input type="checkbox" checked={abstinent} onChange={(e) => setAbstinent(e.target.checked)} /> Abstinent</label>
          <label className="flex items-center gap-1"><input type="checkbox" checked={reduced} onChange={(e) => setReduced(e.target.checked)} /> Reduced</label>
          <label className="flex items-center gap-1"><input type="checkbox" checked={relapsed} onChange={(e) => setRelapsed(e.target.checked)} /> Relapsed</label>
          <label className="flex items-center gap-1"><input type="checkbox" checked={lost} onChange={(e) => setLost(e.target.checked)} /> Lost to follow-up</label>
        </div>
        <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Visit notes…" />
        <Button size="sm" onClick={save} disabled={saving}>Log visit</Button>
      </div>
    </Card>
  );
}
