
-- Share cards table
CREATE TABLE public.share_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  share_type text NOT NULL,
  anonymous_session_id text,
  title_ar text,
  title_en text,
  message_ar text,
  message_en text,
  cta_ar text,
  cta_en text,
  image_url text,
  target_url text NOT NULL,
  safe_public_payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_share_cards_type ON public.share_cards(share_type);
CREATE INDEX idx_share_cards_created ON public.share_cards(created_at DESC);

ALTER TABLE public.share_cards ENABLE ROW LEVEL SECURITY;

-- Public can SELECT all share cards (they contain only sanitized public info by construction)
CREATE POLICY "share_cards public read"
  ON public.share_cards FOR SELECT
  USING (true);

-- Only admins can update/delete; inserts are admin-only (server functions use service role)
CREATE POLICY "share_cards admin update"
  ON public.share_cards FOR UPDATE
  USING (public.is_admin_user(auth.uid()));

CREATE POLICY "share_cards admin delete"
  ON public.share_cards FOR DELETE
  USING (public.is_admin_user(auth.uid()));

CREATE POLICY "share_cards admin insert"
  ON public.share_cards FOR INSERT
  WITH CHECK (public.is_admin_user(auth.uid()));

-- Public storage bucket for share preview images
INSERT INTO storage.buckets (id, name, public)
VALUES ('share-images', 'share-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public read of share images
CREATE POLICY "share-images public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'share-images');

-- Only admins / service role can upload share images
CREATE POLICY "share-images admin write"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'share-images' AND public.is_admin_user(auth.uid()));
