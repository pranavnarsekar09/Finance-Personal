import { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus, Zap, Shield, IndianRupee } from "lucide-react";
import { formatRupees } from "@/lib/utils";
import { Income } from "@/lib/types";
import {
  calculateIncomeAnalytics,
  getHealthStatus,
  getStabilityLabel,
} from "./incomeUtils";

interface IncomeSummaryCardProps {
  incomes: Income[];
  isLoading?: boolean;
}

export function IncomeSummaryCard({ incomes, isLoading = false }: IncomeSummaryCardProps) {
  const analytics = useMemo(() => calculateIncomeAnalytics(incomes), [incomes]);

  const health = getHealthStatus((analytics.stabilityScore + analytics.consistencyScore) / 2);
  const stability = getStabilityLabel(analytics.stabilityScore);

  if (isLoading) {
    return (
      <div className="relative overflow-hidden bg-card rounded-[2.5rem] shadow-soft p-6 mb-6 border border-primary/5">
        <div className="absolute -top-12 -right-12 h-40 w-40 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 -left-12 h-40 w-40 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="h-3 w-24 bg-secondary rounded animate-pulse" />
              <div className="h-10 w-40 bg-secondary rounded animate-pulse" />
            </div>
            <div className="h-12 w-12 bg-secondary rounded-2xl animate-pulse" />
          </div>
          <div className="mt-6 h-16 bg-secondary/50 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-card rounded-[2.5rem] shadow-soft p-6 mb-6 border border-primary/5">
      <div className="absolute -top-12 -right-12 h-40 w-40 bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-12 -left-12 h-40 w-40 bg-primary/5 rounded-full blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-5">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-10 w-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
                  Total Received
                </div>
                <div className="font-display text-3xl font-bold text-emerald-600">
                  {formatRupees(analytics.totalReceived)}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${analytics.monthlyGrowth >= 0 ? "bg-emerald-500/10" : "bg-coral/10"}`}>
              {analytics.monthlyGrowth > 0 ? (
                <TrendingUp className="h-3 w-3 text-emerald-600" />
              ) : analytics.monthlyGrowth < 0 ? (
                <TrendingDown className="h-3 w-3 text-coral" />
              ) : (
                <Minus className="h-3 w-3 text-muted-foreground" />
              )}
              <span className={`text-[10px] font-bold uppercase tracking-wider ${analytics.monthlyGrowth >= 0 ? "text-emerald-600" : "text-coral"}`}>
                {analytics.monthlyGrowth >= 0 ? "+" : ""}{analytics.monthlyGrowth}% this month
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`h-2 w-2 rounded-full ${health.bgColor}`} />
              <span className="text-[10px] text-muted-foreground font-medium">
                {health.label} income health
              </span>
            </div>
          </div>
        </div>

        <div className="h-px bg-border/30 mb-5" />

        <div className="grid grid-cols-3 gap-4 mb-5">
          <StatItem
            icon={<IndianRupee className="h-3.5 w-3.5" />}
            label="Avg Transaction"
            value={formatRupees(analytics.averageTransaction)}
          />
          <StatItem
            icon={<Zap className="h-3.5 w-3.5" />}
            label="Recurring"
            value={`${analytics.recurringPercentage}%`}
            subValue={`${analytics.recurringCount} transactions`}
          />
          <StatItem
            icon={<Shield className="h-3.5 w-3.5" />}
            label="Stability"
            value={stability.label}
            subValue={stability.description}
          />
        </div>

        {analytics.topSource && (
          <div className="bg-secondary/30 rounded-2xl p-4 mb-5 border border-border/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <IndianRupee className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-0.5">
                    Primary Source
                  </div>
                  <div className="font-semibold text-sm">{analytics.topSource}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-display font-bold text-emerald-600">
                  {Math.round(analytics.topSourcePercentage)}%
                </div>
                <div className="text-[10px] text-muted-foreground">of total</div>
              </div>
            </div>
          </div>
        )}

        
      </div>
    </div>
  );
}

function StatItem({
  icon,
  label,
  value,
  subValue,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
}) {
  return (
    <div className="text-center">
      <div className="h-7 w-7 bg-secondary/60 rounded-xl flex items-center justify-center mx-auto mb-2 text-muted-foreground">
        {icon}
      </div>
      <div className="font-semibold text-sm text-foreground">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
      {subValue && <div className="text-[9px] text-muted-foreground/70 mt-0.5">{subValue}</div>}
    </div>
  );
}