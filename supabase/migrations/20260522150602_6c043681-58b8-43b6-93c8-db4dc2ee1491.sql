
ALTER TABLE public.quit_plans
  ADD COLUMN IF NOT EXISTS nickname text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS product text,
  ADD COLUMN IF NOT EXISTS assessment_tool text,
  ADD COLUMN IF NOT EXISTS score_total integer,
  ADD COLUMN IF NOT EXISTS score_band text,
  ADD COLUMN IF NOT EXISTS risk_flag boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS validated boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS readiness text,
  ADD COLUMN IF NOT EXISTS intake_answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS plan_token text,
  ADD COLUMN IF NOT EXISTS pdf_url text,
  ADD COLUMN IF NOT EXISTS email_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS admin_notified_at timestamptz,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'in_progress';

CREATE UNIQUE INDEX IF NOT EXISTS quit_plans_plan_token_idx ON public.quit_plans(plan_token) WHERE plan_token IS NOT NULL;

-- Allow public read of a plan via its unguessable plan_token (used by the share/view page).
DROP POLICY IF EXISTS "quit_plans_read_by_token" ON public.quit_plans;
CREATE POLICY "quit_plans_read_by_token"
  ON public.quit_plans FOR SELECT
  USING (plan_token IS NOT NULL);
