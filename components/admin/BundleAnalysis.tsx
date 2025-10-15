/**
 * Bundle Analysis Component
 *
 * Compares bundle sales vs individual product sales:
 * - Pie chart visualization
 * - Key metrics (sales count, revenue, discount)
 * - Common product combinations table
 */

'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BundleAnalysis as BundleAnalysisType } from '@/types/admin-products';

interface BundleAnalysisProps {
  bundleAnalysis: BundleAnalysisType;
  isLoading?: boolean;
}

const COLORS = {
  bundle: '#10b981', // Green
  individual: '#ec4899', // Rose
};

/**
 * Custom Tooltip for Pie Chart
 */
function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="backdrop-blur-md bg-white/90 rounded-lg p-4 border border-gray-200 shadow-lg">
        <p className="font-bold text-gray-900 mb-2">{data.name}</p>
        <p className="text-sm text-gray-700">
          Eladások: {data.payload.sales.toLocaleString('hu-HU')}
        </p>
        <p className="text-sm text-gray-700">
          Bevétel: {data.payload.revenue.toLocaleString('hu-HU')} Ft
        </p>
        <p className="text-sm font-bold" style={{ color: data.payload.fill }}>
          {data.value.toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
}

/**
 * Loading Skeleton
 */
function AnalysisSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-[300px] bg-white/5 rounded-lg animate-pulse"></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-20 bg-white/5 rounded-lg animate-pulse"></div>
        <div className="h-20 bg-white/5 rounded-lg animate-pulse"></div>
      </div>
    </div>
  );
}

/**
 * Bundle Analysis Component
 */
export function BundleAnalysis({ bundleAnalysis, isLoading }: BundleAnalysisProps) {
  if (isLoading) {
    return (
      <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Csomag vs. Egyedi Vásárlás</h3>
        <AnalysisSkeleton />
      </div>
    );
  }

  if (!bundleAnalysis) {
    return (
      <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20 text-center">
        <h3 className="text-xl font-bold text-white mb-4">Csomag vs. Egyedi Vásárlás</h3>
        <p className="text-gray-300">Nincs megjeleníthető adat ebben az időszakban.</p>
      </div>
    );
  }

  const totalSales = bundleAnalysis.bundleSales + bundleAnalysis.individualSales;
  const bundlePercentage = totalSales > 0 ? (bundleAnalysis.bundleSales / totalSales) * 100 : 0;
  const individualPercentage = totalSales > 0 ? (bundleAnalysis.individualSales / totalSales) * 100 : 0;

  const pieData = [
    {
      name: 'Csomag vásárlások',
      value: bundlePercentage,
      sales: bundleAnalysis.bundleSales,
      revenue: bundleAnalysis.bundleRevenue,
      fill: COLORS.bundle,
    },
    {
      name: 'Egyedi vásárlások',
      value: individualPercentage,
      sales: bundleAnalysis.individualSales,
      revenue: bundleAnalysis.individualRevenue,
      fill: COLORS.individual,
    },
  ];

  return (
    <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">Csomag vs. Egyedi Vásárlás</h3>
      <p className="text-sm text-gray-300 mb-6">Vásárlási mintázatok összehasonlítása</p>

      {/* Pie Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(props: any) => `${props.name}: ${(props.value as number).toFixed(1)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Metrics Grid */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
          <p className="text-xs text-green-300 uppercase mb-1">Csomag Bevétel</p>
          <p className="text-2xl font-bold text-green-400">
            {bundleAnalysis.bundleRevenue.toLocaleString('hu-HU')} Ft
          </p>
          <p className="text-xs text-green-300 mt-1">
            {bundleAnalysis.bundleSales} eladás
          </p>
        </div>

        <div className="bg-rose-500/10 rounded-lg p-4 border border-rose-500/20">
          <p className="text-xs text-rose-300 uppercase mb-1">Egyedi Bevétel</p>
          <p className="text-2xl font-bold text-rose-400">
            {bundleAnalysis.individualRevenue.toLocaleString('hu-HU')} Ft
          </p>
          <p className="text-xs text-rose-300 mt-1">
            {bundleAnalysis.individualSales} eladás
          </p>
        </div>
      </div>

      {/* Average Discount */}
      <div className="mt-4 bg-amber-500/10 rounded-lg p-4 border border-amber-500/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-300 uppercase mb-1">Átlagos Csomag Megtakarítás</p>
            <p className="text-xl font-bold text-amber-400">
              {bundleAnalysis.averageDiscount.toFixed(0)}%
            </p>
          </div>
          <div className="text-3xl">💰</div>
        </div>
      </div>

      {/* Common Combinations */}
      {bundleAnalysis.commonCombinations && bundleAnalysis.commonCombinations.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-bold text-white mb-3">Népszerű Kombinációk</h4>
          <div className="space-y-2">
            {bundleAnalysis.commonCombinations.map((combo, index) => (
              <div
                key={index}
                className="bg-white/5 rounded-lg p-3 border border-white/10 flex items-center justify-between"
              >
                <span className="text-sm text-gray-200">{combo.combination}</span>
                <span className="text-sm font-bold text-white bg-white/10 px-3 py-1 rounded-full">
                  {combo.count}×
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
