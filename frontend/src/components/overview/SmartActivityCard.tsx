import { motion } from "framer-motion";
import { Car, ShoppingBag, Utensils, Zap, Coffee, RefreshCw, Calendar, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { formatRupees } from "@/lib/utils";
import type { Expense } from "@/lib/types";
import { parseISO, format, getDay, getHours } from "date-fns";

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Groceries: ShoppingBag,
  Dining: Utensils,
  Transport: Car,
  Bills: Zap,
  Entertainment: Coffee,
  default: ShoppingBag,
};

const categoryColors: Record<string, { bg: string; border: string; icon: string; pill: string }> = {
  Groceries: { bg: "from-emerald-500/10 to-emerald-600/5", border: "border-emerald-500/20", icon: "text-emerald-600", pill: "bg-emerald-500/10 text-emerald-700" },
  Dining: { bg: "from-amber-500/10 to-amber-600/5", border: "border-amber-500/20", icon: "text-amber-600", pill: "bg-amber-500/10 text-amber-700" },
  Transport: { bg: "from-sky-500/10 to-sky-600/5", border: "border-sky-500/20", icon: "text-sky", pill: "bg-sky-500/10 text-sky-700" },
  Bills: { bg: "from-violet-500/10 to-violet-600/5", border: "border-violet-500/20", icon: "text-violet-600", pill: "bg-violet-500/10 text-violet-700" },
  Entertainment: { bg: "from-pink-500/10 to-pink-600/5", border: "border-pink-500/20", icon: "text-pink-600", pill: "bg-pink-500/10 text-pink-700" },
  default: { bg: "from-secondary to-secondary/50", border: "border-border/30", icon: "text-muted-foreground", pill: "bg-secondary text-muted-foreground" },
};

interface SmartActivityCardProps {
  expense: Expense;
  averageAmount?: number;
}

export function SmartActivityCard({ expense, averageAmount = 0 }: SmartActivityCardProps) {
  const Icon = categoryIcons[expense.categoryName] || categoryIcons.default;
  const colors = categoryColors[expense.categoryName] || categoryColors.default;
  
  const time = parseISO(expense.date);
  const timeStr = format(time, "h:mm a");
  const day = getDay(time);
  const hour = getHours(time);
  const isWeekend = day === 0 || day === 6;
  const isLunchTime = hour >= 12 && hour <= 14;
  const isDinnerTime = hour >= 19 && hour <= 22;
  
  const noteParts = expense.note?.split(" | ") || [];
  const merchantName = noteParts[0] || expense.categoryName;

  let amountContext = "";
  if (averageAmount > 0) {
    const ratio = expense.amount / averageAmount;
    if (ratio > 1.5) amountContext = "Higher than average";
    else if (ratio < 0.5) amountContext = "Lower than average";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-[1.75rem] shadow-soft p-4 border border-border/30"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-md bg-lavender/20 flex items-center justify-center">
            <Clock className="h-3 w-3 text-purple-500" />
          </div>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
            Latest Activity
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground/60">
          {format(time, "MMM d")}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${colors.bg} flex items-center justify-center border ${colors.border} shrink-0`}>
          <Icon className={`h-5 w-5 ${colors.icon}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-medium text-foreground truncate">{merchantName}</div>
          
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${colors.pill}`}>
              {expense.categoryName}
            </span>
            
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              {expense.paymentMethod}
            </span>

            <span className="text-[10px] text-muted-foreground/60">
              {timeStr}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {isWeekend && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky/10 text-sky flex items-center gap-1">
                <Calendar className="h-2.5 w-2.5" />
                Weekend
              </span>
            )}

            {isLunchTime && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 flex items-center gap-1">
                Lunch
              </span>
            )}

            {isDinnerTime && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-600 flex items-center gap-1">
                Dinner
              </span>
            )}

            {expense.isRecurring && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-mint/10 text-mint flex items-center gap-1">
                <RefreshCw className="h-2.5 w-2.5" />
                Recurring
              </span>
            )}

            {amountContext && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 ${
                amountContext.includes("Higher") ? "bg-coral/10 text-coral" : "bg-mint/10 text-mint"
              }`}>
                {amountContext.includes("Higher") ? (
                  <TrendingUp className="h-2.5 w-2.5" />
                ) : (
                  <TrendingDown className="h-2.5 w-2.5" />
                )}
                {amountContext}
              </span>
            )}
          </div>
        </div>

        <div className="font-display font-bold text-coral text-lg shrink-0">
          -{formatRupees(expense.amount)}
        </div>
      </div>
    </motion.div>
  );
}