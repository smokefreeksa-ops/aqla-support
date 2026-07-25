
ALTER TABLE public.academy_certificates
  ADD COLUMN IF NOT EXISTS assessment_version text NOT NULL DEFAULT 'v1',
  ADD COLUMN IF NOT EXISTS safety_critical_passed boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS scope_accepted boolean NOT NULL DEFAULT true;

ALTER TABLE public.training_certificates
  ADD COLUMN IF NOT EXISTS assessment_version text NOT NULL DEFAULT 'v1',
  ADD COLUMN IF NOT EXISTS safety_critical_passed boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS scope_accepted boolean NOT NULL DEFAULT true;

-- Mark historical rows as v1 explicitly (no-op if none exist).
UPDATE public.academy_certificates SET assessment_version = 'v1' WHERE assessment_version IS NULL;
UPDATE public.training_certificates SET assessment_version = 'v1' WHERE assessment_version IS NULL;
