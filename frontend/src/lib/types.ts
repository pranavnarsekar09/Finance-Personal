export type PaymentMethod = "UPI" | "CASH" | "CARD";

export type GoalType = "SAVINGS" | "CALORIE";

export interface UserCategory {
  name: string;
  budget: number;
}

export interface Profile {
  userId: string;
  name: string;
  email: string;
  monthlyBudget: number;
  calorieGoal: number;
  categories: UserCategory[];
  createdAt: string;
  onboardingComplete: boolean;
}

export interface ProfileUpsertRequest {
  name: string;
  email: string;
  monthlyBudget: number;
  calorieGoal: number;
  categories: UserCategory[];
}

export interface UpdateCategoriesRequest {
  categories: UserCategory[];
}

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  categoryName: string;
  paymentMethod: PaymentMethod;
  date: string;
  note: string | null;
  isRecurring: boolean;
  createdAt: string;
}

export interface CreateExpenseRequest {
  userId: string;
  amount: number;
  categoryName: string;
  paymentMethod: PaymentMethod;
  date: string;
  note?: string;
  isRecurring: boolean;
}

export interface FoodAnalysis {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  estimatedCost: number;
}

export interface FoodLog {
  id: string;
  userId: string;
  imageUrl: string | null;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  estimatedCost: number;
  date: string;
  note: string | null;
  linkedExpenseId: string | null;
  createdAt: string;
}

export interface CreateFoodLogRequest {
  userId: string;
  imageUrl?: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  estimatedCost: number;
  date: string;
  note?: string;
  expenseCategoryName?: string;
  linkedExpenseId?: string;
}

export interface Goal {
  id: string;
  userId: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  createdAt: string;
  progress: number;
}

export interface CreateGoalRequest {
  userId: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

export interface Insight {
  userId: string;
  headline: string;
  summary: string;
  runwayDays: number;
  averageDailySpend: number;
  topCategory: string;
}

export interface ChatResponse {
  response: string;
}

export interface DailySpendSummary {
  date: string;
  amount: number;
}

export interface CategorySpendSummary {
  categoryName: string;
  budget: number;
  spent: number;
  progress: number;
}

export interface DashboardSummary {
  userId: string;
  monthlyBudget: number;
  totalSpent: number;
  remainingBudget: number;
  calorieGoal: number;
  caloriesToday: number;
  categorySpending: CategorySpendSummary[];
  recentTransactions: Expense[];
  monthlyFoodCost: number;
  dailySpending: DailySpendSummary[];
  streak: number;
  spentToday: number;
}

export interface CalendarEntry {
  date: string;
  hasExpenses: boolean;
  hasMeals: boolean;
  expenses: Expense[];
  meals: FoodLog[];
}
