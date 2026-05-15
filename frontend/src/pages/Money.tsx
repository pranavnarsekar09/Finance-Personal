import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Car, ShoppingBag, Utensils, Zap, Coffee, Wallet, PiggyBank, TrendingUp, TrendingDown, Calendar as CalendarIcon } from "lucide-react";
import { useExpenses, useCalendar, useProfile, useDeleteExpense, useDeleteExpensesByMonth, useDeleteFoodLog, useFinance, useDashboard, useExpenseTrend } from "@/hooks/useApi";
import { useSwipeNative } from "@/hooks/useSwipe";
import { useHaptic } from "@/hooks/useHaptic";
import { format, parseISO, isToday, isYesterday, addMonths, subMonths, startOfMonth } from "date-fns";
import { formatRupees, cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Expense } from "@/lib/types";
import { SubtabPillBarWithIndicator } from "@/components/layout/SubtabPillBar";
import { ReceivedTab } from "@/components/finance/ReceivedTab";
import { CoveringsTab } from "@/components/finance/CoveringsTab";
import { CategoryPressure } from "@/components/cards/CategoryPressure";
import { SpendingTrendChart } from "@/components/charts/SpendingTrendChart";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { TransactionCard } from "@/components/transactions/TransactionCard";
import { DailySummaryHeader } from "@/components/transactions/DailySummaryHeader";
import { TransactionAnalyticsBar } from "@/components/transactions/TransactionAnalyticsBar";
import { SpendingInsightStrip } from "@/components/transactions/SpendingInsightStrip";
import { PremiumSearchBar, PremiumCategoryFilter } from "@/components/transactions/PremiumFilter";
import {
  calculateTransactionAnalytics,
  generateDailySummaries,
  generateTransactionInsights,
  getTransactionContext,
  calculateCategoryTrend,
} from "@/components/transactions/transactionUtils";
import { FinancialHeroCard } from "@/components/overview/FinancialHeroCard";
import { SmartStatGrid } from "@/components/overview/SmartStatCard";
import { FinancialInsightStrip } from "@/components/overview/FinancialInsightStrip";
import { SmartActivityCard } from "@/components/overview/SmartActivityCard";
import { EnhancedSpendingTrend } from "@/components/overview/EnhancedSpendingTrend";
import {
  calculateFinancialHealth,
  calculateSpendingPace,
  analyzeTrend,
  generateFinancialInsights,
  FinancialSummary,
} from "@/components/overview/financialUtils";

const MONEY_TABS = ["overview", "transactions", "income", "covered", "calendar"] as const;
type MoneyTab = (typeof MONEY_TABS)[number];

const categoryIcons: Record<string, any> = {
  Groceries: ShoppingBag,
  Dining: Utensils,
  Transport: Car,
  Bills: Zap,
  Entertainment: Coffee,
  default: ShoppingBag,
};

export default function Money() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get("tab");
  const initialTab: MoneyTab = MONEY_TABS.includes(urlTab as MoneyTab) ? (urlTab as MoneyTab) : "overview";
  
  const [tab, setTab] = useState<MoneyTab>(initialTab);
  const [direction, setDirection] = useState(0);
  const { medium } = useHaptic();

  useEffect(() => {
    if (urlTab && MONEY_TABS.includes(urlTab as MoneyTab)) {
      setTab(urlTab as MoneyTab);
    }
  }, [urlTab]);

  const handleTabChange = (newTab: MoneyTab) => {
    setTab(newTab);
    setSearchParams({ tab: newTab });
  };

  const pageVariants = {
    initial: (dir: number) => ({ x: dir > 0 ? 20 : -20, opacity: 0 }),
    animate: { x: 0, opacity: 1, transition: { duration: 0.24, ease: "easeOut" } },
    exit: (dir: number) => ({ x: dir > 0 ? -20 : 20, opacity: 0, transition: { duration: 0.18, ease: "easeIn" } }),
  };

  const changeTab = (nextTab: MoneyTab) => {
    const currentIndex = MONEY_TABS.indexOf(tab);
    const nextIndex = MONEY_TABS.indexOf(nextTab);
    setDirection(nextIndex > currentIndex ? 1 : -1);
    setTab(nextTab);
    setSearchParams({ tab: nextTab });
    medium();
  };

  useSwipeNative({
    onSwipeLeft: () => {
      const currentIndex = MONEY_TABS.indexOf(tab);
      if (currentIndex < MONEY_TABS.length - 1) {
        changeTab(MONEY_TABS[currentIndex + 1]);
      }
    },
    onSwipeRight: () => {
      const currentIndex = MONEY_TABS.indexOf(tab);
      if (currentIndex > 0) {
        changeTab(MONEY_TABS[currentIndex - 1]);
      }
    },
    threshold: 50,
    ignoreSelector: "[data-swipe-ignore]",
    scopeSelector: "[data-money-swipe='true']",
  });

  return (
    <div data-money-swipe="true" className="space-y-5 touch-pan-y">
      <div className="flex justify-between items-center">
        <SubtabPillBarWithIndicator
          tabs={MONEY_TABS}
          activeTab={tab}
          onTabChange={changeTab}
        />
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={tab}
          custom={direction}
          className="space-y-5"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {tab === "overview" && <OverviewTab />}
          {tab === "transactions" && <TransactionsTab />}
          {tab === "income" && <IncomeTabContent />}
          {tab === "covered" && <CoveredTabContent />}
          {tab === "calendar" && <CalendarTabContent />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function OverviewTab() {
  const today = format(new Date(), "yyyy-MM-dd");
  const month = format(new Date(), "yyyy-MM");
  
  const { data: dashboard, data: prevDashboard } = useDashboard(undefined, month, today);
  const { data: finance } = useFinance(undefined, today);
  const expenseTrend = useExpenseTrend(undefined, true);
  
  const totalSpent = dashboard?.totalSpent || 0;
  const monthlyBudget = dashboard?.monthlyBudget || 0;
  const remaining = monthlyBudget - totalSpent;
  const dailyLimit = finance?.dailyLimit || 0;
  const todaySpent = finance?.todaySpent || 0;
  const buffer = finance?.buffer || 0;
  const savings = finance?.savings || 0;
  const todayDifference = finance?.todayDifference || 0;
  const categoryData = dashboard?.categorySpending || [];

  const allExpenses = useMemo(() => {
    return expenseTrend.data.flatMap((entry) => entry.expenses);
  }, [expenseTrend.data]);

  const summary: FinancialSummary = useMemo(() => ({
    remaining,
    totalSpent,
    monthlyBudget,
    dailyLimit,
    todaySpent,
    buffer,
    savings,
    todayDifference,
  }), [remaining, totalSpent, monthlyBudget, dailyLimit, todaySpent, buffer, savings, todayDifference]);

  const pace = useMemo(() => {
    return calculateSpendingPace(totalSpent, monthlyBudget);
  }, [totalSpent, monthlyBudget]);

  const trend = useMemo(() => {
    return analyzeTrend(allExpenses, month);
  }, [allExpenses, month]);

  const health = useMemo(() => {
    const prevMonthTotal = prevDashboard?.totalSpent || 0;
    return calculateFinancialHealth(summary, pace, prevMonthTotal);
  }, [summary, pace, prevDashboard]);

  const insights = useMemo(() => {
    return generateFinancialInsights(health, pace, trend, categoryData);
  }, [health, pace, trend, categoryData]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _health = health;

  const avgTransactionAmount = useMemo(() => {
    if (allExpenses.length === 0) return 0;
    return allExpenses.reduce((sum, e) => sum + e.amount, 0) / allExpenses.length;
  }, [allExpenses]);

  return (
    <div className="space-y-5">
      <div className="pt-2">
        <h1 className="font-display text-4xl font-bold tracking-tight">Money</h1>
        <p className="text-sm text-muted-foreground mt-1">Your financial intelligence at a glance</p>
      </div>

      <FinancialHeroCard
        remaining={remaining}
        totalSpent={totalSpent}
        monthlyBudget={monthlyBudget}
        health={health}
        pace={pace}
        trend={trend}
      />

      {insights.length > 0 && (
        <FinancialInsightStrip insights={insights} />
      )}

      <SmartStatGrid
        dailyLimit={dailyLimit}
        todaySpent={todaySpent}
        todayDifference={todayDifference}
        buffer={buffer}
        savings={savings}
        paceStatus={pace.status}
      />

      <EnhancedSpendingTrend 
        expenses={allExpenses} 
        isLoading={expenseTrend.isLoading}
        trend={trend}
      />

      <CategoryPressure data={categoryData} />

      {dashboard?.recentTransactions?.[0] && (
        <SmartActivityCard 
          expense={dashboard.recentTransactions[0]} 
          averageAmount={avgTransactionAmount}
        />
      )}
    </div>
  );
}

function TransactionsTab() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const { data: expenses, isLoading: expLoading } = useExpenses(undefined, format(currentMonth, "yyyy-MM"));
  const { data: profile } = useProfile();
  const deleteExpense = useDeleteExpense();

  const filters = ["All", ...(profile?.categories?.map((c: any) => c.name) || [])];
  const monthlyBudget = profile?.monthlyBudget || 0;

  const filteredExpenses = useMemo(() => {
    return (expenses || []).filter((e: Expense) => {
      const matchesFilter = filter === "All" || e.categoryName === filter;
      const matchesSearch =
        (e.note?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        e.categoryName.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [expenses, filter, search]);

  const analytics = useMemo(() => {
    return calculateTransactionAnalytics(filteredExpenses, monthlyBudget, currentMonth);
  }, [filteredExpenses, monthlyBudget, currentMonth]);

  const dailySummaries = useMemo(() => {
    return generateDailySummaries(filteredExpenses, monthlyBudget);
  }, [filteredExpenses, monthlyBudget]);

  const insights = useMemo(() => {
    return generateTransactionInsights(analytics, dailySummaries);
  }, [analytics, dailySummaries]);

  const categoryTrend = useMemo(() => {
    return calculateCategoryTrend(filteredExpenses);
  }, [filteredExpenses]);

  const groupedExpenses = useMemo(() => {
    return filteredExpenses.reduce((groups: Record<string, Expense[]>, expense) => {
      const dateKey = expense.date.split('T')[0];
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(expense);
      return groups;
    }, {});
  }, [filteredExpenses]);

  const sortedDates = Object.keys(groupedExpenses).sort((a, b) => b.localeCompare(a));

  const dailySummaryMap = useMemo(() => {
    return dailySummaries.reduce((map, summary) => {
      map[summary.date] = summary;
      return map;
    }, {} as Record<string, typeof dailySummaries[0]>);
  }, [dailySummaries]);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense.mutateAsync(id);
      toast.success("Expense deleted");
    } catch (err: any) {
      toast.error("Failed to delete: " + err.message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="font-display text-4xl font-bold tracking-tight">Transactions</h1>
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">{format(currentMonth, "MMMM yyyy")}</div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={handlePrevMonth} className="h-8 w-8 rounded-full bg-card shadow-soft flex items-center justify-center hover:bg-secondary transition" aria-label="Previous month">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-xs font-medium text-muted-foreground min-w-[4.5rem] text-center">{format(currentMonth, "MMM yyyy")}</span>
        <button onClick={handleNextMonth} className="h-8 w-8 rounded-full bg-card shadow-soft flex items-center justify-center hover:bg-secondary transition" aria-label="Next month">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <PremiumSearchBar value={search} onChange={setSearch} />

      <PremiumCategoryFilter categories={filters} activeCategory={filter} onCategoryChange={setFilter} />

      {filteredExpenses.length > 0 && (
        <>
          <TransactionAnalyticsBar analytics={analytics} />
          <SpendingInsightStrip insights={insights} />
        </>
      )}

      <div className="space-y-5">
        {expLoading ? (
          <div className="p-10 text-center text-muted-foreground animate-pulse bg-card rounded-[1.75rem]">Loading transactions...</div>
        ) : sortedDates.length > 0 ? (
          sortedDates.map((date) => {
            const daySummary = dailySummaryMap[date];
            return (
              <div key={date} className="space-y-2">
                {daySummary && <DailySummaryHeader summary={daySummary} />}
                <div className="bg-card rounded-[1.75rem] shadow-soft divide-y divide-border/20 overflow-hidden border border-border/20">
                  {groupedExpenses[date].map((t) => (
                    <TransactionCard
                      key={t.id}
                      expense={t}
                      context={getTransactionContext(t, analytics.averageTransaction, categoryTrend)}
                      averageAmount={analytics.averageTransaction}
                      onDelete={handleDelete}
                      isDeleting={deleteExpense.isPending}
                    />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-10 text-center text-muted-foreground bg-card rounded-[1.75rem]">No transactions found.</div>
        )}
      </div>
    </div>
  );
}

function IncomeTabContent() {
  return (
    <div className="space-y-5">
      <div className="pt-2">
        <h1 className="font-display text-4xl font-bold tracking-tight">Income</h1>
        <p className="text-sm text-muted-foreground mt-1">Your financial wellness at a glance</p>
      </div>
      <ReceivedTab />
    </div>
  );
}

function CoveredTabContent() {
  return (
    <div className="space-y-5">
      <div className="pt-2">
        <h1 className="font-display text-4xl font-bold tracking-tight">Covered</h1>
        <p className="text-sm text-muted-foreground mt-1">Recurring expenses covered by your budget</p>
      </div>
      <CoveringsTab />
    </div>
  );
}

function CalendarTabContent() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const monthStr = format(currentMonth, "yyyy-MM");

  const { data: calendar, isLoading: calLoading } = useCalendar(undefined, monthStr);
  const deleteExpense = useDeleteExpense();
  const deleteFoodLog = useDeleteFoodLog();
  const deleteExpensesByMonth = useDeleteExpensesByMonth();

  const handleDelete = async (id: string) => {
    if (confirm("Delete this expense?")) {
      try {
        await deleteExpense.mutateAsync(id);
        toast.success("Expense deleted");
      } catch (err: any) {
        toast.error("Failed: " + err.message);
      }
    }
  };

  const handleDeleteMeal = async (id: string) => {
    if (confirm("Delete this meal log?")) {
      try {
        await deleteFoodLog.mutateAsync(id);
        toast.success("Meal deleted");
      } catch (err: any) {
        toast.error("Failed: " + err.message);
      }
    }
  };

  const handleDeleteMonth = async () => {
    if (confirm(`Delete ALL expenses for ${format(currentMonth, "MMMM yyyy")}?`)) {
      try {
        await deleteExpensesByMonth.mutateAsync(monthStr);
        toast.success("Month data cleared");
      } catch (err: any) {
        toast.error("Failed: " + err.message);
      }
    }
  };

  return (
    <div className="space-y-5">
      <div className="pt-2">
        <h1 className="font-display text-4xl font-bold tracking-tight">Calendar</h1>
        <p className="text-sm text-muted-foreground mt-1">Your unified life calendar</p>
      </div>

      <CalendarGrid
        entries={calendar || []}
        isLoading={calLoading}
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
        onDeleteExpense={handleDelete}
        onDeleteMeal={handleDeleteMeal}
        onDeleteMonth={handleDeleteMonth}
        isDeleting={deleteExpensesByMonth.isPending}
      />
    </div>
  );
}

