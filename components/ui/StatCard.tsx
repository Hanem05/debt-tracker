import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon?: ReactNode;
  color?: 'cyan' | 'orange' | 'green' | 'purple';
}

const accentLine: Record<string, string> = {
  cyan: 'from-cyan via-cyan/40 to-transparent',
  orange: 'from-orange via-orange/40 to-transparent',
  green: 'from-green via-green/40 to-transparent',
  purple: 'from-purple via-purple/40 to-transparent',
};

const iconWrap: Record<string, string> = {
  cyan: 'bg-gradient-to-br from-cyan/20 to-cyan/5 text-cyan ring-1 ring-cyan/15',
  orange: 'bg-gradient-to-br from-orange/20 to-orange/5 text-orange ring-1 ring-orange/15',
  green: 'bg-gradient-to-br from-green/20 to-green/5 text-green ring-1 ring-green/15',
  purple: 'bg-gradient-to-br from-purple/20 to-purple/5 text-purple ring-1 ring-purple/15',
};

const valueColor: Record<string, string> = {
  cyan: 'text-cyan',
  orange: 'text-orange',
  green: 'text-green',
  purple: 'text-purple',
};

export function StatCard({ label, value, sub, icon, color = 'cyan' }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-[18px] border border-border bg-gradient-to-b from-bg-3/60 to-bg shadow-card transition-shadow hover:shadow-glow-sm">
      {/* Accent line */}
      <div className={`h-px bg-gradient-to-r ${accentLine[color]}`} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-text/50">{label}</p>
            <p className={`mt-3 font-mono text-[1.75rem] font-semibold leading-none tracking-tight ${valueColor[color]}`}>
              {value}
            </p>
          </div>
          {icon ? (
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconWrap[color]}`}>
              {icon}
            </div>
          ) : null}
        </div>
        {sub ? <p className="mt-4 text-[13px] text-text/50">{sub}</p> : null}
      </div>
    </div>
  );
}
