/**
 * User Table Component
 *
 * Comprehensive data table with sortable columns, responsive design,
 * and glass morphism styling for displaying user quiz and purchase data
 */

'use client';

import { format } from 'date-fns';
import { hu } from 'date-fns/locale';

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

export type SortColumn = keyof UserTableRow;
export type SortDirection = 'asc' | 'desc';

interface UserTableProps {
  users: UserTableRow[];
  onUserClick: (userId: string) => void;
  sortColumn: SortColumn | null;
  sortDirection: SortDirection;
  onSort: (column: SortColumn) => void;
  isLoading?: boolean;
}

/**
 * Get chakra health indicator emoji
 */
function getChakraHealthIndicator(health: string): string {
  if (health === 'healthy') return '🟢';
  if (health === 'warning') return '🟡';
  if (health === 'critical') return '🔴';
  return '⚪';
}

/**
 * Loading skeleton for table
 */
function TableSkeleton() {
  return (
    <div className="backdrop-blur-md bg-white/70 rounded-2xl border border-white/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-spiritual-purple-500/10 to-spiritual-rose-500/10 sticky top-0">
            <tr>
              {[...Array(9)].map((_, i) => (
                <th key={i} className="px-4 py-3">
                  <div className="h-4 bg-white/30 rounded animate-pulse"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(10)].map((_, i) => (
              <tr key={i} className="border-t border-white/30">
                {[...Array(9)].map((_, j) => (
                  <td key={j} className="px-4 py-3">
                    <div className="h-4 bg-white/20 rounded animate-pulse"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Empty state for table
 */
function EmptyState() {
  return (
    <div className="backdrop-blur-md bg-white/70 rounded-2xl border border-white/50 p-12 text-center">
      <div className="text-6xl mb-4" aria-hidden="true">
        👥
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Nincsenek felhasználók
      </h3>
      <p className="text-gray-600">
        Még senki sem töltötte ki a kvízt, vagy a szűrők nem találtak eredményt.
      </p>
    </div>
  );
}

/**
 * Sort indicator icon
 */
function SortIcon({ direction }: { direction: SortDirection | null }) {
  if (!direction) {
    return <span className="text-gray-400 ml-1">↕</span>;
  }
  return (
    <span className="text-spiritual-purple-600 ml-1">
      {direction === 'asc' ? '↑' : '↓'}
    </span>
  );
}

/**
 * Main User Table Component
 */
export function UserTable({
  users,
  onUserClick,
  sortColumn,
  sortDirection,
  onSort,
  isLoading = false,
}: UserTableProps) {
  // Loading state
  if (isLoading) {
    return <TableSkeleton />;
  }

  // Empty state
  if (users.length === 0) {
    return <EmptyState />;
  }

  /**
   * Render sortable header cell
   */
  const renderHeader = (column: SortColumn, label: string) => (
    <th
      className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-spiritual-purple-50/50 transition-colors duration-200 select-none"
      onClick={() => onSort(column)}
      role="columnheader"
      aria-sort={
        sortColumn === column
          ? sortDirection === 'asc'
            ? 'ascending'
            : 'descending'
          : 'none'
      }
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSort(column);
        }
      }}
    >
      <div className="flex items-center">
        {label}
        <SortIcon direction={sortColumn === column ? sortDirection : null} />
      </div>
    </th>
  );

  return (
    <div className="backdrop-blur-md bg-white/70 rounded-2xl border border-white/50 overflow-hidden shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full" role="table">
          <thead className="bg-gradient-to-r from-spiritual-purple-500/10 to-spiritual-rose-500/10 sticky top-0 z-10">
            <tr>
              {renderHeader('name', 'Név')}
              {renderHeader('email', 'Email')}
              {renderHeader('age', 'Kor')}
              {renderHeader('quizStatus', 'Kvíz Állapot')}
              {renderHeader('reachedQuestion', 'Elért Kérdés')}
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Csakra Egészség
              </th>
              {renderHeader('hasPurchased', 'Vásárlás')}
              {renderHeader('createdAt', 'Létrehozva')}
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 sticky right-0 bg-gradient-to-r from-spiritual-purple-500/10 to-spiritual-rose-500/10">
                Műveletek
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr
                key={user.id}
                className={`
                  border-t border-white/30 hover:bg-spiritual-purple-50/30 transition-colors duration-200 cursor-pointer
                  ${index % 2 === 0 ? 'bg-white/20' : 'bg-white/10'}
                `}
                onClick={() => onUserClick(user.id)}
                role="row"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onUserClick(user.id);
                  }
                }}
              >
                {/* Name */}
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {user.name}
                </td>

                {/* Email */}
                <td className="px-4 py-3 text-sm text-gray-600">
                  {user.email}
                </td>

                {/* Age */}
                <td className="px-4 py-3 text-sm text-gray-600">
                  {user.age || '-'}
                </td>

                {/* Quiz Status */}
                <td className="px-4 py-3">
                  {user.quizStatus === 'completed' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ Befejezett
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      ⚠ Félbehagyott
                    </span>
                  )}
                </td>

                {/* Reached Question */}
                <td className="px-4 py-3 text-sm text-gray-600">
                  <span className="font-medium">
                    {user.reachedQuestion}/{user.totalQuestions}
                  </span>
                </td>

                {/* Chakra Health */}
                <td className="px-4 py-3 text-center">
                  <span className="text-2xl" role="img" aria-label={user.chakraHealth}>
                    {getChakraHealthIndicator(user.chakraHealth)}
                  </span>
                </td>

                {/* Purchase Status */}
                <td className="px-4 py-3 text-center">
                  {user.hasPurchased ? (
                    <span className="text-spiritual-purple-600 text-xl" role="img" aria-label="Vásárolt">
                      ✓
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xl" role="img" aria-label="Nem vásárolt">
                      -
                    </span>
                  )}
                </td>

                {/* Created At */}
                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                  {format(new Date(user.createdAt), 'yyyy. MM. dd. HH:mm', {
                    locale: hu,
                  })}
                </td>

                {/* Actions */}
                <td className="px-4 py-3 sticky right-0 bg-white/70">
                  <button
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-spiritual-purple-700 bg-spiritual-purple-100 hover:bg-spiritual-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-spiritual-purple-500 transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUserClick(user.id);
                    }}
                    aria-label={`${user.name} részleteinek megtekintése`}
                  >
                    Részletek
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
