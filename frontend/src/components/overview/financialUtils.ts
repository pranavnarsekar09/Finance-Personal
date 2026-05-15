import { Expense, CategorySpendSummary, Finance, DashboardSummary } from "@/lib/types";
import { parseISO, isWithinInterval, subDays, startOfDay, endOfDay, format, differenceInDays, getDay, getHours } from "date-fns";

export interface FinancialHealth {
  score: number;
  status: "excellent" | "good" | "fair" | "needs-attention";
  budgetHealth: "on-track" | "warning" | "critical";
  overspendingRisk: "low" | "medium" | "high";
  stability: "stable" | "fluctuating" | "improving" | "declining";
}

export interface FinancialInsight {
  id: string;
  headline: string;
  type: "behavior" | "trend" | "warning" | "achievement" | "prediction";
  icon: string;
}

export interface SpendingPace {
  dailyAverage: number;
  expectedDaily: number;
  status: "ahead" | "behind" | "on-track";
  percentOfBudget: number;
  daysRemaining: number;
  runway: number | null;
}

export interface FinancialSummary {
  remaining: number;
  totalSpent: number;
  monthlyBudget: number;
  dailyLimit: number;
  todaySpent: number;
  buffer: number;
  savings: number;
  todayDifference: number;
}

export interface TrendAnalysis {
  weeklyComparison: number;
  strongestDay: string | null;
  weakestDay: string | null;
  dayOfWeekPattern: Record<number, number>;
  hourlyPattern: Record<number, number>;
  isTrendingUp: boolean;
  isTrendingDown: boolean;
}

export function calculateFinancialHealth(
  summary: FinancialSummary,
  pace: SpendingPace,
  previousMonthSpend: number = 0
): FinancialHealth {
  let score = 75;

  if (summary.remaining < 0) {
    score -= 30;
  } else if (summary.monthlyBudget > 0) {
    const budgetUsed = summary.totalSpent / summary.monthlyBudget;
    if (budgetUsed < 0.7) score += 10;
    else if (budgetUsed > 0.95) score -= 20;
  }

  if (pace.status === "ahead") score -= 15;
  else if (pace.status === "behind") score += 10;

  if (previousMonthSpend > 0) {
    const change = (summary.totalSpent - previousMonthSpend) / previousMonthSpend;
    if (change < -0.15) score += 8;
    else if (change > 0.15) score -= 8;
  }

  if (summary.buffer < summary.dailyLimit * 7) score -= 10;
  if (summary.savings > 0) score += 5;

  score = Math.max(0, Math.min(100, score));

  let status: FinancialHealth["status"];
  if (score >= 80) status = "excellent";
  else if (score >= 65) status = "good";
  else if (score >= 50) status = "fair";
  else status = "needs-attention";

  let budgetHealth: FinancialHealth["budgetHealth"] = "on-track";
  if (summary.monthlyBudget > 0) {
    const pct = summary.totalSpent / summary.monthlyBudget;
    if (pct > 1) budgetHealth = "critical";
    else if (pct > 0.85) budgetHealth = "warning";
  }

  let overspendingRisk: FinancialHealth["overspendingRisk"] = "low";
  if (pace.status === "ahead" && pace.dailyAverage > pace.expectedDaily * 1.3) {
    overspendingRisk = "high";
  } else if (pace.status === "ahead") {
    overspendingRisk = "medium";
  }

  let stability: FinancialHealth["stability"] = "stable";
  if (previousMonthSpend > 0) {
    const ratio = summary.totalSpent / previousMonthSpend;
    if (ratio > 1.2) stability = "declining";
    else if (ratio < 0.8) stability = "improving";
  }

  return { score, status, budgetHealth, overspendingRisk, stability };
}

export function calculateSpendingPace(
  totalSpent: number,
  monthlyBudget: number,
  currentDate: Date = new Date()
): SpendingPace {
  const now = currentDate;
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - dayOfMonth;

  const expectedDaily = monthlyBudget / daysInMonth;
  const dailyAverage = dayOfMonth > 0 ? totalSpent / dayOfMonth : 0;

  const percentOfBudget = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;
  const expectedSpentByNow = expectedDaily * dayOfMonth;

  let status: SpendingPace["status"] = "on-track";
  if (dailyAverage > expectedSpentByNow * 1.15) status = "ahead";
  else if (dailyAverage < expectedSpentByNow * 0.85) status = "behind";

  let runway: number | null = null;
  if (dailyAverage > 0 && monthlyBudget > 0) {
    const remaining = monthlyBudget - totalSpent;
    if (remaining > 0) {
      runway = Math.round(remaining / dailyAverage);
    }
  }

  return {
    dailyAverage,
    expectedDaily,
    status,
    percentOfBudget,
    daysRemaining,
    runway,
  };
}

export function analyzeTrend(expenses: Expense[], currentMonth: string): TrendAnalysis {
  const now = new Date();
  const currentMonthExpenses = expenses.filter((e) => e.date.startsWith(currentMonth));
  
  const weekAgo = subDays(now, 7);
  const twoWeeksAgo = subDays(now, 14);
  
  const thisWeekExpenses = currentMonthExpenses.filter((e) => 
    isWithinInterval(parseISO(e.date), { start: weekAgo, end: now })
  );
  const lastWeekExpenses = currentMonthExpenses.filter((e) => 
    isWithinInterval(parseISO(e.date), { start: twoWeeksAgo, end: weekAgo })
  );

  const thisWeekTotal = thisWeekExpenses.reduce((sum, e) => sum + e.amount, 0);
  const lastWeekTotal = lastWeekExpenses.reduce((sum, e) => sum + e.amount, 0);

  const weeklyComparison = lastWeekTotal > 0 
    ? Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100)
    : 0;

  const dayOfWeekTotals: Record<number, number> = {};
  const hourlyTotals: Record<number, number> = {};

  currentMonthExpenses.forEach((e) => {
    const date = parseISO(e.date);
    const day = getDay(date);
    const hour = getHours(date);
    dayOfWeekTotals[day] = (dayOfWeekTotals[day] || 0) + e.amount;
    hourlyTotals[hour] = (hourlyTotals[hour] || 0) + e.amount;
  });

  const sortedDays = Object.entries(dayOfWeekTotals).sort(([, a], [, b]) => b - a);
  const strongestDay = sortedDays[0] ? getDayName(parseInt(sortedDays[0][0])) : null;
  const weakestDay = sortedDays[sortedDays.length - 1] && sortedDays.length > 1 
    ? getDayName(parseInt(sortedDays[sortedDays.length - 1][0])) 
    : null;

  return {
    weeklyComparison,
    strongestDay,
    weakestDay,
    dayOfWeekPattern: dayOfWeekTotals,
    hourlyPattern: hourlyTotals,
    isTrendingUp: weeklyComparison > 15,
    isTrendingDown: weeklyComparison < -15,
  };
}

function getDayName(dayNum: number): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[dayNum] || "";
}

export function generateFinancialInsights(
  health: FinancialHealth,
  pace: SpendingPace,
  trend: TrendAnalysis,
  categoryData: CategorySpendSummary[]
): FinancialInsight[] {
  const insights: FinancialInsight[] = [];

  if (health.budgetHealth === "critical") {
    insights.push({
      id: "budget_critical",
      headline: "Budget threshold exceeded - immediate attention needed",
      type: "warning",
      icon: "AlertTriangle",
    });
  } else if (health.budgetHealth === "warning") {
    insights.push({
      id: "budget_warning",
      headline: "Approaching monthly budget limit",
      type: "warning",
      icon: "AlertCircle",
    });
  }

  if (pace.status === "ahead" && pace.dailyAverage > pace.expectedDaily * 1.2) {
    insights.push({
      id: "overspending",
      headline: `Spending ${Math.round((pace.dailyAverage / pace.expectedDaily - 1) * 100)}% above daily average`,
      type: "warning",
      icon: "TrendingUp",
    });
  } else if (pace.status === "behind" && pace.percentOfBudget < 70) {
    insights.push({
      id: "under_budget",
      headline: "On track to finish under budget this month",
      type: "achievement",
      icon: "CheckCircle",
    });
  }

  if (trend.weeklyComparison > 10) {
    insights.push({
      id: "spending_up",
      headline: `Spending up ${trend.weeklyComparison}% compared to last week`,
      type: "trend",
      icon: "TrendingUp",
    });
  } else if (trend.weeklyComparison < -10) {
    insights.push({
      id: "spending_down",
      headline: `Spending down ${Math.abs(trend.weeklyComparison)}% compared to last week`,
      type: "trend",
      icon: "TrendingDown",
    });
  }

  if (trend.strongestDay) {
    insights.push({
      id: "strongest_day",
      headline: `${trend.strongestDay} tends to be your highest spending day`,
      type: "behavior",
      icon: "Calendar",
    });
  }

  const overBudgetCategories = categoryData.filter((c) => c.spent > c.budget && c.budget > 0);
  if (overBudgetCategories.length > 0) {
    const worst = overBudgetCategories.sort((a, b) => 
      (b.spent / b.budget) - (a.spent / a.budget)
    )[0];
    insights.push({
      id: "category_over",
      headline: `${worst.categoryName} exceeded monthly budget`,
      type: "warning",
      icon: "Target",
    });
  }

  const dominantCategory = categoryData.sort((a, b) => b.spent - a.spent)[0];
  if (dominantCategory && categoryData.length > 0) {
    const totalSpent = categoryData.reduce((sum, c) => sum + c.spent, 0);
    const percentage = Math.round((dominantCategory.spent / totalSpent) * 100);
    if (percentage > 50) {
      insights.push({
        id: "dominant_category",
        headline: `${dominantCategory.categoryName} accounts for ${percentage}% of spending`,
        type: "behavior",
        icon: "PieChart",
      });
    }
  }

  if (health.stability === "improving") {
    insights.push({
      id: "improving",
      headline: "Financial stability is improving compared to last month",
      type: "achievement",
      icon: "TrendingUp",
    });
  }

  if (pace.runway !== null && pace.runway < 7 && pace.percentOfBudget > 80) {
    insights.push({
      id: "runway_low",
      headline: `Estimated runway: ${pace.runway} days remaining`,
      type: "prediction",
      icon: "Clock",
    });
  }

  return insights.slice(0, 3);
}

export function getStatusMessage(health: FinancialHealth, pace: SpendingPace): string {
  if (health.status === "excellent") {
    return "Financial health is excellent";
  }
  
  if (health.budgetHealth === "critical") {
    return "Budget exceeded - immediate action needed";
  }
  
  if (pace.status === "ahead") {
    return "Spending faster than expected";
  }
  
  if (pace.status === "behind") {
    return "Under budget - great pacing";
  }
  
  if (health.overspendingRisk === "high") {
    return "Overspending risk elevated";
  }
  
  if (pace.runway !== null && pace.runway < 14) {
    return `${pace.runway} days of spending remaining`;
  }
  
  return "On track for this month";
}