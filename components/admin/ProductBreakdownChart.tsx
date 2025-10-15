/**
 * Product Breakdown Chart Component
 *
 * Displays pie chart showing revenue distribution across products
 * Interactive visualization with legend and tooltips
 */

'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/admin/swr-config';
import { ProductStat } from '@/types/admin-stats';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ProductBreakdownChartProps {
  days: number;
}

// Product color scheme (purple, rose, gold, green)
const PRODUCT_COLORS = ['#9333ea', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

/**
 * Custom Tooltip for Product Breakdown
 */
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="backdrop-blur-md bg-white/90 border border-gray-200 rounded-lg p-3 shadow-xl">
      <p className="text-sm font-semibold text-gray-900">{data.product_name}</p>
      <p className="text-lg font-bold" style={{ color: data.fill }}>
        {data.revenue.toLocaleString('hu-HU')} Ft
      </p>
      <p className="text-sm text-gray-600">
        {data.sales_count} eladás • {data.percentage}%
      </p>
    </div>
  );
}

/**
 * Custom Label for Pie Chart Slices
 */
interface CustomLabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
  product_name?: string;
}

function CustomLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  product_name,
}: CustomLabelProps) {
  if (!cx || !cy || !midAngle || !innerRadius || !outerRadius || !percent) return null;

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Only show label if percentage is >= 5%
  if (percent < 0.05) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={12}
      fontWeight="600"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

/**
 * Custom Legend Component
 */
interface CustomLegendProps {
  payload?: any[];
}

function CustomLegend({ payload }: CustomLegendProps) {
  if (!payload) return null;

  return (
    <div className="flex flex-wrap gap-3 justify-center mt-4">
      {payload.map((entry, index) => (
        <div key={`legend-${index}`} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-200">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Product Breakdown Chart Component
 */
export function ProductBreakdownChart({ days }: ProductBreakdownChartProps) {
  const { data: productData, isLoading, error } = useSWR<ProductStat[]>(
    `/api/admin/stats/products?days=${days}`,
    fetcher
  );

  if (error) {
    return (
      <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-4">Termék Bevételek</h3>
        <div className="flex items-center justify-center h-96 bg-red-500/10 rounded-lg border border-red-500/20">
          <p className="text-red-100">Hiba történt az adatok betöltése közben</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20 animate-pulse">
        <div className="h-8 bg-white/20 rounded mb-4 w-1/3"></div>
        <div className="h-96 bg-white/20 rounded"></div>
      </div>
    );
  }

  if (!productData || productData.length === 0) {
    return (
      <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-4">Termék Bevételek</h3>
        <div className="flex items-center justify-center h-96 bg-white/5 rounded-lg border border-white/10">
          <p className="text-gray-300">Nincs megjeleníthető adat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all">
      <h3 className="text-xl font-semibold text-white mb-4">Termék Bevételek</h3>

      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={productData as any}
            dataKey="revenue"
            nameKey="product_name"
            cx="50%"
            cy="50%"
            outerRadius={120}
            label={CustomLabel as any}
            labelLine={false}
          >
            {productData.map((entry: ProductStat, index: number) => (
              <Cell
                key={`cell-${index}`}
                fill={PRODUCT_COLORS[index % PRODUCT_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Product Stats Table */}
      <div className="mt-6 space-y-3">
        {productData.map((product: ProductStat, index: number) => (
          <div
            key={product.product_id}
            className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: PRODUCT_COLORS[index % PRODUCT_COLORS.length] }}
              />
              <div>
                <p className="text-sm font-semibold text-white">{product.product_name}</p>
                <p className="text-xs text-gray-400">{product.sales_count} eladás</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-white">
                {product.revenue.toLocaleString('hu-HU')} Ft
              </p>
              <p className="text-xs text-gray-400">{product.percentage}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
