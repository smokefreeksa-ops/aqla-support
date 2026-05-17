
-- Enums
CREATE TYPE public.volunteer_status AS ENUM (
  'new_applicant','awaiting_review','accepted_for_training','in_training',
  'active_volunteer','needs_follow_up','not_accepted'
);

CREATE TYPE public.volunteer_interest AS ENUM (
  'awareness_campaigns','smoker_support','data_entry','follow_up_coordination',
  'content_creation','events'
);

CREATE TYPE public.smoking_status AS ENUM ('smoker','former_smoker','non_smoker');

-- Main table
CREATE TABLE public.volunteer_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_code text NOT NULL DEFAULT ('VOL-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))),
  full_name text NOT NULL,
  mobile text NOT NULL,
  email text,
  age integer,
  gender text,
  city text,
  affiliation text,
  academic_level text,
  preferred_language preferred_language NOT NULL DEFAULT 'ar',
  preferred_contact contact_method NOT NULL DEFAULT 'whatsapp',
  motivation text,
  prior_awareness_work boolean,
  smoking_status smoking_status,
  availability text,
  status volunteer_status NOT NULL DEFAULT 'new_applicant',
  contacted boolean NOT NULL DEFAULT false,
  contact_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.volunteer_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.volunteer_applications(id) ON DELETE CASCADE,
  interest volunteer_interest NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (application_id, interest)
);

CREATE TABLE public.volunteer_screening (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL UNIQUE REFERENCES public.volunteer_applications(id) ON DELETE CASCADE,
  agree_professional_boundaries boolean NOT NULL,
  understand_no_medical_advice boolean NOT NULL,
  agree_clinical_referral boolean NOT NULL,
  agree_complete_training boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.volunteer_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.volunteer_applications(id) ON DELETE CASCADE,
  note text NOT NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.volunteer_training_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.volunteer_applications(id) ON DELETE CASCADE,
  training_name text NOT NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  notes text,
  created_by uuid
);

CREATE TABLE public.volunteer_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.volunteer_applications(id) ON DELETE CASCADE,
  status volunteer_status NOT NULL,
  changed_by uuid,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- updated_at trigger
CREATE TRIGGER tg_volunteer_applications_updated_at
BEFORE UPDATE ON public.volunteer_applications
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- RLS
ALTER TABLE public.volunteer_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_screening ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_training_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_status_history ENABLE ROW LEVEL SECURITY;

-- Public insert for application submission
CREATE POLICY "public submit volunteer app" ON public.volunteer_applications
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public submit volunteer interests" ON public.volunteer_interests
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public submit volunteer screening" ON public.volunteer_screening
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Staff (any role) read
CREATE POLICY "staff read volunteer apps" ON public.volunteer_applications
  FOR SELECT TO authenticated USING (public.is_admin_user(auth.uid()));
CREATE POLICY "staff update volunteer apps" ON public.volunteer_applications
  FOR UPDATE TO authenticated USING (public.is_admin_user(auth.uid()));

CREATE POLICY "staff read volunteer interests" ON public.volunteer_interests
  FOR SELECT TO authenticated USING (public.is_admin_user(auth.uid()));
CREATE POLICY "staff read volunteer screening" ON public.volunteer_screening
  FOR SELECT TO authenticated USING (public.is_admin_user(auth.uid()));

CREATE POLICY "staff read volunteer notes" ON public.volunteer_notes
  FOR SELECT TO authenticated USING (public.is_admin_user(auth.uid()));
CREATE POLICY "staff write volunteer notes" ON public.volunteer_notes
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "staff read training" ON public.volunteer_training_records
  FOR SELECT TO authenticated USING (public.is_admin_user(auth.uid()));
CREATE POLICY "staff write training" ON public.volunteer_training_records
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_user(auth.uid()));
CREATE POLICY "staff update training" ON public.volunteer_training_records
  FOR UPDATE TO authenticated USING (public.is_admin_user(auth.uid()));

CREATE POLICY "staff read status history" ON public.volunteer_status_history
  FOR SELECT TO authenticated USING (public.is_admin_user(auth.uid()));
CREATE POLICY "staff write status history" ON public.volunteer_status_history
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_user(auth.uid()));

CREATE INDEX idx_vol_app_status ON public.volunteer_applications(status);
CREATE INDEX idx_vol_app_created ON public.volunteer_applications(created_at DESC);
CREATE INDEX idx_vol_interests_app ON public.volunteer_interests(application_id);
