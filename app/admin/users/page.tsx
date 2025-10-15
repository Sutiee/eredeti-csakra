/**
 * Admin Users Page
 *
 * Comprehensive user management interface with table, filtering,
 * pagination, and detailed user view modal
 */

'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { UserTable, UserTableRow, SortColumn, SortDirection } from '@/components/admin/UserTable';
import { Pagination } from '@/components/admin/Pagination';
import { UserFilters, UserFilters as UserFiltersType } from '@/components/admin/UserFilters';
import { UserDetailModal } from '@/components/admin/UserDetailModal';
import { fetcher } from '@/lib/admin/swr-config';
import { exportUsersToCSV } from '@/lib/admin/export';
import { UsersListResponse } from '@/types/admin-users';

export default function AdminUsersPage() {
  // State management
  const [filters, setFilters] = useState<UserFiltersType>({
    search: '',
    quizStatus: 'all',
    purchaseStatus: 'all',
    dateFrom: null,
    dateTo: null,
    chakraHealth: 'all',
  });

  const [sortColumn, setSortColumn] = useState<SortColumn | null>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Fetch users data
  const { data: response, isLoading, error } = useSWR<UsersListResponse>(
    '/api/admin/users',
    fetcher
  );

  // Extract users array from response
  const users = response?.data || [];

  /**
   * Filter users based on active filters
   */
  const filteredUsers = useMemo(() => {
    if (!Array.isArray(users) || users.length === 0) return [];

    return users.filter((user) => {
      // Search filter (name or email)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Quiz status filter
      if (filters.quizStatus !== 'all') {
        if (user.quizStatus !== filters.quizStatus) return false;
      }

      // Purchase status filter
      if (filters.purchaseStatus !== 'all') {
        const hasPurchased = user.hasPurchased;
        if (
          (filters.purchaseStatus === 'purchased' && !hasPurchased) ||
          (filters.purchaseStatus === 'not_purchased' && hasPurchased)
        ) {
          return false;
        }
      }

      // Chakra health filter
      if (filters.chakraHealth !== 'all') {
        if (user.chakraHealth !== filters.chakraHealth) return false;
      }

      // Date range filter
      if (filters.dateFrom) {
        const userDate = new Date(user.createdAt);
        const fromDate = new Date(filters.dateFrom);
        if (userDate < fromDate) return false;
      }

      if (filters.dateTo) {
        const userDate = new Date(user.createdAt);
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999); // End of day
        if (userDate > toDate) return false;
      }

      return true;
    });
  }, [users, filters]);

  /**
   * Sort filtered users
   */
  const sortedUsers = useMemo(() => {
    if (!sortColumn) return filteredUsers;

    return [...filteredUsers].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      // Handle null values
      if (aValue === null && bValue === null) return 0;
      if (aValue === null) return 1;
      if (bValue === null) return -1;

      // Compare values
      let comparison = 0;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue, 'hu');
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        comparison = aValue === bValue ? 0 : aValue ? 1 : -1;
      } else {
        // For dates and other types, convert to string and compare
        comparison = String(aValue).localeCompare(String(bValue), 'hu');
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredUsers, sortColumn, sortDirection]);

  /**
   * Paginate sorted users
   */
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedUsers.slice(startIndex, endIndex);
  }, [sortedUsers, currentPage, itemsPerPage]);

  /**
   * Calculate pagination values
   */
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);

  /**
   * Handle sort column change
   */
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column with default ascending direction
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  /**
   * Handle page change
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of table
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Handle items per page change
   */
  const handleItemsPerPageChange = (count: number) => {
    setItemsPerPage(count);
    setCurrentPage(1); // Reset to first page
  };

  /**
   * Handle user click (open detail modal)
   */
  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
  };

  /**
   * Handle export to CSV
   */
  const handleExport = () => {
    // Export filtered users (not just current page)
    exportUsersToCSV(sortedUsers);

    // Show success toast (optional - implement later)
    // For now, just log
    console.log(`Exported ${sortedUsers.length} users to CSV`);
  };

  /**
   * Handle filters change and reset pagination
   */
  const handleFiltersChange = (newFilters: UserFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  return (
    <AdminLayout title="Felhasználók">
      {/* Filters */}
      <UserFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onExport={handleExport}
        totalFilteredCount={sortedUsers.length}
      />

      {/* Error state */}
      {error && (
        <div className="mt-6 backdrop-blur-md bg-red-500/10 rounded-xl p-6 border border-red-500/20">
          <p className="text-red-300">
            Hiba történt az adatok betöltése közben. Kérjük, próbálja újra később.
          </p>
        </div>
      )}

      {/* User Table */}
      <div className="mt-6">
        <UserTable
          users={paginatedUsers}
          onUserClick={handleUserClick}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          isLoading={isLoading}
        />
      </div>

      {/* Pagination */}
      {!isLoading && sortedUsers.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={sortedUsers.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}

      {/* User Detail Modal */}
      <UserDetailModal
        userId={selectedUserId}
        isOpen={!!selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />
    </AdminLayout>
  );
}
