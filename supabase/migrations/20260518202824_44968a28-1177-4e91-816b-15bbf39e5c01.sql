
-- Poster creations (no PII)
CREATE TABLE public.poster_creations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_session_id text,
  poster_type text NOT NULL,
  template_name text NOT NULL,
  display_name text,
  city text,
  message_key text,
  custom_message text,
  language text,
  export_size text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.poster_creations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert poster creations"
  ON public.poster_creations FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view poster creations"
  ON public.poster_creations FOR SELECT TO authenticated
  USING (public.is_admin_user(auth.uid()));

CREATE INDEX idx_poster_creations_created_at ON public.poster_creations(created_at DESC);
CREATE INDEX idx_poster_creations_template ON public.poster_creations(template_name);

-- Poster events (aggregate analytics only)
CREATE TABLE public.poster_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  poster_type text,
  template_name text,
  city text,
  anonymous_session_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.poster_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert poster events"
  ON public.poster_events FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view poster events"
  ON public.poster_events FOR SELECT TO authenticated
  USING (public.is_admin_user(auth.uid()));

CREATE INDEX idx_poster_events_created_at ON public.poster_events(created_at DESC);
CREATE INDEX idx_poster_events_type ON public.poster_events(event_type);

-- Public aggregate stats
CREATE OR REPLACE FUNCTION public.get_poster_studio_public_stats()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'generated_at', now(),
    'total_posters_created', (SELECT count(*) FROM public.poster_creations),
    'posters_created_today', (SELECT count(*) FROM public.poster_creations WHERE created_at::date = CURRENT_DATE),
    'most_used_template', (
      SELECT template_name FROM public.poster_creations
      WHERE template_name IS NOT NULL
      GROUP BY 1 ORDER BY count(*) DESC LIMIT 1
    ),
    'total_shares_clicked', (
      SELECT count(*) FROM public.poster_events
      WHERE event_type IN ('poster_shared_whatsapp','poster_shared_x','poster_text_copied')
    ),
    'cities_participating', (
      SELECT count(*) FROM (
        SELECT lower(trim(city)) AS c FROM public.poster_creations
        WHERE city IS NOT NULL AND trim(city) <> ''
        GROUP BY 1 HAVING count(*) >= 3
      ) t
    )
  ) INTO result;
  RETURN result;
END;
$$;

-- Admin analytics
CREATE OR REPLACE FUNCTION public.get_admin_poster_analytics()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE result jsonb;
BEGIN
  IF NOT public.is_admin_user(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT jsonb_build_object(
    'generated_at', now(),
    'total_posters', (SELECT count(*) FROM public.poster_creations),
    'downloads', (SELECT count(*) FROM public.poster_events WHERE event_type='poster_downloaded'),
    'whatsapp_shares', (SELECT count(*) FROM public.poster_events WHERE event_type='poster_shared_whatsapp'),
    'x_shares', (SELECT count(*) FROM public.poster_events WHERE event_type='poster_shared_x'),
    'text_copies', (SELECT count(*) FROM public.poster_events WHERE event_type='poster_text_copied'),
    'popular_templates', COALESCE((
      SELECT jsonb_object_agg(template_name, c)
      FROM (SELECT template_name, count(*) AS c FROM public.poster_creations
            WHERE template_name IS NOT NULL GROUP BY 1 ORDER BY c DESC LIMIT 10) t
    ), '{}'::jsonb),
    'popular_messages', COALESCE((
      SELECT jsonb_object_agg(message_key, c)
      FROM (SELECT message_key, count(*) AS c FROM public.poster_creations
            WHERE message_key IS NOT NULL GROUP BY 1 ORDER BY c DESC LIMIT 10) t
    ), '{}'::jsonb),
    'poster_types', COALESCE((
      SELECT jsonb_object_agg(poster_type, c)
      FROM (SELECT poster_type, count(*) AS c FROM public.poster_creations
            GROUP BY 1 ORDER BY c DESC) t
    ), '{}'::jsonb),
    'city_distribution', COALESCE((
      SELECT jsonb_object_agg(city, c)
      FROM (SELECT lower(trim(city)) AS city, count(*) AS c FROM public.poster_creations
            WHERE city IS NOT NULL AND trim(city) <> '' GROUP BY 1 ORDER BY c DESC LIMIT 20) t
    ), '{}'::jsonb),
    'language_distribution', COALESCE((
      SELECT jsonb_object_agg(coalesce(language,'unknown'), c)
      FROM (SELECT language, count(*) AS c FROM public.poster_creations GROUP BY 1) t
    ), '{}'::jsonb),
    'conversion_to_assessment', (
      SELECT count(*) FROM public.poster_events WHERE event_type='poster_start_assessment_clicked'
    ),
    'events_by_day', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('day', d, 'events', c) ORDER BY d)
      FROM (SELECT created_at::date AS d, count(*) AS c FROM public.poster_events
            WHERE created_at > now() - interval '30 days' GROUP BY 1) t
    ), '[]'::jsonb)
  ) INTO result;
  RETURN result;
END;
$$;
