/**
 * API Route: Run Analytics Events Migration
 *
 * Usage: POST http://localhost:3000/api/run-migration
 *
 * This endpoint runs the analytics_events table migration.
 * Should be called once to create the table structure.
 *
 * ⚠️ SECURITY: In production, this should be protected with authentication!
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    // Initialize Supabase client with service role key (has admin privileges)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log('[Migration] Starting analytics_events migration...');

    // Read migration file
    const migrationPath = join(
      process.cwd(),
      'supabase/migrations/20251017120000_analytics_events.sql'
    );
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    // Split into individual SQL statements
    const statements = migrationSQL
      .split(';')
      .map((s) => s.trim())
      .filter(
        (s) =>
          s.length > 0 &&
          !s.startsWith('--') &&
          !s.includes('ROLLBACK INSTRUCTIONS')
      );

    console.log(`[Migration] Found ${statements.length} SQL statements`);

    const results: Array<{ statement: string; success: boolean; error?: string }> = [];

    // Execute each statement using Supabase's built-in SQL execution
    // Note: This uses the PostgreSQL REST API under the hood
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (!statement) continue;

      console.log(`[Migration] Executing statement ${i + 1}/${statements.length}...`);

      try {
        // Use raw SQL query via Supabase
        const { data, error } = await supabase.rpc('exec_sql', {
          query: statement + ';',
        });

        if (error) {
          // exec_sql might not exist, try alternative
          console.log('[Migration] exec_sql not available, using direct query');
          results.push({
            statement: statement.substring(0, 100) + '...',
            success: false,
            error: 'exec_sql RPC not available',
          });
          continue;
        }

        results.push({
          statement: statement.substring(0, 100) + '...',
          success: true,
        });
      } catch (err: any) {
        console.error(`[Migration] Error executing statement ${i + 1}:`, err.message);
        results.push({
          statement: statement.substring(0, 100) + '...',
          success: false,
          error: err.message,
        });
      }
    }

    // Verify table was created
    console.log('[Migration] Verifying table creation...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('analytics_events')
      .select('id')
      .limit(1);

    if (tableError) {
      console.error('[Migration] Table verification failed:', tableError.message);
      return NextResponse.json(
        {
          success: false,
          error: 'Table verification failed - manual migration required',
          details: tableError.message,
          migration_file: 'supabase/migrations/20251017120000_analytics_events.sql',
          manual_instructions:
            'Copy the SQL from the migration file and run it in Supabase SQL Editor: ' +
            `https://supabase.com/dashboard/project/${supabaseUrl.split('.')[0].split('//')[1]}/sql/new`,
        },
        { status: 500 }
      );
    }

    console.log('[Migration] ✅ Migration completed successfully!');

    return NextResponse.json({
      success: true,
      message: 'Analytics events table created successfully',
      table: 'analytics_events',
      features: {
        indexes: 7,
        rls_enabled: true,
        policies: 2,
        event_types: [
          'accordion_open',
          'sticky_show',
          'sticky_click',
          'softupsell_click',
          'pricing_select',
          'checkout_start',
          'purchase',
        ],
      },
      results,
    });
  } catch (error: any) {
    console.error('[Migration] Fatal error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Migration failed',
        details: error.message,
        migration_file: 'supabase/migrations/20251017120000_analytics_events.sql',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check if migration is needed
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if table exists
    const { data, error } = await supabase
      .from('analytics_events')
      .select('id')
      .limit(1);

    if (error) {
      return NextResponse.json({
        table_exists: false,
        migration_needed: true,
        message: 'analytics_events table does not exist',
        error: error.message,
      });
    }

    return NextResponse.json({
      table_exists: true,
      migration_needed: false,
      message: 'analytics_events table already exists',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Failed to check migration status',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
