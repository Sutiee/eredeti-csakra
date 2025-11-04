/**
 * Admin API: Gift Analytics
 * GET /api/admin/gifts
 *
 * Returns gift purchases with stats and analytics
 * TODO: Add authentication middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/client';
import { getPrice } from '@/lib/pricing/variants';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // TODO: Add admin authentication check
    // const session = await getServerSession();
    // if (!session?.user?.isAdmin) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const supabase = createSupabaseClient();

    // Fetch all gift purchases
    const { data: gifts, error: giftsError } = await (supabase as any)
      .from('gift_purchases')
      .select('*')
      .order('created_at', { ascending: false });

    if (giftsError) {
      console.error('[ADMIN GIFTS] Error fetching gifts:', giftsError);
      return NextResponse.json(
        {
          data: null,
          error: { message: 'Failed to fetch gifts', code: 'FETCH_ERROR' },
        },
        { status: 500 }
      );
    }

    // Calculate stats
    const totalGifts = gifts?.length || 0;
    const activeGifts = gifts?.filter((g: any) => g.status === 'active').length || 0;
    const redeemedGifts = gifts?.filter((g: any) => g.status === 'redeemed').length || 0;
    const expiredGifts = gifts?.filter((g: any) => g.status === 'expired').length || 0;
    const redemptionRate = totalGifts > 0 ? (redeemedGifts / totalGifts) * 100 : 0;

    // Calculate total revenue (sum of all gift purchases)
    const totalRevenue = gifts?.reduce((sum: number, gift: any) => {
      const variant = gift.variant_id || 'a';
      const price = getPrice(gift.product_id, variant);
      return sum + price;
    }, 0) || 0;

    const stats = {
      total_gifts: totalGifts,
      active_gifts: activeGifts,
      redeemed_gifts: redeemedGifts,
      expired_gifts: expiredGifts,
      redemption_rate: redemptionRate,
      total_revenue: totalRevenue,
    };

    return NextResponse.json({
      data: {
        gifts: gifts || [],
        stats,
      },
      error: null,
    });
  } catch (error: any) {
    console.error('[ADMIN GIFTS] Unexpected error:', error);
    return NextResponse.json(
      {
        data: null,
        error: { message: 'Unexpected error', code: 'UNEXPECTED_ERROR' },
      },
      { status: 500 }
    );
  }
}
