export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { User, Shield, Globe } from 'lucide-react';
import { SecurityActions } from '@/components/settings/SecurityActions';

async function getSessionAndProfile() {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;
  if (!user) return { user: null, profile: null };

  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
  if (error) throw new Error(error.message);
  return { user, profile: data };
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-none">
      <span className="text-sm text-text/50">{label}</span>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  );
}

export default async function SettingsPage() {
  const { user, profile } = await getSessionAndProfile();

  if (!user) redirect('/login');

  if (!profile) {
    return (
      <div className="space-y-6">
        <div className="rounded-[18px] border border-orange/20 bg-orange/5 p-6">
          <p className="font-medium text-orange">Profile not found</p>
          <p className="mt-2 text-sm text-text/60">Your auth account exists but has no profile record. Contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <section className="rounded-[18px] border border-border bg-bg/80 p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan/10">
            <User className="h-4 w-4 text-cyan" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Profile</h2>
            <p className="text-xs text-text/40">Your personal information</p>
          </div>
        </div>
        <div className="mb-4 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan/10 text-xl font-bold text-cyan">
            {(profile.full_name ?? profile.display_name ?? user.email ?? 'U').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-white">{profile.full_name ?? '—'}</p>
            <p className="text-sm text-text/50">{user.email}</p>
          </div>
        </div>
        <div>
          <Row label="Full name" value={profile.full_name ?? '—'} />
          <Row label="Display name" value={profile.display_name ?? '—'} />
          <Row label="Email" value={user.email ?? '—'} />
          <Row label="Member since" value={new Date(user.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })} />
        </div>
      </section>

      <section className="rounded-[18px] border border-border bg-bg/80 p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple/10">
            <Globe className="h-4 w-4 text-purple" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Preferences</h2>
            <p className="text-xs text-text/40">Currency and timezone settings</p>
          </div>
        </div>
        <div>
          <Row label="Currency" value={profile.currency ?? 'PHP'} />
          <Row label="Timezone" value={profile.timezone ?? 'Asia/Manila'} />
        </div>
      </section>

      <section className="rounded-[18px] border border-border bg-bg/80 p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red/10">
            <Shield className="h-4 w-4 text-red" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Security</h2>
            <p className="text-xs text-text/40">Password and account access</p>
          </div>
        </div>
        <SecurityActions />
      </section>
    </div>
  );
}
