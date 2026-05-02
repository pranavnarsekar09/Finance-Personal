import { API_BASE_URL } from "./constants";
import type {
  CalendarEntry,
  ChatResponse,
  CreateExpenseRequest,
  CreateFoodLogRequest,
  DashboardSummary,
  Expense,
  FoodAnalysis,
  FoodLog,
  Goal,
  GoalType,
  Insight,
  Profile,
  ProfileUpsertRequest,
  UpdateCategoriesRequest,
} from "./types";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
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
  getInsight: (userId: string) => request<Insight>(`/api/ai/insight?userId=${encodeURIComponent(userId)}`),
  chat: (userId: string, message: string) =>
    request<ChatResponse>(`/api/ai/chat?userId=${encodeURIComponent(userId)}`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),
  getCalendar: (userId: string, month: string) =>
    request<CalendarEntry[]>(`/api/history/calendar?userId=${encodeURIComponent(userId)}&month=${month}`),
  deleteExpensesByDate: (userId: string, date: string) =>
    request<void>(`/api/history/calendar/expenses?userId=${encodeURIComponent(userId)}&date=${date}`, {
      method: "DELETE",
    }),
  deleteMealsByDate: (userId: string, date: string) =>
    request<void>(`/api/history/calendar/meals?userId=${encodeURIComponent(userId)}&date=${date}`, {
      method: "DELETE",
    }),
};
