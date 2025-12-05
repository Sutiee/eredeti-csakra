-- Light Quiz System Migration
-- Adds support for the new light quiz funnel where users complete 7 questions first,
-- see a teaser result, then pay to complete the full 28-question quiz

-- Add quiz_type field to distinguish light vs full quiz results
ALTER TABLE quiz_results
ADD COLUMN IF NOT EXISTS quiz_type TEXT DEFAULT 'full' CHECK (quiz_type IN ('light', 'full'));

-- Add reference to the light result that led to this full result
ALTER TABLE quiz_results
ADD COLUMN IF NOT EXISTS light_result_id UUID REFERENCES quiz_results(id);

-- Add primary blocked chakra for teaser display (stored on light results)
ALTER TABLE quiz_results
ADD COLUMN IF NOT EXISTS primary_blocked_chakra TEXT;

-- Add light quiz scores (7 scores, one per chakra based on single question each)
ALTER TABLE quiz_results
ADD COLUMN IF NOT EXISTS light_scores JSONB;

-- Add converted flag to track if light result led to purchase
ALTER TABLE quiz_results
ADD COLUMN IF NOT EXISTS converted_to_full BOOLEAN DEFAULT FALSE;

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz_type ON quiz_results(quiz_type);
CREATE INDEX IF NOT EXISTS idx_quiz_results_light_result_id ON quiz_results(light_result_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_converted ON quiz_results(converted_to_full) WHERE quiz_type = 'light';

-- Add comments for documentation
COMMENT ON COLUMN quiz_results.quiz_type IS 'Type of quiz: light (7 questions) or full (28 questions)';
COMMENT ON COLUMN quiz_results.light_result_id IS 'Reference to the light quiz result that led to this full result (for tracking conversion)';
COMMENT ON COLUMN quiz_results.primary_blocked_chakra IS 'The most blocked chakra name, stored for teaser display';
COMMENT ON COLUMN quiz_results.light_scores IS 'Scores from light quiz (7 values, one per chakra)';
COMMENT ON COLUMN quiz_results.converted_to_full IS 'Whether this light result converted to a full quiz purchase';
