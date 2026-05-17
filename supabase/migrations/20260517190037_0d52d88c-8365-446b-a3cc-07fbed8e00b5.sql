-- ============ page_analytics ============
CREATE TABLE IF NOT EXISTS public.page_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_session_id text NOT NULL,
  page_path text NOT NULL,
  page_title text,
  language text,
  entry_time timestamptz NOT NULL DEFAULT now(),
  exit_time timestamptz,
  duration_seconds integer,
  referrer_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.page_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public insert page_analytics"
  ON public.page_analytics FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_page_analytics_session ON public.page_analytics(anonymous_session_id);
CREATE INDEX IF NOT EXISTS idx_page_analytics_path ON public.page_analytics(page_path);
CREATE INDEX IF NOT EXISTS idx_page_analytics_entry ON public.page_analytics(entry_time);

-- ============ engagement_events ============
CREATE TABLE IF NOT EXISTS public.engagement_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_session_id text NOT NULL,
  event_type text NOT NULL,
  page_path text,
  event_label text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.engagement_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public insert engagement_events"
  ON public.engagement_events FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_engagement_session ON public.engagement_events(anonymous_session_id);
CREATE INDEX IF NOT EXISTS idx_engagement_type ON public.engagement_events(event_type);
CREATE INDEX IF NOT EXISTS idx_engagement_created ON public.engagement_events(created_at);

-- ============ get_public_impact_stats (replace) ============
CREATE OR REPLACE FUNCTION public.get_public_impact_stats()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_assessments_count integer;
  started_count integer;
  result jsonb;
BEGIN
  SELECT count(*) INTO total_assessments_count FROM public.participants;
  SELECT count(DISTINCT anonymous_session_id) INTO started_count
    FROM public.engagement_events WHERE event_type = 'assessment_started';

  SELECT jsonb_build_object(
    'total_visits', (SELECT count(*) FROM public.page_analytics),
    'unique_visitors', (SELECT count(DISTINCT anonymous_session_id) FROM public.page_analytics),
    'visits_today', (SELECT count(*) FROM public.page_analytics WHERE entry_time::date = CURRENT_DATE),
    'assessments_started', started_count,
    'assessments_completed', total_assessments_count,
    'total_assessments', total_assessments_count,
    'assessment_completion_rate',
      CASE WHEN started_count > 0
        THEN round((100.0 * total_assessments_count / started_count)::numeric, 1)
        ELSE 0 END,
    'quit_track_clicks', (SELECT count(*) FROM public.engagement_events WHERE event_type='quit_track_clicked'),
    'volunteer_track_clicks', (SELECT count(*) FROM public.engagement_events WHERE event_type='volunteer_track_clicked'),
    'support_pathway_count', (SELECT count(*) FROM public.cohort_assignment
      WHERE cohort::text IN ('quit_now','quit_prepare','reduce_first','discuss_alternatives','not_ready_score')),
    'doctor_review_count', (SELECT count(*) FROM public.participants WHERE doctor_review_needed = true),
    'volunteer_applicants', (SELECT count(*) FROM public.volunteer_applications),
    'cities_represented', (SELECT count(DISTINCT lower(trim(city))) FROM public.participants WHERE city IS NOT NULL AND trim(city) <> ''),
    'follow_up_visits_logged', (SELECT count(*) FROM public.follow_up_visits),
    'research_consent_count', (SELECT count(*) FROM public.consent_records WHERE consent_research = true),
    'whatsapp_clicks', (SELECT count(*) FROM public.engagement_events WHERE event_type='whatsapp_clicked'),
    'chatbot_opens', (SELECT count(*) FROM public.engagement_events WHERE event_type='chatbot_opened'),
    'average_session_duration_seconds',
      COALESCE((SELECT avg(duration_seconds)::int FROM public.page_analytics
        WHERE duration_seconds IS NOT NULL AND duration_seconds BETWEEN 1 AND 1800), 0)
  ) INTO result;
  RETURN result;
END;
$$;

-- ============ get_admin_analytics_dashboard ============
CREATE OR REPLACE FUNCTION public.get_admin_analytics_dashboard()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'visits_by_day', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('day', d, 'visits', v, 'unique_visitors', uv) ORDER BY d)
      FROM (
        SELECT entry_time::date AS d, count(*) AS v, count(DISTINCT anonymous_session_id) AS uv
        FROM public.page_analytics
        WHERE entry_time > now() - interval '30 days'
        GROUP BY 1
      ) t
    ), '[]'::jsonb),
    'avg_session_duration_seconds', COALESCE((
      SELECT avg(duration_seconds)::int FROM public.page_analytics
      WHERE duration_seconds IS NOT NULL AND duration_seconds BETWEEN 1 AND 1800), 0),
    'bounce_rate', COALESCE((
      SELECT round((100.0 * sum(CASE WHEN cnt = 1 THEN 1 ELSE 0 END) / NULLIF(count(*),0))::numeric, 1)
      FROM (SELECT anonymous_session_id, count(*) AS cnt FROM public.page_analytics GROUP BY 1) s
    ), 0),
    'assessment_funnel', jsonb_build_object(
      'homepage_viewed', (SELECT count(DISTINCT anonymous_session_id) FROM public.engagement_events WHERE event_type='homepage_viewed'),
      'quit_track_clicked', (SELECT count(DISTINCT anonymous_session_id) FROM public.engagement_events WHERE event_type='quit_track_clicked'),
      'assessment_started', (SELECT count(DISTINCT anonymous_session_id) FROM public.engagement_events WHERE event_type='assessment_started'),
      'consent_completed', (SELECT count(DISTINCT anonymous_session_id) FROM public.engagement_events WHERE event_type='consent_completed'),
      'dependence_completed', (SELECT count(DISTINCT anonymous_session_id) FROM public.engagement_events WHERE event_type='dependence_step_completed'),
      'readiness_completed', (SELECT count(DISTINCT anonymous_session_id) FROM public.engagement_events WHERE event_type='readiness_step_completed'),
      'assessment_completed', (SELECT count(DISTINCT anonymous_session_id) FROM public.engagement_events WHERE event_type='assessment_completed')
    ),
    'volunteer_funnel', jsonb_build_object(
      'volunteer_track_clicked', (SELECT count(DISTINCT anonymous_session_id) FROM public.engagement_events WHERE event_type='volunteer_track_clicked'),
      'volunteer_started', (SELECT count(DISTINCT anonymous_session_id) FROM public.engagement_events WHERE event_type='volunteer_started'),
      'volunteer_completed', (SELECT count(DISTINCT anonymous_session_id) FROM public.engagement_events WHERE event_type='volunteer_completed')
    ),
    'language_distribution', COALESCE((
      SELECT jsonb_object_agg(coalesce(language,'unknown'), c)
      FROM (SELECT language, count(*) AS c FROM public.page_analytics GROUP BY 1) t
    ), '{}'::jsonb),
    'referrer_distribution', COALESCE((
      SELECT jsonb_object_agg(coalesce(referrer_type,'direct'), c)
      FROM (SELECT referrer_type, count(*) AS c FROM public.page_analytics GROUP BY 1) t
    ), '{}'::jsonb),
    'city_distribution', COALESCE((
      SELECT jsonb_object_agg(city, c)
      FROM (SELECT lower(trim(city)) AS city, count(*) AS c FROM public.participants
        WHERE city IS NOT NULL AND trim(city)<>'' GROUP BY 1 ORDER BY c DESC LIMIT 20) t
    ), '{}'::jsonb),
    'cohort_distribution', COALESCE((
      SELECT jsonb_object_agg(cohort::text, c)
      FROM (SELECT cohort, count(*) AS c FROM public.cohort_assignment GROUP BY 1) t
    ), '{}'::jsonb),
    'product_distribution', COALESCE((
      SELECT jsonb_object_agg(p, c)
      FROM (SELECT unnest(products) AS p, count(*) AS c FROM public.product_use GROUP BY 1 ORDER BY c DESC LIMIT 20) t
    ), '{}'::jsonb),
    'doctor_review_count', (SELECT count(*) FROM public.participants WHERE doctor_review_needed=true),
    'research_consent_count', (SELECT count(*) FROM public.consent_records WHERE consent_research=true),
    'follow_up_visits_logged', (SELECT count(*) FROM public.follow_up_visits),
    'whatsapp_clicks', (SELECT count(*) FROM public.engagement_events WHERE event_type='whatsapp_clicked'),
    'chatbot_opens', (SELECT count(*) FROM public.engagement_events WHERE event_type='chatbot_opened')
  ) INTO result;
  RETURN result;
END;
$$;