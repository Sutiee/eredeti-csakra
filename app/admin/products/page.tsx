/**
 * Admin Products Page
 * Product analytics and performance metrics dashboard
 */

'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProductKPICards } from '@/components/admin/ProductKPICards';
import { ProductTable } from '@/components/admin/ProductTable';
import { ProductPerformanceChart } from '@/components/admin/ProductPerformanceChart';
import { BundleAnalysis } from '@/components/admin/BundleAnalysis';
import { RevenueTimelineChart } from '@/components/admin/RevenueTimelineChart';
import useSWR from 'swr';
import { fetcher } from '@/lib/admin/swr-config';
import { ProductStats } from '@/types/admin-products';

/**
 * Date Range Picker Component
 */
interface DateRangePickerProps {
  value: number;
  onChange: (days: number) => void;
}

const DATE_RANGE_OPTIONS = [
  { label: 'Utolsó 7 nap', value: 7 },
  { label: 'Utolsó 30 nap', value: 30 },
  { label: 'Utolsó 90 nap', value: 90 },
  { label: 'Utolsó év', value: 365 },
];

function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  return (
    <div className="backdrop-blur-md bg-white/10 rounded-xl p-4 border border-white/20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Termék Teljesítmény</h2>
          <p className="text-sm text-gray-300 mt-1">
            Részletes eladási adatok és bevételi analitika
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {DATE_RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${
                  value === option.value
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-white/10 text-gray-200 hover:bg-white/20'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Error State Component
 */
function ErrorState({ message }: { message: string }) {
  return (
    <div className="backdrop-blur-md bg-red-500/10 rounded-xl p-6 border border-red-500/20">
      <p className="text-red-100">{message}</p>
    </div>
  );
}

/**
 * Admin Products Page Component
 */
export default function AdminProductsPage() {
  const [days, setDays] = useState(30);

  const { data, isLoading, error } = useSWR<ProductStats>(
    `/api/admin/products/stats?days=${days}`,
    fetcher,
    { refreshInterval: 60000 } // Refresh every minute
  );

  // Show error toast when data loading fails
  useEffect(() => {
    if (error) {
      toast.error('Hiba történt az adatok betöltése közben', {
        description: 'A termék adatokat nem sikerült betölteni. Próbálja újra később.',
        duration: 5000,
      });
    }
  }, [error]);

  return (
    <AdminLayout title="Termékek">
      <div className="space-y-6">
        {/* Date Range Picker */}
        <DateRangePicker value={days} onChange={setDays} />

        {/* Error State */}
        {error && (
          <ErrorState message="Nem sikerült betölteni a termék adatokat. Kérjük, próbálja újra később." />
        )}

        {/* KPI Cards */}
        <ProductKPICards days={days} />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProductPerformanceChart
            products={data?.products || []}
            isLoading={isLoading}
          />
          <BundleAnalysis
            bundleAnalysis={data?.bundleAnalysis || {
              bundleSales: 0,
              individualSales: 0,
              bundleRevenue: 0,
              individualRevenue: 0,
              averageDiscount: 0,
            }}
            isLoading={isLoading}
          />
        </div>

        {/* Revenue Timeline */}
        <RevenueTimelineChart
          timeline={data?.timeline || []}
          isLoading={isLoading}
        />

        {/* Product Table */}
        <ProductTable
          products={data?.products || []}
          isLoading={isLoading}
        />
      </div>
    </AdminLayout>
  );
}
