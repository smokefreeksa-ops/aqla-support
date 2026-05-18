
-- =========================================
-- AQLA LEARN — Educational Hub schema
-- =========================================

CREATE TABLE IF NOT EXISTS public.educational_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title_ar text NOT NULL,
  title_en text NOT NULL,
  description_ar text,
  description_en text,
  content_ar text,
  content_en text,
  source_links jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.educational_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read active modules"
  ON public.educational_modules FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "admins manage modules insert"
  ON public.educational_modules FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "admins manage modules update"
  ON public.educational_modules FOR UPDATE
  TO authenticated
  USING (public.is_admin_user(auth.uid()));

-- ----------------------------------------

CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.educational_modules(id) ON DELETE CASCADE,
  question_ar text NOT NULL,
  question_en text NOT NULL,
  options_ar jsonb NOT NULL,
  options_en jsonb NOT NULL,
  correct_option_index integer NOT NULL,
  explanation_ar text,
  explanation_en text,
  difficulty text NOT NULL DEFAULT 'easy',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read active questions"
  ON public.quiz_questions FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "admins manage questions insert"
  ON public.quiz_questions FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "admins manage questions update"
  ON public.quiz_questions FOR UPDATE
  TO authenticated
  USING (public.is_admin_user(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_quiz_questions_module ON public.quiz_questions(module_id);

-- ----------------------------------------

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_session_id text,
  module_id uuid REFERENCES public.educational_modules(id) ON DELETE SET NULL,
  module_slug text,
  score integer NOT NULL,
  total_questions integer NOT NULL,
  correct_answers integer NOT NULL,
  duration_seconds integer,
  city text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public insert quiz_attempts"
  ON public.quiz_attempts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "admins read quiz_attempts"
  ON public.quiz_attempts FOR SELECT
  TO authenticated
  USING (public.is_admin_user(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_module ON public.quiz_attempts(module_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_created ON public.quiz_attempts(created_at);

-- ----------------------------------------

CREATE TABLE IF NOT EXISTS public.leaderboard_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_attempt_id uuid REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
  module_slug text,
  display_name text,
  social_handle text,
  city text,
  score integer NOT NULL,
  duration_seconds integer,
  badge text,
  consent_public_display boolean NOT NULL DEFAULT false,
  consent_social_tag boolean NOT NULL DEFAULT false,
  is_under_18 boolean NOT NULL DEFAULT false,
  is_approved boolean NOT NULL DEFAULT false,
  is_hidden boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public insert leaderboard_entries"
  ON public.leaderboard_entries FOR INSERT
  TO anon, authenticated
  WITH CHECK (consent_public_display = true);

CREATE POLICY "admins read leaderboard_entries"
  ON public.leaderboard_entries FOR SELECT
  TO authenticated
  USING (public.is_admin_user(auth.uid()));

CREATE POLICY "admins update leaderboard_entries"
  ON public.leaderboard_entries FOR UPDATE
  TO authenticated
  USING (public.is_admin_user(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON public.leaderboard_entries(score DESC, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_created ON public.leaderboard_entries(created_at);

-- =========================================
-- Public top 7 leaderboard (aggregate)
-- =========================================

CREATE OR REPLACE FUNCTION public.get_learn_top_leaderboard(p_window text DEFAULT 'all', p_city text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  cutoff timestamptz;
BEGIN
  IF p_window = 'week' THEN
    cutoff := date_trunc('week', now());
  ELSE
    cutoff := 'epoch'::timestamptz;
  END IF;

  WITH ranked AS (
    SELECT
      le.display_name,
      CASE
        WHEN le.is_under_18 = true THEN NULL
        WHEN le.consent_social_tag = true AND le.is_approved = true THEN le.social_handle
        ELSE NULL
      END AS social_handle,
      le.city,
      le.score,
      le.duration_seconds,
      le.badge,
      le.module_slug,
      le.created_at,
      ROW_NUMBER() OVER (ORDER BY le.score DESC, COALESCE(le.duration_seconds, 999999) ASC, le.created_at ASC) AS rnk
    FROM public.leaderboard_entries le
    WHERE le.consent_public_display = true
      AND le.is_approved = true
      AND le.is_hidden = false
      AND le.created_at >= cutoff
      AND (p_city IS NULL OR lower(trim(le.city)) = lower(trim(p_city)))
  )
  SELECT jsonb_build_object(
    'generated_at', now(),
    'window', p_window,
    'city_filter', p_city,
    'entries', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'rank', rnk,
        'display_name', display_name,
        'social_handle', social_handle,
        'city', city,
        'score', score,
        'duration_seconds', duration_seconds,
        'badge', badge,
        'module_slug', module_slug,
        'date', created_at::date
      ) ORDER BY rnk)
      FROM ranked WHERE rnk <= 7
    ), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;

-- =========================================
-- Public learn KPIs
-- =========================================

CREATE OR REPLACE FUNCTION public.get_learn_public_stats()
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
    'participants', (SELECT count(DISTINCT anonymous_session_id) FROM public.quiz_attempts WHERE anonymous_session_id IS NOT NULL),
    'completed_quizzes', (SELECT count(*) FROM public.quiz_attempts),
    'average_score',
      COALESCE((SELECT round(avg(score)::numeric, 1) FROM public.quiz_attempts), 0),
    'badges_earned', (SELECT count(*) FROM public.leaderboard_entries WHERE badge IS NOT NULL),
    'top_city_week', (
      SELECT lower(trim(city)) FROM public.quiz_attempts
      WHERE city IS NOT NULL AND trim(city) <> ''
        AND created_at >= date_trunc('week', now())
      GROUP BY 1
      HAVING count(*) >= 5
      ORDER BY count(*) DESC LIMIT 1
    ),
    'most_attempted_module', (
      SELECT module_slug FROM public.quiz_attempts
      WHERE module_slug IS NOT NULL
      GROUP BY 1 ORDER BY count(*) DESC LIMIT 1
    )
  ) INTO result;
  RETURN result;
END;
$$;

-- =========================================
-- Admin learn analytics
-- =========================================

CREATE OR REPLACE FUNCTION public.get_admin_learn_analytics()
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
    'total_attempts', (SELECT count(*) FROM public.quiz_attempts),
    'unique_participants', (SELECT count(DISTINCT anonymous_session_id) FROM public.quiz_attempts WHERE anonymous_session_id IS NOT NULL),
    'average_score', COALESCE((SELECT round(avg(score)::numeric, 1) FROM public.quiz_attempts), 0),
    'completion_rate', 100,
    'attempts_by_module', COALESCE((
      SELECT jsonb_object_agg(module_slug, c)
      FROM (SELECT module_slug, count(*) AS c FROM public.quiz_attempts WHERE module_slug IS NOT NULL GROUP BY 1) t
    ), '{}'::jsonb),
    'avg_score_by_module', COALESCE((
      SELECT jsonb_object_agg(module_slug, avg_score)
      FROM (SELECT module_slug, round(avg(score)::numeric, 1) AS avg_score FROM public.quiz_attempts WHERE module_slug IS NOT NULL GROUP BY 1) t
    ), '{}'::jsonb),
    'city_leaderboard', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('city', city, 'attempts', c, 'avg_score', avg_score) ORDER BY c DESC)
      FROM (
        SELECT lower(trim(city)) AS city, count(*) AS c, round(avg(score)::numeric, 1) AS avg_score
        FROM public.quiz_attempts
        WHERE city IS NOT NULL AND trim(city) <> ''
        GROUP BY 1 HAVING count(*) >= 5
        ORDER BY c DESC LIMIT 20
      ) t
    ), '[]'::jsonb),
    'pending_leaderboard', (SELECT count(*) FROM public.leaderboard_entries WHERE is_approved = false AND is_hidden = false),
    'approved_leaderboard', (SELECT count(*) FROM public.leaderboard_entries WHERE is_approved = true AND is_hidden = false),
    'hidden_leaderboard', (SELECT count(*) FROM public.leaderboard_entries WHERE is_hidden = true),
    'attempts_by_day', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('day', d, 'attempts', c) ORDER BY d)
      FROM (SELECT created_at::date AS d, count(*) AS c FROM public.quiz_attempts
            WHERE created_at > now() - interval '30 days' GROUP BY 1) t
    ), '[]'::jsonb)
  ) INTO result;
  RETURN result;
END;
$$;

-- =========================================
-- Admin: list leaderboard entries for moderation
-- =========================================

CREATE OR REPLACE FUNCTION public.admin_list_leaderboard(p_status text DEFAULT 'pending')
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

  SELECT jsonb_agg(jsonb_build_object(
    'id', id,
    'display_name', display_name,
    'social_handle', social_handle,
    'city', city,
    'score', score,
    'badge', badge,
    'module_slug', module_slug,
    'consent_public_display', consent_public_display,
    'consent_social_tag', consent_social_tag,
    'is_under_18', is_under_18,
    'is_approved', is_approved,
    'is_hidden', is_hidden,
    'created_at', created_at
  ) ORDER BY created_at DESC)
  INTO result
  FROM public.leaderboard_entries
  WHERE
    (p_status = 'pending' AND is_approved = false AND is_hidden = false)
    OR (p_status = 'approved' AND is_approved = true AND is_hidden = false)
    OR (p_status = 'hidden' AND is_hidden = true)
    OR (p_status = 'all');

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;
