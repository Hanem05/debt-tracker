'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { Plus, Menu } from 'lucide-react';

const pageMeta: Record<string, { label: string; title: string }> = {
  '/': { label: 'Dashboard', title: 'Portfolio overview' },
  '/borrowers': { label: 'Borrowers', title: 'All borrowers' },
  '/analytics': { label: 'Analytics', title: 'Performance overview' },
  '/reminders': { label: 'Reminders', title: 'Upcoming follow-ups' },
  '/ai': { label: 'AI Assistant', title: 'Your lending assistant' },
  '/settings': { label: 'Settings', title: 'Manage your account' },
};

export function Topbar() {
  const pathname = usePathname();

  const meta = useMemo(() => {
    const key = Object.keys(pageMeta)
      .filter((k) => (k === '/' ? pathname === '/' : pathname.startsWith(k)))
      .sort((a, b) => b.length - a.length)[0] ?? '/';
    return pageMeta[key];
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-bg-2/80 px-5 py-3 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-lg p-1.5 text-text/40 transition hover:bg-white/[0.06] hover:text-text lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-text/30">{meta.label}</p>
          <h2 className="text-[15px] font-semibold text-white">{meta.title}</h2>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/borrowers"
          className="inline-flex items-center gap-2 rounded-xl bg-cyan px-4 py-2 text-[13px] font-semibold text-bg shadow-glow-sm transition-all duration-150 hover:bg-cyan/90 hover:shadow-glow active:scale-[0.97]"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add borrower</span>
          <span className="sm:hidden">Add</span>
        </Link>
      </div>
    </header>
  );
}
