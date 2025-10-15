/**
 * Admin Products Types
 * TypeScript interfaces for product analytics
 */

export interface ProductTableRow {
  productId: string;
  productName: string;
  salesCount: number;
  revenue: number;
  averagePrice: number;
  conversionRate: number;
  trend: 'up' | 'flat' | 'down';
  trendPercentage: number;
  firstSaleDate: string;
  lastSaleDate: string;
}

export interface TimelineData {
  date: string;
  [productId: string]: number | string;
}

export interface BundleAnalysis {
  bundleSales: number;
  individualSales: number;
  bundleRevenue: number;
  individualRevenue: number;
  averageDiscount: number;
  commonCombinations?: Array<{
    combination: string;
    count: number;
  }>;
}

export interface ProductStats {
  totalSales: number;
  totalRevenue: number;
  bestSeller: {
    productId: string;
    productName: string;
    revenue: number;
    salesCount: number;
  };
  averageCartValue: number;
  products: ProductTableRow[];
  timeline: TimelineData[];
  bundleAnalysis: BundleAnalysis;
}
