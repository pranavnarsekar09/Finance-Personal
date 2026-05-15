import { motion } from "framer-motion";
import { 
  Utensils, 
  TrendingUp, 
  TrendingDown,
  Target,
  Activity,
  Apple,
  Scale,
  ClipboardList
} from "lucide-react";
import type { HealthInsight } from "../types";

interface HealthIntelligenceSectionProps {
  insights: HealthInsight[];
}

const typeIcons = {
  consistency: ClipboardList,
  "protein-trend": Target,
  "meal-quality": Utensils,
  "macro-balance": Scale,
  "calorie-adherence": Activity,
  "food-cost-correlation": Apple,
  "nutrition-risk": AlertTriangle,
  "logging-consistency": ClipboardList,
};

const severityColors = {
  success: { bg: "bg-mint/10", border: "border-mint/20", icon: "text-mint", value: "text-mint" },
  warning: { bg: "bg-amber-500/10", border: "border-amber-500/20", icon: "text-amber-600", value: "text-amber-600" },
  critical: { bg: "bg-coral/10", border: "border-coral/20", icon: "text-coral", value: "text-coral" },
  neutral: { bg: "bg-secondary/50", border: "border-border/30", icon: "text-muted-foreground", value: "text-foreground" },
};

function AlertTriangle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export function HealthIntelligenceSection({ insights }: HealthIntelligenceSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <Utensils className="h-4 w-4 text-primary" />
        <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground font-bold">Health Intelligence</span>
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