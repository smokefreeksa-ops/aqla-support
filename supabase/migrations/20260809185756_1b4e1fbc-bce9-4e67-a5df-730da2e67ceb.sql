ALTER TABLE public.quit_plans
  ADD COLUMN IF NOT EXISTS country_code text,
  ADD COLUMN IF NOT EXISTS jurisdiction text NOT NULL DEFAULT 'GENERIC',
  ADD COLUMN IF NOT EXISTS plan_variant text,
  ADD COLUMN IF NOT EXISTS dependence_status text,
  ADD COLUMN IF NOT EXISTS quit_strategy text,
  ADD COLUMN IF NOT EXISTS safety_gate_level text NOT NULL DEFAULT 'self_management',
  ADD COLUMN IF NOT EXISTS safety_flags jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS plan_version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS clinical_rule_version text,
  ADD COLUMN IF NOT EXISTS generated_at timestamptz,
  ADD COLUMN IF NOT EXISTS email_status text NOT NULL DEFAULT 'not_requested',
  ADD COLUMN IF NOT EXISTS plan_email_consent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS plan_email_consent_at timestamptz,
  ADD COLUMN IF NOT EXISTS plan_email_consent_version text;

CREATE INDEX IF NOT EXISTS quit_plans_jurisdiction_idx ON public.quit_plans (jurisdiction);
CREATE INDEX IF NOT EXISTS quit_plans_safety_gate_level_idx ON public.quit_plans (safety_gate_level);