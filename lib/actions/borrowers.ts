'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { BorrowerFormValues } from '@/lib/types';

async function ensureProfileExists(supabase: ReturnType<typeof createClient>, userId: string) {
  const { data: existingProfile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (profileError) throw new Error(profileError.message);

  if (!existingProfile) {
    const { error: insertError } = await supabase.from('profiles').insert({ id: userId });
    if (insertError) throw new Error(insertError.message);
  }
}

export async function createBorrower(values: BorrowerFormValues) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  await ensureProfileExists(supabase, user.id);

  const normalizedValues = {
    ...values,
    loan_date: values.loan_date?.trim() || new Date().toISOString().slice(0, 10),
    due_date: values.due_date?.trim() ? values.due_date : null,
  };

  const { error } = await supabase.from('borrowers').insert({
    ...normalizedValues,
    lender_id: user.id,
  });

  if (error) throw new Error(error.message);
  revalidatePath('/borrowers');
  revalidatePath('/');
}

export async function updateBorrower(id: string, values: Partial<BorrowerFormValues>) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  await ensureProfileExists(supabase, user.id);

  const normalizedValues = {
    ...values,
    ...(values.loan_date !== undefined
      ? { loan_date: values.loan_date?.trim() || new Date().toISOString().slice(0, 10) }
      : {}),
    ...(values.due_date !== undefined
      ? { due_date: values.due_date?.trim() ? values.due_date : null }
      : {}),
  };

  const { error } = await supabase
    .from('borrowers')
    .update(normalizedValues)
    .eq('id', id)
    .eq('lender_id', user.id);

  if (error) throw new Error(error.message);
  revalidatePath('/borrowers');
  revalidatePath(`/borrowers/${id}`);
  revalidatePath('/');
}

export async function deleteBorrower(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('borrowers')
    .delete()
    .eq('id', id)
    .eq('lender_id', user.id);

  if (error) throw new Error(error.message);
  revalidatePath('/borrowers');
  revalidatePath('/');
}
