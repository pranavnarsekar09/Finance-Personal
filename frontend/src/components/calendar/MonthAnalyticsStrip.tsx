import { formatRupees } from "@/lib/utils";
import { Calendar, Utensils, Target, Zap } from "lucide-react";

interface MonthAnalyticsStripProps {
  analytics: any;
}

export function MonthAnalyticsStrip({ analytics }: MonthAnalyticsStripProps) {
  const stats = [
    {
      icon: <Zap className="h-3.5 w-3.5" />,
      label: "Total",
      value: formatRupees(analytics?.totalSpent || 0),
      color: "text-coral",
      bg: "bg-coral/10",
    },
    {
      icon: <Calendar className="h-3.5 w-3.5" />,
      label: "Daily Avg",
      value: formatRupees(analytics?.averagePerDay || 0),
      color: "text-muted-foreground",
      bg: "bg-secondary/60",
    },
    {
      icon: <Utensils className="h-3.5 w-3.5" />,
      label: "Meals",
      value: (analytics?.totalMeals || 0).toString(),
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
    },
    {
      icon: <Target className="h-3.5 w-3.5" />,
      label: "Active",
      value: `${analytics?.activeDays || 0} days`,
      color: "text-mint",
      bg: "bg-mint/10",
    },
  ];

  return (
    <div className="bg-card rounded-[1.75rem] shadow-soft p-4 border border-primary/5 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
          Month Overview
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {stats.map((stat, i) => (
          <div key={i} className="text-center">
            <div className={`h-8 w-8 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-1.5 text-muted-foreground`}>
              {stat.icon}
            </div>
            <div className={`font-semibold text-xs ${stat.color}`}>{stat.value}</div>
            <div className="text-[9px] text-muted-foreground/70">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}