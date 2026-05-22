-- ============================================================
-- Aqla Core: Quit Plan tables
-- ============================================================

CREATE TABLE IF NOT EXISTS public.quit_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  anonymous_session_id text,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  city text,
  age_group text,
  product_type text NOT NULL,
  assessment_tool text NOT NULL,
  assessment_score numeric,
  assessment_band text,
  validated boolean NOT NULL DEFAULT true,
  risk_flag boolean NOT NULL DEFAULT false,
  readiness text,
  goal text,
  quit_date date,
  triggers jsonb NOT NULL DEFAULT '[]'::jsonb,
  intake_answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  plan_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  pdf_url text,
  email_sent boolean NOT NULL DEFAULT false,
  admin_notified boolean NOT NULL DEFAULT false,
  follow_up_preference text,
  consent_reminders boolean NOT NULL DEFAULT false,
  support_person_name text,
  support_person_contact text,
  language text NOT NULL DEFAULT 'ar',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quit_plans_user_id ON public.quit_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_quit_plans_session ON public.quit_plans(anonymous_session_id);
CREATE INDEX IF NOT EXISTS idx_quit_plans_created_at ON public.quit_plans(created_at DESC);

ALTER TABLE public.quit_plans ENABLE ROW LEVEL SECURITY;

-- Users can read their own plans (by user_id when logged in)
CREATE POLICY "users_read_own_quit_plans"
  ON public.quit_plans FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Admins can read everything
CREATE POLICY "admins_read_all_quit_plans"
  ON public.quit_plans FOR SELECT
  USING (public.is_admin_user(auth.uid()));

-- Insert is server-only (via service role); deny direct client inserts
-- (no INSERT policy = denied for authenticated/anon)

CREATE TRIGGER trg_quit_plans_updated_at
  BEFORE UPDATE ON public.quit_plans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
CREATE TABLE IF NOT EXISTS public.quit_plan_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quit_plan_id uuid NOT NULL REFERENCES public.quit_plans(id) ON DELETE CASCADE,
  reminder_type text NOT NULL,
  scheduled_at timestamptz NOT NULL,
  channel text NOT NULL DEFAULT 'email',
  status text NOT NULL DEFAULT 'pending',
  sent_at timestamptz,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reminders_pending
  ON public.quit_plan_reminders(scheduled_at)
  WHERE status = 'pending';

ALTER TABLE public.quit_plan_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_read_reminders"
  ON public.quit_plan_reminders FOR SELECT
  USING (public.is_admin_user(auth.uid()));

-- ============================================================
CREATE TABLE IF NOT EXISTS public.quit_plan_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quit_plan_id uuid NOT NULL REFERENCES public.quit_plans(id) ON DELETE CASCADE,
  recipient_type text NOT NULL CHECK (recipient_type IN ('user','admin')),
  email text NOT NULL,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quit_plan_emails_plan ON public.quit_plan_emails(quit_plan_id);

ALTER TABLE public.quit_plan_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_read_emails_log"
  ON public.quit_plan_emails FOR SELECT
  USING (public.is_admin_user(auth.uid()));

-- ============================================================
-- Academy: exam attempts + certificate issuance support
-- (academy_certificates already exists per verify_academy_certificate fn)
-- Add progress + exam tables if missing.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.academy_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_session_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  domain_slug text NOT NULL,
  lesson_slug text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  practice_score numeric,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (anonymous_session_id, domain_slug, lesson_slug)
);

CREATE INDEX IF NOT EXISTS idx_academy_progress_session
  ON public.academy_progress(anonymous_session_id);

ALTER TABLE public.academy_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_read_progress"
  ON public.academy_progress FOR SELECT
  USING (public.is_admin_user(auth.uid()));

CREATE TRIGGER trg_academy_progress_updated_at
  BEFORE UPDATE ON public.academy_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
CREATE TABLE IF NOT EXISTS public.academy_exam_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_session_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text,
  email text,
  raw_answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  score numeric,
  passed boolean,
  certificate_id uuid,
  duration_seconds integer,
  language text NOT NULL DEFAULT 'ar',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exam_attempts_session
  ON public.academy_exam_attempts(anonymous_session_id);

ALTER TABLE public.academy_exam_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_read_exam_attempts"
  ON public.academy_exam_attempts FOR SELECT
  USING (public.is_admin_user(auth.uid()));
