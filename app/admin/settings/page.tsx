/**
 * Admin Settings Page
 * Placeholder for settings management (Agent 3)
 */

import { AdminLayout } from '@/components/admin/AdminLayout';

export default function AdminSettingsPage() {
  return (
    <AdminLayout title="Beállítások">
      <div className="backdrop-blur-md bg-white/70 rounded-2xl p-8 border border-white/50 shadow-lg text-center space-y-4">
        <span className="text-6xl block" aria-hidden="true">
          🔧
        </span>
        <h2 className="text-2xl font-bold text-gray-900">
          Beállítások oldal
        </h2>
        <p className="text-gray-600">
          Ez az oldal Agent 3 által lesz megvalósítva.
        </p>
      </div>
    </AdminLayout>
  );
}
