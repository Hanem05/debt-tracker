'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { LenderPortfolio } from '@/lib/types';

export function usePortfolio() {
  const [portfolio, setPortfolio] = useState<LenderPortfolio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from('lender_portfolio')
        .select('*')
        .eq('lender_id', user.id)
        .single();
      setPortfolio(data);
      setLoading(false);
    }
    load();
  }, []);

  return { portfolio, loading };
}
