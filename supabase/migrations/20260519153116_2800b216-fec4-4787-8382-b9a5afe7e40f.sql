
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE IF NOT EXISTS public.assessment_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_key text NOT NULL UNIQUE,
  tool_name_en text NOT NULL,
  tool_name_ar text NOT NULL,
  product_type text NOT NULL,
  version text,
  citation text,
  language text NOT NULL DEFAULT 'ar,en',
  is_validated boolean NOT NULL DEFAULT true,
  is_translated boolean NOT NULL DEFAULT false,
  translation_note text,
  scoring_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  result_bands_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  safety_note text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.assessment_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read active assessment_tools" ON public.assessment_tools
  FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "admins insert assessment_tools" ON public.assessment_tools
  FOR INSERT TO authenticated WITH CHECK (is_admin_user(auth.uid()));
CREATE POLICY "admins update assessment_tools" ON public.assessment_tools
  FOR UPDATE TO authenticated USING (is_admin_user(auth.uid()));

CREATE TRIGGER trg_assessment_tools_updated_at
  BEFORE UPDATE ON public.assessment_tools
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.assessment_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid,
  anonymous_session_id text,
  tool_key text NOT NULL REFERENCES public.assessment_tools(tool_key),
  product_type text NOT NULL,
  item_responses jsonb NOT NULL DEFAULT '{}'::jsonb,
  total_score numeric,
  result_band text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public insert assessment_responses" ON public.assessment_responses
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins read assessment_responses" ON public.assessment_responses
  FOR SELECT TO authenticated USING (is_admin_user(auth.uid()));

INSERT INTO public.assessment_tools
  (tool_key, tool_name_en, tool_name_ar, product_type, version, citation, is_validated, is_translated, translation_note, scoring_json, result_bands_json, safety_note)
VALUES
  ('ftnd_cigarettes',
   'Fagerström Test for Nicotine Dependence (FTND)',
   'اختبار فاجرستروم للاعتماد على النيكوتين',
   'cigarettes', '1991',
   'Heatherton TF et al. Br J Addict 1991;86:1119-27.',
   true, true, 'Arabic clinical wording, item structure preserved.',
   '{"items":6,"range":[0,10]}'::jsonb,
   '[{"min":0,"max":2,"band":"very_low"},{"min":3,"max":4,"band":"low"},{"min":5,"max":5,"band":"moderate"},{"min":6,"max":7,"band":"high"},{"min":8,"max":10,"band":"very_high"}]'::jsonb,
   'تقييم تقديري وليس تشخيصًا طبيًا.'),
  ('ps_ecdi_vape',
   'Penn State Electronic Cigarette Dependence Index (PSECDI)',
   'مؤشر بنسلفانيا للاعتماد على السجائر الإلكترونية',
   'vape', '2015',
   'Foulds J et al. Nicotine Tob Res 2015.',
   true, true, 'Adapted Arabic wording for vape devices.',
   '{"items":10,"range":[0,20]}'::jsonb,
   '[{"min":0,"max":3,"band":"none"},{"min":4,"max":8,"band":"low"},{"min":9,"max":12,"band":"moderate"},{"min":13,"max":20,"band":"high"}]'::jsonb,
   'تقييم تقديري وليس تشخيصًا طبيًا.'),
  ('ps_ndi_all_nicotine',
   'Penn State Nicotine Dependence Index (oral/pouch adapted)',
   'مؤشر بنسلفانيا للاعتماد على منتجات النيكوتين',
   'pouches', '2017',
   'Penn State group, adapted for oral nicotine.',
   true, true, 'تقييم مكيّف لمنتجات النيكوتين الفموية.',
   '{"items":10,"range":[0,20]}'::jsonb,
   '[{"min":0,"max":3,"band":"none"},{"min":4,"max":8,"band":"low"},{"min":9,"max":12,"band":"moderate"},{"min":13,"max":20,"band":"high"}]'::jsonb,
   'أداة مكيّفة — ليست بديلًا عن تقييم سريري.'),
  ('honc_youth',
   'Hooked on Nicotine Checklist (HONC)',
   'قائمة فقدان التحكم مع النيكوتين',
   'youth_loss_of_control', '2002',
   'DiFranza JR et al. Tob Control 2002;11:228-35.',
   true, true, 'مناسبة للمراهقين وحالات فقدان التحكم المبكر.',
   '{"items":10,"range":[0,10]}'::jsonb,
   '[{"min":0,"max":0,"band":"none"},{"min":1,"max":2,"band":"low"},{"min":3,"max":5,"band":"moderate"},{"min":6,"max":10,"band":"high"}]'::jsonb,
   'أي إجابة بنعم قد تشير إلى بدء فقدان التحكم — يُنصح بدعم موجَّه.'),
  ('lwds11_waterpipe',
   'Lebanon Waterpipe Dependence Scale (LWDS-11)',
   'مقياس الاعتماد على الشيشة والمعسل',
   'shisha', '2008',
   'Salameh P et al. Nicotine Tob Res 2008.',
   true, true, 'الترجمة العربية المعتمدة للنسخة اللبنانية.',
   '{"items":11,"range":[0,39]}'::jsonb,
   '[{"min":0,"max":9,"band":"low"},{"min":10,"max":19,"band":"moderate"},{"min":20,"max":39,"band":"high"}]'::jsonb,
   'تقييم تقديري وليس تشخيصًا طبيًا.')
ON CONFLICT (tool_key) DO UPDATE SET
  tool_name_en = EXCLUDED.tool_name_en,
  tool_name_ar = EXCLUDED.tool_name_ar,
  updated_at = now();
