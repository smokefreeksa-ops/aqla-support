CREATE TABLE public.quit_plan_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quit_plan_id uuid NOT NULL REFERENCES public.quit_plans(id) ON DELETE CASCADE,
  plan_version integer NOT NULL,
  plan_json jsonb NOT NULL,
  clinical_rule_version text NOT NULL,
  jurisdiction text,
  plan_variant text,
  plan_hash text,
  generated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (quit_plan_id, plan_version)
);

GRANT ALL ON public.quit_plan_versions TO service_role;

ALTER TABLE public.quit_plan_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read plan versions"
ON public.quit_plan_versions FOR SELECT TO authenticated
USING (public.is_admin_user(auth.uid()));

CREATE OR REPLACE FUNCTION public.block_quit_plan_version_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'quit_plan_versions rows are immutable';
END;
$$;

CREATE TRIGGER quit_plan_versions_immutable
BEFORE UPDATE OR DELETE ON public.quit_plan_versions
FOR EACH ROW EXECUTE FUNCTION public.block_quit_plan_version_mutation();

CREATE INDEX idx_quit_plan_versions_plan ON public.quit_plan_versions(quit_plan_id, plan_version DESC);