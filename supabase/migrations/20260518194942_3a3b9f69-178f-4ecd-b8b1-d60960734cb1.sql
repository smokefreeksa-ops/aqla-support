
-- challenge_events: privacy-safe, anonymous engagement log
CREATE TABLE IF NOT EXISTS public.challenge_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_session_id text,
  challenge_type text NOT NULL,
  event_type text NOT NULL,
  city text,
  region text,
  value_numeric numeric,
  value_label text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_challenge_events_created_at ON public.challenge_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_challenge_events_challenge_type ON public.challenge_events (challenge_type);
CREATE INDEX IF NOT EXISTS idx_challenge_events_event_type ON public.challenge_events (event_type);
CREATE INDEX IF NOT EXISTS idx_challenge_events_city ON public.challenge_events (lower(trim(city)));

ALTER TABLE public.challenge_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public insert challenge_events" ON public.challenge_events;
CREATE POLICY "public insert challenge_events"
  ON public.challenge_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "admins read challenge_events" ON public.challenge_events;
CREATE POLICY "admins read challenge_events"
  ON public.challenge_events FOR SELECT
  TO authenticated
  USING (public.is_admin_user(auth.uid()));

-- Public aggregate KPIs
CREATE OR REPLACE FUNCTION public.get_challenge_public_stats()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'generated_at', now(),
    'total_pledges', (SELECT count(*) FROM public.challenge_events
      WHERE challenge_type = 'pledge_map' AND event_type IN ('quit_pledge','supporter_pledge')),
    'quit_pledges', (SELECT count(*) FROM public.challenge_events
      WHERE challenge_type = 'pledge_map' AND event_type = 'quit_pledge'),
    'supporter_pledges', (SELECT count(*) FROM public.challenge_events
      WHERE challenge_type = 'pledge_map' AND event_type = 'supporter_pledge'),
    'cities_participating', (SELECT count(DISTINCT lower(trim(city))) FROM public.challenge_events
      WHERE city IS NOT NULL AND trim(city) <> ''),
    'challenge_shares', (SELECT count(*) FROM public.challenge_events WHERE event_type LIKE 'share_%'),
    'whatsapp_shares', (SELECT count(*) FROM public.challenge_events WHERE event_type = 'share_whatsapp'),
    'x_shares', (SELECT count(*) FROM public.challenge_events WHERE event_type = 'share_x'),
    'copy_shares', (SELECT count(*) FROM public.challenge_events WHERE event_type = 'share_copy'),
    'save_it_calculations', (SELECT count(*) FROM public.challenge_events
      WHERE challenge_type = 'save_it' AND event_type = 'calculation_completed'),
    'total_estimated_yearly_savings', COALESCE((SELECT sum(value_numeric) FROM public.challenge_events
      WHERE challenge_type = 'save_it' AND event_type = 'calculation_completed' AND value_numeric IS NOT NULL), 0),
    'first_step_challenges', (SELECT count(*) FROM public.challenge_events
      WHERE challenge_type = 'first_step' AND event_type = 'choice_selected'),
    'trigger_battles_completed', (SELECT count(*) FROM public.challenge_events
      WHERE challenge_type = 'trigger_battle' AND event_type = 'trigger_selected'),
    'twentyeight_day_starts', (SELECT count(*) FROM public.challenge_events
      WHERE challenge_type = '28day' AND event_type = 'challenge_started'),
    'volunteers_joined', (SELECT count(*) FROM public.volunteer_applications)
  ) INTO result;
  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_challenge_public_stats() FROM public;
GRANT EXECUTE ON FUNCTION public.get_challenge_public_stats() TO anon, authenticated;

-- Admin-only analytics breakdown
CREATE OR REPLACE FUNCTION public.get_admin_challenge_analytics()
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
    'engagement_by_day', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('day', d, 'events', e) ORDER BY d)
      FROM (SELECT created_at::date AS d, count(*) AS e
            FROM public.challenge_events
            WHERE created_at > now() - interval '30 days'
            GROUP BY 1) t
    ), '[]'::jsonb),
    'by_challenge', COALESCE((
      SELECT jsonb_object_agg(challenge_type, c)
      FROM (SELECT challenge_type, count(*) AS c FROM public.challenge_events GROUP BY 1) t
    ), '{}'::jsonb),
    'share_clicks', COALESCE((
      SELECT jsonb_object_agg(event_type, c)
      FROM (SELECT event_type, count(*) AS c FROM public.challenge_events
            WHERE event_type LIKE 'share_%' GROUP BY 1) t
    ), '{}'::jsonb),
    'top_triggers', COALESCE((
      SELECT jsonb_object_agg(value_label, c)
      FROM (SELECT value_label, count(*) AS c FROM public.challenge_events
            WHERE challenge_type='trigger_battle' AND value_label IS NOT NULL
            GROUP BY 1 ORDER BY c DESC LIMIT 10) t
    ), '{}'::jsonb),
    'city_leaderboard', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('city', city, 'events', c) ORDER BY c DESC)
      FROM (SELECT lower(trim(city)) AS city, count(*) AS c FROM public.challenge_events
            WHERE city IS NOT NULL AND trim(city)<>'' GROUP BY 1 ORDER BY c DESC LIMIT 20) t
    ), '[]'::jsonb),
    'estimated_savings_total', COALESCE((SELECT sum(value_numeric) FROM public.challenge_events
      WHERE challenge_type='save_it' AND event_type='calculation_completed'), 0),
    'conversion_to_assessment', (SELECT count(*) FROM public.challenge_events
      WHERE event_type='start_assessment_clicked_from_challenge'),
    'conversion_to_volunteer', (SELECT count(*) FROM public.challenge_events
      WHERE event_type='volunteer_apply_clicked_from_challenge'),
    'most_used_challenge', (SELECT challenge_type FROM public.challenge_events
      GROUP BY 1 ORDER BY count(*) DESC LIMIT 1)
  ) INTO result;
  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_challenge_analytics() FROM public;
GRANT EXECUTE ON FUNCTION public.get_admin_challenge_analytics() TO authenticated;
