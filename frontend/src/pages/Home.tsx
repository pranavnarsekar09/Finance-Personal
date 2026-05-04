import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "sonner";
import { AlertCircle, PiggyBank, RefreshCw, Target, Wallet } from "lucide-react";
import { useAddGoal, useDashboard, useExpenseTrend, useFinance, useGoals, useProfile, useSaveFinance, useSaveProfile } from "@/hooks/useApi";
import { useSwipeNative } from "@/hooks/useSwipe";
import { useHaptic } from "@/hooks/useHaptic";
import { BalanceCard } from "@/components/cards/BalanceCard";
import { InsightCard } from "@/components/cards/InsightCard";
import { StreakCard, CalorieBar } from "@/components/cards/StreakCard";
import { JarsRow } from "@/components/cards/JarsRow";
import { SpendChart } from "@/components/charts/SpendChart";
import { SpendingTrendChart } from "@/components/charts/SpendingTrendChart";
import { CategoryPressure } from "@/components/cards/CategoryPressure";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatRupees } from "@/lib/utils";
import type { CreateGoalRequest, FinanceSettingsRequest, GoalType, ProfileUpsertRequest } from "@/lib/types";

const HOME_TABS = ["overview", "budget", "spending"] as const;
type HomeTab = (typeof HOME_TABS)[number];

export default function Home() {
  const [tab, setTab] = useState<HomeTab>("overview");
  const [direction, setDirection] = useState(0);
  const { medium } = useHaptic();
  const month = format(new Date(), "yyyy-MM");
  const today = format(new Date(), "yyyy-MM-dd");

  const profileQuery = useProfile();
  const dashboardQuery = useDashboard(undefined, month, today);
  const financeQuery = useFinance(undefined, tab !== "budget");
  const goalsQuery = useGoals(undefined, tab === "budget");
  const expenseTrend = useExpenseTrend(undefined, tab === "budget");

  const pageVariants = {
    initial: (dir: number) => ({ x: dir > 0 ? 20 : -20, opacity: 0 }),
    animate: { x: 0, opacity: 1, transition: { duration: 0.24, ease: "easeOut" } },
    exit: (dir: number) => ({ x: dir > 0 ? -20 : 20, opacity: 0, transition: { duration: 0.18, ease: "easeIn" } }),
  };

  const changeTab = (nextTab: HomeTab) => {
    const currentIndex = HOME_TABS.indexOf(tab);
    const nextIndex = HOME_TABS.indexOf(nextTab);
    setDirection(nextIndex > currentIndex ? 1 : -1);
    setTab(nextTab);
    medium();
  };

  useSwipeNative({
    onSwipeLeft: () => {
      const currentIndex = HOME_TABS.indexOf(tab);
      if (currentIndex < HOME_TABS.length - 1) {
        changeTab(HOME_TABS[currentIndex + 1]);
      }
    },
    onSwipeRight: () => {
      const currentIndex = HOME_TABS.indexOf(tab);
      if (currentIndex > 0) {
        changeTab(HOME_TABS[currentIndex - 1]);
      }
    },
    threshold: 50,
    ignoreSelector: "[data-swipe-ignore]",
    scopeSelector: "[data-home-swipe='true']",
  });

  const profile = profileQuery.data;
  const dashboard = dashboardQuery.data;
  const finance = financeQuery.data || dashboard?.spending || null;
  const goals = goalsQuery.data || [];
  const userInitials = profile?.name ? profile.name.split(" ").map((n: string) => n[0]).join("").toUpperCase() : "U";
  const shellMessage = getShellMessage(profileQuery.isLoading, dashboardQuery.isLoading);

  return (
    <div data-home-swipe="true" className="space-y-5 touch-pan-y">
      <div className="flex justify-between items-center">
        <div className="bg-card/70 backdrop-blur rounded-full p-1 flex shadow-soft">
          {HOME_TABS.map((t) => (
            <button
              key={t}
              onClick={() => changeTab(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition ${tab === t ? "bg-card shadow-soft" : "text-muted-foreground"}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="h-11 w-11 rounded-full bg-gradient-mint flex items-center justify-center font-display font-bold text-primary shadow-soft">
          {userInitials}
        </div>
      </div>

      {shellMessage ? <PageStatusBanner message={shellMessage} /> : null}

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
          {tab === "overview" ? (
            <OverviewTab
              profileName={profile?.name || "User"}
              dashboard={dashboard}
              finance={finance}
              dashboardLoading={dashboardQuery.isLoading}
              dashboardError={dashboardQuery.error instanceof Error ? dashboardQuery.error.message : null}
            />
          ) : tab === "budget" ? (
            <BudgetTab
              profile={profile || null}
              profileLoading={profileQuery.isLoading}
              profileError={profileQuery.error instanceof Error ? profileQuery.error.message : null}
              goals={goals}
              goalsLoading={goalsQuery.isLoading}
              goalsError={goalsQuery.error instanceof Error ? goalsQuery.error.message : null}
              trendExpenses={expenseTrend.data.flatMap((entry) => entry.expenses)}
              trendLoading={expenseTrend.isLoading}
              trendError={expenseTrend.isError ? "Spending trend is taking too long to load." : null}
            />
          ) : (
            <SpendingTab
              finance={finance || dashboard?.spending || null}
              financeLoading={financeQuery.isLoading}
              financeError={financeQuery.error instanceof Error ? financeQuery.error.message : null}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function SpendingTab({
  finance,
  financeLoading,
  financeError,
}: {
  finance: any;
  financeLoading: boolean;
  financeError: string | null;
}) {
  const saveFinance = useSaveFinance();
  const [dailyLimitInput, setDailyLimitInput] = useState(finance?.dailyLimit?.toString() || "100");
  const [startingBufferInput, setStartingBufferInput] = useState(finance?.startingBuffer?.toString?.() || finance?.buffer?.toString?.() || "0");
  const [startingSavingsInput, setStartingSavingsInput] = useState(finance?.startingSavings?.toString?.() || finance?.savings?.toString?.() || "0");
  const [trackingStartDate, setTrackingStartDate] = useState(finance?.trackingStartDate || format(new Date(), "yyyy-MM-dd"));

  useEffect(() => {
    setDailyLimitInput(finance?.dailyLimit?.toString() || "100");
    setStartingBufferInput(finance?.startingBuffer?.toString?.() || finance?.buffer?.toString?.() || "0");
    setStartingSavingsInput(finance?.startingSavings?.toString?.() || finance?.savings?.toString?.() || "0");
    setTrackingStartDate(finance?.trackingStartDate || format(new Date(), "yyyy-MM-dd"));
  }, [finance?.dailyLimit, finance?.startingBuffer, finance?.startingSavings, finance?.buffer, finance?.savings, finance?.trackingStartDate]);

  const handleSave = async () => {
    const payload: FinanceSettingsRequest = {
      dailyLimit: Number(dailyLimitInput),
      startingBuffer: Number(startingBufferInput),
      startingSavings: Number(startingSavingsInput),
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

  const todayDifference = finance?.todayDifference || 0;
  const recentRecords = finance?.recentDailyRecords || [];

  return (
    <>
      <div className="pt-2">
        <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-bold mb-1">
          {format(new Date(), "EEEE, d MMMM")}
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight">Spending System</h1>
        <p className="text-sm text-muted-foreground mt-1">Track your daily limit, let leftover money flow into buffer and savings, and absorb overspending in the right order.</p>
      </div>

      {financeError ? <QueryErrorCard title="Spending data unavailable" message={financeError} /> : null}
      {financeLoading && !finance ? <QueryLoadingCard label="Waking your spending data..." /> : null}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-card rounded-[1.75rem] shadow-soft p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-3">
            <Wallet className="h-4 w-4 text-primary" />
            Daily Limit
          </div>
          <div className="font-display text-3xl font-bold">{formatRupees(finance?.dailyLimit || 0)}</div>
          <p className="text-sm text-muted-foreground mt-2">Spent today: {formatRupees(finance?.todaySpent || 0)}</p>
        </div>

        <div className="bg-card rounded-[1.75rem] shadow-soft p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-3">
            <Wallet className="h-4 w-4 text-primary" />
            Buffer
          </div>
          <div className="font-display text-3xl font-bold">{formatRupees(finance?.buffer || 0)}</div>
          <p className="text-sm text-muted-foreground mt-2">Used first whenever you go above the limit.</p>
        </div>

        <div className="bg-card rounded-[1.75rem] shadow-soft p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-3">
            <PiggyBank className="h-4 w-4 text-primary" />
            Savings
          </div>
          <div className="font-display text-3xl font-bold">{formatRupees(finance?.savings || 0)}</div>
          <p className="text-sm text-muted-foreground mt-2">
            {todayDifference >= 0 ? `${formatRupees(todayDifference)} available to split today.` : `${formatRupees(Math.abs(todayDifference))} pulled from reserves today.`}
          </p>
        </div>
      </div>

      <div className="bg-card rounded-[1.75rem] shadow-soft p-5 space-y-5">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary" />
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Finance Settings</div>
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
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Starting Buffer</div>
            <Input
              type="number"
              min="0"
              value={startingBufferInput}
              onChange={(e) => setStartingBufferInput(e.target.value)}
              placeholder="0"
              className="rounded-2xl h-12"
            />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Starting Savings</div>
            <Input
              type="number"
              value={startingSavingsInput}
              onChange={(e) => setStartingSavingsInput(e.target.value)}
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
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Recent Daily Results</div>
            <div className="text-sm text-muted-foreground mt-1">Each row shows one day of spending logic after all current expense entries were recalculated.</div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            Last processed: {finance?.lastProcessedDate ? format(new Date(finance.lastProcessedDate), "d MMM yyyy") : "Today"}
          </div>
        </div>

        <div className="space-y-3">
          {recentRecords.length === 0 ? (
            <div className="rounded-2xl bg-secondary/50 p-4 text-sm text-muted-foreground">No finance history yet. Add expenses or save your spending settings to begin tracking.</div>
          ) : (
            recentRecords.map((record: any) => (
              <div key={record.date} className="rounded-2xl bg-secondary/60 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold">{format(new Date(record.date), "d MMM yyyy")}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Spent {formatRupees(record.spentAmount)} against {formatRupees(record.dailyLimit)}
                    </div>
                  </div>
                  <div className={cn("text-sm font-medium", record.extraAmount > 0 ? "text-destructive" : "text-emerald-600")}>
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
        </div>
      </div>
    </>
  );
}

function OverviewTab({
  profileName,
  dashboard,
  finance,
  dashboardLoading,
  dashboardError,
}: {
  profileName: string;
  dashboard: any;
  finance?: any | null;
  dashboardLoading: boolean;
  dashboardError: string | null;
}) {
  return (
    <>
      <div className="pt-2">
        <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-bold mb-1">
          {format(new Date(), "EEEE, d MMMM")}
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight">Welcome Back!</h1>
        <p className="text-sm text-muted-foreground mt-1">Here&apos;s your account overview</p>
      </div>

      {dashboardError ? <QueryErrorCard title="Overview is delayed" message={dashboardError} /> : null}
      {dashboardLoading && !dashboard ? <QueryLoadingCard label="Loading your budget snapshot..." /> : null}

      <BalanceCard
        total={dashboard?.monthlyBudget || 0}
        spent={dashboard?.totalSpent || 0}
        todaySpent={dashboard?.spentToday || 0}
        available={dashboard?.remainingBudget || 0}
        savings={finance?.savings || 0}
        savingsChange={finance?.todayDifference || 0}
        dailyLimit={finance?.dailyLimit || 0}
        userName={profileName}
        latestExpense={dashboard?.recentTransactions?.[0] || null}
      />
      <InsightCard />
      <div className="grid grid-cols-2 gap-3">
        <StreakCard streak={dashboard?.streak || 0} />
        <CalorieBar eaten={dashboard?.caloriesToday || 0} goal={dashboard?.calorieGoal || 2000} />
      </div>
      <JarsRow />
      <SpendChart data={dashboard?.dailySpending || []} />
      <CategoryPressure data={dashboard?.categorySpending || []} />

      <div className="bg-gradient-mint rounded-[1.75rem] p-5 shadow-soft">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">Budget Tip</span>
        </div>
        <p className="text-sm text-primary/80 mt-1">Open the Budget tab to update your monthly budget, calorie target, goals, and spending trends.</p>
      </div>
    </>
  );
}

function BudgetTab({
  profile,
  profileLoading,
  profileError,
  goals,
  goalsLoading,
  goalsError,
  trendExpenses,
  trendLoading,
  trendError,
}: {
  profile: any;
  profileLoading: boolean;
  profileError: string | null;
  goals: any[];
  goalsLoading: boolean;
  goalsError: string | null;
  trendExpenses: any[];
  trendLoading: boolean;
  trendError: string | null;
}) {
  const saveProfile = useSaveProfile();
  const addGoal = useAddGoal();
  const [budgetInput, setBudgetInput] = useState(profile?.monthlyBudget?.toString() || "");
  const [calorieInput, setCalorieInput] = useState(profile?.calorieGoal?.toString() || "");
  const [goalType, setGoalType] = useState<GoalType>("SAVINGS");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalCurrent, setGoalCurrent] = useState("0");
  const [goalDeadline, setGoalDeadline] = useState(format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"));

  useEffect(() => {
    setBudgetInput(profile?.monthlyBudget?.toString() || "");
    setCalorieInput(profile?.calorieGoal?.toString() || "");
  }, [profile?.monthlyBudget, profile?.calorieGoal]);

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

    const payload: CreateGoalRequest = {
      userId: profile?.userId || "demo-user",
      type: goalType,
      targetAmount,
      currentAmount: currentAmount >= 0 ? currentAmount : 0,
      deadline: goalDeadline,
    };

    try {
      await addGoal.mutateAsync(payload);
      setGoalTarget("");
      setGoalCurrent("0");
      setGoalDeadline(format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"));
      toast.success("Goal added.");
    } catch (error: any) {
      toast.error(error.message || "Failed to add goal.");
    }
  };

  return (
    <>
      <div className="pt-2">
        <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-bold mb-1">
          {format(new Date(), "EEEE, d MMMM")}
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight">Budget Planner</h1>
        <p className="text-sm text-muted-foreground mt-1">Set your budget, calorie target, goals, and review expense trends.</p>
      </div>

      {profileError ? <QueryErrorCard title="Profile settings unavailable" message={profileError} /> : null}
      {goalsError ? <QueryErrorCard title="Goals are delayed" message={goalsError} /> : null}
      {trendError ? <QueryErrorCard title="Trend chart is delayed" message={trendError} /> : null}
      {profileLoading && !profile ? <QueryLoadingCard label="Loading budget settings..." /> : null}

      <SpendingTrendChart expenses={trendExpenses} isLoading={trendLoading} />

      <div className="bg-card rounded-[1.75rem] shadow-soft p-5 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Monthly Budget</div>
            <Input
              type="number"
              min="1"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              placeholder="Enter monthly budget"
              className="rounded-2xl h-12"
            />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Calorie Goal</div>
            <Input
              type="number"
              min="1"
              value={calorieInput}
              onChange={(e) => setCalorieInput(e.target.value)}
              placeholder="Enter calorie goal"
              className="rounded-2xl h-12"
            />
          </div>
        </div>

        <button
          onClick={handleBudgetSave}
          disabled={saveProfile.isPending}
          className="w-full rounded-full bg-surface-dark text-primary-foreground py-3.5 font-medium disabled:opacity-50"
        >
          {saveProfile.isPending ? "Saving..." : "Save Budget Settings"}
        </button>
      </div>

      <div className="bg-card rounded-[1.75rem] shadow-soft p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Add Goal</div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Goal Type</div>
            <Select value={goalType} onValueChange={(value: GoalType) => setGoalType(value)}>
              <SelectTrigger className="rounded-2xl h-12">
                <SelectValue placeholder="Select goal type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SAVINGS">Savings</SelectItem>
                <SelectItem value="CALORIE">Calorie</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Target</div>
            <Input
              type="number"
              min="1"
              value={goalTarget}
              onChange={(e) => setGoalTarget(e.target.value)}
              placeholder="Target amount"
              className="rounded-2xl h-12"
            />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Current</div>
            <Input
              type="number"
              min="0"
              value={goalCurrent}
              onChange={(e) => setGoalCurrent(e.target.value)}
              placeholder="Current progress"
              className="rounded-2xl h-12"
            />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Deadline</div>
            <Input
              type="date"
              value={goalDeadline}
              onChange={(e) => setGoalDeadline(e.target.value)}
              className="rounded-2xl h-12"
            />
          </div>
        </div>

        <button
          onClick={handleAddGoal}
          disabled={addGoal.isPending}
          className="w-full rounded-full bg-secondary py-3.5 font-medium disabled:opacity-50"
        >
          {addGoal.isPending ? "Adding Goal..." : "Add Goal"}
        </button>

        {goals.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Current Goals</div>
            {goals.map((goal) => (
              <div key={goal.id} className="rounded-2xl bg-secondary/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold capitalize">{goal.type.toLowerCase()} goal</div>
                    <div className="text-xs text-muted-foreground">Deadline: {format(new Date(goal.deadline), "d MMM yyyy")}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-lg font-bold">{formatRupees(goal.targetAmount)}</div>
                    <div className="text-xs text-muted-foreground">{Math.round(goal.progress)}% complete</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {goalsLoading && goals.length === 0 && (
          <div className="rounded-2xl bg-secondary/50 p-4 text-sm text-muted-foreground">Loading your goals...</div>
        )}
      </div>

    </>
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

function PageStatusBanner({ message }: { message: string }) {
  return (
    <div className="rounded-[1.35rem] bg-secondary/70 px-4 py-3 text-sm text-muted-foreground">
      {message}
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
