/**
 * User Filters Component
 *
 * Provides comprehensive filtering controls for the user table
 * including search, status filters, date range, and chakra health
 */

'use client';

import { useState } from 'react';

export interface UserFilters {
  search: string;
  quizStatus: 'all' | 'completed' | 'abandoned';
  purchaseStatus: 'all' | 'purchased' | 'not_purchased';
  dateFrom: string | null;
  dateTo: string | null;
  chakraHealth: 'all' | 'healthy' | 'warning' | 'critical';
}

interface UserFiltersProps {
  filters: UserFilters;
  onFiltersChange: (filters: UserFilters) => void;
  onExport?: () => void;
  totalFilteredCount?: number;
}

export function UserFilters({
  filters,
  onFiltersChange,
  onExport,
  totalFilteredCount,
}: UserFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleReset = () => {
    onFiltersChange({
      search: '',
      quizStatus: 'all',
      purchaseStatus: 'all',
      dateFrom: null,
      dateTo: null,
      chakraHealth: 'all',
    });
  };

  const hasActiveFilters =
    filters.search !== '' ||
    filters.quizStatus !== 'all' ||
    filters.purchaseStatus !== 'all' ||
    filters.dateFrom !== null ||
    filters.dateTo !== null ||
    filters.chakraHealth !== 'all';

  return (
    <div className="backdrop-blur-md bg-white/70 rounded-2xl border border-white/50 p-6 shadow-lg">
      {/* Header with toggle and actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="lg:hidden p-2 rounded-lg bg-spiritual-purple-100 text-spiritual-purple-700 hover:bg-spiritual-purple-200 transition-colors duration-200"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Szűrők elrejtése' : 'Szűrők megjelenítése'}
          >
            {isExpanded ? '▲' : '▼'} Szűrők
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            Felhasználók Szűrése
          </h2>
          {hasActiveFilters && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-spiritual-purple-100 text-spiritual-purple-800">
              Aktív szűrők
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white/90 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-spiritual-purple-500 transition-colors duration-200"
            >
              Szűrők törlése
            </button>
          )}
          {onExport && (
            <button
              onClick={onExport}
              className="px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-spiritual-purple-600 to-spiritual-rose-600 rounded-md hover:from-spiritual-purple-700 hover:to-spiritual-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-spiritual-purple-500 transition-all duration-200 shadow-md"
              aria-label="Exportálás CSV formátumban"
            >
              📥 Exportálás CSV
            </button>
          )}
        </div>
      </div>

      {/* Filter results count */}
      {totalFilteredCount !== undefined && (
        <div className="mb-4 text-sm text-gray-600">
          <span className="font-medium">{totalFilteredCount}</span> felhasználó
          található
        </div>
      )}

      {/* Filters (collapsible on mobile) */}
      <div
        className={`
          grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4
          ${isExpanded ? '' : 'hidden lg:grid'}
        `}
      >
        {/* Search */}
        <div className="sm:col-span-2">
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Keresés
          </label>
          <input
            id="search"
            type="text"
            placeholder="Név vagy email..."
            value={filters.search}
            onChange={(e) =>
              onFiltersChange({ ...filters, search: e.target.value })
            }
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white/90 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-spiritual-purple-500 focus:border-transparent transition-colors duration-200"
            aria-label="Keresés név vagy email alapján"
          />
        </div>

        {/* Quiz Status */}
        <div>
          <label
            htmlFor="quiz-status"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Kvíz Állapot
          </label>
          <select
            id="quiz-status"
            value={filters.quizStatus}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                quizStatus: e.target.value as UserFilters['quizStatus'],
              })
            }
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white/90 focus:outline-none focus:ring-2 focus:ring-spiritual-purple-500 focus:border-transparent transition-colors duration-200"
            aria-label="Kvíz állapot szűrő"
          >
            <option value="all">Összes</option>
            <option value="completed">Befejezett</option>
            <option value="abandoned">Félbehagyott</option>
          </select>
        </div>

        {/* Purchase Status */}
        <div>
          <label
            htmlFor="purchase-status"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Vásárlás
          </label>
          <select
            id="purchase-status"
            value={filters.purchaseStatus}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                purchaseStatus: e.target.value as UserFilters['purchaseStatus'],
              })
            }
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white/90 focus:outline-none focus:ring-2 focus:ring-spiritual-purple-500 focus:border-transparent transition-colors duration-200"
            aria-label="Vásárlás állapot szűrő"
          >
            <option value="all">Összes</option>
            <option value="purchased">Vásárolt</option>
            <option value="not_purchased">Nem vásárolt</option>
          </select>
        </div>

        {/* Chakra Health */}
        <div>
          <label
            htmlFor="chakra-health"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Csakra Egészség
          </label>
          <select
            id="chakra-health"
            value={filters.chakraHealth}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                chakraHealth: e.target.value as UserFilters['chakraHealth'],
              })
            }
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white/90 focus:outline-none focus:ring-2 focus:ring-spiritual-purple-500 focus:border-transparent transition-colors duration-200"
            aria-label="Csakra egészség szűrő"
          >
            <option value="all">Összes</option>
            <option value="healthy">🟢 Egészséges</option>
            <option value="warning">🟡 Figyelmeztetés</option>
            <option value="critical">🔴 Kritikus</option>
          </select>
        </div>

        {/* Date From */}
        <div>
          <label
            htmlFor="date-from"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Dátum-tól
          </label>
          <input
            id="date-from"
            type="date"
            value={filters.dateFrom || ''}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                dateFrom: e.target.value || null,
              })
            }
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white/90 focus:outline-none focus:ring-2 focus:ring-spiritual-purple-500 focus:border-transparent transition-colors duration-200"
            aria-label="Kezdő dátum"
          />
        </div>

        {/* Date To */}
        <div>
          <label
            htmlFor="date-to"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Dátum-ig
          </label>
          <input
            id="date-to"
            type="date"
            value={filters.dateTo || ''}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                dateTo: e.target.value || null,
              })
            }
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white/90 focus:outline-none focus:ring-2 focus:ring-spiritual-purple-500 focus:border-transparent transition-colors duration-200"
            aria-label="Befejező dátum"
          />
        </div>
      </div>
    </div>
  );
}
