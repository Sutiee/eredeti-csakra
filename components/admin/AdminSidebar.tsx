/**
 * Admin Sidebar Component
 * Navigation sidebar for admin dashboard
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoutButton } from './LogoutButton';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { href: '/admin', label: 'Áttekintés', icon: '📊' },
  { href: '/admin/users', label: 'Felhasználók', icon: '👥' },
  { href: '/admin/products', label: 'Termékek', icon: '📈' },
  { href: '/admin/newsletter', label: 'Hírlevél', icon: '📧' },
  { href: '/admin/settings', label: 'Beállítások', icon: '🔧' },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64
          bg-gradient-to-b from-spiritual-purple-900 to-spiritual-purple-800
          text-white shadow-2xl z-50
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        role="navigation"
        aria-label="Admin Navigation"
      >
        <div className="flex flex-col h-full">
          {/* Logo/Title */}
          <div className="p-6 border-b border-white/10">
            <h1 className="text-2xl font-serif font-bold text-white">
              Eredeti Csakra
            </h1>
            <p className="text-spiritual-purple-200 text-sm mt-1">
              Admin Dashboard
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-300
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-spiritual-purple-600 to-spiritual-rose-600 shadow-lg scale-105'
                        : 'hover:bg-white/10 hover:translate-x-1'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="text-2xl" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-white/10">
            <LogoutButton />
          </div>
        </div>
      </aside>
    </>
  );
}
