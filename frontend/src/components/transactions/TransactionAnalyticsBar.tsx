import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Activity, Target, PieChart, Wallet } from "lucide-react";
import { formatRupees } from "@/lib/utils";
import { TransactionAnalytics } from "./transactionUtils";

interface TransactionAnalyticsBarProps {
  analytics: TransactionAnalytics;
}

export function TransactionAnalyticsBar({ analytics }: TransactionAnalyticsBarProps) {
  const { transactionCount, totalSpent, averageTransaction, dominantCategory, dominantCategoryPercentage, trend, trendPercentage, volatility } = analytics;

  const trendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-coral" : trend === "down" ? "text-mint" : "text-muted-foreground";
  const trendBg = trend === "up" ? "bg-coral/10" : trend === "down" ? "bg-mint/10" : "bg-secondary";

  const volatilityLevel = volatility > 50 ? "high" : volatility > 25 ? "moderate" : "low";
  const volatilityColor = volatility > 50 ? "text-coral" : volatility > 25 ? "text-sun" : "text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-[1.5rem] shadow-soft p-4 border border-border/30"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-surface-dark/50 flex items-center justify-center">
            <Activity className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-bold">
            Monthly Overview
          </span>
        </div>

        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${trendBg}`}>
          {trend === "up" && <TrendingUp className={`h-3 w-3 ${trendColor}`} />}
          {trend === "down" && <TrendingDown className={`h-3 w-3 ${trendColor}`} />}
          {trend === "stable" && <Minus className={`h-3 w-3 ${trendColor}`} />}
          <span className={`text-[10px] font-medium ${trendColor}`}>
            {trendPercentage > 0 ? "+" : ""}{trendPercentage}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <div className="text-[10px] text-muted-foreground mb-1">Total Spent</div>
            <div className="font-display text-lg font-bold text-foreground">{formatRupees(totalSpent)}</div>
          </div>

          <div>
            <div className="text-[10px] text-muted-foreground mb-1">Transactions</div>
            <div className="text-sm font-medium text-foreground">{transactionCount}</div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="text-[10px] text-muted-foreground mb-1">Average</div>
            <div className="text-sm font-medium text-foreground">{formatRupees(averageTransaction)}</div>
          </div>

          <div>
            <div className="text-[10px] text-muted-foreground mb-1">Volatility</div>
            <div className={`text-sm font-medium ${volatilityColor}`}>
              {volatilityLevel === "high" ? "High" : volatilityLevel === "moderate" ? "Moderate" : "Stable"}
            </div>
          </div>
        </div>
      </div>

      {dominantCategory && (
        <div className="mt-4 pt-4 border-t border-border/20">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-md bg-lavender/10 flex items-center justify-center">
              <PieChart className="h-3 w-3 text-purple-500" />
            </div>
            <span className="text-[10px] text-muted-foreground">
              <span className="font-medium text-foreground">{dominantCategory}</span> dominates {dominantCategoryPercentage}% of spending
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}