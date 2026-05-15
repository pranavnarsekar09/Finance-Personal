export type ScoreCategory = "money" | "nutrition" | "discipline" | "stability" | "consistency";

export interface ScoreItem {
  name: ScoreCategory;
  value: number;
  trend: "up" | "down" | "flat";
  changePercent: number;
  label: string;
  description: string;
}

export interface SystemStatus {
  type: "financial" | "nutrition" | "habits";
  label: string;
  status: "stable" | "improving" | "needs-attention" | "critical";
}

export interface WeeklySummary {
  id: string;
  message: string;
  type: "positive" | "neutral" | "warning";
  icon: "trending-down" | "trending-up" | "target" | "flame" | "percent";
}

export interface FinancialInsight {
  id: string;
  type: "spending-personality" | "burn-rate" | "budget-runway" | "category-drift" | "weekday-weekend" | "expense-heatmap" | "savings-forecast" | "liquidity" | "overspending" | "coverage";
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "flat";
  change?: number;
  severity?: "success" | "warning" | "critical" | "neutral";
}

export interface HealthInsight {
  id: string;
  type: "consistency" | "protein-trend" | "meal-quality" | "macro-balance" | "calorie-adherence" | "food-cost-correlation" | "nutrition-risk" | "logging-consistency";
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "flat";
  change?: number;
  severity?: "success" | "warning" | "critical" | "neutral";
}

export interface DayPattern {
  day: string;
  dayIndex: number;
  spendingAmount: number;
  mealCount: number;
  avgCalories: number;
  disciplineScore: number;
  isBestDay: boolean;
  isWorstDay: boolean;
}

export interface BehavioralPattern {
  id: string;
  type: "best-day" | "worst-day" | "spending-consistency" | "recovery-behavior" | "habit-stability" | "streak-recovery" | "logging-consistency" | "pattern-detection";
  title: string;
  value: string;
  description: string;
  day?: string;
}

export interface Prediction {
  id: string;
  type: "budget-survival" | "semester-runway" | "savings-goal" | "nutrition-projection" | "overspending-risk" | "behavior-forecast" | "trend-forecast";
  title: string;
  value: string;
  timeframe: string;
  confidence: "high" | "medium" | "low";
  trend?: "positive" | "negative" | "neutral";
  isPositive: boolean;
}

export interface Recommendation {
  id: string;
  category: "critical" | "important" | "suggestion" | "win";
  title: string;
  description: string;
  impact?: string;
}

export interface CoachMessage {
  id: string;
  type: "alert" | "success" | "insight" | "tip" | "warning";
  message: string;
  timestamp: string;
  category: "financial" | "nutrition" | "habits";
}

export interface InsightsData {
  scores: ScoreItem[];
  systemStatus: SystemStatus[];
  weeklySummaries: WeeklySummary[];
  financialInsights: FinancialInsight[];
  healthInsights: HealthInsight[];
  dayPatterns: DayPattern[];
  behavioralPatterns: BehavioralPattern[];
  predictions: Prediction[];
  recommendations: Recommendation[];
  coachMessages: CoachMessage[];
  compositeScore: number;
}