import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Wallet, Calendar, PiggyBank, Target, Clock, Activity } from "lucide-react";
import { formatRupees } from "@/lib/utils";

interface SmartStatCardProps {
  title: string;
  value: number;
  subtitle?: string;
  context?: string;
  trend?: number;
  trendLabel?: string;
  icon: "wallet" | "calendar" | "piggybank" | "target" | "clock" | "activity";
  variant?: "default" | "success" | "warning" | "danger";
}

const iconMap = {
  wallet: Wallet,
  calendar: Calendar,
  piggybank: PiggyBank,
  target: Target,
  clock: Clock,
  activity: Activity,
};

const variantColors = {
  default: "text-foreground",
  success: "text-mint",
  warning: "text-sun",
  danger: "text-coral",
};

export function SmartStatCard({ 
  title, 
  value, 
  subtitle, 
  context, 
  trend, 
  trendLabel,
  icon, 
  variant = "default" 
}: SmartStatCardProps) {
  const Icon = iconMap[icon];
  const trendIcon = trend === undefined ? null : trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend === undefined ? "" : trend > 0 ? "text-coral" : trend < 0 ? "text-mint" : "text-muted-foreground";
  const trendBg = trend === undefined ? "" : trend > 0 ? "bg-coral/10" : trend < 0 ? "bg-mint/10" : "bg-secondary";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-card rounded-[1.5rem] shadow-soft p-4 border border-border/30 hover:border-border/50 transition-all duration-200"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="h-7 w-7 rounded-lg bg-secondary flex items-center justify-center">
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        </div>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
          {title}
        </span>
      </div>

      <div className={`font-display text-2xl font-bold mb-1 ${variantColors[variant]}`}>
        {formatRupees(value)}
      </div>

      {subtitle && (
        <div className="text-[10px] text-muted-foreground mb-2">
          {subtitle}
        </div>
      )}

      {(context || trend !== undefined) && (
        <div className="flex items-center gap-2">
          {context && (
            <span className="text-[9px] text-muted-foreground/70">
              {context}
            </span>
          )}
          
          {trend !== undefined && trendIcon && (
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${trendBg}`}>
              <trendIcon className={`h-2.5 w-2.5 ${trendColor}`} />
              <span className={`text-[9px] font-medium ${trendColor}`}>
                {trend > 0 ? "+" : ""}{trend}%
              </span>
            </div>
          )}

          {trendLabel && (
            <span className="text-[9px] text-muted-foreground/60">
              {trendLabel}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}

interface SmartStatGridProps {
  dailyLimit: number;
  todaySpent: number;
  todayDifference: number;
  buffer: number;
  savings: number;
  paceStatus: "ahead" | "behind" | "on-track";
}

export function SmartStatGrid({ 
  dailyLimit, 
  todaySpent, 
  todayDifference, 
  buffer, 
  savings,
  paceStatus 
}: SmartStatGridProps) {
  const isOverDailyLimit = todaySpent > dailyLimit;
  const dailyOverPercentage = dailyLimit > 0 ? Math.round(((todaySpent - dailyLimit) / dailyLimit) * 100) : 0;

  return (
    <div className="grid grid-cols-2 gap-3">
      <SmartStatCard
        title="Daily Limit"
        value={dailyLimit}
        subtitle="Budget per day"
        context={isOverDailyLimit ? `${dailyOverPercentage}% over` : undefined}
        trend={isOverDailyLimit ? dailyOverPercentage : undefined}
        icon="wallet"
        variant={isOverDailyLimit ? "warning" : "default"}
      />

      <SmartStatCard
        title="Today"
        value={Math.abs(todayDifference)}
        subtitle={todayDifference >= 0 ? "Under budget" : "Over budget"}
        context={todayDifference >= 0 ? `${formatRupees(todayDifference)} left` : `${formatRupees(Math.abs(todayDifference))} over`}
        icon="calendar"
        variant={todayDifference >= 0 ? "success" : "danger"}
      />

      <SmartStatCard
        title="Buffer"
        value={buffer}
        subtitle="Emergency fund"
        context={buffer > dailyLimit * 7 ? "Healthy buffer" : buffer > 0 ? "Building up" : "Depleted"}
        icon="piggybank"
        variant={buffer > dailyLimit * 7 ? "success" : buffer > 0 ? "default" : "danger"}
      />

      <SmartStatCard
        title="Savings"
        value={savings}
        subtitle="Cumulative"
        context={savings > 0 ? "Positive streak" : "None yet"}
        trendLabel={paceStatus === "on-track" ? "Pacing well" : paceStatus === "behind" ? "Room to save" : "Limit reached"}
        icon="target"
        variant={savings > 0 ? "success" : "default"}
      />
    </div>
  );
}