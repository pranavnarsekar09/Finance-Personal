import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Clock, Target, Activity, Shield, Zap } from "lucide-react";
import { formatRupees } from "@/lib/utils";
import { FinancialHealth, SpendingPace, TrendAnalysis } from "./financialUtils";

interface FinancialHeroCardProps {
  remaining: number;
  totalSpent: number;
  monthlyBudget: number;
  health: FinancialHealth;
  pace: SpendingPace;
  trend: TrendAnalysis;
}

export function FinancialHeroCard({
  remaining,
  totalSpent,
  monthlyBudget,
  health,
  pace,
  trend,
}: FinancialHeroCardProps) {
  const budgetPercentage = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;
  const isOverBudget = totalSpent > monthlyBudget;
  
  const statusColor = health.status === "excellent" ? "text-mint" :
    health.status === "good" ? "text-sky" :
    health.status === "fair" ? "text-sun" : "text-coral";

  const trendIcon = trend.isTrendingUp ? TrendingUp : trend.isTrendingDown ? TrendingDown : Minus;
  const trendColor = trend.isTrendingUp ? "text-coral" : trend.isTrendingDown ? "text-mint" : "text-muted-foreground";
  const trendBg = trend.isTrendingUp ? "bg-coral/10" : trend.isTrendingDown ? "bg-mint/10" : "bg-secondary";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden"
    >
      <div className="bg-gradient-to-br from-surface-dark via-[#1a3a2e] to-[#0f2420] rounded-[2rem] shadow-float p-6 text-primary-foreground border border-white/5">
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-mint/15 blur-3xl" />
        
        <div className="relative">
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-1">
              <div className="text-[10px] uppercase tracking-[0.25em] text-mint/70">Available Balance</div>
              <div className="font-display text-4xl font-bold tracking-tight">{formatRupees(remaining)}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60">Financial Status</div>
              <div className={`text-sm font-medium mt-1 capitalize ${statusColor}`}>
                {health.status === "needs-attention" ? "Needs Attention" : health.status}
              </div>
            </div>
          </div>

          <div className="h-2.5 bg-white/10 rounded-full overflow-hidden mb-3">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(budgetPercentage, 100)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full ${isOverBudget ? "bg-gradient-to-r from-coral to-red-400" : "bg-gradient-to-r from-mint to-emerald-400"}`}
            />
          </div>
          
          <div className="flex justify-between items-center text-[10px] text-muted-foreground/60 mb-6">
            <span>{Math.round(budgetPercentage)}% used</span>
            <span>{Math.round(100 - budgetPercentage)}% remaining</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-lg bg-mint/10 flex items-center justify-center">
                  <Target className="h-3 w-3 text-mint" />
                </div>
                <span className="text-[10px] text-muted-foreground/70">Monthly Budget</span>
              </div>
              <div className="font-display text-lg font-bold">{formatRupees(monthlyBudget)}</div>
              <div className="text-[10px] text-muted-foreground/60">
                Spent {formatRupees(totalSpent)}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`h-5 w-5 rounded-lg flex items-center justify-center ${trendBg}`}>
                  {trendIcon && <trendIcon className={`h-3 w-3 ${trendColor}`} />}
                </div>
                <span className="text-[10px] text-muted-foreground/70">Weekly Trend</span>
              </div>
              <div className={`font-display text-lg font-bold ${trendColor}`}>
                {trend.weeklyComparison > 0 ? "+" : ""}{trend.weeklyComparison}%
              </div>
              <div className="text-[10px] text-muted-foreground/60">
                {trend.isTrendingDown ? "Lower than last week" : trend.isTrendingUp ? "Higher than last week" : "Stable"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-3 px-1">
        <div className="flex-1 bg-card rounded-xl p-3 border border-border/20">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-3 w-3 text-muted-foreground" />
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Pacing</span>
          </div>
          <div className={`text-sm font-medium capitalize ${
            pace.status === "ahead" ? "text-coral" : 
            pace.status === "behind" ? "text-mint" : "text-foreground"
          }`}>
            {pace.status === "on-track" ? "On Track" : pace.status}
          </div>
          <div className="text-[9px] text-muted-foreground mt-0.5">
            {pace.daysRemaining} days left
          </div>
        </div>

        {pace.runway !== null && (
          <div className="flex-1 bg-card rounded-xl p-3 border border-border/20">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Runway</span>
            </div>
            <div className="text-sm font-medium text-foreground">
              {pace.runway} days
            </div>
            <div className="text-[9px] text-muted-foreground mt-0.5">
              {pace.runway < 10 ? "Limited remaining" : "Healthy buffer"}
            </div>
          </div>
        )}

        <div className="flex-1 bg-card rounded-xl p-3 border border-border/20">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-3 w-3 text-muted-foreground" />
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Risk</span>
          </div>
          <div className={`text-sm font-medium capitalize ${
            health.overspendingRisk === "high" ? "text-coral" :
            health.overspendingRisk === "medium" ? "text-sun" : "text-mint"
          }`}>
            {health.overspendingRisk === "low" ? "Low" : health.overspendingRisk}
          </div>
          <div className="text-[9px] text-muted-foreground mt-0.5">
            {health.overspendingRisk === "high" ? "Monitor closely" : "Within range"}
          </div>
        </div>
      </div>
    </motion.div>
  );
}