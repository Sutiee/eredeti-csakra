-- ============================================
-- Eredeti Csakra - Database Schema
-- Phase 2: Supabase Backend Setup
-- ============================================

-- Drop existing table if exists (for development)
-- DROP TABLE IF EXISTS quiz_results;

-- Main quiz results table
CREATE TABLE quiz_results (
  -- Primary key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- User information
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  age INTEGER CHECK (age IS NULL OR (age >= 16 AND age <= 99)),

  -- Quiz data (stored as JSONB for flexibility)
  answers JSONB NOT NULL,
  -- Structure: [1, 2, 3, 4, ...] (28 numbers, 1-4 scale)

  chakra_scores JSONB NOT NULL,
  -- Structure: { "Gyökércsakra": 12, "Szakrális csakra": 14, ... } (7 chakras with scores 4-16)

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- Indexes for Performance
-- ============================================

-- Index for email lookup (finding existing user results)
CREATE INDEX quiz_results_email_idx ON quiz_results(email);

-- Index for recent results (admin dashboard, analytics)
CREATE INDEX quiz_results_created_at_idx ON quiz_results(created_at DESC);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on the table
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert new quiz results (public quiz)
CREATE POLICY "Anyone can insert quiz results"
ON quiz_results
FOR INSERT
WITH CHECK (true);

-- Policy: Anyone can read their own results by ID (for result page)
CREATE POLICY "Anyone can view quiz results"
ON quiz_results
FOR SELECT
USING (true);

-- ============================================
-- Trigger for updated_at
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_quiz_results_updated_at
BEFORE UPDATE ON quiz_results
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Comments for Documentation
-- ============================================

COMMENT ON TABLE quiz_results IS 'Stores completed chakra quiz results with user info and scores';
COMMENT ON COLUMN quiz_results.answers IS 'JSONB array with 28 scores (1-4)';
COMMENT ON COLUMN quiz_results.chakra_scores IS 'JSONB object with chakra name as key and total score (4-16) as value';
