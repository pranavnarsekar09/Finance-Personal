import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, ChevronLeft, ChevronRight, Car, ShoppingBag, Utensils, Zap, Coffee, Trash2, Wallet, PiggyBank, TrendingUp, TrendingDown, Calendar as CalendarIcon } from "lucide-react";
import { useExpenses, useCalendar, useProfile, useDeleteExpense, useDeleteExpensesByMonth, useFinance, useDashboard, useExpenseTrend } from "@/hooks/useApi";
import { useSwipeNative } from "@/hooks/useSwipe";
import { useHaptic } from "@/hooks/useHaptic";
import { format, parseISO, isToday, isYesterday, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";
import { formatRupees, cn } from "@/lib/utils";
import { toast } from "sonner";
import type { CalendarEntry, Expense } from "@/lib/types";
import { SubtabPillBarWithIndicator } from "@/components/layout/SubtabPillBar";
import { ReceivedTab } from "@/components/finance/ReceivedTab";
import { CoveringsTab } from "@/components/finance/CoveringsTab";
import { CategoryPressure } from "@/components/cards/CategoryPressure";
import { SpendingTrendChart } from "@/components/charts/SpendingTrendChart";

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
  const [tab, setTab] = useState<MoneyTab>("overview");
  const [direction, setDirection] = useState(0);
  const { medium } = useHaptic();

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
  
  const { data: dashboard } = useDashboard(undefined, month, today);
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

  return (
    <div className="space-y-5">
      <div className="pt-2">
        <h1 className="font-display text-4xl font-bold tracking-tight">Money</h1>
        <p className="text-sm text-muted-foreground mt-1">Your financial overview at a glance</p>
      </div>

      <div className="bg-gradient-to-br from-surface-dark via-[#1a3a2e] to-[#0f2420] rounded-[2rem] shadow-float p-6 text-primary-foreground overflow-hidden relative border border-white/5">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-mint/20 blur-3xl" />
        <div className="relative">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-mint/70">Available Balance</div>
              <div className="font-display text-4xl font-bold mt-1">{formatRupees(remaining)}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60">This Month</div>
              <div className="text-sm text-muted-foreground/80">Spent {formatRupees(totalSpent)} of {formatRupees(monthlyBudget)}</div>
            </div>
          </div>
          
          <div className="mt-6 h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-mint to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((totalSpent / monthlyBudget) * 100, 100)}%` }}
            />
          </div>
          
          <div className="flex justify-between mt-2 text-[10px] text-muted-foreground/60">
            <span>{Math.round((totalSpent / monthlyBudget) * 100)}% used</span>
            <span>{Math.round(100 - (totalSpent / monthlyBudget) * 100)}% remaining</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-[1.75rem] shadow-soft p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-3">
            <Wallet className="h-4 w-4 text-primary" />
            Daily Limit
          </div>
          <div className="font-display text-2xl font-bold">{formatRupees(dailyLimit)}</div>
          <div className={cn("text-xs mt-2", todaySpent > dailyLimit ? "text-coral" : "text-muted-foreground")}>
            Spent: {formatRupees(todaySpent)}
          </div>
        </div>

        <div className="bg-card rounded-[1.75rem] shadow-soft p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-3">
            <TrendingDown className="h-4 w-4 text-primary" />
            Today
          </div>
          <div className={cn("font-display text-2xl font-bold", todayDifference > 0 ? "text-mint" : "text-coral")}>
            {todayDifference > 0 ? "+" : ""}{formatRupees(todayDifference)}
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            {todayDifference > 0 ? "Under budget" : "Over budget"}
          </div>
        </div>

        <div className="bg-card rounded-[1.75rem] shadow-soft p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-3">
            <PiggyBank className="h-4 w-4 text-primary" />
            Buffer
          </div>
          <div className="font-display text-2xl font-bold">{formatRupees(buffer)}</div>
          <div className="text-xs text-muted-foreground mt-2">Emergency fund</div>
        </div>

        <div className="bg-card rounded-[1.75rem] shadow-soft p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-3">
            <TrendingUp className="h-4 w-4 text-primary" />
            Savings
          </div>
          <div className="font-display text-2xl font-bold text-mint">{formatRupees(savings)}</div>
          <div className="text-xs text-muted-foreground mt-2">Cumulative</div>
        </div>
      </div>

      <SpendingTrendChart expenses={expenseTrend.data.flatMap((entry) => entry.expenses)} isLoading={expenseTrend.isLoading} />

      <CategoryPressure data={dashboard?.categorySpending || []} />

      {dashboard?.recentTransactions?.[0] && (
        <div className="bg-card rounded-[1.75rem] shadow-soft p-4 border border-border/30">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-3">Latest Transaction</div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
              {(() => {
                const Icon = categoryIcons[dashboard.recentTransactions[0].categoryName] || categoryIcons.default;
                return <Icon className="h-5 w-5 text-muted-foreground" />;
              })()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{dashboard.recentTransactions[0].note?.split(" | ")[0] || dashboard.recentTransactions[0].categoryName}</div>
              <div className="text-xs text-muted-foreground">{dashboard.recentTransactions[0].categoryName}</div>
            </div>
            <div className="font-display font-bold text-coral">-{formatRupees(dashboard.recentTransactions[0].amount)}</div>
          </div>
        </div>
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

  const filters = ["All", ...(profile?.categories?.map((c: any) => c.name) || [])];

  const filteredExpenses = (expenses || []).filter((e: Expense) => {
    const matchesFilter = filter === "All" || e.categoryName === filter;
    const matchesSearch =
      (e.note?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      e.categoryName.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const groupedExpenses = filteredExpenses.reduce((groups: Record<string, Expense[]>, expense) => {
    const dateKey = expense.date.split('T')[0];
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(expense);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedExpenses).sort((a, b) => b.localeCompare(a));

  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "EEEE, d MMM");
  };

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const avgExpense = filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0;

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

      <div className="bg-card rounded-full shadow-soft flex items-center px-5 py-3.5 gap-3 border border-border/30">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground/50"
          placeholder="Search transactions"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto -mx-5 px-5 pb-1 no-scrollbar">
        {filters.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-all duration-200 ${filter === f ? "bg-surface-dark text-primary-foreground shadow-lg" : "bg-card text-muted-foreground shadow-soft hover:text-foreground border border-transparent hover:border-border/30"}`}>
            {f}
          </button>
        ))}
      </div>

      {filteredExpenses.length > 0 && (
        <div className="bg-card rounded-[1.5rem] shadow-soft p-4 flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{filteredExpenses.length}</span> transactions
          </div>
          <div className="text-xs text-muted-foreground">
            Total: <span className="font-medium text-foreground">{formatRupees(totalExpenses)}</span> • Avg: <span className="font-medium text-foreground">{formatRupees(avgExpense)}</span>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {expLoading ? (
          <div className="p-10 text-center text-muted-foreground animate-pulse bg-card rounded-[1.75rem]">Loading transactions...</div>
        ) : sortedDates.length > 0 ? (
          sortedDates.map((date) => (
            <div key={date} className="space-y-2">
              <div className="px-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
                {getDateLabel(date)}
              </div>
              <div className="bg-card rounded-[1.75rem] shadow-soft divide-y divide-border/30 overflow-hidden border border-border/30">
                {groupedExpenses[date].map((t) => (
                  <ExpenseItem key={t.id} t={t} />
                ))}
              </div>
            </div>
          ))
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
  
  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <div className="space-y-5">
      <div className="pt-2">
        <h1 className="font-display text-4xl font-bold tracking-tight">Calendar</h1>
        <p className="text-sm text-muted-foreground mt-1">Your unified life calendar</p>
      </div>

      <div className="flex items-center justify-between px-2">
        <button onClick={handlePrevMonth} className="h-10 w-10 rounded-full bg-card shadow-soft flex items-center justify-center hover:bg-secondary transition">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display text-2xl font-bold">{format(currentMonth, "MMMM yyyy")}</h1>
        <button onClick={handleNextMonth} className="h-10 w-10 rounded-full bg-card shadow-soft flex items-center justify-center hover:bg-secondary transition">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <CalendarGrid monthStr={monthStr} currentMonth={currentMonth} />
    </div>
  );
}

function ExpenseItem({ t }: { t: Expense }) {
  const deleteExpense = useDeleteExpense();
  
  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteExpense.mutateAsync(t.id);
        toast.success("Expense deleted");
      } catch (err: any) {
        toast.error("Failed to delete: " + err.message);
      }
    }
  };

  const Icon = categoryIcons[t.categoryName] || categoryIcons.default;

  return (
    <div className="group flex items-center gap-3 p-4 hover:bg-secondary/30 transition-all duration-200">
      <div className="h-11 w-11 rounded-full bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center border border-border/30">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{t.note?.split(" | ")[0] || t.categoryName}</div>
        <div className="text-[10px] text-muted-foreground flex items-center gap-2 mt-1">
          {t.note?.includes(" | ") ? (
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-mint" />
              {t.note.split(" | ")[1]}
            </span>
          ) : (
            <>
              <span className="px-2 py-0.5 rounded-full bg-secondary/80 text-[10px]">{t.categoryName}</span>
              <span className="opacity-60">{t.paymentMethod}</span>
            </>
          )}
        </div>
      </div>
      <div className="text-right flex items-center gap-4">
        <div className="font-display font-bold text-coral">-{formatRupees(t.amount)}</div>
        <button 
          onClick={handleDelete}
          disabled={deleteExpense.isPending}
          className="p-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function CalendarGrid({ monthStr, currentMonth }: { monthStr: string; currentMonth: Date }) {
  const { data: calendar, isLoading } = useCalendar(undefined, monthStr);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const deleteExpense = useDeleteExpense();
  const deleteExpensesByMonth = useDeleteExpensesByMonth();
  
  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const dateArray = eachDayOfInterval({ start, end });
    
    const firstDay = getDay(start);
    const padding = Array(firstDay).fill(null);
    return [...padding, ...dateArray];
  }, [currentMonth]);

  if (isLoading) return <div className="h-[400px] bg-secondary/50 rounded-[2rem] animate-pulse" />;

  const entries = calendar || [];
  const selectedEntry = entries.find((e: CalendarEntry) => e.date.startsWith(selectedDate));
  const totalSpent = selectedEntry?.expenses?.reduce((acc, e) => acc + e.amount, 0) || 0;

  const handleDelete = async (id: string | number) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteExpense.mutateAsync(id);
        toast.success("Expense deleted");
      } catch (err: any) {
        toast.error("Failed to delete: " + err.message);
      }
    }
  };

  const handleDeleteMonth = async () => {
    if (confirm(`Are you sure you want to delete ALL expenses for ${format(currentMonth, "MMMM yyyy")}? This cannot be undone.`)) {
      try {
        await deleteExpensesByMonth.mutateAsync(monthStr);
        toast.success(`All expenses for ${format(currentMonth, "MMMM yyyy")} have been deleted`);
      } catch (err: any) {
        toast.error("Failed to delete month data: " + err.message);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-card rounded-[2.5rem] p-6 shadow-soft border border-border/30">
        <div className="grid grid-cols-7 gap-y-4 text-center">
          {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
            <div key={d} className="text-[10px] font-bold text-muted-foreground/60 tracking-widest">{d}</div>
          ))}
          {days.map((date, i) => {
            if (!date) return <div key={`empty-${i}`} />;
            
            const dateKey = format(date, "yyyy-MM-dd");
            const entry = entries.find((e: CalendarEntry) => e.date.startsWith(dateKey));
            const hasSpending = entry && entry.expenses && entry.expenses.length > 0;
            const isSelected = selectedDate === dateKey;
            const isTodayDate = dateKey === format(new Date(), "yyyy-MM-dd");
            
            return (
              <button
                key={dateKey}
                onClick={() => setSelectedDate(dateKey)}
                className={`
                  relative h-10 w-10 mx-auto rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200
                  ${isSelected 
                    ? "bg-surface-dark text-primary-foreground shadow-lg scale-110 z-10" 
                    : isTodayDate
                      ? "ring-2 ring-mint/50 text-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }
                  ${hasSpending && !isSelected ? "bg-mint/20 text-primary" : ""}
                `}
              >
                {format(date, "d")}
                {hasSpending && !isSelected && (
                   <div className="absolute bottom-1.5 h-1 w-1 rounded-full bg-mint shadow-sm" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-2 space-y-5 pb-10">
        <div className="flex justify-between items-end">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Selected Day</div>
            <div className="font-display text-3xl font-bold">{format(parseISO(selectedDate), "MMM d")}</div>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Total Spent</div>
              <div className="font-display text-2xl font-bold text-coral">-{formatRupees(totalSpent)}</div>
            </div>
            <button
              onClick={handleDeleteMonth}
              disabled={deleteExpensesByMonth.isPending}
              className="text-xs px-2 py-1 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition disabled:opacity-50 flex items-center gap-1 font-medium"
            >
              <Trash2 className="h-3 w-3" />
              Delete Month
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {selectedEntry?.expenses && selectedEntry.expenses.length > 0 ? (
            selectedEntry.expenses.map((e) => {
              const Icon = categoryIcons[e.categoryName] || categoryIcons.default;
              return (
                <div key={e.id} className="group bg-card rounded-[1.5rem] p-4 shadow-soft flex items-center gap-4 border border-white/50 hover:border-mint/30 hover:bg-secondary/5 transition-all duration-200">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center border border-border/30">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate">{e.note?.split(" | ")[0]}</div>
                    <div className="text-[10px] text-muted-foreground flex flex-col mt-0.5">
                      {e.note?.includes(" | ") ? (
                         <span className="truncate">{e.note.split(" | ")[1]}</span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium">{e.categoryName}</span>
                          <span className="opacity-40">•</span>
                          <span>{e.paymentMethod}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div className="font-display font-bold text-coral">-{formatRupees(e.amount)}</div>
                    <button 
                      onClick={() => handleDelete(e.id)}
                      disabled={deleteExpense.isPending}
                      className="p-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-secondary/30 rounded-[1.5rem] p-10 text-center border-2 border-dashed border-muted-foreground/10">
              <p className="text-sm text-muted-foreground">No expenses logged for this day</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}