import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Edit2, Trash2, Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function ConfigurationSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="px-1">
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 font-medium">
          {title}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export function SystemSettingCard({
  label,
  value,
  unit,
  accentColor = "mint",
  onClick,
  icon,
  description,
}: {
  label: string;
  value: string | number;
  unit?: string;
  accentColor?: "mint" | "coral" | "sun" | "sky" | "lavender";
  onClick?: () => void;
  icon?: ReactNode;
  description?: string;
}) {
  const colorClasses = {
    mint: "from-mint/20 to-mint/5 border-mint/20 hover:border-mint/40",
    coral: "from-coral/20 to-coral/5 border-coral/20 hover:border-coral/40",
    sun: "from-sun/20 to-sun/5 border-sun/20 hover:border-sun/40",
    sky: "from-sky-pastel/20 to-sky-pastel/5 border-sky-pastel/20 hover:border-sky-pastel/40",
    lavender: "from-lavender/20 to-lavender/5 border-lavender/20 hover:border-lavender/40",
  };

  const accentClasses = {
    mint: "text-mint",
    coral: "text-coral",
    sun: "text-sun",
    sky: "text-sky-pastel",
    lavender: "text-lavender",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "w-full bg-gradient-to-br rounded-2xl p-4 text-left border transition-all duration-200",
        "hover:shadow-md active:scale-[0.99]",
        colorClasses[accentColor]
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/80 font-medium mb-1">
            {label}
          </div>
          <div className="flex items-baseline gap-1">
            <span className={cn("font-display text-2xl font-bold tracking-tight", accentClasses[accentColor])}>
              {typeof value === "number" ? value.toLocaleString() : value}
            </span>
            {unit && (
              <span className="text-xs text-muted-foreground font-medium">{unit}</span>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground/70 mt-2 line-clamp-1">{description}</p>
          )}
        </div>
        {icon && (
          <div className={cn("p-2 rounded-xl bg-white/50", accentClasses[accentColor])}>
            {icon}
          </div>
        )}
      </div>
    </motion.button>
  );
}

export function GoalConfigurationCard({
  title,
  target,
  current,
  deadline,
  type = "savings",
  onEdit,
  onDelete,
}: {
  title: string;
  target: number;
  current: number;
  deadline: string;
  type?: "savings" | "calorie";
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const progress = Math.min(100, target > 0 ? (current / target) * 100 : 0);
  const isSavings = type === "savings";

  const formatValue = (val: number) => {
    return isSavings 
      ? `₹${val.toLocaleString('en-IN')}`
      : `${val.toLocaleString()} kcal`;
  };

  return (
    <motion.div
      whileTap={{ scale: 0.99 }}
      className="bg-card rounded-2xl p-4 border border-border/40 hover:border-border/60 transition-all cursor-pointer group"
      onClick={onEdit}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            "h-8 w-8 rounded-xl flex items-center justify-center",
            isSavings ? "bg-gradient-mint" : "bg-gradient-to-br from-coral to-orange-400"
          )}>
            <span className="text-xs font-bold text-primary">
              {isSavings ? "₹" : "⚡"}
            </span>
          </div>
          <div>
            <div className="font-semibold text-sm">{title}</div>
            <div className="text-xs text-muted-foreground">
              Due {new Date(deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-destructive/10 transition-all"
          >
            <svg className="w-4 h-4 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Target</span>
          <span className={cn("font-display text-lg font-bold", isSavings ? "text-mint" : "text-coral")}>
            {formatValue(target)}
          </span>
        </div>

        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={cn(
              "h-full rounded-full",
              isSavings ? "bg-gradient-mint" : "bg-gradient-to-r from-coral to-orange-400"
            )}
          />
        </div>

        <div className="flex items-baseline justify-between text-xs">
          <span className="text-muted-foreground">Current: {formatValue(current)}</span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
      </div>
    </motion.div>
  );
}

export function SetupProgressIndicator({
  configured,
  total,
  label = "System Configuration",
}: {
  configured: number;
  total: number;
  label?: string;
}) {
  const percentage = total > 0 ? Math.round((configured / total) * 100) : 0;
  const isComplete = percentage === 100;

  return (
    <div className="bg-card rounded-2xl p-4 border border-border/30">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 font-medium">
          {label}
        </div>
        <div className={cn(
          "text-xs font-bold px-2 py-1 rounded-full",
          isComplete 
            ? "bg-mint/20 text-mint" 
            : "bg-secondary text-muted-foreground"
        )}>
          {percentage}%
        </div>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full",
            isComplete ? "bg-gradient-mint" : "bg-gradient-to-r from-mint to-mint/60"
          )}
        />
      </div>
      <div className="text-xs text-muted-foreground mt-2">
        {configured} of {total} parameters configured
      </div>
    </div>
  );
}

export function ConfigurationValueDisplay({
  label,
  value,
  unit,
  status,
}: {
  label: string;
  value: string | number;
  unit?: string;
  status?: "active" | "pending" | "warning";
}) {
  const statusColors = {
    active: "text-mint bg-mint/10",
    pending: "text-muted-foreground bg-secondary",
    warning: "text-coral bg-coral/10",
  };

  return (
    <div className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="flex items-center gap-2">
        <span className="font-medium">{value}{unit && <span className="text-muted-foreground text-xs ml-1">{unit}</span>}</span>
        {status && (
          <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider", statusColors[status])}>
            {status}
          </span>
        )}
      </div>
    </div>
  );
}

export function EmptyConfigurationState({
  title,
  message,
  actionLabel,
  onAction,
}: {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="bg-card/50 rounded-2xl p-6 border border-dashed border-border/40 text-center">
      <div className="text-sm font-medium mb-1">{title}</div>
      <p className="text-xs text-muted-foreground mb-3">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="text-xs font-medium text-primary hover:underline"
        >
          {actionLabel} →
        </button>
      )}
    </div>
  );
}

export function MiniStatCard({
  label,
  value,
  subValue,
  icon,
  accent = "mint",
}: {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: ReactNode;
  accent?: "mint" | "coral" | "sun" | "sky" | "lavender";
}) {
  const accentClasses = {
    mint: "text-mint",
    coral: "text-coral",
    sun: "text-sun",
    sky: "text-sky-pastel",
    lavender: "text-lavender",
  };

  return (
    <div className="bg-card rounded-2xl p-4 border border-border/30 hover:border-border/50 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70">{label}</span>
        {icon && <span className={accentClasses[accent]}>{icon}</span>}
      </div>
      <div className={cn("font-display text-2xl font-bold", accentClasses[accent])}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      {subValue && (
        <div className="text-xs text-muted-foreground mt-1">{subValue}</div>
      )}
    </div>
  );
}

const CATEGORY_PRESETS: Record<string, { icon: string; color: "mint" | "coral" | "sun" | "sky" | "lavender"; accent: string }> = {
  Groceries: { icon: "🛒", color: "mint", accent: "from-mint/20 to-mint/5" },
  Dining: { icon: "🍽️", color: "coral", accent: "from-coral/20 to-coral/5" },
  Transport: { icon: "🚗", color: "sun", accent: "from-sun/20 to-sun/5" },
  Shopping: { icon: "🛍️", color: "lavender", accent: "from-lavender/20 to-lavender/5" },
  Bills: { icon: "📄", color: "sky", accent: "from-sky-pastel/20 to-sky-pastel/5" },
  Food: { icon: "🍕", color: "mint", accent: "from-mint/20 to-mint/5" },
  Travel: { icon: "✈️", color: "sun", accent: "from-sun/20 to-sun/5" },
  Entertainment: { icon: "🎬", color: "coral", accent: "from-coral/20 to-coral/5" },
  Health: { icon: "💊", color: "mint", accent: "from-mint/20 to-mint/5" },
  Education: { icon: "📚", color: "sky", accent: "from-sky-pastel/20 to-sky-pastel/5" },
  Utilities: { icon: "⚡", color: "sun", accent: "from-sun/20 to-sun/5" },
  "Rent/Housing": { icon: "🏠", color: "lavender", accent: "from-lavender/20 to-lavender/5" },
  "Coffee/Beverages": { icon: "☕", color: "coral", accent: "from-coral/20 to-coral/5" },
  Snacks: { icon: "🍪", color: "sun", accent: "from-sun/20 to-sun/5" },
  Pets: { icon: "🐾", color: "mint", accent: "from-mint/20 to-mint/5" },
  Subscriptions: { icon: "📱", color: "lavender", accent: "from-lavender/20 to-lavender/5" },
  "Gift/Donation": { icon: "🎁", color: "coral", accent: "from-coral/20 to-coral/5" },
  Insurance: { icon: "🛡️", color: "sky", accent: "from-sky-pastel/20 to-sky-pastel/5" },
  "Personal Care": { icon: "💅", color: "lavender", accent: "from-lavender/20 to-lavender/5" },
  Miscellaneous: { icon: "📦", color: "mint", accent: "from-mint/20 to-mint/5" },
};

export function getCategoryPreset(name: string) {
  const key = Object.keys(CATEGORY_PRESETS).find(k => name.toLowerCase().includes(k.toLowerCase()));
  return key ? CATEGORY_PRESETS[key] : { icon: "📁", color: "mint" as const, accent: "from-mint/20 to-mint/5" };
}

export function CategoryCard({
  name,
  budget,
  spent,
  onEdit,
  onDelete,
}: {
  name: string;
  budget: number;
  spent: number;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const utilization = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
  const remaining = Math.max(0, budget - spent);
  const isOverBudget = spent > budget;
  const isNearThreshold = utilization >= 75 && utilization < 100;

  const preset = getCategoryPreset(name);
  
  const pressureState = isOverBudget 
    ? { label: "Over budget", color: "text-coral", bg: "bg-coral/10" }
    : isNearThreshold 
      ? { label: "Near threshold", color: "text-sun", bg: "bg-sun/10" }
      : { label: "Healthy pace", color: "text-mint", bg: "bg-mint/10" };

  const accentColors = {
    mint: "text-mint",
    coral: "text-coral",
    sun: "text-sun",
    sky: "text-sky-pastel",
    lavender: "text-lavender",
  };

  return (
    <motion.div
      whileTap={{ scale: 0.99 }}
      onClick={onEdit}
      className={cn(
        "relative overflow-hidden rounded-2xl p-4 border border-border/40 cursor-pointer transition-all",
        "hover:shadow-md hover:border-border/60 group"
      )}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", preset.accent)} />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "h-11 w-11 rounded-xl flex items-center justify-center text-lg",
              preset.color === "mint" ? "bg-gradient-mint" :
              preset.color === "coral" ? "bg-gradient-to-br from-coral to-orange-400" :
              preset.color === "sun" ? "bg-gradient-to-br from-sun to-amber-400" :
              preset.color === "sky" ? "bg-gradient-to-br from-sky-pastel to-blue-400" :
              "bg-gradient-to-br from-lavender to-purple-400"
            )}>
              <span>{preset.icon}</span>
            </div>
            <div>
              <div className="font-semibold text-base">{name}</div>
              <div className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium inline-block mt-0.5", pressureState.bg, pressureState.color)}>
                {pressureState.label}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
              className="p-2 hover:bg-secondary/80 rounded-lg transition"
            >
              <Edit2 className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
              className="p-2 hover:bg-destructive/10 rounded-lg transition"
            >
              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Spent</span>
            <div className="text-right">
              <span className={cn("font-display text-lg font-bold", isOverBudget ? "text-coral" : accentColors[preset.color])}>
                ₹{spent.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-muted-foreground"> / ₹{budget.toLocaleString('en-IN')}</span>
            </div>
          </div>
          
          <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, utilization)}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={cn(
                "h-full rounded-full",
                isOverBudget ? "bg-gradient-to-r from-coral to-red-400" :
                preset.color === "mint" ? "bg-gradient-mint" :
                preset.color === "coral" ? "bg-gradient-to-r from-coral to-orange-400" :
                preset.color === "sun" ? "bg-gradient-to-r from-sun to-amber-400" :
                preset.color === "sky" ? "bg-gradient-to-r from-sky-pastel to-blue-400" :
                "bg-gradient-to-r from-lavender to-purple-400"
              )}
            />
          </div>

          <div className="flex items-baseline justify-between text-xs">
            <span className="text-muted-foreground">{Math.round(utilization)}% utilized</span>
            <span className={isOverBudget ? "text-coral" : "text-muted-foreground"}>
              {isOverBudget 
                ? `₹${Math.abs(remaining).toLocaleString('en-IN')} over` 
                : `₹${remaining.toLocaleString('en-IN')} left`}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function CategorySummaryStrip({
  categoryCount,
  totalBudget,
  highestPressure,
  highestPressureCategory,
}: {
  categoryCount: number;
  totalBudget: number;
  highestPressure: number;
  highestPressureCategory?: string;
}) {
  const pressureLabel = highestPressure > 100 
    ? "Over budget" 
    : highestPressure > 75 
      ? "Near threshold" 
      : "Within limit";

  return (
    <div className="bg-card rounded-2xl p-4 border border-border/30">
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70">Active</div>
          <div className="font-display text-xl font-bold mt-1">{categoryCount}</div>
          <div className="text-[10px] text-muted-foreground">categories</div>
        </div>
        <div className="text-center border-x border-border/30">
          <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70">Pressure</div>
          <div className={cn(
            "font-display text-xl font-bold mt-1",
            highestPressure > 100 ? "text-coral" : highestPressure > 75 ? "text-sun" : "text-mint"
          )}>
            {pressureLabel}
          </div>
          {highestPressureCategory && (
            <div className="text-[10px] text-muted-foreground truncate max-w-[80px] mx-auto">{highestPressureCategory}</div>
          )}
        </div>
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70">Allocated</div>
          <div className="font-display text-xl font-bold mt-1 text-mint">₹{totalBudget.toLocaleString('en-IN')}</div>
          <div className="text-[10px] text-muted-foreground">total budget</div>
        </div>
      </div>
    </div>
  );
}

export function CategoryInsightBadge({
  text,
  type = "info",
}: {
  text: string;
  type?: "info" | "warning" | "success";
}) {
  const typeStyles = {
    info: "bg-mint/10 text-mint",
    warning: "bg-sun/10 text-sun",
    success: "bg-mint/10 text-mint",
  };

  return (
    <div className={cn(
      "text-xs px-3 py-2 rounded-xl font-medium",
      typeStyles[type]
    )}>
      {text}
    </div>
  );
}

export function CategoryPresetButton({
  name,
  icon,
  color,
  isSelected,
  onClick,
}: {
  name: string;
  icon: string;
  color: "mint" | "coral" | "sun" | "sky" | "lavender";
  isSelected: boolean;
  onClick: () => void;
}) {
  const colorClasses = {
    mint: "bg-mint/20 border-mint/40 text-mint",
    coral: "bg-coral/20 border-coral/40 text-coral",
    sun: "bg-sun/20 border-sun/40 text-sun",
    sky: "bg-sky-pastel/20 border-sky-pastel/40 text-sky-pastel",
    lavender: "bg-lavender/20 border-lavender/40 text-lavender",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all",
        isSelected ? colorClasses[color] : "bg-secondary/30 border-transparent hover:bg-secondary/50"
      )}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-[10px] font-medium">{name}</span>
    </button>
  );
}

export function PreferenceGroup({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="px-1">
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 font-medium">
          {title}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground/60 mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export function PreferenceCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("bg-card rounded-2xl p-4 border border-border/30", className)}>
      {children}
    </div>
  );
}

export function ThemePresetCard({
  id,
  label,
  icon: Icon,
  isSelected,
  description,
  onClick,
  accentColor = "mint",
}: {
  id: string;
  label: string;
  icon: React.ElementType;
  isSelected: boolean;
  description: string;
  onClick: () => void;
  accentColor?: "mint" | "coral" | "sun" | "sky" | "lavender";
}) {
  const isDark = id === "dark";
  const accentClasses = {
    mint: "text-mint",
    coral: "text-coral",
    sun: "text-sun",
    sky: "text-sky-pastel",
    lavender: "text-lavender",
  };

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-2xl p-5 border-2 transition-all duration-300",
        isSelected 
          ? "border-primary shadow-lg shadow-mint/20" 
          : "border-border/30 hover:border-mint/40"
      )}
    >
      <div className={cn(
        "absolute inset-0 -z-10",
        isDark 
          ? "bg-gradient-to-br from-[#1a1f1c] to-[#0f1210]" 
          : "bg-gradient-to-br from-[#f8f6f3] to-[#e8e5e0]"
      )} />
      
      <div className="flex items-start justify-between">
        <div className="flex flex-col items-start gap-3">
          <div className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center",
            isDark ? "bg-mint/20" : "bg-amber-500/20"
          )}>
            <Icon className={cn("h-5 w-5", isDark ? "text-mint" : "text-amber-500")} />
          </div>
          <div>
            <div className="font-semibold text-base">{label}</div>
            <div className="text-xs text-muted-foreground mt-1">{description}</div>
          </div>
        </div>
        
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="h-7 w-7 rounded-full bg-mint text-primary flex items-center justify-center shadow-md"
          >
            <Check className="h-3.5 w-3.5" />
          </motion.div>
        )}
      </div>

      {isSelected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-3 right-3 text-[10px] font-medium px-2 py-1 rounded-full bg-mint/20 text-mint"
        >
          Active
        </motion.div>
      )}
    </motion.button>
  );
}

export function SystemToggle({
  label,
  description,
  isEnabled,
  onToggle,
  icon,
}: {
  label: string;
  description: string;
  isEnabled: boolean;
  onToggle: () => void;
  icon?: ReactNode;
}) {
  return (
    <motion.div
      whileTap={{ scale: 0.99 }}
      className="flex items-center justify-between py-2"
      onClick={onToggle}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className={cn(
            "h-9 w-9 rounded-lg flex items-center justify-center",
            isEnabled ? "bg-mint/20" : "bg-secondary"
          )}>
            {icon}
          </div>
        )}
        <div>
          <div className="text-sm font-medium">{label}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
      </div>
      
      <motion.div
        animate={{ 
          backgroundColor: isEnabled ? "hsl(145, 45%, 70%)" : "hsl(80, 20%, 92%)",
        }}
        className="h-6 w-11 rounded-full relative cursor-pointer shadow-inner"
      >
        <motion.div
          animate={{ 
            x: isEnabled ? 22 : 2,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md"
        />
      </motion.div>
    </motion.div>
  );
}

export function PreferenceRow({
  label,
  value,
  onClick,
  icon,
  isActive = false,
}: {
  label: string;
  value?: string;
  onClick?: () => void;
  icon?: ReactNode;
  isActive?: boolean;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="flex items-center justify-between w-full py-3 border-b border-border/20 last:border-0 hover:bg-secondary/30 rounded-lg px-2 -mx-2 transition-colors"
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
            {icon}
          </div>
        )}
        <div className="text-sm font-medium">{label}</div>
      </div>
      <div className="flex items-center gap-2">
        {value && (
          <span className={cn("text-sm", isActive ? "text-mint font-medium" : "text-muted-foreground")}>
            {value}
          </span>
        )}
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </motion.button>
  );
}

export function SystemStatusBadge({
  status,
  label,
}: {
  status: "active" | "inactive" | "optimized";
  label: string;
}) {
  const statusStyles = {
    active: "bg-mint/15 text-mint",
    inactive: "bg-secondary text-muted-foreground",
    optimized: "bg-sun/15 text-sun",
  };

  return (
    <span className={cn(
      "text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider",
      statusStyles[status]
    )}>
      {label}
    </span>
  );
}

export function StorageStatusCard({
  provider,
  usedBytes,
  totalBytes,
  lastSync,
  health,
  isLoading,
}: {
  provider: string;
  usedBytes: number;
  totalBytes: number;
  lastSync?: string;
  health?: "healthy" | "warning" | "critical";
  isLoading?: boolean;
}) {
  const usagePercentage = totalBytes > 0 ? (usedBytes / totalBytes) * 100 : 0;
  const remainingGB = ((totalBytes - usedBytes) / 1024 / 1024 / 1024).toFixed(1);
  
  const formatBytes = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  };

  const healthStyles = {
    healthy: { color: "text-mint", bg: "bg-mint/10", label: "Healthy" },
    warning: { color: "text-sun", bg: "bg-sun/10", label: "Near limit" },
    critical: { color: "text-coral", bg: "bg-coral/10", label: "Critical" },
  };

  const currentHealth = healthStyles[health || (usagePercentage > 90 ? "critical" : usagePercentage > 75 ? "warning" : "healthy")];

  return (
    <div className="bg-card rounded-2xl p-5 border border-border/40">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70">{provider}</div>
          <div className="font-display text-2xl font-bold mt-1">
            {isLoading ? "Calculating..." : formatBytes(usedBytes)}
          </div>
        </div>
        <span className={cn("text-[10px] px-2 py-1 rounded-full font-medium", currentHealth.bg, currentHealth.color)}>
          {currentHealth.label}
        </span>
      </div>

      <div className="space-y-3">
        <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, usagePercentage)}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={cn(
              "h-full rounded-full",
              health === "critical" || usagePercentage > 90
                ? "bg-gradient-to-r from-coral to-red-400"
                : health === "warning" || usagePercentage > 75
                  ? "bg-gradient-to-r from-sun to-amber-400"
                  : "bg-gradient-mint"
            )}
          />
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {formatBytes(usedBytes)} of {formatBytes(totalBytes)} used
          </span>
          <span className="font-medium">{Math.round(usagePercentage)}%</span>
        </div>
      </div>

      {lastSync && (
        <div className="mt-4 pt-3 border-t border-border/30">
          <div className="text-[10px] text-muted-foreground">
            Last synchronized: <span className="text-foreground font-medium">{lastSync}</span>
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
        <div className="h-1.5 w-1.5 rounded-full bg-mint animate-pulse" />
        <span>Infrastructure operational</span>
      </div>
    </div>
  );
}

export function ExportFormatCard({
  format,
  label,
  description,
  icon: Icon,
  recordCount,
  onExport,
  isExporting,
}: {
  format: string;
  label: string;
  description: string;
  icon: React.ElementType;
  recordCount?: string;
  onExport: () => void;
  isExporting?: boolean;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onExport}
      disabled={isExporting}
      className="group relative overflow-hidden bg-card rounded-2xl p-4 border border-border/40 hover:border-mint/30 transition-all text-left"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-mint/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-mint/20 transition-colors">
            <Icon className="h-5 w-5 text-muted-foreground group-hover:text-mint transition-colors" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm">{label}</div>
            <div className="text-xs text-muted-foreground mt-1">{description}</div>
            {recordCount && (
              <div className="text-[10px] text-muted-foreground/70 mt-2">{recordCount}</div>
            )}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">{format}</span>
          <span className="text-xs font-medium text-mint opacity-0 group-hover:opacity-100 transition-opacity">
            {isExporting ? "Exporting..." : "Export →"}
          </span>
        </div>
      </div>
    </motion.button>
  );
}

export function DataTypeIndicator({
  label,
  bytes,
  percentage,
  color = "mint",
}: {
  label: string;
  bytes: number;
  percentage: number;
  color?: "mint" | "coral" | "sun" | "sky" | "lavender";
}) {
  const colorClasses = {
    mint: "bg-mint",
    coral: "bg-coral",
    sun: "bg-sun",
    sky: "bg-sky-pastel",
    lavender: "bg-lavender",
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="flex items-center gap-3 py-2">
      <div className={cn("h-2 w-2 rounded-full", colorClasses[color])} />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="text-sm">{label}</span>
          <span className="text-xs text-muted-foreground">{formatBytes(bytes)}</span>
        </div>
        <div className="h-1 bg-secondary rounded-full overflow-hidden mt-1">
          <div 
            className={cn("h-full rounded-full", colorClasses[color])} 
            style={{ width: `${percentage}%` }} 
          />
        </div>
      </div>
    </div>
  );
}

export function SystemInfrastructureStatus({
  recordsIndexed,
  lastBackup,
  syncStatus,
  dataIntegrity,
}: {
  recordsIndexed?: number;
  lastBackup?: string;
  syncStatus?: "synced" | "syncing" | "offline";
  dataIntegrity?: "verified" | "pending" | "error";
}) {
  return (
    <div className="bg-secondary/30 rounded-2xl p-4 border border-border/20">
      <div className="grid grid-cols-2 gap-4">
        {recordsIndexed !== undefined && (
          <div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70 mb-1">Records Indexed</div>
            <div className="font-medium">{recordsIndexed.toLocaleString()}</div>
          </div>
        )}
        {lastBackup && (
          <div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70 mb-1">Last Backup</div>
            <div className="font-medium">{lastBackup}</div>
          </div>
        )}
        {syncStatus && (
          <div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70 mb-1">Sync Status</div>
            <div className={cn(
              "font-medium",
              syncStatus === "synced" ? "text-mint" : syncStatus === "syncing" ? "text-sun" : "text-muted-foreground"
            )}>
              {syncStatus === "synced" ? "Synchronized" : syncStatus === "syncing" ? "Syncing..." : "Offline"}
            </div>
          </div>
        )}
        {dataIntegrity && (
          <div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70 mb-1">Data Integrity</div>
            <div className={cn(
              "font-medium",
              dataIntegrity === "verified" ? "text-mint" : dataIntegrity === "pending" ? "text-sun" : "text-coral"
            )}>
              {dataIntegrity === "verified" ? "Verified" : dataIntegrity === "pending" ? "Verifying..." : "Error"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function TrustIndicator({
  label,
  isActive = true,
}: {
  label: string;
  isActive?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <div className={cn(
        "h-1.5 w-1.5 rounded-full",
        isActive ? "bg-mint" : "bg-muted-foreground/30"
      )} />
      <span className={isActive ? "text-muted-foreground" : "text-muted-foreground/50"}>{label}</span>
    </div>
  );
}