ALTER TABLE public.quit_plans
 ADD COLUMN full_name text,
 ADD COLUMN mobile text,
 ADD COLUMN age_band_captured text,
 ADD COLUMN is_minor boolean NOT NULL DEFAULT false,
 ADD COLUMN guardian_name text,
 ADD COLUMN guardian_relationship text,
 ADD COLUMN guardian_email text,
 ADD COLUMN guardian_mobile text,
 ADD COLUMN contact_consent boolean NOT NULL DEFAULT false,
 ADD COLUMN contact_consent_at timestamptz,
 ADD COLUMN contact_consent_version text,
 ADD COLUMN guardian_consent boolean NOT NULL DEFAULT false,
 ADD COLUMN guardian_consent_at timestamptz,
 ADD COLUMN retention_until date;
CREATE INDEX idx_quit_plans_email ON public.quit_plans (lower(email));
CREATE FUNCTION public.set_quit_plan_retention() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
 NEW.retention_until := (NEW.created_at + interval '10 years')::date;
 RETURN NEW;
END;
$$;
CREATE TRIGGER quit_plan_retention_before_insert BEFORE INSERT ON public.quit_plans FOR EACH ROW EXECUTE FUNCTION public.set_quit_plan_retention();
GRANT INSERT ON public.quit_plans TO anon, authenticated;
GRANT SELECT ON public.quit_plans TO authenticated;
GRANT ALL ON public.quit_plans TO service_role;
REVOKE SELECT ON public.quit_plans FROM anon, PUBLIC;
ALTER TABLE public.quit_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS admins_read_all_quit_plans ON public.quit_plans;
DROP POLICY IF EXISTS quit_plans_owner_read ON public.quit_plans;
DROP POLICY IF EXISTS users_read_own_quit_plans ON public.quit_plans;
CREATE POLICY quit_plans_admin_read ON public.quit_plans FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY quit_plans_public_insert ON public.quit_plans FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE VIEW public.v_quit_chat_contacts WITH (security_invoker = true) AS
 SELECT created_at, nickname, email, mobile, city, age_band_captured, is_minor, guardian_name, guardian_email, guardian_mobile, score_band, risk_flag, status, retention_until
 FROM public.quit_plans WHERE public.has_role(auth.uid(), 'admin');
REVOKE ALL ON public.v_quit_chat_contacts FROM PUBLIC, anon;
GRANT SELECT ON public.v_quit_chat_contacts TO authenticated, service_role;
COMMENT ON VIEW public.v_quit_chat_contacts IS 'Admin-only participant contacts; security invoker preserves quit_plans RLS.';