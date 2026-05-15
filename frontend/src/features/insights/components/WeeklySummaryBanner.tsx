import { motion } from "framer-motion";
import { TrendingDown, TrendingUp, Target, Flame, Percent, MessageSquare } from "lucide-react";
import type { WeeklySummary } from "../types";

interface WeeklySummaryBannerProps {
  summaries: WeeklySummary[];
}

const iconMap = {
  "trending-down": TrendingDown,
  "trending-up": TrendingUp,
  target: Target,
  flame: Flame,
  percent: Percent,
};

const typeColors = {
  positive: {
    bg: "bg-mint/10",
    border: "border-mint/20",
    icon: "text-mint",
    text: "text-mint",
  },
  neutral: {
    bg: "bg-secondary/50",
    border: "border-border/30",
    icon: "text-muted-foreground",
    text: "text-muted-foreground",
  },
  warning: {
    bg: "bg-coral/10",
    border: "border-coral/20",
    icon: "text-coral",
    text: "text-coral",
  },
};

export function WeeklySummaryBanner({ summaries }: WeeklySummaryBannerProps) {
  if (summaries.length === 0) {
    return (
      <div className="bg-card rounded-[1.75rem] shadow-soft p-4 border border-border/30">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs uppercase tracking-widest text-muted-foreground">AI Summary</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Not enough data yet to generate weekly insights. Keep logging!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <MessageSquare className="h-4 w-4 text-primary" />
        <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground font-bold">AI Weekly Summary</span>
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {summaries.map((summary, index) => {
          const Icon = iconMap[summary.icon];
          const colors = typeColors[summary.type];
          
          return (
            <motion.div
              key={summary.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`shrink-0 ${colors.bg} rounded-[1.5rem] p-4 border ${colors.border} min-w-[200px] max-w-[280px]`}
            >
              <div className="flex items-start gap-3">
                <div className={`h-10 w-10 rounded-full bg-background/50 flex items-center justify-center ${colors.icon}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className={`text-sm font-medium ${colors.text} leading-snug`}>
                  {summary.message}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}