import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, Shield, TrendingUp, Users, CalendarClock } from "lucide-react";
import type { CoverageInsight } from "./coverageUtils";

interface CoverageInsightStripProps {
  insights: CoverageInsight[];
}

const iconMap: Record<CoverageInsight["type"], typeof Sparkles> = {
  burden: Shield,
  support: Heart,
  stability: TrendingUp,
  education: TrendingUp,
  family: Users,
};

const colorMap: Record<CoverageInsight["type"], string> = {
  burden: "from-rose-500/20 to-orange-500/20",
  support: "from-rose-500/20 to-pink-500/20",
  stability: "from-mint/20 to-emerald-500/20",
  education: "from-violet-500/20 to-indigo-500/20",
  family: "from-amber-500/20 to-orange-500/20",
};

export function CoverageInsightStrip({ insights }: CoverageInsightStripProps) {
  if (insights.length === 0) return null;

  const currentInsight = insights[0];
  const Icon = iconMap[currentInsight.type];
  const gradient = colorMap[currentInsight.type];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentInsight.headline}
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 8 }}
        transition={{ duration: 0.3 }}
        className={`relative overflow-hidden bg-gradient-to-r ${gradient} rounded-2xl p-4 border border-rose-200/30 dark:border-rose-800/30`}
      >
        <div className="absolute -top-4 -right-4 h-16 w-16 bg-rose-300/15 rounded-full blur-2xl" />
        
        <div className="relative z-10 flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-white/60 dark:bg-black/20 flex items-center justify-center shrink-0 border border-rose-200/30 dark:border-rose-800/30">
            <Icon className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-3 w-3 text-rose-500" />
              <span className="text-[9px] uppercase tracking-wider font-semibold text-rose-500/80">
                Support Insight
              </span>
            </div>
            <h4 className="font-display text-sm font-semibold text-foreground leading-snug">
              {currentInsight.headline}
            </h4>
            <p className="text-[11px] text-muted-foreground/70 mt-1 line-clamp-2">
              {currentInsight.summary}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}