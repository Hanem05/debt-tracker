'use client';
import { memo } from 'react';

import type { BorrowerSummary } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrencyShort } from '@/lib/utils/format';

interface Props {
  borrowers: BorrowerSummary[];
}

export const BarChartCard = memo(function BarChartCard({ borrowers }: Props) {
  const data = borrowers
    .slice(0, 6)
    .map((b) => ({
      name: b.full_name.split(' ')[0],
      outstanding: b.outstanding_principal,
      paid: b.total_paid_principal,
    }));

  return (
    <div className="rounded-[18px] border border-border bg-bg/80 p-6 shadow-card">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-text/60">Loan breakdown</p>
          <h2 className="text-xl font-semibold text-white">Principal vs. paid</h2>
        </div>
        <div className="flex gap-3 text-xs text-text/50">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-cyan" />Paid</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-orange" />Outstanding</span>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fill: '#8b8ba8', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#8b8ba8', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={formatCurrencyShort} width={60} />
            <Tooltip
              contentStyle={{ background: '#11111c', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, fontSize: 13 }}
              labelStyle={{ color: '#f0f0ff', marginBottom: 4 }}
              formatter={(value: number, name: string) => [formatCurrencyShort(value), name === 'paid' ? 'Paid' : 'Outstanding']}
            />
            <Bar dataKey="paid" stackId="a" fill="#22d3ee" radius={[0, 0, 0, 0]} />
            <Bar dataKey="outstanding" stackId="a" fill="#f97316" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
);
