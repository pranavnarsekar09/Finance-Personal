import { Sparkles, TrendingUp } from "lucide-react";
import { useInsight } from "@/hooks/useApi";

export function InsightCard() {
  const { data: insight, isLoading, error } = useInsight();

  if (isLoading) {
    return (
      <div className="bg-card rounded-[1.75rem] shadow-soft p-5 animate-pulse border border-border/30">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-8 w-8 rounded-full bg-secondary" />
          <div className="h-4 w-20 bg-secondary rounded" />
        </div>
        <div className="h-6 bg-secondary rounded w-3/4 mb-4" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-16 bg-secondary rounded-2xl" />
          <div className="h-16 bg-secondary rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error instanceof Error) {
    return (
      <div className="bg-card rounded-[1.75rem] shadow-soft p-5 border border-destructive/30 bg-destructive/5">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-destructive/20 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-destructive" />
          </div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">AI Insight</div>
        </div>
        <p className="text-sm text-muted-foreground mt-3">{error.message}</p>
      </div>
    );
  }

  if (!insight) return null;

  return (
    <div className="bg-card rounded-[1.75rem] shadow-soft p-5 border border-border/30 relative overflow-hidden">
      <div className="absolute -top-8 -right-8 h-20 w-20 bg-mint/20 rounded-full blur-2xl" />
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 rounded-full bg-gradient-mint flex items-center justify-center shadow-md shadow-mint/20">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">AI Insight</span>
      </div>
      <p className="font-display text-xl font-semibold leading-snug relative z-10">{insight.headline}</p>
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-gradient-to-br from-secondary/60 to-secondary/40 rounded-2xl p-3 border border-border/30">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Runway</div>
          <div className="font-display text-lg font-bold mt-1 text-mint">{Math.round(insight.runwayDays)} days</div>
        </div>
        <div className="bg-gradient-to-br from-secondary/60 to-secondary/40 rounded-2xl p-3 border border-border/30">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-emerald-500" /> Top category
          </div>
          <div className="font-display text-lg font-bold mt-1">{insight.topCategory || "Balanced"}</div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mt-4 relative z-10">{insight.summary}</p>
    </div>
  );
}
