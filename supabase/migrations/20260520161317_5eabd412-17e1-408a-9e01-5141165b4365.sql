-- ============================================================
-- Migration 0003: Quit-center workflow tables (anonymous-first)
-- Safe to re-run: uses IF NOT EXISTS / IF NOT EXISTS policies.
-- ============================================================

-- 1) center_sessions ---------------------------------------------------
CREATE TABLE IF NOT EXISTS public.center_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_session_id TEXT NOT NULL,
  user_id UUID NULL,
  center_type TEXT NOT NULL CHECK (center_type IN (
    'quit_pathway','help_pathway','learn_train','challenge_pathway','general'
  )),
  workflow_state TEXT NOT NULL DEFAULT 'quit_not_started',
  language TEXT NOT NULL DEFAULT 'ar',
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS center_sessions_session_idx
  ON public.center_sessions(anonymous_session_id, center_type);
CREATE INDEX IF NOT EXISTS center_sessions_user_idx
  ON public.center_sessions(user_id) WHERE user_id IS NOT NULL;

-- 2) quit_center_intakes ----------------------------------------------
CREATE TABLE IF NOT EXISTS public.quit_center_intakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.center_sessions(id) ON DELETE CASCADE,
  anonymous_session_id TEXT NOT NULL,
  user_id UUID NULL,
  consent_status TEXT NULL CHECK (consent_status IN ('full','limited','learn','declined') OR consent_status IS NULL),
  nickname TEXT NULL,
  age_group TEXT NULL,
  city TEXT NULL,
  language TEXT NULL,
  contact_method TEXT NULL,
  contact_value TEXT NULL,
  anonymous BOOLEAN NOT NULL DEFAULT true,
  product TEXT NULL CHECK (product IN ('cigarettes','vape','pouches','shisha','multiple','unsure') OR product IS NULL),
  red_flags JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS quit_center_intakes_session_idx
  ON public.quit_center_intakes(anonymous_session_id);

-- 3) quit_assessments --------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quit_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.center_sessions(id) ON DELETE CASCADE,
  anonymous_session_id TEXT NOT NULL,
  user_id UUID NULL,
  instrument TEXT NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  score NUMERIC NULL,
  band TEXT NULL,
  validated BOOLEAN NOT NULL DEFAULT false,
  risk_flag BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS quit_assessments_session_idx
  ON public.quit_assessments(anonymous_session_id);

-- 4) quit_plans --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quit_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.center_sessions(id) ON DELETE CASCADE,
  anonymous_session_id TEXT NOT NULL,
  user_id UUID NULL,
  quit_goal TEXT NULL,
  quit_date DATE NULL,
  triggers JSONB NOT NULL DEFAULT '[]'::jsonb,
  plan JSONB NOT NULL DEFAULT '{}'::jsonb,
  followup_schedule JSONB NOT NULL DEFAULT '[]'::jsonb,
  money_setup JSONB NOT NULL DEFAULT '{}'::jsonb,
  support_person JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS quit_plans_session_idx
  ON public.quit_plans(anonymous_session_id);

-- 5) quit_followups ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quit_followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.center_sessions(id) ON DELETE CASCADE,
  plan_id UUID NULL REFERENCES public.quit_plans(id) ON DELETE SET NULL,
  anonymous_session_id TEXT NOT NULL,
  user_id UUID NULL,
  day_marker TEXT NULL,
  used_today BOOLEAN NULL,
  craving_level SMALLINT NULL CHECK (craving_level IS NULL OR (craving_level BETWEEN 0 AND 10)),
  trigger TEXT NULL,
  what_helped TEXT NULL,
  needs_support BOOLEAN NULL,
  is_relapse BOOLEAN NOT NULL DEFAULT false,
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS quit_followups_session_idx
  ON public.quit_followups(anonymous_session_id);

-- 6) quit_referrals ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quit_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.center_sessions(id) ON DELETE CASCADE,
  anonymous_session_id TEXT NOT NULL,
  user_id UUID NULL,
  referral_type TEXT NOT NULL,
  reason TEXT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS quit_referrals_session_idx
  ON public.quit_referrals(anonymous_session_id);

-- 7) craving_events ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.craving_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NULL REFERENCES public.center_sessions(id) ON DELETE CASCADE,
  anonymous_session_id TEXT NOT NULL,
  user_id UUID NULL,
  craving_level SMALLINT NULL CHECK (craving_level IS NULL OR (craving_level BETWEEN 0 AND 10)),
  trigger TEXT NULL,
  what_helped TEXT NULL,
  time_of_day TEXT NULL,
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS craving_events_session_idx
  ON public.craving_events(anonymous_session_id);

-- ============================================================
-- updated_at triggers (reuse existing public.set_updated_at)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'center_sessions_set_updated_at') THEN
    CREATE TRIGGER center_sessions_set_updated_at BEFORE UPDATE ON public.center_sessions
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'quit_center_intakes_set_updated_at') THEN
    CREATE TRIGGER quit_center_intakes_set_updated_at BEFORE UPDATE ON public.quit_center_intakes
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'quit_plans_set_updated_at') THEN
    CREATE TRIGGER quit_plans_set_updated_at BEFORE UPDATE ON public.quit_plans
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'quit_referrals_set_updated_at') THEN
    CREATE TRIGGER quit_referrals_set_updated_at BEFORE UPDATE ON public.quit_referrals
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END$$;

-- ============================================================
-- RLS — enable on all 7 tables
-- ============================================================
ALTER TABLE public.center_sessions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quit_center_intakes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quit_assessments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quit_plans           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quit_followups       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quit_referrals       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.craving_events       ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Policies. Anonymous-first: server fn enforces session match.
-- Tables are written from the server (service role bypasses RLS),
-- but we still allow the owning user to read their rows via RLS.
-- No anon read policy = the tables are not readable from the
-- browser unless going through a server function.
-- ============================================================

-- center_sessions
DROP POLICY IF EXISTS "center_sessions_owner_read" ON public.center_sessions;
CREATE POLICY "center_sessions_owner_read" ON public.center_sessions
  FOR SELECT TO authenticated
  USING (user_id IS NOT NULL AND user_id = auth.uid());

-- quit_center_intakes
DROP POLICY IF EXISTS "quit_center_intakes_owner_read" ON public.quit_center_intakes;
CREATE POLICY "quit_center_intakes_owner_read" ON public.quit_center_intakes
  FOR SELECT TO authenticated
  USING (user_id IS NOT NULL AND user_id = auth.uid());

-- quit_assessments
DROP POLICY IF EXISTS "quit_assessments_owner_read" ON public.quit_assessments;
CREATE POLICY "quit_assessments_owner_read" ON public.quit_assessments
  FOR SELECT TO authenticated
  USING (user_id IS NOT NULL AND user_id = auth.uid());

-- quit_plans
DROP POLICY IF EXISTS "quit_plans_owner_read" ON public.quit_plans;
CREATE POLICY "quit_plans_owner_read" ON public.quit_plans
  FOR SELECT TO authenticated
  USING (user_id IS NOT NULL AND user_id = auth.uid());

-- quit_followups
DROP POLICY IF EXISTS "quit_followups_owner_read" ON public.quit_followups;
CREATE POLICY "quit_followups_owner_read" ON public.quit_followups
  FOR SELECT TO authenticated
  USING (user_id IS NOT NULL AND user_id = auth.uid());

-- quit_referrals
DROP POLICY IF EXISTS "quit_referrals_owner_read" ON public.quit_referrals;
CREATE POLICY "quit_referrals_owner_read" ON public.quit_referrals
  FOR SELECT TO authenticated
  USING (user_id IS NOT NULL AND user_id = auth.uid());

-- craving_events
DROP POLICY IF EXISTS "craving_events_owner_read" ON public.craving_events;
CREATE POLICY "craving_events_owner_read" ON public.craving_events
  FOR SELECT TO authenticated
  USING (user_id IS NOT NULL AND user_id = auth.uid());
