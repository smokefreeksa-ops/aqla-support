ALTER TABLE public.training_users
ADD COLUMN IF NOT EXISTS session_token text;

UPDATE public.training_users
SET session_token = encode(gen_random_bytes(24), 'hex')
WHERE session_token IS NULL;

ALTER TABLE public.training_users
ALTER COLUMN session_token SET NOT NULL,
ALTER COLUMN session_token SET DEFAULT encode(gen_random_bytes(24), 'hex');

CREATE UNIQUE INDEX IF NOT EXISTS training_users_session_token_key
ON public.training_users(session_token);