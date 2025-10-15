/**
 * Logout Button Component
 * Handles admin logout functionality
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error?.message || 'Kijelentkezési hiba történt');
      }

      // Success - redirect to login
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Hálózati hiba történt';
      setError(errorMessage);
      setIsLoading(false);

      // Show error toast for 3 seconds then clear
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Kijelentkezés"
      >
        <span className="text-xl" aria-hidden="true">
          🚪
        </span>
        <span className="font-medium">
          {isLoading ? 'Kijelentkezés...' : 'Kijelentkezés'}
        </span>
      </button>

      {/* Error Toast */}
      {error && (
        <div
          className="px-3 py-2 rounded-lg bg-red-500/90 text-white text-sm"
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  );
}
