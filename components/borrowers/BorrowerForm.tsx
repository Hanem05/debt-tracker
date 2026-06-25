'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { BorrowerFormValues } from '@/lib/types';

const SELECT_CLASS = 'w-full rounded-xl border border-border bg-bg/80 px-3 py-2.5 text-sm text-white outline-none transition focus:border-cyan/60';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialValues?: BorrowerFormValues;
  onSubmit: (values: BorrowerFormValues) => void;
}

const EMPTY: BorrowerFormValues = {
  full_name: '',
  phone: '',
  email: '',
  notes: '',
  total_borrowed: 0,
  interest_rate: 0,
  interest_type: 'flat',
  loan_date: new Date().toISOString().slice(0, 10),
  due_date: '',
  penalty_rate: 2,
  status: 'active',
};

export function BorrowerForm({ isOpen, onClose, initialValues, onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<BorrowerFormValues>({ defaultValues: EMPTY });

  useEffect(() => {
    if (isOpen) reset(initialValues ? { ...EMPTY, ...initialValues } : EMPTY);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialValues]);

  const watchedTotal = Number(watch('total_borrowed') ?? 0);
  const watchedRate = Number(watch('interest_rate') ?? 0);
  const watchedPenalty = Number(watch('penalty_rate') ?? 0);
  const interestTotal = Math.round(watchedTotal * (watchedRate / 100) * 100) / 100;
  const dailyPenalty = Math.round(watchedTotal * (watchedPenalty / 100) * 100) / 100;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialValues ? 'Edit borrower' : 'Add borrower'} size="lg">
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Input
              label="Full name *"
              placeholder="e.g. Juan Dela Cruz"
              {...register('full_name', { required: 'Full name is required' })}
            />
            {errors.full_name && <p className="mt-1 text-xs text-red">{errors.full_name.message}</p>}
          </div>
          <Input label="Email" type="email" placeholder="juan@example.com" {...register('email')} />
          <Input label="Phone" placeholder="+63 9xx xxx xxxx" {...register('phone')} />
          <div>
            <Input
              label="Loan amount *"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register('total_borrowed', { valueAsNumber: true, required: 'Loan amount is required', min: { value: 0.01, message: 'Must be greater than 0' } })}
            />
            {errors.total_borrowed && <p className="mt-1 text-xs text-red">{errors.total_borrowed.message}</p>}
          </div>
          <div>
            <Input
              label="Interest rate (%)"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register('interest_rate', { valueAsNumber: true })}
            />
          </div>

          <div className="rounded-xl border border-cyan/20 bg-cyan/5 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan/70">Estimated interest</p>
            <p className="mt-1 font-mono text-lg font-semibold text-white">₱{interestTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-[0.24em] text-text/60">Interest type</label>
            <select className={SELECT_CLASS} {...register('interest_type')}>
              <option value="flat">Flat</option>
              <option value="compound">Compound</option>
              <option value="reducing">Reducing balance</option>
            </select>
          </div>

          <Input label="Loan date" type="date" {...register('loan_date')} />
          <Input label="Due date" type="date" {...register('due_date')} />

          <div>
            <Input
              label="Penalty rate (%/day)"
              type="number"
              step="0.01"
              min="0"
              placeholder="2.00"
              {...register('penalty_rate', { valueAsNumber: true })}
            />
            {watchedPenalty > 0 && watchedTotal > 0 && (
              <p className="mt-1.5 rounded-lg border border-orange/20 bg-orange/8 px-3 py-2 text-[12px] text-orange/80">
                ₱{dailyPenalty.toLocaleString('en-PH', { minimumFractionDigits: 2 })} charged per day after due date
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-[0.24em] text-text/60">Status</label>
            <select className={SELECT_CLASS} {...register('status')}>
              <option value="active">Active</option>
              <option value="overdue">Overdue</option>
              <option value="settled">Settled</option>
              <option value="written_off">Written off</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs uppercase tracking-[0.24em] text-text/60">Notes</label>
          <textarea
            className="w-full rounded-xl border border-border bg-bg/80 p-3 text-sm text-white outline-none transition focus:border-cyan/60 placeholder:text-text/30"
            rows={3}
            placeholder="Optional notes about this loan..."
            {...register('notes')}
          />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            {initialValues ? 'Save changes' : 'Add borrower'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
