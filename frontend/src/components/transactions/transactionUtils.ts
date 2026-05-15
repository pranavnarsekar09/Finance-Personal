import { Expense } from "@/lib/types";
import { parseISO, isToday, isYesterday, getDay, getHours, startOfMonth, subMonths, addMonths, format, isAfter, isBefore, differenceInDays } from "date-fns";

export interface TransactionInsight {
  id: string;
  headline: string;
  type: "pattern" | "anomaly" | "trend" | "recurring" | "timing" | "behavior";
  icon: string;
}

export interface TransactionAnalytics {
  totalSpent: number;
  transactionCount: number;
  averageTransaction: number;
  dominantCategory: string | null;
  dominantCategoryPercentage: number;
  categoryFrequency: Record<string, number>;
  recurringCount: number;
  dailyTotals: Record<string, number>;
  hourlyDistribution: Record<number, number>;
  dayOfWeekDistribution: Record<number, number>;
  volatility: number;
  trend: "up" | "down" | "stable";
  trendPercentage: number;
}

export interface DailyTransactionSummary {
  date: string;
  dayLabel: string;
  totalSpent: number;
  transactionCount: number;
  topCategory: string | null;
  isHighestDay: boolean;
  isWithinBudget: boolean;
  budget: number;
}

export interface TransactionContext {
  isRecurring: boolean;
  isWeekend: boolean;
  isHighSpendTime: boolean;
  isUnusualAmount: boolean;
  isLunchTime: boolean;
  isDinnerTime: boolean;
  mealContext: "breakfast" | "lunch" | "dinner" | "snack" | null;
  categoryTrend: "up" | "down" | "stable" | null;
  amountContext: "higher" | "lower" | "average" | null;
}

export function calculateTransactionAnalytics(expenses: Expense[], monthlyBudget: number = 0, selectedDate: Date = new Date()): TransactionAnalytics {
  const selectedMonth = startOfMonth(selectedDate);
  const prevMonth = startOfMonth(subMonths(selectedDate, 1));
  const nextMonth = startOfMonth(addMonths(selectedDate, 1));
  
  const thisMonthExpenses = expenses.filter((e) => {
    const date = parseISO(e.date);
    return isAfter(date, selectedMonth) && isBefore(date, nextMonth);
  });
  const lastMonthExpenses = expenses.filter((e) => {
    const date = parseISO(e.date);
    return isAfter(date, prevMonth) && isBefore(date, selectedMonth);
  });

  const totalSpent = thisMonthExpenses.reduce((acc, e) => acc + e.amount, 0);
  const lastMonthTotal = lastMonthExpenses.reduce((acc, e) => acc + e.amount, 0);
  const transactionCount = thisMonthExpenses.length;
  const averageTransaction = transactionCount > 0 ? totalSpent / transactionCount : 0;

  const categoryFrequency: Record<string, number> = {};
  thisMonthExpenses.forEach((e) => {
    categoryFrequency[e.categoryName] = (categoryFrequency[e.categoryName] || 0) + 1;
  });

  const dominantEntry = Object.entries(categoryFrequency).sort((a, b) => b[1] - a[1])[0];
  const dominantCategory = dominantEntry ? dominantEntry[0] : null;
  const dominantCategoryPercentage = dominantEntry && transactionCount > 0
    ? Math.round((dominantEntry[1] / transactionCount) * 100)
    : 0;

  const recurringCount = thisMonthExpenses.filter((e) => e.isRecurring).length;

  const dailyTotals: Record<string, number> = {};
  thisMonthExpenses.forEach((e) => {
    const dayKey = e.date.split('T')[0];
    dailyTotals[dayKey] = (dailyTotals[dayKey] || 0) + e.amount;
  });

  const hourlyDistribution: Record<number, number> = {};
  const dayOfWeekDistribution: Record<number, number> = {};
  
  thisMonthExpenses.forEach((e) => {
    const date = parseISO(e.date);
    const hour = getHours(date);
    const day = getDay(date);
    hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + e.amount;
    dayOfWeekDistribution[day] = (dayOfWeekDistribution[day] || 0) + e.amount;
  });

  const avgDailySpend = Object.values(dailyTotals).reduce((a, b) => a + b, 0) / Math.max(1, Object.keys(dailyTotals).length);
  const variance = Object.values(dailyTotals).reduce((sum, amt) => sum + Math.pow(amt - avgDailySpend, 2), 0) / Math.max(1, Object.keys(dailyTotals).length);
  const volatility = avgDailySpend > 0 ? Math.round((Math.sqrt(variance) / avgDailySpend) * 100) : 0;

  let trend: "up" | "down" | "stable" = "stable";
  let trendPercentage = 0;
  if (lastMonthTotal > 0) {
    trendPercentage = Math.round(((totalSpent - lastMonthTotal) / lastMonthTotal) * 100);
    if (trendPercentage > 10) trend = "up";
    else if (trendPercentage < -10) trend = "down";
  }

  return {
    totalSpent,
    transactionCount,
    averageTransaction,
    dominantCategory,
    dominantCategoryPercentage,
    categoryFrequency,
    recurringCount,
    dailyTotals,
    hourlyDistribution,
    dayOfWeekDistribution,
    volatility,
    trend,
    trendPercentage,
  };
}

export function generateDailySummaries(expenses: Expense[], budget: number = 0): DailyTransactionSummary[] {
  const grouped: Record<string, Expense[]> = {};
  expenses.forEach((e) => {
    const dateKey = e.date.split('T')[0];
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(e);
  });

  const dailyTotals: Record<string, number> = {};
  Object.values(grouped).forEach((dayExpenses) => {
    const dayKey = dayExpenses[0].date.split('T')[0];
    dailyTotals[dayKey] = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
  });

  const highestDay = Object.entries(dailyTotals).sort((a, b) => b[1] - a[1])[0];

  return Object.entries(grouped)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([dateKey, dayExpenses]) => {
      const date = parseISO(dateKey);
      const totalSpent = dailyTotals[dateKey];
      const categoryCounts: Record<string, number> = {};
      dayExpenses.forEach((e) => {
        categoryCounts[e.categoryName] = (categoryCounts[e.categoryName] || 0) + 1;
      });
      const topCategoryEntry = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

      return {
        date: dateKey,
        dayLabel: getDayLabel(date),
        totalSpent,
        transactionCount: dayExpenses.length,
        topCategory: topCategoryEntry ? topCategoryEntry[0] : null,
        isHighestDay: highestDay && highestDay[0] === dateKey,
        isWithinBudget: budget > 0 ? totalSpent <= budget : true,
        budget: budget > 0 ? budget : 0,
      };
    });
}

function getDayLabel(date: Date): string {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEEE, d MMM");
}

export function getTransactionContext(expense: Expense, averageAmount: number, categoryTrend: Record<string, "up" | "down" | "stable">): TransactionContext {
  const date = parseISO(expense.date);
  const hour = getHours(date);
  const day = getDay(date);
  const isWeekend = day === 0 || day === 6;

  const amountRatio = averageAmount > 0 ? expense.amount / averageAmount : 1;
  
  return {
    isRecurring: expense.isRecurring,
    isWeekend,
    isHighSpendTime: hour >= 18 && hour <= 22,
    isUnusualAmount: amountRatio > 1.5 || amountRatio < 0.5,
    isLunchTime: hour >= 12 && hour <= 14,
    isDinnerTime: hour >= 19 && hour <= 22,
    mealContext: getMealContext(hour),
    categoryTrend: categoryTrend[expense.categoryName] || null,
    amountContext: amountRatio > 1.5 ? "higher" : amountRatio < 0.5 ? "lower" : "average",
  };
}

function getMealContext(hour: number): "breakfast" | "lunch" | "dinner" | "snack" | null {
  if (hour >= 6 && hour <= 10) return "breakfast";
  if (hour >= 11 && hour <= 14) return "lunch";
  if (hour >= 17 && hour <= 21) return "dinner";
  return null;
}

export function generateTransactionInsights(analytics: TransactionAnalytics, dailySummaries: DailyTransactionSummary[]): TransactionInsight[] {
  const insights: TransactionInsight[] = [];

  if (analytics.trendPercentage > 15) {
    insights.push({
      id: "spending_up",
      headline: `Spending is up ${analytics.trendPercentage}% this month`,
      type: "trend",
      icon: "TrendingUp",
    });
  } else if (analytics.trendPercentage < -15) {
    insights.push({
      id: "spending_down",
      headline: `Spending is down ${Math.abs(analytics.trendPercentage)}% this month`,
      type: "trend",
      icon: "TrendingDown",
    });
  }

  if (analytics.dominantCategory && analytics.dominantCategoryPercentage > 40) {
    insights.push({
      id: "dominant_category",
      headline: `${analytics.dominantCategory} dominates ${analytics.dominantCategoryPercentage}% of spending`,
      type: "pattern",
      icon: "PieChart",
    });
  }

  const recurringPercentage = analytics.transactionCount > 0 
    ? Math.round((analytics.recurringCount / analytics.transactionCount) * 100) 
    : 0;
  if (recurringPercentage >= 25) {
    insights.push({
      id: "recurring_pattern",
      headline: `${recurringPercentage}% of transactions are recurring`,
      type: "recurring",
      icon: "RefreshCw",
    });
  }

  const weekendSpend = Object.entries(analytics.dayOfWeekDistribution)
    .filter(([day]) => day === "0" || day === "6")
    .reduce((sum, [, amt]) => sum + amt, 0);
  const weekdaySpend = Object.values(analytics.dayOfWeekDistribution).reduce((a, b) => a + b, 0) - weekendSpend;
  const weekdayCount = Object.keys(analytics.dayOfWeekDistribution).filter(d => d !== "0" && d !== "6").length;
  const avgWeekday = weekdayCount > 0 ? weekdaySpend / weekdayCount : 0;
  const weekendCount = Object.keys(analytics.dayOfWeekDistribution).filter(d => d === "0" || d === "6").length;
  const avgWeekend = weekendCount > 0 ? weekendSpend / weekendCount : 0;

  if (Object.keys(analytics.dayOfWeekDistribution).length === 0) {
    return insights.slice(0, 3);
  }
  
  if (avgWeekend > avgWeekday * 1.3) {
    insights.push({
      id: "weekend_spending",
      headline: "You spend significantly more on weekends",
      type: "timing",
      icon: "Calendar",
    });
  }

  const peakHour = Object.entries(analytics.hourlyDistribution)
    .sort(([, a], [, b]) => b - a)[0];
  if (peakHour && parseInt(peakHour[0]) >= 17 && parseInt(peakHour[0]) <= 21) {
    insights.push({
      id: "evening_spending",
      headline: "Most spending happens in the evening hours",
      type: "timing",
      icon: "Clock",
    });
  }

  if (analytics.volatility > 50) {
    insights.push({
      id: "volatility",
      headline: "Spending varies significantly day to day",
      type: "behavior",
      icon: "Activity",
    });
  }

  const highestDay = dailySummaries.find(d => d.isHighestDay);
  if (highestDay && highestDay.totalSpent > analytics.averageTransaction * 3) {
    insights.push({
      id: "highest_day",
      headline: `${highestDay.dayLabel} was your highest spending day`,
      type: "anomaly",
      icon: "AlertCircle",
    });
  }

  return insights.slice(0, 3);
}

export function calculateCategoryTrend(expenses: Expense[]): Record<string, "up" | "down" | "stable"> {
  const now = new Date();
  const thisMonth = startOfMonth(now);
  const lastMonth = startOfMonth(subMonths(now, 1));

  const thisMonthByCategory: Record<string, number> = {};
  const lastMonthByCategory: Record<string, number> = {};

  expenses.forEach((e) => {
    const date = parseISO(e.date);
    if (isAfter(date, thisMonth)) {
      thisMonthByCategory[e.categoryName] = (thisMonthByCategory[e.categoryName] || 0) + e.amount;
    } else if (isAfter(date, lastMonth) && isBefore(date, thisMonth)) {
      lastMonthByCategory[e.categoryName] = (lastMonthByCategory[e.categoryName] || 0) + e.amount;
    }
  });

  const trends: Record<string, "up" | "down" | "stable"> = {};
  Object.keys(thisMonthByCategory).forEach((cat) => {
    const thisAmt = thisMonthByCategory[cat];
    const lastAmt = lastMonthByCategory[cat] || 0;
    if (lastAmt === 0) {
      trends[cat] = "stable";
    } else {
      const ratio = thisAmt / lastAmt;
      if (ratio > 1.2) trends[cat] = "up";
      else if (ratio < 0.8) trends[cat] = "down";
      else trends[cat] = "stable";
    }
  });

  return trends;
}