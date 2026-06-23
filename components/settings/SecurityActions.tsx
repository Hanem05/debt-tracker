'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function SecurityActions() {
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-text/50">
        Manage your password and account security settings.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-xl border border-border bg-white/5 px-4 py-2 text-sm font-medium text-text transition hover:bg-white/10"
        >
          Sign out
        </button>

        {!showConfirm ? (
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="rounded-xl border border-red/20 bg-red/5 px-4 py-2 text-sm font-medium text-red transition hover:bg-red/10"
          >
            Delete account
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-xl border border-red/20 bg-red/5 px-4 py-2">
            <span className="text-sm text-red">Are you sure?</span>
            <button
              type="button"
              onClick={() => {
                toast.info('Please contact support to delete your account.');
                setShowConfirm(false);
              }}
              className="rounded-lg bg-red px-3 py-1 text-xs font-semibold text-white transition hover:bg-red/80"
            >
              Yes, delete
            </button>
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              className="rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold text-text transition hover:bg-white/20"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
