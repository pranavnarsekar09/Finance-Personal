import { Sparkles, TrendingUp } from "lucide-react";
import { useInsight } from "@/hooks/useApi";

export function InsightCard() {
  const { data: insight, isLoading } = useInsight();

  if (isLoading) {
    return (
      <div className="bg-card rounded-[1.75rem] shadow-soft p-5 animate-pulse">
        <div className="h-8 w-24 bg-secondary rounded mb-3" />
        <div className="h-12 bg-secondary rounded w-full" />
      </div>
    );
  }

  if (!insight) return null;

  return (
    <div className="bg-card rounded-[1.75rem] shadow-soft p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 rounded-full bg-gradient-mint flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">AI Insight</span>
      </div>
      <p className="font-display text-xl font-semibold leading-snug">{insight.headline}</p>
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-secondary/60 rounded-2xl p-3">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Runway</div>
          <div className="font-display text-lg font-bold mt-1">{Math.round(insight.runwayDays)} days</div>
        </div>
        <div className="bg-secondary/60 rounded-2xl p-3">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> Top category
          </div>
          <div className="font-display text-lg font-bold mt-1">{insight.topCategory || "Balanced"}</div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mt-4">{insight.summary}</p>
    </div>
  );
}
