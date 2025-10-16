/**
 * Funnel Chart Component
 *
 * Displays conversion funnel visualization using horizontal bar chart
 * Shows user journey from landing page to purchase
 */

'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/admin/swr-config';
import { FunnelStage } from '@/types/admin-stats';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';

interface FunnelChartProps {
  days: number;
}

// Gradient colors for each funnel stage (purple -> rose)
const FUNNEL_COLORS = [
  '#9333ea', // purple-600
  '#a855f7', // purple-500
  '#c084fc', // purple-400
  '#d8b4fe', // purple-300
  '#e9d5ff', // purple-200
  '#f3e8ff', // purple-100
  '#fce7f3', // pink-100
  '#fda4af', // rose-300
];

/**
 * Custom Tooltip for Funnel Chart
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
    <div className="backdrop-blur-md bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-xl">
      <p className="text-sm font-semibold text-white">{data.stage}</p>
      <p className="text-lg font-bold text-purple-600">
        {data.count.toLocaleString('hu-HU')} felhasználó
      </p>
      <p className="text-sm text-gray-300">{data.percentage}% az előző lépéshez képest</p>
    </div>
  );
}

/**
 * Custom Label Component for Funnel Bars
 */
interface CustomLabelProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: number;
  percentage?: number;
}

function CustomLabel({ x, y, width, height, value, percentage }: CustomLabelProps) {
  if (!x || !y || !width || !height || !value) return null;

  return (
    <text
      x={x + width + 10}
      y={y + height / 2}
      fill="#fff"
      textAnchor="start"
      dominantBaseline="middle"
      fontSize={14}
      fontWeight="600"
    >
      {value.toLocaleString('hu-HU')} ({percentage}%)
    </text>
  );
}

/**
 * Funnel Chart Component
 */
export function FunnelChart({ days }: FunnelChartProps) {
  const { data: funnelData, isLoading, error } = useSWR<FunnelStage[]>(
    `/api/admin/stats/funnel?days=${days}`,
    fetcher
  );

  if (error) {
    return (
      <div className="backdrop-blur-md bg-gray-800/70 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Konverziós Tölcsér</h3>
        <div className="flex items-center justify-center h-96 bg-red-500/10 rounded-lg border border-red-500/20">
          <p className="text-red-100">Hiba történt az adatok betöltése közben</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="backdrop-blur-md bg-gray-800/70 rounded-xl p-6 border border-gray-700 animate-pulse">
        <div className="h-8 bg-gray-700 rounded mb-4 w-1/3"></div>
        <div className="h-96 bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (!funnelData || funnelData.length === 0) {
    return (
      <div className="backdrop-blur-md bg-gray-800/70 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Konverziós Tölcsér</h3>
        <div className="flex items-center justify-center h-96 bg-gray-800/50 rounded-lg border border-white/10">
          <p className="text-gray-300">Nincs megjeleníthető adat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-md bg-gray-800/70 rounded-xl p-6 border border-gray-700 hover:border-white/40 transition-all">
      <h3 className="text-xl font-semibold text-white mb-4">Konverziós Tölcsér</h3>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={funnelData}
          layout="vertical"
          margin={{ top: 20, right: 100, left: 20, bottom: 20 }}
        >
          <XAxis
            type="number"
            stroke="rgba(255,255,255,0.6)"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            dataKey="stage"
            type="category"
            width={150}
            stroke="rgba(255,255,255,0.6)"
            style={{ fontSize: '12px' }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.1)' }} />
          <Bar dataKey="count" radius={[0, 8, 8, 0]}>
            {funnelData.map((entry: FunnelStage, index: number) => (
              <Cell key={`cell-${index}`} fill={FUNNEL_COLORS[index % FUNNEL_COLORS.length]} />
            ))}
            <LabelList
              dataKey="count"
              content={(props: any) => (
                <CustomLabel {...props} percentage={props.payload?.percentage} />
              )}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-300">Összes Látogató</p>
            <p className="text-2xl font-bold text-white">
              {funnelData[0]?.count.toLocaleString('hu-HU') || '0'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-300">Vásárolt</p>
            <p className="text-2xl font-bold text-white">
              {funnelData[funnelData.length - 1]?.count.toLocaleString('hu-HU') || '0'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
