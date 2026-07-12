import { supabase } from "@/integrations/supabase/client";
import { SOS_ANON_KEY, SOS_HISTORY_KEY, SOS_PERSONA_KEY } from "./sos.constants";
import type {
  AqlaPersona,
  ProtocolHistoryEntry,
  ProtocolId,
  SOSSession,
} from "./sos.types";

/**
 * PRIVACY BOUNDARY:
 * Only derived numeric acoustic features and session outcomes are persisted.
 * Raw audio, blobs, and transcripts are never touched by this module.
 */

function browser(): boolean {
  return typeof window !== "undefined";
}

export function getOrCreateAnonId(): string {
  if (!browser()) return "";
  let id = window.localStorage.getItem(SOS_ANON_KEY);
  if (!id) {
    id = `anon_${crypto.randomUUID()}`;
    window.localStorage.setItem(SOS_ANON_KEY, id);
  }
  return id;
}

export function loadHistory(): ProtocolHistoryEntry[] {
  if (!browser()) return [];
  try {
    const raw = window.localStorage.getItem(SOS_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ProtocolHistoryEntry[];
    return Array.isArray(parsed) ? parsed.slice(-20) : [];
  } catch {
    return [];
  }
}

export function appendHistory(entry: ProtocolHistoryEntry): void {
  if (!browser()) return;
  const next = [...loadHistory(), entry].slice(-20);
  window.localStorage.setItem(SOS_HISTORY_KEY, JSON.stringify(next));
}

export function loadPersona(): AqlaPersona | undefined {
  if (!browser()) return undefined;
  try {
    const raw = window.localStorage.getItem(SOS_PERSONA_KEY);
    if (!raw) return undefined;
    return JSON.parse(raw) as AqlaPersona;
  } catch {
    return undefined;
  }
}

export function savePersona(p: AqlaPersona): void {
  if (!browser()) return;
  window.localStorage.setItem(SOS_PERSONA_KEY, JSON.stringify(p));
}

export function computeEffectiveness(
  history: ProtocolHistoryEntry[],
): Partial<Record<ProtocolId, number>> {
  const buckets: Record<string, number[]> = {};
  for (const h of history) {
    (buckets[h.protocolId] ??= []).push(h.cravingDelta);
  }
  const out: Partial<Record<ProtocolId, number>> = {};
  for (const k of Object.keys(buckets) as ProtocolId[]) {
    const arr = buckets[k]!;
    out[k] = arr.reduce((a, b) => a + b, 0) / arr.length;
  }
  return out;
}

export function recentCount24h(history: ProtocolHistoryEntry[]): number {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  return history.filter((h) => h.at >= cutoff).length;
}

interface PersistedRow {
  id?: string;
  user_id?: string | null;
  anonymous_session_id?: string | null;
  started_at: string;
  completed_at: string | null;
  craving_before: number;
  craving_after: number | null;
  craving_delta: number | null;
  protocol_id: string;
  selection_reason: string;
  is_second_loop: boolean;
  first_protocol_id: string | null;
  protocol_completed: boolean;
  signal_quality: number | null;
  current_state_score: number | null;
  acoustic_features: unknown;
  persona_snapshot: unknown;
  trigger_tag: string | null;
  local_hour: number;
  day_of_week: number;
}

/** Persist a completed SOS session. Never sends audio. */
export async function persistSession(
  session: SOSSession,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { data: userRes } = await supabase.auth.getUser();
    const userId = userRes?.user?.id ?? null;
    const anonId = userId ? null : getOrCreateAnonId();
    const now = new Date();

    const row: PersistedRow = {
      user_id: userId,
      anonymous_session_id: anonId,
      started_at: session.startedAt,
      completed_at: session.completedAt ?? null,
      craving_before: session.cravingBefore,
      craving_after: session.cravingAfter ?? null,
      craving_delta: session.cravingDelta ?? null,
      protocol_id: session.protocolId,
      selection_reason: session.selectionReason,
      is_second_loop: !!session.isSecondLoop,
      first_protocol_id: session.firstProtocolId ?? null,
      protocol_completed: session.protocolCompleted,
      signal_quality: session.signalQuality ?? null,
      current_state_score:
        session.acousticFeatures?.currentStateScore ?? null,
      acoustic_features: session.acousticFeatures ?? null,
      persona_snapshot: session.personaSnapshot ?? null,
      trigger_tag: session.triggerTag ?? null,
      local_hour: now.getHours(),
      day_of_week: now.getDay(),
    };

    // Cast to satisfy generated types until regenerated with the new table.
    const client = supabase as unknown as {
      from: (t: string) => {
        insert: (r: unknown) => Promise<{ error: { message: string } | null }>;
      };
    };
    const { error } = await client.from("sos_sessions").insert(row);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
