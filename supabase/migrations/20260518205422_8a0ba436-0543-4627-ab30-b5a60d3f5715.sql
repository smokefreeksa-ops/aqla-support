
-- Movement Layer Phase 1 tables
CREATE TABLE public.movement_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_session_id text,
  event_type text NOT NULL,
  city text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.movement_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public insert movement_events" ON public.movement_events
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins read movement_events" ON public.movement_events
  FOR SELECT TO authenticated USING (is_admin_user(auth.uid()));

CREATE TABLE public.charter_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_session_id text,
  display_name text,
  city text,
  consent_public_display boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.charter_signatures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public insert charter_signatures" ON public.charter_signatures
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins read charter_signatures" ON public.charter_signatures
  FOR SELECT TO authenticated USING (is_admin_user(auth.uid()));

CREATE TABLE public.aqla_passport_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_session_id text NOT NULL,
  stamp_key text NOT NULL,
  source_event_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.aqla_passport_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public insert aqla_passport_events" ON public.aqla_passport_events
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins read aqla_passport_events" ON public.aqla_passport_events
  FOR SELECT TO authenticated USING (is_admin_user(auth.uid()));

CREATE INDEX idx_movement_events_created ON public.movement_events(created_at DESC);
CREATE INDEX idx_movement_events_type ON public.movement_events(event_type);
CREATE INDEX idx_passport_events_session ON public.aqla_passport_events(anonymous_session_id);
CREATE INDEX idx_charter_session ON public.charter_signatures(anonymous_session_id);

-- Aggregate public stats
CREATE OR REPLACE FUNCTION public.get_movement_public_stats()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'generated_at', now(),
    'assessments_completed', (SELECT count(*) FROM public.participants),
    'quit_pledges', (SELECT count(*) FROM public.challenge_events WHERE event_type IN ('quit_pledge','supporter_pledge')),
    'charter_signatures', (SELECT count(*) FROM public.charter_signatures),
    'posters_created', (SELECT count(*) FROM public.poster_creations),
    'quizzes_completed', (SELECT count(*) FROM public.quiz_attempts),
    'volunteers_started_training', (SELECT count(*) FROM public.training_users),
    'cities_participating', (SELECT count(*) FROM (
      SELECT lower(trim(city)) AS c FROM public.participants
      WHERE city IS NOT NULL AND trim(city) <> ''
      GROUP BY 1 HAVING count(*) >= 5
    ) t),
    'whatsapp_x_shares', (SELECT count(*) FROM public.challenge_events WHERE event_type IN ('share_whatsapp','share_x'))
      + (SELECT count(*) FROM public.poster_events WHERE event_type IN ('poster_shared_whatsapp','poster_shared_x'))
      + (SELECT count(*) FROM public.movement_events WHERE event_type IN ('movement_share_whatsapp','movement_share_x')),
    'estimated_savings_sar', COALESCE((SELECT sum(value_numeric) FROM public.challenge_events
      WHERE challenge_type='save_it' AND event_type='calculation_completed'), 0)
  ) INTO result;
  RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_aqla_index()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  pledges int; tools int; quizzes int; posters int; vol int; assessments int; movement int;
  raw numeric; idx int;
BEGIN
  SELECT count(*) INTO pledges FROM public.challenge_events
    WHERE event_type IN ('quit_pledge','supporter_pledge') AND created_at > now() - interval '24 hours';
  SELECT count(*) INTO tools FROM public.challenge_events
    WHERE challenge_type IN ('save_it','trigger_battle','first_step') AND created_at > now() - interval '24 hours';
  SELECT count(*) INTO quizzes FROM public.quiz_attempts WHERE created_at > now() - interval '24 hours';
  SELECT count(*) INTO posters FROM public.poster_creations WHERE created_at > now() - interval '24 hours';
  SELECT count(*) INTO vol FROM public.training_users WHERE created_at > now() - interval '24 hours';
  SELECT count(*) INTO assessments FROM public.participants WHERE created_at > now() - interval '24 hours';
  SELECT count(*) INTO movement FROM public.movement_events WHERE created_at > now() - interval '24 hours';

  raw := (pledges*3) + (assessments*4) + (vol*3) + (posters*2) + (quizzes*2) + (tools*1) + (movement*1);
  idx := LEAST(1000, raw::int);
  RETURN jsonb_build_object(
    'generated_at', now(),
    'index', idx,
    'window_hours', 24,
    'breakdown', jsonb_build_object(
      'pledges', pledges, 'tool_uses', tools, 'quizzes', quizzes,
      'posters', posters, 'volunteer_starts', vol, 'assessments', assessments,
      'movement_events', movement
    )
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_passport_summary_for_session(p_session text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE result jsonb;
BEGIN
  IF p_session IS NULL OR length(trim(p_session)) < 4 THEN
    RETURN jsonb_build_object('stamps', '[]'::jsonb, 'count', 0);
  END IF;
  SELECT jsonb_build_object(
    'stamps', COALESCE(jsonb_agg(DISTINCT stamp_key), '[]'::jsonb),
    'count', count(DISTINCT stamp_key)
  ) INTO result FROM public.aqla_passport_events WHERE anonymous_session_id = p_session;
  RETURN result;
END;
$function$;
