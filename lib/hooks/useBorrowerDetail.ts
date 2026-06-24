'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { BorrowerSummary, Payment } from '@/lib/types';

export function useBorrowerDetail(id: string) {
  const [borrower, setBorrower] = useState<BorrowerSummary | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const [{ data: b }, { data: p }] = await Promise.all([
      supabase.from('borrower_summary').select('*').eq('id', id).eq('lender_id', user.id).single(),
      supabase.from('payments').select('*').eq('borrower_id', id).eq('lender_id', user.id).order('payment_date', { ascending: false }),
    ]);
    setBorrower(b);
    setPayments(p ?? []);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  return { borrower, payments, loading, refetch: load };
}
