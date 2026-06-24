'use client';
import { memo } from 'react';

import type { BorrowerSummary } from '@/lib/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface Props {
  borrowers: BorrowerSummary[];
}

const COLORS = ['#22d3ee', '#4ade80', '#f97316', '#a78bfa', '#fbbf24'];

export const LoanDistributionChart = memo(function LoanDistributionChart({ borrowers }: Props) {
  const data = borrowers.map((borrower) => ({ name: borrower.full_name, value: borrower.total_borrowed }));

  return (
    <div className="rounded-[18px] border border-border bg-bg/80 p-6 shadow-card">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.28em] text-text/60">Loan distribution</p>
        <h2 className="text-xl font-semibold text-white">Portfolio mix</h2>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={110} innerRadius={60} paddingAngle={4}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
);
