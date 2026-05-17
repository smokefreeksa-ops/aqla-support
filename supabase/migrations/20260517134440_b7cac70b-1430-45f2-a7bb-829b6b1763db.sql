
-- Add optional research outcome fields to follow_up_visits
ALTER TABLE public.follow_up_visits
  ADD COLUMN IF NOT EXISTS withdrawal_severity_0_10 integer,
  ADD COLUMN IF NOT EXISTS abstinence_duration_days integer,
  ADD COLUMN IF NOT EXISTS percent_reduction_estimate integer,
  ADD COLUMN IF NOT EXISTS satisfaction_with_support_0_10 integer;

-- Community exposure (optional research extension)
CREATE TABLE IF NOT EXISTS public.community_exposure (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL,
  family_smoking_exposure text,
  close_friend_smoking_or_nicotine_use text,
  secondhand_smoke_exposure_home text,
  secondhand_smoke_exposure_public_places text,
  seen_tobacco_or_nicotine_ads_social_media text,
  seen_tobacco_or_nicotine_ads_shops text,
  influencer_or_online_promotion_exposure text,
  easy_access_to_products text,
  main_source_of_products text,
  online_purchase_or_delivery_exposure text,
  purchase_attempt_underage_if_applicable text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.community_exposure ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public can submit community_exposure"
  ON public.community_exposure FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "admins read community_exposure"
  ON public.community_exposure FOR SELECT TO authenticated
  USING (is_admin_user(auth.uid()));
