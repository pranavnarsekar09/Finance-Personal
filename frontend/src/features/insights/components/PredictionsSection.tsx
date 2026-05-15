import { motion } from "framer-motion";
import { Target, Clock, Calendar, Sparkles } from "lucide-react";
import type { Prediction } from "../types";

interface PredictionsSectionProps {
  predictions: Prediction[];
}

const typeIcons = {
  "budget-survival": Clock,
  "semester-runway": Calendar,
  "savings-goal": Target,
  "nutrition-projection": Target,
  "overspending-risk": Sparkles,
  "behavior-forecast": Sparkles,
  "trend-forecast": Sparkles,
};

export function PredictionsSection({ predictions }: PredictionsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground font-bold">AI Predictions</span>
      </div>

      <div className="space-y-3">
        {predictions.map((prediction, index) => {
          const Icon = typeIcons[prediction.type] || Sparkles;
          
          return (
            <motion.div
              key={prediction.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-[1.75rem] shadow-soft p-4 border border-white/60"
            >
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-full bg-secondary/50 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{prediction.title}</p>
                  <p className="text-sm font-medium mt-1.5 text-foreground leading-relaxed">{prediction.value}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/20">
                <div className="h-1.5 w-8 rounded-full bg-mint" />
                <span className="text-[10px] text-muted-foreground">{prediction.timeframe}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}