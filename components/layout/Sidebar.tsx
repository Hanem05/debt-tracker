'use client';

import { memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, BarChart3, Bell, Settings, TrendingUp, Bot, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const navItems = [
  { href: '/',           label: 'Dashboard',    icon: Home },
  { href: '/borrowers',  label: 'Borrowers',    icon: Users },
  { href: '/analytics',  label: 'Analytics',    icon: BarChart3 },
  { href: '/reminders',  label: 'Reminders',    icon: Bell },
  { href: '/ai',         label: 'AI Assistant', icon: Bot },
  { href: '/settings',   label: 'Settings',     icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

function NavContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <div className="flex h-full flex-col p-4">
      {/* Logo */}
      <div className="mb-7 flex items-center justify-between px-2 py-1">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan/30 to-cyan/10 ring-1 ring-cyan/20">
            <TrendingUp className="h-4 w-4 text-cyan" />
          </div>
          <div>
            <p className="text-[13px] font-semibold tracking-tight text-white">DebtTracker</p>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-text/30">Pro</p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-text/40 transition hover:bg-white/5 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-150',
                active
                  ? 'bg-cyan/10 text-cyan'
                  : 'text-text/50 hover:bg-white/[0.04] hover:text-text'
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-cyan" />
              )}
              <item.icon
                className={cn(
                  'h-[17px] w-[17px] transition-colors duration-150',
                  active ? 'text-cyan' : 'text-text/30 group-hover:text-text/60'
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer card */}
      <div className="mt-4 rounded-xl border border-border bg-white/[0.02] p-3.5">
        <p className="text-[11px] font-semibold text-text/50">Lender workspace</p>
        <p className="mt-0.5 text-[11px] text-text/30">Manage your loan portfolio</p>
      </div>
    </div>
  );
}

export const Sidebar = memo(function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-bg-2 lg:flex">
        <NavContent />
      </aside>

      {/* Mobile drawer overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Drawer */}
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-border bg-bg-2 shadow-xl">
            <NavContent onClose={onClose} />
          </aside>
        </div>
      )}
    </>
  );
});
