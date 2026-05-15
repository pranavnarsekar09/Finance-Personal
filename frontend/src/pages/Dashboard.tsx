import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "sonner";
import { AlertCircle, PiggyBank, RefreshCw, Target as TargetIcon, Wallet, Sparkles, Brain, ShieldAlert, TrendingDown, TrendingUp, Minus, Target, Trash2 } from "lucide-react";
import { useAddGoal, useDashboard, useDeleteGoal, useExpenseTrend, useFinance, useGoals, useProfile, useSaveFinance, useSaveProfile, useUpdateGoal, useAiDashboard, useCoveredExpenses } from "@/hooks/useApi";
import { useSwipeNative } from "@/hooks/useSwipe";
import { useHaptic } from "@/hooks/useHaptic";
import { SubtabPillBarWithIndicator } from "@/components/layout/SubtabPillBar";
import { BalanceCard } from "@/components/cards/BalanceCard";
import { InsightCard } from "@/components/cards/InsightCard";
import { StreakCard, CalorieBar } from "@/components/cards/StreakCard";
import { JarsRow } from "@/components/cards/JarsRow";
import { SpendChart } from "@/components/charts/SpendChart";
import { SpendingTrendChart } from "@/components/charts/SpendingTrendChart";
import { CategoryPressure } from "@/components/cards/CategoryPressure";
import { CoveringsCard } from "@/components/cards/CoveringsCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatRupees } from "@/lib/utils";
import type { CreateGoalRequest, FinanceSettingsRequest, GoalType, ProfileUpsertRequest, AiRecommendation, AiScore, AiAnomaly } from "@/lib/types";
import { InsightsPage } from "@/features/insights";

const DASHBOARD_TABS = ["today", "insights", "plan"] as const;
type DashboardTab = (typeof DASHBOARD_TABS)[number];

const trendIconMap = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
} as const;

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get("tab");
  const initialTab: DashboardTab = DASHBOARD_TABS.includes(urlTab as DashboardTab) ? (urlTab as DashboardTab) : "today";
  
  const [tab, setTab] = useState<DashboardTab>(initialTab);
  const [direction, setDirection] = useState(0);
  const { medium } = useHaptic();

  useEffect(() => {
    if (urlTab && DASHBOARD_TABS.includes(urlTab as DashboardTab)) {
      setTab(urlTab as DashboardTab);
    }
  }, [urlTab]);

  const pageVariants = {
    initial: (dir: number) => ({ x: dir > 0 ? 20 : -20, opacity: 0 }),
    animate: { x: 0, opacity: 1, transition: { duration: 0.24, ease: "easeOut" } },
    exit: (dir: number) => ({ x: dir > 0 ? -20 : 20, opacity: 0, transition: { duration: 0.18, ease: "easeIn" } }),
  };

  const changeTab = (nextTab: DashboardTab) => {
    const currentIndex = DASHBOARD_TABS.indexOf(tab);
    const nextIndex = DASHBOARD_TABS.indexOf(nextTab);
    setDirection(nextIndex > currentIndex ? 1 : -1);
    setTab(nextTab);
    setSearchParams({ tab: nextTab });
    medium();
  };

  useSwipeNative({
    onSwipeLeft: () => {
      const currentIndex = DASHBOARD_TABS.indexOf(tab);
      if (currentIndex < DASHBOARD_TABS.length - 1) {
        changeTab(DASHBOARD_TABS[currentIndex + 1]);
      }
    },
    onSwipeRight: () => {
      const currentIndex = DASHBOARD_TABS.indexOf(tab);
      if (currentIndex > 0) {
        changeTab(DASHBOARD_TABS[currentIndex - 1]);
      }
    },
    threshold: 50,
    ignoreSelector: "[data-swipe-ignore]",
    scopeSelector: "[data-dashboard-swipe='true']",
  });

  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <div data-dashboard-swipe="true" className="space-y-5 touch-pan-y">
      <div className="flex justify-between items-center">
        <SubtabPillBarWithIndicator
          tabs={DASHBOARD_TABS}
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
          {tab === "today" && <TodayTab />}
          {tab === "insights" && <InsightsTab />}
          {tab === "plan" && <PlanTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function TodayTab() {
  const month = format(new Date(), "yyyy-MM");
  const today = format(new Date(), "yyyy-MM-dd");
  const profileQuery = useProfile();
  const dashboardQuery = useDashboard(undefined, month, today);
  const financeQuery = useFinance(undefined, today, true);

  const profile = profileQuery.data;
  const dashboard = dashboardQuery.data;
  const finance = financeQuery.data || dashboard?.spending || null;
  const userInitials = profile?.name ? profile.name.split(" ").map((n: string) => n[0]).join("").toUpperCase() : "U";
  const shellMessage = getShellMessage(profileQuery.isLoading, dashboardQuery.isLoading);

  return (
    <>
      <div className="pt-2">
        <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-bold mb-1">
          {format(new Date(), "EEEE, d MMMM")}
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight">Welcome Back!</h1>
        <p className="text-sm text-muted-foreground mt-1">Here&apos;s your account overview</p>
      </div>

      {shellMessage ? <PageStatusBanner message={shellMessage} /> : null}

      <BalanceCard
        total={dashboard?.monthlyBudget || 0}
        spent={dashboard?.totalSpent || 0}
        todaySpent={dashboard?.spentToday || 0}
        available={dashboard?.remainingBudget || 0}
        savings={finance?.savings || 0}
        savingsChange={finance?.todayDifference || 0}
        dailyLimit={finance?.dailyLimit || 0}
        userName={profile?.name || "User"}
        monthlySavings={dashboard?.monthlySavings || 0}
        latestExpense={dashboard?.recentTransactions?.[0] || null}
      />
      <InsightCard />
      <CoveringsCard />
      <div className="grid grid-cols-2 gap-3">
        <StreakCard 
          streak={dashboard?.streak || 0} 
          isTodayActive={(dashboard?.spentToday || 0) > 0 || (dashboard?.caloriesToday || 0) > 0} 
        />
        <CalorieBar eaten={dashboard?.caloriesToday || 0} goal={dashboard?.calorieGoal || 2000} />
      </div>
      <JarsRow />
      <SpendChart data={dashboard?.dailySpending || []} />
      <CategoryPressure data={dashboard?.categorySpending || []} />

      <div className="bg-gradient-mint rounded-[1.75rem] p-5 shadow-soft">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">Budget Tip</span>
        </div>
        <p className="text-sm text-primary/80 mt-1">Open the Plan tab to update your monthly budget, calorie target, goals, and spending trends.</p>
      </div>
    </>
  );
}

function InsightsTab() {
  return <InsightsPage />;
}

function PlanTab() {
  const month = format(new Date(), "yyyy-MM");
  const today = format(new Date(), "yyyy-MM-dd");

  const profileQuery = useProfile();
  const dashboardQuery = useDashboard(undefined, month, today);
  const goalsQuery = useGoals(undefined, true);
  const financeQuery = useFinance(undefined, today, true);

  const profile = profileQuery.data;
  const dashboard = dashboardQuery.data;
  const finance = financeQuery.data;
  const goals = goalsQuery.data || [];
  const totalSpent = dashboard?.totalSpent || 0;

  return (
    <>
      <div className="pt-2">
        <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-bold mb-1">
          {format(new Date(), "EEEE, d MMMM")}
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight">Plan</h1>
        <p className="text-sm text-muted-foreground mt-1">Set your budget, targets, and financial goals</p>
      </div>

      <SpendingTabContent finance={finance || dashboard?.spending || null} monthlySavings={dashboard?.monthlySavings || 0} />
      <BudgetTabContent
        profile={profile || null}
        profileLoading={profileQuery.isLoading}
        profileError={profileQuery.error instanceof Error ? profileQuery.error.message : null}
        goals={goals}
        goalsLoading={goalsQuery.isLoading}
        goalsError={goalsQuery.error instanceof Error ? goalsQuery.error.message : null}
        totalSpent={totalSpent}
      />
    </>
  );
}

function SpendingTabContent({
  finance,
  monthlySavings,
}: {
  finance: any;
  monthlySavings: number;
}) {
  const saveFinance = useSaveFinance();
  const [dailyLimitInput, setDailyLimitInput] = useState(finance?.dailyLimit?.toString() || "100");
  const [bufferInput, setBufferInput] = useState(finance?.buffer?.toString?.() || "0");
  const [savingsInput, setSavingsInput] = useState(finance?.savings?.toString?.() || "0");
  const [trackingStartDate, setTrackingStartDate] = useState(finance?.trackingStartDate || format(new Date(), "yyyy-MM-dd"));

  useEffect(() => {
    setDailyLimitInput(finance?.dailyLimit?.toString() || "100");
    setBufferInput(finance?.buffer?.toString?.() || "0");
    setSavingsInput(finance?.savings?.toString?.() || "0");
    setTrackingStartDate(finance?.trackingStartDate || format(new Date(), "yyyy-MM-dd"));
  }, [finance?.dailyLimit, finance?.buffer, finance?.savings, finance?.trackingStartDate]);

  const handleSave = async () => {
    const payload: FinanceSettingsRequest = {
      dailyLimit: Number(dailyLimitInput),
      startingBuffer: Number(bufferInput),
      startingSavings: Number(savingsInput),
      trackingStartDate,
    };

    if (payload.dailyLimit <= 0) {
      toast.error("Daily limit must be greater than 0.");
      return;
    }

    if ((payload.startingBuffer ?? 0) < 0) {
      toast.error("Buffer cannot start below 0.");
      return;
    }

    try {
      await saveFinance.mutateAsync(payload);
      toast.success("Spending settings updated.");
    } catch (error: any) {
      toast.error(error.message || "Failed to save spending settings.");
    }
  };

  const recentRecords = finance?.recentDailyRecords || [];
  const [showAllHistory, setShowAllHistory] = useState(false);

  const displayedRecords = showAllHistory ? recentRecords : recentRecords.slice(0, 1);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card rounded-[1.75rem] shadow-soft p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-3">
            <Wallet className="h-4 w-4 text-primary" />
            Daily Limit
          </div>
          <div className="font-display text-2xl font-bold">{formatRupees(finance?.dailyLimit || 0)}</div>
          <p className="text-xs text-muted-foreground mt-2">Spent today: {formatRupees(finance?.todaySpent || 0)}</p>
        </div>

        <div className="bg-card rounded-[1.75rem] shadow-soft p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-3">
            <Wallet className="h-4 w-4 text-primary" />
            Buffer
          </div>
          <div className="font-display text-2xl font-bold">{formatRupees(finance?.buffer || 0)}</div>
          <p className="text-xs text-muted-foreground mt-2">Drains before savings.</p>
        </div>

        <div className="bg-card rounded-[1.75rem] shadow-soft p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-3">
            <PiggyBank className="h-4 w-4 text-primary" />
            Savings
          </div>
          <div className="font-display text-2xl font-bold">{formatRupees(finance?.savings || 0)}</div>
          <p className="text-xs text-muted-foreground mt-2">Cumulative reserves.</p>
        </div>

        <div className="bg-card rounded-[1.75rem] shadow-soft p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-3">
            <PiggyBank className="h-4 w-4 text-primary" />
            Month Save
          </div>
          <div className="font-display text-2xl font-bold">{formatRupees(monthlySavings)}</div>
          <p className="text-xs text-muted-foreground mt-2">Saved this month.</p>
        </div>
      </div>

      <div className="bg-card rounded-[1.75rem] shadow-soft p-5 space-y-5">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary" />
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Spending System Settings</div>
        </div>
        <div className="rounded-xl bg-secondary/50 p-3 text-xs text-muted-foreground">
          These values reset your starting buffer and savings. Use when starting fresh or adjusting your baseline.
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Daily Limit</div>
            <Input
              type="number"
              min="1"
              value={dailyLimitInput}
              onChange={(e) => setDailyLimitInput(e.target.value)}
              placeholder="100"
              className="rounded-2xl h-12"
            />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Tracking Start</div>
            <Input
              type="date"
              value={trackingStartDate}
              onChange={(e) => setTrackingStartDate(e.target.value)}
              className="rounded-2xl h-12"
            />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Buffer</div>
            <Input
              type="number"
              min="0"
              value={bufferInput}
              onChange={(e) => setBufferInput(e.target.value)}
              placeholder="0"
              className="rounded-2xl h-12"
            />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Savings</div>
            <Input
              type="number"
              value={savingsInput}
              onChange={(e) => setSavingsInput(e.target.value)}
              placeholder="0"
              className="rounded-2xl h-12"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saveFinance.isPending}
          className="w-full rounded-full bg-surface-dark text-primary-foreground py-3.5 font-medium disabled:opacity-50"
        >
          {saveFinance.isPending ? "Saving..." : "Save Spending Settings"}
        </button>

        <div className="rounded-2xl bg-secondary/50 p-4 text-sm text-muted-foreground">
          Buffer never drops below zero. Any overspend beyond the buffer is deducted from savings, and savings are allowed to go negative if needed.
        </div>
      </div>

      <div className="bg-card rounded-[1.75rem] shadow-soft p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Buffer History</div>
            <div className="text-sm text-muted-foreground mt-1">Daily spending logic after expense recalculation</div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            Last: {finance?.lastProcessedDate ? format(new Date(finance.lastProcessedDate), "d MMM yyyy") : "Today"}
          </div>
        </div>

        <div className="space-y-3">
          {recentRecords.length === 0 ? (
            <div className="rounded-2xl bg-secondary/50 p-4 text-sm text-muted-foreground">No history yet. Add expenses to begin tracking.</div>
          ) : (
            displayedRecords.map((record: any) => (
              <div key={record.date} className="rounded-2xl bg-secondary/60 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold">{format(new Date(record.date), "d MMM yyyy")}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Spent {formatRupees(record.spentAmount)} against {formatRupees(record.dailyLimit)}
                    </div>
                  </div>
                  <div className={cn("text-sm font-medium", record.extraAmount > 0 ? "text-coral" : "text-mint")}>
                    {record.extraAmount > 0 ? `-${formatRupees(record.extraAmount)}` : `+${formatRupees(record.leftoverAmount)}`}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                  <div className="rounded-xl bg-background/70 p-3">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Buffer After</div>
                    <div className="font-semibold">{formatRupees(record.bufferAfter)}</div>
                  </div>
                  <div className="rounded-xl bg-background/70 p-3">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Savings After</div>
                    <div className="font-semibold">{formatRupees(record.savingsAfter)}</div>
                  </div>
                </div>
              </div>
            ))
          )}
          {recentRecords.length > 1 && (
            <button
              onClick={() => setShowAllHistory(!showAllHistory)}
              className="w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition"
            >
              {showAllHistory ? "Show Less" : `Show ${recentRecords.length - 1} More Days`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function BudgetTabContent({
  profile,
  profileLoading,
  profileError,
  goals,
  goalsLoading,
  goalsError,
  totalSpent,
}: {
  profile: any;
  profileLoading: boolean;
  profileError: string | null;
  goals: any[];
  goalsLoading: boolean;
  goalsError: string | null;
  totalSpent: number;
}) {
  const saveProfile = useSaveProfile();
  const addGoal = useAddGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();
  const { medium } = useHaptic();
  const [budgetInput, setBudgetInput] = useState(profile?.monthlyBudget?.toString() || "");
  const [calorieInput, setCalorieInput] = useState(profile?.calorieGoal?.toString() || "");
  const [balanceInput, setBalanceInput] = useState("");
  const [goalType, setGoalType] = useState<GoalType>("SAVINGS");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalCurrent, setGoalCurrent] = useState("0");
  const [goalDeadline, setGoalDeadline] = useState(format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"));
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

  useEffect(() => {
    setBudgetInput(profile?.monthlyBudget?.toString() || "");
    setCalorieInput(profile?.calorieGoal?.toString() || "");
    const initialBalance = (profile?.monthlyBudget || 0) - totalSpent;
    setBalanceInput(initialBalance.toString());
  }, [profile?.monthlyBudget, profile?.calorieGoal, totalSpent]);

  const handleBudgetInputChange = (val: string) => {
    setBudgetInput(val);
    const num = Number(val);
    if (!isNaN(num)) {
      setBalanceInput((num - totalSpent).toString());
    }
  };

  const handleBalanceInputChange = (val: string) => {
    setBalanceInput(val);
    const num = Number(val);
    if (!isNaN(num)) {
      setBudgetInput((num + totalSpent).toString());
    }
  };

  const handleBudgetSave = async () => {
    if (!profile) {
      toast.error("Create your profile first before updating budget settings.");
      return;
    }

    const monthlyBudget = Number(budgetInput);
    const calorieGoal = Number(calorieInput);

    if (monthlyBudget <= 0 || calorieGoal <= 0) {
      toast.error("Monthly budget and calorie goal must both be greater than 0.");
      return;
    }

    const payload: ProfileUpsertRequest = {
      name: profile.name,
      email: profile.email,
      monthlyBudget,
      calorieGoal,
      availableBalance: Number(balanceInput),
      categories: profile.categories || [],
    };

    try {
      await saveProfile.mutateAsync(payload);
      toast.success("Budget settings updated.");
    } catch (error: any) {
      toast.error(error.message || "Failed to save budget settings.");
    }
  };

  const handleAddGoal = async () => {
    const targetAmount = Number(goalTarget);
    const currentAmount = Number(goalCurrent);

    if (targetAmount <= 0) {
      toast.error("Goal target must be greater than 0.");
      return;
    }

    if (!goalDeadline) {
      toast.error("Please choose a future deadline.");
      return;
    }

    try {
      if (editingGoalId) {
        await updateGoal.mutateAsync({
          id: editingGoalId,
          payload: {
            type: goalType,
            targetAmount,
            currentAmount: currentAmount >= 0 ? currentAmount : 0,
            deadline: goalDeadline,
          },
        });
        toast.success("Goal updated.");
      } else {
        const payload: CreateGoalRequest = {
          userId: profile?.userId || "demo-user",
          type: goalType,
          targetAmount,
          currentAmount: currentAmount >= 0 ? currentAmount : 0,
          deadline: goalDeadline,
        };
        await addGoal.mutateAsync(payload);
        toast.success("Goal added.");
      }
      
      setGoalTarget("");
      setGoalCurrent("0");
      setGoalDeadline(format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"));
      setEditingGoalId(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to process goal.");
    }
  };

  const startEditingGoal = (goal: any) => {
    setEditingGoalId(goal.id);
    setGoalType(goal.type);
    setGoalTarget(goal.targetAmount.toString());
    setGoalCurrent(goal.currentAmount.toString());
    setGoalDeadline(format(new Date(goal.deadline), "yyyy-MM-dd"));
    medium();
  };

  const handleDeleteGoal = async (goalId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteGoal.mutateAsync(goalId);
      toast.success("Goal deleted.");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete goal.");
    }
  };

  return (
    <div className="space-y-5">
      {profileError ? <QueryErrorCard title="Profile settings unavailable" message={profileError} /> : null}
      {goalsError ? <QueryErrorCard title="Goals are delayed" message={goalsError} /> : null}
      {profileLoading && !profile ? <QueryLoadingCard label="Loading budget settings..." /> : null}

      </div>
  );
}

function SectionTitle({ icon: Icon, label }: { icon: typeof Sparkles; label: string }) {
  return (
    <div className="flex items-center gap-2 px-1">
      <div className="h-8 w-8 rounded-full bg-card shadow-soft flex items-center justify-center">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground font-bold">{label}</div>
    </div>
  );
}

function ExpandableRecommendation({
  item,
  open,
  onToggle,
}: {
  item: AiRecommendation;
  open: boolean;
  onToggle: () => void;
}) {
  const Icon = trendIconMap[item.trend] || Minus;
  return (
    <div className="bg-card rounded-[1.75rem] shadow-soft overflow-hidden border border-white/60">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", item.priority === "high" ? "bg-coral/20 text-coral" : "bg-mint/20 text-mint")}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="text-left">
            <div className="font-semibold">{item.title}</div>
            <div className="text-xs text-muted-foreground">{item.summary}</div>
          </div>
        </div>
        <div className={cn("h-6 w-6 rounded-full flex items-center justify-center transition-transform", open ? "rotate-180" : "")}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-muted-foreground">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-0 text-sm text-muted-foreground border-t border-border/30 mt-2">
          <div className="pt-3">{item.description}</div>
        </div>
      )}
    </div>
  );
}

function ExpandableScore({
  score,
  open,
  onToggle,
}: {
  score: AiScore;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-card rounded-[1.75rem] shadow-soft overflow-hidden border border-white/60">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center font-bold",
            score.value >= 80 ? "bg-mint/20 text-mint" : score.value >= 60 ? "bg-sun/20 text-amber-600" : "bg-coral/20 text-coral"
          )}>
            {score.value}
          </div>
          <div className="text-left">
            <div className="font-semibold">{score.name}</div>
            <div className="text-xs text-muted-foreground">{score.summary}</div>
          </div>
        </div>
        <div className={cn("h-6 w-6 rounded-full flex items-center justify-center transition-transform", open ? "rotate-180" : "")}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-muted-foreground">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-0 text-sm text-muted-foreground border-t border-border/30 mt-2">
          <div className="pt-3">{score.description}</div>
        </div>
      )}
    </div>
  );
}

function AnomalyCard({ anomaly }: { anomaly: AiAnomaly }) {
  return (
    <div className="bg-card rounded-[1.75rem] shadow-soft p-4 border border-coral/30 flex items-start gap-3">
      <div className="h-8 w-8 rounded-full bg-coral/20 flex items-center justify-center shrink-0">
        <AlertCircle className="h-4 w-4 text-coral" />
      </div>
      <div>
        <div className="font-semibold">{anomaly.title}</div>
        <div className="text-sm text-muted-foreground mt-1">{anomaly.description}</div>
      </div>
    </div>
  );
}

function predictionToneClasses(tone: string) {
  return tone === "positive" 
    ? "h-8 w-8 rounded-full bg-mint/20 text-mint flex items-center justify-center"
    : tone === "warning"
    ? "h-8 w-8 rounded-full bg-sun/20 text-amber-600 flex items-center justify-center"
    : "h-8 w-8 rounded-full bg-coral/20 text-coral flex items-center justify-center";
}

function shortScoreName(name: string) {
  if (name.startsWith("Financial")) return "Money";
  if (name.startsWith("Nutrition")) return "Food";
  if (name.startsWith("Consistency")) return "Streak";
  return "Score";
}

function PageStatusBanner({ message }: { message: string }) {
  return (
    <div className="rounded-[1.35rem] bg-secondary/70 px-4 py-3 text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function QueryLoadingCard({ label }: { label: string }) {
  return (
    <div className="bg-card rounded-[1.5rem] shadow-soft p-4 flex items-center gap-3">
      <RefreshCw className="h-4 w-4 text-primary animate-spin" />
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function QueryErrorCard({ title, message }: { title: string; message: string }) {
  return (
    <div className="bg-card rounded-[1.5rem] shadow-soft p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="text-sm text-muted-foreground mt-1">{message}</div>
        </div>
      </div>
    </div>
  );
}

function getShellMessage(profileLoading: boolean, dashboardLoading: boolean) {
  if (profileLoading && dashboardLoading) {
    return "Waking up your account and monthly summary. The page shell is ready while the backend catches up.";
  }
  if (dashboardLoading) {
    return "Refreshing your monthly summary in the background.";
  }
  if (profileLoading) {
    return "Refreshing your profile in the background.";
  }
  return null;
}