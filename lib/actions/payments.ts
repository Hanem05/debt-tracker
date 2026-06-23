'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { PaymentFormValues } from '@/lib/types';

export async function recordPayment(borrower_id: string, values: PaymentFormValues) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase.from('payments').insert({
    ...values,
    borrower_id,
    lender_id: user.id,
    recorded_by: user.id,
  });

  if (error) throw new Error(error.message);

  await supabase.from('activity_log').insert({
    lender_id: user.id,
    borrower_id,
    action: 'payment.recorded',
    new_value: { amount: values.amount, type: values.payment_type },
  });

  revalidatePath('/borrowers');
  revalidatePath(`/borrowers/${borrower_id}`);
  revalidatePath('/');
}
