import type { ScoreItem, DayPattern, FinancialInsight, HealthInsight, BehavioralPattern, Prediction, Recommendation, CoachMessage, SystemStatus, WeeklySummary, InsightsData } from "../types";
import type { DashboardSummary, Expense, FoodLog, CoveredExpense, Finance, Goal, AiDashboard } from "@/lib/types";
import { format, subDays, subWeeks, getDay, startOfWeek, endOfWeek, parseISO } from "date-fns";

export function calculateCompositeScore(scores: ScoreItem[]): number {
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((sum, s) => sum + s.value, 0) / scores.length);
}

export function determineSystemStatus(
  financialScore: number,
  nutritionScore: number,
  disciplineScore: number
): SystemStatus[] {
  return [
    {
      type: "financial",
      label: "Financial Health",
      status: financialScore >= 70 ? "stable" : financialScore >= 50 ? "improving" : "needs-attention",
    },
    {
      type: "nutrition",
      label: "Nutrition",
      status: nutritionScore >= 70 ? "stable" : nutritionScore >= 50 ? "improving" : "critical",
    },
    {
      type: "habits",
      label: "Habits",
      status: disciplineScore >= 70 ? "stable" : disciplineScore >= 50 ? "improving" : "needs-attention",
    },
  ];
}

export function generateWeeklySummaries(
  thisWeekExpenses: Expense[],
  lastWeekExpenses: Expense[],
  thisWeekMeals: FoodLog[],
  lastWeekMeals: FoodLog[]
): WeeklySummary[] {
  const summaries: WeeklySummary[] = [];
  
  const thisWeekTotal = thisWeekExpenses.reduce((sum, e) => sum + e.amount, 0);
  const lastWeekTotal = lastWeekExpenses.reduce((sum, e) => sum + e.amount, 0);
  const spendingChange = lastWeekTotal > 0 ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100 : 0;

  if (spendingChange < -10) {
    summaries.push({
      id: "spending-down",
      message: `You spent ${Math.abs(Math.round(spendingChange))}% less this week. Great progress!`,
      type: "positive",
      icon: "trending-down",
    });
  } else if (spendingChange > 10) {
    summaries.push({
      id: "spending-up",
      message: `Spending increased by ${Math.round(spendingChange)}% this week.`,
      type: "warning",
      icon: "trending-up",
    });
  }

  const thisWeekProtein = thisWeekMeals.reduce((sum, m) => sum + (m.protein || 0), 0);
  const lastWeekProtein = lastWeekMeals.reduce((sum, m) => sum + (m.protein || 0), 0);
  
  if (thisWeekProtein > lastWeekProtein * 1.1) {
    summaries.push({
      id: "protein-improving",
      message: "Protein intake improved compared to last week.",
      type: "positive",
      icon: "target",
    });
  }

  const weekendExpenses = thisWeekExpenses.filter(e => {
    const day = getDay(parseISO(e.date));
    return day === 0 || day === 6;
  });
  const weekdayExpenses = thisWeekExpenses.filter(e => {
    const day = getDay(parseISO(e.date));
    return day !== 0 && day !== 6;
  });

  const weekendAvg = weekendExpenses.length > 0 ? weekendExpenses.reduce((s, e) => s + e.amount, 0) / weekendExpenses.length : 0;
  const weekdayAvg = weekdayExpenses.length > 0 ? weekdayExpenses.reduce((s, e) => s + e.amount, 0) / weekdayExpenses.length : 0;

  if (weekendAvg > weekdayAvg * 1.3) {
    summaries.push({
      id: "weekend-spending",
      message: "Weekend food spending continues to exceed weekday averages.",
      type: "neutral",
      icon: "percent",
    });
  }

  const thisWeekMealDays = new Set(thisWeekMeals.map(m => m.date)).size;
  const lastWeekMealDays = new Set(lastWeekMeals.map(m => m.date)).size;
  
  if (thisWeekMealDays > lastWeekMealDays) {
    summaries.push({
      id: "meal-consistency",
      message: "Meal consistency improved compared to last week.",
      type: "positive",
      icon: "flame",
    });
  }

  return summaries;
}

export function calculateScores(
  dashboard: DashboardSummary | undefined,
  finance: Finance | undefined,
  goals: Goal[]
): ScoreItem[] {
  const monthlyBudget = dashboard?.monthlyBudget || 0;
  const totalSpent = dashboard?.totalSpent || 0;
  const remaining = dashboard?.remainingBudget || 0;
  const streak = dashboard?.streak || 0;
  const caloriesToday = dashboard?.caloriesToday || 0;
  const calorieGoal = dashboard?.calorieGoal || 2000;
  const savings = finance?.savings || 0;
  const buffer = finance?.buffer || 0;

  const moneyScore = Math.min(100, Math.max(0, Math.round((remaining / monthlyBudget) * 100)));
  const nutritionScore = Math.min(100, Math.round((caloriesToday / calorieGoal) * 100));
  const disciplineScore = Math.min(100, Math.round(Math.min(streak * 10, 100)));
  const stabilityScore = Math.min(100, Math.max(0, Math.round(((buffer + savings) / monthlyBudget) * 50 + 50)));
  const consistencyScore = Math.min(100, Math.round((streak / 30) * 100));

  return [
    {
      name: "money",
      value: moneyScore,
      trend: moneyScore > 50 ? "up" : "down",
      changePercent: Math.round((Math.random() * 20) - 10),
      label: "Money",
      description: "Budget remaining vs monthly limit",
    },
    {
      name: "nutrition",
      value: nutritionScore,
      trend: nutritionScore > 70 ? "up" : nutritionScore < 30 ? "down" : "flat",
      changePercent: Math.round((Math.random() * 30) - 15),
      label: "Nutrition",
      description: "Today's calorie intake vs goal",
    },
    {
      name: "discipline",
      value: disciplineScore,
      trend: streak > 3 ? "up" : "flat",
      changePercent: streak > 0 ? Math.round(streak * 2) : 0,
      label: "Discipline",
      description: "Current logging streak",
    },
    {
      name: "stability",
      value: stabilityScore,
      trend: stabilityScore > 60 ? "up" : "down",
      changePercent: Math.round((savings / 1000)),
      label: "Stability",
      description: "Buffer + savings position",
    },
    {
      name: "consistency",
      value: consistencyScore,
      trend: consistencyScore > 50 ? "up" : "flat",
      changePercent: Math.round((streak / 30) * 20),
      label: "Consistency",
      description: "30-day streak potential",
    },
  ];
}

export function generateFinancialInsights(
  expenses: Expense[],
  finance: Finance,
  coveredExpenses: CoveredExpense[],
  dashboard: DashboardSummary | undefined,
  aiPredictions?: { title: string; detail: string; tone: string }[]
): FinancialInsight[] {
  const insights: FinancialInsight[] = [];

  const now = new Date();
  const thisMonth = expenses.filter(e => {
    const d = parseISO(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const lastMonth = expenses.filter(e => {
    const d = parseISO(e.date);
    const lastMonthDate = subDays(now, 30);
    return d >= lastMonthDate && d < startOfMonth(now);
  });

  const categoryTotals: Record<string, number> = {};
  thisMonth.forEach(e => {
    categoryTotals[e.categoryName] = (categoryTotals[e.categoryName] || 0) + e.amount;
  });

  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  if (topCategory) {
    const lastMonthCategory = lastMonth.filter(e => e.categoryName === topCategory[0]);
    const lastMonthTotal = lastMonthCategory.reduce((s, e) => s + e.amount, 0);
    const change = lastMonthTotal > 0 ? ((topCategory[1] - lastMonthTotal) / lastMonthTotal) * 100 : 0;
    
    insights.push({
      id: "category-drift",
      type: "category-drift",
      title: `${topCategory[0]} Spending`,
      value: formatRupees(topCategory[1]),
      subtitle: change !== 0 ? `${change > 0 ? "+" : ""}${Math.round(change)}% vs last month` : undefined,
      trend: change > 0 ? "up" : "down",
      change: Math.round(change),
      severity: change > 20 ? "warning" : change < -10 ? "success" : "neutral",
    });
  }

  const weekdayExpenses = thisMonth.filter(e => {
    const day = getDay(parseISO(e.date));
    return day >= 1 && day <= 5;
  });
  const weekendExpenses = thisMonth.filter(e => {
    const day = getDay(parseISO(e.date));
    return day === 0 || day === 6;
  });

  const weekdayTotal = weekdayExpenses.reduce((s, e) => s + e.amount, 0);
  const weekendTotal = weekendExpenses.reduce((s, e) => s + e.amount, 0);
  const weekdayAvg = weekdayExpenses.length > 0 ? weekdayTotal / weekdayExpenses.length : 0;
  const weekendAvg = weekendExpenses.length > 0 ? weekendTotal / weekendExpenses.length : 0;
  
  if (weekendAvg > 0 && weekdayAvg > 0) {
    const weekendPremium = ((weekendAvg - weekdayAvg) / weekdayAvg) * 100;
    insights.push({
      id: "weekend-behavior",
      type: "weekday-weekend",
      title: "Weekend vs Weekday",
      value: `${Math.round(weekendPremium)}%`,
      subtitle: "higher weekend spending",
      trend: weekendPremium > 20 ? "up" : "flat",
      severity: weekendPremium > 50 ? "critical" : weekendPremium > 20 ? "warning" : "neutral",
    });
  }

  const dailyLimit = finance?.dailyLimit || 100;
  const buffer = finance?.buffer || 0;
  const dailySpend = thisMonth.length > 0 
    ? thisMonth.reduce((s, e) => s + e.amount, 0) / Math.max(1, new Date().getDate())
    : 0;
  const runwayDays = dailySpend > 0 ? Math.round((buffer + finance?.savings || 0) / dailySpend) : 999;
  
  const budgetPrediction = aiPredictions?.find(p => 
    p.title.toLowerCase().includes("budget") || p.title.toLowerCase().includes("runway") || p.title.toLowerCase().includes("survival")
  );
  
  const runwayValue = budgetPrediction 
    ? budgetPrediction.detail.match(/\d+/)?.[0] + " days" 
    : `${runwayDays} days`;
  
  insights.push({
    id: "budget-runway",
    type: "budget-runway",
    title: "Budget Runway",
    value: runwayValue,
    subtitle: budgetPrediction ? "AI predicted" : "at current daily spend",
    severity: budgetPrediction 
      ? (budgetPrediction.tone === "positive" ? "success" : budgetPrediction.tone === "warning" ? "warning" : "neutral")
      : runwayDays > 30 ? "success" : runwayDays > 7 ? "warning" : "critical",
    trend: budgetPrediction 
      ? (budgetPrediction.tone === "positive" ? "up" : "down")
      : undefined,
  });

  const savings = finance?.savings || 0;
  const monthlySavings = dashboard?.monthlySavings || 0;
  insights.push({
    id: "savings-forecast",
    type: "savings-forecast",
    title: "Monthly Savings",
    value: formatRupees(monthlySavings),
    subtitle: monthlySavings > 0 ? "positive flow" : "depleted",
    trend: monthlySavings > 0 ? "up" : "down",
    severity: monthlySavings > 0 ? "success" : "critical",
  });

  const coveredMonthly = coveredExpenses.filter(e => e.frequency === "monthly").reduce((s, e) => s + e.amount, 0);
  const coveredSemester = coveredExpenses.filter(e => e.frequency === "semester").reduce((s, e) => s + e.amount, 0) / 6;
  const coveredYearly = coveredExpenses.filter(e => e.frequency === "yearly").reduce((s, e) => s + e.amount, 0) / 12;
  const totalCovered = coveredMonthly + coveredSemester + coveredYearly;
  
  if (coveredExpenses.length > 0) {
    insights.push({
      id: "coverage",
      type: "coverage",
      title: "Covered by Others",
      value: formatRupees(totalCovered),
      subtitle: "equivalent monthly value",
      severity: "success",
    });
  }

  const foodExpenses = thisMonth.filter(e => 
    e.categoryName.toLowerCase().includes("food") || 
    e.categoryName.toLowerCase().includes("meal") ||
    e.categoryName.toLowerCase().includes("tiffin")
  );
  const foodTotal = foodExpenses.reduce((s, e) => s + e.amount, 0);
  const foodPercent = thisMonth.length > 0 ? (foodTotal / thisMonth.reduce((s, e) => s + e.amount, 0)) * 100 : 0;
  
  if (foodTotal > 0) {
    insights.push({
      id: "food-spending",
      type: "spending-personality",
      title: "Food Spending",
      value: formatRupees(foodTotal),
      subtitle: `${Math.round(foodPercent)}% of total`,
      trend: foodPercent > 40 ? "up" : "flat",
      severity: foodPercent > 50 ? "warning" : "neutral",
    });
  }

  const overspendDays = thisMonth.filter(e => e.amount > dailyLimit).length;
  if (overspendDays > 0) {
    insights.push({
      id: "overspending",
      type: "overspending",
      title: "Overspending Days",
      value: overspendDays,
      subtitle: "days over daily limit",
      trend: overspendDays > 5 ? "up" : "flat",
      severity: overspendDays > 10 ? "critical" : overspendDays > 5 ? "warning" : "neutral",
    });
  }

  return insights;
}

export function generateHealthInsights(
  meals: FoodLog[],
  dashboard: DashboardSummary | undefined
): HealthInsight[] {
  const insights: HealthInsight[] = [];
  const now = new Date();
  
  const thisWeekMeals = meals.filter(m => {
    const d = parseISO(m.date);
    const weekStart = startOfWeek(now);
    return d >= weekStart;
  });

  const lastWeekMeals = meals.filter(m => {
    const d = parseISO(m.date);
    const lastWeekStart = startOfWeek(subWeeks(now, 1));
    const lastWeekEnd = endOfWeek(subWeeks(now, 1));
    return d >= lastWeekStart && d <= lastWeekEnd;
  });

  const thisWeekDays = new Set(thisWeekMeals.map(m => m.date)).size;
  const consistencyScore = Math.min(100, Math.round((thisWeekDays / 7) * 100));
  insights.push({
    id: "consistency",
    type: "consistency",
    title: "Meal Consistency",
    value: `${consistencyScore}%`,
    subtitle: `${thisWeekDays}/7 days logged`,
    trend: thisWeekDays >= 5 ? "up" : "flat",
    severity: consistencyScore >= 70 ? "success" : consistencyScore >= 50 ? "warning" : "critical",
  });

  const thisWeekProtein = thisWeekMeals.reduce((s, m) => s + (m.protein || 0), 0);
  const lastWeekProtein = lastWeekMeals.reduce((s, m) => s + (m.protein || 0), 0);
  const proteinChange = lastWeekProtein > 0 ? ((thisWeekProtein - lastWeekProtein) / lastWeekProtein) * 100 : 0;
  
  const avgDailyProtein = thisWeekDays > 0 ? thisWeekProtein / thisWeekDays : 0;
  insights.push({
    id: "protein-trend",
    type: "protein-trend",
    title: "Protein Intake",
    value: `${Math.round(avgDailyProtein)}g`,
    subtitle: "avg daily",
    trend: proteinChange > 0 ? "up" : "down",
    change: Math.round(proteinChange),
    severity: avgDailyProtein >= 50 ? "success" : avgDailyProtein >= 30 ? "warning" : "critical",
  });

  const thisWeekCalories = thisWeekMeals.reduce((s, m) => s + (m.calories || 0), 0);
  const calorieGoal = dashboard?.calorieGoal || 2000;
  const calorieAdherence = Math.min(100, Math.round((thisWeekCalories / (calorieGoal * thisWeekDays)) * 100));
  
  insights.push({
    id: "calorie-adherence",
    type: "calorie-adherence",
    title: "Calorie Adherence",
    value: `${calorieAdherence}%`,
    subtitle: "vs daily goal average",
    trend: calorieAdherence >= 80 ? "up" : calorieAdherence < 50 ? "down" : "flat",
    severity: calorieAdherence >= 80 ? "success" : calorieAdherence >= 50 ? "warning" : "critical",
  });

  const thisWeekCarbs = thisWeekMeals.reduce((s, m) => s + (m.carbs || 0), 0);
  const thisWeekFat = thisWeekMeals.reduce((s, m) => s + (m.fat || 0), 0);
  const totalMacros = thisWeekProtein + thisWeekCarbs + thisWeekFat;
  
  if (totalMacros > 0) {
    const proteinPercent = Math.round((thisWeekProtein / totalMacros) * 100);
    const carbsPercent = Math.round((thisWeekCarbs / totalMacros) * 100);
    const fatPercent = Math.round((thisWeekFat / totalMacros) * 100);
    
    insights.push({
      id: "macro-balance",
      type: "macro-balance",
      title: "Macro Balance",
      value: `${proteinPercent}/${carbsPercent}/${fatPercent}`,
      subtitle: "P/C/F split",
      trend: proteinPercent >= 30 ? "up" : "flat",
      severity: proteinPercent >= 25 ? "success" : "warning",
    });
  }

  const thisWeekCost = thisWeekMeals.reduce((s, m) => s + (m.estimatedCost || 0), 0);
  const costPerGramProtein = thisWeekProtein > 0 ? thisWeekCost / thisWeekProtein : 0;
  
  insights.push({
    id: "food-cost",
    type: "food-cost-correlation",
    title: "Cost per Protein g",
    value: formatRupees(costPerGramProtein),
    subtitle: "lower is better value",
    trend: costPerGramProtein < 1 ? "up" : "down",
    severity: costPerGramProtein < 0.5 ? "success" : costPerGramProtein < 1 ? "warning" : "critical",
  });

  return insights;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function generateDayPatterns(expenses: Expense[], meals: FoodLog[]): DayPattern[] {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayData: Record<number, { spending: number; meals: number; calories: number; count: number }> = {};
  
  for (let i = 0; i < 7; i++) {
    dayData[i] = { spending: 0, meals: 0, calories: 0, count: 0 };
  }

  const now = new Date();
  const weekStart = startOfWeek(now);
  
  const thisWeekExpenses = expenses.filter(e => {
    const d = parseISO(e.date);
    return d >= weekStart;
  });

  thisWeekExpenses.forEach(e => {
    const day = getDay(parseISO(e.date));
    dayData[day].spending += e.amount;
    dayData[day].count++;
  });

  const thisWeekMeals = meals.filter(m => {
    const d = parseISO(m.date);
    return d >= weekStart;
  });

  thisWeekMeals.forEach(m => {
    const day = getDay(parseISO(m.date));
    dayData[day].meals++;
    dayData[day].calories += m.calories || 0;
  });

  const patterns: DayPattern[] = days.map((day, index) => {
    const data = dayData[index];
    const avgCalories = data.meals > 0 ? data.calories / data.meals : 0;
    const disciplineScore = Math.min(100, Math.round((data.meals / 3) * 50 + (data.count === 0 ? 0 : 50)));
    
    return {
      day,
      dayIndex: index,
      spendingAmount: Math.round(data.spending),
      mealCount: data.meals,
      avgCalories: Math.round(avgCalories),
      disciplineScore,
      isBestDay: false,
      isWorstDay: false,
    };
  });

  const maxSpending = Math.max(...patterns.map(p => p.spendingAmount));
  const minSpending = Math.min(...patterns.filter(p => p.spendingAmount > 0).map(p => p.spendingAmount));
  const maxDiscipline = Math.max(...patterns.map(p => p.disciplineScore));

  return patterns.map(p => ({
    ...p,
    isBestDay: p.disciplineScore === maxDiscipline && maxDiscipline > 50,
    isWorstDay: p.spendingAmount === maxSpending && maxSpending > minSpending * 1.5,
  }));
}

export function generateBehavioralPatterns(
  dayPatterns: DayPattern[],
  expenses: Expense[],
  meals: FoodLog[],
  streak: number
): BehavioralPattern[] {
  const patterns: BehavioralPattern[] = [];

  const bestDay = dayPatterns.find(p => p.isBestDay);
  if (bestDay) {
    patterns.push({
      id: "best-day",
      type: "best-day",
      title: "Most Disciplined Day",
      value: bestDay.day,
      description: `${bestDay.mealCount} meals logged, ${bestDay.disciplineScore}% discipline score`,
      day: bestDay.day,
    });
  }

  const worstDay = dayPatterns.find(p => p.isWorstDay);
  if (worstDay) {
    patterns.push({
      id: "worst-day",
      type: "worst-day",
      title: "Highest Spending Day",
      value: worstDay.day,
      description: `Avg ${formatRupees(worstDay.spendingAmount)} spent`,
      day: worstDay.day,
    });
  }

  const spendingValues = dayPatterns.filter(p => p.spendingAmount > 0).map(p => p.spendingAmount);
  if (spendingValues.length > 1) {
    const avg = spendingValues.reduce((s, v) => s + v, 0) / spendingValues.length;
    const variance = spendingValues.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / spendingValues.length;
    const stdDev = Math.sqrt(variance);
    const cv = (stdDev / avg) * 100;
    
    patterns.push({
      id: "spending-consistency",
      type: "spending-consistency",
      title: "Spending Consistency",
      value: cv < 30 ? "Stable" : cv < 60 ? "Variable" : "Irregular",
      description: `${Math.round(cv)}% coefficient of variation`,
    });
  }

  const overspendDays = dayPatterns.filter(p => p.spendingAmount > 200);
  if (overspendDays.length > 0) {
    patterns.push({
      id: "overspending-pattern",
      type: "pattern-detection",
      title: "Overspending Pattern",
      value: `${overspendDays.length} high-spend days`,
      description: "Detected above-average spending days this week",
    });
  }

  if (streak > 0) {
    patterns.push({
      id: "streak-recovery",
      type: "streak-recovery",
      title: "Streak Performance",
      value: `${streak} day streak`,
      description: streak >= 7 ? "Excellent consistency maintained" : "Keep going to build momentum",
    });
  }

  return patterns;
}

export function generatePredictions(
  finance: Finance | undefined,
  savings: number,
  monthlyBudget: number,
  goals: Goal[]
): Prediction[] {
  const predictions: Prediction[] = [];

  const buffer = finance?.buffer || 0;
  const dailySpend = finance?.dailyLimit || 100;
  const daysRemaining = dailySpend > 0 ? Math.round((buffer + savings) / dailySpend) : 999;
  
  predictions.push({
    id: "budget-survival",
    type: "budget-survival",
    title: "Budget Survival",
    value: `${daysRemaining} days`,
    timeframe: "until month end",
    confidence: daysRemaining > 14 ? "high" : daysRemaining > 7 ? "medium" : "low",
    trend: daysRemaining > 14 ? "positive" : daysRemaining > 7 ? "neutral" : "negative",
    isPositive: daysRemaining > 7,
  });

  const savingsGoal = goals.find(g => g.type === "SAVINGS");
  if (savingsGoal && savingsGoal.targetAmount > 0) {
    const remaining = savingsGoal.targetAmount - savingsGoal.currentAmount;
    const monthlyRate = savings;
    const monthsToGoal = monthlyRate > 0 ? Math.ceil(remaining / monthlyRate) : 999;
    
    predictions.push({
      id: "savings-goal",
      type: "savings-goal",
      title: "Savings Goal Progress",
      value: `${monthsToGoal} months`,
      timeframe: "to reach goal",
      confidence: monthlyRate > 0 ? "medium" : "low",
      trend: monthlyRate > 0 ? "positive" : "negative",
      isPositive: monthsToGoal <= 6,
    });
  }

  const monthlySavingsRate = savings;
  const projectedSavings = monthlySavingsRate * 6;
  
  predictions.push({
    id: "semester-forecast",
    type: "semester-runway",
    title: "6-Month Projection",
    value: formatRupees(projectedSavings),
    timeframe: "semester forecast",
    confidence: monthlySavingsRate > 0 ? "medium" : "low",
    trend: monthlySavingsRate > 0 ? "positive" : "negative",
    isPositive: projectedSavings > monthlyBudget,
  });

  return predictions;
}

export function generateRecommendations(
  financialInsights: FinancialInsight[],
  healthInsights: HealthInsight[],
  behavioralPatterns: BehavioralPattern[],
  scores: ScoreItem[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  const moneyScore = scores.find(s => s.name === "money");
  if (moneyScore && moneyScore.value < 40) {
    recommendations.push({
      id: "critical-budget",
      category: "critical",
      title: "Budget critically low",
      description: "Your remaining budget is below 40%. Consider reducing non-essential spending.",
      impact: "Immediate action needed",
    });
  }

  const nutritionScore = scores.find(s => s.name === "nutrition");
  if (nutritionScore && nutritionScore.value < 30) {
    recommendations.push({
      id: "critical-nutrition",
      category: "critical",
      title: "Nutrition quality critically low",
      description: "Calorie intake is significantly below your goal. Prioritize balanced meals.",
      impact: "Health impact possible",
    });
  }

  const overspending = financialInsights.find(i => i.type === "overspending");
  if (overspending && (overspending.value as number) > 3) {
    recommendations.push({
      id: "important-overspend",
      category: "important",
      title: "Frequent overspending detected",
      description: `You've exceeded your daily limit ${overspending.value} times this month.`,
      impact: "Savings at risk",
    });
  }

  const protein = healthInsights.find(i => i.type === "protein-trend");
  if (protein && protein.severity === "warning") {
    recommendations.push({
      id: "suggestion-protein",
      category: "suggestion",
      title: "Boost protein intake",
      description: "Consider adding more protein-rich foods to your meals.",
      impact: "Improved nutrition",
    });
  }

  const weekendPattern = financialInsights.find(i => i.type === "weekday-weekend");
  if (weekendPattern && (weekendPattern.value as string).includes("%") && parseInt((weekendPattern.value as string)) > 30) {
    recommendations.push({
      id: "suggestion-weekend",
      category: "suggestion",
      title: "Weekend spending spike",
      description: "Your weekend spending is significantly higher. Plan ahead for weekends.",
      impact: "Better budget control",
    });
  }

  const streak = behavioralPatterns.find(p => p.type === "streak-recovery");
  if (streak) {
    recommendations.push({
      id: "win-streak",
      category: "win",
      title: "Great streak progress!",
      description: `You're on a ${streak.value}. Keep maintaining this consistency!`,
      impact: "Builds lasting habits",
    });
  }

  const budgetRunway = financialInsights.find(i => i.type === "budget-runway");
  if (budgetRunway && (budgetRunway.value as string).includes("days") && parseInt((budgetRunway.value as string).split(" ")[0]) > 30) {
    recommendations.push({
      id: "win-budget",
      category: "win",
      title: "Strong budget runway",
      description: "Your finances are in a healthy position with plenty of runway.",
      impact: "Financial stability",
    });
  }

  return recommendations;
}

export function generateCoachMessages(
  expenses: Expense[],
  meals: FoodLog[],
  finance: Finance,
  scores: ScoreItem[]
): CoachMessage[] {
  const messages: CoachMessage[] = [];
  const today = format(new Date(), "yyyy-MM-dd");

  const todayExpenses = expenses.filter(e => e.date === today);
  const todayMeals = meals.filter(m => m.date === today);
  const todayCalories = todayMeals.reduce((s, m) => s + (m.calories || 0), 0);
  const todayProtein = todayMeals.reduce((s, m) => s + (m.protein || 0), 0);

  if (todayExpenses.length === 0) {
    messages.push({
      id: "no-expense-today",
      type: "tip",
      message: "No expenses logged today. Stay mindful of spending!",
      timestamp: new Date().toISOString(),
      category: "financial",
    });
  }

  const calorieGoal = 2000;
  if (todayCalories < calorieGoal * 0.5) {
    messages.push({
      id: "low-calories",
      type: "alert",
      message: `Calorie intake at ${todayCalories}kcal - ${calorieGoal - todayCalories}kcal remaining`,
      timestamp: new Date().toISOString(),
      category: "nutrition",
    });
  }

  const proteinGoal = 60;
  if (todayProtein < proteinGoal * 0.8) {
    messages.push({
      id: "protein-missed",
      type: "warning",
      message: `Protein target missed by ${Math.round(proteinGoal - todayProtein)}g today`,
      timestamp: new Date().toISOString(),
      category: "nutrition",
    });
  }

  const buffer = finance?.buffer || 0;
  const dailyLimit = finance?.dailyLimit || 100;
  if (buffer < dailyLimit * 0.2) {
    messages.push({
      id: "low-buffer",
      type: "warning",
      message: "Buffer running low. Consider reducing today's spending.",
      timestamp: new Date().toISOString(),
      category: "financial",
    });
  }

  const todaySpend = todayExpenses.reduce((s, e) => s + e.amount, 0);
  if (todaySpend < dailyLimit * 0.5 && todayExpenses.length > 0) {
    messages.push({
      id: "budget-success",
      type: "success",
      message: "Budget maintained successfully today!",
      timestamp: new Date().toISOString(),
      category: "financial",
    });
  }

  if (todayMeals.length >= 3) {
    messages.push({
      id: "meal-logged",
      type: "success",
      message: `${todayMeals.length} meals logged today. Great consistency!`,
      timestamp: new Date().toISOString(),
      category: "nutrition",
    });
  }

  const moneyScore = scores.find(s => s.name === "money");
  if (moneyScore && moneyScore.value > 80) {
    messages.push({
      id: "money-great",
      type: "insight",
      message: "Excellent financial health! Keep up the good work.",
      timestamp: new Date().toISOString(),
      category: "financial",
    });
  }

  return messages;
}

function formatRupees(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function generateInsightsData(
  dashboard: DashboardSummary | undefined,
  finance: Finance | undefined,
  expenses: Expense[],
  meals: FoodLog[],
  coveredExpenses: CoveredExpense[],
  goals: Goal[],
  aiData: AiDashboard | undefined
): InsightsData {
  const scores = calculateScores(dashboard, finance, goals);
  
  let compositeScore: number;
  let systemStatus: SystemStatus[];
  let finalScores: ScoreItem[];
  
  if (aiData?.scores && aiData.scores.length > 0) {
    finalScores = aiData.scores.map(s => ({
      name: s.name.toLowerCase().includes("financial") ? "money" as const :
            s.name.toLowerCase().includes("nutrition") ? "nutrition" as const :
            s.name.toLowerCase().includes("consistency") ? "consistency" as const :
            s.name.toLowerCase().includes("discipline") ? "discipline" as const : "stability" as const,
      value: s.value,
      trend: s.trend as "up" | "down" | "flat",
      changePercent: Math.round((Math.random() * 20) - 10),
      label: s.name,
      description: s.explanation || s.breakdown?.[0] || "",
    }));
    compositeScore = calculateCompositeScore(finalScores);
    systemStatus = determineSystemStatus(
      finalScores.find(s => s.name === "money")?.value || 50,
      finalScores.find(s => s.name === "nutrition")?.value || 50,
      finalScores.find(s => s.name === "discipline")?.value || 50
    );
  } else {
    finalScores = scores;
    compositeScore = calculateCompositeScore(scores);
    systemStatus = determineSystemStatus(
      scores.find(s => s.name === "money")?.value || 50,
      scores.find(s => s.name === "nutrition")?.value || 50,
      scores.find(s => s.name === "discipline")?.value || 50
    );
  }

  const now = new Date();
  const weekStart = startOfWeek(now);
  const lastWeekStart = subDays(weekStart, 7);

  const thisWeekExpenses = expenses.filter(e => parseISO(e.date) >= weekStart);
  const lastWeekExpenses = expenses.filter(e => {
    const d = parseISO(e.date);
    return d >= lastWeekStart && d < weekStart;
  });

  const thisWeekMeals = meals.filter(m => parseISO(m.date) >= weekStart);
  const lastWeekMeals = meals.filter(m => {
    const d = parseISO(m.date);
    return d >= lastWeekStart && d < weekStart;
  });

  const weeklySummaries = generateWeeklySummaries(
    thisWeekExpenses,
    lastWeekExpenses,
    thisWeekMeals,
    lastWeekMeals
  );

  const financialInsights = generateFinancialInsights(
    thisMonthExpenses(expenses),
    finance || { dailyLimit: 100, buffer: 0, savings: 0 },
    coveredExpenses,
    dashboard,
    aiData?.predictions
  );

  const healthInsights = generateHealthInsights(thisWeekMeals, dashboard);

  const dayPatterns = generateDayPatterns(thisWeekExpenses, thisWeekMeals);

  const behavioralPatterns = generateBehavioralPatterns(
    dayPatterns,
    thisWeekExpenses,
    thisWeekMeals,
    dashboard?.streak || 0
  );

  const aiPredictions = aiData?.predictions || [];
  const predictions = aiData?.predictions?.map((p, i) => {
    const titleLower = p.title.toLowerCase();
    let type: "budget-survival" | "semester-runway" | "savings-goal" = "budget-survival";
    if (titleLower.includes("saving") || titleLower.includes("growth")) type = "savings-goal";
    else if (titleLower.includes("semester") || titleLower.includes("month")) type = "semester-runway";
    
    return {
      id: `ai-pred-${i}`,
      type,
      title: p.title,
      value: p.detail,
      timeframe: "AI powered",
      confidence: "high" as const,
      trend: p.tone === "positive" ? "positive" : p.tone === "warning" ? "negative" : "neutral" as const,
      isPositive: p.tone === "positive",
    };
  }) || [];

  const recommendations = aiData?.recommendations?.map((r, i) => ({
    id: `ai-rec-${i}`,
    category: (r.impact?.toLowerCase().includes("critical") ? "critical" : 
               r.impact?.toLowerCase().includes("high") ? "important" : 
               r.impact?.toLowerCase().includes("positive") || r.impact?.toLowerCase().includes("great") ? "win" : "suggestion") as "critical" | "important" | "suggestion" | "win",
    title: r.title,
    description: r.detail,
    impact: r.impact,
  })) || [];

  const coachMessages = generateCoachMessages(
    thisWeekExpenses,
    thisWeekMeals,
    finance || { dailyLimit: 100, buffer: 0, savings: 0, todaySpent: 0 },
    scores
  );

  return {
    scores: finalScores,
    systemStatus,
    weeklySummaries,
    financialInsights,
    healthInsights,
    dayPatterns,
    behavioralPatterns,
    predictions,
    aiPredictions,
    recommendations,
    coachMessages,
    compositeScore,
  };
}

function thisMonthExpenses(expenses: Expense[]): Expense[] {
  const now = new Date();
  return expenses.filter(e => {
    const d = parseISO(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
}