import { motion } from "framer-motion";
import { TrendingUp, Clock, Shield, Zap } from "lucide-react";

type BadgeType = "stable" | "growing" | "new" | "long-term" | "monthly" | "semester" | "yearly";

interface CoverageTrendBadgeProps {
  type: BadgeType;
  showIcon?: boolean;
  size?: "sm" | "md";
}

const badgeConfig: Record<BadgeType, { icon: typeof TrendingUp; label: string; color: string; bg: string }> = {
  stable: { icon: Shield, label: "Stable", color: "text-mint", bg: "bg-mint/10 border-mint/20" },
  growing: { icon: TrendingUp, label: "Growing", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
  "long-term": { icon: Clock, label: "Long-term", color: "text-emerald-600", bg: "bg-emerald-600/10 border-emerald-600/20" },
  new: { icon: Zap, label: "New", color: "text-violet-500", bg: "bg-violet-500/10 border-violet-500/20" },
  monthly: { icon: Clock, label: "Monthly", color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/20" },
  semester: { icon: Clock, label: "6 months", color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/20" },
  yearly: { icon: Clock, label: "Yearly", color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
};

export function CoverageTrendBadge({ type, showIcon = true, size = "sm" }: CoverageTrendBadgeProps) {
  const config = badgeConfig[type];
  const Icon = config.icon;

  const sizeClasses = size === "sm" 
    ? "px-2 py-0.5 text-[10px] gap-1" 
    : "px-2.5 py-1 text-xs gap-1.5";

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`inline-flex items-center rounded-full border font-medium ${sizeClasses} ${config.bg}`}
    >
      {showIcon && <Icon className={`h-3 w-3 ${config.color}`} />}
      <span className={config.color}>{config.label}</span>
    </motion.span>
  );
}