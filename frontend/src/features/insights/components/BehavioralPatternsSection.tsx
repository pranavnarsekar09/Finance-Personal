import { motion } from "framer-motion";
import { 
  Brain, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Target,
  Clock,
  Zap
} from "lucide-react";
import type { DayPattern, BehavioralPattern } from "../types";

interface BehavioralPatternsSectionProps {
  dayPatterns: DayPattern[];
  behavioralPatterns: BehavioralPattern[];
}

export function BehavioralPatternsSection({ dayPatterns, behavioralPatterns }: BehavioralPatternsSectionProps) {
  const maxSpending = Math.max(...dayPatterns.map(p => p.spendingAmount), 1);
  const maxMeals = Math.max(...dayPatterns.map(p => p.mealCount), 1);
  const maxCalories = Math.max(...dayPatterns.map(p => p.avgCalories), 1);
  const maxDiscipline = Math.max(...dayPatterns.map(p => p.disciplineScore), 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <Brain className="h-4 w-4 text-primary" />
        <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground font-bold">Behavioral Patterns</span>
      </div>

      {/* Week Heatmap */}
      <div className="bg-card rounded-[1.5rem] shadow-soft p-4 border border-border/30">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Week Heatmap</span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {dayPatterns.map((day, index) => {
            const spendingIntensity = day.spendingAmount > 0 ? (day.spendingAmount / maxSpending) : 0;
            const mealIntensity = day.mealCount / maxMeals;
            const disciplineIntensity = day.disciplineScore / maxDiscipline;
            
            const isBestDay = day.isBestDay;
            const isWorstDay = day.isWorstDay;
            
            return (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`relative rounded-xl p-2 text-center transition-all ${
                  isBestDay 
                    ? "bg-mint/20 border border-mint/30" 
                    : isWorstDay 
                      ? "bg-coral/20 border border-coral/30"
                      : "bg-secondary/30"
                }`}
              >
                <div className="text-[10px] font-medium text-muted-foreground mb-2">{day.day}</div>
                
                <div className="space-y-1">
                  {/* Spending bar */}
                  <div className="h-8 relative bg-background/50 rounded overflow-hidden">
                    <motion.div 
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-coral/60 to-coral/30"
                      initial={{ height: 0 }}
                      animate={{ height: `${spendingIntensity * 100}%` }}
                      transition={{ delay: index * 0.05 + 0.2 }}
                    />
                    <div className="absolute inset-0 flex items-end justify-center pb-0.5">
                      <span className="text-[8px] text-muted-foreground">
                        {day.spendingAmount > 0 ? `₹${day.spendingAmount}` : "-"}
                      </span>
                    </div>
                  </div>
                  
                  {/* Meals indicator */}
                  <div className="flex justify-center gap-0.5">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div 
                        key={i}
                        className={`h-1.5 w-1.5 rounded-full ${
                          i < day.mealCount 
                            ? "bg-mint" 
                            : "bg-secondary"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {isBestDay && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-mint rounded-full flex items-center justify-center">
                    <Zap className="h-1.5 w-1.5 text-primary" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="flex justify-between mt-3 text-[9px] text-muted-foreground px-1">
          <span>Low Spending</span>
          <span>High Spending</span>
        </div>
      </div>

      {/* Pattern Cards */}
      <div className="space-y-3">
        {behavioralPatterns.map((pattern, index) => {
          const Icon = pattern.type === "best-day" 
            ? Target 
            : pattern.type === "worst-day" 
              ? TrendingDown 
              : pattern.type === "spending-consistency"
                ? Clock
                : pattern.type === "streak-recovery"
                  ? Zap
                  : Brain;
          
          const isPositive = pattern.type === "best-day" || pattern.type === "streak-recovery";
          
          return (
            <motion.div
              key={pattern.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-[1.25rem] p-4 border ${
                isPositive 
                  ? "bg-mint/10 border-mint/20" 
                  : "bg-card border-border/30"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
                  isPositive ? "bg-mint/20" : "bg-secondary/50"
                }`}>
                  <Icon className={`h-4 w-4 ${isPositive ? "text-mint" : "text-muted-foreground"}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{pattern.title}</p>
                  <p className="font-semibold text-sm mt-0.5">{pattern.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{pattern.description}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}