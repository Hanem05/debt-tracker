'use client';

import { memo, useMemo } from 'react';
import Link from 'next/link';
import type { BorrowerSummary } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/format';
import { computeOutstanding } from '@/lib/utils/calc';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Users } from 'lucide-react';

interface BorrowerTableProps {
  borrowers: BorrowerSummary[];
  query: string;
  statusFilter: string;
  onView: (borrower: BorrowerSummary) => void;
  onPay: (borrower: BorrowerSummary) => void;
}

export const BorrowerTable = memo(function BorrowerTable({ borrowers, query, statusFilter, onView, onPay }: BorrowerTableProps) {
  const filtered = useMemo(() =>
    borrowers.filter((borrower) => {
      const matchesQuery = [borrower.full_name, borrower.email, borrower.phone].some((value) =>
        value?.toLowerCase().includes(query.toLowerCase())
      );
      const matchesStatus = statusFilter === 'all' || borrower.status === statusFilter;
      return matchesQuery && matchesStatus;
    }),
    [borrowers, query, statusFilter]
  );

  if (!filtered.length) {
    return (
      <EmptyState
        icon={<Users className="h-7 w-7" />}
        title={query || statusFilter !== 'all' ? 'No results found' : 'No borrowers yet'}
        description={query || statusFilter !== 'all' ? 'Try adjusting your search or filter.' : 'Add your first borrower to get started.'}
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-[18px] border border-border bg-bg-2/60 shadow-card">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-text/30 whitespace-nowrap">Borrower</th>
            <th className="px-5 py-3.5 text-right text-[10px] font-semibold uppercase tracking-[0.22em] text-text/30 whitespace-nowrap">Total loan</th>
            <th className="px-5 py-3.5 text-right text-[10px] font-semibold uppercase tracking-[0.22em] text-text/30 whitespace-nowrap">Outstanding</th>
            <th className="px-5 py-3.5 text-right text-[10px] font-semibold uppercase tracking-[0.22em] text-text/30 whitespace-nowrap">Paid</th>
            <th className="px-5 py-3.5 text-right text-[10px] font-semibold uppercase tracking-[0.22em] text-text/30 whitespace-nowrap">Rate</th>
            <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-text/30 whitespace-nowrap">Progress</th>
            <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-text/30 whitespace-nowrap">Status</th>
            <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-text/30 whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((borrower) => {
            const totalLoan = borrower.total_borrowed + (borrower.base_interest ?? 0);
            const outstanding = computeOutstanding(borrower);
            const pct = totalLoan > 0 ? Math.min(100, Math.round((borrower.total_paid_all / totalLoan) * 100)) : 0;
            const isOverdue = borrower.status === 'overdue';
            return (
              <tr key={borrower.id} className="group border-b border-border/60 last:border-none transition-colors hover:bg-white/[0.025]">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan/20 to-cyan/5 text-[11px] font-bold text-cyan ring-1 ring-cyan/15">
                      {borrower.avatar_initials}
                    </div>
                    <div>
                      <Link href={`/borrowers/${borrower.id}`} className="text-[13px] font-medium text-white transition-colors hover:text-cyan">
                        {borrower.full_name}
                      </Link>
                      <p className="text-[11px] text-text/35">{borrower.email ?? borrower.phone ?? '—'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-right">
                  <p className="font-mono text-[13px] font-medium text-white whitespace-nowrap">{formatCurrency(totalLoan)}</p>
                  <p className="text-[11px] text-text/30 whitespace-nowrap">{formatCurrency(borrower.total_borrowed)} + {borrower.interest_rate ?? 0}%</p>
                </td>
                <td className="px-5 py-4 text-right whitespace-nowrap">
                  <p className={`font-mono text-[13px] font-semibold ${isOverdue ? 'text-orange' : outstanding === 0 ? 'text-green' : 'text-text'}`}>
                    {formatCurrency(outstanding)}
                  </p>
                  {isOverdue && (borrower.overdue_interest ?? 0) > 0 && (
                    <p className="text-[11px] text-orange/60">+{formatCurrency(borrower.total_borrowed * 0.02)}/day</p>
                  )}
                </td>
                <td className="px-5 py-4 text-right font-mono text-[13px] text-cyan whitespace-nowrap">
                  {formatCurrency(borrower.total_paid_all)}
                </td>
                <td className="px-5 py-4 text-right text-[13px] text-text/50 whitespace-nowrap">{borrower.interest_rate}%</td>
                <td className="w-36 px-5 py-4">
                  <ProgressBar pct={pct} height={5} />
                  <p className="mt-1.5 text-[11px] text-text/30">{pct}% repaid</p>
                </td>
                <td className="px-5 py-4">
                  <Badge variant="status" value={borrower.status} />
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    <Link href={`/borrowers/${borrower.id}`}>
                      <Button variant="ghost" size="sm">Detail</Button>
                    </Link>
                    <Button variant="primary" size="sm" onClick={() => onPay(borrower)}>Pay</Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});
