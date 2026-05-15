import { motion } from "framer-motion";
import { ArrowUpRight, RefreshCw, BarChart3, Target } from "lucide-react";
import { formatRupees } from "@/lib/utils";
import { IncomeAnalytics } from "./incomeUtils";

interface IncomeStatsRowProps {
  analytics: IncomeAnalytics;
}

export function IncomeStatsRow({ analytics }: IncomeStatsRowProps) {
  const stats = [
    {
      label: "Total Received",
      value: formatRupees(analytics.totalReceived),
      icon: ArrowUpRight,
      color: "emerald",
    },
    {
      label: "Avg Transaction",
      value: formatRupees(analytics.averageTransaction),
      icon: BarChart3,
      color: "primary",
    },
    {
      label: "Recurring",
      value: `${analytics.recurringPercentage}%`,
      subValue: `${analytics.recurringCount} txns`,
      icon: RefreshCw,
      color: "mint",
    },
    {
      label: "Projected",
      value: formatRupees(analytics.projectedMonthlyIncome),
      subValue: "per month",
      icon: Target,
      color: "lavender",
    },
  ];

  const colorClasses = {
    emerald: "bg-emerald-500/10 text-emerald-600",
    mint: "bg-mint/15 text-emerald-500",
    primary: "bg-secondary/60 text-primary/70",
    lavender: "bg-lavender/15 text-purple-500",
  };

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-card rounded-[1.5rem] shadow-soft p-4 border border-primary/5"
          >
            <div className={`h-8 w-8 rounded-xl flex items-center justify-center mb-3 ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="font-display text-lg font-bold text-foreground">
              {stat.value}
            </div>
            <div className="text-[10px] text-muted-foreground font-medium mt-0.5">
              {stat.label}
            </div>
            {stat.subValue && (
              <div className="text-[9px] text-muted-foreground/70 mt-0.5">
                {stat.subValue}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}