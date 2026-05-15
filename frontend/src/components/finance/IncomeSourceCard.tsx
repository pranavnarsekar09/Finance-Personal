import { TrendingUp, TrendingDown, Minus, Banknote, RefreshCw, Clock, Zap } from "lucide-react";
import { formatRupees } from "@/lib/utils";
import { SourceAnalytics } from "./incomeUtils";
import { motion } from "framer-motion";

interface IncomeSourceCardProps {
  source: SourceAnalytics;
  totalReceived: number;
  index: number;
}

export function IncomeSourceCard({ source, totalReceived, index }: IncomeSourceCardProps) {
  const percentage = totalReceived > 0 ? Math.round((source.total / totalReceived) * 100) : 0;

  const TrendIcon = source.trend === "up" ? TrendingUp : source.trend === "down" ? TrendingDown : Minus;
  const trendColor = source.trend === "up" ? "text-emerald-600" : source.trend === "down" ? "text-coral" : "text-muted-foreground";

  const consistencyConfig = {
    high: { label: "Highly consistent", color: "text-emerald-600", bg: "bg-emerald-500/10" },
    medium: { label: "Moderately consistent", color: "text-sun", bg: "bg-sun/10" },
    low: { label: "Variable amounts", color: "text-coral", bg: "bg-coral/10" },
  };
  const consistency = consistencyConfig[source.consistency];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-card rounded-3xl p-5 border border-primary/5 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-secondary/60 rounded-2xl flex items-center justify-center">
            <Banknote className="h-5.5 w-5.5 text-primary/70" />
          </div>
          <div>
            <div className="font-bold text-sm flex items-center gap-2">
              {source.name}
              {source.isRecurring && (
                <span className="h-5 w-5 bg-mint/20 rounded-full flex items-center justify-center" title="Recurring income">
                  <RefreshCw className="h-3 w-3 text-mint" />
                </span>
              )}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {source.frequency} · {source.count} {source.count === 1 ? "transaction" : "transactions"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`h-6 w-6 rounded-lg ${source.trend !== "stable" ? consistency.bg : ""} flex items-center justify-center`}>
            <TrendIcon className={`h-4 w-4 ${trendColor}`} />
          </div>
          <div className="text-right">
            <div className="font-display font-bold text-emerald-600">{formatRupees(source.total)}</div>
            <div className="text-[10px] text-muted-foreground font-medium">{percentage}% of total</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MetadataTag
          icon={<Clock className="h-3 w-3" />}
          label={source.stabilityLabel}
          variant="default"
        />
        <MetadataTag
          icon={<Zap className="h-3 w-3" />}
          label={consistency.label}
          variant={source.consistency === "high" ? "success" : source.consistency === "medium" ? "warning" : "subtle"}
        />
      </div>

      <div className="mt-4 bg-secondary/20 rounded-xl p-3 border border-border/15">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-mint" />
            <span className="text-[10px] text-muted-foreground font-medium">Average per transaction</span>
          </div>
          <span className="text-xs font-semibold">{formatRupees(source.averageAmount)}</span>
        </div>
      </div>
    </motion.div>
  );
}

function MetadataTag({
  icon,
  label,
  variant = "default",
}: {
  icon: React.ReactNode;
  label: string;
  variant?: "default" | "success" | "warning" | "subtle";
}) {
  const variants = {
    default: "bg-secondary/40 text-muted-foreground",
    success: "bg-emerald-500/10 text-emerald-600",
    warning: "bg-sun/10 text-amber-600",
    subtle: "bg-coral/5 text-coral",
  };

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${variants[variant]}`}>
      <span className="opacity-60">{icon}</span>
      <span className="text-[10px] font-medium truncate">{label}</span>
    </div>
  );
}