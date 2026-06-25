'use client';

import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { BorrowerSummary, Payment } from '@/lib/types';
import { computeOutstanding, getRepaymentPct } from '@/lib/utils/calc';
import { ArrowLeft, Mail, Phone, Calendar, AlertTriangle, CreditCard } from 'lucide-react';

interface Props {
  borrower: BorrowerSummary;
  payments: Payment[];
  onEdit: () => void;
  onPay: () => void;
}

export function BorrowerDetail({ borrower, payments, onEdit, onPay }: Props) {
  const repaymentPct = getRepaymentPct(borrower);
  const outstanding = computeOutstanding(borrower);
  const isOverdue = borrower.status === 'overdue';

  return (
    <div className="space-y-5">
      <Link href="/borrowers" className="inline-flex items-center gap-1.5 text-[13px] text-text/40 transition hover:text-text/80">
        <ArrowLeft className="h-3.5 w-3.5" />
        Borrowers
      </Link>

      {isOverdue && (
        <div className="flex items-start gap-3 rounded-xl border border-orange/20 bg-gradient-to-r from-orange/10 to-orange/5 p-4 text-sm text-orange">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">Loan overdue</p>
            {borrower.days_overdue ? <p className="mt-0.5 text-orange/70">{borrower.days_overdue} days past due date.</p> : null}
          </div>
        </div>
      )}

      {/* Header card */}
      <div className="rounded-[18px] border border-border bg-bg-2/60 p-6 shadow-card">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan/25 to-cyan/8 text-lg font-bold text-cyan ring-1 ring-cyan/20">
              {borrower.avatar_initials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl font-semibold text-white">{borrower.full_name}</h1>
                <Badge variant="status" value={borrower.status} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-[13px] text-text/40">
                {borrower.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />{borrower.email}
                  </span>
                )}
                {borrower.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />{borrower.phone}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />Loan: {formatDate(borrower.loan_date)}
                </span>
                {borrower.due_date && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />Due: {formatDate(borrower.due_date)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="ghost" size="sm" onClick={onEdit}>Edit</Button>
            <Button variant="primary" size="sm" onClick={onPay}>Record payment</Button>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between text-[12px] text-text/40">
            <span>Repayment progress</span>
            <span>{repaymentPct}% repaid</span>
          </div>
          <ProgressBar pct={repaymentPct} height={7} />
        </div>
      </div>

      {/* Stat mini-cards */}
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-[14px] border border-border bg-bg-2/60 p-4 shadow-card">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-text/35">Principal</p>
          <p className="mt-2 font-mono text-xl font-semibold text-white">{formatCurrency(borrower.total_borrowed)}</p>
          <p className="mt-1 text-[11px] text-text/30">{borrower.interest_rate}% {borrower.interest_type}</p>
        </div>
        <div className="rounded-[14px] border border-border bg-bg-2/60 p-4 shadow-card">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-text/35">Total loan</p>
          <p className="mt-2 font-mono text-xl font-semibold text-white">{formatCurrency(borrower.total_borrowed + (borrower.base_interest ?? 0))}</p>
          <p className="mt-1 text-[11px] text-text/30">incl. {formatCurrency(borrower.base_interest ?? 0)} interest</p>
        </div>
        <div className="rounded-[14px] border border-cyan/15 bg-cyan/5 p-4 shadow-card">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-text/35">Total paid</p>
          <p className="mt-2 font-mono text-xl font-semibold text-cyan">{formatCurrency(borrower.total_paid_all ?? 0)}</p>
          <p className="mt-1 text-[11px] text-text/30">{borrower.payment_count ?? 0} payment{(borrower.payment_count ?? 0) !== 1 ? 's' : ''}</p>
        </div>
        <div className={`rounded-[14px] border p-4 shadow-card ${
          isOverdue ? 'border-orange/20 bg-orange/[0.07]' : outstanding === 0 ? 'border-green/20 bg-green/[0.07]' : 'border-border bg-bg-2/60'
        }`}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-text/35">Balance due</p>
          <p className={`mt-2 font-mono text-xl font-semibold ${isOverdue ? 'text-orange' : outstanding === 0 ? 'text-green' : 'text-white'}`}>
            {outstanding === 0 ? 'Paid off' : formatCurrency(outstanding)}
          </p>
          <p className="mt-1 text-[11px] text-text/30">{outstanding === 0 ? 'Loan fully settled' : 'Remaining balance'}</p>
        </div>
      </div>

      {(borrower.overdue_interest ?? 0) > 0 && (
        <div className="rounded-[14px] border border-orange/25 bg-gradient-to-r from-orange/10 to-orange/5 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-orange/60">Overdue penalty</p>
              <p className="mt-1.5 font-mono text-2xl font-semibold text-orange">{formatCurrency(borrower.overdue_interest ?? 0)}</p>
              <p className="mt-1 text-[12px] text-text/50">
                {formatCurrency(borrower.total_borrowed * 0.02)}/day
                {borrower.days_overdue ? ` · ${borrower.days_overdue} day${borrower.days_overdue !== 1 ? 's' : ''} overdue` : ''}
              </p>
            </div>
            <div className="rounded-xl border border-orange/20 bg-orange/10 px-4 py-3 text-center sm:text-right">
              <p className="text-[10px] uppercase tracking-[0.2em] text-orange/50">Daily rate</p>
              <p className="mt-0.5 font-mono text-lg font-semibold text-orange">{formatCurrency(borrower.total_borrowed * 0.02)}</p>
              <p className="text-[11px] text-orange/50">2% of ₱{borrower.total_borrowed.toLocaleString('en-PH')}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-orange/15 bg-orange/5 px-3 py-2 text-[12px] text-orange/70">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            Penalty increases by {formatCurrency(borrower.total_borrowed * 0.02)} every day until the loan is settled.
          </div>
        </div>
      )}

      {borrower.notes && (
        <div className="rounded-[14px] border border-border bg-bg-2/60 p-5 shadow-card">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-text/35">Notes</p>
          <p className="mt-2 text-[13px] leading-relaxed text-text/60">{borrower.notes}</p>
        </div>
      )}

      {/* Payment history */}
      <div className="rounded-[18px] border border-border bg-bg-2/60 p-6 shadow-card">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-text/35">Payment history</p>
            <h2 className="mt-1 text-base font-semibold text-white">{payments.length} payment{payments.length !== 1 ? 's' : ''}</h2>
          </div>
          {payments.length > 0 && (
            <p className="text-[12px] text-text/35">Last: {formatDate(payments[0].payment_date)}</p>
          )}
        </div>
        <div className="space-y-2">
          {payments.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04]">
                <CreditCard className="h-6 w-6 text-text/20" />
              </div>
              <p className="text-[13px] text-text/40">No payments recorded yet.</p>
              <button type="button" onClick={onPay} className="mt-1 text-[13px] font-medium text-cyan transition-colors hover:text-cyan/70">
                Record the first payment →
              </button>
            </div>
          ) : (
            payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between rounded-xl border border-border/60 bg-white/[0.02] px-4 py-3 transition hover:bg-white/[0.04]">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan/8 ring-1 ring-cyan/15">
                    <CreditCard className="h-3.5 w-3.5 text-cyan" />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-white">{formatDate(payment.payment_date)}</p>
                    <p className="text-[11px] capitalize text-text/35">{payment.method.replace('_', ' ')} · {payment.payment_type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[13px] font-semibold text-cyan">{formatCurrency(payment.amount)}</p>
                  {payment.reference_no && <p className="text-[11px] text-text/30">#{payment.reference_no}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
