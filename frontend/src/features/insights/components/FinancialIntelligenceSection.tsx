import { motion } from "framer-motion";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  PiggyBank, 
  AlertTriangle,
  Shield,
  Calendar,
  Activity,
  BarChart3
} from "lucide-react";
import type { FinancialInsight } from "../types";

interface FinancialIntelligenceSectionProps {
  insights: FinancialInsight[];
}

const typeIcons = {
  "spending-personality": Wallet,
  "burn-rate": Activity,
  "budget-runway": Clock,
  "category-drift": BarChart3,
  "weekday-weekend": Calendar,
  "expense-heatmap": Activity,
  "savings-forecast": PiggyBank,
  "liquidity": Wallet,
  "overspending": AlertTriangle,
  "coverage": Shield,
};

const severityColors = {
  success: { bg: "bg-mint/10", border: "border-mint/20", icon: "text-mint", value: "text-mint" },
  warning: { bg: "bg-amber-500/10", border: "border-amber-500/20", icon: "text-amber-600", value: "text-amber-600" },
  critical: { bg: "bg-coral/10", border: "border-coral/20", icon: "text-coral", value: "text-coral" },
  neutral: { bg: "bg-secondary/50", border: "border-border/30", icon: "text-muted-foreground", value: "text-foreground" },
};

export function FinancialIntelligenceSection({ insights }: FinancialIntelligenceSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <Wallet className="h-4 w-4 text-primary" />
        <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground font-bold">Financial Intelligence</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {insights.map((insight, index) => {
          const Icon = typeIcons[insight.type] || Activity;
          const colors = severityColors[insight.severity || "neutral"];
          const TrendIcon = insight.trend === "up" ? TrendingUp : insight.trend === "down" ? TrendingDown : null;
          
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`${colors.bg} rounded-[1.5rem] p-4 border ${colors.border}`}
            >
              <div className="flex items-start justify-between">
                <div className={`h-8 w-8 rounded-full bg-background/50 flex items-center justify-center ${colors.icon}`}>
                  <Icon className="h-4 w-4" />
                </div>
                {TrendIcon && <TrendIcon className={`h-4 w-4 ${insight.trend === "up" ? "text-mint" : "text-coral"}`} />}
              </div>
              
              <div className="mt-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{insight.title}</p>
                <p className={`text-xl font-bold ${colors.value}`}>{insight.value}</p>
                {insight.subtitle && (
                  <p className="text-[10px] text-muted-foreground mt-1">{insight.subtitle}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}