import { API_BASE_URL } from "./constants";

async function request(path, options = {}) {
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
    return null;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export const api = {
  getProfile: (userId) => request(`/api/profile?userId=${encodeURIComponent(userId)}`),
  saveProfile: (userId, payload) =>
    request(`/api/profile?userId=${encodeURIComponent(userId)}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  saveCategories: (userId, payload) =>
    request(`/api/profile/categories?userId=${encodeURIComponent(userId)}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  getDashboard: (userId, month) =>
    request(`/api/dashboard/summary?userId=${encodeURIComponent(userId)}&month=${month}`),
  getExpenses: (userId, month) =>
    request(`/api/expenses?userId=${encodeURIComponent(userId)}&month=${month}`),
  addExpense: (payload) =>
    request("/api/expenses", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  deleteExpense: (id) =>
    request(`/api/expenses/${id}`, {
      method: "DELETE",
    }),
  analyzeFood: (payload) =>
    request("/api/food/analyze", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  saveFoodLog: (payload) =>
    request("/api/food/logs", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getFoodLogs: (userId, month) =>
    request(`/api/food/logs?userId=${encodeURIComponent(userId)}&month=${month}`),
  deleteFoodLog: (id) =>
    request(`/api/food/logs/${id}`, {
      method: "DELETE",
    }),
  getGoals: (userId) => request(`/api/goals?userId=${encodeURIComponent(userId)}`),
  addGoal: (payload) =>
    request("/api/goals", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getInsight: (userId) => request(`/api/ai/insight?userId=${encodeURIComponent(userId)}`),
  chat: (userId, message) =>
    request(`/api/ai/chat?userId=${encodeURIComponent(userId)}`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),
  getCalendar: (userId, month) =>
    request(`/api/history/calendar?userId=${encodeURIComponent(userId)}&month=${month}`),
  deleteExpensesByDate: (userId, date) =>
    request(`/api/history/calendar/expenses?userId=${encodeURIComponent(userId)}&date=${date}`, {
      method: "DELETE",
    }),
  deleteMealsByDate: (userId, date) =>
    request(`/api/history/calendar/meals?userId=${encodeURIComponent(userId)}&date=${date}`, {
      method: "DELETE",
    }),
};
