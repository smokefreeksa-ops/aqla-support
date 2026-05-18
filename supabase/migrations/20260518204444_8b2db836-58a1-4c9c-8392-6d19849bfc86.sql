
CREATE OR REPLACE FUNCTION public.set_updated_at_guideline()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.guideline_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar text,
  title_en text NOT NULL,
  organization text,
  year integer,
  country_or_region text,
  document_type text,
  category text,
  topic_tags jsonb,
  file_url text,
  external_url text,
  doi text,
  is_public boolean NOT NULL DEFAULT false,
  is_chatbot_allowed boolean NOT NULL DEFAULT false,
  version text,
  uploaded_by uuid,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  last_reviewed_at timestamptz,
  summary_ar text,
  summary_en text,
  notes_private text,
  review_status text NOT NULL DEFAULT 'current',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.guideline_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "guideline_documents_public_read"
ON public.guideline_documents FOR SELECT TO anon, authenticated
USING (is_public = true AND is_active = true);

CREATE POLICY "guideline_documents_admin_read"
ON public.guideline_documents FOR SELECT TO authenticated
USING (is_admin_user(auth.uid()) OR has_role(auth.uid(), 'physician'::app_role));

CREATE POLICY "guideline_documents_admin_insert"
ON public.guideline_documents FOR INSERT TO authenticated
WITH CHECK (is_admin_user(auth.uid()) OR has_role(auth.uid(), 'physician'::app_role));

CREATE POLICY "guideline_documents_admin_update"
ON public.guideline_documents FOR UPDATE TO authenticated
USING (is_admin_user(auth.uid()) OR has_role(auth.uid(), 'physician'::app_role));

CREATE POLICY "guideline_documents_admin_delete"
ON public.guideline_documents FOR DELETE TO authenticated
USING (is_admin_user(auth.uid()) OR has_role(auth.uid(), 'physician'::app_role));

CREATE TABLE public.guideline_document_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guideline_document_id uuid REFERENCES public.guideline_documents(id) ON DELETE CASCADE,
  action text NOT NULL,
  changed_by uuid,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.guideline_document_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "guideline_logs_admin_read"
ON public.guideline_document_logs FOR SELECT TO authenticated
USING (is_admin_user(auth.uid()) OR has_role(auth.uid(), 'physician'::app_role));

CREATE POLICY "guideline_logs_admin_insert"
ON public.guideline_document_logs FOR INSERT TO authenticated
WITH CHECK (is_admin_user(auth.uid()) OR has_role(auth.uid(), 'physician'::app_role));

CREATE TRIGGER guideline_documents_set_updated_at
BEFORE UPDATE ON public.guideline_documents
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_guideline();

CREATE INDEX guideline_documents_public_idx ON public.guideline_documents (is_public, is_active, category);
CREATE INDEX guideline_documents_chatbot_idx ON public.guideline_documents (is_chatbot_allowed, is_active);

INSERT INTO storage.buckets (id, name, public)
VALUES ('guidelines', 'guidelines', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "guidelines_admin_all"
ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id = 'guidelines' AND (
    is_admin_user(auth.uid()) OR has_role(auth.uid(), 'physician'::app_role)
  )
)
WITH CHECK (
  bucket_id = 'guidelines' AND (
    is_admin_user(auth.uid()) OR has_role(auth.uid(), 'physician'::app_role)
  )
);

CREATE POLICY "guidelines_public_read"
ON storage.objects FOR SELECT TO anon, authenticated
USING (
  bucket_id = 'guidelines' AND EXISTS (
    SELECT 1 FROM public.guideline_documents gd
    WHERE gd.file_url LIKE '%' || storage.objects.name
      AND gd.is_public = true
      AND gd.is_active = true
  )
);
