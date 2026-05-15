import { motion } from "framer-motion";
import { Heart, MoreHorizontal, Edit3, Trash2 } from "lucide-react";
import { useState } from "react";
import { formatRupees } from "@/lib/utils";
import type { CoveredExpense } from "@/lib/types";
import { getMonthlyEquivalent, getExpenseStability } from "./coverageUtils";
import { CoverageTrendBadge } from "./CoverageTrendBadge";

interface CoverageCardProps {
  expense: CoveredExpense;
  index: number;
  onEdit: (expense: CoveredExpense) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function CoverageCard({ expense, index, onEdit, onDelete, isDeleting }: CoverageCardProps) {
  const [showActions, setShowActions] = useState(false);
  const monthlyEquivalent = getMonthlyEquivalent(expense);
  const stability = getExpenseStability(expense);
  const nextDue = getNextDueDateDisplay(expense);

  const frequencyType = expense.frequency === "monthly" ? "monthly" : 
                        expense.frequency === "semester" ? "semester" : "yearly";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="group relative bg-card/80 dark:bg-card/60 rounded-2xl p-4 shadow-soft border border-rose-100/50 dark:border-rose-900/30 hover:border-rose-200/70 dark:hover:border-rose-800/50 transition-all duration-300"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-100/80 to-orange-100/80 dark:from-rose-900/40 dark:to-orange-900/40 flex items-center justify-center border border-rose-200/30 dark:border-rose-800/30 shrink-0">
          <Heart className="h-4 w-4 text-rose-500" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="font-semibold text-sm text-foreground truncate">
                {expense.name}
              </h4>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-rose-100/70 dark:bg-rose-900/40 text-[10px] font-medium text-rose-600 dark:text-rose-400">
                  {expense.whoCovers}
                </span>
                <CoverageTrendBadge type={frequencyType} size="sm" />
              </div>
            </div>
            
            <div className="text-right shrink-0">
              <div className="font-display text-lg font-bold text-rose-600 dark:text-rose-400">
                {formatRupees(expense.amount)}
              </div>
              <div className="text-[10px] text-muted-foreground/70 mt-0.5">
                {formatRupees(monthlyEquivalent)}/mo equiv.
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-rose-100/50 dark:border-rose-900/30">
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground/60">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400/60" />
                Due {nextDue}
              </span>
              <span className="opacity-50">•</span>
              <CoverageTrendBadge 
                type={stability.status === "long-term" ? "long-term" : 
                      stability.status === "stable" ? "stable" :
                      stability.status === "growing" ? "growing" : "new"} 
                size="sm" 
              />
            </div>
            
            <div className={`flex items-center gap-1 transition-opacity duration-200 ${
              showActions ? "opacity-100" : "opacity-0"
            }`}>
              <button
                onClick={() => onEdit(expense)}
                className="p-1.5 rounded-lg bg-secondary/50 hover:bg-secondary transition"
                aria-label="Edit"
              >
                <Edit3 className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              <button
                onClick={() => onDelete(expense.id)}
                disabled={isDeleting}
                className="p-1.5 rounded-lg bg-coral/10 hover:bg-coral hover:text-white text-coral transition disabled:opacity-50"
                aria-label="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function getNextDueDateDisplay(expense: CoveredExpense): string {
  const date = new Date(expense.nextDueDate);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return monthNames[date.getMonth()] + " " + date.getFullYear().toString().slice(-2);
}