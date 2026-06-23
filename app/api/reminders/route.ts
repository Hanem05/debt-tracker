import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('reminders')
    .select('*, borrower:borrowers(full_name, email, phone)')
    .eq('is_sent', false)
    .lte('remind_on', new Date().toISOString().split('T')[0]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reminders: data });
}
