import { useQuery, useMutation, useQueryClient, useQueries } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DEFAULT_USER_ID } from "@/lib/constants";
import type {
  CreateGoalRequest,
  CreateExpenseRequest,
  CreateFoodLogRequest,
  ProfileUpsertRequest,
  UpdateCategoriesRequest,
} from "@/lib/types";
import { format, subMonths } from "date-fns";

export function useProfile(userId: string = DEFAULT_USER_ID) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: () => api.getProfile(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useDashboard(userId: string = DEFAULT_USER_ID, month: string, today?: string) {
  return useQuery({
    queryKey: ["dashboard", userId, month, today],
    queryFn: () => api.getDashboard(userId, month, today),
    staleTime: 1 * 60 * 1000, // 1 minute
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

export function useGoals(userId: string = DEFAULT_USER_ID) {
  return useQuery({
    queryKey: ["goals", userId],
    queryFn: () => api.getGoals(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useExpenseTrend(userId: string = DEFAULT_USER_ID) {
  const months = Array.from({ length: 12 }, (_, index) => format(subMonths(new Date(), 11 - index), "yyyy-MM"));
  const queries = useQueries({
    queries: months.map((month) => ({
      queryKey: ["expenses", "trend", userId, month],
      queryFn: () => api.getExpenses(userId, month),
      staleTime: 5 * 60 * 1000,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["expenses"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["calendar"], exact: false });
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
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
    },
  });
}
export function useAnalyzeFood() {
  return useMutation({
    mutationFn: (payload: { imageUrl?: string; note?: string }) => api.analyzeFood(payload),
  });
}
