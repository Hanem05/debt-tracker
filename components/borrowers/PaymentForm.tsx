'use client';

import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { PaymentFormValues } from '@/lib/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: PaymentFormValues) => void;
  outstanding: number;
}

const SELECT_CLASS = 'w-full rounded-xl border border-border bg-bg/80 px-3 py-2.5 text-sm text-white outline-none transition focus:border-cyan/60';

const DEFAULT_VALUES: PaymentFormValues = {
  amount: 0,
  payment_type: 'partial',
  payment_date: new Date().toISOString().slice(0, 10),
  method: 'cash',
  reference_no: '',
  notes: '',
};

export function PaymentForm({ isOpen, onClose, onSubmit, outstanding }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting },
  } = useForm<PaymentFormValues>({ defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    if (isOpen) {
      reset({
        ...DEFAULT_VALUES,
        payment_date: new Date().toISOString().slice(0, 10),
      });
    }
  }, [isOpen, reset]);

  const amount = Number(useWatch({ control, name: 'amount' }) ?? 0);
  const remaining = Math.max(0, outstanding - amount);
  const isFullPayment = amount >= outstanding && outstanding > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record payment" size="md">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>

        {/* Outstanding balance */}
        <div className="rounded-xl border border-cyan/20 bg-cyan/5 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan/60">Outstanding balance</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-white">
            ₱{outstanding.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Amount input */}
        <div className="space-y-1">
          <Input
            label="Amount to pay *"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            {...register('amount', { valueAsNumber: true, required: true, min: 0.01 })}
          />
          {/* Live remaining balance preview */}
          {amount > 0 && (
            <div className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${isFullPayment ? 'bg-green/10 text-green' : 'bg-white/5 text-text/60'}`}>
              <span>{isFullPayment ? 'Loan fully paid after this payment' : 'Remaining after payment:'}</span>
              {!isFullPayment && (
                <span className="font-mono font-semibold text-white">
                  ₱{remaining.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-[0.24em] text-text/60">Payment type</label>
            <select className={SELECT_CLASS} {...register('payment_type')}>
              <option value="partial">Partial (principal + interest)</option>
              <option value="principal">Principal only</option>
              <option value="interest">Interest only</option>
              <option value="penalty">Penalty</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-[0.24em] text-text/60">Method</label>
            <select className={SELECT_CLASS} {...register('method')}>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank transfer</option>
              <option value="gcash">GCash</option>
              <option value="maya">Maya</option>
              <option value="check">Check</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <Input label="Payment date" type="date" {...register('payment_date')} />
        <Input label="Reference number" placeholder="Optional" {...register('reference_no')} />

        <div className="space-y-1.5">
          <label className="block text-xs uppercase tracking-[0.24em] text-text/60">Notes</label>
          <textarea
            className="w-full rounded-xl border border-border bg-bg/80 p-3 text-sm text-white outline-none transition focus:border-cyan/60 placeholder:text-text/30"
            rows={2}
            placeholder="Optional notes..."
            {...register('notes')}
          />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            Record payment
          </Button>
        </div>
      </form>
    </Modal>
  );
}
