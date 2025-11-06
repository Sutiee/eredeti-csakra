/**
 * Admin Dashboard Components
 *
 * Barrel export for all admin dashboard visualization components
 */

// Layout Components (Agent 1)
export { AdminLayout } from './AdminLayout';
export { AdminSidebar } from './AdminSidebar';
export { AdminHeader } from './AdminHeader';
export { LogoutButton } from './LogoutButton';

// Data Visualization Components (Agent 2)
export { KPICards } from './KPICards';
export { TimeSeriesChart } from './TimeSeriesChart';
export { FunnelChart } from './FunnelChart';
export { ProductBreakdownChart } from './ProductBreakdownChart';
export { DateRangePicker } from './DateRangePicker';

// Newsletter Components
export { CSVUploadComponent } from './CSVUploadComponent';
export type { NewsletterRecipient } from './CSVUploadComponent';
export { CampaignHistoryTable } from './CampaignHistoryTable';
export type { CampaignSortColumn, CampaignSortDirection } from './CampaignHistoryTable';
export { CampaignStatsCards } from './CampaignStatsCards';
export type { CampaignStatsCardsProps } from './CampaignStatsCards';
export { TemplateVariantSelector } from './TemplateVariantSelector';
export type { TemplateVariantSelectorProps } from './TemplateVariantSelector';
export { SubjectLineSelector } from './SubjectLineSelector';
export type { SubjectLineSelectorProps } from './SubjectLineSelector';
export { CampaignProgressModal } from './CampaignProgressModal';
export type { CampaignProgressModalProps } from './CampaignProgressModal';
