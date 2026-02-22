ALTER TABLE public.ai_interpretations
  ADD COLUMN IF NOT EXISTS prompt_version INTEGER NOT NULL DEFAULT 1;

ALTER TABLE public.ai_interpretations
  DROP CONSTRAINT IF EXISTS ai_interpretations_user_id_test_type_key;

ALTER TABLE public.ai_interpretations
  ADD CONSTRAINT ai_interpretations_user_id_test_type_prompt_version_key
  UNIQUE (user_id, test_type, prompt_version);

COMMENT ON COLUMN public.ai_interpretations.prompt_version IS 'Prompt version used for cache invalidation';
