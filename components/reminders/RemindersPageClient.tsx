'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useReminders } from '@/lib/hooks/useReminders';
import { ReminderForm } from '@/components/reminders/ReminderForm';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate, daysUntil } from '@/lib/utils/format';
import type { ReminderFormValues } from '@/lib/types';
import { Bell, Plus, Calendar, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Props {
  createReminder: (values: ReminderFormValues) => Promise<void>;
  dismissReminder: (id: string) => Promise<void>;
}

const CHANNEL_LABEL: Record<string, string> = {
  in_app: 'In-app',
  email: 'Email',
  sms: 'SMS',
};

export function RemindersPageClient({ createReminder, dismissReminder }: Props) {
  const { reminders, loading, refetch } = useReminders();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [dismissing, setDismissing] = useState<string | null>(null);

  async function handleAdd(values: ReminderFormValues) {
    setIsFormOpen(false);
    try {
      toast('Creating reminder...', { icon: '⏳' });
      await createReminder(values);
      toast.success('Reminder created');
      refetch();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function handleDismiss(id: string) {
    setDismissing(id);
    try {
      await dismissReminder(id);
      toast.success('Reminder dismissed');
      refetch();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setDismissing(null);
    }
  }

  return (
    <>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {reminders.length > 0 && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan/10 text-xs font-semibold text-cyan">
                {reminders.length}
              </span>
            )}
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan px-4 py-2.5 text-sm font-medium text-bg transition hover:bg-cyan/90 active:scale-95"
            onClick={() => setIsFormOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add reminder
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-[18px] border border-border bg-white/5" />
            ))}
          </div>
        ) : reminders.length === 0 ? (
          <EmptyState
            icon={<Bell className="h-7 w-7" />}
            title="No upcoming reminders"
            description="Add a reminder to follow up with a borrower on a specific date."
            action={{ label: 'Add your first reminder', onClick: () => setIsFormOpen(true) }}
          />
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => {
              const days = daysUntil(reminder.remind_on);
              const isToday = days === 0;
              const isPast = days < 0;
              return (
                <div
                  key={reminder.id}
                  className={cn(
                    'rounded-[18px] border bg-bg/80 p-5 transition',
                    isPast ? 'border-orange/20 bg-orange/5' : isToday ? 'border-cyan/20 bg-cyan/5' : 'border-border'
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                        isPast ? 'bg-orange/10 text-orange' : isToday ? 'bg-cyan/10 text-cyan' : 'bg-white/5 text-text/40'
                      )}>
                        <Bell className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{reminder.borrower?.full_name ?? 'Unknown borrower'}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text/50">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(reminder.remind_on)}
                          </span>
                          <span className="rounded-full bg-white/5 px-2 py-0.5">{CHANNEL_LABEL[reminder.channel] ?? reminder.channel}</span>
                          {isToday && <span className="rounded-full bg-cyan/10 px-2 py-0.5 text-cyan">Today</span>}
                          {isPast && <span className="rounded-full bg-orange/10 px-2 py-0.5 text-orange">{Math.abs(days)}d overdue</span>}
                          {!isToday && !isPast && days <= 3 && (
                            <span className="rounded-full bg-gold/10 px-2 py-0.5 text-gold">In {days}d</span>
                          )}
                        </div>
                        {reminder.message && (
                          <p className="mt-2 text-sm text-text/60">{reminder.message}</p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={dismissing === reminder.id}
                      onClick={() => handleDismiss(reminder.id)}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-white/5 px-3 py-1.5 text-xs font-medium text-text/60 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      {dismissing === reminder.id ? 'Dismissing...' : 'Done'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <ReminderForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSubmit={handleAdd} />
    </>
  );
}
