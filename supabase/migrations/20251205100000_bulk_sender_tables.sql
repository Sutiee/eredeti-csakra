-- ============================================
-- Bulk Email Sender Tables
-- Migration for eredeticsakra.hu/bulk-sender
-- ============================================

-- Bulk Sender Settings (single row for config)
CREATE TABLE IF NOT EXISTS bulk_sender_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    resend_api_key TEXT, -- Encrypted API key
    from_email TEXT,
    from_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bulk Sender Unsubscribes
CREATE TABLE IF NOT EXISTS bulk_sender_unsubscribes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bulk_sender_unsubscribes_email
ON bulk_sender_unsubscribes(email);

-- Bulk Sender Email Templates
CREATE TABLE IF NOT EXISTS bulk_sender_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    html_content TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bulk_sender_templates_name
ON bulk_sender_templates(name);

-- Bulk Sender History
CREATE TABLE IF NOT EXISTS bulk_sender_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject TEXT NOT NULL,
    recipient_count INTEGER NOT NULL,
    sent_count INTEGER NOT NULL,
    failed_count INTEGER NOT NULL,
    skipped_count INTEGER DEFAULT 0,
    status TEXT NOT NULL, -- 'completed' | 'partial' | 'failed' | 'stopped'
    template_id UUID REFERENCES bulk_sender_templates(id) ON DELETE SET NULL,
    error_log JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bulk_sender_history_created_at
ON bulk_sender_history(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bulk_sender_history_status
ON bulk_sender_history(status);

-- Updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_bulk_sender_settings_updated_at ON bulk_sender_settings;
CREATE TRIGGER update_bulk_sender_settings_updated_at
    BEFORE UPDATE ON bulk_sender_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bulk_sender_templates_updated_at ON bulk_sender_templates;
CREATE TRIGGER update_bulk_sender_templates_updated_at
    BEFORE UPDATE ON bulk_sender_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings row
INSERT INTO bulk_sender_settings (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;
