export interface CalendarInsight {
  id: string;
  headline: string;
  type: "spending" | "health" | "streak" | "consistency" | "behavior";
  icon: string;
}

export interface MonthAnalytics {
  totalSpent: number;
  averagePerDay: number;
  totalMeals: number;
  disciplineAverage: number;
  activeDays: number;
  inactiveDays: number;
  consistencyScore: number;
  weekendVsWeekday: { weekend: number; weekday: number };
}

export interface TimelineEntry {
  id: string;
  type: "expense" | "meal" | "income";
  category: string;
  label: string;
  amount: number;
  time: string;
  note?: string;
  isRecurring?: boolean;
  calories?: number;
  icon: string;
  color: string;
}

export interface DayIntelligence {
  date: string;
  hasSpending: boolean;
  hasMeals: boolean;
  totalSpent: number;
  totalCalories: number;
  mealsLogged: number;
  disciplineScore: number;
}

export function calculateDayIntelligence(entry: any, date: Date): DayIntelligence {
  const expenses = entry?.expenses || [];
  const meals = entry?.meals || [];

  const totalSpent = expenses.reduce((acc: number, e: any) => acc + (e.amount || 0), 0);
  const totalCalories = meals.reduce((acc: number, m: any) => acc + (m.calories || 0), 0);
  const mealsLogged = meals.length;

  return {
    date: date.toISOString().split("T")[0],
    hasSpending: totalSpent > 0,
    hasMeals: mealsLogged > 0,
    totalSpent,
    totalCalories,
    mealsLogged,
    disciplineScore: 65,
  };
}

export function generateMonthAnalytics(entries: any[], currentMonth: Date): MonthAnalytics {
  let totalSpent = 0;
  let totalMeals = 0;
  let activeDays = 0;

  entries.forEach((e) => {
    if (e && e.expenses) {
      totalSpent += e.expenses.reduce((acc: number, exp: any) => acc + (exp.amount || 0), 0);
      if (e.expenses.length > 0) activeDays++;
    }
    if (e && e.meals) {
      totalMeals += e.meals.length;
    }
  });

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();

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
}

export function generateCalendarInsights(analytics: MonthAnalytics, entries: any[]): CalendarInsight[] {
  const insights: CalendarInsight[] = [];

  if (analytics.activeDays >= 15) {
    insights.push({
      id: "consistent",
      headline: "Strong consistency this month!",
      type: "consistency",
      icon: "CheckCircle",
    });
  }

  if (analytics.totalMeals > 0) {
    insights.push({
      id: "meals",
      headline: `${analytics.totalMeals} meals logged this month`,
      type: "health",
      icon: "Utensils",
    });
  }

  return insights.slice(0, 2);
}

export function buildTimelineEntries(entry: any): TimelineEntry[] {
  const result: TimelineEntry[] = [];
  
  if (!entry) return result;

  entry.expenses?.forEach((expense: any) => {
    result.push({
      id: expense.id,
      type: "expense",
      category: expense.categoryName || "Other",
      label: expense.note?.split(" | ")[0] || expense.categoryName || "Expense",
      amount: expense.amount || 0,
      time: expense.date ? new Date(expense.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }) : "00:00",
      note: expense.note,
      isRecurring: expense.isRecurring,
      icon: "CreditCard",
      color: "text-coral",
    });
  });

  entry.meals?.forEach((meal: any) => {
    result.push({
      id: meal.id,
      type: "meal",
      category: "Meal",
      label: meal.foodName || "Meal",
      amount: meal.estimatedCost || 0,
      time: meal.date ? new Date(meal.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }) : "00:00",
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
}

export function getActivityIndicator(entry: any) {
  return {
    hasSpending: (entry?.expenses?.length || 0) > 0,
    hasMeals: (entry?.meals?.length || 0) > 0,
    mealCount: entry?.meals?.length || 0,
    expenseCount: entry?.expenses?.length || 0,
  };
}