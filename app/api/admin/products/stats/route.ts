/**
 * Product Statistics API
 * Returns detailed product performance metrics and analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { protectAdminRoute } from '@/lib/admin/middleware';
import { logger } from '@/lib/utils/logger';
import { ProductStats, ProductTableRow, TimelineData, BundleAnalysis } from '@/types/admin-products';
import { PRODUCTS } from '@/lib/stripe/products';

export async function GET(request: NextRequest) {
  // Protect route - require admin authentication
  const authError = await protectAdminRoute(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get('days') || '30';
    const days = Math.min(Math.max(parseInt(daysParam), 1), 365);

    logger.debug('Fetching product stats', {
      context: 'product-stats-api',
      data: { days },
    });

    // Import Supabase client
    const { createSupabaseClient } = await import('@/lib/supabase/client');
    const supabase = createSupabaseClient();

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString();

    // Calculate previous period for trend comparison
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - days);
    const prevStartDateStr = prevStartDate.toISOString();
    const prevEndDateStr = startDateStr;

    // Query 1: Get all completed purchases in the time period
    const { data: purchases, error: purchasesError } = await supabase
      .from('purchases')
      .select('product_id, product_name, amount, created_at')
      .eq('status', 'completed')
      .gte('created_at', startDateStr);

    if (purchasesError) throw purchasesError;

    // Query 2: Get previous period purchases for trend calculation
    const { data: prevPurchases, error: prevPurchasesError } = await supabase
      .from('purchases')
      .select('product_id, product_name, amount')
      .eq('status', 'completed')
      .gte('created_at', prevStartDateStr)
      .lt('created_at', prevEndDateStr);

    if (prevPurchasesError) throw prevPurchasesError;

    // Query 3: Get total visitors for conversion rate calculation
    const { count: totalVisitors, error: visitorsError } = await supabase
      .from('quiz_results')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDateStr);

    if (visitorsError) throw visitorsError;

    // Process product data
    const productMap = new Map<string, {
      productId: string;
      productName: string;
      salesCount: number;
      revenue: number;
      firstSaleDate: string;
      lastSaleDate: string;
      prevRevenue: number;
    }>();

    // Process current period purchases
    purchases?.forEach((purchase: any) => {
      const productId = purchase.product_id;
      const existing = productMap.get(productId);

      if (existing) {
        existing.salesCount += 1;
        existing.revenue += purchase.amount;
        if (new Date(purchase.created_at) < new Date(existing.firstSaleDate)) {
          existing.firstSaleDate = purchase.created_at;
        }
        if (new Date(purchase.created_at) > new Date(existing.lastSaleDate)) {
          existing.lastSaleDate = purchase.created_at;
        }
      } else {
        productMap.set(productId, {
          productId,
          productName: purchase.product_name,
          salesCount: 1,
          revenue: purchase.amount,
          firstSaleDate: purchase.created_at,
          lastSaleDate: purchase.created_at,
          prevRevenue: 0,
        });
      }
    });

    // Process previous period for trend
    prevPurchases?.forEach((purchase: any) => {
      const productId = purchase.product_id;
      const existing = productMap.get(productId);

      if (existing) {
        existing.prevRevenue += purchase.amount;
      } else {
        productMap.set(productId, {
          productId,
          productName: purchase.product_name,
          salesCount: 0,
          revenue: 0,
          firstSaleDate: new Date().toISOString(),
          lastSaleDate: new Date().toISOString(),
          prevRevenue: purchase.amount,
        });
      }
    });

    // Build product table rows
    const products: ProductTableRow[] = Array.from(productMap.values()).map((product) => {
      const averagePrice = product.salesCount > 0 ? product.revenue / product.salesCount : 0;
      const conversionRate = totalVisitors && totalVisitors > 0
        ? (product.salesCount / totalVisitors) * 100
        : 0;

      // Calculate trend
      let trend: 'up' | 'flat' | 'down' = 'flat';
      let trendPercentage = 0;

      if (product.prevRevenue > 0) {
        const change = ((product.revenue - product.prevRevenue) / product.prevRevenue) * 100;
        trendPercentage = change;
        if (change > 5) trend = 'up';
        else if (change < -5) trend = 'down';
        else trend = 'flat';
      } else if (product.revenue > 0) {
        trend = 'up';
        trendPercentage = 100;
      }

      return {
        productId: product.productId,
        productName: product.productName,
        salesCount: product.salesCount,
        revenue: product.revenue,
        averagePrice: Math.round(averagePrice * 100) / 100,
        conversionRate: Math.round(conversionRate * 100) / 100,
        trend,
        trendPercentage: Math.round(trendPercentage * 100) / 100,
        firstSaleDate: product.firstSaleDate,
        lastSaleDate: product.lastSaleDate,
      };
    }).filter(p => p.salesCount > 0); // Only include products with sales

    // Calculate totals
    const totalSales = products.reduce((sum, p) => sum + p.salesCount, 0);
    const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0);
    const averageCartValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Find best seller
    const bestSeller = products.reduce(
      (best, p) => (p.revenue > best.revenue ? p : best),
      { productId: '', productName: '-', revenue: 0, salesCount: 0 }
    );

    // Build timeline data (group by date)
    const timelineMap = new Map<string, TimelineData>();

    purchases?.forEach((purchase: any) => {
      const date = new Date(purchase.created_at).toISOString().split('T')[0];
      const productId = purchase.product_id;

      if (!timelineMap.has(date)) {
        timelineMap.set(date, { date });
      }

      const dayData = timelineMap.get(date)!;
      if (!dayData[productId]) {
        dayData[productId] = 0;
      }
      dayData[productId] = (dayData[productId] as number) + purchase.amount;
    });

    const timeline: TimelineData[] = Array.from(timelineMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Bundle analysis
    const bundleData = products.find(p => p.productId === 'bundle');
    const individualProducts = products.filter(p => p.productId !== 'bundle');

    const bundleAnalysis: BundleAnalysis = {
      bundleSales: bundleData?.salesCount || 0,
      individualSales: individualProducts.reduce((sum, p) => sum + p.salesCount, 0),
      bundleRevenue: bundleData?.revenue || 0,
      individualRevenue: individualProducts.reduce((sum, p) => sum + p.revenue, 0),
      averageDiscount: bundleData ? calculateBundleDiscount() : 0,
    };

    const stats: ProductStats = {
      totalSales,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      bestSeller,
      averageCartValue: Math.round(averageCartValue * 100) / 100,
      products,
      timeline,
      bundleAnalysis,
    };

    logger.info('Product stats fetched successfully', {
      context: 'product-stats-api',
      data: { days, productsCount: products.length },
    });

    return NextResponse.json(stats);
  } catch (error) {
    logger.error('Failed to fetch product stats', error, {
      context: 'product-stats-api',
    });

    return NextResponse.json(
      { error: 'Failed to fetch product statistics' },
      { status: 500 }
    );
  }
}

/**
 * Calculate bundle discount percentage
 */
function calculateBundleDiscount(): number {
  const individualTotal =
    PRODUCTS.detailed_pdf.price +
    PRODUCTS.meditations.price;

  const bundlePrice = PRODUCTS.bundle.price;
  const discount = ((individualTotal - bundlePrice) / individualTotal) * 100;

  return Math.round(discount * 100) / 100;
}
