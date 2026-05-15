import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  Plus, 
  X, 
  Edit3, 
  Calendar, 
  DollarSign, 
  User,
  Settings,
  Eye,
  EyeOff
} from "lucide-react";
import { useCoveredExpenses, useAddCoveredExpense, useUpdateCoveredExpense, useDeleteCoveredExpense, useDashboard, useFinance } from "@/hooks/useApi";
import { formatRupees, getDefaultCoveredExpenses, isCoveringsDashboardVisible, setCoveringsDashboardVisible } from "@/lib/utils";
import { DEFAULT_USER_ID } from "@/lib/constants";
import { format, addMonths, isBefore, startOfMonth } from "date-fns";
import { toast } from "sonner";
import type { CoveredExpense, CoveringFrequency, CreateCoveredExpenseRequest } from "@/lib/types";
import { calculateCoverageAnalytics, generateCoverageInsights } from "./coverageUtils";
import { CoverageSummaryCard } from "./CoverageSummaryCard";
import { CoverageCard } from "./CoverageCard";
import { CoverageInsightStrip } from "./CoverageInsightStrip";
import { CoverageStatsRow } from "./CoverageStatsRow";

const frequencyOptions: { value: CoveringFrequency; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "semester", label: "Every 6 months" },
  { value: "yearly", label: "Yearly" },
];

export function CoveringsTab() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  const { data: expenses = [], isLoading } = useCoveredExpenses();
  const addExpense = useAddCoveredExpense();
  const updateExpense = useUpdateCoveredExpense();
  const deleteExpense = useDeleteCoveredExpense();

  const today = format(new Date(), "yyyy-MM-dd");
  const month = format(new Date(), "yyyy-MM");
  const { data: dashboard } = useDashboard(undefined, month, today);
  const { data: finance } = useFinance(undefined, today);

  const monthlySpent = dashboard?.totalSpent || 0;
  const analytics = useMemo(() => calculateCoverageAnalytics(expenses, monthlySpent), [expenses, monthlySpent]);
  const insights = useMemo(() => generateCoverageInsights(analytics, expenses), [analytics, expenses]);
  const dashboardVisible = isCoveringsDashboardVisible();

  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    whoCovers: "",
    frequency: "monthly" as CoveringFrequency,
    nextDueDate: format(new Date(), "yyyy-MM-dd"),
  });

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
          userId: DEFAULT_USER_ID,
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 space-y-4">
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-card rounded-2xl p-4 shadow-soft overflow-hidden"
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
                className={`w-11 h-6 rounded-full transition-all ${
                  dashboardVisible ? "bg-primary" : "bg-secondary"
                }`}
              >
                <div
                  className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    dashboardVisible ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-rose-500" />
          <h3 className="text-[10px] uppercase tracking-[0.15em] font-semibold text-muted-foreground">Financial Support</h3>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-full bg-secondary/50 hover:bg-secondary transition"
        >
          <Settings className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      {expenses.length > 0 && (
        <>
          <CoverageSummaryCard analytics={analytics} />
          
          {insights.length > 0 && (
            <CoverageInsightStrip insights={insights} />
          )}
          
          <CoverageStatsRow analytics={analytics} monthlySpent={monthlySpent} />
        </>
      )}

      {expenses.length === 0 && !showForm && (
        <div className="mb-4">
          <div className="text-[9px] uppercase tracking-widest text-muted-foreground/60 font-semibold mb-3">Quick Add</div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s.name}
                onClick={() => fillSuggestion(s.name, s.suggestedAmount, s.suggestedWho)}
                className="px-3.5 py-1.5 rounded-full bg-card border border-rose-200/50 dark:border-rose-800/40 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-900/20 transition-all shadow-sm"
              >
                + {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-card rounded-2xl p-4.5 shadow-soft border border-rose-100/50 dark:border-rose-900/30 overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-sm">{editingId ? "Edit Support" : "Add Support"}</h4>
                <button type="button" onClick={resetForm} className="p-1">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              <div>
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground/70 font-semibold mb-1.5">Expense Name</div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rent, Tiffin"
                  className="w-full h-10 rounded-xl bg-secondary/50 px-3.5 outline-none focus:ring-2 focus:ring-rose-500/20 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground/70 font-semibold mb-1.5">Amount</div>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0"
                      className="w-full h-10 rounded-xl bg-secondary/50 pl-8 pr-3.5 outline-none focus:ring-2 focus:ring-rose-500/20 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground/70 font-semibold mb-1.5">Provider</div>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                    <input
                      type="text"
                      value={formData.whoCovers}
                      onChange={(e) => setFormData({ ...formData, whoCovers: e.target.value })}
                      placeholder="Mom, Dad"
                      className="w-full h-10 rounded-xl bg-secondary/50 pl-8 pr-3.5 outline-none focus:ring-2 focus:ring-rose-500/20 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground/70 font-semibold mb-1.5">Frequency</div>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value as CoveringFrequency })}
                    className="w-full h-10 rounded-xl bg-secondary/50 px-3.5 outline-none focus:ring-2 focus:ring-rose-500/20 text-sm appearance-none cursor-pointer"
                  >
                    {frequencyOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground/70 font-semibold mb-1.5">Next Due</div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                    <input
                      type="date"
                      value={formData.nextDueDate}
                      onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
                      className="w-full h-10 rounded-xl bg-secondary/50 pl-8 pr-3.5 outline-none focus:ring-2 focus:ring-rose-500/20 text-sm cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={addExpense.isPending || updateExpense.isPending}
                className="w-full h-10 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-semibold text-sm shadow-lg shadow-rose-500/20 hover:shadow-xl transition-all disabled:opacity-50"
              >
                {addExpense.isPending || updateExpense.isPending ? "Saving..." : editingId ? "Update Support" : "Add Support"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full h-10 rounded-xl bg-card border-2 border-dashed border-rose-200/50 dark:border-rose-800/40 text-rose-500 font-medium text-sm flex items-center justify-center gap-2 hover:bg-rose-50/50 dark:hover:bg-rose-900/20 transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Support
        </button>
      )}

      {expenses.length > 0 && (
        <div className="space-y-2.5">
          <div className="text-[9px] uppercase tracking-widest text-muted-foreground/60 font-semibold px-1">
            Covered Items ({expenses.length})
          </div>
          <div className="space-y-2">
            {expenses.map((expense, index) => (
              <CoverageCard
                key={expense.id}
                expense={expense}
                index={index}
                onEdit={startEdit}
                onDelete={handleDelete}
                isDeleting={deleteExpense.isPending}
              />
            ))}
          </div>
        </div>
      )}

      {expenses.length === 0 && !showForm && (
        <div className="text-center py-12 bg-secondary/10 rounded-3xl border border-dashed border-muted-foreground/15">
          <Heart className="h-10 w-10 text-muted-foreground/25 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-medium">No covered expenses yet</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Add expenses covered by family</p>
        </div>
      )}
    </div>
  );
}