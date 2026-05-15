import { motion } from "framer-motion";
import { Shield, TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";
import { FinancialHealth } from "./financialUtils";

interface FinancialHealthIndicatorProps {
  health: FinancialHealth;
}

export function FinancialHealthIndicator({ health }: FinancialHealthIndicatorProps) {
  const scoreColor = health.score >= 80 ? "text-mint" :
    health.score >= 65 ? "text-sky" :
    health.score >= 50 ? "text-sun" : "text-coral";

  const scoreGradient = health.score >= 80 ? "from-mint/20 to-emerald-500/20" :
    health.score >= 65 ? "from-sky/20 to-blue-500/20" :
    health.score >= 50 ? "from-sun/20 to-amber-500/20" : "from-coral/20 to-red-500/20";

  const statusIcon = health.status === "excellent" ? Shield :
    health.status === "good" ? Activity :
    health.status === "fair" ? Minus : TrendingDown;

  const statusBg = health.status === "excellent" ? "bg-mint/10" :
    health.status === "good" ? "bg-sky/10" :
    health.status === "fair" ? "bg-sun/10" : "bg-coral/10";

  const statusColor = health.status === "excellent" ? "text-mint" :
    health.status === "good" ? "text-sky" :
    health.status === "fair" ? "text-sun" : "text-coral";

  const statusLabel = health.status === "needs-attention" ? "Needs Attention" : health.status;

  const stabilityIcon = health.stability === "improving" ? TrendingUp :
    health.stability === "declining" ? TrendingDown : Minus;

  const stabilityColor = health.stability === "improving" ? "text-mint" :
    health.stability === "declining" ? "text-coral" : "text-muted-foreground";

  const budgetColor = health.budgetHealth === "on-track" ? "text-mint" :
    health.budgetHealth === "warning" ? "text-sun" : "text-coral";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-[1.5rem] shadow-soft p-5 border border-border/30"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`h-8 w-8 rounded-xl bg-gradient-to-br ${scoreGradient} flex items-center justify-center`}>
            <Shield className={`h-4 w-4 ${scoreColor}`} />
          </div>
          <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-bold">
            Financial Health
          </span>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${statusBg}`}>
          {statusIcon && <statusIcon className={`h-3.5 w-3.5 ${statusColor}`} />}
          <span className={`text-[10px] font-medium ${statusColor} capitalize`}>
            {statusLabel}
          </span>
        </div>
      </div>

      <div className="flex items-end gap-3 mb-4">
        <div className={`font-display text-4xl font-bold tracking-tight ${scoreColor}`}>
          {health.score}
        </div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          / 100
        </div>
      </div>

      <div className="h-2 bg-secondary rounded-full overflow-hidden mb-5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${health.score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full bg-gradient-to-r ${health.score >= 80 ? "from-mint to-emerald-400" : health.score >= 50 ? "from-sun to-amber-400" : "from-coral to-red-400"}`}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-2 rounded-xl bg-secondary/50">
          <div className="text-[9px] text-muted-foreground mb-1">Stability</div>
          <div className="flex items-center justify-center gap-1">
            {stabilityIcon && <stabilityIcon className={`h-3 w-3 ${stabilityColor}`} />}
            <span className={`text-xs font-medium capitalize ${stabilityColor}`}>
              {health.stability}
            </span>
          </div>
        </div>

        <div className="text-center p-2 rounded-xl bg-secondary/50">
          <div className="text-[9px] text-muted-foreground mb-1">Budget</div>
          <span className={`text-xs font-medium capitalize ${budgetColor}`}>
            {health.budgetHealth === "on-track" ? "On Track" : health.budgetHealth === "warning" ? "Warning" : "Critical"}
          </span>
        </div>

        <div className="text-center p-2 rounded-xl bg-secondary/50">
          <div className="text-[9px] text-muted-foreground mb-1">Overspend Risk</div>
          <span className={`text-xs font-medium capitalize ${
            health.overspendingRisk === "low" ? "text-mint" :
            health.overspendingRisk === "medium" ? "text-sun" : "text-coral"
          }`}>
            {health.overspendingRisk}
          </span>
        </div>
      </div>
    </motion.div>
  );
}