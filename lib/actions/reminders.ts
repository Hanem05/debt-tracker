'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ReminderFormValues } from '@/lib/types';

export async function createReminder(values: ReminderFormValues) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase.from('reminders').insert({ ...values, lender_id: user.id });
  if (error) throw new Error(error.message);
  revalidatePath('/reminders');
}

export async function dismissReminder(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  await supabase
    .from('reminders')
    .update({ is_sent: true, sent_at: new Date().toISOString() })
    .eq('id', id)
    .eq('lender_id', user.id);

  revalidatePath('/reminders');
}
