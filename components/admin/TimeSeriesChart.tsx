/**
 * Time Series Chart Component
 *
 * Displays line charts for visitors, revenue, or quiz completions over time
 * Uses Recharts for responsive, interactive data visualization
 */

'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/admin/swr-config';
import { TimeSeriesData, TimeSeriesMetric } from '@/types/admin-stats';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';

interface TimeSeriesChartProps {
  days: number;
  metric: TimeSeriesMetric;
  title: string;
  color: string;
}

/**
 * Custom Tooltip Component for Time Series Chart
 */
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  metric: TimeSeriesMetric;
}

function CustomTooltip({ active, payload, label, metric }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const value = payload[0].value;
  const formattedValue =
    metric === 'revenue'
      ? `${value.toLocaleString('hu-HU')} Ft`
      : value.toLocaleString('hu-HU');

  return (
    <div className="backdrop-blur-md bg-white/90 border border-gray-200 rounded-lg p-3 shadow-xl">
      <p className="text-sm font-semibold text-gray-900">
        {format(new Date(label!), 'PPP', { locale: hu })}
      </p>
      <p className="text-lg font-bold" style={{ color: payload[0].color }}>
        {formattedValue}
      </p>
    </div>
  );
}

/**
 * Time Series Chart Component
 */
export function TimeSeriesChart({ days, metric, title, color }: TimeSeriesChartProps) {
  const { data, isLoading, error } = useSWR<TimeSeriesData[]>(
    `/api/admin/stats/timeseries?days=${days}&metric=${metric}`,
    fetcher
  );

  if (error) {
    return (
      <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 bg-red-500/10 rounded-lg border border-red-500/20">
          <p className="text-red-100">Hiba történt az adatok betöltése közben</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20 animate-pulse">
        <div className="h-8 bg-white/20 rounded mb-4 w-1/3"></div>
        <div className="h-64 bg-white/20 rounded"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 bg-white/5 rounded-lg border border-white/10">
          <p className="text-gray-300">Nincs megjeleníthető adat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all">
      <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => format(new Date(date), 'MMM d', { locale: hu })}
            stroke="rgba(255,255,255,0.6)"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.6)"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) =>
              metric === 'revenue'
                ? `${(value / 1000).toFixed(0)}k`
                : value.toLocaleString('hu-HU')
            }
          />
          <Tooltip content={<CustomTooltip metric={metric} />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={3}
            dot={{ r: 4, fill: color, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, fill: color, strokeWidth: 2, stroke: '#fff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
