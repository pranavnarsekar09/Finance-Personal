import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { useAsync } from "../../hooks/useAsync";
import { api } from "../../lib/api";
import { USER_ID } from "../../lib/constants";
import { currency, monthKey, shortDate } from "../../lib/utils";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/ui/Card";
import { StatCard } from "../../components/ui/StatCard";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { SpendingChart } from "../../components/charts/SpendingChart";

export function DashboardPage() {
  const [refreshTick, setRefreshTick] = useState(0);
  const currentMonth = monthKey();
  const { data: summary, execute: reloadSummary } = useAsync(() => api.getDashboard(USER_ID, currentMonth), [currentMonth, refreshTick]);
  const { data: insight, execute: reloadInsight } = useAsync(() => api.getInsight(USER_ID), [refreshTick]);

  useEffect(() => {
    const handleRefresh = () => {
      setRefreshTick((value) => value + 1);
      reloadSummary().catch(() => undefined);
      reloadInsight().catch(() => undefined);
    };
    window.addEventListener("fintrack:data-updated", handleRefresh);
    return () => window.removeEventListener("fintrack:data-updated", handleRefresh);
  }, [reloadInsight, reloadSummary]);

  if (!summary) {
    return <div className="page-shell">Loading dashboard...</div>;
  }

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Overview"
        title="Your money and meals, in one pulse."
        description="Track budget pressure, calorie momentum, and category drift without bouncing between tools."
      />

      <div className="card-grid">
        <StatCard label="Budget Used" value={currency(summary.totalSpent)} subtext={`${currency(summary.remainingBudget)} left this month`} />
        <StatCard
          label="Calories Today"
          value={`${Math.round(summary.caloriesToday)} kcal`}
          subtext={`${Math.round(summary.calorieGoal)} kcal target`}
          accent="from-emerald-400/15 to-cyan-300/10"
        />
        <StatCard label="Food Cost" value={currency(summary.monthlyFoodCost)} subtext="Auto-tracked from meal logs" accent="from-sky-400/15 to-emerald-300/10" />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-white">Category Momentum</h2>
              <p className="text-sm text-muted">Dynamic spending by your own categories</p>
            </div>
          </div>
          <SpendingChart data={summary.categorySpending} />
          <div className="mt-4 space-y-4">
            {summary.categorySpending.length ? summary.categorySpending.map((item) => (
              <div key={item.categoryName}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>{item.categoryName}</span>
                  <span className="text-slate-400">
                    {currency(item.spent)} / {currency(item.budget)}
                  </span>
                </div>
                <ProgressBar value={item.spent} total={item.budget} />
              </div>
            )) : <p className="text-sm text-slate-500">Your custom categories will show up here as you start tracking.</p>}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-cyan-400/10 to-transparent">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-cyan-400/15 p-3 text-cyan-200">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">{insight?.headline || "AI Insight"}</p>
                <h3 className="mt-2 font-display text-2xl font-bold text-white">{Math.round(insight?.runwayDays || 0)} runway days</h3>
                <p className="mt-2 text-sm text-slate-300">{insight?.summary}</p>
                <p className="mt-3 text-sm text-slate-400">Top category: {insight?.topCategory || "N/A"}</p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-display text-xl font-bold text-white">Recent Transactions</h3>
            <div className="mt-4 space-y-3">
              {summary.recentTransactions.length ? summary.recentTransactions.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div>
                    <p className="font-medium text-white">{entry.categoryName}</p>
                    <p className="text-sm text-slate-400">{shortDate(entry.date)} • {entry.paymentMethod}</p>
                  </div>
                  <p className="font-semibold text-cyan-100">{currency(entry.amount)}</p>
                </div>
              )) : <p className="text-sm text-slate-500">No transactions yet. Add an expense or save a meal to populate the dashboard.</p>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
