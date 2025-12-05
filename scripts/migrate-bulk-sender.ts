import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env from .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrate() {
  console.log('Starting Bulk Sender migration...');
  console.log('Supabase URL:', supabaseUrl);

  // Create bulk_sender_settings table
  console.log('\n1. Creating bulk_sender_settings table...');
  const { error: settingsError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS bulk_sender_settings (
        id TEXT PRIMARY KEY DEFAULT 'default',
        resend_api_key TEXT,
        from_email TEXT,
        from_name TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      INSERT INTO bulk_sender_settings (id)
      VALUES ('default')
      ON CONFLICT (id) DO NOTHING;
    `
  });

  if (settingsError) {
    // Try direct SQL via REST API
    console.log('RPC not available, trying direct table creation...');
  }

  // Let's try creating tables one by one using the Supabase REST API
  // First check if tables exist

  const { data: existingTables, error: tablesError } = await supabase
    .from('bulk_sender_settings')
    .select('id')
    .limit(1);

  if (tablesError && tablesError.code === '42P01') {
    console.log('Tables do not exist. Please run this SQL in Supabase Dashboard SQL Editor:');
    console.log('\n--- COPY THIS SQL ---\n');
    console.log(`
-- Bulk Email Sender Tables

-- Settings table
CREATE TABLE IF NOT EXISTS bulk_sender_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    resend_api_key TEXT,
    from_email TEXT,
    from_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unsubscribes table
CREATE TABLE IF NOT EXISTS bulk_sender_unsubscribes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bulk_sender_unsubscribes_email
ON bulk_sender_unsubscribes(email);

-- Templates table
CREATE TABLE IF NOT EXISTS bulk_sender_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    html_content TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- History table
CREATE TABLE IF NOT EXISTS bulk_sender_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject TEXT NOT NULL,
    recipient_count INTEGER NOT NULL,
    sent_count INTEGER NOT NULL,
    failed_count INTEGER NOT NULL,
    skipped_count INTEGER DEFAULT 0,
    status TEXT NOT NULL,
    template_id UUID REFERENCES bulk_sender_templates(id) ON DELETE SET NULL,
    error_log JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bulk_sender_history_created_at
ON bulk_sender_history(created_at DESC);

-- Insert default settings
INSERT INTO bulk_sender_settings (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;
    `);
    console.log('\n--- END SQL ---\n');
  } else if (!tablesError) {
    console.log('✓ bulk_sender_settings table already exists');
  }

  // Check other tables
  const tables = ['bulk_sender_unsubscribes', 'bulk_sender_templates', 'bulk_sender_history'];

  for (const table of tables) {
    const { error } = await supabase.from(table).select('id').limit(1);
    if (!error) {
      console.log(`✓ ${table} table exists`);
    } else if (error.code === '42P01') {
      console.log(`✗ ${table} table does not exist`);
    }
  }

  console.log('\nMigration check complete.');
}

migrate().catch(console.error);
