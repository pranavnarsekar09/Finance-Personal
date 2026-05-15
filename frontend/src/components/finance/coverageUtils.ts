import { CoveredExpense } from "@/lib/types";
import { parseISO, differenceInMonths, isBefore, startOfMonth, addMonths, format } from "date-fns";

export interface CoverageAnalytics {
  monthlyTotal: number;
  totalAnnual: number;
  expensesCount: number;
  activeCount: number;
  supportProviders: string[];
  uniqueProviders: number;
  byProvider: Record<string, { count: number; monthlyTotal: number; percentage: number }>;
  byCategory: Record<string, { count: number; monthlyTotal: number; percentage: number }>;
  burdenReduction: number;
  stabilityScore: number;
  upcomingDeadlines: { name: string; provider: string; dueDate: string; daysUntil: number }[];
}

export interface CoverageInsight {
  headline: string;
  summary: string;
  type: "support" | "burden" | "stability" | "education" | "family";
}

export function calculateCoverageAnalytics(
  expenses: CoveredExpense[],
  monthlySpent?: number
): CoverageAnalytics {
  const monthlyTotal = expenses.reduce((total, expense) => {
    switch (expense.frequency) {
      case "monthly":
        return total + expense.amount;
      case "semester":
        return total + expense.amount / 6;
      case "yearly":
        return total + expense.amount / 12;
      default:
        return total + expense.amount;
    }
  }, 0);

  const totalAnnual = monthlyTotal * 12;

  const supportProviders = expenses.map((e) => e.whoCovers);
  const uniqueProviders = new Set(supportProviders).size;

  const byProvider: Record<string, { count: number; monthlyTotal: number; percentage: number }> = {};
  expenses.forEach((expense) => {
    const provider = expense.whoCovers;
    const monthlyAmount =
      expense.frequency === "monthly"
        ? expense.amount
        : expense.frequency === "semester"
        ? expense.amount / 6
        : expense.amount / 12;

    if (!byProvider[provider]) {
      byProvider[provider] = { count: 0, monthlyTotal: 0, percentage: 0 };
    }
    byProvider[provider].count += 1;
    byProvider[provider].monthlyTotal += monthlyAmount;
  });

  Object.keys(byProvider).forEach((provider) => {
    byProvider[provider].percentage = (byProvider[provider].monthlyTotal / monthlyTotal) * 100 || 0;
  });

  const byCategory: Record<string, { count: number; monthlyTotal: number; percentage: number }> = {};
  expenses.forEach((expense) => {
    const category = categorizeExpense(expense.name);
    const monthlyAmount =
      expense.frequency === "monthly"
        ? expense.amount
        : expense.frequency === "semester"
        ? expense.amount / 6
        : expense.amount / 12;

    if (!byCategory[category]) {
      byCategory[category] = { count: 0, monthlyTotal: 0, percentage: 0 };
    }
    byCategory[category].count += 1;
    byCategory[category].monthlyTotal += monthlyAmount;
  });

  Object.keys(byCategory).forEach((category) => {
    byCategory[category].percentage = (byCategory[category].monthlyTotal / monthlyTotal) * 100 || 0;
  });

  const burdenReduction = monthlySpent
    ? Math.round((monthlyTotal / (monthlyTotal + monthlySpent)) * 100)
    : 0;

  const stabilityScore = calculateStabilityScore(expenses);

  const today = startOfMonth(new Date());
  const upcomingDeadlines = expenses
    .map((expense) => {
      const nextDate = parseISO(expense.nextDueDate);
      let projectedDate = nextDate;

      while (isBefore(projectedDate, today)) {
        switch (expense.frequency) {
          case "monthly":
            projectedDate = addMonths(projectedDate, 1);
            break;
          case "semester":
            projectedDate = addMonths(projectedDate, 6);
            break;
          case "yearly":
            projectedDate = addMonths(projectedDate, 12);
            break;
        }
      }

      const daysUntil = Math.ceil((projectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      return {
        name: expense.name,
        provider: expense.whoCovers,
        dueDate: format(projectedDate, "MMM yyyy"),
        daysUntil,
      };
    })
    .filter((d) => d.daysUntil <= 30)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  const activeCount = expenses.length;

  return {
    monthlyTotal,
    totalAnnual,
    expensesCount: expenses.length,
    activeCount,
    supportProviders,
    uniqueProviders,
    byProvider,
    byCategory,
    burdenReduction,
    stabilityScore,
    upcomingDeadlines,
  };
}

function categorizeExpense(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("tiffin") || lower.includes("food") || lower.includes("mess")) {
    return "Food";
  }
  if (lower.includes("rent") || lower.includes("hostel") || lower.includes("accommodation")) {
    return "Accommodation";
  }
  if (lower.includes("fee") || lower.includes("semester") || lower.includes("education") || lower.includes("tuition")) {
    return "Education";
  }
  if (lower.includes("transport") || lower.includes("travel") || lower.includes("bus") || lower.includes("train")) {
    return "Transport";
  }
  return "Other";
}

function calculateStabilityScore(expenses: CoveredExpense[]): number {
  if (expenses.length === 0) return 0;

  const now = new Date();
  let totalMonths = 0;
  let count = 0;

  expenses.forEach((expense) => {
    const created = parseISO(expense.createdAt);
    const monthsActive = differenceInMonths(now, created);
    if (monthsActive > 0) {
      totalMonths += monthsActive;
      count++;
    }
  });

  const avgMonths = count > 0 ? totalMonths / count : 0;

  if (avgMonths >= 12) return 100;
  if (avgMonths >= 6) return 80;
  if (avgMonths >= 3) return 60;
  if (avgMonths >= 1) return 40;
  return 20;
}

export function generateCoverageInsights(
  analytics: CoverageAnalytics,
  expenses: CoveredExpense[]
): CoverageInsight[] {
  const insights: CoverageInsight[] = [];

  if (analytics.burdenReduction > 0) {
    insights.push({
      headline: `Family support reduces your monthly burden by ${analytics.burdenReduction}%`,
      summary: "Your family's contribution significantly lowers your financial stress.",
      type: "burden",
    });
  }

  const topProvider = Object.entries(analytics.byProvider).sort(
    (a, b) => b[1].monthlyTotal - a[1].monthlyTotal
  )[0];

  if (topProvider) {
    insights.push({
      headline: `${topProvider[0]} provides ${Math.round(topProvider[1].percentage)}% of your covered support`,
      summary: `${topProvider[1].count} expense${topProvider[1].count > 1 ? "s" : ""} covered by ${topProvider[0]}.`,
      type: "support",
    });
  }

  const educationTotal = analytics.byCategory["Education"]?.monthlyTotal || 0;
  const foodTotal = analytics.byCategory["Food"]?.monthlyTotal || 0;

  if (educationTotal > 0 && educationTotal >= foodTotal) {
    insights.push({
      headline: "Education expenses are your largest covered category",
      summary: `₹${Math.round(educationTotal * 100) / 100}/month supported for education.`,
      type: "education",
    });
  } else if (foodTotal > 0) {
    insights.push({
      headline: "Food & mess expenses are covered by your family",
      summary: `₹${Math.round(foodTotal * 100) / 100}/month for dining support.`,
      type: "support",
    });
  }

  if (analytics.stabilityScore >= 60) {
    insights.push({
      headline: "Support has remained stable over recent months",
      summary: `Your coverage is consistent with a ${analytics.stabilityScore}% stability score.`,
      type: "stability",
    });
  }

  if (analytics.upcomingDeadlines.length > 0) {
    const next = analytics.upcomingDeadlines[0];
    insights.push({
      headline: `Next: ${next.name} due ${next.dueDate}`,
      summary: `Due in ${next.daysUntil} days - covered by ${next.provider}.`,
      type: "support",
    });
  }

  if (analytics.uniqueProviders > 1) {
    insights.push({
      headline: `${analytics.uniqueProviders} family members contribute to your support`,
      summary: "Diverse support network provides financial stability.",
      type: "family",
    });
  }

  return insights.slice(0, 3);
}

export function getExpenseStability(expense: CoveredExpense): {
  status: "new" | "growing" | "stable" | "long-term";
  label: string;
  monthsActive: number;
} {
  const created = parseISO(expense.createdAt);
  const now = new Date();
  const monthsActive = Math.max(1, differenceInMonths(now, created));

  let status: "new" | "growing" | "stable" | "long-term";
  let label: string;

  if (monthsActive <= 1) {
    status = "new";
    label = "New support";
  } else if (monthsActive <= 3) {
    status = "growing";
    label = "Growing support";
  } else if (monthsActive <= 6) {
    status = "stable";
    label = "Stable for 3+ months";
  } else {
    status = "long-term";
    label = `Stable for ${monthsActive} months`;
  }

  return { status, label, monthsActive };
}

export function formatFrequencyLabel(frequency: string): string {
  switch (frequency) {
    case "monthly":
      return "Monthly";
    case "semester":
      return "Every 6 months";
    case "yearly":
      return "Yearly";
    default:
      return frequency;
  }
}

export function getMonthlyEquivalent(expense: CoveredExpense): number {
  switch (expense.frequency) {
    case "monthly":
      return expense.amount;
    case "semester":
      return expense.amount / 6;
    case "yearly":
      return expense.amount / 12;
    default:
      return expense.amount;
  }
}