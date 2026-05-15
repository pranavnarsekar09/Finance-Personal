import { parseISO, format } from "date-fns";
import { formatRupees } from "@/lib/utils";
import { TrendingUp, TrendingDown, Utensils, Wallet } from "lucide-react";

interface DailySnapshotCardProps {
  entry: any;
  date: string;
  disciplineScore: number;
  mealsCount?: number;
}

export function DailySnapshotCard({ entry, date, disciplineScore, mealsCount }: DailySnapshotCardProps) {
  const parsedDate = parseISO(date);
  const totalSpent = entry?.expenses?.reduce((acc: number, e: any) => acc + (e.amount || 0), 0) || 0;
  const uniqueMeals = mealsCount ?? (entry?.meals ? entry.meals.filter((m: any, i: number, arr: any[]) => arr.findIndex((t: any) => t.id === m.id) === i).length : 0);
  const totalCalories = entry?.meals?.reduce((acc: number, m: any) => acc + (m.calories || 0), 0) || 0;

  const isWeekend = parsedDate.getDay() === 0 || parsedDate.getDay() === 6;

  const getDisciplineConfig = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "text-emerald-600", bg: "bg-emerald-500/10" };
    if (score >= 60) return { label: "Good", color: "text-mint", bg: "bg-mint/10" };
    if (score >= 40) return { label: "Fair", color: "text-sun", bg: "bg-sun/10" };
    return { label: "Low", color: "text-coral", bg: "bg-coral/10" };
  };

  const discipline = getDisciplineConfig(disciplineScore);

  return (
    <div className="bg-card rounded-[1.75rem] shadow-soft p-5 border border-primary/5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
            Daily Snapshot
          </div>
          <div className="font-display text-xl font-bold">
            {format(parsedDate, "EEE, MMM d")}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {isWeekend ? "Weekend" : "Weekday"}
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${discipline.bg}`}>
          {disciplineScore >= 60 ? (
            <TrendingUp className={`h-3.5 w-3.5 ${discipline.color}`} />
          ) : (
            <TrendingDown className={`h-3.5 w-3.5 ${discipline.color}`} />
          )}
          <span className={`text-xs font-bold ${discipline.color}`}>{disciplineScore}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-secondary/30 rounded-xl p-3 border border-border/15">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="h-4 w-4 text-coral" />
            <span className="text-[10px] text-muted-foreground font-medium">Spent</span>
          </div>
          <div className="font-display text-lg font-bold text-coral">
            {totalSpent > 0 ? `-${formatRupees(totalSpent)}` : "₹0"}
          </div>
          <div className="text-[9px] text-muted-foreground/70 mt-0.5">
            {entry?.expenses?.length || 0} transactions
          </div>
        </div>

        <div className="bg-secondary/30 rounded-xl p-3 border border-border/15">
          <div className="flex items-center gap-2 mb-2">
            <Utensils className="h-4 w-4 text-emerald-500" />
            <span className="text-[10px] text-muted-foreground font-medium">Nutrition</span>
          </div>
          <div className="font-display text-lg font-bold text-emerald-600">
            {totalCalories > 0 ? totalCalories.toLocaleString() : "0"}
          </div>
          <div className="text-[9px] text-muted-foreground/70 mt-0.5">
            {uniqueMeals} meal{uniqueMeals !== 1 ? "s" : ""} logged
          </div>
        </div>
      </div>

      <div className="bg-secondary/20 rounded-xl p-3 border border-border/10">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground font-medium">Discipline</span>
          <span className={`text-xs font-semibold ${discipline.color}`}>{discipline.label}</span>
        </div>
        <div className="mt-2 h-1.5 bg-secondary/50 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              disciplineScore >= 80 ? "bg-emerald-500" :
              disciplineScore >= 60 ? "bg-mint" :
              disciplineScore >= 40 ? "bg-sun" : "bg-coral"
            }`}
            style={{ width: `${disciplineScore}%` }}
          />
        </div>
      </div>
    </div>
  );
}