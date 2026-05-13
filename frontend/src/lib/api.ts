import { API_BASE_URL } from "./constants";
import type {
  CalendarEntry,
  ChatResponse,
  CreateExpenseRequest,
  Finance,
  StorageUsage,
  FinanceSettingsRequest,
  CreateFoodLogRequest,
  DashboardSummary,
  Expense,
  AiDashboard,
  FoodAnalysis,
  FoodLog,
  Goal,
  GoalType,
  Insight,
  Profile,
  ProfileUpsertRequest,
  UpdateCategoriesRequest,
  UpdateDailyFinanceRequest,
  UpdateGoalRequest,
  CoveredExpense,
  CreateCoveredExpenseRequest,
  UpdateCoveredExpenseRequest,
} from "./types";

type RequestOptions = RequestInit & {
  timeoutMs?: number;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { timeoutMs = 8000, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(fetchOptions.headers || {}),
    },
    ...fetchOptions,
    signal: controller.signal,
  }).catch((error) => {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("This request took too long. The backend may be waking up.");
    }

    throw new Error("Unable to reach the server right now.");
  }).finally(() => {
    window.clearTimeout(timeoutId);
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || "Request failed");
  }

  if (response.status === 204) {
    return null as any;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : (null as any);
}

export const api = {
  getProfile: (userId: string) => request<Profile>(`/api/profile?userId=${encodeURIComponent(userId)}`),
  saveProfile: (userId: string, payload: ProfileUpsertRequest) =>
    request<Profile>(`/api/profile?userId=${encodeURIComponent(userId)}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  saveCategories: (userId: string, payload: UpdateCategoriesRequest) =>
    request<Profile>(`/api/profile/categories?userId=${encodeURIComponent(userId)}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  getDashboard: (userId: string, month: string, today?: string) =>
    request<DashboardSummary>(`/api/dashboard/summary?userId=${encodeURIComponent(userId)}&month=${month}${today ? `&today=${today}` : ""}`),
  getFinance: (userId: string, today?: string) =>
    request<Finance>(`/api/finance?userId=${encodeURIComponent(userId)}${today ? `&today=${today}` : ""}`),
  saveFinance: (userId: string, payload: FinanceSettingsRequest) =>
    request<Finance>(`/api/finance?userId=${encodeURIComponent(userId)}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  updateDailyFinance: (payload: UpdateDailyFinanceRequest) =>
    request<Finance>("/api/finance/update-daily", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getExpenses: (userId: string, month: string) =>
    request<Expense[]>(`/api/expenses?userId=${encodeURIComponent(userId)}&month=${month}`),
  addExpense: (payload: CreateExpenseRequest) =>
    request<Expense>("/api/expenses", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  deleteExpense: (id: string | number) =>
    request<void>(`/api/expenses/${id}`, {
      method: "DELETE",
    }),
  analyzeFood: (payload: { imageUrl?: string; note?: string }) =>
    request<FoodAnalysis>("/api/food/analyze", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  saveFoodLog: (payload: CreateFoodLogRequest) =>
    request<FoodLog>("/api/food/logs", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getFoodLogs: (userId: string, month: string) =>
    request<FoodLog[]>(`/api/food/logs?userId=${encodeURIComponent(userId)}&month=${month}`),
  deleteFoodLog: (id: string | number) =>
    request<void>(`/api/food/logs/${id}`, {
      method: "DELETE",
    }),
  getGoals: (userId: string) => request<Goal[]>(`/api/goals?userId=${encodeURIComponent(userId)}`),
  addGoal: (payload: { userId: string; type: GoalType; targetAmount: number; currentAmount: number; deadline: string }) =>
    request<Goal>("/api/goals", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateGoal: (id: string, payload: UpdateGoalRequest) =>
    request<Goal>(`/api/goals/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  getInsight: (userId: string) => request<Insight>(`/api/ai/insight?userId=${encodeURIComponent(userId)}`),
  getAiDashboard: (userId: string) => request<AiDashboard>(`/api/ai/dashboard?userId=${encodeURIComponent(userId)}`),
  chat: (userId: string, message: string) =>
    request<ChatResponse>(`/api/ai/chat?userId=${encodeURIComponent(userId)}`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),
  getCalendar: (userId: string, month: string) =>
    request<CalendarEntry[]>(`/api/history/calendar?userId=${encodeURIComponent(userId)}&month=${month}`),
  getStorageUsage: () =>
    request<StorageUsage>(`/api/system/storage`),
  deleteExpensesByDate: (userId: string, date: string) =>
    request<void>(`/api/history/calendar/expenses?userId=${encodeURIComponent(userId)}&date=${date}`, {
      method: "DELETE",
    }),
  deleteMealsByDate: (userId: string, date: string) =>
    request<void>(`/api/history/calendar/meals?userId=${encodeURIComponent(userId)}&date=${date}`, {
      method: "DELETE",
    }),
  deleteExpensesByMonth: (userId: string, month: string) =>
    request<void>(`/api/history/calendar/expenses/month?userId=${encodeURIComponent(userId)}&month=${month}`, {
      method: "DELETE",
    }),
  deleteMealsByMonth: (userId: string, month: string) =>
    request<void>(`/api/history/calendar/meals/month?userId=${encodeURIComponent(userId)}&month=${month}`, {
      method: "DELETE",
    }),
  addMoney: (userId: string, amount: number) =>
    request<Profile>(`/api/profile/add-money?userId=${encodeURIComponent(userId)}`, {
      method: "POST",
      body: JSON.stringify({ amount }),
    }),
  getIncomes: (userId: string, start?: string, end?: string) =>
    request<IncomeResponse[]>(`/api/income?userId=${encodeURIComponent(userId)}${start ? `&start=${start}` : ""}${end ? `&end=${end}` : ""}`),
  addIncome: (payload: CreateIncomeRequest) =>
    request<IncomeResponse>("/api/income", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  deleteIncome: (id: string) =>
    request<void>(`/api/income/${id}`, {
      method: "DELETE",
    }),
  getCoveredExpenses: (userId: string) =>
    request<CoveredExpense[]>(`/api/covered-expenses?userId=${encodeURIComponent(userId)}`),
  addCoveredExpense: (payload: CreateCoveredExpenseRequest) =>
    request<CoveredExpense>("/api/covered-expenses", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateCoveredExpense: (id: string, payload: UpdateCoveredExpenseRequest) =>
    request<CoveredExpense>(`/api/covered-expenses/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteCoveredExpense: (id: string) =>
    request<void>(`/api/covered-expenses/${id}`, {
      method: "DELETE",
    }),
};
