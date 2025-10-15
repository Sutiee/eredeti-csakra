/**
 * Revenue Timeline Chart Component
 *
 * Time-series line chart showing revenue over time:
 * - Multiple product lines (color-coded)
 * - Toggle products on/off
 * - Hover tooltips with exact values
 */

'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TimelineData } from '@/types/admin-products';

interface RevenueTimelineChartProps {
  timeline: TimelineData[];
  isLoading?: boolean;
}

interface ProductToggle {
  id: string;
  name: string;
  color: string;
  enabled: boolean;
}

const PRODUCT_CONFIG: Record<string, { name: string; color: string }> = {
  detailed_pdf: { name: 'PDF Jelentés', color: '#9333ea' },
  ebook: { name: 'E-könyv', color: '#ec4899' },
  meditations: { name: 'Meditációk', color: '#f59e0b' },
  bundle: { name: 'Csomag', color: '#10b981' },
};

/**
 * Custom Tooltip
 */
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="backdrop-blur-md bg-white/90 rounded-lg p-4 border border-gray-200 shadow-lg">
        <p className="font-bold text-gray-900 mb-2">{new Date(label).toLocaleDateString('hu-HU')}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.value.toLocaleString('hu-HU')} Ft
          </p>
        ))}
        <p className="text-sm font-bold text-gray-900 mt-2 pt-2 border-t border-gray-200">
          Összesen: {payload.reduce((sum: number, entry: any) => sum + entry.value, 0).toLocaleString('hu-HU')} Ft
        </p>
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
    <div className="h-[350px] flex items-center justify-center">
      <div className="text-gray-300 animate-pulse">Grafikon betöltése...</div>
    </div>
  );
}

/**
 * Revenue Timeline Chart Component
 */
export function RevenueTimelineChart({ timeline, isLoading }: RevenueTimelineChartProps) {
  // Initialize product toggles
  const [productToggles, setProductToggles] = useState<ProductToggle[]>(
    Object.entries(PRODUCT_CONFIG).map(([id, config]) => ({
      id,
      name: config.name,
      color: config.color,
      enabled: true,
    }))
  );

  const toggleProduct = (productId: string) => {
    setProductToggles((prev) =>
      prev.map((toggle) =>
        toggle.id === productId ? { ...toggle, enabled: !toggle.enabled } : toggle
      )
    );
  };

  if (isLoading) {
    return (
      <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Bevételi Idővonalon</h3>
        <ChartSkeleton />
      </div>
    );
  }

  if (!timeline || timeline.length === 0) {
    return (
      <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20 text-center">
        <h3 className="text-xl font-bold text-white mb-4">Bevételi Idővonalon</h3>
        <p className="text-gray-300">Nincs megjeleníthető adat ebben az időszakban.</p>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">Bevételi Idővonalon</h3>
          <p className="text-sm text-gray-300 mt-1">Napi bevétel termékek szerint (HUF)</p>
        </div>

        {/* Product Toggles */}
        <div className="flex flex-wrap gap-2">
          {productToggles.map((toggle) => (
            <button
              key={toggle.id}
              onClick={() => toggleProduct(toggle.id)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all border ${
                toggle.enabled
                  ? 'bg-white/20 border-white/40 text-white'
                  : 'bg-white/5 border-white/10 text-gray-400'
              }`}
              style={
                toggle.enabled
                  ? { borderColor: toggle.color, backgroundColor: `${toggle.color}20` }
                  : {}
              }
            >
              <span
                className="inline-block w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: toggle.color }}
              ></span>
              {toggle.name}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={timeline}>
          <XAxis
            dataKey="date"
            tick={{ fill: '#e5e7eb', fontSize: 12 }}
            tickFormatter={(value) => new Date(value).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })}
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
          {productToggles.map((toggle) => (
            toggle.enabled && (
              <Line
                key={toggle.id}
                type="monotone"
                dataKey={toggle.id}
                stroke={toggle.color}
                strokeWidth={toggle.id === 'bundle' ? 3 : 2}
                name={toggle.name}
                dot={{ fill: toggle.color, r: 4 }}
                activeDot={{ r: 6 }}
              />
            )
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
