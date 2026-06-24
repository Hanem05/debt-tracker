export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import type { BorrowerSummary } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/format';
import { StatCard } from '@/components/ui/StatCard';
import { RepaymentRateChart } from '@/components/analytics/RepaymentRateChart';
import { LoanDistributionChart } from '@/components/analytics/LoanDistributionChart';
import { InterestRateChart } from '@/components/analytics/InterestRateChart';
import { MetricsTable } from '@/components/analytics/MetricsTable';
import { TrendingUp, Percent, DollarSign, Users } from 'lucide-react';

async function getBorrowers() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data } = await supabase.from('borrower_summary').select('*').eq('lender_id', user.id).order('full_name', { ascending: true });
    return (data as BorrowerSummary[]) ?? [];
  } catch {
    return [];
  }
}

export default async function AnalyticsPage() {
  const borrowers = await getBorrowers();
  const totalBorrowed = borrowers.reduce((sum, b) => sum + (b.total_borrowed ?? 0), 0);
  const totalAccrued = borrowers.reduce((sum, b) => sum + (b.accrued_interest ?? 0), 0);
  const collectionRate = totalBorrowed
    ? Math.round((borrowers.reduce((sum, b) => sum + (b.total_paid_principal ?? 0), 0) / totalBorrowed) * 100)
    : 0;
  const avgInterest = borrowers.length
    ? borrowers.reduce((sum, b) => sum + (b.interest_rate ?? 0), 0) / borrowers.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-4">
        <StatCard
          label="Collection rate"
          value={`${collectionRate}%`}
          color="green"
          icon={<TrendingUp className="h-5 w-5" />}
          sub={collectionRate >= 80 ? 'Above target' : collectionRate >= 50 ? 'Moderate' : 'Below target'}
        />
        <StatCard
          label="Avg interest rate"
          value={`${avgInterest.toFixed(1)}%`}
          color="purple"
          icon={<Percent className="h-5 w-5" />}
        />
        <StatCard
          label="Accrued interest"
          value={formatCurrency(totalAccrued)}
          color="cyan"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          label="Total borrowers"
          value={String(borrowers.length)}
          color="orange"
          icon={<Users className="h-5 w-5" />}
          sub={`${borrowers.filter((b) => b.status === 'overdue').length} overdue`}
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <RepaymentRateChart borrowers={borrowers} />
        <LoanDistributionChart borrowers={borrowers} />
        <InterestRateChart borrowers={borrowers} />
      </div>
      <MetricsTable borrowers={borrowers} />
    </div>
  );
}
