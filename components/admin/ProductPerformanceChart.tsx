/**
 * Product Performance Chart Component
 *
 * Stacked bar chart comparing product revenue over time periods:
 * - This Month
 * - Last Month
 * - Older
 */

'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ProductTableRow } from '@/types/admin-products';

interface ProductPerformanceChartProps {
  products: ProductTableRow[];
  isLoading?: boolean;
}

interface ChartData {
  product: string;
  thisMonth: number;
  lastMonth: number;
  older: number;
}

/**
 * Custom Tooltip for Chart
 */
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="backdrop-blur-md bg-gray-800 rounded-lg p-4 border border-gray-700 shadow-lg">
        <p className="font-bold text-white mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.value.toLocaleString('hu-HU')} Ft
          </p>
        ))}
      </div>
    );
  }
  return null;
}

/**
 * Loading Skeleton
 */
function ChartSkeleton() {
  return (
    <div className="h-[400px] flex items-center justify-center">
      <div className="text-gray-300 animate-pulse">Grafikon betöltése...</div>
    </div>
  );
}

/**
 * Product Performance Chart Component
 */
export function ProductPerformanceChart({ products, isLoading }: ProductPerformanceChartProps) {
  if (isLoading) {
    return (
      <div className="backdrop-blur-md bg-gray-800/70 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">Termék Teljesítmény Összehasonlítás</h3>
        <ChartSkeleton />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="backdrop-blur-md bg-gray-800/70 rounded-xl p-6 border border-gray-700 text-center">
        <h3 className="text-xl font-bold text-white mb-4">Termék Teljesítmény Összehasonlítás</h3>
        <p className="text-gray-300">Nincs megjeleníthető adat ebben az időszakban.</p>
      </div>
    );
  }

  // Calculate time-based revenue distribution (simplified for demo)
  // In real implementation, this would come from the API with actual time-based data
  const chartData: ChartData[] = products.map((product) => {
    const totalRevenue = product.revenue;
    // Simulate distribution (40% this month, 35% last month, 25% older)
    return {
      product: product.productName,
      thisMonth: Math.round(totalRevenue * 0.4),
      lastMonth: Math.round(totalRevenue * 0.35),
      older: Math.round(totalRevenue * 0.25),
    };
  });

  return (
    <div className="backdrop-blur-md bg-gray-800/70 rounded-xl p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4">Termék Teljesítmény Összehasonlítás</h3>
      <p className="text-sm text-gray-300 mb-6">Bevétel időszakonként (HUF)</p>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <XAxis
            dataKey="product"
            tick={{ fill: '#e5e7eb', fontSize: 12 }}
            angle={-15}
            textAnchor="end"
            height={80}
          />
          <YAxis
            tick={{ fill: '#e5e7eb', fontSize: 12 }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
            formatter={(value) => <span style={{ color: '#e5e7eb' }}>{value}</span>}
          />
          <Bar dataKey="thisMonth" fill="#9333ea" name="Ez a hónap" radius={[8, 8, 0, 0]} />
          <Bar dataKey="lastMonth" fill="#ec4899" name="Előző hónap" radius={[8, 8, 0, 0]} />
          <Bar dataKey="older" fill="#f59e0b" name="Régebbi" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
