import { RemindersPageClient } from '@/components/reminders/RemindersPageClient';
import { createReminder, dismissReminder } from '@/lib/actions/reminders';

export default function RemindersPage() {
  return (
    <RemindersPageClient createReminder={createReminder} dismissReminder={dismissReminder} />
  );
}
