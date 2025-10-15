/**
 * Run Supabase Database Migration
 * This script creates the purchases and meditation_access tables
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('\n🚀 Starting Supabase migration...\n');

  try {
    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('quiz_results')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Connection test failed:', testError.message);
      process.exit(1);
    }

    console.log('✅ Connected to Supabase successfully\n');

    // Create purchases table
    console.log('📋 Creating purchases table...');
    const { error: purchasesError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS purchases (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          result_id UUID REFERENCES quiz_results(id) ON DELETE CASCADE,
          email TEXT NOT NULL,
          product_id TEXT NOT NULL,
          product_name TEXT NOT NULL,
          amount INTEGER NOT NULL,
          currency TEXT DEFAULT 'HUF',
          stripe_session_id TEXT UNIQUE,
          stripe_payment_intent_id TEXT,
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
          pdf_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS purchases_result_id_idx ON purchases(result_id);
        CREATE INDEX IF NOT EXISTS purchases_email_idx ON purchases(email);
        CREATE INDEX IF NOT EXISTS purchases_stripe_session_id_idx ON purchases(stripe_session_id);
        CREATE INDEX IF NOT EXISTS purchases_status_idx ON purchases(status);
        CREATE INDEX IF NOT EXISTS purchases_created_at_idx ON purchases(created_at DESC);
      `
    });

    if (purchasesError && !purchasesError.message.includes('already exists')) {
      throw purchasesError;
    }
    console.log('✅ Purchases table created\n');

    // Create meditation_access table
    console.log('📋 Creating meditation_access table...');
    const { error: meditationError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS meditation_access (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          purchase_id UUID,
          email TEXT NOT NULL,
          access_token TEXT UNIQUE NOT NULL,
          expires_at TIMESTAMP WITH TIME ZONE,
          is_active BOOLEAN DEFAULT true,
          product_type TEXT,
          access_granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          last_accessed_at TIMESTAMP WITH TIME ZONE,
          access_count INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS meditation_access_email_idx ON meditation_access(email);
        CREATE INDEX IF NOT EXISTS meditation_access_token_idx ON meditation_access(access_token);
        CREATE INDEX IF NOT EXISTS meditation_access_expires_at_idx ON meditation_access(expires_at);
      `
    });

    if (meditationError && !meditationError.message.includes('already exists')) {
      throw meditationError;
    }
    console.log('✅ Meditation access table created\n');

    // Create update trigger function
    console.log('📋 Creating update trigger...');
    const { error: triggerError } = await supabase.rpc('exec', {
      sql: `
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS update_purchases_updated_at ON purchases;
        CREATE TRIGGER update_purchases_updated_at
          BEFORE UPDATE ON purchases
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `
    });

    if (triggerError && !triggerError.message.includes('already exists')) {
      throw triggerError;
    }
    console.log('✅ Triggers created\n');

    console.log('🎉 Migration completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('Details:', error);
    process.exit(1);
  }
}

runMigration();
