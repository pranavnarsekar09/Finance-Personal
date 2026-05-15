import { Income } from "@/lib/types";
import { parseISO, differenceInDays, differenceInMonths, startOfMonth, subMonths, addMonths, format, isAfter } from "date-fns";

export interface IncomeAnalytics {
  totalReceived: number;
  transactionCount: number;
  averageTransaction: number;
  monthlyGrowth: number;
  projectedMonthlyIncome: number;
  stabilityScore: number;
  topSource: string | null;
  topSourcePercentage: number;
  recurringCount: number;
  recurringPercentage: number;
  consistencyScore: number;
  volatilityScore: number;
}

export interface SourceAnalytics {
  name: string;
  total: number;
  count: number;
  percentage: number;
  averageAmount: number;
  firstOccurrence: Date | null;
  lastOccurrence: Date | null;
  daysSinceLastReceived: number | null;
  isRecurring: boolean;
  frequency: string;
  consistency: "low" | "medium" | "high";
  stabilityStatus: "new" | "growing" | "stable" | "long-term";
  stabilityLabel: string;
  monthsActive: number;
  trend: "up" | "down" | "stable";
}

export interface IncomeInsight {
  id: string;
  headline: string;
  type: "growth" | "stability" | "diversity" | "trend" | "health";
  icon: string;
}

export interface MonthlyTrend {
  month: string;
  total: number;
  count: number;
}

export function calculateIncomeAnalytics(incomes: Income[]): IncomeAnalytics {
  const now = new Date();
  const thisMonth = startOfMonth(now);
  const lastMonth = startOfMonth(subMonths(now, 1));

  const thisMonthIncomes = incomes.filter((i) => isAfter(parseISO(i.date), thisMonth));
  const lastMonthIncomes = incomes.filter(
    (i) => {
      const date = parseISO(i.date);
      return isAfter(date, lastMonth) && !isAfter(date, thisMonth);
    }
  );

  const thisMonthTotal = thisMonthIncomes.reduce((acc, i) => acc + i.amount, 0);
  const lastMonthTotal = lastMonthIncomes.reduce((acc, i) => acc + i.amount, 0);

  const totalReceived = incomes.reduce((acc, i) => acc + i.amount, 0);
  const transactionCount = incomes.length;
  const averageTransaction = transactionCount > 0 ? totalReceived / transactionCount : 0;

  const monthlyGrowth = lastMonthTotal > 0
    ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100)
    : thisMonthTotal > 0 ? 100 : 0;

  const recurringIncomes = incomes.filter((i) => i.isRecurring);
  const recurringCount = recurringIncomes.length;
  const recurringPercentage = transactionCount > 0
    ? Math.round((recurringCount / transactionCount) * 100)
    : 0;

  const sourceGroups = groupBySource(incomes);
  const topSource = Object.entries(sourceGroups).sort((a, b) => b[1].total - a[1].total)[0];
  const topSourcePercentage = topSource && totalReceived > 0
    ? Math.round((topSource[1].total / totalReceived) * 100)
    : 0;

  const stabilityScore = calculateStabilityScore(incomes);
  const consistencyScore = calculateConsistencyScore(incomes);
  const volatilityScore = calculateVolatilityScore(incomes);

  const projectedMonthlyIncome = thisMonthTotal > 0
    ? thisMonthTotal
    : averageTransaction * 4;

  return {
    totalReceived,
    transactionCount,
    averageTransaction,
    monthlyGrowth,
    projectedMonthlyIncome,
    stabilityScore,
    topSource: topSource ? topSource[0] : null,
    topSourcePercentage,
    recurringCount,
    recurringPercentage,
    consistencyScore,
    volatilityScore,
  };
}

function groupBySource(incomes: Income[]): Record<string, { total: number; count: number }> {
  const groups: Record<string, { total: number; count: number }> = {};
  incomes.forEach((item) => {
    if (!groups[item.source]) {
      groups[item.source] = { total: 0, count: 0 };
    }
    groups[item.source].total += item.amount;
    groups[item.source].count += 1;
  });
  return groups;
}

export function calculateSourceAnalytics(incomes: Income[], sourceGroups: [string, { total: number; count: number }][]): SourceAnalytics[] {
  const now = new Date();

  return sourceGroups.map(([source, data]) => {
    const sourceIncomes = incomes.filter((i) => i.source === source).sort(
      (a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()
    );

    const firstIncome = sourceIncomes[sourceIncomes.length - 1];
    const lastIncome = sourceIncomes[0];

    const firstDate = firstIncome ? parseISO(firstIncome.date) : null;
    const lastDate = lastIncome ? parseISO(lastIncome.date) : null;

    const daysSinceLast = lastDate ? differenceInDays(now, lastDate) : null;
    const monthsActive = firstDate ? Math.max(1, differenceInMonths(now, firstDate)) : 1;

    const isRecurring = sourceIncomes.some((i) => i.isRecurring);

    let consistency: "low" | "medium" | "high" = "low";
    if (sourceIncomes.length >= 3) {
      const amounts = sourceIncomes.map((i) => i.amount);
      const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const variance = amounts.reduce((sum, a) => sum + Math.pow(a - avg, 2), 0) / amounts.length;
      const cv = Math.sqrt(variance) / avg;
      if (cv < 0.15) consistency = "high";
      else if (cv < 0.4) consistency = "medium";
    } else if (sourceIncomes.length === 2) {
      consistency = "medium";
    }

    let stabilityStatus: "new" | "growing" | "stable" | "long-term";
    let stabilityLabel: string;
    if (monthsActive <= 1) {
      stabilityStatus = "new";
      stabilityLabel = "New source";
    } else if (monthsActive <= 3) {
      stabilityStatus = "growing";
      stabilityLabel = "Growing support";
    } else if (monthsActive <= 6) {
      stabilityStatus = "stable";
      stabilityLabel = `Stable for ${monthsActive} months`;
    } else {
      stabilityStatus = "long-term";
      stabilityLabel = `Reliable for ${monthsActive} months`;
    }

    const trend = calculateSourceTrend(sourceIncomes);

    const daysSinceLabel = daysSinceLast !== null
      ? daysSinceLast === 0
        ? "Today"
        : daysSinceLast === 1
          ? "Yesterday"
          : `${daysSinceLast} days ago`
      : "Never";

    return {
      name: source,
      total: data.total,
      count: data.count,
      percentage: data.total,
      averageAmount: data.count > 0 ? data.total / data.count : 0,
      firstOccurrence: firstDate,
      lastOccurrence: lastDate,
      daysSinceLastReceived: daysSinceLast,
      isRecurring,
      frequency: inferFrequency(sourceIncomes),
      consistency,
      stabilityStatus,
      stabilityLabel: `${stabilityLabel} · Last received ${daysSinceLabel}`,
      monthsActive,
      trend,
    };
  });
}

function calculateSourceTrend(incomes: Income[]): "up" | "down" | "stable" {
  if (incomes.length < 2) return "stable";
  const sorted = [...incomes].sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
  const recent = sorted.slice(-3);
  const older = sorted.slice(0, Math.max(1, Math.floor(sorted.length / 2)));
  const recentAvg = recent.reduce((a, b) => a + b.amount, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b.amount, 0) / older.length;
  const diff = (recentAvg - olderAvg) / olderAvg;
  if (diff > 0.1) return "up";
  if (diff < -0.1) return "down";
  return "stable";
}

function inferFrequency(incomes: Income[]): string {
  if (incomes.length < 2) return "Variable";
  const sorted = [...incomes].sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
  const intervals: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    intervals.push(differenceInDays(parseISO(sorted[i].date), parseISO(sorted[i - 1].date)));
  }
  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  if (avgInterval <= 7) return "Weekly";
  if (avgInterval <= 14) return "Bi-weekly";
  if (avgInterval <= 35) return "Monthly";
  if (avgInterval <= 100) return "Quarterly";
  return "Occasional";
}

function calculateStabilityScore(incomes: Income[]): number {
  if (incomes.length === 0) return 0;
  const sources = new Set(incomes.map((i) => i.source));
  if (sources.size === 1) return 60;
  if (sources.size === 2) return 75;
  if (sources.size >= 3) return 90;
  return 50;
}

function calculateConsistencyScore(incomes: Income[]): number {
  if (incomes.length < 2) return incomes.length === 1 ? 70 : 0;
  const recurring = incomes.filter((i) => i.isRecurring);
  const score = (recurring.length / incomes.length) * 100;
  return Math.round(score);
}

function calculateVolatilityScore(incomes: Income[]): number {
  if (incomes.length < 2) return 50;
  const amounts = incomes.map((i) => i.amount);
  const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const variance = amounts.reduce((sum, a) => sum + Math.pow(a - avg, 2), 0) / amounts.length;
  const cv = avg > 0 ? Math.sqrt(variance) / avg : 0;
  if (cv < 0.1) return 95;
  if (cv < 0.25) return 80;
  if (cv < 0.5) return 60;
  return 40;
}

export function generateMonthlyTrends(incomes: Income[], months: number = 6): MonthlyTrend[] {
  const now = new Date();
  const trends: MonthlyTrend[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(now, i));
    const nextMonth = addMonths(monthStart, 1);
    const monthIncomes = incomes.filter((income) => {
      const date = parseISO(income.date);
      return date >= monthStart && date < nextMonth;
    });

    trends.push({
      month: format(monthStart, "MMM"),
      total: monthIncomes.reduce((acc, i) => acc + i.amount, 0),
      count: monthIncomes.length,
    });
  }

  return trends;
}

export function generateIncomeInsights(
  analytics: IncomeAnalytics,
  sources: SourceAnalytics[]
): IncomeInsight[] {
  const insights: IncomeInsight[] = [];

  if (analytics.monthlyGrowth > 10) {
    insights.push({
      id: "growth",
      headline: `Income is up ${analytics.monthlyGrowth}% from last month`,
      type: "growth",
      icon: "TrendingUp",
    });
  } else if (analytics.monthlyGrowth < -10) {
    insights.push({
      id: "decline",
      headline: `Income decreased ${Math.abs(analytics.monthlyGrowth)}% from last month`,
      type: "trend",
      icon: "TrendingDown",
    });
  } else if (analytics.monthlyGrowth >= 0) {
    insights.push({
      id: "stable",
      headline: "Income remained stable this month",
      type: "stability",
      icon: "Minus",
    });
  }

  if (analytics.stabilityScore >= 80) {
    insights.push({
      id: "diversity",
      headline: `Strong income diversity with ${analytics.transactionCount} transactions`,
      type: "diversity",
      icon: "PieChart",
    });
  }

  if (analytics.recurringPercentage >= 60) {
    insights.push({
      id: "recurring",
      headline: `${analytics.recurringPercentage}% of income is recurring`,
      type: "health",
      icon: "RefreshCw",
    });
  }

  const topSource = sources[0];
  if (topSource && analytics.totalReceived > 0) {
    const topPercentage = Math.round((topSource.total / analytics.totalReceived) * 100);
    if (topPercentage > 50) {
      insights.push({
        id: "dependency",
        headline: `${topSource.name} contributes ${topPercentage}% of income`,
        type: "diversity",
        icon: "AlertCircle",
      });
    }
  }

  if (analytics.topSourcePercentage < 30 && sources.length > 1) {
    insights.push({
      id: "healthy",
      headline: "Income health is strong across multiple sources",
      type: "health",
      icon: "CheckCircle",
    });
  }

  return insights.slice(0, 2);
}

export function getHealthStatus(score: number): { label: string; color: string; bgColor: string } {
  if (score >= 80) {
    return { label: "Excellent", color: "text-emerald-600", bgColor: "bg-emerald-500" };
  }
  if (score >= 60) {
    return { label: "Good", color: "text-mint", bgColor: "bg-mint" };
  }
  if (score >= 40) {
    return { label: "Fair", color: "text-sun", bgColor: "bg-sun" };
  }
  return { label: "Needs attention", color: "text-coral", bgColor: "bg-coral" };
}

export function getStabilityLabel(score: number): { label: string; description: string } {
  if (score >= 80) {
    return { label: "Strong", description: "Consistent and reliable" };
  }
  if (score >= 60) {
    return { label: "Stable", description: "Generally consistent" };
  }
  if (score >= 40) {
    return { label: "Moderate", description: "Some fluctuations" };
  }
  return { label: "Growing", description: "Building foundation" };
}