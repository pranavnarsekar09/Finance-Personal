import { useState, useMemo } from "react";
import { format, getDay } from "date-fns";
import { CalendarEntry } from "@/lib/types";
import { DailySnapshotCard } from "./DailySnapshotCard";
import { CalendarInsightStrip } from "./CalendarInsightStrip";
import { TimelineEntryCard } from "./TimelineEntryCard";
import { MonthAnalyticsStrip } from "./MonthAnalyticsStrip";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarGridProps {
  entries: CalendarEntry[];
  isLoading: boolean;
  currentMonth: Date;
  onMonthChange: (month: Date) => void;
  onDeleteExpense: (id: string) => Promise<void>;
  onDeleteMeal: (id: string) => Promise<void>;
  onDeleteMonth: () => Promise<void>;
  isDeleting: boolean;
}

export function CalendarGrid({
  entries,
  isLoading,
  currentMonth,
  onMonthChange,
  onDeleteExpense,
  onDeleteMeal,
  onDeleteMonth,
  isDeleting,
}: CalendarGridProps) {
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));

  const days = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysArray: (Date | null)[] = [];

    const startPadding = getDay(firstDay);
    for (let i = 0; i < startPadding; i++) {
      daysArray.push(null);
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      daysArray.push(new Date(year, month, d));
    }

    return daysArray;
  }, [currentMonth]);

  const entryMap = useMemo(() => {
    const map: Record<string, CalendarEntry> = {};
    if (Array.isArray(entries)) {
      entries.forEach((e) => {
        if (e && e.date) {
          map[e.date.split("T")[0]] = e;
        }
      });
    }
    return map;
  }, [entries]);

  const monthAnalytics = useMemo(() => {
    const totalSpent = entries.reduce((acc, e) => {
      if (e && e.expenses) {
        return acc + e.expenses.reduce((a: number, exp: any) => a + (exp.amount || 0), 0);
      }
      return acc;
    }, 0);
    const totalMeals = entries.reduce((acc, e) => {
      if (e && e.meals) return acc + e.meals.length;
      return acc;
    }, 0);
    const activeDays = entries.filter((e) => e && e.expenses && e.expenses.length > 0).length;
    const daysInMonth = days.filter((d) => d !== null).length;
    
    return {
      totalSpent,
      averagePerDay: daysInMonth > 0 ? Math.round(totalSpent / daysInMonth) : 0,
      totalMeals,
      disciplineAverage: 65,
      activeDays,
      inactiveDays: daysInMonth - activeDays,
      consistencyScore: daysInMonth > 0 ? Math.round((activeDays / daysInMonth) * 100) : 0,
      weekendVsWeekday: { weekend: 0, weekday: 0 },
    };
  }, [entries, days]);

  const insights = useMemo(() => {
    if (monthAnalytics.activeDays >= 15) {
      return [{
        id: "consistent",
        headline: "Strong consistency this month!",
        type: "consistency" as const,
        icon: "CheckCircle",
      }];
    }
    return [];
  }, [monthAnalytics]);

  const selectedEntry = entryMap[selectedDate] || null;
  
  const uniqueMeals = selectedEntry?.meals ? 
    selectedEntry.meals.filter((m: any, index: number, self: any[]) => 
      index === self.findIndex((t: any) => t.id === m.id)
    ) : [];
  
  const disciplineScore = useMemo(() => {
    if (!selectedEntry) return 50;
    const spent = selectedEntry.expenses?.reduce((acc: number, e: any) => acc + e.amount, 0) || 0;
    const meals = uniqueMeals.length;
    let score = 50;
    if (meals >= 2) score += 20;
    if (spent <= monthAnalytics.averagePerDay * 1.2) score += 15;
    return Math.min(100, score);
  }, [selectedEntry, uniqueMeals, monthAnalytics]);

  const timelineEntries = useMemo(() => {
    const result: any[] = [];
    if (!selectedEntry) return result;
    
    const linkedExpenseIds = new Set(
      selectedEntry.meals?.filter((m: any) => m.linkedExpenseId).map((m: any) => m.linkedExpenseId) || []
    );
    
    selectedEntry.expenses?.forEach((expense: any) => {
      if (!linkedExpenseIds.has(expense.id)) {
        result.push({
          id: expense.id,
          type: "expense",
          category: expense.categoryName,
          label: expense.note?.split(" | ")[0] || expense.categoryName,
          amount: expense.amount,
          time: expense.date ? format(new Date(expense.date), "HH:mm") : "00:00",
          icon: "CreditCard",
          color: "text-coral",
        });
      }
    });

    selectedEntry.meals?.forEach((meal: any) => {
      result.push({
        id: meal.id,
        type: "meal",
        category: "Meal",
        label: meal.foodName,
        amount: meal.estimatedCost || 0,
        time: meal.date ? format(new Date(meal.date), "HH:mm") : "00:00",
        calories: meal.calories,
        icon: "Utensils",
        color: "text-emerald-600",
      });
    });

    return result.sort((a, b) => {
      const timeA = parseInt(a.time.replace(":", ""));
      const timeB = parseInt(b.time.replace(":", ""));
      return timeB - timeA;
    });
  }, [selectedEntry]);

  const handlePrevMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    onMonthChange(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    onMonthChange(newMonth);
  };

  if (isLoading) {
    return <div className="h-[400px] bg-secondary/50 rounded-[2rem] animate-pulse" />;
  }

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-[2rem] p-5 shadow-soft border border-border/30">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevMonth}
            className="h-9 w-9 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary transition"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="font-display text-lg font-bold">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <button
            onClick={handleNextMonth}
            className="h-9 w-9 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary transition"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} className="text-[10px] font-bold text-muted-foreground/50 tracking-wider py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((date, i) => {
            if (!date) {
              return <div key={`empty-${i}`} className="h-10" />;
            }

            const dateKey = format(date, "yyyy-MM-dd");
            const entry = entryMap[dateKey];
            const isSelected = selectedDate === dateKey;
            const isToday = dateKey === format(new Date(), "yyyy-MM-dd");
            const hasMeals = entry?.meals?.length > 0;
            const hasSpending = entry?.expenses?.length > 0;

            let cellClass = "text-muted-foreground hover:bg-secondary/30";
            if (isSelected) {
              cellClass = "bg-surface-dark text-primary-foreground shadow-lg scale-110 z-10";
            } else if (isToday) {
              cellClass = "ring-2 ring-mint/40 text-foreground";
            } else if (hasSpending || hasMeals) {
              cellClass = "bg-emerald-500/10 text-foreground";
            }

            return (
              <button
                key={dateKey}
                onClick={() => setSelectedDate(dateKey)}
                className={`relative h-10 w-full rounded-xl flex flex-col items-center justify-center text-xs font-medium transition-all duration-200 ${cellClass}`}
              >
                <span>{format(date, "d")}</span>
                {(hasMeals || hasSpending) && (
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {hasMeals && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                    {hasSpending && !hasMeals && <div className="h-1.5 w-1.5 rounded-full bg-coral" />}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-border/20">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[9px] text-muted-foreground">Activity</span>
          </div>
        </div>
      </div>

      <CalendarInsightStrip insights={insights} />

      <MonthAnalyticsStrip analytics={monthAnalytics} />

      <DailySnapshotCard
        entry={selectedEntry}
        date={selectedDate}
        disciplineScore={disciplineScore}
        mealsCount={uniqueMeals.length}
      />

      <div className="px-1">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
            Timeline
          </h3>
          <span className="text-[10px] text-muted-foreground font-medium">
            {timelineEntries.length} entries
          </span>
        </div>

        <div className="space-y-2">
          {timelineEntries.length > 0 ? (
            timelineEntries.map((entry: any) => (
              <TimelineEntryCard
                key={entry.id}
                entry={entry}
                onDelete={
                  entry.type === "expense"
                    ? () => onDeleteExpense(entry.id)
                    : entry.type === "meal"
                    ? () => onDeleteMeal(entry.id)
                    : undefined
                }
              />
            ))
          ) : (
            <div className="bg-secondary/30 rounded-2xl p-8 text-center border border-dashed border-muted-foreground/20">
              <p className="text-sm text-muted-foreground font-medium">
                No activity on this day
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 px-1">
        <button
          onClick={onDeleteMonth}
          disabled={isDeleting}
          className="w-full text-xs px-4 py-3 rounded-2xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition disabled:opacity-50 font-medium"
        >
          {isDeleting ? "Deleting..." : "Clear Month Data"}
        </button>
      </div>
    </div>
  );
}