'use client';

import Link from 'next/link';
import type { BorrowerSummary } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/format';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface Props {
  borrowers: BorrowerSummary[];
}

export function MetricsTable({ borrowers }: Props) {
  if (!borrowers.length) {
    return (
      <div className="rounded-[18px] border border-border bg-bg/80 p-8 text-center text-sm text-text/50">
        No borrowers to display.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[18px] border border-border bg-bg/80 shadow-card">
      <div className="border-b border-border px-6 py-4">
        <p className="text-xs uppercase tracking-[0.28em] text-text/60">All borrowers</p>
        <h2 className="text-xl font-semibold text-white">Detailed metrics</h2>
      </div>
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-5 py-3 text-xs font-medium uppercase tracking-[0.2em] text-text/40">Borrower</th>
            <th className="px-5 py-3 text-xs font-medium uppercase tracking-[0.2em] text-text/40">Loan</th>
            <th className="px-5 py-3 text-xs font-medium uppercase tracking-[0.2em] text-text/40">Outstanding</th>
            <th className="px-5 py-3 text-xs font-medium uppercase tracking-[0.2em] text-text/40">Interest</th>
            <th className="px-5 py-3 text-xs font-medium uppercase tracking-[0.2em] text-text/40">Paid</th>
            <th className="px-5 py-3 text-xs font-medium uppercase tracking-[0.2em] text-text/40">Progress</th>
            <th className="px-5 py-3 text-xs font-medium uppercase tracking-[0.2em] text-text/40">Status</th>
          </tr>
        </thead>
        <tbody>
          {borrowers.map((borrower) => {
            const pct = borrower.total_borrowed > 0 ? Math.round((borrower.total_paid_principal / borrower.total_borrowed) * 100) : 0;
            return (
              <tr key={borrower.id} className="border-b border-border last:border-none transition-colors hover:bg-white/[0.03]">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan/10 text-xs font-bold text-cyan">
                      {borrower.avatar_initials}
                    </div>
                    <Link href={`/borrowers/${borrower.id}`} className="font-medium text-white hover:text-cyan transition-colors">
                      {borrower.full_name}
                    </Link>
                  </div>
                </td>
                <td className="px-5 py-3.5 font-mono text-sm text-text/80">{formatCurrency(borrower.total_borrowed)}</td>
                <td className="px-5 py-3.5 font-mono text-sm font-medium text-white">{formatCurrency(borrower.outstanding_principal)}</td>
                <td className="px-5 py-3.5 font-mono text-sm text-purple">{formatCurrency(borrower.accrued_interest)}</td>
                <td className="px-5 py-3.5 font-mono text-sm text-green">{formatCurrency(borrower.total_paid_all)}</td>
                <td className="w-32 px-5 py-3.5">
                  <ProgressBar pct={pct} height={5} />
                  <p className="mt-1 text-xs text-text/40">{pct}%</p>
                </td>
                <td className="px-5 py-3.5">
                  <Badge variant="status" value={borrower.status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
