import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Target, CheckCircle, AlertCircle } from "lucide-react";
import { formatRupees } from "@/lib/utils";
import { DailyTransactionSummary } from "./transactionUtils";

interface DailySummaryHeaderProps {
  summary: DailyTransactionSummary;
}

export function DailySummaryHeader({ summary }: DailySummaryHeaderProps) {
  const { dayLabel, totalSpent, transactionCount, topCategory, isHighestDay, isWithinBudget, budget } = summary;

  const dailyBudget = budget > 0 ? budget / 30 : 0;
  const isOverBudget = budget > 0 && totalSpent > dailyBudget * 1.5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-1 pb-2"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">
            {dayLabel}
          </span>
          
          {isHighestDay && (
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-coral/10 text-coral font-medium flex items-center gap-1">
              <TrendingUp className="h-2.5 w-2.5" />
              Highest
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-[11px] text-muted-foreground/70 flex items-center gap-1.5">
            <span className="font-medium text-foreground">{transactionCount}</span>
            {transactionCount === 1 ? "transaction" : "transactions"}
          </div>

          <div className="text-[11px] font-medium text-foreground/80 flex items-center gap-1.5">
            <span className={isOverBudget ? "text-coral" : isWithinBudget ? "text-foreground" : "text-muted-foreground"}>
              {formatRupees(totalSpent)}
            </span>
          </div>
        </div>
      </div>

      {(isHighestDay || !isWithinBudget || topCategory) && (
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {isHighestDay && (
            <span className="text-[10px] text-coral/70 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              This week's highest spending
            </span>
          )}

          {!isWithinBudget && budget > 0 && (
            <span className="text-[10px] text-coral/60 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Above daily average
            </span>
          )}

          {topCategory && !isHighestDay && (
            <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1">
              <Target className="h-3 w-3" />
              Mostly {topCategory}
            </span>
          )}

          {isWithinBudget && budget > 0 && (
            <span className="text-[10px] text-mint/60 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Within budget
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}