'use client';

import type { BorrowerSummary } from '@/lib/types';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  borrowers: BorrowerSummary[];
}

export function InterestRateChart({ borrowers }: Props) {
  const data = borrowers.map((borrower) => ({ name: borrower.full_name, rate: borrower.interest_rate }));

  return (
    <div className="rounded-[18px] border border-border bg-bg/80 p-6 shadow-card">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.28em] text-text/60">Interest earned</p>
        <h2 className="text-xl font-semibold text-white">Interest per borrower</h2>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 0, left: -16, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fill: '#cbd5e1', fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip formatter={(value: number) => `${value}%`} />
            <Bar dataKey="rate" fill="#a78bfa" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
