-- CLEAN INSTALL: First, drop existing table if it exists
-- This ensures we start fresh without column conflicts

DROP TABLE IF EXISTS public.user_psychometrics CASCADE;

-- Create user_psychometrics table from scratch
CREATE TABLE public.user_psychometrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL,
  test_id TEXT NOT NULL,
  raw_scores JSONB NOT NULL,
  percentile_scores JSONB,
  raw_answers JSONB NOT NULL,
  report JSONB,
  completed_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_user_psychometrics_user_id 
  ON public.user_psychometrics(user_id);

CREATE INDEX idx_user_psychometrics_test_type 
  ON public.user_psychometrics(test_type);

CREATE INDEX idx_user_psychometrics_completed_at 
  ON public.user_psychometrics(completed_at DESC);

-- Enable Row Level Security
ALTER TABLE public.user_psychometrics ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view own results
CREATE POLICY "Users can view own psychometric results" 
  ON public.user_psychometrics
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert own results
CREATE POLICY "Users can insert own psychometric results" 
  ON public.user_psychometrics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update own results
CREATE POLICY "Users can update own psychometric results" 
  ON public.user_psychometrics
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_user_psychometrics_updated_at
  BEFORE UPDATE ON public.user_psychometrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.user_psychometrics TO authenticated;

-- Add table and column comments
COMMENT ON TABLE public.user_psychometrics IS 'Stores psychometric test results for authenticated users';
COMMENT ON COLUMN public.user_psychometrics.test_type IS 'Type of psychometric test (HEXACO, BIG_FIVE, etc.)';
COMMENT ON COLUMN public.user_psychometrics.raw_scores IS 'Dimension scores on 1-5 scale stored as JSON';
COMMENT ON COLUMN public.user_psychometrics.percentile_scores IS 'Percentile scores on 0-100 scale for visualization';
COMMENT ON COLUMN public.user_psychometrics.raw_answers IS 'All user responses stored as JSON';
COMMENT ON COLUMN public.user_psychometrics.report IS 'Full report with interpretations stored as JSON';
COMMENT ON COLUMN public.user_psychometrics.completed_at IS 'Timestamp when test was completed';
