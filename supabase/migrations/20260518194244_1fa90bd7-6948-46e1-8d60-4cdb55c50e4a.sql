-- Aqla City Challenge — anonymous, aggregate-only city engagement tracking

CREATE TABLE IF NOT EXISTS public.city_challenge_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  city text,
  region text,
  anonymous_session_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cce_city ON public.city_challenge_events (lower(trim(city)));
CREATE INDEX IF NOT EXISTS idx_cce_event_type ON public.city_challenge_events (event_type);
CREATE INDEX IF NOT EXISTS idx_cce_created ON public.city_challenge_events (created_at DESC);

ALTER TABLE public.city_challenge_events ENABLE ROW LEVEL SECURITY;

-- Public/anon may insert anonymous engagement events
DROP POLICY IF EXISTS "public insert city_challenge_events" ON public.city_challenge_events;
CREATE POLICY "public insert city_challenge_events"
  ON public.city_challenge_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admins may read raw rows for analytics
DROP POLICY IF EXISTS "admins read city_challenge_events" ON public.city_challenge_events;
CREATE POLICY "admins read city_challenge_events"
  ON public.city_challenge_events
  FOR SELECT
  TO authenticated
  USING (public.is_admin_user(auth.uid()));

-- Public aggregate function: never returns raw rows or personal identifiers.
-- Cities with fewer than 5 completed assessments are bucketed as "Other"
-- and exact engagement counts under 5 are suppressed as "<5".
CREATE OR REPLACE FUNCTION public.get_city_challenge_stats()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  weekly_challenge_start timestamptz := date_trunc('week', now());
BEGIN
  WITH p AS (
    SELECT lower(trim(city)) AS city, count(*) AS completed
    FROM public.participants
    WHERE city IS NOT NULL AND trim(city) <> ''
    GROUP BY 1
  ),
  v AS (
    SELECT lower(trim(city)) AS city, count(*) AS volunteers
    FROM public.volunteer_applications
    WHERE city IS NOT NULL AND trim(city) <> ''
    GROUP BY 1
  ),
  pl AS (
    SELECT lower(trim(city)) AS city,
           count(*) FILTER (WHERE event_type = 'quit_pledge_created') AS pledges,
           count(*) FILTER (WHERE event_type = 'quit_pledge_created'
                              AND created_at >= weekly_challenge_start) AS weekly_pledges
    FROM public.city_challenge_events
    WHERE city IS NOT NULL AND trim(city) <> ''
    GROUP BY 1
  ),
  fu AS (
    SELECT lower(trim(pa.city)) AS city, count(*) AS follow_ups
    FROM public.follow_up_visits f
    JOIN public.participants pa ON pa.id = f.participant_id
    WHERE pa.city IS NOT NULL AND trim(pa.city) <> ''
    GROUP BY 1
  ),
  rc AS (
    SELECT lower(trim(pa.city)) AS city, count(*) AS research
    FROM public.consent_records cr
    JOIN public.participants pa ON pa.id = cr.participant_id
    WHERE cr.consent_research = true
      AND pa.city IS NOT NULL AND trim(pa.city) <> ''
    GROUP BY 1
  ),
  cities AS (
    SELECT city FROM p
    UNION SELECT city FROM v
    UNION SELECT city FROM pl
    UNION SELECT city FROM fu
    UNION SELECT city FROM rc
  ),
  joined AS (
    SELECT
      c.city,
      COALESCE(p.completed, 0)  AS completed_assessments_count,
      COALESCE(pl.pledges, 0)   AS quit_pledges_count,
      COALESCE(v.volunteers, 0) AS volunteer_applications_count,
      COALESCE(fu.follow_ups, 0) AS follow_up_visits_count,
      COALESCE(rc.research, 0)  AS research_consent_count,
      COALESCE(pl.weekly_pledges, 0) AS weekly_pledges_count
    FROM cities c
    LEFT JOIN p  USING (city)
    LEFT JOIN v  USING (city)
    LEFT JOIN pl USING (city)
    LEFT JOIN fu USING (city)
    LEFT JOIN rc USING (city)
  ),
  scored AS (
    SELECT
      city,
      completed_assessments_count,
      quit_pledges_count,
      volunteer_applications_count,
      follow_up_visits_count,
      research_consent_count,
      weekly_pledges_count,
      (completed_assessments_count
       + quit_pledges_count
       + volunteer_applications_count
       + follow_up_visits_count) AS city_engagement_score
    FROM joined
  ),
  -- Bucket low-volume cities into "other" for re-identification safety
  safe AS (
    SELECT
      CASE WHEN city_engagement_score < 5 THEN 'other' ELSE city END AS city,
      sum(completed_assessments_count)  AS completed_assessments_count,
      sum(quit_pledges_count)           AS quit_pledges_count,
      sum(volunteer_applications_count) AS volunteer_applications_count,
      sum(follow_up_visits_count)       AS follow_up_visits_count,
      sum(research_consent_count)       AS research_consent_count,
      sum(weekly_pledges_count)         AS weekly_pledges_count,
      sum(city_engagement_score)        AS city_engagement_score
    FROM scored
    GROUP BY 1
  )
  SELECT jsonb_build_object(
    'generated_at', now(),
    'weekly_window_start', weekly_challenge_start,
    'cities', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'city', city,
        'completed_assessments_count', completed_assessments_count,
        'quit_pledges_count',          quit_pledges_count,
        'volunteer_applications_count', volunteer_applications_count,
        'follow_up_visits_count',      follow_up_visits_count,
        'research_consent_count',      research_consent_count,
        'weekly_pledges_count',        weekly_pledges_count,
        'city_engagement_score',       city_engagement_score,
        -- Display-safe count: suppress as "<5" when total engagement under 5
        'display_engagement',
          CASE WHEN city_engagement_score < 5 THEN '<5'
               ELSE city_engagement_score::text END
      ) ORDER BY city_engagement_score DESC)
      FROM safe
    ), '[]'::jsonb),
    'totals', (SELECT jsonb_build_object(
      'completed_assessments', sum(completed_assessments_count),
      'quit_pledges',           sum(quit_pledges_count),
      'volunteer_applications', sum(volunteer_applications_count),
      'follow_up_visits',       sum(follow_up_visits_count),
      'research_consent',       sum(research_consent_count),
      'weekly_pledges',         sum(weekly_pledges_count)
    ) FROM safe),
    'leaderboard', jsonb_build_object(
      'top_completed',  (SELECT jsonb_build_object('city', city, 'count', completed_assessments_count)
                         FROM safe WHERE city <> 'other' AND completed_assessments_count > 0
                         ORDER BY completed_assessments_count DESC LIMIT 1),
      'top_volunteers',(SELECT jsonb_build_object('city', city, 'count', volunteer_applications_count)
                         FROM safe WHERE city <> 'other' AND volunteer_applications_count > 0
                         ORDER BY volunteer_applications_count DESC LIMIT 1),
      'top_pledges',    (SELECT jsonb_build_object('city', city, 'count', quit_pledges_count)
                         FROM safe WHERE city <> 'other' AND quit_pledges_count > 0
                         ORDER BY quit_pledges_count DESC LIMIT 1),
      'rising_weekly',  (SELECT jsonb_build_object('city', city, 'count', weekly_pledges_count)
                         FROM safe WHERE city <> 'other' AND weekly_pledges_count > 0
                         ORDER BY weekly_pledges_count DESC LIMIT 1),
      'top_followups',  (SELECT jsonb_build_object('city', city, 'count', follow_up_visits_count)
                         FROM safe WHERE city <> 'other' AND follow_up_visits_count > 0
                         ORDER BY follow_up_visits_count DESC LIMIT 1)
    )
  ) INTO result;
  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_city_challenge_stats() FROM public;
GRANT EXECUTE ON FUNCTION public.get_city_challenge_stats() TO anon, authenticated;