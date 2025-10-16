/**
 * Admin System Type Definitions
 * Types for analytics, event tracking, and admin dashboard
 */

/**
 * Event Categories for Analytics
 * Used to group related events together
 */
export type EventCategory =
  | 'page'       // Page views and navigation
  | 'quiz'       // Quiz-related events
  | 'checkout'   // Checkout and payment events
  | 'product'    // Product interactions
  | 'system';    // Backend system events

/**
 * Analytics Event
 * Represents a single tracked event in the system
 */
export type AnalyticsEvent = {
  id?: string;
  event_name: string;
  event_category: EventCategory;
  event_data?: Record<string, any>;
  session_id?: string;
  result_id?: string;
  ip_address?: string;
  user_agent?: string;
  page_path?: string;
  referrer?: string;
  created_at?: string;
};

/**
 * Client-Side Event Data
 * Data structure sent from client to event tracking API
 */
export type ClientEventData = {
  event_name: string;
  event_data?: Record<string, any>;
  session_id?: string;
  result_id?: string;
  page_path?: string;
  referrer?: string;
};

/**
 * Server-Side Event Context
 * Additional context for server-side event logging
 */
export type ServerEventContext = {
  sessionId?: string;
  resultId?: string;
  ipAddress?: string;
  userAgent?: string;
  pagePath?: string;
  referrer?: string;
};

/**
 * Quiz Session Status
 * Tracks the current state of a quiz session
 */
export type QuizSessionStatus = 'active' | 'completed' | 'abandoned';

/**
 * Quiz Session
 * Represents a user's quiz progress (partial or complete)
 */
export type QuizSession = {
  id: string;
  session_id: string;
  ip_address?: string;
  user_agent?: string;
  current_question_index: number;
  answers: number[];
  name?: string;
  email?: string;
  age?: number;
  status: QuizSessionStatus;
  started_at: string;
  last_activity_at: string;
  completed_at?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer?: string;
};

/**
 * Page View
 * Represents a single page view for analytics
 */
export type PageView = {
  id: string;
  page_path: string;
  page_title?: string;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  created_at: string;
};

/**
 * Admin User
 * Represents an admin user in the system
 */
export type AdminUser = {
  id: string;
  username: string;
  password_hash: string;
  last_login_at?: string;
  login_count: number;
  created_at: string;
};

/**
 * Admin Session
 * Represents an active admin session
 */
export type AdminSession = {
  id: string;
  admin_user_id: string;
  session_token: string;
  ip_address?: string;
  user_agent?: string;
  expires_at: string;
  created_at: string;
  last_activity_at: string;
};

/**
 * Analytics KPI Metrics
 * Key Performance Indicators for the dashboard
 */
export type AnalyticsKPIs = {
  total_visitors: number;
  quiz_starts: number;
  quiz_completions: number;
  total_purchases: number;
  total_revenue: number;
  conversion_rate: number; // Percentage (0-100)
};

/**
 * Conversion Funnel Data
 * Step-by-step conversion metrics
 */
export type ConversionFunnel = {
  landing_views: number;
  quiz_starts: number;
  quiz_q7_reached: number;
  quiz_q14_reached: number;
  quiz_q21_reached: number;
  quiz_completions: number;
  checkout_views: number;
  purchases: number;
};

/**
 * Product Statistics
 * Sales and revenue breakdown by product
 */
export type ProductStats = {
  product_id: string;
  product_name: string;
  sales_count: number;
  revenue: number;
  percentage: number; // Percentage of total sales (0-100)
};

/**
 * Date Range Filter
 * Used for filtering analytics data by date
 */
export type DateRangeFilter = {
  start_date: string; // ISO 8601 format
  end_date: string;   // ISO 8601 format
};

/**
 * User Filter Options
 * Options for filtering user list in admin panel
 */
export type UserFilterOptions = {
  date_range?: DateRangeFilter;
  quiz_status?: QuizSessionStatus;
  has_purchased?: boolean;
  search_query?: string; // Search by name or email
  sort_by?: 'created_at' | 'name' | 'email' | 'progress';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
};

/**
 * API Response Format
 * Standardized API response structure
 */
export type APIResponse<T> = {
  data: T | null;
  error: {
    message: string;
    code: string;
    details?: any;
  } | null;
};
