import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "sonner";
import { Target } from "lucide-react";
import { useAddGoal, useDashboard, useExpenseTrend, useGoals, useProfile, useSaveProfile } from "@/hooks/useApi";
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
import type { CreateGoalRequest, GoalType, ProfileUpsertRequest } from "@/lib/types";

export default function Home() {
  const [tab, setTab] = useState<"overview" | "budget">("overview");
  const [direction, setDirection] = useState(0);
  const { medium } = useHaptic();
  const month = format(new Date(), "yyyy-MM");
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: dashboard, isLoading: dashLoading } = useDashboard(undefined, month, today);
  const { data: goals, isLoading: goalsLoading } = useGoals();
  const expenseTrend = useExpenseTrend();

  const pageVariants = {
    initial: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    animate: { x: 0, opacity: 1, transition: { duration: 0.24, ease: "easeOut" } },
    exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0, transition: { duration: 0.18, ease: "easeIn" } }),
  };

  const changeTab = (nextTab: "overview" | "budget") => {
    setDirection(nextTab === "budget" ? 1 : -1);
    setTab(nextTab);
    medium();
  };

  useSwipeNative({
    onSwipeLeft: () => {
      if (tab === "overview") {
        changeTab("budget");
      }
    },
    onSwipeRight: () => {
      if (tab === "budget") {
        changeTab("overview");
      }
    },
    threshold: 50,
    ignoreSelector: "[data-swipe-ignore]",
  });

  if (profileLoading || dashLoading || goalsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-muted-foreground font-display text-xl">Loading your vision...</div>
      </div>
    );
  }

  const userInitials = profile?.name ? profile.name.split(" ").map((n: string) => n[0]).join("").toUpperCase() : "U";

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div className="bg-card/70 backdrop-blur rounded-full p-1 flex shadow-soft">
          {(["overview", "budget"] as const).map((t) => (
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
            />
          ) : (
            <BudgetTab
              profile={profile || null}
              goals={goals || []}
              trendExpenses={expenseTrend.data.flatMap((entry) => entry.expenses)}
              trendLoading={expenseTrend.isLoading}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function OverviewTab({
  profileName,
  dashboard,
}: {
  profileName: string;
  dashboard: any;
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

      <BalanceCard
        total={dashboard?.monthlyBudget || 0}
        spent={dashboard?.totalSpent || 0}
        todaySpent={dashboard?.spentToday || 0}
        available={dashboard?.remainingBudget || 0}
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
  goals,
  trendExpenses,
  trendLoading,
}: {
  profile: any;
  goals: any[];
  trendExpenses: any[];
  trendLoading: boolean;
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
      </div>

    </>
  );
}
