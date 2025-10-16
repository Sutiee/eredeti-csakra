/**
 * KPI Cards Component
 *
 * Displays 6 key performance indicator cards in a responsive grid
 * with glass morphism design and gradient borders
 */

'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/admin/swr-config';
import { KPIStats } from '@/types/admin-stats';

interface KPICardsProps {
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
 * Individual KPI Card Component
 * Glass morphism card with gradient border and hover effects
 */
function KPICard({ title, value, icon, subtitle, gradient, isLoading }: KPICardProps) {
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
        hover:border-gray-600 transition-all duration-300 transform hover:scale-105
        hover:shadow-xl ${gradient}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-4xl">{icon}</div>
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-300">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-400">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

/**
 * KPI Cards Grid Component
 * Fetches and displays all 6 KPI metrics
 */
export function KPICards({ days = 30 }: KPICardsProps) {
  const { data: kpiData, isLoading, error } = useSWR<KPIStats>(
    `/api/admin/stats/kpis?days=${days}`,
    fetcher
  );

  if (error) {
    return (
      <div className="backdrop-blur-md bg-red-500/10 rounded-xl p-6 border border-red-500/20">
        <p className="text-red-300">
          Hiba történt az adatok betöltése közben. Kérjük, próbálja újra később.
        </p>
      </div>
    );
  }

  const cards = [
    {
      title: 'Összes Látogató',
      value: kpiData?.totalVisitors.toLocaleString('hu-HU') || '0',
      icon: '👥',
      gradient: 'hover:bg-gradient-to-br hover:from-purple-500/20 hover:to-purple-600/20',
    },
    {
      title: 'Kitöltött Kvízek',
      value: kpiData?.completedQuizzes.toLocaleString('hu-HU') || '0',
      icon: '✅',
      gradient: 'hover:bg-gradient-to-br hover:from-rose-500/20 hover:to-rose-600/20',
    },
    {
      title: 'Konverziós Arány',
      value: kpiData ? `${kpiData.conversionRate.toFixed(2)}%` : '0%',
      icon: '📈',
      gradient: 'hover:bg-gradient-to-br hover:from-amber-500/20 hover:to-amber-600/20',
    },
    {
      title: 'Összes Bevétel',
      value: kpiData ? `${kpiData.totalRevenue.toLocaleString('hu-HU')} Ft` : '0 Ft',
      icon: '💰',
      gradient: 'hover:bg-gradient-to-br hover:from-green-500/20 hover:to-green-600/20',
    },
    {
      title: 'Átlagos Rendelés',
      value: kpiData ? `${kpiData.averageOrderValue.toLocaleString('hu-HU')} Ft` : '0 Ft',
      icon: '🛒',
      gradient: 'hover:bg-gradient-to-br hover:from-blue-500/20 hover:to-blue-600/20',
    },
    {
      title: 'Aktív Sessionök',
      value: kpiData?.activeSessions.toLocaleString('hu-HU') || '0',
      icon: '🔄',
      subtitle: 'Utolsó 24 óra',
      gradient: 'hover:bg-gradient-to-br hover:from-indigo-500/20 hover:to-indigo-600/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <KPICard
          key={index}
          {...card}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
