/**
 * Admin Users Page
 * Placeholder for user management (Agent 3)
 */

import { AdminLayout } from '@/components/admin/AdminLayout';

export default function AdminUsersPage() {
  return (
    <AdminLayout title="Felhasználók">
      <div className="backdrop-blur-md bg-white/70 rounded-2xl p-8 border border-white/50 shadow-lg text-center space-y-4">
        <span className="text-6xl block" aria-hidden="true">
          👥
        </span>
        <h2 className="text-2xl font-bold text-gray-900">
          Felhasználók oldal
        </h2>
        <p className="text-gray-600">
          Ez az oldal Agent 3 által lesz megvalósítva.
        </p>
      </div>
    </AdminLayout>
  );
}
