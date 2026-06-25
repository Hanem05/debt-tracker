'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useBorrowerDetail } from '@/lib/hooks/useBorrowerDetail';
import { BorrowerDetail } from '@/components/borrowers/BorrowerDetail';
import { BorrowerForm } from '@/components/borrowers/BorrowerForm';
import { PaymentForm } from '@/components/borrowers/PaymentForm';
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
  id: string;
  updateBorrower: (id: string, values: Partial<BorrowerFormValues>) => Promise<void>;
  recordPayment: (borrower_id: string, values: PaymentFormValues) => Promise<void>;
}

export function BorrowerDetailClient({ id, updateBorrower, recordPayment }: Props) {
  const { borrower, payments, loading, refetch } = useBorrowerDetail(id);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-4 w-24 animate-pulse rounded-full bg-white/10" />
        <div className="h-36 animate-pulse rounded-[18px] bg-white/5" />
        <div className="grid gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 animate-pulse rounded-[18px] bg-white/5" />)}
        </div>
        <div className="h-64 animate-pulse rounded-[18px] bg-white/5" />
      </div>
    );
  }

  if (!borrower) {
    return (
      <div className="rounded-[18px] border border-border bg-bg/80 p-10 text-center">
        <p className="text-lg font-semibold text-white">Borrower not found</p>
        <p className="mt-2 text-sm text-text/50">This borrower may have been deleted or you don&apos;t have access.</p>
        <a href="/borrowers" className="mt-4 inline-block text-sm font-medium text-cyan hover:text-cyan/80">← Back to borrowers</a>
      </div>
    );
  }

  async function handleUpdate(values: BorrowerFormValues) {
    setIsEditOpen(false);
    try {
      toast('Updating borrower...', { icon: '⏳' });
      await updateBorrower(id, values);
      toast.success('Borrower updated');
      refetch();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function handlePayment(values: PaymentFormValues) {
    setIsPayOpen(false);
    try {
      toast('Recording payment...', { icon: '⏳' });
      await recordPayment(id, values);
      toast.success('Payment recorded');
      refetch();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <>
      <BorrowerDetail borrower={borrower} payments={payments} onEdit={() => setIsEditOpen(true)} onPay={() => setIsPayOpen(true)} />
      <BorrowerForm
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialValues={toFormValues(borrower)}
        onSubmit={handleUpdate}
      />
      <PaymentForm
        isOpen={isPayOpen}
        onClose={() => setIsPayOpen(false)}
        outstanding={computeOutstanding(borrower)}
        onSubmit={handlePayment}
      />
    </>
  );
}
