import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Plus, Sun, Moon, AlertCircle, Edit2, Trash2, Download, FileText, FileSpreadsheet, Settings, FolderOpen, User as UserIcon, Target } from "lucide-react";
import { toast } from "sonner";
import { useGoals, useProfile, useSaveProfile, useSaveCategories, useMultipleExpenses, useMultipleFoodLogs, useFinance, useDashboard, useStorageUsage, useAddGoal, useUpdateGoal, useDeleteGoal } from "@/hooks/useApi";
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

const YOU_TABS = ["profile", "categories", "preferences", "data"] as const;
type YouTab = (typeof YOU_TABS)[number];

export default function You() {
  const [tab, setTab] = useState<YouTab>("profile");
  const [direction, setDirection] = useState(0);
  const { medium } = useHaptic();

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
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [budgetInput, setBudgetInput] = useState("");
  const [calorieInput, setCalorieInput] = useState("");
  const [balanceInput, setBalanceInput] = useState("");

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

  const [goalType, setGoalType] = useState<GoalType>("SAVINGS");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalCurrent, setGoalCurrent] = useState("0");
  const [goalDeadline, setGoalDeadline] = useState(format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"));
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

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

  const startEditing = () => {
    setNameInput(profile.name);
    setEmailInput(profile.email);
    setBudgetInput(profile.monthlyBudget.toString());
    setCalorieInput(profile.calorieGoal.toString());
    setIsEditing(true);
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
      setIsEditing(false);
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
    } catch (err: any) {
      toast.error(err.message || "Failed to process goal.");
    }
  };

  const startEditingGoal = (goal: Goal) => {
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
    } catch (err: any) {
      toast.error(err.message || "Failed to delete goal.");
    }
  };

  return (
    <div className="space-y-5">
      <div className="pt-2">
        <h1 className="font-display text-4xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Your personal information and targets</p>
      </div>

      <div className="bg-card rounded-[1.75rem] shadow-soft p-5 flex items-center gap-4 border border-border/30 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 h-24 w-24 bg-mint/20 rounded-full blur-2xl" />
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-mint to-emerald-400 flex items-center justify-center text-2xl font-display font-bold text-primary shadow-lg shadow-mint/30">
          {initials}
        </div>
        <div className="flex-1">
          <div className="font-display text-xl font-bold">{profile.name}</div>
          <div className="text-xs text-muted-foreground">{profile.email}</div>
        </div>
        <button onClick={startEditing} className="text-xs text-primary font-medium hover:opacity-80 transition">Edit</button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-2xl shadow-soft p-4 border border-border/30 hover:border-mint/20 transition-colors">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Monthly Budget</div>
          <div className="font-display text-2xl font-bold mt-1 text-mint">{formatRupees(profile.monthlyBudget)}</div>
        </div>
        <div className="bg-card rounded-2xl shadow-soft p-4 border border-border/30 hover:border-mint/20 transition-colors">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Daily Calories</div>
          <div className="font-display text-2xl font-bold mt-1">{profile.calorieGoal.toLocaleString()}</div>
        </div>
      </div>

      {savingsGoals.length > 0 && (
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Savings Goals</div>
          <div className="space-y-3">
            {savingsGoals.map((j: Goal) => {
              const pct = Math.min(100, j.progress || (j.targetAmount > 0 ? (j.currentAmount / j.targetAmount) * 100 : 0));
              return (
                <div key={j.id} className="bg-card rounded-2xl shadow-soft p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{j.type === "SAVINGS" ? "Savings Goal" : "Goal"}</span>
                    <span className="text-sm text-muted-foreground">{formatRupees(j.targetAmount)}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-gradient-mint rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{Math.round(pct)}% complete • Due {format(new Date(j.deadline), "MMM d, yyyy")}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {calorieGoals.length > 0 && (
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Calorie Goals</div>
          <div className="space-y-3">
            {calorieGoals.map((j: Goal) => {
              const pct = Math.min(100, j.progress || (j.targetAmount > 0 ? (j.currentAmount / j.targetAmount) * 100 : 0));
              return (
                <div key={j.id} className="bg-card rounded-2xl shadow-soft p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Calorie Goal</span>
                    <span className="text-sm text-muted-foreground">{j.targetAmount} kcal</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-gradient-to-r from-coral to-orange-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{Math.round(pct)}% complete • Due {format(new Date(j.deadline), "MMM d, yyyy")}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-card rounded-[1.75rem] shadow-soft p-5 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Monthly Budget</div>
            <Input
              type="number"
              min="1"
              value={budgetInput}
              onChange={(e) => handleBudgetInputChange(e.target.value)}
              placeholder="Enter monthly budget"
              className="rounded-2xl h-12"
            />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Available Balance</div>
            <Input
              type="number"
              value={balanceInput}
              onChange={(e) => handleBalanceInputChange(e.target.value)}
              placeholder="Available balance"
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
          onClick={handleSaveProfile}
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
          disabled={addGoal.isPending || updateGoal.isPending}
          className="w-full rounded-full bg-secondary py-3.5 font-medium disabled:opacity-50"
        >
          {editingGoalId ? (updateGoal.isPending ? "Updating Goal..." : "Update Goal") : (addGoal.isPending ? "Adding Goal..." : "Add Goal")}
        </button>

        {goals && goals.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Current Goals</div>
            {goals.map((goal: Goal) => (
              <div
                key={goal.id}
                className={cn(
                  "rounded-2xl p-4 transition-all cursor-pointer active:scale-95",
                  editingGoalId === goal.id ? "bg-primary text-primary-foreground shadow-float" : "bg-secondary/60 hover:bg-secondary/80"
                )}
                onClick={() => startEditingGoal(goal)}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold capitalize">{goal.type.toLowerCase()} goal</div>
                    <div className="text-xs opacity-70">Deadline: {format(new Date(goal.deadline), "d MMM yyyy")}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-display text-lg font-bold">{goal.type === "CALORIE" ? `${goal.targetAmount} kcal` : formatRupees(goal.targetAmount)}</div>
                      <div className="text-xs opacity-70">{Math.round(goal.progress)}% complete</div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteGoal(goal.id, e)}
                      disabled={deleteGoal.isPending}
                      className={cn(
                        "p-2 rounded-full transition-colors",
                        editingGoalId === goal.id
                          ? "hover:bg-white/20 text-primary-foreground"
                          : "hover:bg-destructive/20 text-destructive"
                      )}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="rounded-[1.75rem] max-w-[90vw] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs uppercase tracking-widest text-muted-foreground">Name</Label>
              <Input id="name" value={nameInput} onChange={(e) => setNameInput(e.target.value)} className="rounded-2xl h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-widest text-muted-foreground">Email</Label>
              <Input id="email" type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} className="rounded-2xl h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget" className="text-xs uppercase tracking-widest text-muted-foreground">Monthly Budget (₹)</Label>
              <Input id="budget" type="number" value={budgetInput} onChange={(e) => setBudgetInput(e.target.value)} className="rounded-2xl h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="calories" className="text-xs uppercase tracking-widest text-muted-foreground">Daily Calorie Goal</Label>
              <Input id="calories" type="number" value={calorieInput} onChange={(e) => setCalorieInput(e.target.value)} className="rounded-2xl h-12" />
            </div>
          </div>
          <DialogFooter className="flex-row gap-2">
            <Button variant="secondary" onClick={() => setIsEditing(false)} className="flex-1 rounded-full h-12 font-medium">Cancel</Button>
            <Button onClick={handleSaveProfile} disabled={saveProfile.isPending} className="flex-1 bg-surface-dark text-primary-foreground rounded-full h-12 font-medium">
              {saveProfile.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CategoriesTabContent() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const saveCategories = useSaveCategories();
  const [isCatDialogOpen, setIsCatDialogOpen] = useState(false);
  const [catToEdit, setCatToEdit] = useState<UserCategory | null>(null);
  const [catNameInput, setCatNameInput] = useState("");
  const [catBudgetInput, setCatBudgetInput] = useState("");

  if (profileLoading || !profile) {
    return <div className="p-10 text-center animate-pulse">Loading categories...</div>;
  }

  const handleOpenAddCategory = () => {
    setCatToEdit(null);
    setCatNameInput("");
    setCatBudgetInput("");
    setIsCatDialogOpen(true);
  };

  const handleOpenEditCategory = (c: UserCategory) => {
    setCatToEdit(c);
    setCatNameInput(c.name);
    setCatBudgetInput(c.budget.toString());
    setIsCatDialogOpen(true);
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
      setIsCatDialogOpen(false);
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

  const totalBudget = profile.categories.reduce((sum, c) => sum + c.budget, 0);

  return (
    <div className="space-y-5">
      <div className="pt-2">
        <h1 className="font-display text-4xl font-bold tracking-tight">Categories</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your spending categories and budgets</p>
      </div>

      <div className="bg-card rounded-[1.5rem] shadow-soft p-4 flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{profile.categories.length}</span> categories
        </div>
        <div className="text-sm text-muted-foreground">
          Total: <span className="font-medium text-mint">{formatRupees(totalBudget)}</span>
        </div>
      </div>

      <div className="flex justify-end">
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
          <div key={c.name} className="group bg-card rounded-2xl shadow-soft p-4 flex items-center justify-between border border-border/30 hover:border-mint/20 transition-all">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-mint flex items-center justify-center text-lg font-bold text-primary">
                {c.name.charAt(0)}
              </div>
              <div>
                <div className="font-semibold">{c.name}</div>
                <div className="text-xs text-muted-foreground">Budget: {formatRupees(c.budget)}/month</div>
              </div>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => handleOpenEditCategory(c)}
                className="p-2 hover:bg-secondary rounded-full transition"
                title="Edit"
              >
                <Edit2 className="h-4 w-4 text-muted-foreground" />
              </button>
              <button 
                onClick={() => handleDeleteCategory(c.name)}
                className="p-2 hover:bg-destructive/10 rounded-full transition"
                title="Delete"
              >
                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isCatDialogOpen} onOpenChange={setIsCatDialogOpen}>
        <DialogContent className="rounded-[1.75rem] max-w-[90vw] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">{catToEdit ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="catname" className="text-xs uppercase tracking-widest text-muted-foreground">Category Name</Label>
              <Input id="catname" value={catNameInput} onChange={(e) => setCatNameInput(e.target.value)} placeholder="e.g. Entertainment" className="rounded-2xl h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="catbudget" className="text-xs uppercase tracking-widest text-muted-foreground">Monthly Budget (₹)</Label>
              <Input id="catbudget" type="number" value={catBudgetInput} onChange={(e) => setCatBudgetInput(e.target.value)} placeholder="0.00" className="rounded-2xl h-12" />
            </div>
          </div>
          <DialogFooter className="flex-row gap-2">
            <Button variant="secondary" onClick={() => setIsCatDialogOpen(false)} className="flex-1 rounded-full h-12 font-medium">Cancel</Button>
            <Button onClick={handleSaveCategory} disabled={saveCategories.isPending} className="flex-1 bg-surface-dark text-primary-foreground rounded-full h-12 font-medium">
              {saveCategories.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PreferencesTabContent() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const toggleTheme = (t: "light" | "dark") => {
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");
    toast.success(`${t === "dark" ? "Dark" : "Light"} mode on`);
  };

  return (
    <div className="space-y-5">
      <div className="pt-2">
        <h1 className="font-display text-4xl font-bold tracking-tight">Preferences</h1>
        <p className="text-sm text-muted-foreground mt-1">Customize your app experience</p>
      </div>

      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Appearance</div>
        <div className="grid grid-cols-2 gap-3">
          {([
            { id: "light" as const, label: "Light", Icon: Sun, bg: "bg-gradient-to-br from-[#f8f6f3] to-[#e8e5e0] border-border/30 hover:border-mint/40" },
            { id: "dark" as const, label: "Dark", Icon: Moon, bg: "bg-gradient-to-br from-[#1a1f1c] to-[#0f1210] text-primary-foreground border-white/5 hover:border-mint/40" },
          ]).map(({ id, label, Icon, bg }) => (
            <button
              key={id}
              onClick={() => toggleTheme(id)}
              className={cn(
                "relative", bg, "rounded-2xl p-5 shadow-soft flex flex-col items-start gap-2 border-2 transition-all duration-200",
                theme === id ? "border-primary shadow-lg shadow-mint/20" : ""
              )}
            >
              <Icon className={cn("h-5 w-5", id === 'dark' ? 'text-mint' : 'text-amber-500')} />
              <span className="font-semibold">{label}</span>
              {theme === id && (
                <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-mint text-primary flex items-center justify-center shadow-md">
                  <Check className="h-3 w-3" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-soft p-5">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="h-5 w-5 text-muted-foreground" />
          <div className="text-sm font-semibold">App Behavior</div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Haptic Feedback</div>
              <div className="text-xs text-muted-foreground">Vibration on interactions</div>
            </div>
            <div className="h-6 w-11 bg-mint rounded-full relative cursor-pointer">
              <div className="absolute right-0.5 top-0.5 h-5 w-5 bg-white rounded-full shadow" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Default Start Tab</div>
              <div className="text-xs text-muted-foreground">Where app opens by default</div>
            </div>
            <div className="text-sm text-muted-foreground">Dashboard</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DataTabContent() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: goals } = useGoals();
  const { data: finance } = useFinance(profile?.userId || "");
  const { data: dashboard } = useDashboard(profile?.userId || "", format(new Date(), "yyyy-MM"));
  const { data: storageUsage, isLoading: storageUsageLoading } = useStorageUsage(!!profile);

  const currentMonth = format(new Date(), "yyyy-MM");
  const monthsToFetch = Array.from({ length: 12 }, (_, i) => format(subMonths(new Date(), 11 - i), "yyyy-MM"));
  
  const expensesQueries = useMultipleExpenses(profile?.userId || "", monthsToFetch, !!profile);
  const foodLogsQueries = useMultipleFoodLogs(profile?.userId || "", monthsToFetch, !!profile);

  const formatBytes = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

  const exportDataAsJSON = async () => {
    try {
      const allExpenses = expensesQueries.flatMap(query => query.data || []).filter((expense, index, self) => self.findIndex(e => e.id === expense.id) === index);
      const allFoodLogs = foodLogsQueries.flatMap(query => query.data || []).filter((log, index, self) => self.findIndex(l => l.id === log.id) === index);

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
      
      toast.success(`Data exported! ${allExpenses.length} expenses, ${allFoodLogs.length} food logs`);
    } catch (err: any) {
      toast.error(`Failed to export: ${err.message}`);
    }
  };

  const exportDataAsPDF = async () => {
    try {
      const allExpenses = expensesQueries.flatMap(query => query.data || []).filter((expense, index, self) => self.findIndex(e => e.id === expense.id) === index);
      const allFoodLogs = foodLogsQueries.flatMap(query => query.data || []).filter((log, index, self) => self.findIndex(l => l.id === log.id) === index);

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
    } catch (err: any) {
      toast.error(`Failed to export: ${err.message}`);
    }
  };

  const exportDataAsExcel = async () => {
    try {
      const allExpenses = expensesQueries.flatMap(query => query.data || []).filter((expense, index, self) => self.findIndex(e => e.id === expense.id) === index);
      const allFoodLogs = foodLogsQueries.flatMap(query => query.data || []).filter((log, index, self) => self.findIndex(l => l.id === log.id) === index);

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
    } catch (err: any) {
      toast.error(`Failed to export: ${err.message}`);
    }
  };

  return (
    <div className="space-y-5">
      <div className="pt-2">
        <h1 className="font-display text-4xl font-bold tracking-tight">Data</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your data and storage</p>
      </div>

      <div className="bg-card rounded-2xl shadow-soft p-5">
        <div className="flex items-center gap-3 mb-4">
          <FolderOpen className="h-5 w-5 text-muted-foreground" />
          <div className="text-sm font-semibold">Storage Usage</div>
        </div>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <div className="text-xs text-muted-foreground">MongoDB Atlas</div>
            <div className="font-display text-xl font-bold mt-1">
              {storageUsage ? formatBytes(storageUsage.usedBytes) : storageUsageLoading ? "Calculating..." : "Unavailable"}
            </div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            {storageUsage ? `${Math.round(storageUsage.usedPercentage)}%` : "--"}
          </div>
        </div>
        <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-gradient-mint rounded-full transition-all duration-300" style={{ width: `${storageUsage?.usedPercentage ?? 0}%` }} />
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          {storageUsage
            ? `${formatBytes(storageUsage.usedBytes)} of ${formatBytes(storageUsage.totalBytes)} used`
            : storageUsageLoading ? "Checking storage..." : "Unavailable"}
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-soft p-5">
        <div className="text-sm font-semibold mb-3">Export Your Data</div>
        <p className="text-xs text-muted-foreground mb-4">
          Download all your transactions, goals, and profile data in your preferred format.
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button onClick={exportDataAsJSON} className="flex flex-col items-center gap-2 p-3 bg-secondary rounded-xl hover:bg-secondary/80 transition">
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium">JSON</span>
          </button>
          <button onClick={exportDataAsPDF} className="flex flex-col items-center gap-2 p-3 bg-secondary rounded-xl hover:bg-secondary/80 transition">
            <Download className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium">PDF</span>
          </button>
          <button onClick={exportDataAsExcel} className="flex flex-col items-center gap-2 p-3 bg-secondary rounded-xl hover:bg-secondary/80 transition">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium">Excel</span>
          </button>
        </div>
      </div>
    </div>
  );
}