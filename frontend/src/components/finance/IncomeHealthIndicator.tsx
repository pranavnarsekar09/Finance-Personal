import { motion } from "framer-motion";
import { Shield, Activity, Clock } from "lucide-react";

interface IncomeHealthIndicatorProps {
  stabilityScore: number;
  consistencyScore: number;
  volatilityScore: number;
}

export function IncomeHealthIndicator({
  stabilityScore,
  consistencyScore,
  volatilityScore,
}: IncomeHealthIndicatorProps) {
  const overallScore = Math.round((stabilityScore + consistencyScore + volatilityScore) / 3);

  const getHealthLevel = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "emerald", bg: "bg-emerald-500" };
    if (score >= 60) return { label: "Good", color: "mint", bg: "bg-mint" };
    if (score >= 40) return { label: "Fair", color: "sun", bg: "bg-sun" };
    return { label: "Needs attention", color: "coral", bg: "bg-coral" };
  };

  const overall = getHealthLevel(overallScore);

  const metrics = [
    { label: "Stability", score: stabilityScore, icon: Shield },
    { label: "Consistency", score: consistencyScore, icon: Activity },
    { label: "Predictability", score: volatilityScore, icon: Clock },
  ];

  return (
    <div className="bg-card rounded-[1.75rem] shadow-soft p-5 mb-6 border border-primary/5">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-6 w-6 bg-emerald-500/15 rounded-lg flex items-center justify-center">
          <Shield className="h-3.5 w-3.5 text-emerald-600" />
        </div>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
          Income Health
        </span>
      </div>

      <div className="flex items-center gap-4 mb-5">
        <div className="relative h-16 w-16">
          <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="hsl(var(--secondary))"
              strokeWidth="6"
            />
            <motion.circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke={overall.color === "emerald" ? "hsl(160 45% 45%)" : overall.color === "mint" ? "hsl(145 45% 60%)" : overall.color === "sun" ? "hsl(42 90% 60%)" : "hsl(8 80% 65%)"}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 28}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - overallScore / 100) }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-lg font-bold">{overallScore}</span>
          </div>
        </div>

        <div className="flex-1">
          <div className="font-semibold text-sm">Income Health</div>
          <div className={`text-xs font-medium ${overall.color === "emerald" ? "text-emerald-600" : overall.color === "mint" ? "text-emerald-500" : overall.color === "sun" ? "text-amber-600" : "text-coral"}`}>
            {overall.label}
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">
            Based on stability, consistency & predictability
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {metrics.map((metric) => {
          const level = getHealthLevel(metric.score);
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="bg-secondary/30 rounded-xl p-3 text-center border border-border/15">
              <div className={`h-7 w-7 rounded-lg ${level.bg}/10 mx-auto mb-2 flex items-center justify-center`}>
                <Icon className={`h-4 w-4 ${level.color === "emerald" ? "text-emerald-600" : level.color === "mint" ? "text-emerald-500" : level.color === "sun" ? "text-amber-600" : "text-coral"}`} />
              </div>
              <div className="font-display font-bold text-lg">{metric.score}</div>
              <div className="text-[9px] text-muted-foreground font-medium">{metric.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}