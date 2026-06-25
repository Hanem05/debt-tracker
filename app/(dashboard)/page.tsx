export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { BorrowerSummary, LenderPortfolio } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/format';
import { StatCard } from '@/components/ui/StatCard';
import { DonutChart } from '@/components/dashboard/PortfolioPieChart';
import { BarChartCard } from '@/components/dashboard/LoanBreakdownChart';
import { TopBorrowersTable } from '@/components/dashboard/TopBorrowersTable';
import { InterestRateChart } from '@/components/dashboard/InterestRateChart';
import { TrendingUp, AlertTriangle, Wallet, BarChart3 } from 'lucide-react';
import Link from 'next/link';

const emptyPortfolio: LenderPortfolio = {
  lender_id: '', total_borrowers: 0, total_loaned: 0, total_outstanding: 0,
  total_collected_principal: 0, total_collected_interest: 0, total_accrued_interest: 0,
  active_count: 0, overdue_count: 0, settled_count: 0, avg_interest_rate: 0, collection_rate_pct: 0,
};

async function getPortfolio() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return emptyPortfolio;
    const { data } = await supabase.from('lender_portfolio').select('*').eq('lender_id', user.id).maybeSingle();
    return (data as LenderPortfolio) ?? emptyPortfolio;
  } catch {
    return emptyPortfolio;
  }
}

async function getBorrowers() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data } = await supabase
      .from('borrower_summary')
      .select('*')
      .eq('lender_id', user.id)
      .order('outstanding_principal', { ascending: false })
      .limit(8);
    return (data as BorrowerSummary[]) ?? [];
  } catch {
    return [];
  }
}

export default async function DashboardPage() {
  const portfolio = await getPortfolio();
  const borrowers = await getBorrowers();
  const totalCollected = portfolio.total_collected_principal + portfolio.total_collected_interest;

  return (
    <div className="space-y-5">
      {portfolio.overdue_count > 0 && (
        <Link
          href="/borrowers?status=overdue"
          className="flex items-center gap-3 rounded-xl border border-orange/20 bg-orange/10 px-5 py-3.5 text-orange transition hover:bg-orange/15"
        >
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <div className="flex-1">
            <span className="font-semibold">{portfolio.overdue_count} overdue loan{portfolio.overdue_count !== 1 ? 's' : ''}</span>
            <span className="ml-2 text-sm text-orange/70">— follow up before balances grow</span>
          </div>
          <span className="text-sm text-orange/60">View →</span>
        </Link>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total loaned"
          value={formatCurrency(portfolio.total_loaned)}
          color="cyan"
          icon={<Wallet className="h-5 w-5" />}
          sub={`${portfolio.total_borrowers} borrower${portfolio.total_borrowers !== 1 ? 's' : ''}`}
        />
        <StatCard
          label="Outstanding"
          value={formatCurrency(portfolio.total_outstanding)}
          color="orange"
          icon={<AlertTriangle className="h-5 w-5" />}
          sub={`${portfolio.overdue_count} overdue`}
        />
        <StatCard
          label="Accrued interest"
          value={formatCurrency(portfolio.total_accrued_interest)}
          color="purple"
          icon={<BarChart3 className="h-5 w-5" />}
          sub={`Avg ${portfolio.avg_interest_rate?.toFixed(1) ?? 0}% rate`}
        />
        <StatCard
          label="Collected"
          value={formatCurrency(totalCollected)}
          color="green"
          icon={<TrendingUp className="h-5 w-5" />}
          sub={`${portfolio.collection_rate_pct?.toFixed(0) ?? 0}% collection rate`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BarChartCard borrowers={borrowers} />
        <DonutChart borrowers={borrowers} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TopBorrowersTable borrowers={borrowers} />
        <InterestRateChart borrowers={borrowers} />
      </div>
    </div>
  );
}
