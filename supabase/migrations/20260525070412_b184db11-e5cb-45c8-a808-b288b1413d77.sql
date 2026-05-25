-- DTx (Digital Therapeutics) standalone module — additive only
CREATE TABLE public.dtx_pacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  quit_start_date DATE NOT NULL,
  monthly_spend NUMERIC NOT NULL DEFAULT 0,
  reason_1 TEXT NOT NULL,
  reason_2 TEXT NOT NULL,
  ftnd_score INTEGER,
  readiness_score INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.dtx_pacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dtx_pacts_own_select" ON public.dtx_pacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "dtx_pacts_own_insert" ON public.dtx_pacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "dtx_pacts_own_update" ON public.dtx_pacts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "dtx_pacts_own_delete" ON public.dtx_pacts FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER dtx_pacts_updated BEFORE UPDATE ON public.dtx_pacts
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.dtx_halt_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('hungry','angry','lonely','tired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.dtx_halt_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dtx_halt_own_select" ON public.dtx_halt_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "dtx_halt_own_insert" ON public.dtx_halt_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "dtx_halt_own_delete" ON public.dtx_halt_events FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX dtx_halt_user_time ON public.dtx_halt_events(user_id, created_at DESC);

CREATE TABLE public.dtx_slips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('work_stress','argument','social','boredom')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.dtx_slips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dtx_slips_own_select" ON public.dtx_slips FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "dtx_slips_own_insert" ON public.dtx_slips FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "dtx_slips_own_delete" ON public.dtx_slips FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.dtx_nrt_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  taken BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, log_date)
);
ALTER TABLE public.dtx_nrt_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dtx_nrt_own_select" ON public.dtx_nrt_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "dtx_nrt_own_insert" ON public.dtx_nrt_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "dtx_nrt_own_update" ON public.dtx_nrt_log FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "dtx_nrt_own_delete" ON public.dtx_nrt_log FOR DELETE USING (auth.uid() = user_id);