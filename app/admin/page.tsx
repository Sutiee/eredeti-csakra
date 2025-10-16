/**
 * Admin Overview Page
 * Dashboard with real-time KPIs, charts, and analytics
 */

'use client';

import { useState } from 'react';
import { SWRConfig } from 'swr';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { KPICards } from '@/components/admin/KPICards';
import { TimeSeriesChart } from '@/components/admin/TimeSeriesChart';
import { FunnelChart } from '@/components/admin/FunnelChart';
import { ProductBreakdownChart } from '@/components/admin/ProductBreakdownChart';
import { DateRangePicker } from '@/components/admin/DateRangePicker';
import { swrConfig } from '@/lib/admin/swr-config';

/**
 * Admin Overview Page Component
 */
export default function AdminOverviewPage() {
  const [days, setDays] = useState(30);

  return (
    <AdminLayout title="Áttekintés">
      <SWRConfig value={swrConfig}>
        <div className="space-y-6">
          {/* Date Range Picker Header */}
          <DateRangePicker value={days} onChange={setDays} />

          {/* KPI Cards Grid */}
          <section aria-labelledby="kpi-section">
            <h2 id="kpi-section" className="sr-only">
              Főbb mutatók
            </h2>
            <KPICards days={days} />
          </section>

          {/* Time Series Charts */}
          <section aria-labelledby="timeseries-section">
            <h2 id="timeseries-section" className="sr-only">
              Idősor diagramok
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TimeSeriesChart
                days={days}
                metric="visitors"
                title="Látogatók"
                color="#9333ea"
              />
              <TimeSeriesChart
                days={days}
                metric="revenue"
                title="Bevétel"
                color="#ec4899"
              />
            </div>
          </section>

          {/* Funnel and Product Charts */}
          <section aria-labelledby="breakdown-section">
            <h2 id="breakdown-section" className="sr-only">
              Konverzió és termék elemzés
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FunnelChart days={days} />
              <ProductBreakdownChart days={days} />
            </div>
          </section>
        </div>
      </SWRConfig>
    </AdminLayout>
  );
}
