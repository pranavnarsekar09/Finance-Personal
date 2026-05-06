import { useQuery, useMutation, useQueryClient, useQueries } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DEFAULT_USER_ID } from "@/lib/constants";
import type {
  CreateGoalRequest,
  CreateExpenseRequest,
  CreateFoodLogRequest,
  FinanceSettingsRequest,
  ProfileUpsertRequest,
  UpdateDailyFinanceRequest,
  UpdateCategoriesRequest,
} from "@/lib/types";
import { format, subMonths } from "date-fns";

const CRITICAL_QUERY_OPTIONS = {
  retry: 0,
  refetchOnWindowFocus: false as const,
};

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

export function useFinance(userId: string = DEFAULT_USER_ID, enabled: boolean = true) {
  return useQuery({
    queryKey: ["finance", userId],
    queryFn: () => api.getFinance(userId),
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
  return useQuery({
    queryKey: ["insight", userId],
    queryFn: () => api.getInsight(userId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 0,
    refetchOnWindowFocus: false,
  });
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
      queryClient.invalidateQueries({ queryKey: ["dashboard"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["expenses"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["calendar"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["finance", variables.userId], exact: false });
    },
  });
}

export function useSaveFoodLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateFoodLogRequest) => api.saveFoodLog(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["foodLogs"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
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
    },
  });
}
export function useAnalyzeFood() {
  return useMutation({
    mutationFn: (payload: { imageUrl?: string; note?: string }) => api.analyzeFood(payload),
  });
}
