import { memo } from 'react';
'use client';

import type { BorrowerSummary } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  borrowers: BorrowerSummary[];
}

export const InterestRateChart = memo(function InterestRateChart({ borrowers }: Props) {
  const sorted = [...borrowers]
    .sort((a, b) => b.interest_rate - a.interest_rate)
    .slice(0, 6)
    .map((b) => ({ name: b.full_name.split(' ')[0], rate: b.interest_rate, status: b.status }));

  return (
    <div className="rounded-[18px] border border-border bg-bg/80 p-6 shadow-card">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.28em] text-text/60">Interest</p>
        <h2 className="text-xl font-semibold text-white">Rate per borrower</h2>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sorted} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
            <XAxis
              type="number"
              tick={{ fill: '#8b8ba8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#8b8ba8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={55}
            />
            <Tooltip
              contentStyle={{ background: '#11111c', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, fontSize: 13 }}
              labelStyle={{ color: '#f0f0ff' }}
              formatter={(value: number) => [`${value}%`, 'Rate']}
            />
            <Bar dataKey="rate" radius={[0, 6, 6, 0]}>
              {sorted.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.status === 'overdue' ? '#f97316' : entry.status === 'settled' ? '#4ade80' : '#a78bfa'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
);
