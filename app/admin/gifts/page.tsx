/**
 * Admin Gift Analytics Dashboard
 * /admin/gifts
 *
 * View and manage gift purchases, analytics, and redemptions
 */

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type GiftPurchase = {
  id: string;
  buyer_email: string;
  buyer_name: string | null;
  recipient_email: string | null;
  gift_message: string | null;
  product_id: string;
  variant_id: string;
  gift_code: string;
  status: 'pending' | 'active' | 'redeemed' | 'expired' | 'cancelled';
  redeemed_at: string | null;
  expires_at: string;
  created_at: string;
};

type GiftStats = {
  total_gifts: number;
  active_gifts: number;
  redeemed_gifts: number;
  expired_gifts: number;
  redemption_rate: number;
  total_revenue: number;
};

export default function AdminGiftsPage() {
  const [gifts, setGifts] = useState<GiftPurchase[]>([]);
  const [stats, setStats] = useState<GiftStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'redeemed' | 'expired'>('all');

  useEffect(() => {
    fetchGifts();
  }, []);

  const fetchGifts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/gifts');
      const data = await response.json();

      if (data.data) {
        setGifts(data.data.gifts || []);
        setStats(data.data.stats || null);
      }
    } catch (error) {
      console.error('[ADMIN GIFTS] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGifts = gifts.filter((gift) => {
    if (filter === 'all') return true;
    return gift.status === filter;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      redeemed: 'bg-blue-100 text-blue-800',
      expired: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return badges[status as keyof typeof badges] || badges.active;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading gifts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎁 Gift Analytics & Management
          </h1>
          <p className="text-gray-600">
            View and manage gift purchases, track redemptions, and analyze performance
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              className="bg-white rounded-lg shadow p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Gifts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_gifts}</p>
                </div>
                <div className="text-4xl">🎁</div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white rounded-lg shadow p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active_gifts}</p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white rounded-lg shadow p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Redeemed</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.redeemed_gifts}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.redemption_rate.toFixed(1)}% rate
                  </p>
                </div>
                <div className="text-4xl">🎉</div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white rounded-lg shadow p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.total_revenue.toLocaleString('hu-HU')} Ft
                  </p>
                </div>
                <div className="text-4xl">💰</div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-gray-700">Filter:</span>
            {(['all', 'active', 'redeemed', 'expired'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
            <span className="ml-auto text-sm text-gray-600">
              {filteredGifts.length} gift{filteredGifts.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Gifts Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gift Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Buyer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expires
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGifts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No gifts found for this filter
                    </td>
                  </tr>
                ) : (
                  filteredGifts.map((gift) => (
                    <tr key={gift.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                          {gift.gift_code}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{gift.buyer_name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{gift.buyer_email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {gift.recipient_email || <span className="text-gray-400">Not set</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs">
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            {gift.product_id}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                            gift.status
                          )}`}
                        >
                          {gift.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(gift.created_at).toLocaleDateString('hu-HU')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(gift.expires_at).toLocaleDateString('hu-HU')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
