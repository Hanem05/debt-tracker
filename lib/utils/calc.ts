import type { BorrowerSummary } from '@/lib/types';

export function computeOutstanding(b: BorrowerSummary): number {
  if (b.total_balance != null) return Math.max(0, b.total_balance);
  return Math.max(
    0,
    (b.total_borrowed ?? 0) + (b.accrued_interest ?? 0) - (b.total_paid_all ?? 0),
  );
}

export function getTotalLoan(b: BorrowerSummary): number {
  return (b.total_borrowed ?? 0) + (b.base_interest ?? 0);
}

export function getOutstanding(b: BorrowerSummary): number {
  return b.outstanding_principal ?? 0;
}

export function getAccruedInterest(b: BorrowerSummary): number {
  return b.accrued_interest ?? 0;
}

export function getTotalOwed(b: BorrowerSummary): number {
  return (b.outstanding_principal ?? 0) + (b.accrued_interest ?? 0);
}

export function getRepaymentPct(b: BorrowerSummary): number {
  const totalLoan = getTotalLoan(b);
  if (totalLoan === 0) return 0;
  return Math.min(100, Math.round(((b.total_paid_all ?? 0) / totalLoan) * 100));
}

export function isOverdue(b: BorrowerSummary): boolean {
  return b.status === 'overdue' || ((b.days_overdue ?? 0) > 0);
}
