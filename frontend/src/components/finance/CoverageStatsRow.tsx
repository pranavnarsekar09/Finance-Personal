import { motion } from "framer-motion";
import { TrendingDown, CalendarCheck, Shield, Clock } from "lucide-react";
import { formatRupees } from "@/lib/utils";
import type { CoverageAnalytics } from "./coverageUtils";

interface CoverageStatsRowProps {
  analytics: CoverageAnalytics;
  monthlySpent?: number;
}

export function CoverageStatsRow({ analytics, monthlySpent = 0 }: CoverageStatsRowProps) {
  const totalBudget = monthlySpent + analytics.monthlyTotal;
  const burdenPercentage = totalBudget > 0 
    ? Math.round((analytics.monthlyTotal / totalBudget) * 100) 
    : 0;

  const stats = [
    {
      icon: TrendingDown,
      label: "Burden reduced",
      value: `${burdenPercentage}%`,
      sublabel: "of monthly total",
      color: "text-mint",
      bgColor: "bg-mint/10",
    },
    {
      icon: CalendarCheck,
      label: "Monthly equivalent",
      value: formatRupees(analytics.monthlyTotal),
      sublabel: "support value",
      color: "text-rose-500",
      bgColor: "bg-rose-100/60 dark:bg-rose-900/30",
    },
    {
      icon: Shield,
      label: "Stability",
      value: `${analytics.stabilityScore}%`,
      sublabel: "support score",
      color: "text-emerald-500",
      bgColor: "bg-emerald-100/60 dark:bg-emerald-900/30",
    },
    {
      icon: Clock,
      label: "Due soon",
      value: analytics.upcomingDeadlines[0]?.dueDate.split(" ")[0] || "-",
      sublabel: analytics.upcomingDeadlines[0] ? `${analytics.upcomingDeadlines[0].daysUntil}d left` : "No upcoming",
      color: "text-amber-500",
      bgColor: "bg-amber-100/60 dark:bg-amber-900/30",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`${stat.bgColor} rounded-2xl p-3 border border-transparent dark:border-white/5`}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <Icon className={`h-3 w-3 ${stat.color}`} />
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70 truncate">
                {stat.label}
              </span>
            </div>
            <div className={`font-display text-lg font-bold ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-[10px] text-muted-foreground/60 mt-0.5 truncate">
              {stat.sublabel}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}