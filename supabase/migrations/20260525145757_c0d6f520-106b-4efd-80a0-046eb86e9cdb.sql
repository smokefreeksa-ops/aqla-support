
CREATE TABLE public.aqla_quit_engine_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NULL,
  session_id text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  email text NULL,
  user_name text NULL,
  support_person_name text NULL,
  product_types jsonb NOT NULL DEFAULT '[]'::jsonb,
  primary_product text NULL,
  mixed_use boolean NOT NULL DEFAULT false,
  relapse_prevention_mode boolean NOT NULL DEFAULT false,
  first_use_after_waking text NULL,
  cigarettes_per_day text NULL,
  shisha_sessions_per_week text NULL,
  shisha_session_duration text NULL,
  vape_pattern text NULL,
  nicotine_pouch_frequency text NULL,
  triggers jsonb NOT NULL DEFAULT '[]'::jsonb,
  importance_score int NULL,
  confidence_score int NULL,
  readiness_score int NULL,
  readiness_category text NULL,
  previous_quit_attempts text NULL,
  longest_abstinence text NULL,
  relapse_causes jsonb NOT NULL DEFAULT '[]'::jsonb,
  safety_flags jsonb NOT NULL DEFAULT '[]'::jsonb,
  personal_reasons jsonb NOT NULL DEFAULT '[]'::jsonb,
  hsi_score int NULL,
  aqla_intensity_score int NOT NULL DEFAULT 0,
  dependence_category text NULL,
  primary_trigger_pattern text NULL,
  secondary_trigger_pattern text NULL,
  referral_needed boolean NOT NULL DEFAULT false,
  result_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  pdf_generated boolean NOT NULL DEFAULT false,
  email_sent boolean NOT NULL DEFAULT false,
  admin_notified boolean NOT NULL DEFAULT false
);

CREATE TABLE public.aqla_quit_engine_followups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id uuid NOT NULL REFERENCES public.aqla_quit_engine_results(id) ON DELETE CASCADE,
  followup_type text NOT NULL,
  scheduled_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.aqla_quit_engine_email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id uuid NOT NULL REFERENCES public.aqla_quit_engine_results(id) ON DELETE CASCADE,
  recipient_type text NOT NULL,
  email text NULL,
  subject text NULL,
  status text NOT NULL,
  error_message text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_aqe_results_created ON public.aqla_quit_engine_results(created_at DESC);
CREATE INDEX idx_aqe_results_user ON public.aqla_quit_engine_results(user_id);
CREATE INDEX idx_aqe_results_session ON public.aqla_quit_engine_results(session_id);
CREATE INDEX idx_aqe_followups_result ON public.aqla_quit_engine_followups(result_id);
CREATE INDEX idx_aqe_email_logs_result ON public.aqla_quit_engine_email_logs(result_id);

ALTER TABLE public.aqla_quit_engine_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aqla_quit_engine_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aqla_quit_engine_email_logs ENABLE ROW LEVEL SECURITY;

-- Results
CREATE POLICY "aqe_results_insert_any" ON public.aqla_quit_engine_results
  FOR INSERT WITH CHECK (true);

CREATE POLICY "aqe_results_select_owner" ON public.aqla_quit_engine_results
  FOR SELECT USING (user_id IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "aqe_results_select_admin" ON public.aqla_quit_engine_results
  FOR SELECT USING (public.is_admin_user(auth.uid()));

-- Followups
CREATE POLICY "aqe_followups_insert_any" ON public.aqla_quit_engine_followups
  FOR INSERT WITH CHECK (true);

CREATE POLICY "aqe_followups_select_owner" ON public.aqla_quit_engine_followups
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.aqla_quit_engine_results r
    WHERE r.id = aqla_quit_engine_followups.result_id
      AND r.user_id IS NOT NULL AND r.user_id = auth.uid()
  ));

CREATE POLICY "aqe_followups_select_admin" ON public.aqla_quit_engine_followups
  FOR SELECT USING (public.is_admin_user(auth.uid()));

-- Email logs
CREATE POLICY "aqe_email_logs_insert_any" ON public.aqla_quit_engine_email_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "aqe_email_logs_select_admin" ON public.aqla_quit_engine_email_logs
  FOR SELECT USING (public.is_admin_user(auth.uid()));
