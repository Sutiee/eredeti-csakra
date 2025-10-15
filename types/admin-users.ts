/**
 * TypeScript types for Admin User Management
 */

/**
 * User row in the users list table
 */
export interface UserTableRow {
  id: string;
  name: string;
  email: string;
  age: number | null;
  quizStatus: 'completed' | 'abandoned';
  reachedQuestion: number;
  totalQuestions: number;
  chakraHealth: 'healthy' | 'warning' | 'critical';
  hasPurchased: boolean;
  purchaseCount: number;
  createdAt: string;
}

/**
 * Full user details with quiz, purchases, and sessions
 */
export interface UserDetail {
  id: string;
  name: string;
  email: string;
  age: number | null;
  createdAt: string;

  // Quiz data
  quiz: {
    answers: number[]; // 28 answers (1-4)
    chakraScores: Record<string, number>; // 7 chakras
    completedAt: string;
    status: 'completed';
  };

  // Purchase history
  purchases: {
    id: string;
    productName: string;
    amount: number;
    status: string;
    createdAt: string;
  }[];

  // Session data
  sessions: {
    sessionId: string;
    startedAt: string;
    completedAt: string | null;
    reachedQuestion: number;
  }[];
}

/**
 * User statistics summary
 */
export interface UserStats {
  totalUsers: number; // Total quiz completions
  newUsersThisWeek: number; // Last 7 days
  newUsersThisMonth: number; // Last 30 days
  conversionRate: number; // Purchased / Total (percentage)
  averageAge: number; // Average age
  completionRate: number; // Completed / Started (percentage)
  abandonmentRate: number; // Abandoned / Started (percentage)
}

/**
 * Filter options for user list
 */
export interface UserFilters {
  search: string;
  status: 'all' | 'completed' | 'abandoned';
  purchase: 'all' | 'purchased' | 'not_purchased';
  dateFrom: string | null;
  dateTo: string | null;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

/**
 * Pagination information
 */
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

/**
 * Users list API response
 */
export interface UsersListResponse {
  data: UserTableRow[];
  pagination: PaginationInfo;
}

/**
 * Search suggestion
 */
export interface UserSearchSuggestion {
  id: string;
  name: string;
  email: string;
  avatar?: string; // first letter of name
}

/**
 * Export data response
 */
export interface ExportDataResponse {
  data: UserTableRow[];
  exportedAt: string;
  totalRecords: number;
  filters: UserFilters;
}
