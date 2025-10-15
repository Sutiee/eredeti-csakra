/**
 * Product KPI Cards Component
 *
 * Displays 4 key product performance metrics:
 * - Total Sales
 * - Total Revenue
 * - Best Seller
 * - Average Cart Value
 */

'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/admin/swr-config';
import { ProductStats } from '@/types/admin-products';

interface ProductKPICardsProps {
  days?: number;
}

interface KPICardProps {
  title: string;
  value: string | number;
  icon: string;
  subtitle?: string;
  gradient: string;
  isLoading?: boolean;
}

/**
 * Individual Product KPI Card Component
 */
function ProductKPICard({ title, value, icon, subtitle, gradient, isLoading }: KPICardProps) {
  if (isLoading) {
    return (
      <div className="backdrop-blur-md bg-gray-800/70 rounded-xl p-6 border border-gray-700 animate-pulse">
        <div className="h-12 bg-gray-700 rounded mb-3"></div>
        <div className="h-8 bg-gray-700 rounded mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-2/3"></div>
      </div>
    );
  }

  return (
    <div
      className={`backdrop-blur-md bg-gray-800/70 rounded-xl p-6 border border-gray-700
        hover:border-white/40 transition-all duration-300 transform hover:scale-105
        hover:shadow-xl ${gradient}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-4xl">{icon}</div>
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-100 opacity-80">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-200 opacity-60">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

/**
 * Product KPI Cards Grid Component
 */
export function ProductKPICards({ days = 30 }: ProductKPICardsProps) {
  const { data: productData, isLoading, error } = useSWR<ProductStats>(
    `/api/admin/products/stats?days=${days}`,
    fetcher
  );

  if (error) {
    return (
      <div className="backdrop-blur-md bg-red-500/10 rounded-xl p-6 border border-red-500/20">
        <p className="text-red-100">
          Hiba történt az adatok betöltése közben. Kérjük, próbálja újra később.
        </p>
      </div>
    );
  }

  const cards = [
    {
      title: 'Összes Eladás',
      value: productData?.totalSales.toLocaleString('hu-HU') || '0',
      icon: '🛒',
      gradient: 'hover:bg-gradient-to-br hover:from-purple-500/20 hover:to-purple-600/20',
    },
    {
      title: 'Összes Bevétel',
      value: productData ? `${productData.totalRevenue.toLocaleString('hu-HU')} Ft` : '0 Ft',
      icon: '💰',
      gradient: 'hover:bg-gradient-to-br hover:from-green-500/20 hover:to-green-600/20',
    },
    {
      title: 'Legjobb Termék',
      value: productData?.bestSeller.productName || '-',
      icon: '🏆',
      subtitle: productData ? `${productData.bestSeller.revenue.toLocaleString('hu-HU')} Ft bevétel` : undefined,
      gradient: 'hover:bg-gradient-to-br hover:from-amber-500/20 hover:to-amber-600/20',
    },
    {
      title: 'Átlagos Kosárérték',
      value: productData ? `${productData.averageCartValue.toLocaleString('hu-HU')} Ft` : '0 Ft',
      icon: '📊',
      gradient: 'hover:bg-gradient-to-br hover:from-blue-500/20 hover:to-blue-600/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <ProductKPICard
          key={index}
          {...card}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
