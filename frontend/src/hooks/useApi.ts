import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient, useQueries } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getCoveredExpenses, addCoveredExpense, updateCoveredExpense, deleteCoveredExpense } from "@/lib/utils";
import { DEFAULT_USER_ID } from "@/lib/constants";
import type {
  CreateGoalRequest,
  CreateExpenseRequest,
  CreateFoodLogRequest,
  FinanceSettingsRequest,
  ProfileUpsertRequest,
  UpdateCategoriesRequest,
  UpdateDailyFinanceRequest,
  UpdateGoalRequest,
  CreateIncomeRequest,
  CoveredExpense,
  CreateCoveredExpenseRequest,
  UpdateCoveredExpenseRequest,
} from "@/lib/types";
import { format, subMonths } from "date-fns";

const CRITICAL_QUERY_OPTIONS = {
  retry: 0,
  refetchOnWindowFocus: false as const,
};

const AI_DASHBOARD_STORAGE_PREFIX = "fintrack:ai-dashboard:";
const AI_INSIGHT_STORAGE_PREFIX = "fintrack:ai-insight:";

function getAiDashboardStorageKey(userId: string) {
  return `${AI_DASHBOARD_STORAGE_PREFIX}${userId}`;
}

function getAiInsightStorageKey(userId: string) {
  return `${AI_INSIGHT_STORAGE_PREFIX}${userId}`;
}

function readAiDashboardCache(userId: string) {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(getAiDashboardStorageKey(userId));
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

function writeAiDashboardCache(userId: string, data: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(getAiDashboardStorageKey(userId), JSON.stringify(data));
  } catch {
    // Ignore storage failures and keep in-memory query behavior.
  }
}

function clearAiDashboardCache(userId: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(getAiDashboardStorageKey(userId));
  } catch {
    // Ignore storage failures and keep in-memory query behavior.
  }
}

function readAiInsightCache(userId: string) {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(getAiInsightStorageKey(userId));
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

function writeAiInsightCache(userId: string, data: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(getAiInsightStorageKey(userId), JSON.stringify(data));
  } catch {
    // Ignore storage failures and keep in-memory query behavior.
  }
}

function clearAiInsightCache(userId: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(getAiInsightStorageKey(userId));
  } catch {
    // Ignore storage failures and keep in-memory query behavior.
  }
}

function invalidateAiDashboard(queryClient: ReturnType<typeof useQueryClient>, userId: string = DEFAULT_USER_ID) {
  clearAiDashboardCache(userId);
  queryClient.invalidateQueries({ queryKey: ["aiDashboard", userId] });
}

function invalidateAiInsight(queryClient: ReturnType<typeof useQueryClient>, userId: string = DEFAULT_USER_ID) {
  clearAiInsightCache(userId);
  queryClient.invalidateQueries({ queryKey: ["insight", userId] });
}

function invalidateAiCaches(queryClient: ReturnType<typeof useQueryClient>, userId: string = DEFAULT_USER_ID) {
  invalidateAiDashboard(queryClient, userId);
  invalidateAiInsight(queryClient, userId);
}

export function useProfile(userId: string = DEFAULT_USER_ID, enabled: boolean = true) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: () => api.getProfile(userId),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...CRITICAL_QUERY_OPTIONS,
  });
}

export function useStorageUsage(enabled: boolean = true) {
  return useQuery({
    queryKey: ["storageUsage"],
    queryFn: () => api.getStorageUsage(),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useDashboard(userId: string = DEFAULT_USER_ID, month: string, today?: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["dashboard", userId, month, today],
    queryFn: () => api.getDashboard(userId, month, today),
    enabled,
    staleTime: 1 * 60 * 1000, // 1 minute
    ...CRITICAL_QUERY_OPTIONS,
  });
}

export function useFinance(userId: string = DEFAULT_USER_ID, today?: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["finance", userId, today],
    queryFn: () => api.getFinance(userId, today),
    enabled,
    staleTime: 1 * 60 * 1000,
    ...CRITICAL_QUERY_OPTIONS,
  });
}

export function useExpenses(userId: string = DEFAULT_USER_ID, month: string) {
  return useQuery({
    queryKey: ["expenses", userId, month],
    queryFn: () => api.getExpenses(userId, month),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useFoodLogs(userId: string = DEFAULT_USER_ID, month: string) {
  return useQuery({
    queryKey: ["foodLogs", userId, month],
    queryFn: () => api.getFoodLogs(userId, month),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useGoals(userId: string = DEFAULT_USER_ID, enabled: boolean = true) {
  return useQuery({
    queryKey: ["goals", userId],
    queryFn: () => api.getGoals(userId),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...CRITICAL_QUERY_OPTIONS,
  });
}

export function useExpenseTrend(userId: string = DEFAULT_USER_ID, enabled: boolean = true) {
  const months = Array.from({ length: 12 }, (_, index) => format(subMonths(new Date(), 11 - index), "yyyy-MM"));
  const queries = useQueries({
    queries: months.map((month) => ({
      queryKey: ["expenses", "trend", userId, month],
      queryFn: () => api.getExpenses(userId, month),
      enabled,
      staleTime: 5 * 60 * 1000,
      retry: 0,
      refetchOnWindowFocus: false,
    })),
  });

  return {
    data: months.map((month, index) => ({
      month,
      expenses: queries[index].data || [],
    })),
    isLoading: queries.some((query) => query.isLoading),
    isError: queries.some((query) => query.isError),
  };
}

export function useInsight(userId: string = DEFAULT_USER_ID) {
  const query = useQuery({
    queryKey: ["insight", userId],
    queryFn: () => api.getInsight(userId),
    initialData: () => readAiInsightCache(userId),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (query.data) {
      writeAiInsightCache(userId, query.data);
    }
  }, [query.data, userId]);

  return query;
}

export function useAiDashboard(userId: string = DEFAULT_USER_ID, enabled: boolean = true) {
  const query = useQuery({
    queryKey: ["aiDashboard", userId],
    queryFn: () => api.getAiDashboard(userId),
    enabled,
    initialData: () => readAiDashboardCache(userId),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (query.data) {
      writeAiDashboardCache(userId, query.data);
    }
  }, [query.data, userId]);

  return query;
}

export function useCalendar(userId: string = DEFAULT_USER_ID, month: string) {
  return useQuery({
    queryKey: ["calendar", userId, month],
    queryFn: () => api.getCalendar(userId, month),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useAddExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateExpenseRequest) => api.addExpense(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["profile"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["dashboard"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["expenses"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["calendar"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["finance", variables.userId], exact: false });
      invalidateAiCaches(queryClient, variables.userId);
    },
  });
}

export function useSaveFoodLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateFoodLogRequest) => api.saveFoodLog(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["foodLogs"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      queryClient.invalidateQueries({ queryKey: ["finance"] });
      invalidateAiCaches(queryClient);
    },
  });
}

export function useSaveProfile(userId: string = DEFAULT_USER_ID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProfileUpsertRequest) => api.saveProfile(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", userId] });
      invalidateAiCaches(queryClient, userId);
    },
  });
}

export function useSaveFinance(userId: string = DEFAULT_USER_ID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FinanceSettingsRequest) => api.saveFinance(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance", userId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", userId] });
      invalidateAiCaches(queryClient, userId);
    },
  });
}

export function useUpdateDailyFinance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateDailyFinanceRequest) => api.updateDailyFinance(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["finance", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", variables.userId] });
      invalidateAiCaches(queryClient, variables.userId);
    },
  });
}

export function useAddGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateGoalRequest) => api.addGoal(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      invalidateAiCaches(queryClient);
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateGoalRequest }) => api.updateGoal(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      invalidateAiCaches(queryClient);
    },
  });
}

export function useSaveCategories(userId: string = DEFAULT_USER_ID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateCategoriesRequest) => api.saveCategories(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", userId] });
      queryClient.invalidateQueries({ queryKey: ["expenses", userId] });
      invalidateAiCaches(queryClient, userId);
    },
  });
}

export function useChat(userId: string = DEFAULT_USER_ID) {
  return useMutation({
    mutationFn: (message: string) => api.chat(userId, message),
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => api.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["foodLogs"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      queryClient.invalidateQueries({ queryKey: ["finance"] });
      invalidateAiCaches(queryClient);
    },
  });
}

export function useDeleteFoodLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => api.deleteFoodLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["foodLogs"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      invalidateAiCaches(queryClient);
    },
  });
}

export function useDeleteExpensesByMonth(userId: string = DEFAULT_USER_ID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (month: string) => api.deleteExpensesByMonth(userId, month),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      queryClient.invalidateQueries({ queryKey: ["finance"] });
      invalidateAiCaches(queryClient, userId);
    },
  });
}

export function useDeleteMealsByMonth(userId: string = DEFAULT_USER_ID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (month: string) => api.deleteMealsByMonth(userId, month),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["foodLogs"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      invalidateAiCaches(queryClient, userId);
    },
  });
}
export function useAddMoney(userId: string = DEFAULT_USER_ID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (amount: number) => api.addMoney(userId, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["finance"] });
      invalidateAiCaches(queryClient, userId);
    },
  });
}

export function useIncomes(userId: string = DEFAULT_USER_ID, start?: string, end?: string) {
  return useQuery({
    queryKey: ["incomes", userId, start, end],
    queryFn: () => api.getIncomes(userId, start, end),
    staleTime: 1 * 60 * 1000,
  });
}

export function useAddIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateIncomeRequest) => api.addIncome(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["finance"] });
      queryClient.invalidateQueries({ queryKey: ["incomes", variables.userId] });
      invalidateAiCaches(queryClient, variables.userId);
    },
  });
}

export function useDeleteIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteIncome(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["finance"] });
      queryClient.invalidateQueries({ queryKey: ["incomes"] });
      invalidateAiCaches(queryClient);
    },
  });
}

export function useAnalyzeFood() {
  return useMutation({
    mutationFn: (payload: { imageUrl?: string; note?: string }) => api.analyzeFood(payload),
  });
}

export function useMultipleExpenses(userId: string = DEFAULT_USER_ID, months: string[], enabled: boolean = true) {
  return useQueries({
    queries: months.map((month) => ({
      queryKey: ["expenses", userId, month],
      queryFn: () => api.getExpenses(userId, month),
      enabled,
      staleTime: 5 * 60 * 1000,
    })),
  });
}

export function useMultipleFoodLogs(userId: string = DEFAULT_USER_ID, months: string[], enabled: boolean = true) {
  return useQueries({
    queries: months.map((month) => ({
      queryKey: ["foodLogs", userId, month],
      queryFn: () => api.getFoodLogs(userId, month),
      enabled,
      staleTime: 5 * 60 * 1000,
    })),
  });
}

export function useCoveredExpenses() {
  return useQuery({
    queryKey: ["coveredExpenses"],
    queryFn: () => Promise.resolve(getCoveredExpenses()),
    staleTime: 0,
  });
}

export function useAddCoveredExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCoveredExpenseRequest) => {
      const result = addCoveredExpense(payload);
      return Promise.resolve(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coveredExpenses"] });
    },
    onError: (error) => {
      console.error("useAddCoveredExpense error:", error);
    },
  });
}

export function useUpdateCoveredExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCoveredExpenseRequest }) => {
      const result = updateCoveredExpense(id, payload);
      return Promise.resolve(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coveredExpenses"] });
    },
  });
}

export function useDeleteCoveredExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const result = deleteCoveredExpense(id);
      return Promise.resolve(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coveredExpenses"] });
    },
  });
}
