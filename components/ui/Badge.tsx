'use client';

import { cn } from '@/lib/utils/cn';

interface BadgeProps {
  variant: 'status' | 'payment-type' | 'method' | 'channel';
  value: string;
}

const statusStyles: Record<string, string> = {
  active: 'bg-cyan/8 text-cyan border border-cyan/20',
  overdue: 'bg-orange/8 text-orange border border-orange/20',
  settled: 'bg-green/8 text-green border border-green/20',
  written_off: 'bg-text/8 text-text/50 border border-text/10',
};

const paymentStyles: Record<string, string> = {
  principal: 'bg-cyan/8 text-cyan border border-cyan/20',
  interest: 'bg-purple/8 text-purple border border-purple/20',
  penalty: 'bg-red/8 text-red border border-red/20',
  partial: 'bg-gold/10 text-gold border border-gold/20',
};

const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.16em]';

export function Badge({ variant, value }: BadgeProps) {
  const style =
    variant === 'status'
      ? (statusStyles[value] ?? 'bg-white/5 text-text/60 border border-white/8')
      : (paymentStyles[value] ?? 'bg-white/5 text-text/60 border border-white/8');

  return (
    <span className={cn(base, style)}>
      {value.replace('_', ' ')}
    </span>
  );
}
