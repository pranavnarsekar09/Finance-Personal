import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";
import type { ScoreItem } from "../types";
import { MiniRadial } from "./RadialScore";

interface CompositeScoreSectionProps {
  scores: ScoreItem[];
}

const scoreColors = {
  money: { bg: "from-emerald-500/20", border: "border-emerald-500/30", text: "text-emerald-500", label: "Money" },
  nutrition: { bg: "from-orange-500/20", border: "border-orange-500/30", text: "text-orange-500", label: "Nutrition" },
  discipline: { bg: "from-rose-500/20", border: "border-rose-500/30", text: "text-rose-500", label: "Discipline" },
  stability: { bg: "from-blue-500/20", border: "border-blue-500/30", text: "text-blue-500", label: "Stability" },
  consistency: { bg: "from-violet-500/20", border: "border-violet-500/30", text: "text-violet-500", label: "Consistency" },
};

export function CompositeScoreSection({ scores }: CompositeScoreSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground font-bold">Score Breakdown</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {scores.map((score, index) => {
          const colors = scoreColors[score.name];
          const TrendIcon = score.trend === "up" ? TrendingUp : score.trend === "down" ? TrendingDown : Minus;
          const trendColor = score.trend === "up" ? "text-mint" : score.trend === "down" ? "text-coral" : "text-muted-foreground";
          
          return (
            <motion.div
              key={score.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.08 }}
              className={`bg-gradient-to-br ${colors.bg} to-transparent rounded-[1.5rem] p-4 border ${colors.border}`}
            >
              <MiniRadial 
                value={score.value} 
                size={55} 
                label={colors.label}
                trend={score.trend}
              />
              
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <TrendIcon className={`h-3 w-3 ${trendColor}`} />
                  <span className={`text-[10px] font-medium ${trendColor}`}>
                    {Math.abs(score.changePercent)}%
                  </span>
                </div>
              </div>
              
              <p className="text-[9px] text-muted-foreground mt-2 line-clamp-2">
                {score.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}