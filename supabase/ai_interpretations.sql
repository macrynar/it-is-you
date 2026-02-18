-- Table: ai_interpretations
-- Stores LLM-generated interpretations of psychometric test results
-- One interpretation per user per test type (cached / regenerable)

CREATE TABLE IF NOT EXISTS public.ai_interpretations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL,          -- 'HEXACO', 'ENNEAGRAM', 'DARK_TRIAD', etc.
  interpretation TEXT NOT NULL,     -- full LLM-generated text
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, test_type)        -- one cached result per user per test
);

CREATE INDEX IF NOT EXISTS idx_ai_interpretations_user_id
  ON public.ai_interpretations(user_id);

-- RLS
ALTER TABLE public.ai_interpretations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own interpretations"
  ON public.ai_interpretations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interpretations"
  ON public.ai_interpretations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interpretations"
  ON public.ai_interpretations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- updated_at trigger (reuse function from schema.sql)
CREATE TRIGGER update_ai_interpretations_updated_at
  BEFORE UPDATE ON public.ai_interpretations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

GRANT SELECT, INSERT, UPDATE ON public.ai_interpretations TO authenticated;

COMMENT ON TABLE public.ai_interpretations IS 'Cached LLM interpretations of psychometric test results';
