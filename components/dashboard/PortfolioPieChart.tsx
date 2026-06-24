import { memo } from 'react';
'use client';

import type { BorrowerSummary } from '@/lib/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/utils/format';

interface Props {
  borrowers: BorrowerSummary[];
}

const SLICES = [
  { key: 'active', label: 'Active', color: '#22d3ee' },
  { key: 'overdue', label: 'Overdue', color: '#f97316' },
  { key: 'settled', label: 'Settled', color: '#4ade80' },
];

export const DonutChart = memo(function DonutChart({ borrowers }: Props) {
  const totals = SLICES.map(({ key, label, color }) => ({
    name: label,
    value: borrowers.filter((b) => b.status === key).reduce((sum, b) => sum + b.outstanding_principal, 0),
    color,
  })).filter((d) => d.value > 0);

  const total = totals.reduce((s, d) => s + d.value, 0);

  return (
    <div className="rounded-[18px] border border-border bg-bg/80 p-6 shadow-card">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.28em] text-text/60">Portfolio</p>
        <h2 className="text-xl font-semibold text-white">By status</h2>
      </div>
      <div className="relative h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={totals}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              outerRadius={105}
              paddingAngle={3}
              strokeWidth={0}
            >
              {totals.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#11111c', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, fontSize: 13 }}
              labelStyle={{ color: '#f0f0ff' }}
              formatter={(value: number) => [formatCurrency(value), '']}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="font-mono text-lg font-semibold text-white">{formatCurrency(total)}</p>
          <p className="text-xs text-text/50">outstanding</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        {SLICES.map(({ key, label, color }) => {
          const count = borrowers.filter((b) => b.status === key).length;
          return (
            <div key={key} className="flex items-center gap-2 text-sm">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-text/60">{label}</span>
              <span className="font-medium text-white">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
);
