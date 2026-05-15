import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCoveredExpenses } from "@/hooks/useApi";
import { formatRupees, isCoveringsDashboardVisible } from "@/lib/utils";
import { useMemo } from "react";

export function CoveringsCard() {
  const navigate = useNavigate();
  const { data: expenses = [] } = useCoveredExpenses();
  const dashboardVisible = isCoveringsDashboardVisible();

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

  if (!dashboardVisible || expenses.length === 0) {
    return null;
  }

  return (
    <div 
      onClick={() => navigate("/money?tab=covered")}
      className="relative overflow-hidden bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/30 dark:to-orange-950/30 rounded-[1.75rem] shadow-soft p-5 border border-rose-100 dark:border-rose-900/50 cursor-pointer hover:scale-[1.01] transition-transform"
    >
      <div className="absolute -top-6 -right-6 h-20 w-20 bg-rose-200/30 rounded-full blur-2xl" />
      <div className="absolute -bottom-6 -left-6 h-20 w-20 bg-orange-200/30 rounded-full blur-2xl" />
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-rose-500/20 rounded-xl flex items-center justify-center">
            <Heart className="h-5 w-5 text-rose-500" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Parents Cover</div>
            <div className="font-display text-xl font-bold text-rose-600 dark:text-rose-400">
              {formatRupees(monthlyTotal)}
              <span className="text-xs font-normal text-muted-foreground ml-1">/mo</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">{expenses.length} expense{expenses.length !== 1 ? "s" : ""}</div>
        </div>
      </div>
    </div>
  );
}