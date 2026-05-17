
-- Additive columns on existing tables
ALTER TABLE public.participants
  ADD COLUMN IF NOT EXISTS school_university_workplace text,
  ADD COLUMN IF NOT EXISTS affiliation_type text,
  ADD COLUMN IF NOT EXISTS education_level text,
  ADD COLUMN IF NOT EXISTS nationality text,
  ADD COLUMN IF NOT EXISTS pregnancy boolean,
  ADD COLUMN IF NOT EXISTS research_consent_status text NOT NULL DEFAULT 'not_given';

ALTER TABLE public.consent_records
  ADD COLUMN IF NOT EXISTS consent_research_publication boolean NOT NULL DEFAULT false;

-- Helper to create standard RLS on new participant-data tables
-- (we inline it per table for clarity)

-- 1. product_use_details (per-product detail)
CREATE TABLE IF NOT EXISTS public.product_use_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL,
  product text NOT NULL,
  ever_use boolean,
  current_use_30d boolean,
  days_used_30d integer,
  age_first_use integer,
  age_regular_use integer,
  usual_place text,
  source text,
  family_peer_use boolean,
  ad_exposure boolean,
  is_main_product boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pud_pid ON public.product_use_details(participant_id);
ALTER TABLE public.product_use_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public can submit pud" ON public.product_use_details FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins read pud" ON public.product_use_details FOR SELECT TO authenticated USING (is_admin_user(auth.uid()));

-- 2. cigarette_module
CREATE TABLE IF NOT EXISTS public.cigarette_module (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL,
  cigarettes_per_day integer,
  time_to_first_cig text,
  hsi_score integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cigm_pid ON public.cigarette_module(participant_id);
ALTER TABLE public.cigarette_module ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public can submit cigm" ON public.cigarette_module FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins read cigm" ON public.cigarette_module FOR SELECT TO authenticated USING (is_admin_user(auth.uid()));

-- 3. vape_module
CREATE TABLE IF NOT EXISTS public.vape_module (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL,
  days_30d integer,
  times_per_day integer,
  time_to_first text,
  nicotine_concentration text,
  device_type text,
  flavors text,
  refillable text,
  used_at_institution boolean,
  tried_to_stop boolean,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_vapem_pid ON public.vape_module(participant_id);
ALTER TABLE public.vape_module ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public can submit vapem" ON public.vape_module FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins read vapem" ON public.vape_module FOR SELECT TO authenticated USING (is_admin_user(auth.uid()));

-- 4. pouch_module
CREATE TABLE IF NOT EXISTS public.pouch_module (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL,
  days_30d integer,
  pouches_per_day integer,
  nicotine_strength text,
  time_to_first text,
  flavors text,
  source text,
  used_at_institution boolean,
  tried_to_stop boolean,
  wants_counseling boolean,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pouchm_pid ON public.pouch_module(participant_id);
ALTER TABLE public.pouch_module ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public can submit pouchm" ON public.pouch_module FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins read pouchm" ON public.pouch_module FOR SELECT TO authenticated USING (is_admin_user(auth.uid()));

-- 5. shisha_module
CREATE TABLE IF NOT EXISTS public.shisha_module (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL,
  days_30d integer,
  sessions_per_week integer,
  avg_session_minutes integer,
  shared_mouthpiece boolean,
  setting text,
  tobacco_type text,
  also_uses_other boolean,
  quit_interest text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_shisham_pid ON public.shisha_module(participant_id);
ALTER TABLE public.shisha_module ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public can submit shisham" ON public.shisha_module FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins read shisham" ON public.shisha_module FOR SELECT TO authenticated USING (is_admin_user(auth.uid()));

-- 6. honc_screening
CREATE TABLE IF NOT EXISTS public.honc_screening (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL,
  q1_tried_quit_failed boolean,
  q2_strong_cravings boolean,
  q3_felt_addicted boolean,
  q4_hard_in_restricted boolean,
  q5_withdrawal boolean,
  q6_needed_to_feel_normal boolean,
  q7_increased_use boolean,
  q8_felt_controlled boolean,
  q9_continued_despite_health boolean,
  q10_stopping_difficult boolean,
  positive_count integer NOT NULL DEFAULT 0,
  any_yes boolean NOT NULL DEFAULT false,
  category text NOT NULL DEFAULT 'none',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_honc_pid ON public.honc_screening(participant_id);
ALTER TABLE public.honc_screening ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public can submit honc" ON public.honc_screening FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins read honc" ON public.honc_screening FOR SELECT TO authenticated USING (is_admin_user(auth.uid()));

-- 7. motivation_assessment
CREATE TABLE IF NOT EXISTS public.motivation_assessment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL,
  importance_0_10 integer,
  confidence_0_10 integer,
  main_reason text,
  barriers text[],
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mot_pid ON public.motivation_assessment(participant_id);
ALTER TABLE public.motivation_assessment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public can submit mot" ON public.motivation_assessment FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins read mot" ON public.motivation_assessment FOR SELECT TO authenticated USING (is_admin_user(auth.uid()));

-- 8. quit_history
CREATE TABLE IF NOT EXISTS public.quit_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL,
  ever_tried boolean,
  attempts_count integer,
  longest_quit_duration text,
  methods_used text[],
  main_relapse_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_qh_pid ON public.quit_history(participant_id);
ALTER TABLE public.quit_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public can submit qh" ON public.quit_history FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins read qh" ON public.quit_history FOR SELECT TO authenticated USING (is_admin_user(auth.uid()));

-- 9. safety_flags
CREATE TABLE IF NOT EXISTS public.safety_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL,
  pregnancy boolean,
  severe_chest_pain boolean,
  severe_breathlessness boolean,
  coughing_blood boolean,
  severe_withdrawal boolean,
  mental_health_concern boolean,
  repeated_failed_attempts boolean,
  multi_product_use boolean,
  medication_request boolean,
  alt_product_request boolean,
  clinician_request boolean,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sf_pid ON public.safety_flags(participant_id);
ALTER TABLE public.safety_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public can submit sf" ON public.safety_flags FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins read sf" ON public.safety_flags FOR SELECT TO authenticated USING (is_admin_user(auth.uid()));

-- 10. follow_up_visits
CREATE TABLE IF NOT EXISTS public.follow_up_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL,
  visit_point text NOT NULL,
  visit_date date NOT NULL DEFAULT CURRENT_DATE,
  contacted boolean,
  lost_to_follow_up boolean,
  quit_attempt_made boolean,
  abstinent boolean,
  reduced_use boolean,
  relapsed boolean,
  current_product_use text,
  cigarettes_per_day integer,
  vaping_frequency text,
  pouches_per_day integer,
  craving_0_10 integer,
  confidence_0_10 integer,
  co_reading numeric,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_fuv_pid ON public.follow_up_visits(participant_id);
ALTER TABLE public.follow_up_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read fuv" ON public.follow_up_visits FOR SELECT TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "physicians write fuv" ON public.follow_up_visits FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'physician'::app_role));
CREATE POLICY "physicians update fuv" ON public.follow_up_visits FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'physician'::app_role));
