import { motion } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Target,
  Clock,
  Calendar,
  Sparkles
} from "lucide-react";
import type { Prediction } from "../types";

interface PredictionsSectionProps {
  predictions: Prediction[];
}

const typeIcons = {
  "budget-survival": Clock,
  "semester-runway": Calendar,
  "savings-goal": Target,
  "nutrition-projection": Target,
  "overspending-risk": AlertTriangle,
  "behavior-forecast": Sparkles,
  "trend-forecast": TrendingUp,
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

const confidenceColors = {
  high: { bg: "bg-mint/10", border: "border-mint/20", text: "text-mint" },
  medium: { bg: "bg-sun/10", border: "border-sun/20", text: "text-amber-600" },
  low: { bg: "bg-coral/10", border: "border-coral/20", text: "text-coral" },
};

export function PredictionsSection({ predictions }: PredictionsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground font-bold">AI Predictions</span>
      </div>

      <div className="grid gap-3">
        {predictions.map((prediction, index) => {
          const Icon = typeIcons[prediction.type] || Sparkles;
          const colors = confidenceColors[prediction.confidence];
          const TrendIcon = prediction.trend === "positive" 
            ? TrendingUp 
            : prediction.trend === "negative" 
              ? TrendingDown 
              : Minus;
          const trendColor = prediction.isPositive ? "text-mint" : prediction.trend === "negative" ? "text-coral" : "text-muted-foreground";
          
          return (
            <motion.div
              key={prediction.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${colors.bg} rounded-[1.5rem] p-4 border ${colors.border}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full bg-background/50 flex items-center justify-center ${colors.text}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{prediction.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className={`text-2xl font-bold ${colors.text}`}>{prediction.value}</p>
                      <TrendIcon className={`h-4 w-4 ${trendColor}`} />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/20">
                <div className="flex items-center gap-2">
                  <div className={`h-1.5 w-12 rounded-full ${colors.bg.replace('/10', '')}/${prediction.confidence === 'high' ? 'bg-mint' : prediction.confidence === 'medium' ? 'bg-amber-500' : 'bg-coral'}`} />
                  <span className={`text-[10px] font-medium ${colors.text}`}>{prediction.confidence} confidence</span>
                </div>
                <span className="text-[10px] text-muted-foreground">{prediction.timeframe}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}