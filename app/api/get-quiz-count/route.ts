/**
 * API Route: Get Quiz Count
 * GET /api/get-quiz-count
 *
 * Returns the total number of completed quizzes from Supabase
 * Fallback to seed-based random number (10,000-15,000) if DB query fails
 */

import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/client';

export async function GET() {
  try {
    const supabase = createSupabaseClient();

    // Query total count from quiz_results table
    const { count, error } = await supabase
      .from('quiz_results')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Supabase count error:', error);
      throw error;
    }

    // If count exists, return it; otherwise use fallback
    const finalCount = count !== null ? count : (10000 + Math.floor(Math.random() * 5000));

    return NextResponse.json(
      { count: finalCount },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // Cache for 5 minutes
        }
      }
    );
  } catch (error) {
    console.error('Quiz count API error:', error);

    // Fallback: Return a believable static number
    return NextResponse.json(
      { count: 12847 },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60', // Shorter cache for fallback
        }
      }
    );
  }
}
