'use client';
import { memo } from 'react';

import Link from 'next/link';
import type { BorrowerSummary } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/format';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';

interface Props {
  borrowers: BorrowerSummary[];
}

export const TopBorrowersTable = memo(function TopBorrowersTable({ borrowers }: Props) {
  const top = [...borrowers]
    .sort((a, b) => b.outstanding_principal - a.outstanding_principal)
    .slice(0, 5);

  if (!top.length) {
    return (
      <div className="rounded-[18px] border border-border bg-bg/80 p-6 shadow-card">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.28em] text-text/60">Top borrowers</p>
          <h2 className="text-xl font-semibold text-white">Outstanding balances</h2>
        </div>
        <p className="py-6 text-center text-sm text-text/50">No borrowers yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-[18px] border border-border bg-bg/80 p-6 shadow-card">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.28em] text-text/60">Top borrowers</p>
        <h2 className="text-xl font-semibold text-white">Outstanding balances</h2>
      </div>
      <div className="space-y-3">
        {top.map((borrower, i) => {
          const totalLoan = borrower.total_borrowed + (borrower.base_interest ?? 0);
        const pct = totalLoan > 0 ? Math.min(100, Math.round((borrower.total_paid_all / totalLoan) * 100)) : 0;
          return (
            <Link
              key={borrower.id}
              href={`/borrowers/${borrower.id}`}
              className="block rounded-xl border border-border bg-white/[0.03] p-4 transition hover:bg-white/[0.06]"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-text/50">
                  {i + 1}
                </span>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan/10 text-xs font-bold text-cyan">
                  {borrower.avatar_initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium text-white">{borrower.full_name}</p>
                    <p className="shrink-0 font-mono font-semibold text-cyan">{formatCurrency(borrower.outstanding_principal)}</p>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <Badge variant="status" value={borrower.status} />
                    <p className="text-xs text-text/40">{pct}% repaid</p>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <ProgressBar pct={pct} height={5} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
);
