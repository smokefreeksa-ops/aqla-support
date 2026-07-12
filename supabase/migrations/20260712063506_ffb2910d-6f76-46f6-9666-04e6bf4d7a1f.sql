
CREATE TABLE public.sos_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_session_id TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  craving_before INTEGER NOT NULL CHECK (craving_before BETWEEN 0 AND 10),
  craving_after INTEGER CHECK (craving_after BETWEEN 0 AND 10),
  craving_delta INTEGER,
  protocol_id TEXT NOT NULL,
  selection_reason TEXT NOT NULL,
  is_second_loop BOOLEAN NOT NULL DEFAULT false,
  first_protocol_id TEXT,
  protocol_completed BOOLEAN NOT NULL DEFAULT false,
  signal_quality NUMERIC,
  current_state_score NUMERIC,
  acoustic_features JSONB,
  persona_snapshot JSONB,
  trigger_tag TEXT,
  local_hour INTEGER,
  day_of_week INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.sos_sessions TO authenticated;
GRANT INSERT, SELECT ON public.sos_sessions TO anon;
GRANT ALL ON public.sos_sessions TO service_role;

ALTER TABLE public.sos_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sos_sessions_owner_select" ON public.sos_sessions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "sos_sessions_owner_insert" ON public.sos_sessions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sos_sessions_owner_update" ON public.sos_sessions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Anonymous users may insert & update their own session rows scoped by anonymous_session_id.
CREATE POLICY "sos_sessions_anon_insert" ON public.sos_sessions
  FOR INSERT TO anon
  WITH CHECK (user_id IS NULL AND anonymous_session_id IS NOT NULL);

CREATE POLICY "sos_sessions_anon_update" ON public.sos_sessions
  FOR UPDATE TO anon
  USING (user_id IS NULL AND anonymous_session_id IS NOT NULL)
  WITH CHECK (user_id IS NULL AND anonymous_session_id IS NOT NULL);

CREATE INDEX sos_sessions_user_idx ON public.sos_sessions (user_id, started_at DESC);
CREATE INDEX sos_sessions_anon_idx ON public.sos_sessions (anonymous_session_id, started_at DESC);
