/**
 * API Route: Get Social Proof Statistics
 * GET /api/stats/social-proof
 *
 * Returns dynamic social proof statistics based on landing page view count
 * Falls back to believable numbers if analytics data is unavailable
 */

import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/client';

export async function GET(): Promise<NextResponse> {
  try {
    const supabase = createSupabaseClient();

    // Try to get actual analytics view count (fallback to quiz count if analytics not available)
    const { count, error } = await supabase
      .from('quiz_results')
      .select('*', { count: 'exact', head: true });

    // Use actual count or fallback to believable baseline
    const viewCount = count !== null ? count : 12547;

    // Calculate "customers" as 10x the view count (implying ~10% conversion)
    const fakeCustomers = viewCount * 10;

    // Round down to nearest hundred for cleaner display
    const displayNumber = Math.floor(fakeCustomers / 1000) * 100;

    // Calculate review count as ~2.3% of customers
    const reviewsCount = Math.floor(displayNumber * 0.023);

    return NextResponse.json(
      {
        customers: displayNumber,
        rating: 4.8,
        reviews: reviewsCount,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // Cache for 5 minutes
        },
      }
    );
  } catch (error) {
    console.error('[SOCIAL_PROOF_API] Error:', error);

    // Fallback: Return believable static numbers
    return NextResponse.json(
      {
        customers: 1200,
        rating: 4.8,
        reviews: 28,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60', // Shorter cache for fallback
        },
      }
    );
  }
}
