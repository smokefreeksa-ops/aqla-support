
CREATE TABLE IF NOT EXISTS public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path text NOT NULL,
  visit_date date NOT NULL DEFAULT CURRENT_DATE,
  anonymous_session_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_views_visit_date ON public.page_views(visit_date);
CREATE INDEX IF NOT EXISTS idx_page_views_session ON public.page_views(anonymous_session_hash, page_path, visit_date);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public can insert page_views"
  ON public.page_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- No SELECT/UPDATE/DELETE policies => raw rows are not readable by public or authenticated users.

CREATE OR REPLACE FUNCTION public.get_public_impact_stats()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_visits', (SELECT count(*) FROM public.page_views),
    'visits_today', (SELECT count(*) FROM public.page_views WHERE visit_date = CURRENT_DATE),
    'total_assessments', (SELECT count(*) FROM public.participants),
    'support_pathway_count', (SELECT count(*) FROM public.cohort_assignment
      WHERE cohort::text IN ('quit_now','quit_prepare','reduce_first','discuss_alternatives','not_ready_score')),
    'doctor_review_count', (SELECT count(*) FROM public.participants WHERE doctor_review_needed = true),
    'volunteer_applicants', (SELECT count(*) FROM public.volunteer_applications),
    'cities_represented', (SELECT count(DISTINCT lower(trim(city))) FROM public.participants WHERE city IS NOT NULL AND trim(city) <> ''),
    'follow_up_visits_logged', (SELECT count(*) FROM public.follow_up_visits),
    'research_consent_count', (SELECT count(*) FROM public.consent_records WHERE consent_research = true)
  ) INTO result;
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_impact_stats() TO anon, authenticated;
