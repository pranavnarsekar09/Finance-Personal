import { useEffect, useState, useRef } from "react";
import { Sparkles, RefreshCw, Flame, Target } from "lucide-react";
import { motion, useScroll, useMotionValue, useTransform } from "framer-motion";
import { useAsync } from "../../hooks/useAsync";
import { api } from "../../lib/api";
import { USER_ID } from "../../lib/constants";
import { currency, monthKey, shortDate, haptic, emitDataRefresh } from "../../lib/utils";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/ui/Card";
import { StatCard } from "../../components/ui/StatCard";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { DashboardCharts } from "../../components/charts/DashboardCharts";
import { SavingsJar } from "../../components/ui/SavingsJar";

export function DashboardPage() {
  const [refreshTick, setRefreshTick] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const currentMonth = monthKey();
  
  const { data: summary, execute: reloadSummary } = useAsync(() => api.getDashboard(USER_ID, currentMonth), [currentMonth, refreshTick]);
  const { data: insight, execute: reloadInsight } = useAsync(() => api.getInsight(USER_ID), [refreshTick]);
  const { data: goals } = useAsync(() => api.getGoals(USER_ID), [refreshTick]);

  const handlePullToRefresh = async () => {
    haptic(20);
    setIsRefreshing(true);
    setRefreshTick((v) => v + 1);
    await Promise.all([reloadSummary(), reloadInsight()]);
    setIsRefreshing(false);
  };

  useEffect(() => {
    const handleRefresh = () => {
      setRefreshTick((value) => value + 1);
    };
    window.addEventListener("fintrack:data-updated", handleRefresh);
    return () => window.removeEventListener("fintrack:data-updated", handleRefresh);
  }, []);

  if (!summary) {
    return <div className="page-shell flex items-center justify-center">
      <RefreshCw className="animate-spin text-cyan-400" />
    </div>;
  }

  const today = new Date();
  const dateString = new Intl.DateTimeFormat("en-IN", { 
    weekday: "long", 
    day: "numeric", 
    month: "long" 
  }).format(today);

  return (
    <div className="page-shell relative">
      {/* Pull to Refresh Indicator */}
      <motion.div 
        style={{ opacity: isRefreshing ? 1 : 0 }}
        className="absolute left-1/2 top-2 z-50 -translate-x-1/2 rounded-full bg-cyan-400 p-2 text-slate-950 shadow-lg"
      >
        <RefreshCw size={16} className="animate-spin" />
      </motion.div>

      <div 
        onTouchEnd={(e) => {
          if (window.scrollY === 0) handlePullToRefresh();
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">{dateString}</p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-orange-500/10 px-3 py-1.5 text-orange-400">
            <Flame size={16} />
            <span className="text-sm font-bold">{summary.streak || 0} Day Streak</span>
          </div>
        </div>

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
          <StatCard 
            label="Today's Spent" 
            value={currency(summary.spentToday)} 
            subtext={summary.spentToday > 1000 ? "High spending today" : "Normal spending day"} 
            accent="from-sky-400/15 to-emerald-300/10" 
          />
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex gap-3">
          <button 
            onClick={() => { haptic(20); window.location.hash = "/finance"; }}
            className="flex-1 rounded-2xl bg-white/5 border border-white/10 p-4 text-center hover:bg-white/10 transition-all"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Log</p>
            <p className="text-lg font-bold text-white">Expense</p>
          </button>
          <button 
            onClick={() => { haptic(20); window.location.hash = "/food"; }}
            className="flex-1 rounded-2xl bg-white/5 border border-white/10 p-4 text-center hover:bg-white/10 transition-all"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Log</p>
            <p className="text-lg font-bold text-white">Meal</p>
          </button>
        </div>

        <div className="mt-6">
          <Card className="border-cyan-300/20 bg-gradient-to-br from-cyan-400/10 to-transparent">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-cyan-400/15 p-3 text-cyan-200">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">{insight?.headline || "AI Insight"}</p>
                <h3 className="mt-1 font-display text-xl font-bold text-white">{Math.round(insight?.runwayDays || 0)} runway days</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{insight?.summary}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-8">
          <DashboardCharts 
            dailySpending={summary.dailySpending || []} 
            categorySpending={summary.categorySpending || []} 
          />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-6">
            <Card>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl font-bold text-white">Savings Goals</h2>
                  <p className="text-sm text-muted">Building your future, one jar at a time</p>
                </div>
                <Target className="text-cyan-400" size={24} />
              </div>
              
              <div className="flex flex-wrap justify-around gap-8">
                {goals?.length ? goals.slice(0, 2).map(goal => (
                  <SavingsJar 
                    key={goal.id} 
                    label={goal.title} 
                    progress={goal.currentAmount / goal.targetAmount} 
                  />
                )) : (
                  <div className="py-8 text-center text-slate-500">
                    <p>No savings goals set yet.</p>
                    <p className="text-xs">Head to Goals to start saving!</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <h2 className="font-display text-2xl font-bold text-white">Category Momentum</h2>
              <div className="mt-6 space-y-4">
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
          </div>
        </div>
      </div>
    </div>
  );
}
