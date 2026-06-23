'use client';

import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-[18px] border border-border bg-bg/80 p-8 text-center text-text/70">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-cyan">{icon}</div>
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm">{description}</p>
      {action ? (
        <button type="button" className="mt-6 rounded-xl bg-cyan px-5 py-2 text-sm font-medium text-bg transition hover:bg-cyan/90" onClick={action.onClick}>
          {action.label}
        </button>
      ) : null}
    </div>
  );
}
