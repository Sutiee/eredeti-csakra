-- Email Jobs Queue System for Background Processing
-- Enables sending 30,000+ emails with 10 second delays between batches

-- Main job table - one record per email campaign
CREATE TABLE IF NOT EXISTS bulk_sender_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject TEXT NOT NULL,
    html_content TEXT NOT NULL,
    total_recipients INTEGER NOT NULL DEFAULT 0,
    sent_count INTEGER NOT NULL DEFAULT 0,
    failed_count INTEGER NOT NULL DEFAULT 0,
    skipped_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paused', 'completed', 'failed')),
    current_batch INTEGER NOT NULL DEFAULT 0,
    total_batches INTEGER NOT NULL DEFAULT 0,
    batch_size INTEGER NOT NULL DEFAULT 100,
    delay_between_batches_ms INTEGER NOT NULL DEFAULT 10000, -- 10 seconds
    error_log JSONB,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Recipients table - tracks individual email status
CREATE TABLE IF NOT EXISTS bulk_sender_job_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES bulk_sender_jobs(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    batch_number INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_bulk_sender_jobs_status ON bulk_sender_jobs(status);
CREATE INDEX IF NOT EXISTS idx_bulk_sender_job_recipients_job_id ON bulk_sender_job_recipients(job_id);
CREATE INDEX IF NOT EXISTS idx_bulk_sender_job_recipients_status ON bulk_sender_job_recipients(status);
CREATE INDEX IF NOT EXISTS idx_bulk_sender_job_recipients_batch ON bulk_sender_job_recipients(job_id, batch_number);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_bulk_sender_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_bulk_sender_jobs_updated_at ON bulk_sender_jobs;
CREATE TRIGGER trigger_bulk_sender_jobs_updated_at
    BEFORE UPDATE ON bulk_sender_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_bulk_sender_jobs_updated_at();

-- RLS policies
ALTER TABLE bulk_sender_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_sender_job_recipients ENABLE ROW LEVEL SECURITY;

-- Allow all operations (protected by API authentication)
DROP POLICY IF EXISTS "Allow all operations on bulk_sender_jobs" ON bulk_sender_jobs;
CREATE POLICY "Allow all operations on bulk_sender_jobs" ON bulk_sender_jobs
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on bulk_sender_job_recipients" ON bulk_sender_job_recipients;
CREATE POLICY "Allow all operations on bulk_sender_job_recipients" ON bulk_sender_job_recipients
    FOR ALL USING (true) WITH CHECK (true);

-- Function to get next batch to process
CREATE OR REPLACE FUNCTION get_next_batch_to_process(p_job_id UUID)
RETURNS TABLE (
    recipient_id UUID,
    email TEXT,
    name TEXT,
    batch_number INTEGER
) AS $$
DECLARE
    v_next_batch INTEGER;
BEGIN
    -- Get the next pending batch number
    SELECT MIN(r.batch_number) INTO v_next_batch
    FROM bulk_sender_job_recipients r
    WHERE r.job_id = p_job_id AND r.status = 'pending';

    IF v_next_batch IS NULL THEN
        RETURN;
    END IF;

    -- Return all recipients in that batch
    RETURN QUERY
    SELECT r.id, r.email, r.name, r.batch_number
    FROM bulk_sender_job_recipients r
    WHERE r.job_id = p_job_id
      AND r.batch_number = v_next_batch
      AND r.status = 'pending';
END;
$$ LANGUAGE plpgsql;
