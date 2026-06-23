'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { LenderPortfolio } from '@/lib/types';

export function usePortfolio() {
  const [portfolio, setPortfolio] = useState<LenderPortfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('lender_portfolio')
        .select('*')
        .eq('lender_id', user.id)
        .single();
      setPortfolio(data);
      setLoading(false);
    }
    load();
  }, [supabase]);

  return { portfolio, loading };
}
