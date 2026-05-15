import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import type { Expense } from "@/lib/types";
import { SpendingTrendChart } from "@/components/charts/SpendingTrendChart";

interface EnhancedSpendingTrendProps {
  expenses: Expense[];
  isLoading?: boolean;
  trend?: {
    weeklyComparison: number;
    strongestDay: string | null;
    weakestDay: string | null;
    isTrendingUp: boolean;
    isTrendingDown: boolean;
  };
}

export function EnhancedSpendingTrend({ expenses, isLoading, trend }: EnhancedSpendingTrendProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-[1.75rem] shadow-soft p-5 border border-border/30"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-surface-dark/50 flex items-center justify-center">
            <Activity className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-bold">
            Spending Trend
          </span>
        </div>

        {trend && (
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
            trend.isTrendingUp ? "bg-coral/10" : 
            trend.isTrendingDown ? "bg-mint/10" : "bg-secondary"
          }`}>
            {trend.isTrendingUp && <TrendingUp className="h-3 w-3 text-coral" />}
            {trend.isTrendingDown && <TrendingDown className="h-3 w-3 text-mint" />}
            <span className={`text-[10px] font-medium ${
              trend.isTrendingUp ? "text-coral" : 
              trend.isTrendingDown ? "text-mint" : "text-muted-foreground"
            }`}>
              {trend.weeklyComparison > 0 ? "+" : ""}{trend.weeklyComparison}% vs last week
            </span>
          </div>
        )}
      </div>

      {trend && (trend.strongestDay || trend.weakestDay) && (
        <div className="flex gap-3 mb-4">
          {trend.strongestDay && (
            <div className="flex-1 p-2 rounded-xl bg-coral/5 border border-coral/10">
              <div className="text-[9px] text-coral/70 mb-1">Highest Day</div>
              <div className="text-xs font-medium text-coral">{trend.strongestDay}</div>
            </div>
          )}
          {trend.weakestDay && (
            <div className="flex-1 p-2 rounded-xl bg-mint/5 border border-mint/10">
              <div className="text-[9px] text-mint/70 mb-1">Lowest Day</div>
              <div className="text-xs font-medium text-mint">{trend.weakestDay}</div>
            </div>
          )}
        </div>
      )}

      <SpendingTrendChart expenses={expenses} isLoading={isLoading} />
    </motion.div>
  );
}