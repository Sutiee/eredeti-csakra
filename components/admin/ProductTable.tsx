/**
 * Product Table Component
 *
 * Displays product performance data in a sortable table:
 * - Product name, sales count, revenue, average price
 * - Conversion rate, trend indicators
 * - First and last sale dates
 */

'use client';

import { useState } from 'react';
import { ProductTableRow } from '@/types/admin-products';

interface ProductTableProps {
  products: ProductTableRow[];
  isLoading?: boolean;
}

type SortField = keyof ProductTableRow;
type SortDirection = 'asc' | 'desc';

/**
 * Trend Indicator Component
 */
function TrendIndicator({ trend, percentage }: { trend: 'up' | 'flat' | 'down'; percentage: number }) {
  const trendConfig = {
    up: { icon: '↑', color: 'text-green-400', bg: 'bg-green-500/20' },
    flat: { icon: '→', color: 'text-gray-400', bg: 'bg-gray-500/20' },
    down: { icon: '↓', color: 'text-red-400', bg: 'bg-red-500/20' },
  };

  const config = trendConfig[trend];

  return (
    <div className={`flex items-center gap-1 ${config.bg} px-2 py-1 rounded-md`}>
      <span className={`${config.color} font-bold`}>{config.icon}</span>
      <span className={`${config.color} text-sm`}>{Math.abs(percentage).toFixed(1)}%</span>
    </div>
  );
}

/**
 * Loading Skeleton for Table
 */
function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4 animate-pulse">
          <div className="h-12 bg-white/10 rounded flex-1"></div>
          <div className="h-12 bg-white/10 rounded flex-1"></div>
          <div className="h-12 bg-white/10 rounded flex-1"></div>
        </div>
      ))}
    </div>
  );
}

/**
 * Product Table Component
 */
export function ProductTable({ products, isLoading }: ProductTableProps) {
  const [sortField, setSortField] = useState<SortField>('revenue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <span className="text-gray-500 opacity-50">↕</span>;
    }
    return <span className="text-white">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  const getRevenueGradient = (revenue: number, maxRevenue: number) => {
    const percentage = (revenue / maxRevenue) * 100;
    if (percentage > 75) return 'bg-gradient-to-r from-green-500/20 to-green-600/30';
    if (percentage > 50) return 'bg-gradient-to-r from-blue-500/20 to-blue-600/30';
    if (percentage > 25) return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/30';
    return 'bg-gradient-to-r from-gray-500/20 to-gray-600/30';
  };

  if (isLoading) {
    return (
      <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20">
        <TableSkeleton />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20 text-center">
        <p className="text-gray-300">Nincs megjeleníthető adat ebben az időszakban.</p>
      </div>
    );
  }

  const maxRevenue = Math.max(...products.map(p => p.revenue));

  return (
    <div className="backdrop-blur-md bg-white/10 rounded-xl border border-white/20 overflow-hidden">
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-4">Termék Teljesítmény</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5 border-y border-white/10">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider cursor-pointer hover:bg-white/5"
                onClick={() => handleSort('productName')}
              >
                <div className="flex items-center gap-2">
                  Termék Neve <SortIcon field="productName" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider cursor-pointer hover:bg-white/5"
                onClick={() => handleSort('salesCount')}
              >
                <div className="flex items-center gap-2">
                  Eladások <SortIcon field="salesCount" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider cursor-pointer hover:bg-white/5"
                onClick={() => handleSort('revenue')}
              >
                <div className="flex items-center gap-2">
                  Bevétel <SortIcon field="revenue" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider cursor-pointer hover:bg-white/5"
                onClick={() => handleSort('averagePrice')}
              >
                <div className="flex items-center gap-2">
                  Átlagár <SortIcon field="averagePrice" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider cursor-pointer hover:bg-white/5"
                onClick={() => handleSort('conversionRate')}
              >
                <div className="flex items-center gap-2">
                  Konverzió <SortIcon field="conversionRate" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                Trend
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider cursor-pointer hover:bg-white/5"
                onClick={() => handleSort('firstSaleDate')}
              >
                <div className="flex items-center gap-2">
                  Első Vásárlás <SortIcon field="firstSaleDate" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider cursor-pointer hover:bg-white/5"
                onClick={() => handleSort('lastSaleDate')}
              >
                <div className="flex items-center gap-2">
                  Utolsó Vásárlás <SortIcon field="lastSaleDate" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {sortedProducts.map((product) => (
              <tr
                key={product.productId}
                className="hover:bg-white/5 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">{product.productName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-200">{product.salesCount}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-bold text-white px-3 py-1 rounded-lg ${getRevenueGradient(product.revenue, maxRevenue)}`}>
                    {product.revenue.toLocaleString('hu-HU')} Ft
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-200">{product.averagePrice.toLocaleString('hu-HU')} Ft</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-200">{product.conversionRate.toFixed(2)}%</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <TrendIndicator trend={product.trend} percentage={product.trendPercentage} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">{new Date(product.firstSaleDate).toLocaleDateString('hu-HU')}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">{new Date(product.lastSaleDate).toLocaleDateString('hu-HU')}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
