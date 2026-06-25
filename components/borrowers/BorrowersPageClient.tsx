'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { BorrowerForm } from '@/components/borrowers/BorrowerForm';
import { BorrowerTable } from '@/components/borrowers/BorrowerTable';
import { PaymentForm } from '@/components/borrowers/PaymentForm';
import { useBorrowers } from '@/lib/hooks/useBorrowers';
import type { BorrowerSummary, BorrowerFormValues, PaymentFormValues } from '@/lib/types';
import { computeOutstanding } from '@/lib/utils/calc';

function toFormValues(b: BorrowerSummary): BorrowerFormValues {
  return {
    full_name: b.full_name,
    phone: b.phone ?? undefined,
    email: b.email ?? undefined,
    notes: b.notes ?? undefined,
    total_borrowed: b.total_borrowed,
    interest_rate: b.interest_rate,
    interest_type: b.interest_type,
    loan_date: b.loan_date,
    due_date: b.due_date ?? undefined,
    penalty_rate: b.penalty_rate ?? 2,
    status: b.status,
  };
}

interface Props {
  createBorrower: (values: BorrowerFormValues) => Promise<void>;
  updateBorrower: (id: string, values: Partial<BorrowerFormValues>) => Promise<void>;
  recordPayment: (borrower_id: string, values: PaymentFormValues) => Promise<void>;
}

export default function BorrowersPageClient({ createBorrower, updateBorrower, recordPayment }: Props) {
  const { borrowers, loading, error, refetch } = useBorrowers();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'overdue' | 'settled'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBorrower, setSelectedBorrower] = useState<BorrowerSummary | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const liveSelectedBorrower = selectedBorrower
    ? (borrowers.find((b) => b.id === selectedBorrower.id) ?? selectedBorrower)
    : null;

  const filters = useMemo(
    () => [
      { value: 'all', label: 'All' },
      { value: 'active', label: 'Active' },
      { value: 'overdue', label: 'Overdue' },
      { value: 'settled', label: 'Settled' },
    ],
    []
  );

  async function handleAdd(values: BorrowerFormValues) {
    const snapshot = borrowers;
    const _temp: BorrowerSummary = {
      id: `temp-${Date.now()}`,
      lender_id: 'pending',
      full_name: values.full_name,
      avatar_initials: values.full_name.slice(0, 2).toUpperCase(),
      phone: values.phone ?? null,
      email: values.email ?? null,
      notes: values.notes ?? null,
      total_borrowed: values.total_borrowed,
      interest_rate: values.interest_rate,
      interest_type: values.interest_type,
      loan_date: values.loan_date,
      due_date: values.due_date ?? null,
      penalty_rate: values.penalty_rate ?? 2,
      status: values.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      total_paid_principal: 0,
      total_paid_interest: 0,
      total_paid_penalty: 0,
      total_paid_all: 0,
      outstanding_principal: values.total_borrowed,
      base_interest: Math.round((values.total_borrowed * (values.interest_rate / 100)) * 100) / 100,
      accrued_interest: Math.round((values.total_borrowed * (values.interest_rate / 100)) * 100) / 100,
      overdue_interest: 0,
      total_balance: Math.round((values.total_borrowed + (values.total_borrowed * (values.interest_rate / 100))) * 100) / 100,
      payment_count: 0,
      last_payment_date: null,
      days_overdue: 0,
    };

    try {
      setSelectedBorrower(null);
      setIsFormOpen(false);
      toast('Creating borrower...', { icon: '⏳' });
      await createBorrower(values);
      toast.success('Borrower created');
      refetch();
    } catch (err) {
      toast.error((err as Error).message);
      setSelectedBorrower(null);
      refetch();
    }
  }

  async function handleUpdate(values: BorrowerFormValues) {
    if (!selectedBorrower) return;
    const previous = borrowers;
    setIsFormOpen(false);

    const updated = borrowers.map((borrower) =>
      borrower.id === selectedBorrower.id ? { ...borrower, ...values } : borrower
    );
    try {
      toast('Updating borrower...', { icon: '⏳' });
      await updateBorrower(selectedBorrower.id, values);
      toast.success('Borrower updated');
      refetch();
    } catch (err) {
      toast.error((err as Error).message);
      refetch();
    }
  }

  async function handlePayment(values: PaymentFormValues) {
    if (!selectedBorrower) return;
    setIsPaymentOpen(false);
    try {
      toast('Recording payment...', { icon: '⏳' });
      await recordPayment(selectedBorrower.id, values);
      toast.success('Payment recorded');
      refetch();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          placeholder="Search borrowers…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-xl border border-border bg-bg-2/80 px-4 py-2.5 text-[13px] text-white outline-none placeholder:text-text/25 transition focus:border-cyan/40 focus:ring-2 focus:ring-cyan/8 sm:max-w-[260px]"
        />
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-border bg-white/[0.03] p-1">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatusFilter(filter.value as typeof statusFilter)}
                className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all ${
                  statusFilter === filter.value
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-text/40 hover:text-text/70'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan px-4 py-2.5 text-[13px] font-semibold text-bg shadow-glow-sm transition-all hover:bg-cyan/90 hover:shadow-glow active:scale-[0.97]"
            onClick={() => {
              setSelectedBorrower(null);
              setIsFormOpen(true);
            }}
          >
            + Add
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red/20 bg-red/5 px-4 py-3 text-sm text-red">{error}</div>
      )}

      {loading ? (
        <div className="overflow-hidden rounded-[18px] border border-border bg-bg/80">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 border-b border-border px-4 py-4 last:border-none">
              <div className="h-8 w-8 animate-pulse rounded-lg bg-white/10" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-40 animate-pulse rounded-full bg-white/10" />
                <div className="h-3 w-24 animate-pulse rounded-full bg-white/5" />
              </div>
              <div className="h-3.5 w-20 animate-pulse rounded-full bg-white/10" />
              <div className="h-3.5 w-20 animate-pulse rounded-full bg-white/10" />
              <div className="h-3.5 w-16 animate-pulse rounded-full bg-white/10" />
              <div className="h-6 w-14 animate-pulse rounded-full bg-white/10" />
              <div className="h-8 w-20 animate-pulse rounded-lg bg-white/10" />
            </div>
          ))}
        </div>
      ) : (
        <BorrowerTable
          borrowers={borrowers}
          query={search}
          statusFilter={statusFilter}
          onView={(borrower) => {
            setSelectedBorrower(borrower);
            setIsFormOpen(true);
          }}
          onPay={(borrower) => {
            setSelectedBorrower(borrower);
            setIsPaymentOpen(true);
          }}
        />
      )}

      <BorrowerForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialValues={selectedBorrower ? toFormValues(selectedBorrower) : undefined}
        onSubmit={(values) => (selectedBorrower ? handleUpdate(values) : handleAdd(values))}
      />

      <PaymentForm
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        outstanding={liveSelectedBorrower ? computeOutstanding(liveSelectedBorrower) : 0}
        onSubmit={handlePayment}
      />
    </div>
  );
}
