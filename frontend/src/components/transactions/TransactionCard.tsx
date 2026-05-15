import { motion } from "framer-motion";
import { Car, ShoppingBag, Utensils, Zap, Coffee, RefreshCw, Calendar, Clock, AlertCircle, TrendingUp, TrendingDown, Flame, Moon, Sun } from "lucide-react";
import { formatRupees } from "@/lib/utils";
import type { Expense } from "@/lib/types";
import { TransactionContext } from "./transactionUtils";
import { parseISO, format } from "date-fns";

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

interface TransactionCardProps {
  expense: Expense;
  context?: TransactionContext;
  averageAmount?: number;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

export function TransactionCard({ expense, context, averageAmount = 0, onDelete, isDeleting }: TransactionCardProps) {
  const Icon = categoryIcons[expense.categoryName] || categoryIcons.default;
  const colors = categoryColors[expense.categoryName] || categoryColors.default;
  const time = parseISO(expense.date);
  const timeStr = format(time, "h:mm a");
  const noteParts = expense.note?.split(" | ") || [];
  const merchantName = noteParts[0] || expense.categoryName;
  const autoNote = noteParts[1];

  const handleDelete = () => {
    if (onDelete && confirm("Delete this expense?")) {
      onDelete(expense.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="group relative"
    >
      <div className="flex items-center gap-3 p-4 rounded-2xl hover:bg-secondary/30 transition-all duration-200">
        <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${colors.bg} flex items-center justify-center border ${colors.border} shrink-0`}>
          <Icon className={`h-5 w-5 ${colors.icon}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground truncate">{merchantName}</span>
            {expense.isRecurring && (
              <div className="h-4 w-4 rounded-full bg-mint/10 flex items-center justify-center shrink-0">
                <RefreshCw className="h-2.5 w-2.5 text-mint" />
              </div>
            )}
          </div>

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

            {context?.isWeekend && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky/10 text-sky flex items-center gap-1">
                <Calendar className="h-2.5 w-2.5" />
                Weekend
              </span>
            )}

            {context?.isLunchTime && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 flex items-center gap-1">
                <Sun className="h-2.5 w-2.5" />
                Lunch
              </span>
            )}

            {context?.isDinnerTime && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-600 flex items-center gap-1">
                <Moon className="h-2.5 w-2.5" />
                Dinner
              </span>
            )}

            {context?.amountContext === "higher" && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-coral/10 text-coral flex items-center gap-1">
                <TrendingUp className="h-2.5 w-2.5" />
                Higher spend
              </span>
            )}

            {context?.amountContext === "lower" && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-mint/10 text-mint flex items-center gap-1">
                <TrendingDown className="h-2.5 w-2.5" />
                Lower spend
              </span>
            )}
          </div>

          {autoNote && (
            <div className="mt-2 text-[10px] text-muted-foreground/70 flex items-center gap-1.5">
              <div className="h-px w-3 bg-muted-foreground/30" />
              {autoNote}
            </div>
          )}

          {context?.categoryTrend && context.categoryTrend !== "stable" && (
            <div className="mt-2 flex items-center gap-1.5">
              {context.categoryTrend === "up" ? (
                <span className="text-[10px] text-coral/70 flex items-center gap-1">
                  <TrendingUp className="h-2.5 w-2.5" />
                  Up from last month
                </span>
              ) : (
                <span className="text-[10px] text-mint/70 flex items-center gap-1">
                  <TrendingDown className="h-2.5 w-2.5" />
                  Down from last month
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="font-display font-bold text-coral">-{formatRupees(expense.amount)}</div>
          </div>

          {onDelete && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 text-muted-foreground/40 hover:text-coral opacity-0 group-hover:opacity-100 transition-all duration-200 disabled:opacity-30"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function TransactionCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 animate-pulse">
      <div className="h-12 w-12 rounded-2xl bg-secondary/50" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 bg-secondary/50 rounded" />
        <div className="h-3 w-24 bg-secondary/30 rounded" />
      </div>
      <div className="h-5 w-20 bg-secondary/50 rounded" />
    </div>
  );
}