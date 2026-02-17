-- SQL Schema for user_psychometrics table in Supabase
-- This table stores psychometric test results for users

CREATE TABLE IF NOT EXISTS public.user_psychometrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL, -- e.g., 'HEXACO', 'BIG_FIVE', 'DARK_TRIAD'
  test_id TEXT NOT NULL, -- specific test identifier
  raw_scores JSONB NOT NULL, -- dimension scores (1-5 scale)
  percentile_scores JSONB, -- percentile scores (0-100 scale)
  raw_answers JSONB NOT NULL, -- all user responses
  report JSONB, -- full report with interpretations
  completed_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_psychometrics_user_id 
  ON public.user_psychometrics(user_id);

CREATE INDEX IF NOT EXISTS idx_user_psychometrics_test_type 
  ON public.user_psychometrics(test_type);

CREATE INDEX IF NOT EXISTS idx_user_psychometrics_completed_at 
  ON public.user_psychometrics(completed_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_psychometrics ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own test results
CREATE POLICY "Users can view own psychometric results" 
  ON public.user_psychometrics
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own test results
CREATE POLICY "Users can insert own psychometric results" 
  ON public.user_psychometrics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own test results (if needed for retakes)
CREATE POLICY "Users can update own psychometric results" 
  ON public.user_psychometrics
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Optional: Policy for admins to view all results (uncomment if needed)
-- CREATE POLICY "Admins can view all psychometric results" 
--   ON public.user_psychometrics
--   FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM auth.users 
--       WHERE auth.users.id = auth.uid() 
--       AND auth.users.raw_app_meta_data->>'role' = 'admin'
--     )
--   );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_psychometrics_updated_at
  BEFORE UPDATE ON public.user_psychometrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (anon and authenticated roles)
GRANT SELECT, INSERT ON public.user_psychometrics TO authenticated;

COMMENT ON TABLE public.user_psychometrics IS 'Stores psychometric test results for authenticated users';
COMMENT ON COLUMN public.user_psychometrics.test_type IS 'Type of psychometric test (HEXACO, BIG_FIVE, etc.)';
COMMENT ON COLUMN public.user_psychometrics.raw_scores IS 'Dimension scores on 1-5 scale stored as JSON';
COMMENT ON COLUMN public.user_psychometrics.percentile_scores IS 'Percentile scores on 0-100 scale for visualization';
COMMENT ON COLUMN public.user_psychometrics.raw_answers IS 'All user responses stored as JSON';
COMMENT ON COLUMN public.user_psychometrics.report IS 'Full report with interpretations stored as JSON';
