import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface RadialScoreProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  icon?: LucideIcon;
  showLabel?: boolean;
}

export function RadialScore({ 
  score, 
  size = 80, 
  strokeWidth = 6,
  icon: Icon,
  showLabel = false
}: RadialScoreProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  const getColor = () => {
    if (score >= 70) return "#10b981";
    if (score >= 50) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            filter: `drop-shadow(0 0 8px ${getColor()}40)`,
          }}
        />
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {Icon && <Icon className="h-6 w-6 text-mint mb-1" style={{ color: getColor() }} />}
        <span 
          className="font-display text-2xl font-bold"
          style={{ color: getColor() }}
        >
          {score}
        </span>
        {showLabel && <span className="text-[8px] text-muted-foreground uppercase">Score</span>}
      </div>
    </div>
  );
}

interface MiniRadialProps {
  value: number;
  size?: number;
  label?: string;
  trend?: "up" | "down" | "flat";
}

export function MiniRadial({ value, size = 50, label, trend }: MiniRadialProps) {
  const radius = (size - 4) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  
  const getColor = () => {
    if (value >= 70) return "#10b981";
    if (value >= 50) return "#f59e0b";
    return "#ef4444";
  };

  const trendColor = trend === "up" ? "#10b981" : trend === "down" ? "#ef4444" : "#6b7280";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={3}
            fill="none"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getColor()}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span 
            className="font-bold text-sm"
            style={{ color: getColor() }}
          >
            {value}
          </span>
        </div>
      </div>
      {label && (
        <span className="text-[8px] uppercase text-muted-foreground text-center">{label}</span>
      )}
      {trend && (
        <div 
          className="h-1 w-8 rounded-full"
          style={{ backgroundColor: trendColor }}
        />
      )}
    </div>
  );
}