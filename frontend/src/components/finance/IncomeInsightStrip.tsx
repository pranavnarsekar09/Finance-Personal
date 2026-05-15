import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, PieChart, RefreshCw, AlertCircle, CheckCircle, Lightbulb } from "lucide-react";
import { IncomeInsight } from "./incomeUtils";

interface IncomeInsightStripProps {
  insights: IncomeInsight[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  TrendingUp,
  TrendingDown,
  Minus,
  PieChart,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Lightbulb,
};

const typeConfig: Record<string, { bg: string; border: string; iconBg: string; iconColor: string }> = {
  growth: { bg: "bg-emerald-500/5", border: "border-emerald-500/20", iconBg: "bg-emerald-500/15", iconColor: "text-emerald-600" },
  stability: { bg: "bg-sky/5", border: "border-sky/20", iconBg: "bg-sky/15", iconColor: "text-sky" },
  diversity: { bg: "bg-lavender/5", border: "border-lavender/20", iconBg: "bg-lavender/15", iconColor: "text-purple-500" },
  trend: { bg: "bg-sun/5", border: "border-sun/20", iconBg: "bg-sun/15", iconColor: "text-amber-600" },
  health: { bg: "bg-mint/5", border: "border-mint/20", iconBg: "bg-mint/15", iconColor: "text-emerald-600" },
};

export function IncomeInsightStrip({ insights }: IncomeInsightStripProps) {
  if (!insights || insights.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mb-6 space-y-2"
    >
      {insights.map((insight, index) => {
        const Icon = iconMap[insight.icon] || Lightbulb;
        const config = typeConfig[insight.type] || typeConfig.stability;

        return (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${config.bg} border ${config.border}`}
          >
            <div className={`h-8 w-8 rounded-xl ${config.iconBg} flex items-center justify-center shrink-0`}>
              <Icon className={`h-4 w-4 ${config.iconColor}`} />
            </div>
            <p className="text-sm font-medium text-foreground/90 flex-1">
              {insight.headline}
            </p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export function IncomeInsightCard({ insights }: { insights: IncomeInsight[] }) {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="bg-card rounded-[1.75rem] shadow-soft p-5 mb-6 border border-primary/5">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-6 w-6 bg-lavender/20 rounded-lg flex items-center justify-center">
          <Lightbulb className="h-3.5 w-3.5 text-purple-500" />
        </div>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
          Income Intelligence
        </span>
      </div>
      <div className="space-y-3">
        {insights.map((insight, index) => {
          const Icon = iconMap[insight.icon] || Lightbulb;
          const config = typeConfig[insight.type] || typeConfig.stability;

          return (
            <div
              key={insight.id}
              className={`flex items-center gap-3 p-3 rounded-xl ${config.bg} border ${config.border}`}
            >
              <div className={`h-7 w-7 rounded-lg ${config.iconBg} flex items-center justify-center shrink-0`}>
                <Icon className={`h-3.5 w-3.5 ${config.iconColor}`} />
              </div>
              <p className="text-xs font-medium text-foreground/90">
                {insight.headline}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}