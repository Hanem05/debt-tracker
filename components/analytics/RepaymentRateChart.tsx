import { memo } from 'react';
'use client';

import type { BorrowerSummary } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '@/lib/utils/format';

interface Props {
  borrowers: BorrowerSummary[];
}

interface TooltipPayload {
  payload?: {
    paid: number;
    remaining: number;
    paidAmount: number;
    totalLoan: number;
    name: string;
  };
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.[0]?.payload) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl border border-white/10 bg-[#0d1428] px-4 py-3 text-sm shadow-xl">
      <p className="mb-1.5 font-medium text-white">{d.name}</p>
      <p className="text-[12px] text-[#38bdf8]">Paid: {d.paid}% — {formatCurrency(d.paidAmount)}</p>
      <p className="text-[12px] text-white/40">Remaining: {d.remaining}%</p>
    </div>
  );
}

export const RepaymentRateChart = memo(function RepaymentRateChart({ borrowers }: Props) {
  const data = borrowers.map((b) => {
    const totalLoan = (b.total_borrowed ?? 0) + (b.base_interest ?? 0);
    const paidPct = totalLoan > 0 ? Math.min(100, Math.round(((b.total_paid_all ?? 0) / totalLoan) * 100)) : 0;
    return {
      name: b.full_name,
      paid: paidPct,
      remaining: 100 - paidPct,
      paidAmount: b.total_paid_all ?? 0,
      totalLoan,
      status: b.status,
    };
  });

  return (
    <div className="rounded-[18px] border border-border bg-bg-2/60 p-6 shadow-card">
      <div className="mb-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-text/35">Repayment rate</p>
        <h2 className="mt-1 text-lg font-semibold text-white">Borrower progress</h2>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={32}>
            <XAxis
              dataKey="name"
              tick={{ fill: '#7a84aa', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: string) => v.split(' ')[0]}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(v: number) => `${v}%`}
              tick={{ fill: '#48527a', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              ticks={[0, 25, 50, 75, 100]}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 8 }} />
            {/* Remaining (bottom of stack — rendered first so paid sits on top) */}
            <Bar dataKey="remaining" stackId="a" fill="rgba(148,163,184,0.08)" radius={[0, 0, 0, 0]} />
            {/* Paid (top of stack) */}
            <Bar dataKey="paid" stackId="a" radius={[6, 6, 0, 0]}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={
                    entry.status === 'settled'
                      ? '#34d399'
                      : entry.status === 'overdue'
                      ? '#fb923c'
                      : '#38bdf8'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#38bdf8]" />
          <span className="text-[11px] text-text/40">Active</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#fb923c]" />
          <span className="text-[11px] text-text/40">Overdue</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#34d399]" />
          <span className="text-[11px] text-text/40">Settled</span>
        </div>
      </div>
    </div>
  );
}
);
