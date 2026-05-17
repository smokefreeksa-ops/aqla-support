ALTER TABLE public.participants
  ALTER COLUMN participant_code
  SET DEFAULT ('AQ-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)));