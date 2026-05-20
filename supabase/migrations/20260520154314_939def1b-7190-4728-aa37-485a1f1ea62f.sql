
-- ============================================================
-- Academy curriculum (public-readable)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.academy_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title_en text NOT NULL,
  title_ar text NOT NULL,
  summary_en text,
  summary_ar text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.academy_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid NOT NULL REFERENCES public.academy_tracks(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  title_en text NOT NULL,
  title_ar text NOT NULL,
  summary_en text,
  summary_ar text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  requires_assessment boolean NOT NULL DEFAULT false,
  pass_threshold int NOT NULL DEFAULT 70,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_academy_modules_track ON public.academy_modules(track_id);

CREATE TABLE IF NOT EXISTS public.academy_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.academy_modules(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title_en text NOT NULL,
  title_ar text NOT NULL,
  body_en text,
  body_ar text,
  lesson_type text NOT NULL DEFAULT 'reading' CHECK (lesson_type IN ('reading','video','scenario','reflection')),
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (module_id, slug)
);
CREATE INDEX IF NOT EXISTS idx_academy_lessons_module ON public.academy_lessons(module_id);

-- ============================================================
-- Sensitive content (server-only, never client-readable)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.academy_sensitive_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.academy_modules(id) ON DELETE CASCADE,
  question_key text NOT NULL,
  prompt_en text NOT NULL,
  prompt_ar text NOT NULL,
  scale text NOT NULL DEFAULT 'likert5',
  reverse_scored boolean NOT NULL DEFAULT false,
  weight numeric NOT NULL DEFAULT 1.0,
  correct_value jsonb,
  scoring_meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (module_id, question_key)
);
CREATE INDEX IF NOT EXISTS idx_sensitive_questions_module ON public.academy_sensitive_questions(module_id);

CREATE TABLE IF NOT EXISTS public.academy_sensitive_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.academy_modules(id) ON DELETE CASCADE,
  scenario_key text NOT NULL,
  prompt_en text NOT NULL,
  prompt_ar text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_option_key text,
  rationale_en text,
  rationale_ar text,
  weight numeric NOT NULL DEFAULT 1.0,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (module_id, scenario_key)
);
CREATE INDEX IF NOT EXISTS idx_sensitive_scenarios_module ON public.academy_sensitive_scenarios(module_id);

-- ============================================================
-- Attempts (server-scored, write-only from clients)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.academy_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.academy_modules(id) ON DELETE CASCADE,
  anonymous_session_id text,
  user_id uuid,
  raw_answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  score numeric,
  passed boolean,
  duration_seconds int,
  language text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_academy_attempts_module ON public.academy_attempts(module_id);
CREATE INDEX IF NOT EXISTS idx_academy_attempts_session ON public.academy_attempts(anonymous_session_id);

-- ============================================================
-- Certificates
-- ============================================================

CREATE TABLE IF NOT EXISTS public.academy_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid REFERENCES public.academy_attempts(id) ON DELETE SET NULL,
  certificate_code text NOT NULL UNIQUE,
  verification_hash text NOT NULL UNIQUE,
  full_name text NOT NULL,
  module_slug text NOT NULL,
  track_slug text,
  overall_score numeric NOT NULL,
  is_valid boolean NOT NULL DEFAULT true,
  issued_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  revoke_reason text
);
CREATE INDEX IF NOT EXISTS idx_academy_certs_module ON public.academy_certificates(module_slug);

-- ============================================================
-- updated_at triggers
-- ============================================================

DROP TRIGGER IF EXISTS trg_academy_tracks_updated ON public.academy_tracks;
CREATE TRIGGER trg_academy_tracks_updated BEFORE UPDATE ON public.academy_tracks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_academy_modules_updated ON public.academy_modules;
CREATE TRIGGER trg_academy_modules_updated BEFORE UPDATE ON public.academy_modules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_academy_lessons_updated ON public.academy_lessons;
CREATE TRIGGER trg_academy_lessons_updated BEFORE UPDATE ON public.academy_lessons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_sensitive_questions_updated ON public.academy_sensitive_questions;
CREATE TRIGGER trg_sensitive_questions_updated BEFORE UPDATE ON public.academy_sensitive_questions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_sensitive_scenarios_updated ON public.academy_sensitive_scenarios;
CREATE TRIGGER trg_sensitive_scenarios_updated BEFORE UPDATE ON public.academy_sensitive_scenarios
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE public.academy_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_sensitive_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_sensitive_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_certificates ENABLE ROW LEVEL SECURITY;

-- Public curriculum: anyone can read active rows
CREATE POLICY "Public read active tracks" ON public.academy_tracks
  FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "Public read active modules" ON public.academy_modules
  FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "Public read active lessons" ON public.academy_lessons
  FOR SELECT TO anon, authenticated USING (is_active = true);

-- Admins can read/manage everything
CREATE POLICY "Admins manage tracks" ON public.academy_tracks
  FOR ALL TO authenticated USING (public.is_admin_user(auth.uid())) WITH CHECK (public.is_admin_user(auth.uid()));
CREATE POLICY "Admins manage modules" ON public.academy_modules
  FOR ALL TO authenticated USING (public.is_admin_user(auth.uid())) WITH CHECK (public.is_admin_user(auth.uid()));
CREATE POLICY "Admins manage lessons" ON public.academy_lessons
  FOR ALL TO authenticated USING (public.is_admin_user(auth.uid())) WITH CHECK (public.is_admin_user(auth.uid()));

-- Sensitive content: ONLY admins (service role bypasses RLS automatically)
CREATE POLICY "Admins manage sensitive questions" ON public.academy_sensitive_questions
  FOR ALL TO authenticated USING (public.is_admin_user(auth.uid())) WITH CHECK (public.is_admin_user(auth.uid()));
CREATE POLICY "Admins manage sensitive scenarios" ON public.academy_sensitive_scenarios
  FOR ALL TO authenticated USING (public.is_admin_user(auth.uid())) WITH CHECK (public.is_admin_user(auth.uid()));

-- Attempts: insert from anyone (anonymous OK), but no client read
CREATE POLICY "Anyone can insert attempt" ON public.academy_attempts
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read attempts" ON public.academy_attempts
  FOR SELECT TO authenticated USING (public.is_admin_user(auth.uid()));

-- Certificates: no direct client read (use verify function); admins manage
CREATE POLICY "Admins manage certificates" ON public.academy_certificates
  FOR ALL TO authenticated USING (public.is_admin_user(auth.uid())) WITH CHECK (public.is_admin_user(auth.uid()));

-- ============================================================
-- Public verification function for academy certificates
-- ============================================================

CREATE OR REPLACE FUNCTION public.verify_academy_certificate(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE c record;
BEGIN
  SELECT certificate_code, full_name, module_slug, track_slug, overall_score, issued_at, is_valid
  INTO c FROM public.academy_certificates
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
    'module_slug', c.module_slug,
    'track_slug', c.track_slug,
    'overall_score', c.overall_score,
    'issued_at', c.issued_at,
    'title_en', 'Aqla Academy Certificate',
    'title_ar', 'شهادة أكاديمية أقلع'
  );
END;
$$;
