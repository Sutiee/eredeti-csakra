/**
 * Toaster Component
 *
 * Toast notification provider using Sonner library
 * Configured with dark theme to match admin dashboard
 */

'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: '#111827', // gray-900
          color: '#ffffff',
          border: '1px solid #374151', // gray-700
        },
        classNames: {
          toast: 'backdrop-blur-md',
          title: 'text-white font-medium',
          description: 'text-gray-300',
          error: 'border-red-500/50 bg-gray-900',
          success: 'border-spiritual-purple-600/50 bg-gray-900',
          warning: 'border-yellow-500/50 bg-gray-900',
          info: 'border-blue-500/50 bg-gray-900',
        },
        duration: 3000,
      }}
      theme="dark"
      richColors
    />
  );
}
