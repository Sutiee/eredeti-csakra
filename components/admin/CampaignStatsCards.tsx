/**
 * Campaign Stats Cards Component
 *
 * Displays 4 key campaign statistics in a responsive grid
 * with glass morphism design matching admin UI
 */

'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import { NewsletterCampaign } from '@/types';

export interface CampaignStatsCardsProps {
  campaigns: NewsletterCampaign[];
  isLoading?: boolean;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  subtitle?: string;
  gradient: string;
  isLoading?: boolean;
}

/**
 * Individual Stat Card Component
 * Glass morphism card with gradient border and hover effects
 */
function StatCard({
  title,
  value,
  icon,
  subtitle,
  gradient,
  isLoading,
}: StatCardProps): JSX.Element {
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
        <div className="text-4xl" aria-hidden="true">
          {icon}
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-300">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
    </div>
  );
}

/**
 * Campaign Stats Cards Grid Component
 * Calculates and displays campaign statistics
 */
export function CampaignStatsCards({
  campaigns,
  isLoading = false,
}: CampaignStatsCardsProps): JSX.Element {
  // Calculate statistics
  const stats = useMemo(() => {
    const totalCampaigns = campaigns.length;
    const totalEmailsSent = campaigns.reduce((sum, c) => sum + c.sent_count, 0);

    // Calculate average success rate
    const completedCampaigns = campaigns.filter(c => c.status === 'completed');
    const avgSuccessRate =
      completedCampaigns.length > 0
        ? completedCampaigns.reduce((sum, c) => {
            const rate =
              c.total_recipients > 0
                ? (c.sent_count / c.total_recipients) * 100
                : 0;
            return sum + rate;
          }, 0) / completedCampaigns.length
        : 0;

    // Find last campaign
    const sortedByDate = [...campaigns].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const lastCampaign = sortedByDate[0];

    return {
      totalCampaigns,
      totalEmailsSent,
      avgSuccessRate,
      lastCampaign,
    };
  }, [campaigns]);

  const cards = [
    {
      title: 'Összes Kampány',
      value: stats.totalCampaigns.toLocaleString('hu-HU'),
      icon: '📧',
      gradient:
        'hover:bg-gradient-to-br hover:from-purple-500/20 hover:to-purple-600/20',
    },
    {
      title: 'Összes Elküldött Email',
      value: stats.totalEmailsSent.toLocaleString('hu-HU'),
      icon: '📨',
      gradient:
        'hover:bg-gradient-to-br hover:from-blue-500/20 hover:to-blue-600/20',
    },
    {
      title: 'Átlagos Sikerességi Arány',
      value: `${stats.avgSuccessRate.toFixed(1)}%`,
      icon: '✅',
      gradient:
        'hover:bg-gradient-to-br hover:from-green-500/20 hover:to-green-600/20',
    },
    {
      title: 'Legutóbbi Kampány',
      value: stats.lastCampaign?.name || 'Nincs adat',
      icon: '📅',
      subtitle: stats.lastCampaign
        ? format(new Date(stats.lastCampaign.created_at), 'yyyy. MM. dd.', {
            locale: hu,
          })
        : undefined,
      gradient:
        'hover:bg-gradient-to-br hover:from-rose-500/20 hover:to-rose-600/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <StatCard key={index} {...card} isLoading={isLoading} />
      ))}
    </div>
  );
}
