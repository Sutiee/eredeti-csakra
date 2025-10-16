/**
 * GET /api/admin/users/[id]
 * Fetch detailed information for a specific user
 */

import { NextRequest, NextResponse } from 'next/server';
import { protectAdminRoute } from '@/lib/admin/middleware';
import { createSupabaseClient } from '@/lib/supabase/client';
import { logger } from '@/lib/utils/logger';
import { UserDetail } from '@/types/admin-users';

/**
 * GET handler for user detail
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Protect route - require admin authentication
  const authError = await protectAdminRoute(request);
  if (authError) return authError;

  const { id } = params;

  try {
    logger.debug('Fetching user detail', {
      context: 'GET /api/admin/users/[id]',
      data: { id },
    });

    const supabase = createSupabaseClient();

    // Fetch user basic info from quiz_results
    const { data: quizResult, error: userError } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', id)
      .single();

    if (userError) {
      if (userError.code === 'PGRST116') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      throw userError;
    }

    if (!quizResult) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const email = quizResult.email;

    // Fetch purchases
    const { data: purchases, error: purchaseError } = await supabase
      .from('purchases')
      .select('id, product_name, amount, status, created_at')
      .eq('email', email)
      .order('created_at', { ascending: false });

    if (purchaseError) {
      logger.warn('Failed to fetch purchases', {
        context: 'GET /api/admin/users/[id]',
        error: purchaseError,
      });
    }

    // Fetch sessions
    const { data: sessions, error: sessionError } = await supabase
      .from('quiz_sessions')
      .select('session_id, started_at, completed_at, current_question_index')
      .eq('email', email)
      .order('started_at', { ascending: false });

    if (sessionError) {
      logger.warn('Failed to fetch sessions', {
        context: 'GET /api/admin/users/[id]',
        error: sessionError,
      });
    }

    // Build user detail response
    const userDetail: UserDetail = {
      id: quizResult.id,
      name: quizResult.name,
      email: quizResult.email,
      age: quizResult.age,
      createdAt: quizResult.created_at,
      quiz: {
        answers: (quizResult.answers as number[]) || [],
        chakraScores: (quizResult.chakra_scores as Record<string, number>) || {},
        completedAt: quizResult.created_at,
        status: 'completed',
      },
      purchases: (purchases || []).map((p) => ({
        id: p.id,
        productName: p.product_name,
        amount: p.amount,
        status: p.status || 'unknown',
        createdAt: p.created_at || new Date().toISOString(),
      })),
      sessions: (sessions || []).map((s) => ({
        sessionId: s.session_id,
        startedAt: s.started_at || new Date().toISOString(),
        completedAt: s.completed_at,
        reachedQuestion: s.current_question_index || 0,
      })),
    };

    logger.info('User detail fetched successfully', {
      context: 'GET /api/admin/users/[id]',
      data: { id, email, purchaseCount: purchases?.length || 0, sessionCount: sessions?.length || 0 },
    });

    return NextResponse.json(userDetail);
  } catch (error) {
    logger.error('Failed to fetch user detail', error, {
      context: 'GET /api/admin/users/[id]',
      data: { id },
    });

    return NextResponse.json({ error: 'Failed to fetch user detail' }, { status: 500 });
  }
}
