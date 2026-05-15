import { motion } from "framer-motion";
import { Heart, Shield, Users, TrendingUp, Calendar } from "lucide-react";
import { formatRupees } from "@/lib/utils";
import type { CoverageAnalytics } from "./coverageUtils";

interface CoverageSummaryCardProps {
  analytics: CoverageAnalytics;
}

export function CoverageSummaryCard({ analytics }: CoverageSummaryCardProps) {
  const primaryProvider = Object.entries(analytics.byProvider).sort(
    (a, b) => b[1].monthlyTotal - a[1].monthlyTotal
  )[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden bg-gradient-to-br from-rose-100/60 via-rose-50/80 to-orange-50/60 dark:from-rose-950/40 dark:via-rose-900/30 dark:to-orange-950/30 rounded-[2rem] shadow-soft-lg border border-rose-200/50 dark:border-rose-800/40"
    >
      <div className="absolute -top-12 -right-12 h-40 w-40 bg-rose-300/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-12 -left-12 h-40 w-40 bg-orange-300/20 rounded-full blur-3xl" />
      
      <div className="relative z-10 p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/25">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-muted-foreground/70">
                Family Support
              </span>
              <div className="font-display text-lg font-bold text-rose-600 dark:text-rose-400">
                {primaryProvider?.[0] || "Parents Cover"}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-mint/15 rounded-full border border-mint/20">
            <Shield className="h-3 w-3 text-mint" />
            <span className="text-[10px] font-medium text-mint">
              {analytics.stabilityScore}% stable
            </span>
          </div>
        </div>

        <div className="mb-5">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-1">
            Monthly Coverage
          </div>
          <div className="font-display text-4xl font-bold text-rose-600 dark:text-rose-400 leading-tight">
            {formatRupees(analytics.monthlyTotal)}
            <span className="text-sm font-medium text-muted-foreground/70 ml-1.5">/mo</span>
          </div>
          <div className="text-xs text-muted-foreground/70 mt-1">
            {formatRupees(analytics.totalAnnual)} annual value
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/50 dark:bg-black/20 rounded-2xl p-3 border border-rose-200/30 dark:border-rose-800/30">
            <div className="flex items-center gap-1.5 mb-1">
              <Users className="h-3 w-3 text-rose-500" />
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground/60">Providers</span>
            </div>
            <div className="font-display text-xl font-bold text-rose-600 dark:text-rose-400">
              {analytics.uniqueProviders}
            </div>
          </div>
          
          <div className="bg-white/50 dark:bg-black/20 rounded-2xl p-3 border border-rose-200/30 dark:border-rose-800/30">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="h-3 w-3 text-rose-500" />
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground/60">Items</span>
            </div>
            <div className="font-display text-xl font-bold text-rose-600 dark:text-rose-400">
              {analytics.expensesCount}
            </div>
          </div>
          
          <div className="bg-white/50 dark:bg-black/20 rounded-2xl p-3 border border-rose-200/30 dark:border-rose-800/30">
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar className="h-3 w-3 text-rose-500" />
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground/60">Due</span>
            </div>
            <div className="font-display text-xl font-bold text-rose-600 dark:text-rose-400">
              {analytics.upcomingDeadlines[0]?.dueDate.split(" ")[0] || "-"}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}