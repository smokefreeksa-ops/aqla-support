-- 1. Organisations (tenants)
CREATE TABLE IF NOT EXISTS public.organisations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  logo_url text,
  primary_color text NOT NULL DEFAULT '#0A1A0E',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.organisations TO anon;
GRANT SELECT ON public.organisations TO authenticated;
GRANT ALL ON public.organisations TO service_role;
ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "organisations_public_read" ON public.organisations FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "organisations_admin_manage" ON public.organisations FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.organisations (slug, name_ar, name_en, primary_color)
VALUES ('aqla', 'أكاديمية أقلع', 'Aqla Academy', '#0A1A0E')
ON CONFLICT (slug) DO NOTHING;

-- 2. Learner profiles
CREATE TABLE IF NOT EXISTS public.learner_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  full_name text,
  email text,
  city text,
  preferred_language text NOT NULL DEFAULT 'ar',
  org_slug text NOT NULL DEFAULT 'aqla',
  program_slug text NOT NULL DEFAULT 'academy',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.learner_profiles TO authenticated;
GRANT ALL ON public.learner_profiles TO service_role;
ALTER TABLE public.learner_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "learner_profiles_own_read" ON public.learner_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "learner_profiles_own_insert" ON public.learner_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "learner_profiles_own_update" ON public.learner_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3. Live sessions
CREATE TABLE IF NOT EXISTS public.live_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_slug text NOT NULL DEFAULT 'aqla',
  program_slug text NOT NULL DEFAULT 'academy',
  title_ar text NOT NULL,
  title_en text,
  description_ar text,
  description_en text,
  session_type text NOT NULL DEFAULT 'webinar',
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  join_url text,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.live_sessions TO anon;
GRANT SELECT ON public.live_sessions TO authenticated;
GRANT ALL ON public.live_sessions TO service_role;
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "live_sessions_public_read" ON public.live_sessions FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "live_sessions_admin_manage" ON public.live_sessions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Attach certificates permanently to learner accounts + tenancy columns
ALTER TABLE public.academy_certificates
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS certificate_type text NOT NULL DEFAULT 'module_completion',
  ADD COLUMN IF NOT EXISTS org_slug text NOT NULL DEFAULT 'aqla',
  ADD COLUMN IF NOT EXISTS program_slug text NOT NULL DEFAULT 'academy';
CREATE INDEX IF NOT EXISTS idx_academy_certificates_user ON public.academy_certificates(user_id);

ALTER TABLE public.academy_progress
  ADD COLUMN IF NOT EXISTS org_slug text NOT NULL DEFAULT 'aqla',
  ADD COLUMN IF NOT EXISTS program_slug text NOT NULL DEFAULT 'academy';
CREATE INDEX IF NOT EXISTS idx_academy_progress_user ON public.academy_progress(user_id);

ALTER TABLE public.academy_attempts
  ADD COLUMN IF NOT EXISTS org_slug text NOT NULL DEFAULT 'aqla',
  ADD COLUMN IF NOT EXISTS program_slug text NOT NULL DEFAULT 'academy';
CREATE INDEX IF NOT EXISTS idx_academy_attempts_user ON public.academy_attempts(user_id);

ALTER TABLE public.academy_exam_attempts
  ADD COLUMN IF NOT EXISTS org_slug text NOT NULL DEFAULT 'aqla',
  ADD COLUMN IF NOT EXISTS program_slug text NOT NULL DEFAULT 'academy';
CREATE INDEX IF NOT EXISTS idx_academy_exam_attempts_user ON public.academy_exam_attempts(user_id);