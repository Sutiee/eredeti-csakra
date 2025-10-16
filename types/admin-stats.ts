/**
 * Admin Dashboard Statistics Types
 *
 * Type definitions for all analytics API responses
 */

export interface KPIStats {
  totalVisitors: number;
  completedQuizzes: number;
  conversionRate: number;
  totalRevenue: number;
  averageOrderValue: number;
  activeSessions: number;
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

export interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
}

export interface RecentUser {
  id: string;
  name: string;
  email: string;
  age: number;
  created_at: string;
  purchased: boolean;
  purchase_count: number;
}

export interface ProductStat {
  product_id: string;
  product_name: string;
  sales_count: number;
  revenue: number;
  percentage: number;
}

export type TimeSeriesMetric = 'visitors' | 'revenue' | 'quizzes';

export interface StatsQueryParams {
  days?: number;
  metric?: TimeSeriesMetric;
  limit?: number;
}
