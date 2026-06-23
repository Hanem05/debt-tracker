'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { BorrowerSummary } from '@/lib/types';

export function useBorrowers() {
  const [borrowers, setBorrowers] = useState<BorrowerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('borrower_summary')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setBorrowers(data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetch(); }, [fetch]);

  return { borrowers, loading, error, refetch: fetch };
}
