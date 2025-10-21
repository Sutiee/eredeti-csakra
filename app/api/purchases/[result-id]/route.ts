/**
 * GET /api/purchases/[result-id]
 * Fetch all purchases for a given result_id
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/client';

// Disable caching for this endpoint
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: { 'result-id': string } }
): Promise<NextResponse> {
  try {
    const resultId = params['result-id'];

    if (!resultId) {
      return NextResponse.json(
        { error: 'Missing result_id parameter' },
        { status: 400 }
      );
    }

    console.log('[GET /api/purchases] Fetching purchases for result_id:', resultId);

    const supabase = createSupabaseClient();

    // Fetch all purchases for this result_id, ordered by creation date
    const { data: purchases, error } = await supabase
      .from('purchases')
      .select('id, product_id, product_name, amount, currency, pdf_url, created_at, status')
      .eq('result_id', resultId)
      .eq('status', 'completed') // Only show completed purchases
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[GET /api/purchases] Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch purchases from database' },
        { status: 500 }
      );
    }

    console.log('[GET /api/purchases] Found', purchases?.length || 0, 'purchases');

    return NextResponse.json(
      {
        data: purchases || [],
        error: null,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    console.error('[GET /api/purchases] Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
