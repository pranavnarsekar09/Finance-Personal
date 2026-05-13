import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  Plus, 
  X, 
  Edit3, 
  Trash2, 
  Calendar, 
  ChevronDown,
  DollarSign,
  User,
  Settings,
  Eye,
  EyeOff
} from "lucide-react";
import { useCoveredExpenses, useAddCoveredExpense, useUpdateCoveredExpense, useDeleteCoveredExpense } from "@/hooks/useApi";
import { formatRupees, getDefaultCoveredExpenses, isCoveringsDashboardVisible, setCoveringsDashboardVisible } from "@/lib/utils";
import { format, parseISO, addMonths, isBefore, startOfMonth } from "date-fns";
import { toast } from "sonner";
import type { CoveredExpense, CoveringFrequency, CreateCoveredExpenseRequest } from "@/lib/types";

const frequencyOptions: { value: CoveringFrequency; label: string; months: number }[] = [
  { value: "monthly", label: "Monthly", months: 1 },
  { value: "semester", label: "Every 6 months", months: 6 },
  { value: "yearly", label: "Yearly", months: 12 },
];

export function CoveringsTab() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  const { data: expenses = [], isLoading } = useCoveredExpenses();
  const addExpense = useAddCoveredExpense();
  const updateExpense = useUpdateCoveredExpense();
  const deleteExpense = useDeleteCoveredExpense();

  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    whoCovers: "",
    frequency: "monthly" as CoveringFrequency,
    nextDueDate: format(new Date(), "yyyy-MM-dd"),
  });

  const monthlyTotal = useMemo(() => {
    return expenses.reduce((total, expense) => {
      switch (expense.frequency) {
        case "monthly":
          return total + expense.amount;
        case "semester":
          return total + expense.amount / 6;
        case "yearly":
          return total + expense.amount / 12;
        default:
          return total + expense.amount;
      }
    }, 0);
  }, [expenses]);

  const dashboardVisible = isCoveringsDashboardVisible();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = Number(formData.amount);
    if (!formData.name.trim() || !formData.whoCovers.trim() || amount <= 0) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      if (editingId) {
        await updateExpense.mutateAsync({
          id: editingId,
          payload: {
            name: formData.name,
            amount,
            whoCovers: formData.whoCovers,
            frequency: formData.frequency,
            nextDueDate: formData.nextDueDate,
          },
        });
        toast.success("Expense updated");
      } else {
        await addExpense.mutateAsync({
          name: formData.name,
          amount,
          whoCovers: formData.whoCovers,
          frequency: formData.frequency,
          nextDueDate: formData.nextDueDate,
        });
        toast.success("Covered expense added");
      }
      resetForm();
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error?.message || "Failed to save");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      amount: "",
      whoCovers: "",
      frequency: "monthly",
      nextDueDate: format(new Date(), "yyyy-MM-dd"),
    });
    setShowForm(false);
    setEditingId(null);
  };

  const startEdit = (expense: CoveredExpense) => {
    setEditingId(expense.id);
    setFormData({
      name: expense.name,
      amount: expense.amount.toString(),
      whoCovers: expense.whoCovers,
      frequency: expense.frequency,
      nextDueDate: expense.nextDueDate,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this covered expense?")) {
      try {
        await deleteExpense.mutateAsync(id);
        toast.success("Deleted");
      } catch (error) {
        toast.error("Failed to delete");
      }
    }
  };

  const handleToggleDashboard = () => {
    setCoveringsDashboardVisible(!dashboardVisible);
    toast.success(!dashboardVisible ? "Card will show on dashboard" : "Card hidden from dashboard");
  };

  const getNextDueDate = (expense: CoveredExpense): string => {
    const nextDate = parseISO(expense.nextDueDate);
    const today = startOfMonth(new Date());
    
    if (isBefore(nextDate, today)) {
      let newDate = nextDate;
      while (isBefore(newDate, today)) {
        switch (expense.frequency) {
          case "monthly":
            newDate = addMonths(newDate, 1);
            break;
          case "semester":
            newDate = addMonths(newDate, 6);
            break;
          case "yearly":
            newDate = addMonths(newDate, 12);
            break;
        }
      }
      return format(newDate, "MMM yyyy");
    }
    return format(nextDate, "MMM yyyy");
  };

  const fillSuggestion = (name: string, amount: number, who: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      amount: amount.toString(),
      whoCovers: who,
    }));
    setShowForm(true);
  };

  const suggestions = getDefaultCoveredExpenses();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      <h1 className="font-display text-4xl font-bold tracking-tight">Covered Expenses</h1>
      <p className="text-sm text-muted-foreground mt-1 mb-6">Expenses your parents cover for you</p>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-rose-500" />
          <h3 className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Covered Expenses</h3>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-full bg-secondary/50 hover:bg-secondary transition"
        >
          <Settings className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-card rounded-[1.5rem] p-4 mb-4 shadow-soft overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {dashboardVisible ? (
                  <Eye className="h-4 w-4 text-primary" />
                ) : (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm font-medium">Show on Dashboard</span>
              </div>
              <button
                onClick={handleToggleDashboard}
                className={`w-12 h-6 rounded-full transition-all ${
                  dashboardVisible ? "bg-primary" : "bg-secondary"
                }`}
              >
                <div
                  className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    dashboardVisible ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/30 dark:to-orange-950/30 rounded-[2.5rem] shadow-soft p-6 mb-6 border border-rose-100 dark:border-rose-900/50">
        <div className="absolute -top-8 -right-8 h-32 w-32 bg-rose-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 bg-orange-200/30 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 bg-rose-500/20 rounded-xl flex items-center justify-center">
              <Heart className="h-4 w-4 text-rose-500" />
            </div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Parents Cover</span>
          </div>
          <div className="font-display text-3xl font-bold text-rose-600 dark:text-rose-400 mb-1">
            {formatRupees(monthlyTotal)}
            <span className="text-sm font-normal text-muted-foreground ml-1">/month</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {expenses.length} expense{expenses.length !== 1 ? "s" : ""} covered
          </div>
        </div>
      </div>

      {/* Suggestions */}
      {expenses.length === 0 && !showForm && (
        <div className="mb-6">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-3">Quick Add</div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s.name}
                onClick={() => fillSuggestion(s.name, s.suggestedAmount, s.suggestedWho)}
                className="px-4 py-2 rounded-full bg-card border border-rose-200 dark:border-rose-800 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all shadow-sm"
              >
                + {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-card rounded-[1.75rem] p-5 mb-6 shadow-soft border border-rose-100 dark:border-rose-900/50 overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold">{editingId ? "Edit Expense" : "Add Covered Expense"}</h4>
                <button type="button" onClick={resetForm} className="p-1">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">Expense Name</div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rent, Tiffin"
                  className="w-full h-12 rounded-2xl bg-secondary/50 px-4 outline-none focus:ring-2 focus:ring-rose-500/30 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">Amount</div>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0"
                      className="w-full h-12 rounded-2xl bg-secondary/50 pl-9 pr-4 outline-none focus:ring-2 focus:ring-rose-500/30 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">Who Covers</div>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={formData.whoCovers}
                      onChange={(e) => setFormData({ ...formData, whoCovers: e.target.value })}
                      placeholder="Mom, Dad"
                      className="w-full h-12 rounded-2xl bg-secondary/50 pl-9 pr-4 outline-none focus:ring-2 focus:ring-rose-500/30 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">Frequency</div>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value as CoveringFrequency })}
                    className="w-full h-12 rounded-2xl bg-secondary/50 px-4 outline-none focus:ring-2 focus:ring-rose-500/30 text-sm appearance-none cursor-pointer"
                  >
                    {frequencyOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">Next Due</div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="date"
                      value={formData.nextDueDate}
                      onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
                      className="w-full h-12 rounded-2xl bg-secondary/50 pl-9 pr-4 outline-none focus:ring-2 focus:ring-rose-500/30 text-sm cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={addExpense.isPending || updateExpense.isPending}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {addExpense.isPending || updateExpense.isPending ? "Saving..." : editingId ? "Update Expense" : "Add Covered Expense"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full h-12 rounded-2xl bg-card border-2 border-dashed border-rose-200 dark:border-rose-800 text-rose-500 font-medium flex items-center justify-center gap-2 mb-6 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Covered Expense
        </button>
      )}

      {/* Expense List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-10 text-muted-foreground animate-pulse">Loading...</div>
        ) : expenses.length > 0 ? (
          expenses.map((expense) => (
            <div
              key={expense.id}
              className="group bg-card rounded-[1.5rem] p-4 shadow-soft border border-rose-50 dark:border-rose-900/30 hover:border-rose-200 dark:hover:border-rose-800 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-rose-100 to-orange-100 dark:from-rose-900/50 dark:to-orange-900/50 flex items-center justify-center">
                    <Heart className="h-5 w-5 text-rose-500" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">{expense.name}</div>
                    <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400">
                        {expense.whoCovers}
                      </span>
                      <span className="capitalize">{expense.frequency}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display font-bold text-rose-600 dark:text-rose-400">
                    {formatRupees(expense.amount)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Due: {getNextDueDate(expense)}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-rose-100 dark:border-rose-900/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => startEdit(expense)}
                  className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition"
                >
                  <Edit3 className="h-4 w-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => handleDelete(expense.id)}
                  className="p-2 rounded-full bg-coral/10 text-coral hover:bg-coral hover:text-white transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-secondary/20 rounded-[2rem] border border-dashed border-muted-foreground/20">
            <Heart className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No covered expenses yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Add expenses that your parents cover</p>
          </div>
        )}
      </div>
    </div>
  );
}