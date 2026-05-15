import { motion } from "framer-motion";
import { Brain, TrendingUp, TrendingDown, Minus, Leaf } from "lucide-react";
import { format } from "date-fns";
import type { ScoreItem, SystemStatus } from "../types";
import { RadialScore } from "./RadialScore";

interface HeroSectionProps {
  compositeScore: number;
  scores: ScoreItem[];
  systemStatus: SystemStatus[];
}

export function HeroSection({ compositeScore, scores, systemStatus }: HeroSectionProps) {
  const statusColors = {
    stable: "bg-mint/20 text-mint border-mint/30",
    improving: "bg-sun/20 text-amber-600 border-amber-600/30",
    "needs-attention": "bg-coral/20 text-coral border-coral/30",
    critical: "bg-destructive/20 text-destructive border-destructive/30",
  };

  const statusIcons = {
    stable: TrendingUp,
    improving: TrendingUp,
    "needs-attention": TrendingDown,
    critical: Leaf,
  };

  return (
    <div className="bg-gradient-to-br from-surface-dark via-[#1a3a2e] to-[#0f2420] rounded-[2rem] shadow-float p-5 text-primary-foreground overflow-hidden relative border border-white/5">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-mint/20 blur-3xl" />
      <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-coral/10 blur-3xl" />
      
      <div className="flex items-start justify-between gap-4 relative">
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-[0.25em] text-mint/70">
            {format(new Date(), "EEEE, d MMMM")}
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            AI Analysis
          </h1>
          <p className="text-sm text-primary-foreground/70 mt-1 max-w-[20rem]">
            AI-powered behavioral analytics across your finances, nutrition, and habits
          </p>
        </div>
        
        <RadialScore 
          score={compositeScore} 
          size={90} 
          strokeWidth={8}
          icon={Brain}
        />
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {systemStatus.map((status) => {
          const Icon = statusIcons[status.status];
          return (
            <div
              key={status.type}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${statusColors[status.status]} shrink-0`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="text-xs font-medium whitespace-nowrap">{status.label}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex gap-2">
        {scores.slice(0, 3).map((score) => (
          <div key={score.name} className="flex-1 rounded-2xl bg-white/5 px-3 py-3 border border-white/5">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60">{score.label}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-bold text-lg">{score.value}</span>
              <TrendArrow trend={score.trend} change={score.changePercent} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrendArrow({ trend, change }: { trend: "up" | "down" | "flat"; change: number }) {
  const Icon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const colorClass = trend === "up" ? "text-mint" : trend === "down" ? "text-coral" : "text-muted-foreground";
  
  return (
    <div className={`flex items-center gap-0.5 ${colorClass}`}>
      <Icon className="h-3 w-3" />
      <span className="text-[10px] font-medium">{Math.abs(change)}%</span>
    </div>
  );
}