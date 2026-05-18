
-- Aqla Volunteer Training System

CREATE TABLE public.training_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  mobile text,
  city text,
  age_group text,
  role text,
  preferred_language text DEFAULT 'ar',
  consent_training_terms boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.training_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_number integer NOT NULL,
  slug text UNIQUE NOT NULL,
  title_ar text NOT NULL,
  title_en text NOT NULL,
  content_ar text NOT NULL,
  content_en text NOT NULL,
  learning_objectives_ar jsonb DEFAULT '[]'::jsonb,
  learning_objectives_en jsonb DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.training_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
  question_ar text NOT NULL,
  question_en text NOT NULL,
  options_ar jsonb NOT NULL,
  options_en jsonb NOT NULL,
  correct_option_index integer NOT NULL,
  explanation_ar text NOT NULL,
  explanation_en text NOT NULL,
  difficulty text NOT NULL DEFAULT 'standard',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.training_case_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
  scenario_title_ar text NOT NULL,
  scenario_title_en text NOT NULL,
  scenario_text_ar text NOT NULL,
  scenario_text_en text NOT NULL,
  options_ar jsonb NOT NULL,
  options_en jsonb NOT NULL,
  correct_option_index integer NOT NULL,
  explanation_ar text NOT NULL,
  explanation_en text NOT NULL,
  volunteer_script_ar text,
  volunteer_script_en text,
  safety_flag text,
  is_required boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.training_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_user_id uuid NOT NULL REFERENCES public.training_users(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
  completed boolean NOT NULL DEFAULT false,
  score integer,
  attempts integer NOT NULL DEFAULT 0,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (training_user_id, module_id)
);

CREATE TABLE public.training_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_code text UNIQUE NOT NULL,
  training_user_id uuid NOT NULL REFERENCES public.training_users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  overall_score integer NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now(),
  certificate_url text,
  verification_hash text UNIQUE,
  is_valid boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.training_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_case_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_certificates ENABLE ROW LEVEL SECURITY;

-- training_users: public insert; admins read
CREATE POLICY "public insert training_users" ON public.training_users
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins read training_users" ON public.training_users
  FOR SELECT TO authenticated USING (public.is_admin_user(auth.uid()));
CREATE POLICY "admins update training_users" ON public.training_users
  FOR UPDATE TO authenticated USING (public.is_admin_user(auth.uid()));

-- training_modules / questions / scenarios: public read active, admins manage
CREATE POLICY "public read active training_modules" ON public.training_modules
  FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "admins manage training_modules ins" ON public.training_modules
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_user(auth.uid()));
CREATE POLICY "admins manage training_modules upd" ON public.training_modules
  FOR UPDATE TO authenticated USING (public.is_admin_user(auth.uid()));

CREATE POLICY "public read active training_questions" ON public.training_questions
  FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "admins manage training_questions ins" ON public.training_questions
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_user(auth.uid()));
CREATE POLICY "admins manage training_questions upd" ON public.training_questions
  FOR UPDATE TO authenticated USING (public.is_admin_user(auth.uid()));

CREATE POLICY "public read training_case_scenarios" ON public.training_case_scenarios
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage training_case_scenarios ins" ON public.training_case_scenarios
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_user(auth.uid()));
CREATE POLICY "admins manage training_case_scenarios upd" ON public.training_case_scenarios
  FOR UPDATE TO authenticated USING (public.is_admin_user(auth.uid()));

-- training_progress: public insert, admins read; updates go via server fn (admin only direct)
CREATE POLICY "public insert training_progress" ON public.training_progress
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public update training_progress" ON public.training_progress
  FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "admins read training_progress" ON public.training_progress
  FOR SELECT TO authenticated USING (public.is_admin_user(auth.uid()));

-- training_certificates: public insert (via server fn), public verify by code via security definer, admins read/update
CREATE POLICY "public insert training_certificates" ON public.training_certificates
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins read training_certificates" ON public.training_certificates
  FOR SELECT TO authenticated USING (public.is_admin_user(auth.uid()));
CREATE POLICY "admins update training_certificates" ON public.training_certificates
  FOR UPDATE TO authenticated USING (public.is_admin_user(auth.uid()));

CREATE INDEX idx_training_questions_module ON public.training_questions(module_id);
CREATE INDEX idx_training_cases_module ON public.training_case_scenarios(module_id);
CREATE INDEX idx_training_progress_user ON public.training_progress(training_user_id);
CREATE INDEX idx_training_certificates_code ON public.training_certificates(certificate_code);
CREATE INDEX idx_training_certificates_hash ON public.training_certificates(verification_hash);

-- Public verification function (safe fields only)
CREATE OR REPLACE FUNCTION public.verify_training_certificate(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE c record;
BEGIN
  SELECT certificate_code, full_name, overall_score, issued_at, is_valid
  INTO c FROM public.training_certificates
  WHERE certificate_code = p_code OR verification_hash = p_code
  LIMIT 1;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('found', false);
  END IF;
  RETURN jsonb_build_object(
    'found', true,
    'is_valid', c.is_valid,
    'full_name', c.full_name,
    'certificate_code', c.certificate_code,
    'overall_score', c.overall_score,
    'issued_at', c.issued_at,
    'title_en', 'Certificate of Training Completion',
    'title_ar', 'شهادة إتمام تدريب'
  );
END;
$$;

-- Admin analytics
CREATE OR REPLACE FUNCTION public.get_admin_training_analytics()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE result jsonb;
BEGIN
  IF NOT public.is_admin_user(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  SELECT jsonb_build_object(
    'generated_at', now(),
    'total_registrations', (SELECT count(*) FROM public.training_users),
    'active_trainees', (SELECT count(DISTINCT training_user_id) FROM public.training_progress WHERE completed = false),
    'completed_trainees', (SELECT count(DISTINCT training_user_id) FROM public.training_certificates),
    'certificates_issued', (SELECT count(*) FROM public.training_certificates WHERE is_valid = true),
    'average_score', COALESCE((SELECT round(avg(overall_score)::numeric, 1) FROM public.training_certificates), 0),
    'completion_by_module', COALESCE((
      SELECT jsonb_object_agg(m.slug, c)
      FROM (SELECT module_id, count(*) FILTER (WHERE completed = true) AS c FROM public.training_progress GROUP BY module_id) tp
      JOIN public.training_modules m ON m.id = tp.module_id
    ), '{}'::jsonb),
    'avg_score_by_module', COALESCE((
      SELECT jsonb_object_agg(m.slug, avg_score)
      FROM (SELECT module_id, round(avg(score)::numeric, 1) AS avg_score FROM public.training_progress WHERE score IS NOT NULL GROUP BY module_id) tp
      JOIN public.training_modules m ON m.id = tp.module_id
    ), '{}'::jsonb),
    'city_distribution', COALESCE((
      SELECT jsonb_object_agg(city, c)
      FROM (SELECT lower(trim(city)) AS city, count(*) AS c FROM public.training_users WHERE city IS NOT NULL AND trim(city)<>'' GROUP BY 1 ORDER BY c DESC LIMIT 20) t
    ), '{}'::jsonb),
    'role_distribution', COALESCE((
      SELECT jsonb_object_agg(coalesce(role,'unknown'), c)
      FROM (SELECT role, count(*) AS c FROM public.training_users GROUP BY 1) t
    ), '{}'::jsonb)
  ) INTO result;
  RETURN result;
END;
$$;
