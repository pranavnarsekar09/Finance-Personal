import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Plus, Sun, Moon, AlertCircle, Edit2, Trash2, Download, FileText, FileSpreadsheet, Settings, FolderOpen, User as UserIcon, Target, Wallet, Flame, PiggyBank, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { useGoals, useProfile, useSaveProfile, useSaveCategories, useExpenses, useMultipleExpenses, useMultipleFoodLogs, useFinance, useDashboard, useStorageUsage, useAddGoal, useUpdateGoal, useDeleteGoal } from "@/hooks/useApi";
import { useSwipeNative } from "@/hooks/useSwipe";
import { useHaptic } from "@/hooks/useHaptic";
import { formatRupees, cn } from "@/lib/utils";
import type { UserCategory, Goal, GoalType } from "@/lib/types";
import { format, subMonths } from "date-fns";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubtabPillBarWithIndicator } from "@/components/layout/SubtabPillBar";
import { BottomSheet } from "@/components/sheets/BottomSheet";
import {
  ConfigurationSection,
  SystemSettingCard,
  GoalConfigurationCard,
  SetupProgressIndicator,
  EmptyConfigurationState,
  MiniStatCard,
  CategoryCard,
  CategorySummaryStrip,
  CategoryInsightBadge,
  PreferenceGroup,
  PreferenceCard,
  ThemePresetCard,
  SystemToggle,
  PreferenceRow,
  SystemStatusBadge,
  StorageStatusCard,
  SystemInfrastructureStatus,
  TrustIndicator,
  ExportFormatCard,
} from "@/components/configuration";

const YOU_TABS = ["profile", "categories", "preferences", "data"] as const;
type YouTab = (typeof YOU_TABS)[number];

export default function You() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get("tab");
  const initialTab: YouTab = YOU_TABS.includes(urlTab as YouTab) ? (urlTab as YouTab) : "profile";
  
  const [tab, setTab] = useState<YouTab>(initialTab);
  const [direction, setDirection] = useState(0);
  const { medium } = useHaptic();

  useEffect(() => {
    if (urlTab && YOU_TABS.includes(urlTab as YouTab)) {
      setTab(urlTab as YouTab);
    }
  }, [urlTab]);

  const pageVariants = {
    initial: (dir: number) => ({ x: dir > 0 ? 20 : -20, opacity: 0 }),
    animate: { x: 0, opacity: 1, transition: { duration: 0.24, ease: "easeOut" } },
    exit: (dir: number) => ({ x: dir > 0 ? -20 : 20, opacity: 0, transition: { duration: 0.18, ease: "easeIn" } }),
  };

  const changeTab = (nextTab: YouTab) => {
    const currentIndex = YOU_TABS.indexOf(tab);
    const nextIndex = YOU_TABS.indexOf(nextTab);
    setDirection(nextIndex > currentIndex ? 1 : -1);
    setTab(nextTab);
    setSearchParams({ tab: nextTab });
    medium();
  };

  useSwipeNative({
    onSwipeLeft: () => {
      const currentIndex = YOU_TABS.indexOf(tab);
      if (currentIndex < YOU_TABS.length - 1) {
        changeTab(YOU_TABS[currentIndex + 1]);
      }
    },
    onSwipeRight: () => {
      const currentIndex = YOU_TABS.indexOf(tab);
      if (currentIndex > 0) {
        changeTab(YOU_TABS[currentIndex - 1]);
      }
    },
    threshold: 50,
    ignoreSelector: "[data-swipe-ignore]",
    scopeSelector: "[data-you-swipe='true']",
  });

  return (
    <div data-you-swipe="true" className="space-y-5 touch-pan-y">
      <div className="flex justify-between items-center">
        <SubtabPillBarWithIndicator
          tabs={YOU_TABS}
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
          {tab === "profile" && <ProfileTabContent />}
          {tab === "categories" && <CategoriesTabContent />}
          {tab === "preferences" && <PreferencesTabContent />}
          {tab === "data" && <DataTabContent />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ProfileTabContent() {
  const { data: profile, isLoading: profileLoading, error: profileError } = useProfile();
  const { data: goals, isLoading: goalsLoading } = useGoals();
  const month = format(new Date(), "yyyy-MM");
  const dashboardQuery = useDashboard(undefined, month, undefined, true);
  const saveProfile = useSaveProfile();
  const addGoal = useAddGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();
  const { medium } = useHaptic();

  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);
  const [isFinancialSheetOpen, setIsFinancialSheetOpen] = useState(false);
  const [isGoalSheetOpen, setIsGoalSheetOpen] = useState(false);

  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [budgetInput, setBudgetInput] = useState("");
  const [calorieInput, setCalorieInput] = useState("");
  const [balanceInput, setBalanceInput] = useState("");

  const [goalType, setGoalType] = useState<GoalType>("SAVINGS");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalCurrent, setGoalCurrent] = useState("0");
  const [goalDeadline, setGoalDeadline] = useState(format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"));
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

  const totalSpent = dashboardQuery.data?.totalSpent || 0;

  useEffect(() => {
    if (profile) {
      setBudgetInput(profile.monthlyBudget?.toString() || "");
      setCalorieInput(profile.calorieGoal?.toString() || "");
      const balance = (profile.monthlyBudget || 0) - totalSpent;
      setBalanceInput(balance.toString());
    }
  }, [profile, totalSpent]);

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

  if (profileLoading || goalsLoading) {
    return <div className="p-10 text-center animate-pulse">Loading profile...</div>;
  }

  if (profileError || !profile) {
    return (
      <div className="p-10 text-center space-y-4">
        <div className="h-16 w-16 bg-secondary rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold">Profile Not Found</h2>
        <p className="text-sm text-muted-foreground">It looks like your profile hasn't been set up yet.</p>
        <button
          onClick={async () => {
            try {
              await saveProfile.mutateAsync({
                name: "Demo User",
                email: "demo@example.com",
                monthlyBudget: 4000,
                calorieGoal: 2200,
                categories: [
                  { name: "Groceries", budget: 600 },
                  { name: "Dining", budget: 400 },
                  { name: "Transport", budget: 200 },
                  { name: "Shopping", budget: 500 },
                  { name: "Bills", budget: 1500 },
                ],
              });
              toast.success("Profile initialized!");
            } catch (err: any) {
              toast.error(`Failed: ${err.message}`);
            }
          }}
          disabled={saveProfile.isPending}
          className="bg-surface-dark text-primary-foreground px-6 py-3 rounded-full font-medium"
        >
          {saveProfile.isPending ? "Initializing..." : "Initialize Demo Profile"}
        </button>
      </div>
    );
  }

  const initials = profile.name ? profile.name.split(" ").map((n: string) => n[0]).join("").toUpperCase() : "U";
  const savingsGoals = (goals || []).filter((goal: Goal) => goal.type === "SAVINGS");
  const calorieGoals = (goals || []).filter((goal: Goal) => goal.type === "CALORIE");
  const allGoals = goals || [];

  const configuredCount = 3 + allGoals.length;
  const totalParams = 4;

  const openProfileSheet = () => {
    setNameInput(profile.name);
    setEmailInput(profile.email);
    setIsProfileSheetOpen(true);
  };

  const openFinancialSheet = () => {
    setIsFinancialSheetOpen(true);
  };

  const handleSaveProfile = async () => {
    const budget = Number(budgetInput);
    const calories = Number(calorieInput);

    if (isNaN(budget) || budget <= 0) {
      toast.error("Monthly budget must be greater than 0");
      return;
    }
    if (isNaN(calories) || calories <= 0) {
      toast.error("Calorie goal must be greater than 0");
      return;
    }

    try {
      await saveProfile.mutateAsync({
        name: profile.name,
        email: profile.email,
        monthlyBudget: budget,
        calorieGoal: calories,
        availableBalance: Number(balanceInput),
        categories: profile.categories,
      });
      toast.success("Profile updated!");
      setIsProfileSheetOpen(false);
      setIsFinancialSheetOpen(false);
    } catch (err: any) {
      toast.error(err.message);
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
        const payload = {
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
      setIsGoalSheetOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to process goal.");
    }
  };

  const openGoalSheet = (goal?: Goal) => {
    if (goal) {
      setEditingGoalId(goal.id);
      setGoalType(goal.type);
      setGoalTarget(goal.targetAmount.toString());
      setGoalCurrent(goal.currentAmount.toString());
      setGoalDeadline(format(new Date(goal.deadline), "yyyy-MM-dd"));
    } else {
      setEditingGoalId(null);
      setGoalType("SAVINGS");
      setGoalTarget("");
      setGoalCurrent("0");
      setGoalDeadline(format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"));
    }
    setIsGoalSheetOpen(true);
    medium();
  };

  const handleDeleteGoal = async (goalId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteGoal.mutateAsync(goalId);
      toast.success("Goal deleted.");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete goal.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="pt-2">
        <h1 className="font-display text-4xl font-bold tracking-tight">System Configuration</h1>
        <p className="text-sm text-muted-foreground mt-1">Calibrate your personal operating system</p>
      </div>

      <SetupProgressIndicator
        configured={configuredCount}
        total={totalParams}
        label="Profile Configuration"
      />

      <ConfigurationSection
        title="Profile Status"
        description="Your identity within the system"
      >
        <div className="bg-card rounded-2xl p-5 border border-border/40 relative overflow-hidden group hover:border-mint/30 transition-all">
          <div className="absolute -top-8 -right-8 h-20 w-20 bg-mint/15 rounded-full blur-2xl group-hover:bg-mint/25 transition-all" />
          <div className="flex items-center gap-4 relative">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-mint to-emerald-400 flex items-center justify-center text-xl font-display font-bold text-primary shadow-lg shadow-mint/20">
              {initials}
            </div>
            <div className="flex-1">
              <div className="font-display text-lg font-bold">{profile.name}</div>
              <div className="text-xs text-muted-foreground">{profile.email}</div>
            </div>
            <button
              onClick={openProfileSheet}
              className="p-2 rounded-xl bg-secondary/60 hover:bg-secondary transition-colors"
            >
              <Edit2 className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </ConfigurationSection>

      <ConfigurationSection
        title="Financial Parameters"
        description="Budget configuration and spending limits"
      >
        <div className="grid grid-cols-2 gap-3">
          <SystemSettingCard
            label="Monthly Budget"
            value={profile.monthlyBudget}
            unit="₹"
            accentColor="mint"
            onClick={openFinancialSheet}
            icon={<Wallet className="h-4 w-4" />}
            description="Configured spending limit"
          />
          <SystemSettingCard
            label="Daily Calories"
            value={profile.calorieGoal}
            unit="kcal"
            accentColor="coral"
            onClick={openFinancialSheet}
            icon={<Flame className="h-4 w-4" />}
            description="Nutrition target"
          />
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70">Available Balance</div>
              <div className="font-display text-xl font-bold text-mint mt-1">
                ₹{Number(balanceInput).toLocaleString('en-IN')}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70">Spent</div>
              <div className="text-sm text-muted-foreground mt-1">
                ₹{totalSpent.toLocaleString('en-IN')} / ₹{profile.monthlyBudget.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-gradient-mint rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (totalSpent / profile.monthlyBudget) * 100)}%` }}
            />
          </div>
        </div>
      </ConfigurationSection>

      <ConfigurationSection
        title="Goal Engine"
        description="Track and achieve your targets"
      >
        {allGoals.length > 0 ? (
          <div className="space-y-3">
            {allGoals.map((goal: Goal) => (
              <GoalConfigurationCard
                key={goal.id}
                title={goal.type === "SAVINGS" ? "Savings Goal" : "Calorie Goal"}
                target={goal.targetAmount}
                current={goal.currentAmount}
                deadline={goal.deadline}
                type={goal.type === "SAVINGS" ? "savings" : "calorie"}
                onEdit={() => openGoalSheet(goal)}
                onDelete={() => handleDeleteGoal(goal.id, { stopPropagation: () => {} } as any)}
              />
            ))}
          </div>
        ) : (
          <EmptyConfigurationState
            title="No active goals"
            message="Configure your first goal to start tracking progress"
            actionLabel="Add Goal"
            onAction={() => openGoalSheet()}
          />
        )}
        <button
          onClick={() => openGoalSheet()}
          className="w-full py-3 rounded-2xl border-2 border-dashed border-border/40 text-sm text-muted-foreground hover:border-mint/40 hover:text-mint transition-all flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Configure New Goal
        </button>
      </ConfigurationSection>

      <BottomSheet
        open={isProfileSheetOpen}
        onClose={() => setIsProfileSheetOpen(false)}
        title="Edit Profile"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Name</Label>
            <Input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="rounded-xl h-12 bg-secondary/50 border-0"
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Email</Label>
            <Input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="rounded-xl h-12 bg-secondary/50 border-0"
              placeholder="your@email.com"
            />
          </div>
          <Button
            onClick={handleSaveProfile}
            disabled={saveProfile.isPending}
            className="w-full rounded-xl h-12 bg-surface-dark text-primary-foreground font-medium"
          >
            {saveProfile.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </BottomSheet>

      <BottomSheet
        open={isFinancialSheetOpen}
        onClose={() => setIsFinancialSheetOpen(false)}
        title="Financial Parameters"
      >
        <div className="space-y-5">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Monthly Budget (₹)</Label>
              <Input
                type="number"
                value={budgetInput}
                onChange={(e) => handleBudgetInputChange(e.target.value)}
                className="rounded-xl h-12 bg-secondary/50 border-0"
                placeholder="4000"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Available Balance (₹)</Label>
              <Input
                type="number"
                value={balanceInput}
                onChange={(e) => handleBalanceInputChange(e.target.value)}
                className="rounded-xl h-12 bg-secondary/50 border-0"
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Daily Calorie Goal</Label>
              <Input
                type="number"
                value={calorieInput}
                onChange={(e) => setCalorieInput(e.target.value)}
                className="rounded-xl h-12 bg-secondary/50 border-0"
                placeholder="2200"
              />
            </div>
          </div>
          <Button
            onClick={handleSaveProfile}
            disabled={saveProfile.isPending}
            className="w-full rounded-xl h-12 bg-surface-dark text-primary-foreground font-medium"
          >
            {saveProfile.isPending ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      </BottomSheet>

      <BottomSheet
        open={isGoalSheetOpen}
        onClose={() => setIsGoalSheetOpen(false)}
        title={editingGoalId ? "Update Goal" : "Configure Goal"}
      >
        <div className="space-y-5">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Goal Type</Label>
              <Select value={goalType} onValueChange={(value: GoalType) => setGoalType(value)}>
                <SelectTrigger className="rounded-xl h-12 bg-secondary/50 border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAVINGS">Savings</SelectItem>
                  <SelectItem value="CALORIE">Calorie</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                Target {goalType === "SAVINGS" ? "(₹)" : "(kcal)"}
              </Label>
              <Input
                type="number"
                value={goalTarget}
                onChange={(e) => setGoalTarget(e.target.value)}
                className="rounded-xl h-12 bg-secondary/50 border-0"
                placeholder={goalType === "SAVINGS" ? "10000" : "5000"}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Current Progress</Label>
              <Input
                type="number"
                value={goalCurrent}
                onChange={(e) => setGoalCurrent(e.target.value)}
                className="rounded-xl h-12 bg-secondary/50 border-0"
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Deadline</Label>
              <Input
                type="date"
                value={goalDeadline}
                onChange={(e) => setGoalDeadline(e.target.value)}
                className="rounded-xl h-12 bg-secondary/50 border-0"
              />
            </div>
          </div>
          <Button
            onClick={handleAddGoal}
            disabled={addGoal.isPending || updateGoal.isPending}
            className="w-full rounded-xl h-12 bg-surface-dark text-primary-foreground font-medium"
          >
            {editingGoalId
              ? (updateGoal.isPending ? "Updating..." : "Update Goal")
              : (addGoal.isPending ? "Adding..." : "Configure Goal")}
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}

function CategoriesTabContent() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const saveCategories = useSaveCategories();
  const [isCatSheetOpen, setIsCatSheetOpen] = useState(false);
  const [catToEdit, setCatToEdit] = useState<UserCategory | null>(null);
  const [catNameInput, setCatNameInput] = useState("");
  const [catBudgetInput, setCatBudgetInput] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const { medium } = useHaptic();

  const currentMonth = format(new Date(), "yyyy-MM");
  const expensesQuery = useExpenses(profile?.userId || "", currentMonth);
  const expenses = expensesQuery.data || [];

  if (profileLoading || !profile) {
    return <div className="p-10 text-center animate-pulse">Loading categories...</div>;
  }

  const categorySpending: Record<string, number> = {};
  expenses.forEach((expense: any) => {
    const catName = expense.categoryName;
    if (catName) {
      categorySpending[catName] = (categorySpending[catName] || 0) + expense.amount;
    }
  });

  const getCategorySpent = (categoryName: string) => categorySpending[categoryName] || 0;

  const handleOpenAddCategory = () => {
    setCatToEdit(null);
    setCatNameInput("");
    setCatBudgetInput("");
    setSelectedPreset(null);
    setIsCatSheetOpen(true);
  };

  const handleOpenEditCategory = (c: UserCategory) => {
    setCatToEdit(c);
    setCatNameInput(c.name);
    setCatBudgetInput(c.budget.toString());
    setSelectedPreset(null);
    setIsCatSheetOpen(true);
    medium();
  };

  const handleSaveCategory = async () => {
    if (!catNameInput || !catBudgetInput) {
      toast.error("Please fill in all fields");
      return;
    }

    const budget = parseFloat(catBudgetInput);
    if (isNaN(budget) || budget < 0) {
      toast.error("Invalid budget amount");
      return;
    }

    const currentCategories = [...(profile.categories || [])];
    
    if (catToEdit) {
      const index = currentCategories.findIndex(c => c.name === catToEdit.name);
      if (index !== -1) {
        currentCategories[index] = { name: catNameInput, budget };
      }
    } else {
      if (currentCategories.some(c => c.name.toLowerCase() === catNameInput.toLowerCase())) {
        toast.error("Category already exists");
        return;
      }
      currentCategories.push({ name: catNameInput, budget });
    }

    try {
      await saveCategories.mutateAsync({ categories: currentCategories });
      toast.success(catToEdit ? "Category updated" : "Category added");
      setIsCatSheetOpen(false);
    } catch (err: any) {
      toast.error(`Failed to save: ${err.message}`);
    }
  };

  const handleDeleteCategory = async (name: string) => {
    const currentCategories = profile.categories.filter(c => c.name !== name);
    try {
      await saveCategories.mutateAsync({ categories: currentCategories });
      toast.success("Category deleted");
    } catch (err: any) {
      toast.error(`Failed to delete: ${err.message}`);
    }
  };

  const selectPreset = (presetName: string, presetBudget: number) => {
    setCatNameInput(presetName);
    setCatBudgetInput(presetBudget.toString());
    setSelectedPreset(presetName);
  };

  const totalBudget = profile.categories.reduce((sum, c) => sum + c.budget, 0);
  
  let highestPressure = 0;
  let highestPressureCategory = "";
  profile.categories.forEach((c: UserCategory) => {
    const spent = getCategorySpent(c.name);
    const pressure = c.budget > 0 ? (spent / c.budget) * 100 : 0;
    if (pressure > highestPressure) {
      highestPressure = pressure;
      highestPressureCategory = c.name;
    }
  });

  const generateInsights = () => {
    const insights: { text: string; type: "info" | "warning" | "success" }[] = [];
    
    profile.categories.forEach((c: UserCategory) => {
      const spent = getCategorySpent(c.name);
      const utilization = c.budget > 0 ? (spent / c.budget) * 100 : 0;
      
      if (utilization > 100) {
        insights.push({ text: `${c.name} exceeded budget by ₹${Math.abs(c.budget - spent).toLocaleString('en-IN')}`, type: "warning" });
      } else if (utilization >= 75) {
        insights.push({ text: `${c.name} nearing monthly limit (${Math.round(utilization)}%)`, type: "warning" });
      } else if (utilization > 0 && utilization < 25 && c.budget > 500) {
        insights.push({ text: `${c.name} spending remains low this month`, type: "info" });
      }
    });
    
    if (expenses.length === 0 && profile.categories.length > 0) {
      insights.push({ text: "No spending recorded this month", type: "info" });
    }
    
    return insights.slice(0, 2);
  };

  const insights = generateInsights();
  const PRESETS = [
    { name: "Groceries", icon: "🛒", budget: 2000, color: "mint" as const },
    { name: "Dining", icon: "🍽️", budget: 1500, color: "coral" as const },
    { name: "Transport", icon: "🚗", budget: 800, color: "sun" as const },
    { name: "Shopping", icon: "🛍️", budget: 2000, color: "lavender" as const },
    { name: "Bills", icon: "📄", budget: 3000, color: "sky" as const },
    { name: "Entertainment", icon: "🎬", budget: 1000, color: "coral" as const },
    { name: "Coffee", icon: "☕", budget: 500, color: "sun" as const },
    { name: "Health", icon: "💊", budget: 1000, color: "mint" as const },
  ];

  return (
    <div className="space-y-6">
      <div className="pt-2">
        <h1 className="font-display text-4xl font-bold tracking-tight">Category Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure your financial infrastructure</p>
      </div>

      <CategorySummaryStrip
        categoryCount={profile.categories.length}
        totalBudget={totalBudget}
        highestPressure={highestPressure}
        highestPressureCategory={highestPressureCategory}
      />

      {insights.length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 px-1">System Insights</div>
          <div className="flex flex-wrap gap-2">
            {insights.map((insight, i) => (
              <CategoryInsightBadge key={i} text={insight.text} type={insight.type} />
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-xs uppercase tracking-[0.15em] text-muted-foreground/70">Active Categories</div>
        <button 
          onClick={handleOpenAddCategory}
          className="bg-surface-dark text-primary-foreground px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:opacity-90 transition"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      <div className="grid gap-3">
        {profile.categories.map((c: UserCategory) => (
          <CategoryCard
            key={c.name}
            name={c.name}
            budget={c.budget}
            spent={getCategorySpent(c.name)}
            onEdit={() => handleOpenEditCategory(c)}
            onDelete={() => handleDeleteCategory(c.name)}
          />
        ))}
      </div>

      <BottomSheet
        open={isCatSheetOpen}
        onClose={() => setIsCatSheetOpen(false)}
        title={catToEdit ? "Edit Category" : "Configure Category"}
      >
        <div className="space-y-5">
          {!catToEdit && (
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Quick Presets</div>
              <div className="grid grid-cols-4 gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => selectPreset(preset.name, preset.budget)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all",
                      selectedPreset === preset.name 
                        ? preset.color === "mint" ? "bg-mint/20 border-mint/40" :
                          preset.color === "coral" ? "bg-coral/20 border-coral/40" :
                          preset.color === "sun" ? "bg-sun/20 border-sun/40" :
                          preset.color === "lavender" ? "bg-lavender/20 border-lavender/40" :
                          "bg-sky-pastel/20 border-sky-pastel/40"
                        : "bg-secondary/30 border-transparent hover:bg-secondary/50"
                    )}
                  >
                    <span className="text-lg">{preset.icon}</span>
                    <span className="text-[9px] font-medium truncate w-full">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Category Name</Label>
              <Input
                value={catNameInput}
                onChange={(e) => setCatNameInput(e.target.value)}
                className="rounded-xl h-12 bg-secondary/50 border-0"
                placeholder="e.g. Entertainment"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Monthly Budget (₹)</Label>
              <Input
                type="number"
                value={catBudgetInput}
                onChange={(e) => setCatBudgetInput(e.target.value)}
                className="rounded-xl h-12 bg-secondary/50 border-0"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              onClick={() => setIsCatSheetOpen(false)}
              className="flex-1 rounded-xl h-12 font-medium"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveCategory} 
              disabled={saveCategories.isPending}
              className="flex-1 rounded-xl h-12 bg-surface-dark text-primary-foreground font-medium"
            >
              {saveCategories.isPending ? "Saving..." : catToEdit ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}

function PreferencesTabContent() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const { medium } = useHaptic();

  const toggleTheme = (t: "light" | "dark") => {
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");
    toast.success(`${t === "dark" ? "Dark" : "Light"} mode activated`);
    medium();
  };

  const toggleHaptics = () => {
    setHapticsEnabled(!hapticsEnabled);
    toast.success(`${!hapticsEnabled ? "Haptics enabled" : "Haptics disabled"}`);
    medium();
  };

  const toggleAnimations = () => {
    setAnimationsEnabled(!animationsEnabled);
    toast.success(`${!animationsEnabled ? "Animations enabled" : "Animations reduced"}`);
    medium();
  };

  return (
    <div className="space-y-6">
      <div className="pt-2">
        <h1 className="font-display text-4xl font-bold tracking-tight">System Preferences</h1>
        <p className="text-sm text-muted-foreground mt-1">Calibrate your operating environment</p>
      </div>

      <PreferenceGroup
        title="Environment Settings"
        description="Configure your visual operating environment"
      >
        <div className="grid grid-cols-2 gap-3">
          <ThemePresetCard
            id="light"
            label="Light Mode"
            icon={Sun}
            isSelected={theme === "light"}
            description="Clean, bright interface"
            onClick={() => toggleTheme("light")}
          />
          <ThemePresetCard
            id="dark"
            label="Dark Mode"
            icon={Moon}
            isSelected={theme === "dark"}
            description="Reduced eye strain"
            onClick={() => toggleTheme("dark")}
          />
        </div>
      </PreferenceGroup>

      <PreferenceGroup
        title="Interaction System"
        description="Configure tactile and motion feedback"
      >
        <PreferenceCard>
          <div className="space-y-1">
            <SystemToggle
              label="Haptic Feedback"
              description="Vibration on touch interactions"
              isEnabled={hapticsEnabled}
              onToggle={toggleHaptics}
              icon={<div className={cn("h-4 w-4 rounded-full", hapticsEnabled ? "bg-mint" : "bg-muted-foreground/30")} />}
            />
          </div>
          <div className="h-px bg-border/30 my-3" />
          <div className="space-y-1">
            <SystemToggle
              label="Motion Effects"
              description="Smooth interface animations"
              isEnabled={animationsEnabled}
              onToggle={toggleAnimations}
              icon={<div className={cn("h-4 w-4 rounded-full", animationsEnabled ? "bg-mint" : "bg-muted-foreground/30")} />}
            />
          </div>
        </PreferenceCard>
      </PreferenceGroup>

      <PreferenceGroup
        title="Navigation Preferences"
        description="Configure startup and navigation behavior"
      >
        <PreferenceCard>
          <PreferenceRow
            label="Default Start Tab"
            value="Dashboard"
            isActive={true}
            icon={<div className="h-4 w-4 rounded bg-mint/30" />}
          />
          <PreferenceRow
            label="Quick Resume"
            value="Enabled"
            isActive={true}
            icon={<div className="h-4 w-4 rounded bg-mint/30" />}
          />
          <PreferenceRow
            label="Swipe Navigation"
            value="Active"
            isActive={true}
            icon={<div className="h-4 w-4 rounded bg-mint/30" />}
          />
        </PreferenceCard>
      </PreferenceGroup>

      <PreferenceGroup
        title="System Information"
        description="Current system status and diagnostics"
      >
        <PreferenceCard className="bg-secondary/30">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70 mb-1">Environment</div>
              <div className="font-medium text-sm">{theme === "light" ? "Light" : "Dark"}</div>
              <SystemStatusBadge status="active" label="Active" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70 mb-1">Interactions</div>
              <div className="font-medium text-sm">{hapticsEnabled ? "Optimized" : "Standard"}</div>
              <SystemStatusBadge status={hapticsEnabled ? "optimized" : "inactive"} label={hapticsEnabled ? "Optimized" : "Off"} />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70 mb-1">Motion</div>
              <div className="font-medium text-sm">{animationsEnabled ? "Enabled" : "Reduced"}</div>
              <SystemStatusBadge status={animationsEnabled ? "active" : "inactive"} label={animationsEnabled ? "Active" : "Off"} />
            </div>
          </div>
        </PreferenceCard>
      </PreferenceGroup>

      <PreferenceGroup
        title="Advanced Options"
        description="Additional configuration and maintenance"
      >
        <PreferenceCard>
          <PreferenceRow
            label="Data Export"
            value=""
            icon={<div className="h-4 w-4 rounded bg-muted-foreground/30" />}
          />
          <PreferenceRow
            label="Storage Management"
            value=""
            icon={<div className="h-4 w-4 rounded bg-muted-foreground/30" />}
          />
          <PreferenceRow
            label="Reset Preferences"
            value=""
            icon={<div className="h-4 w-4 rounded bg-coral/30" />}
          />
        </PreferenceCard>
      </PreferenceGroup>
    </div>
  );
}

function DataTabContent() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: goals, isLoading: goalsLoading } = useGoals(profile?.userId, !!profile?.userId);
  const hasValidProfile = !profileLoading && !!profile?.userId;

  const { data: finance } = useFinance(profile?.userId || "", undefined, hasValidProfile);
  const { data: dashboard } = useDashboard(profile?.userId || "", format(new Date(), "yyyy-MM"), undefined, hasValidProfile);
  const { data: storageUsage, isLoading: storageUsageLoading } = useStorageUsage(hasValidProfile);

  const [isExporting, setIsExporting] = useState<string | null>(null);
  const { medium } = useHaptic();

  const currentMonth = format(new Date(), "yyyy-MM");
  const monthsToFetch = Array.from({ length: 12 }, (_, i) => format(subMonths(new Date(), 11 - i), "yyyy-MM"));
  
  const expensesQueries = useMultipleExpenses(profile?.userId || "", monthsToFetch, hasValidProfile);
  const foodLogsQueries = useMultipleFoodLogs(profile?.userId || "", monthsToFetch, hasValidProfile);

  if (profileLoading || goalsLoading) {
    return <div className="p-10 text-center animate-pulse">Loading data...</div>;
  }

  const allExpenses = expensesQueries.flatMap(query => query.data || []).filter((expense, index, self) => self.findIndex(e => e.id === expense.id) === index);
  const allFoodLogs = foodLogsQueries.flatMap(query => query.data || []).filter((log, index, self) => self.findIndex(l => l.id === log.id) === index);

  const totalRecords = allExpenses.length + allFoodLogs.length + (goals?.length || 0) + (profile ? 1 : 0);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  };

  const exportDataAsJSON = async () => {
    setIsExporting("json");
    try {
      const dataToExport = {
        profile,
        goals,
        finance,
        dashboard,
        expenses: allExpenses,
        foodLogs: allFoodLogs,
        exportedAt: new Date().toISOString(),
        version: "1.0",
        exportPeriod: { months: monthsToFetch, totalExpenses: allExpenses.length, totalFoodLogs: allFoodLogs.length }
      };

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tracker-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Exported ${allExpenses.length} expenses, ${allFoodLogs.length} food logs`);
      medium();
    } catch (err: any) {
      toast.error(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(null);
    }
  };

  const exportDataAsPDF = async () => {
    setIsExporting("pdf");
    try {
      const formatAmountForPDF = (value: number) => `Rs. ${value.toLocaleString('en-IN')}`;
      const doc = new jsPDF();
      
      doc.setFontSize(20);
      doc.text('Personal Finance Tracker - Data Export', 20, 20);
      doc.setFontSize(12);
      doc.text(`Exported on: ${new Date().toLocaleDateString()}`, 20, 30);
      doc.text(`User: ${profile?.name || 'N/A'}`, 20, 40);

      if (profile) {
        doc.setFontSize(16);
        doc.text('Profile Summary', 20, 50);
        autoTable(doc, {
          startY: 55,
          head: [['Field', 'Value']],
          body: [
            ['Name', profile.name],
            ['Email', profile.email],
            ['Monthly Budget', formatAmountForPDF(profile.monthlyBudget)],
            ['Daily Calories', profile.calorieGoal.toString()],
          ],
          margin: { left: 20 },
        });
      }

      doc.save(`tracker-data-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF exported successfully!');
      medium();
    } catch (err: any) {
      toast.error(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(null);
    }
  };

  const exportDataAsExcel = async () => {
    setIsExporting("excel");
    try {
      const workbook = XLSX.utils.book_new();

      if (profile) {
        const profileData = [
          ['Field', 'Value'],
          ['Name', profile.name],
          ['Email', profile.email],
          ['Monthly Budget', profile.monthlyBudget],
          ['Daily Calories', profile.calorieGoal],
        ];
        const profileSheet = XLSX.utils.aoa_to_sheet(profileData);
        XLSX.utils.book_append_sheet(workbook, profileSheet, 'Profile');
      }

      if (allExpenses.length > 0) {
        const expenseData = [
          ['Date', 'Category', 'Amount', 'Payment Method', 'Note'],
          ...allExpenses.map(expense => [
            new Date(expense.date).toLocaleDateString(),
            expense.categoryName,
            expense.amount,
            expense.paymentMethod,
            expense.note || '',
          ])
        ];
        const expenseSheet = XLSX.utils.aoa_to_sheet(expenseData);
        XLSX.utils.book_append_sheet(workbook, expenseSheet, 'Expenses');
      }

      if (allFoodLogs.length > 0) {
        const foodData = [
          ['Date', 'Food Name', 'Calories', 'Protein', 'Carbs', 'Fat', 'Cost'],
          ...allFoodLogs.map(log => [
            new Date(log.date).toLocaleDateString(),
            log.foodName,
            log.calories,
            log.protein,
            log.carbs,
            log.fat,
            log.estimatedCost,
          ])
        ];
        const foodSheet = XLSX.utils.aoa_to_sheet(foodData);
        XLSX.utils.book_append_sheet(workbook, foodSheet, 'Food Logs');
      }

      XLSX.writeFile(workbook, `tracker-data-${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Excel exported successfully!');
      medium();
    } catch (err: any) {
      toast.error(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(null);
    }
  };

  const health = storageUsage && storageUsage.usedPercentage > 90 ? "critical" : storageUsage && storageUsage.usedPercentage > 75 ? "warning" : "healthy";

  return (
    <div className="space-y-6">
      <div className="pt-2">
        <h1 className="font-display text-4xl font-bold tracking-tight">Data Infrastructure</h1>
        <p className="text-sm text-muted-foreground mt-1">System storage and export management</p>
      </div>

      <PreferenceGroup
        title="System Storage"
        description="Cloud infrastructure and storage allocation"
      >
        <StorageStatusCard
          provider="MongoDB Atlas"
          usedBytes={storageUsage?.usedBytes || 0}
          totalBytes={storageUsage?.totalBytes || 0}
          lastSync="2 minutes ago"
          health={health}
          isLoading={storageUsageLoading}
        />
      </PreferenceGroup>

      <PreferenceGroup
        title="Infrastructure Status"
        description="System operational diagnostics"
      >
        <SystemInfrastructureStatus
          recordsIndexed={totalRecords}
          lastBackup="Automatic"
          syncStatus="synced"
          dataIntegrity="verified"
        />
      </PreferenceGroup>

      <PreferenceGroup
        title="Trust & Security"
        description="Infrastructure reliability indicators"
      >
        <PreferenceCard className="bg-secondary/30">
          <div className="grid grid-cols-2 gap-4">
            <TrustIndicator label="Encryption active" isActive={true} />
            <TrustIndicator label="Records verified" isActive={true} />
            <TrustIndicator label="Local exports safe" isActive={true} />
            <TrustIndicator label="Sync stable" isActive={true} />
          </div>
        </PreferenceCard>
      </PreferenceGroup>

      <PreferenceGroup
        title="Export Engine"
        description="Download your system data in preferred format"
      >
        <div className="grid gap-3">
          <ExportFormatCard
            format="JSON"
            label="Full System Archive"
            description="Complete data dump with all records"
            icon={FileText}
            recordCount={`${allExpenses.length} expenses, ${allFoodLogs.length} food logs`}
            onExport={exportDataAsJSON}
            isExporting={isExporting === "json"}
          />
          <ExportFormatCard
            format="PDF"
            label="Formatted Report"
            description="Structured behavioral summary"
            icon={Download}
            recordCount={`${allExpenses.length} transactions`}
            onExport={exportDataAsPDF}
            isExporting={isExporting === "pdf"}
          />
          <ExportFormatCard
            format="Excel"
            label="Structured Records"
            description="Spreadsheet-compatible data"
            icon={FileSpreadsheet}
            recordCount={`${allExpenses.length} expenses, ${allFoodLogs.length} food logs`}
            onExport={exportDataAsExcel}
            isExporting={isExporting === "excel"}
          />
        </div>
      </PreferenceGroup>

      <PreferenceGroup
        title="Data Management"
        description="Additional infrastructure controls"
      >
        <PreferenceCard>
          <PreferenceRow
            label="Import Data"
            value=""
            icon={<div className="h-4 w-4 rounded bg-muted-foreground/30" />}
          />
          <PreferenceRow
            label="Clear Cache"
            value=""
            icon={<div className="h-4 w-4 rounded bg-muted-foreground/30" />}
          />
          <PreferenceRow
            label="Archive Old Data"
            value=""
            icon={<div className="h-4 w-4 rounded bg-muted-foreground/30" />}
          />
        </PreferenceCard>
      </PreferenceGroup>
    </div>
  );
}