/**
 * Campaign History Table Component
 *
 * Displays list of past newsletter campaigns with sortable columns,
 * expandable details, and CSV export functionality
 */

'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import { NewsletterCampaign } from '@/types';

export type CampaignSortColumn = keyof NewsletterCampaign;
export type CampaignSortDirection = 'asc' | 'desc';

interface CampaignHistoryTableProps {
  campaigns: NewsletterCampaign[];
  onCampaignClick?: (campaignId: string) => void;
  onExportCampaign?: (campaignId: string) => void;
  isLoading?: boolean;
}

/**
 * Get status badge styling
 */
function getStatusBadge(status: NewsletterCampaign['status']): JSX.Element {
  const badges = {
    draft: (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500/20 text-gray-300 border border-gray-500/50">
        📝 Piszkozat
      </span>
    ),
    sending: (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/50">
        <svg
          className="animate-spin -ml-1 mr-2 h-3 w-3 text-blue-300"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        Küldés folyamatban
      </span>
    ),
    completed: (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/50">
        ✓ Befejezett
      </span>
    ),
    failed: (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/50">
        ✗ Sikertelen
      </span>
    ),
  };

  return badges[status] || badges.draft;
}

/**
 * Calculate success rate
 */
function calculateSuccessRate(campaign: NewsletterCampaign): string {
  if (campaign.total_recipients === 0) return '0%';
  const rate = ((campaign.sent_count / campaign.total_recipients) * 100).toFixed(1);
  return `${rate}%`;
}

/**
 * Loading skeleton for table
 */
function TableSkeleton(): JSX.Element {
  return (
    <div className="backdrop-blur-md bg-gray-800/70 rounded-2xl border border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800 sticky top-0">
            <tr>
              {[...Array(7)].map((_, i) => (
                <th key={i} className="px-4 py-3">
                  <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-t border-gray-700">
                {[...Array(7)].map((_, j) => (
                  <td key={j} className="px-4 py-3">
                    <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
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
function EmptyState(): JSX.Element {
  return (
    <div className="backdrop-blur-md bg-gray-800/70 rounded-2xl border border-gray-700 p-12 text-center">
      <div className="text-6xl mb-4" aria-hidden="true">
        📧
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">
        Nincsenek kampányok
      </h3>
      <p className="text-gray-400">
        Még nem indítottál egyetlen kampányt sem. Kezdj el egy új kampányt a fenti gombbal.
      </p>
    </div>
  );
}

/**
 * Main Campaign History Table Component
 */
export function CampaignHistoryTable({
  campaigns,
  onCampaignClick,
  onExportCampaign,
  isLoading = false,
}: CampaignHistoryTableProps): JSX.Element {
  const [sortColumn, setSortColumn] = useState<CampaignSortColumn>('created_at');
  const [sortDirection, setSortDirection] = useState<CampaignSortDirection>('desc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Sort campaigns
  const sortedCampaigns = [...campaigns].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

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

  /**
   * Handle sort
   */
  const handleSort = (column: CampaignSortColumn): void => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  /**
   * Toggle row expansion
   */
  const toggleRow = (campaignId: string): void => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(campaignId)) {
      newExpanded.delete(campaignId);
    } else {
      newExpanded.add(campaignId);
    }
    setExpandedRows(newExpanded);
  };

  /**
   * Sort indicator icon
   */
  const SortIcon = ({ column }: { column: CampaignSortColumn }): JSX.Element => {
    if (sortColumn !== column) {
      return <span className="text-gray-500 ml-1">↕</span>;
    }
    return (
      <span className="text-purple-400 ml-1">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  /**
   * Render sortable header cell
   */
  const renderHeader = (column: CampaignSortColumn, label: string): JSX.Element => (
    <th
      className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700/50 transition-colors duration-200 select-none"
      onClick={() => handleSort(column)}
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
          handleSort(column);
        }
      }}
    >
      <div className="flex items-center">
        {label}
        <SortIcon column={column} />
      </div>
    </th>
  );

  // Loading state
  if (isLoading) {
    return <TableSkeleton />;
  }

  // Empty state
  if (campaigns.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="backdrop-blur-md bg-gray-800/70 rounded-2xl border border-gray-700 overflow-hidden shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full" role="table">
          <thead className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 w-8"></th>
              {renderHeader('name', 'Kampány Név')}
              {renderHeader('created_at', 'Dátum')}
              {renderHeader('total_recipients', 'Címzettek')}
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Sikerességi Arány
              </th>
              {renderHeader('status', 'Állapot')}
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider sticky right-0 bg-gray-800">
                Műveletek
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedCampaigns.map((campaign) => {
              const isExpanded = expandedRows.has(campaign.id);
              const successRate = calculateSuccessRate(campaign);

              return (
                <>
                  {/* Main row */}
                  <tr
                    key={campaign.id}
                    className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer"
                    onClick={() => toggleRow(campaign.id)}
                    role="row"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleRow(campaign.id);
                      }
                    }}
                  >
                    {/* Expand icon */}
                    <td className="px-4 py-3 text-gray-400">
                      <span className="text-lg transition-transform duration-200" style={{ display: 'inline-block', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                        ▶
                      </span>
                    </td>

                    {/* Campaign Name */}
                    <td className="px-4 py-3 text-sm font-medium text-white">
                      {campaign.name}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-sm text-gray-300 whitespace-nowrap">
                      {format(new Date(campaign.created_at), 'yyyy. MM. dd. HH:mm', {
                        locale: hu,
                      })}
                    </td>

                    {/* Recipients */}
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {campaign.total_recipients.toLocaleString('hu-HU')}
                    </td>

                    {/* Success Rate */}
                    <td className="px-4 py-3 text-sm font-medium text-white">
                      {successRate}
                      <span className="text-xs text-gray-400 ml-1">
                        ({campaign.sent_count}/{campaign.total_recipients})
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      {getStatusBadge(campaign.status)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 sticky right-0 bg-gray-800/70">
                      <div className="flex gap-2">
                        {campaign.status === 'completed' && onExportCampaign && (
                          <button
                            className="inline-flex items-center px-3 py-1.5 border border-gray-600 text-xs font-medium rounded-md text-gray-300 bg-gray-700/50 hover:bg-gray-600/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              onExportCampaign(campaign.id);
                            }}
                            aria-label={`${campaign.name} exportálása CSV-be`}
                          >
                            📥 CSV
                          </button>
                        )}
                        {onCampaignClick && (
                          <button
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-700 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              onCampaignClick(campaign.id);
                            }}
                            aria-label={`${campaign.name} részleteinek megtekintése`}
                          >
                            Részletek
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded details row */}
                  {isExpanded && (
                    <tr className="bg-gray-700/30 border-b border-gray-700">
                      <td colSpan={7} className="px-4 py-4">
                        <div className="ml-8 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs font-medium text-gray-400 mb-1">Tárgy sor</p>
                              <p className="text-sm text-white">{campaign.subject}</p>
                            </div>
                            {campaign.started_at && (
                              <div>
                                <p className="text-xs font-medium text-gray-400 mb-1">Küldés kezdete</p>
                                <p className="text-sm text-white">
                                  {format(new Date(campaign.started_at), 'yyyy. MM. dd. HH:mm:ss', {
                                    locale: hu,
                                  })}
                                </p>
                              </div>
                            )}
                            {campaign.completed_at && (
                              <div>
                                <p className="text-xs font-medium text-gray-400 mb-1">Befejezve</p>
                                <p className="text-sm text-white">
                                  {format(new Date(campaign.completed_at), 'yyyy. MM. dd. HH:mm:ss', {
                                    locale: hu,
                                  })}
                                </p>
                              </div>
                            )}
                          </div>

                          {campaign.failed_count > 0 && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                              <p className="text-sm font-medium text-red-300">
                                ⚠ Sikertelen: {campaign.failed_count} email
                              </p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
