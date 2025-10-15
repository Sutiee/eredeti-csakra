# Admin Dashboard Components

This directory contains all chart components for the admin dashboard using Recharts.

## Component Overview

### 1. KPICards.tsx
**Purpose:** Display 6 key performance indicator cards in a responsive grid

**Features:**
- Glass morphism design with gradient borders
- Displays: Total Visitors, Completed Quizzes, Conversion Rate, Total Revenue, Average Order Value, Active Sessions
- Loading skeletons
- Auto-refresh every 30 seconds via SWR

**API Endpoint:** `GET /api/admin/stats/kpis?days={days}`

**Usage:**
```tsx
<KPICards days={30} />
```

---

### 2. TimeSeriesChart.tsx
**Purpose:** Line chart for time-series data (visitors, revenue, quizzes)

**Features:**
- Recharts LineChart with custom tooltips
- Date formatting in Hungarian locale
- Responsive design
- Gradient line with animated dots
- Support for multiple metrics

**API Endpoint:** `GET /api/admin/stats/timeseries?days={days}&metric={metric}`

**Usage:**
```tsx
<TimeSeriesChart
  days={30}
  metric="visitors"
  title="Látogatók"
  color="#9333ea"
/>
```

---

### 3. FunnelChart.tsx
**Purpose:** Horizontal bar chart showing conversion funnel stages

**Features:**
- Gradient colors from purple to rose
- Percentage labels on bars
- Custom tooltips with stage details
- Summary stats at bottom

**API Endpoint:** `GET /api/admin/stats/funnel?days={days}`

**Usage:**
```tsx
<FunnelChart days={30} />
```

---

### 4. ProductBreakdownChart.tsx
**Purpose:** Pie chart showing revenue distribution across products

**Features:**
- Interactive pie chart with custom labels
- Color-coded legend
- Product stats table below chart
- Percentage calculations

**API Endpoint:** `GET /api/admin/stats/products?days={days}`

**Usage:**
```tsx
<ProductBreakdownChart days={30} />
```

---

### 5. DateRangePicker.tsx
**Purpose:** Date range selector for filtering dashboard data

**Features:**
- Button group with 4 options (7, 30, 90, 365 days)
- Active state styling
- Hungarian labels

**Usage:**
```tsx
<DateRangePicker value={days} onChange={setDays} />
```

---

## Data Flow

```
User selects date range
        ↓
DateRangePicker updates state
        ↓
All components receive new `days` prop
        ↓
SWR fetches data from API routes
        ↓
Charts render with new data
```

## SWR Configuration

Location: `lib/admin/swr-config.ts`

Features:
- Auto-refresh: 30 seconds
- Revalidate on focus/reconnect
- 5-second deduping interval
- Error handling

## Type Definitions

All types are defined in `types/admin-stats.ts`:
- `KPIStats`
- `TimeSeriesData`
- `FunnelStage`
- `ProductStat`
- `TimeSeriesMetric`

## Integration Example

```tsx
'use client';

import { useState } from 'react';
import { SWRConfig } from 'swr';
import { swrConfig } from '@/lib/admin/swr-config';
import {
  KPICards,
  TimeSeriesChart,
  FunnelChart,
  ProductBreakdownChart,
  DateRangePicker,
} from '@/components/admin';

export default function AdminDashboard() {
  const [days, setDays] = useState(30);

  return (
    <SWRConfig value={swrConfig}>
      <DateRangePicker value={days} onChange={setDays} />
      <KPICards days={days} />

      <div className="grid grid-cols-2 gap-6">
        <TimeSeriesChart days={days} metric="visitors" title="Visitors" color="#9333ea" />
        <TimeSeriesChart days={days} metric="revenue" title="Revenue" color="#ec4899" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <FunnelChart days={days} />
        <ProductBreakdownChart days={days} />
      </div>
    </SWRConfig>
  );
}
```

## Dependencies

- **recharts**: ^3.2.1 - Charting library
- **date-fns**: ^4.1.0 - Date formatting
- **swr**: ^2.3.6 - Data fetching and caching

## Testing Checklist

- [ ] Navigate to `/admin` after login
- [ ] Verify all KPI cards display data
- [ ] Test date range picker (7, 30, 90, 365 days)
- [ ] Check all charts render correctly
- [ ] Verify responsive behavior on mobile/tablet/desktop
- [ ] Test loading states (throttle network in DevTools)
- [ ] Test error states (disconnect API)
- [ ] Verify auto-refresh (wait 30 seconds)
- [ ] Check hover tooltips on charts
- [ ] Verify Hungarian date formatting

## Design System

**Colors:**
- Purple: `#9333ea` (primary)
- Rose: `#ec4899` (secondary)
- Gold: `#f59e0b` (accent)
- Green: `#10b981` (success)
- Blue: `#3b82f6` (info)

**Effects:**
- Glass morphism: `backdrop-blur-md bg-white/10`
- Borders: `border border-white/20`
- Hover: `hover:border-white/40`
- Shadow: `shadow-xl`
