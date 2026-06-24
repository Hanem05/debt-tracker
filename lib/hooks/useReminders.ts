'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Reminder } from '@/lib/types';

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('reminders')
      .select('*, borrower:borrowers(full_name, avatar_initials)')
      .eq('is_sent', false)
      .order('remind_on', { ascending: true });
    setReminders(data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetch(); }, [fetch]);

  return { reminders, loading, refetch: fetch };
}
