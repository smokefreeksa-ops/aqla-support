
-- notification_settings
CREATE TABLE public.notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_type TEXT NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT true,
  recipient_email TEXT NOT NULL DEFAULT 'smokefreeksa@gmail.com',
  send_full_data BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "physician_read_settings" ON public.notification_settings
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'physician'));

CREATE POLICY "physician_update_settings" ON public.notification_settings
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'physician'));

CREATE TRIGGER notification_settings_updated_at
  BEFORE UPDATE ON public.notification_settings
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

INSERT INTO public.notification_settings (notification_type, enabled, recipient_email) VALUES
  ('full_quit_support_submission', true,  'smokefreeksa@gmail.com'),
  ('full_volunteer_application',   true,  'smokefreeksa@gmail.com'),
  ('follow_up_visit',              true,  'smokefreeksa@gmail.com'),
  ('csv_export_alert',             true,  'smokefreeksa@gmail.com'),
  ('staff_signup',                 true,  'smokefreeksa@gmail.com'),
  ('staff_login',                  false, 'smokefreeksa@gmail.com');

-- notification_log
CREATE TABLE public.notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  participant_code TEXT,
  volunteer_code TEXT,
  staff_email TEXT,
  export_type TEXT,
  subject TEXT,
  sent_status TEXT NOT NULL,
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX notification_log_event_idx ON public.notification_log (event_type, created_at DESC);
CREATE INDEX notification_log_status_idx ON public.notification_log (sent_status, created_at DESC);

ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "physician_read_log" ON public.notification_log
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'physician'));
