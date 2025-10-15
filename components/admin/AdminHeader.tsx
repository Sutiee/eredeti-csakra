/**
 * Admin Header Component
 * Top header bar with page title and user info
 */

'use client';

interface AdminHeaderProps {
  title: string;
  onMenuToggle: () => void;
}

export function AdminHeader({ title, onMenuToggle }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-white/70 border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: Mobile Menu + Title */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Page Title */}
          <h2 className="text-2xl font-serif font-bold text-gray-900">
            {title}
          </h2>
        </div>

        {/* Right: Date Picker Placeholder + User */}
        <div className="flex items-center gap-4">
          {/* Date Range Picker Placeholder */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 text-sm">
            <span aria-hidden="true">📅</span>
            <span>Utolsó 30 nap</span>
          </div>

          {/* Admin User Info */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gradient-to-r from-spiritual-purple-100 to-spiritual-rose-100">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-spiritual-purple-500 to-spiritual-rose-500 flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
            <span className="hidden sm:block font-medium text-gray-700">
              Admin
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
