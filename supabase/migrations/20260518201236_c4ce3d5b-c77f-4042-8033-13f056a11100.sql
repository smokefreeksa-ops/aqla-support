
-- =====================================================================
-- Aqla Support Shop (NRT request) — schema
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.nrt_product_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_slug text UNIQUE NOT NULL,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  category text NOT NULL,
  description_ar text,
  description_en text,
  available_options jsonb,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.nrt_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_code text UNIQUE NOT NULL,
  full_name text NOT NULL,
  mobile_number text NOT NULL,
  email text,
  city text,
  district text,
  delivery_address text,
  preferred_contact_method text,
  preferred_language text,
  selected_products jsonb NOT NULL,
  quantity_requested jsonb,
  notes text,
  age_group text,
  pregnant_or_breastfeeding text,
  chest_pain_or_heart_condition text,
  severe_breathing_problem text,
  taking_regular_medications text,
  completed_aqla_assessment text,
  requires_clinician_review boolean NOT NULL DEFAULT false,
  order_status text NOT NULL DEFAULT 'new_request',
  consent_to_contact boolean NOT NULL DEFAULT false,
  acknowledgement_not_prescription boolean NOT NULL DEFAULT false,
  internal_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS nrt_requests_created_idx ON public.nrt_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS nrt_requests_status_idx  ON public.nrt_requests (order_status, created_at DESC);

CREATE TRIGGER nrt_requests_set_updated_at
  BEFORE UPDATE ON public.nrt_requests
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE IF NOT EXISTS public.nrt_request_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.nrt_requests(id) ON DELETE CASCADE,
  old_status text,
  new_status text NOT NULL,
  changed_by uuid,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS nrt_request_history_idx ON public.nrt_request_status_history (request_id, created_at DESC);

-- =====================================================================
-- RLS
-- =====================================================================

ALTER TABLE public.nrt_product_catalog          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nrt_requests                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nrt_request_status_history   ENABLE ROW LEVEL SECURITY;

-- Catalog: public can read active rows; physicians manage
CREATE POLICY "catalog_public_read_active"
  ON public.nrt_product_catalog FOR SELECT
  USING (is_active = true);

CREATE POLICY "catalog_physician_read_all"
  ON public.nrt_product_catalog FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'physician'::app_role));

CREATE POLICY "catalog_physician_manage"
  ON public.nrt_product_catalog FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'physician'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'physician'::app_role));

-- Requests: public can INSERT only; cannot read
CREATE POLICY "requests_public_insert"
  ON public.nrt_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "requests_physician_read"
  ON public.nrt_requests FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'physician'::app_role));

CREATE POLICY "requests_physician_update"
  ON public.nrt_requests FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'physician'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'physician'::app_role));

CREATE POLICY "requests_receptionist_read"
  ON public.nrt_requests FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'receptionist'::app_role));

CREATE POLICY "requests_receptionist_update"
  ON public.nrt_requests FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'receptionist'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'receptionist'::app_role));

-- History: physicians read & insert; receptionists read & insert
CREATE POLICY "history_physician_read"
  ON public.nrt_request_status_history FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'physician'::app_role));

CREATE POLICY "history_physician_insert"
  ON public.nrt_request_status_history FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'physician'::app_role));

CREATE POLICY "history_receptionist_read"
  ON public.nrt_request_status_history FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'receptionist'::app_role));

CREATE POLICY "history_receptionist_insert"
  ON public.nrt_request_status_history FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'receptionist'::app_role));

-- =====================================================================
-- Seed catalog (7 categories)
-- =====================================================================

INSERT INTO public.nrt_product_catalog
  (product_slug, name_ar, name_en, category, description_ar, description_en, available_options, display_order)
VALUES
  ('nicotine_patches', 'لصقات النيكوتين', 'Nicotine Patches', 'patch',
   'لصقات توضع على الجلد وتفرز النيكوتين تدريجيًا خلال اليوم. اختيار النوع أو القوة المناسبة يحتاج مراجعة مختص.',
   'Patches are applied to the skin and release nicotine gradually through the day. Choosing the right type or strength requires clinician or pharmacist review.',
   '{"options":["24-hour patch","16-hour patch","Strength options as available (requires review)"]}'::jsonb, 10),
  ('nicotine_gum', 'علكة النيكوتين', 'Nicotine Gum', 'gum',
   'علكة تحتوي على النيكوتين وتستخدم عادة عند حدوث الرغبة. لا يتم اختيار القوة أو طريقة الاستخدام إلا بعد مراجعة مناسبة.',
   'Nicotine gum contains nicotine and is commonly used when cravings occur. Strength and use instructions should be reviewed by a clinician or pharmacist.',
   '{"options":["Gum (strength options as configured by admin)"]}'::jsonb, 20),
  ('nicotine_lozenges', 'أقراص أو حبوب مص النيكوتين', 'Nicotine Lozenges', 'lozenge',
   'أقراص مص تحتوي على النيكوتين وتستخدم للمساعدة في التحكم بالرغبة. الاختيار يعتمد على التقييم والمراجعة.',
   'Lozenges contain nicotine and may help with cravings. Selection depends on assessment and review.',
   '{"options":["Lozenge (selection depends on review)"]}'::jsonb, 30),
  ('nicotine_mouth_spray', 'بخاخ النيكوتين للفم', 'Nicotine Mouth Spray', 'spray',
   'بخاخ فم يستخدم عند الرغبة الشديدة، وقد لا يكون مناسبًا لبعض الأشخاص. يحتاج مراجعة قبل الاستخدام.',
   'A mouth spray may be used for strong cravings and may not be suitable for everyone. Review is needed before use.',
   '{"options":["Mouth spray (requires review)"]}'::jsonb, 40),
  ('nicotine_inhalator', 'مستنشق النيكوتين الطبي', 'Nicotine Inhalator', 'inhalator',
   'منتج طبي لبدائل النيكوتين يختلف عن الفيب أو السجائر الإلكترونية. توفره يختلف حسب البلد والصيدليات.',
   'A medical nicotine replacement product that is different from vaping or e-cigarettes. Availability may vary by country and pharmacy.',
   '{"options":["Inhalator (availability varies)"]}'::jsonb, 50),
  ('combination_nrt', 'منتجات مركبة حسب المراجعة', 'Combination NRT by Review', 'combination',
   'بعض الأشخاص قد يحتاجون مزيجًا من أكثر من منتج، لكن هذا لا يتم إلا بعد مراجعة مختص.',
   'Some people may need a combination of products, but this should only happen after clinician or pharmacist review.',
   '{"options":["Combination (requires clinician review)"]}'::jsonb, 60),
  ('help_choosing', 'أحتاج مساعدة في الاختيار', 'I Need Help Choosing', 'help',
   'إذا لم تكن متأكدًا من المنتج المناسب، اختر هذا الخيار وسيتم توجيه طلبك للمراجعة.',
   'If you are not sure which product is suitable, choose this option and your request will be reviewed.',
   '{"options":["Team will review and contact you"]}'::jsonb, 70)
ON CONFLICT (product_slug) DO NOTHING;
