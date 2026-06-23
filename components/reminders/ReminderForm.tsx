'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { BorrowerSummary, ReminderFormValues } from '@/lib/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ReminderFormValues) => void;
}

export function ReminderForm({ isOpen, onClose, onSubmit }: Props) {
  const [borrowers, setBorrowers] = useState<BorrowerSummary[]>([]);
  const supabase = createClient();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ReminderFormValues>({
    defaultValues: {
      borrower_id: '',
      remind_on: new Date().toISOString().slice(0, 10),
      channel: 'in_app',
      message: '',
    },
  });

  useEffect(() => {
    async function fetchBorrowers() {
      const { data } = await supabase.from('borrower_summary').select('id, full_name').order('full_name');
      setBorrowers((data as BorrowerSummary[]) ?? []);
    }
    if (isOpen) fetchBorrowers();
  }, [isOpen, supabase]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add reminder" size="md">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <label className="block text-xs uppercase tracking-[0.24em] text-text/60">Borrower</label>
          <select className="w-full rounded-2xl border border-border bg-bg/80 px-3 py-2 text-sm text-white" {...register('borrower_id')}>
            <option value="">Select a borrower</option>
            {borrowers.map((borrower) => (
              <option key={borrower.id} value={borrower.id}>{borrower.full_name}</option>
            ))}
          </select>
        </div>
        <Input label="Remind on" type="date" {...register('remind_on')} />
        <div className="space-y-2">
          <label className="block text-xs uppercase tracking-[0.24em] text-text/60">Channel</label>
          <select className="w-full rounded-2xl border border-border bg-bg/80 px-3 py-2 text-sm text-white" {...register('channel')}>
            <option value="in_app">In-app</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
          </select>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-[0.24em] text-text/60">Message</label>
          <textarea className="mt-2 w-full rounded-2xl border border-border bg-bg/80 p-3 text-sm text-white outline-none" rows={4} {...register('message')} />
        </div>
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>Add reminder</Button>
        </div>
      </form>
    </Modal>
  );
}
