import { CalendarInsight } from "./calendarUtils";
import { CheckCircle, AlertCircle, TrendingUp, Utensils } from "lucide-react";

interface CalendarInsightStripProps {
  insights: CalendarInsight[];
}

const iconMap: Record<string, any> = {
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Utensils,
};

export function CalendarInsightStrip({ insights }: CalendarInsightStripProps) {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="mb-4 space-y-2">
      {insights.map((insight) => {
        const Icon = iconMap[insight.icon] || CheckCircle;
        const bgColor = insight.type === "consistency" ? "bg-mint/5 border-mint/20" : "bg-coral/5 border-coral/20";
        const iconBg = insight.type === "consistency" ? "bg-mint/15 text-emerald-600" : "bg-coral/15 text-coral";

        return (
          <div
            key={insight.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${bgColor}`}
          >
            <div className={`h-8 w-8 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
              <Icon className="h-4 w-4" />
            </div>
            <p className="text-sm font-medium text-foreground/90 flex-1">
              {insight.headline}
            </p>
          </div>
        );
      })}
    </div>
  );
}