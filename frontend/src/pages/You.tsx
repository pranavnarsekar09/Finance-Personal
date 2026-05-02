import { useState } from "react";
import { Check, Plus, Sun, Moon, AlertCircle, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useGoals, useProfile, useSaveProfile, useSaveCategories } from "@/hooks/useApi";
import { formatRupees } from "@/lib/utils";
import type { Goal, UserCategory } from "@/lib/types";
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

export default function You() {
  const { data: profile, isLoading: profileLoading, error: profileError } = useProfile();
  const { data: goals, isLoading: goalsLoading } = useGoals();
  const saveProfile = useSaveProfile();
  const saveCategories = useSaveCategories();
  
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Category management state
  const [isCatDialogOpen, setIsCatDialogOpen] = useState(false);
  const [catToEdit, setCatToEdit] = useState<UserCategory | null>(null);
  const [catNameInput, setCatNameInput] = useState("");
  const [catBudgetInput, setCatBudgetInput] = useState("");

  const toggleTheme = (t: "light" | "dark") => {
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");
    toast.success(`${t === "dark" ? "Dark" : "Light"} mode on`);
  };

  const initializeDemoProfile = async () => {
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
      toast.error(`Failed to initialize profile: ${err.message}`);
    }
  };

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

    const currentCategories = [...(profile?.categories || [])];
    
    if (catToEdit) {
      // Edit existing
      const index = currentCategories.findIndex(c => c.name === catToEdit.name);
      if (index !== -1) {
        currentCategories[index] = { name: catNameInput, budget };
      }
    } else {
      // Add new
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
    const currentCategories = profile?.categories.filter(c => c.name !== name) || [];
    try {
      await saveCategories.mutateAsync({ categories: currentCategories });
      toast.success("Category deleted");
    } catch (err: any) {
      toast.error(`Failed to delete: ${err.message}`);
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
        <p className="text-sm text-muted-foreground">It looks like your profile hasn&apos;t been set up yet.</p>
        <button
          onClick={initializeDemoProfile}
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

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Profile</div>
        <div className="h-11 w-11 rounded-full bg-gradient-mint flex items-center justify-center font-bold text-primary shadow-soft">
          {initials}
        </div>
      </div>

      <h1 className="font-display text-4xl font-bold tracking-tight">You</h1>

      <div className="bg-card rounded-[1.75rem] shadow-soft p-5 flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-gradient-mint flex items-center justify-center text-2xl font-display font-bold text-primary">
          {initials}
        </div>
        <div className="flex-1">
          <div className="font-display text-xl font-bold">{profile.name}</div>
          <div className="text-xs text-muted-foreground">{profile.email}</div>
        </div>
        <button className="text-xs text-primary font-medium">Edit</button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-2xl shadow-soft p-4">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Monthly Budget</div>
          <div className="font-display text-2xl font-bold mt-1">{formatRupees(profile.monthlyBudget)}</div>
        </div>
        <div className="bg-card rounded-2xl shadow-soft p-4">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Daily Calories</div>
          <div className="font-display text-2xl font-bold mt-1">{profile.calorieGoal.toLocaleString()}</div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Categories</span>
          <button 
            onClick={handleOpenAddCategory}
            className="text-xs text-primary font-medium flex items-center gap-1 hover:opacity-80 transition"
          >
            <Plus className="h-3 w-3" />
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {profile.categories.map((c: UserCategory) => (
            <div 
              key={c.name} 
              className="group bg-card rounded-full shadow-soft px-3 py-2 flex items-center gap-2 text-sm relative overflow-hidden"
            >
              <span className="w-5 text-center">{c.name.charAt(0)}</span>
              <span className="font-medium">{c.name}</span>
              <span className="text-muted-foreground text-xs">{formatRupees(c.budget)}</span>
              
              <div className="flex items-center gap-1 ml-1 pl-2 border-l border-border opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleOpenEditCategory(c)}
                  className="p-1 hover:text-primary transition"
                  title="Edit"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
                <button 
                  onClick={() => handleDeleteCategory(c.name)}
                  className="p-1 hover:text-destructive transition"
                  title="Delete"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Savings Jars</div>
        <div className="space-y-3">
          {savingsGoals.map((j: Goal) => {
            const pct = Math.min(100, j.progress || (j.targetAmount > 0 ? (j.currentAmount / j.targetAmount) * 100 : 0));
            return (
              <div key={j.id} className="bg-card rounded-2xl shadow-soft p-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Savings Goal</span>
                  <span className="text-sm text-muted-foreground">{formatRupees(j.targetAmount)}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-gradient-mint rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <div className="text-xs text-muted-foreground mt-1">{Math.round(pct)}% complete</div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Appearance</div>
        <div className="grid grid-cols-2 gap-3">
          {([
            { id: "light" as const, label: "Light", Icon: Sun, bg: "bg-gradient-cream" },
            { id: "dark" as const, label: "Dark", Icon: Moon, bg: "bg-surface-dark text-primary-foreground" },
          ]).map(({ id, label, Icon, bg }) => (
            <button
              key={id}
              onClick={() => toggleTheme(id)}
              className={`relative ${bg} rounded-2xl p-5 shadow-soft flex flex-col items-start gap-2 border-2 transition ${theme === id ? "border-primary" : "border-transparent"}`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-semibold">{label}</span>
              {theme === id && (
                <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Check className="h-3 w-3" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <Dialog open={isCatDialogOpen} onOpenChange={setIsCatDialogOpen}>
        <DialogContent className="rounded-[1.75rem] max-w-[90vw] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">{catToEdit ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs uppercase tracking-widest text-muted-foreground">Category Name</Label>
              <Input
                id="name"
                value={catNameInput}
                onChange={(e) => setCatNameInput(e.target.value)}
                placeholder="e.g. Entertainment"
                className="rounded-2xl h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget" className="text-xs uppercase tracking-widest text-muted-foreground">Monthly Budget (₹)</Label>
              <Input
                id="budget"
                type="number"
                value={catBudgetInput}
                onChange={(e) => setCatBudgetInput(e.target.value)}
                placeholder="0.00"
                className="rounded-2xl h-12"
              />
            </div>
          </div>
          <DialogFooter className="flex-row gap-2">
            <Button 
              variant="secondary" 
              onClick={() => setIsCatDialogOpen(false)}
              className="flex-1 rounded-full h-12 font-medium"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveCategory}
              disabled={saveCategories.isPending}
              className="flex-1 bg-surface-dark text-primary-foreground rounded-full h-12 font-medium"
            >
              {saveCategories.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
