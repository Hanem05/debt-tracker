'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { createClient } from '@/lib/supabase/client';
import { TrendingUp, Users, BarChart3, Bell, Bot, ArrowRight, X } from 'lucide-react';

const features = [
  { icon: Users,    color: 'text-cyan',   bg: 'bg-cyan/10',   label: 'Borrowers',    desc: 'Track every borrower, loan amount, and repayment.' },
  { icon: BarChart3, color: 'text-purple', bg: 'bg-purple/10', label: 'Analytics',    desc: 'Visualize your portfolio performance at a glance.' },
  { icon: Bell,     color: 'text-orange', bg: 'bg-orange/10', label: 'Reminders',    desc: 'Set follow-up alerts so no payment slips through.' },
  { icon: Bot,      color: 'text-green',  bg: 'bg-green/10',  label: 'AI Assistant', desc: 'Get instant insights and lending tips powered by AI.' },
];

export function WelcomeModal() {
  const [show, setShow] = useState(false);
  const [name, setName] = useState('');
  const checked = useRef(false); // guard against React Strict Mode double-invoke

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;

    (async () => {
      try {
        const supabase = createClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) return;

        const key = `dtp_welcomed_${user.id}`;
        if (localStorage.getItem(key)) return;

        // Mark as seen immediately so double-invocations don't double-show
        localStorage.setItem(key, '1');

        // Try to get their display name from their profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, display_name')
          .eq('id', user.id)
          .single();

        const displayName =
          profile?.display_name ||
          profile?.full_name ||
          user.user_metadata?.full_name ||
          user.email?.split('@')[0] ||
          'there';

        setName(displayName);
        setShow(true);
      } catch {
        // Silently fail — modal is non-critical
      }
    })();
  }, []);

  if (!show) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-8">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShow(false)} />

      {/* Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-[24px] border border-border bg-bg-2 shadow-card animate-in fade-in zoom-in-95 duration-200">
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan via-purple/60 to-green/60" />

        {/* Close */}
        <button
          type="button"
          onClick={() => setShow(false)}
          className="absolute right-4 top-4 rounded-full p-1.5 text-text/40 transition hover:bg-white/5 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-7 pb-7 pt-6">
          {/* Logo + greeting */}
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan/25 to-cyan/8 ring-1 ring-cyan/20">
              <TrendingUp className="h-7 w-7 text-cyan" />
            </div>
            <h2 className="text-xl font-semibold text-white">
              Welcome, <span className="text-cyan">{name}</span>!
            </h2>
            <p className="mt-2 text-sm text-text/50">
              Your DebtTracker Pro account is ready. Here&apos;s a quick look at what you can do.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-3">
            {features.map(({ icon: Icon, color, bg, label, desc }) => (
              <div key={label} className="flex items-start gap-3 rounded-xl border border-border/60 bg-white/[0.02] p-3.5">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${bg}`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-white">{label}</p>
                  <p className="text-[12px] text-text/50">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={() => setShow(false)}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan px-5 py-3 text-[14px] font-semibold text-bg shadow-glow-sm transition-all hover:bg-cyan/90 active:scale-[0.98]"
          >
            Get started
            <ArrowRight className="h-4 w-4" />
          </button>

          <p className="mt-3 text-center text-[11px] text-text/25">
            This message only appears once.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
