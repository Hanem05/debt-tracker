'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { BorrowerSummary, Payment } from '@/lib/types';

export function useBorrowerDetail(id: string) {
  const [borrower, setBorrower] = useState<BorrowerSummary | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: b }, { data: p }] = await Promise.all([
      supabase.from('borrower_summary').select('*').eq('id', id).single(),
      supabase.from('payments').select('*').eq('borrower_id', id).order('payment_date', { ascending: false }),
    ]);
    setBorrower(b);
    setPayments(p ?? []);
    setLoading(false);
  }, [id, supabase]);

  useEffect(() => { load(); }, [load]);

  return { borrower, payments, loading, refetch: load };
}
