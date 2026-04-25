import { useEffect, useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, RefreshCw, Sparkles, Target } from "lucide-react";
import { motion } from "framer-motion";
import { useAsync } from "../../hooks/useAsync";
import { api } from "../../lib/api";
import { USER_ID } from "../../lib/constants";
import { currency, monthKey, todayKey, shortDate, haptic } from "../../lib/utils";
import { DashboardCharts } from "../../components/charts/DashboardCharts";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { SavingsJar } from "../../components/ui/SavingsJar";
import { AppCard, BalanceCard, SectionHeader, TransactionItem } from "../../ui/fintech";

export function DashboardPage({ profile }) {
  const [refreshTick, setRefreshTick] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const currentMonth = monthKey();
  const todayDate = todayKey();

  const { data: summary, execute: reloadSummary } = useAsync(
    () => api.getDashboard(USER_ID, currentMonth, todayDate),
    [currentMonth, todayDate, refreshTick],
  );
  const { data: insight, execute: reloadInsight } = useAsync(() => api.getInsight(USER_ID), [refreshTick]);
  const { data: goals } = useAsync(() => api.getGoals(USER_ID), [refreshTick]);
  const { data: recentExpenses, execute: reloadExpenses } = useAsync(
    () => api.getExpenses(USER_ID, currentMonth),
    [currentMonth, refreshTick],
    { initialData: [] },
  );

  const handlePullToRefresh = async () => {
    haptic(20);
    setIsRefreshing(true);
    setRefreshTick((value) => value + 1);
    await Promise.all([reloadSummary(), reloadInsight(), reloadExpenses()]);
    setIsRefreshing(false);
  };

  useEffect(() => {
    const handleRefresh = () => {
      setRefreshTick((value) => value + 1);
    };
    window.addEventListener("fintrack:data-updated", handleRefresh);
    return () => window.removeEventListener("fintrack:data-updated", handleRefresh);
  }, []);

  const balance = useMemo(
    () => Math.max(0, Number(profile?.monthlyBudget || 0) - Number(summary?.totalSpent || 0)),
    [profile?.monthlyBudget, summary?.totalSpent],
  );

  if (!summary) {
    return (
      <div className="page-shell flex items-center justify-center">
        <RefreshCw className="animate-spin text-sky-500" />
      </div>
    );
  }

  const dateString = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <div className="page-shell relative">
      <motion.div
        style={{ opacity: isRefreshing ? 1 : 0 }}
        className="absolute left-1/2 top-2 z-50 -translate-x-1/2 rounded-full bg-slate-900 p-2 text-white shadow-lg"
      >
        <RefreshCw size={16} className="animate-spin" />
      </motion.div>

      <div
        onTouchEnd={() => {
          if (window.scrollY === 0) {
            handlePullToRefresh();
          }
        }}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-500">{dateString}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              Hello, {profile?.name || "there"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">Here’s your money pulse for today.</p>
          </div>
          <div className="rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-600">
            {summary.streak || 0} day streak
          </div>
        </div>

        <BalanceCard
          name={profile?.name}
          balance={balance}
          spentToday={summary.spentToday}
          remainingBudget={summary.remainingBudget}
        />

        <div className="mt-4 grid grid-cols-2 gap-4">
          <AppCard interactive className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-500/10 dark:to-slate-900/50">
            <p className="text-sm text-slate-500">Income target</p>
            <div className="mt-3 flex items-center gap-2">
              <div className="rounded-2xl bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                <ArrowUpRight className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">{currency(profile?.monthlyBudget || 0)}</p>
                <p className="text-xs text-slate-500">Monthly plan</p>
              </div>
            </div>
          </AppCard>

          <AppCard interactive className="bg-gradient-to-br from-rose-50 to-white dark:from-rose-500/10 dark:to-slate-900/50">
            <p className="text-sm text-slate-500">Expenses</p>
            <div className="mt-3 flex items-center gap-2">
              <div className="rounded-2xl bg-rose-100 p-2 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
                <ArrowDownRight className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">{currency(summary.totalSpent)}</p>
                <p className="text-xs text-slate-500">Spent this month</p>
              </div>
            </div>
          </AppCard>
        </div>

        <div className="mt-4">
          <AppCard className="bg-gradient-to-br from-sky-50 via-white to-cyan-50 dark:from-sky-500/10 dark:via-slate-900/50 dark:to-cyan-500/10">
            <div className="flex gap-3">
              <div className="rounded-2xl bg-white p-3 text-sky-600 shadow-sm shadow-slate-900/5 dark:bg-slate-800">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-500">
                  {insight?.headline || "AI Insight"}
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {Math.round(insight?.runwayDays || 0)} runway days
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{insight?.summary}</p>
              </div>
            </div>
          </AppCard>
        </div>

        <div className="mt-6">
          <DashboardCharts
            dailySpending={summary.dailySpending || []}
            categorySpending={summary.categorySpending || []}
          />
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <AppCard>
            <SectionHeader
              eyebrow="Transactions"
              title="Recent activity"
              description="A cleaner ledger of your latest money moves."
            />
            <div className="mt-5 space-y-3">
              {recentExpenses?.length ? recentExpenses.slice(0, 5).map((entry) => (
                <TransactionItem
                  key={entry.id}
                  title={entry.categoryName}
                  subtitle={`${shortDate(entry.date)} • ${entry.paymentMethod}`}
                  amount={entry.amount}
                  icon={entry.isRecurring ? "recurring" : "wallet"}
                  rightDetail={entry.note || "No note"}
                />
              )) : (
                <p className="text-sm text-slate-500">Your recent transactions will appear here as you log expenses.</p>
              )}
            </div>
          </AppCard>

          <div className="space-y-4">
            <AppCard>
              <SectionHeader
                eyebrow="Goals"
                title="Savings"
                description="Two quick jars to keep goals visible."
                actions={<Target className="h-5 w-5 text-sky-500" />}
              />
              <div className="mt-5 flex flex-wrap justify-around gap-6">
                {goals?.length ? goals.slice(0, 2).map((goal) => (
                  <SavingsJar
                    key={goal.id}
                    label={goal.title || goal.type}
                    progress={goal.targetAmount ? goal.currentAmount / goal.targetAmount : 0}
                  />
                )) : (
                  <p className="py-6 text-sm text-slate-500">No savings goals yet. Head to profile to add one.</p>
                )}
              </div>
            </AppCard>

            <AppCard>
              <SectionHeader
                eyebrow="Budgets"
                title="Category momentum"
                description="Watch budget pressure before it snowballs."
              />
              <div className="mt-5 space-y-4">
                {summary.categorySpending?.length ? summary.categorySpending.map((item) => (
                  <div key={item.categoryName}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{item.categoryName}</span>
                      <span className="text-slate-500">
                        {currency(item.spent)} / {currency(item.budget)}
                      </span>
                    </div>
                    <ProgressBar value={item.spent} total={item.budget} />
                  </div>
                )) : (
                  <p className="text-sm text-slate-500">Your custom categories will show up here as you start tracking.</p>
                )}
              </div>
            </AppCard>
          </div>
        </div>
      </div>
    </div>
  );
}
