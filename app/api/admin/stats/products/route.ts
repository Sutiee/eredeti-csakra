/**
 * Product Statistics API
 * Returns sales and revenue breakdown by product
 */

import { NextRequest, NextResponse } from 'next/server';
import { protectAdminRoute } from '@/lib/admin/middleware';
import { logger } from '@/lib/utils/logger';
import { ProductStat } from '@/types/admin-stats';

const PROJECT_ID = 'zvoaqnfxschflsoqnusg';

// Import product definitions
import { PRODUCTS, ProductId } from '@/lib/stripe/products';

/**
 * Get product name by ID with fallback
 */
function getProductName(productId: string): string {
  const product = PRODUCTS[productId as ProductId];
  return product?.name || productId;
}

export async function GET(request: NextRequest) {
  // Protect route - require admin authentication
  const authError = await protectAdminRoute(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get('days') || '30';
    const days = Math.min(Math.max(parseInt(daysParam), 1), 365);

    logger.debug('Fetching product stats', {
      context: 'products-api',
      data: { days },
    });

    // Import Supabase client
    const { createSupabaseClient } = await import('@/lib/supabase/client');
    const supabase = createSupabaseClient();

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString();

    // Get all completed purchases
    const { data: purchases, error: purchaseError } = await supabase
      .from('purchases')
      .select('product_id, amount')
      .eq('status', 'completed')
      .gte('created_at', startDateStr);

    if (purchaseError) throw purchaseError;

    if (!purchases || purchases.length === 0) {
      return NextResponse.json([]);
    }

    // Group by product_id
    const productMap = new Map<
      string,
      { sales_count: number; revenue: number }
    >();

    purchases.forEach((p: any) => {
      const productId = p.product_id || 'unknown';
      const existing = productMap.get(productId) || {
        sales_count: 0,
        revenue: 0,
      };

      productMap.set(productId, {
        sales_count: existing.sales_count + 1,
        revenue: existing.revenue + (p.amount || 0),
      });
    });

    // Calculate total revenue for percentages
    const totalRevenue = Array.from(productMap.values()).reduce(
      (sum, p) => sum + p.revenue,
      0
    );

    // Build product stats array
    const productStats: ProductStat[] = Array.from(productMap.entries())
      .map(([productId, stats]) => ({
        product_id: productId,
        product_name: getProductName(productId),
        sales_count: stats.sales_count,
        revenue: Math.round(stats.revenue * 100) / 100,
        percentage:
          totalRevenue > 0
            ? Math.round((stats.revenue / totalRevenue) * 10000) / 100
            : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue); // Sort by revenue descending

    logger.info('Product stats fetched successfully', {
      context: 'products-api',
      data: { days, products: productStats.length },
    });

    return NextResponse.json(productStats);
  } catch (error) {
    logger.error('Failed to fetch product stats', error, {
      context: 'products-api',
    });

    return NextResponse.json(
      { error: 'Failed to fetch product statistics' },
      { status: 500 }
    );
  }
}
