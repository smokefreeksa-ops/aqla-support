
CREATE OR REPLACE FUNCTION public.is_admin_user(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'admin'::app_role
  );
$$;

DROP POLICY IF EXISTS quit_plans_read_by_token ON public.quit_plans;

DROP POLICY IF EXISTS "public update training_progress" ON public.training_progress;
DROP POLICY IF EXISTS "public insert training_progress" ON public.training_progress;
CREATE POLICY "admins update training_progress"
  ON public.training_progress FOR UPDATE
  TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));
CREATE POLICY "admins insert training_progress"
  ON public.training_progress FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS physician_read_settings ON public.notification_settings;
DROP POLICY IF EXISTS physician_update_settings ON public.notification_settings;
CREATE POLICY "admins read notification_settings"
  ON public.notification_settings FOR SELECT
  TO authenticated
  USING (public.is_admin_user(auth.uid()));
CREATE POLICY "admins update notification_settings"
  ON public.notification_settings FOR UPDATE
  TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
